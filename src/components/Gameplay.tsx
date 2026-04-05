"use client";

import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useGameState } from "../hooks/gameHooks";
import GameResults from "./GameResults";

interface GameplayProps {
  gameItems: string[];
  timeLimit: number;
  onFinish: (score: { correct: number; skipped: number }) => void;
  onCancel: () => void;
}

type LockableOrientation = ScreenOrientation & {
  lock?: (type: string) => Promise<void>;
  unlock?: () => void;
};

export default function Gameplay({
  gameItems,
  timeLimit,
  onFinish,
  onCancel,
}: GameplayProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCorrect, setIsCorrect] = useState(false);
  const [needsFullscreenResume, setNeedsFullscreenResume] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const timerBarRef = useRef<HTMLDivElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const skipSoundRef = useRef<HTMLAudioElement | null>(null);
  const navigationPromptActiveRef = useRef(false);
  const suppressNavigationHandlingRef = useRef(false);

  const gameSettings = { selectedPacks: [], timeLimit };
  const {
    gameState,
    timeLeft,
    currentItem,
    score,
    actionInProgress,
    startGame,
    beginPlay,
    markCorrect,
    markSkipped,
    resetGame,
  } = useGameState(gameSettings);

  // ── Fullscreen + landscape helpers ──────────────────────────────────────
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const orientation = screen.orientation as LockableOrientation;
      if (orientation?.lock) {
        await orientation.lock("landscape").catch(() => {
          // Not supported on iOS Safari — safe to ignore
        });
      }
    } catch {
      // Fullscreen API not available — continue without it
      return false;
    }
    return !!document.fullscreenElement;
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    try {
      (screen.orientation as LockableOrientation).unlock?.();
    } catch {
      // ignore
    }
  }, []);

  // ── Setup: triggered by user tap (required for fullscreen API) ──────────
  const handleSetup = useCallback(async () => {
    const full = await enterFullscreen();
    setNeedsFullscreenResume(!full);
    window.history.pushState({ toesDownGame: true }, "", window.location.href);
    setGameStarted(true);
    startGame(gameItems);
  }, [enterFullscreen, startGame, gameItems]);

  // ── Countdown ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== "ready") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          beginPlay();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, beginPlay]);

  // ── Correct with flip animation ──────────────────────────────────────────
  const handleMarkCorrect = useCallback(() => {
    if (gameState !== "playing" || actionInProgress) return;
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(() => {});
    }
    setIsCorrect(true);
    setTimeout(() => {
      markCorrect();
      setIsCorrect(false);
    }, 500);
  }, [gameState, actionInProgress, markCorrect]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (gameState !== "playing") return;
      const firstTouch = e.changedTouches[0];
      if (!firstTouch) return;
      touchStart.current = { x: firstTouch.clientX, y: firstTouch.clientY };
    },
    [gameState]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (gameState !== "playing" || actionInProgress || !touchStart.current) {
        touchStart.current = null;
        return;
      }

      const endTouch = e.changedTouches[0];
      if (!endTouch) {
        touchStart.current = null;
        return;
      }

      const dx = endTouch.clientX - touchStart.current.x;
      const dy = endTouch.clientY - touchStart.current.y;
      touchStart.current = null;

      const SWIPE_THRESHOLD = 40;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

      if (Math.abs(dy) >= Math.abs(dx)) {
        handleMarkCorrect(); // up or down swipe = correct
      } else {
        if (skipSoundRef.current) {
          skipSoundRef.current.currentTime = 0;
          skipSoundRef.current.play().catch(() => {});
        }
        markSkipped(); // left or right swipe = skip
      }
    },
    [gameState, actionInProgress, handleMarkCorrect, markSkipped]
  );

  useEffect(() => {
    correctSoundRef.current = new Audio("/resources/correct_sound.mov");
    skipSoundRef.current = new Audio("/resources/skip_sound.mp3");

    correctSoundRef.current.preload = "auto";
    skipSoundRef.current.preload = "auto";

    return () => {
      correctSoundRef.current = null;
      skipSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!timerBarRef.current) return;
    const pct = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));
    timerBarRef.current.style.width = `${pct}%`;
  }, [timeLeft, timeLimit]);

  // ── Game finished ────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === "finished") {
      exitFullscreen();
      onFinish({ correct: score.correct, skipped: score.skipped });
    }
  }, [gameState, score, onFinish, exitFullscreen]);

  const finalizeGame = useCallback(() => {
    suppressNavigationHandlingRef.current = true;
    exitFullscreen();
    resetGame();
    onFinish({ correct: score.correct, skipped: score.skipped });
    setTimeout(() => {
      suppressNavigationHandlingRef.current = false;
    }, 0);
  }, [exitFullscreen, resetGame, onFinish, score.correct, score.skipped]);

  const promptToEndGame = useCallback(async () => {
    if (navigationPromptActiveRef.current) return;
    if (!gameStarted || gameState === "finished") return;

    navigationPromptActiveRef.current = true;
    const confirmed = window.confirm(
      "End this game now? Your current score will be finalized."
    );

    if (confirmed) {
      finalizeGame();
    } else {
      window.history.pushState({ toesDownGame: true }, "", window.location.href);
      if (!document.fullscreenElement) {
        const full = await enterFullscreen();
        setNeedsFullscreenResume(!full);
      } else {
        setNeedsFullscreenResume(false);
      }
    }

    navigationPromptActiveRef.current = false;
  }, [gameStarted, gameState, finalizeGame, enterFullscreen]);
  const handleEndGame = useCallback(() => {
    const confirmed = window.confirm(
      "End this game now? Your current score will be finalized."
    );
    if (!confirmed) return;

    finalizeGame();
  }, [finalizeGame]);

  useEffect(() => {
    const handlePopState = () => {
      if (suppressNavigationHandlingRef.current) return;
      void promptToEndGame();
    };

    const handleFullscreenChange = () => {
      if (suppressNavigationHandlingRef.current) return;
      if (document.fullscreenElement) return;
      void promptToEndGame();
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [
    gameStarted,
    gameState,
    promptToEndGame,
  ]);

  const handleCancel = useCallback(() => {
    exitFullscreen();
    onCancel();
  }, [exitFullscreen, onCancel]);

  const handleResumeFullscreen = useCallback(async () => {
    const full = await enterFullscreen();
    setNeedsFullscreenResume(!full);
  }, [enterFullscreen]);

  // ── Results ──────────────────────────────────────────────────────────────
  if (gameState === "finished") {
    return (
      <div>
        <GameResults
          score={score}
          onPlayAgain={() => {
            resetGame();
            setGameStarted(false);
          }}
        />
        <div className="container mt-4">
          <button type="button" onClick={handleCancel} className="button w-full">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // ── Setup screen (shown before game starts) ──────────────────────────────
  if (!gameStarted) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[70vh]">
        <div className="card text-center p-6 md:p-8 max-w-sm w-full">
          <h2 className="title-logo title-logo-sm title-logo-with-toe mb-3" aria-label="Toes Down!">
            T
            <span className="sr-only">o</span>
            <span aria-hidden="true" className="title-o-toe">
              <Image
                src="/resources/o_toe.png"
                alt=""
                width={96}
                height={96}
                className="title-o-toe-img"
                priority
              />
            </span>
            es Down!
          </h2>
          <p className="text-sm font-semibold opacity-50 uppercase tracking-widest mb-3">How to play</p>
          <p className="mb-6 opacity-60 text-sm leading-relaxed">
            Go fullscreen and swipe to score. Vertical swipe (up or down)
            counts as correct. Horizontal swipe (left or right) skips.
          </p>
          <div className="flex justify-around mb-8 gap-2">
            <div className="text-center">
              <div className="text-4xl mb-1">↕</div>
              <div className="text-sm opacity-60">Swipe up/down</div>
              <div className="text-xs opacity-40 mt-0.5">Correct</div>
            </div>
            <div className="text-center opacity-40 self-center text-2xl">·</div>
            <div className="text-center">
              <div className="text-4xl mb-1">↔</div>
              <div className="text-sm opacity-60">Swipe left/right</div>
              <div className="text-xs opacity-40 mt-0.5">Skip</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSetup}
            className="button button-primary w-full py-3 md:py-4 text-base font-bold"
          >
            Go fullscreen &amp; start
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="button w-full mt-2 text-sm"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Countdown ────────────────────────────────────────────────────────────
  if (gameState === "ready") {
    return (
      <div className="game-fullscreen flex items-center justify-center px-3 py-6 md:px-4 md:py-8">
        <div className="start-poster start-poster--ready card text-center max-w-lg w-full">
          <div className="start-poster-pin start-poster-pin-left" aria-hidden="true" />
          <div className="start-poster-pin start-poster-pin-right" aria-hidden="true" />

          <div className="start-poster-kicker">Round incoming</div>
          <h2 className="title-logo title-logo-sm start-poster-title mb-2">Get ready!</h2>
          <p className="start-poster-subtitle mb-6">
            Swipe up/down for correct, left/right to skip.
          </p>

          <div className="start-poster-cards mb-6">
            <div className="start-poster-card start-poster-card--left">
              <div className="start-poster-card-icon">↕</div>
              <div className="start-poster-card-label">Correct</div>
            </div>
            <div className="start-poster-card start-poster-card--right">
              <div className="start-poster-card-icon">↔</div>
              <div className="start-poster-card-label">Skip</div>
            </div>
          </div>

          <div className="countdown-number text-8xl md:text-9xl font-bold leading-none my-2">
            {countdown}
          </div>
          <p className="text-sm opacity-60 uppercase tracking-widest">
            Hold steady
          </p>
        </div>
      </div>
    );
  }

  // ── Playing ──────────────────────────────────────────────────────────────
  if (gameState === "playing") {
    const timerPct = (timeLeft / timeLimit) * 100;
    const timerClass =
      timerPct < 25
        ? "timer-danger"
        : timerPct < 50
        ? "timer-warning"
        : "";

    return (
      <div
        className="game-fullscreen flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {needsFullscreenResume && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
            <button
              type="button"
              onClick={handleResumeFullscreen}
              className="button button-primary"
            >
              Tap to resume fullscreen
            </button>
          </div>
        )}

        {/* Timer bar */}
        <div className="game-timer-track">
          <div
            ref={timerBarRef}
            className={`timer-bar h-full ${timerClass}`}
          />
        </div>

        {/* Main area: skip | word | correct */}
        <div className="flex-1 flex items-center px-3 md:px-6 gap-2 md:gap-4">
          {/* Skip side */}
          <div className="game-side-indicator">
            <div className="text-3xl">↔</div>
            <div className="text-xs opacity-50 mt-1">Swipe L/R</div>
            <div className="skipped text-2xl font-bold mt-2">
              {score.skipped}
            </div>
          </div>

          {/* Word card */}
          <div
            className={`game-word-card flex-1 flex items-center justify-center rounded-2xl${
              isCorrect ? " game-word-card--correct" : ""
            }${actionInProgress ? " opacity-60" : ""}`}
          >
            <span className="game-word-text">
              {isCorrect ? "CORRECT!" : currentItem}
            </span>
          </div>

          {/* Correct side */}
          <div className="game-side-indicator">
            <div className="text-3xl">↕</div>
            <div className="text-xs opacity-50 mt-1">Swipe U/D</div>
            <div className="score-correct text-2xl font-bold mt-2">
              {score.correct}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 md:px-8 py-3 gap-2">
          <div className="text-xl font-bold opacity-70">{timeLeft}s</div>
          <button
            type="button"
            onClick={handleEndGame}
            className="button text-sm"
          >
            End Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="text-center opacity-60">Loading game...</div>
    </div>
  );
}
