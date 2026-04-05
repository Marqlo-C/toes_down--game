"use client";

import React from "react";

interface GameResultsProps {
  score: {
    correct: number;
    skipped: number;
  };
  onPlayAgain: () => void;
}

export default function GameResults({ score, onPlayAgain }: GameResultsProps) {
  const totalItems = score.correct + score.skipped;
  const accuracy =
    totalItems > 0 ? Math.round((score.correct / totalItems) * 100) : 0;

  return (
    <div className="container">
      <div className="start-poster card my-6 text-center">
        <div className="start-poster-pin start-poster-pin-left" aria-hidden="true" />
        <div className="start-poster-pin start-poster-pin-right" aria-hidden="true" />

        <div className="start-poster-kicker">Round complete</div>
        <h1 className="title-logo title-logo-sm start-poster-title mb-2">Game Over</h1>
        <p className="start-poster-subtitle mb-6">
          Nice run. Here is your final score card.
        </p>

        <div className="start-poster-ribbon mb-5">Final results</div>

        <div className="py-2">
          <div className="text-8xl font-bold text-white">{score.correct}</div>
          <div className="text-base mt-2 opacity-70 uppercase tracking-widest text-sm">
            Correct
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="card">
            <div className="stat-accuracy text-3xl font-bold">
              {accuracy}%
            </div>
            <div className="text-xs mt-1 opacity-60 uppercase tracking-wider">accuracy</div>
          </div>
          <div className="card">
            <div className="stat-skipped text-3xl font-bold">
              {score.skipped}
            </div>
            <div className="text-xs mt-1 opacity-60 uppercase tracking-wider">skipped</div>
          </div>
        </div>

        <button type="button" onClick={onPlayAgain} className="button button-primary w-full py-3 text-base font-semibold">
          Play Again →
        </button>
      </div>
    </div>
  );
}
