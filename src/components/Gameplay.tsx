"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  useGameState,
  useDeviceOrientation,
  useKeyboardControls,
} from "../hooks/gameHooks";
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
  // Prevent re-acting on the same direction value when other deps re-trigger the effect
  const lastActedDirection = useRef<string>("neutral");

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

  const {
    direction: gyroDirection,
    isSupported: isGyroSupported,
    requestPermission,
    calibrate,
  } = useDeviceOrientation();

  const keyDirection = useKeyboardControls();

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
    }
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
    // iOS 13+ needs explicit permission for DeviceOrientationEvent
    if (
      isGyroSupported &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as { requestPermission?: unknown })
        .requestPermission === "function"
    ) {
      await requestPermission();
    }
    await enterFullscreen();
    calibrate(); // zero out baseline from current phone position
    setGameStarted(true);
    startGame(gameItems);
  }, [
    isGyroSupported,
    requestPermission,
    enterFullscreen,
    calibrate,
    startGame,
    gameItems,
  ]);

  // ── Recalibrate when play begins (phone is now in position above head) ───
  useEffect(() => {
    if (gameState === "playing") {
      calibrate();
    }
  }, [gameState, calibrate]);

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
    setIsCorrect(true);
    setTimeout(() => {
      markCorrect();
      setIsCorrect(false);
    }, 500);
  }, [gameState, actionInProgress, markCorrect]);

  // ── Gyro / keyboard → game actions ──────────────────────────────────────
  useEffect(() => {
    if (gameState !== "playing" || actionInProgress) return;
    const direction =
      gyroDirection !== "neutral" ? gyroDirection : keyDirection;

    // Reset gate when phone returns to neutral
    if (direction === "neutral") {
      lastActedDirection.current = "neutral";
      return;
    }

    // Don't re-fire the same direction — effect re-runs when actionInProgress
    // clears, but gyroDirection may still hold the same value from before
    if (direction === lastActedDirection.current) return;

    if (direction === "up" && !isCorrect) {
      lastActedDirection.current = direction;
      handleMarkCorrect();
    } else if (direction === "down") {
      lastActedDirection.current = direction;
      markSkipped();
    }
  }, [
    gameState,
    actionInProgress,
    gyroDirection,
    keyDirection,
    markSkipped,
    isCorrect,
    handleMarkCorrect,
  ]);

  // ── Game finished ────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState === "finished") {
      exitFullscreen();
      onFinish({ correct: score.correct, skipped: score.skipped });
    }
  }, [gameState, score, onFinish, exitFullscreen]);

  const handleEndGame = useCallback(() => {
    exitFullscreen();
    resetGame();
    onFinish({ correct: score.correct, skipped: score.skipped });
  }, [exitFullscreen, resetGame, onFinish, score]);

  const handleCancel = useCallback(() => {
    exitFullscreen();
    onCancel();
  }, [exitFullscreen, onCancel]);

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
        <div className="card text-center p-8 max-w-sm w-full">
          <h2 className="title-logo title-logo-sm mb-3">Toes Down</h2>
          <p className="text-sm font-semibold opacity-50 uppercase tracking-widest mb-3">How to play</p>
          <p className="mb-6 opacity-60 text-sm leading-relaxed">
            Hold your phone flat above your forehead in landscape, screen facing
            away. The team sees the word and gives clues.
          </p>
          <div className="flex justify-around mb-8">
            <div className="text-center">
              <div className="text-4xl mb-1">↑</div>
              <div className="text-sm opacity-60">Tilt back</div>
              <div className="text-xs opacity-40 mt-0.5">Got it!</div>
            </div>
            <div className="text-center opacity-40 self-center text-2xl">·</div>
            <div className="text-center">
              <div className="text-4xl mb-1">↓</div>
              <div className="text-sm opacity-60">Tilt forward</div>
              <div className="text-xs opacity-40 mt-0.5">Skip</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSetup}
            className="button button-primary w-full py-4 text-base font-bold"
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
      <div className="game-fullscreen flex flex-col items-center justify-center">
        <div key={countdown} className="countdown-number text-9xl font-bold">
          {countdown}
        </div>
        <p className="mt-8 text-base opacity-60">Hold above your head</p>
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
      <div className="game-fullscreen flex flex-col">
        {/* Timer bar */}
        <div className="game-timer-track">
          <div
            className={`timer-bar h-full ${timerClass}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Main area: skip | word | correct */}
        <div className="flex-1 flex items-center px-6 gap-4">
          {/* Skip side */}
          <div className="game-side-indicator">
            <div className="text-3xl">↓</div>
            <div className="text-xs opacity-50 mt-1">Skip</div>
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
            <div className="text-3xl">↑</div>
            <div className="text-xs opacity-50 mt-1">Correct</div>
            <div className="score-correct text-2xl font-bold mt-2">
              {score.correct}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-8 py-3">
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
