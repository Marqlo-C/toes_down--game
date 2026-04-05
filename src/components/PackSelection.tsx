"use client";

import React, { useState, useEffect } from "react";
// import { getPackNames, getPackItems } from "../utils/game";

interface PackSelectionProps {
  onStartGame: (selectedItems: string[]) => void;
}

export default function PackSelection({ onStartGame }: PackSelectionProps) {
  const [packs, setPacks] = useState<string[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPacks() {
      try {
        // On the client side, we need to fetch the packs
        const response = await fetch("/api/packs");
        const packData = await response.json();
        setPacks(packData);
      } catch (error) {
        console.error("Failed to load packs:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPacks();
  }, []);

  const togglePack = (packName: string) => {
    setSelectedPacks((prev) =>
      prev.includes(packName)
        ? prev.filter((p) => p !== packName)
        : [...prev, packName]
    );
  };

  const handleStartGame = async () => {
    if (selectedPacks.length === 0) return;

    try {
      // Fetch all items from selected packs
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packs: selectedPacks }),
      });

      const items = await response.json();
      onStartGame(items);
    } catch (error) {
      console.error("Failed to load game items:", error);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[300px]">
        <div className="text-center opacity-60">
          <p className="text-lg">Loading packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="start-poster card my-6">
        <div className="start-poster-pin start-poster-pin-left" aria-hidden="true" />
        <div className="start-poster-pin start-poster-pin-right" aria-hidden="true" />

        <div className="text-center">
          <div className="start-poster-kicker">Party card challenge</div>
          <h1 className="title-logo start-poster-title">Toes Down</h1>
          <p className="start-poster-subtitle">
            One phone, one word, and a room full of bad guesses.
          </p>
          <div className="start-poster-ribbon">Tap Start to enter fullscreen</div>
        </div>

        <div className="start-poster-cards">
          <div className="start-poster-card start-poster-card--left">
            <div className="start-poster-card-icon">↕</div>
            <div className="start-poster-card-label">Up / Down = Correct</div>
          </div>
          <div className="start-poster-card start-poster-card--right">
            <div className="start-poster-card-icon">↔</div>
            <div className="start-poster-card-label">Left / Right = Skip</div>
          </div>
        </div>

        <div className="start-poster-pack-section">
          <h2 className="start-poster-section-title">Choose Packs</h2>

          <div className="space-y-2 mb-6">
            {packs.map((pack) => {
              const selected = selectedPacks.includes(pack);
              return (
                <button
                  type="button"
                  key={pack}
                  onClick={() => togglePack(pack)}
                  className={`pack-tile${selected ? " selected" : ""}`}
                >
                  <span className="font-medium">
                    {pack.charAt(0).toUpperCase() + pack.slice(1)}
                  </span>
                  {selected && (
                    <span className="float-right text-xs opacity-70 mt-0.5">✓ selected</span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleStartGame}
            disabled={selectedPacks.length === 0}
            className={`button button-primary w-full py-3 text-base font-semibold ${selectedPacks.length === 0 ? "opacity-40 cursor-not-allowed" : ""
              }`}
          >
            {selectedPacks.length === 0 ? "Select a pack to start" : "Start Game →"}
          </button>
        </div>
      </div>
    </div>
  );
}
