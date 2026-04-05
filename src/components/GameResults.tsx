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
      <div className="text-center my-8">
        <h1 className="text-2xl font-bold opacity-50 uppercase tracking-widest text-sm">
          Game Over
        </h1>
      </div>

      <div className="card my-4 text-center">
        <div className="py-4">
          <div className="text-8xl font-bold">{score.correct}</div>
          <div className="text-base mt-2 opacity-60 uppercase tracking-widest text-sm">
            correct
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
