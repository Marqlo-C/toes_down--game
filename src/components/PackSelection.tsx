"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
// import { getPackNames, getPackItems } from "../utils/game";

interface PackSelectionProps {
  onStartGame: (selectedItems: string[]) => void;
}

interface CustomPack {
  id: string;
  name: string;
  items: string[];
}

export default function PackSelection({ onStartGame }: PackSelectionProps) {
  const [packs, setPacks] = useState<string[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [customPacks, setCustomPacks] = useState<CustomPack[]>([]);
  const [isCustomPackEditorOpen, setIsCustomPackEditorOpen] = useState(false);
  const [customPackName, setCustomPackName] = useState("");
  const [customPackItemsText, setCustomPackItemsText] = useState("");
  const [customPackError, setCustomPackError] = useState("");
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

  const togglePack = (packKey: string) => {
    setSelectedPacks((prev) =>
      prev.includes(packKey)
        ? prev.filter((p) => p !== packKey)
        : [...prev, packKey]
    );
  };

  const handleAddCustomPack = () => {
    const trimmedName = customPackName.trim();
    const parsedItems = customPackItemsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!trimmedName) {
      setCustomPackError("Give your custom pack a name.");
      return;
    }

    if (parsedItems.length < 3) {
      setCustomPackError("Add at least 3 lines for a custom pack.");
      return;
    }

    const id = `custom-${Date.now()}`;
    setCustomPacks((prev) => [...prev, { id, name: trimmedName, items: parsedItems }]);
    setSelectedPacks((prev) => [...prev, `custom:${id}`]);
    setCustomPackName("");
    setCustomPackItemsText("");
    setCustomPackError("");
    setIsCustomPackEditorOpen(false);
  };

  const handleRemoveCustomPack = (id: string) => {
    setCustomPacks((prev) => prev.filter((pack) => pack.id !== id));
    setSelectedPacks((prev) => prev.filter((key) => key !== `custom:${id}`));
  };

  const handleStartGame = async () => {
    if (selectedPacks.length === 0) return;

    try {
      const selectedBuiltInPacks = selectedPacks
        .filter((key) => key.startsWith("builtin:"))
        .map((key) => key.replace("builtin:", ""));

      const selectedCustomItems = selectedPacks
        .filter((key) => key.startsWith("custom:"))
        .map((key) => key.replace("custom:", ""))
        .flatMap((customId) => {
          const found = customPacks.find((pack) => pack.id === customId);
          return found ? found.items : [];
        });

      let builtInItems: string[] = [];
      if (selectedBuiltInPacks.length > 0) {
        const response = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ packs: selectedBuiltInPacks }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch built-in pack items");
        }

        builtInItems = await response.json();
      }

      const mergedItems = [...builtInItems, ...selectedCustomItems].filter(Boolean);
      onStartGame(mergedItems);
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
    <div className="container home-screen">
      <div className="start-poster card home-screen-poster my-6">
        <div className="start-poster-pin start-poster-pin-left" aria-hidden="true" />
        <div className="start-poster-pin start-poster-pin-right" aria-hidden="true" />

        <div className="text-center">
          <div className="start-poster-kicker">The Great Aggie Card-off</div>
          <h1 className="title-logo start-poster-title title-logo-with-toe" aria-label="Toes Down!">
            <span aria-hidden="true">T</span><span className="sr-only">o</span><span aria-hidden="true" className="title-o-toe"><Image src="/resources/o_toe.png" alt="" width={96} height={96} className="title-o-toe-img" priority /></span><span aria-hidden="true">es Down!</span>
          </h1>
          <p className="start-poster-subtitle">
            One phone, one word, and a herd of terrible guesses.
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
              const packKey = `builtin:${pack}`;
              const selected = selectedPacks.includes(packKey);
              return (
                <button
                  type="button"
                  key={pack}
                  onClick={() => togglePack(packKey)}
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
            type="button"
            onClick={() => setIsCustomPackEditorOpen((prev) => !prev)}
            className={`pack-tile w-full text-left mb-4 ${isCustomPackEditorOpen ? "selected" : ""}`}
          >
            <span className="font-medium">Create Custom Pack</span>
            <span className="float-right text-xs opacity-70 mt-0.5">
              {isCustomPackEditorOpen ? "▴ open" : "▾ add your own"}
            </span>
          </button>

          {isCustomPackEditorOpen && (
            <div className="mb-4">
              <h3 className="start-poster-section-title mt-2">Custom Pack Editor</h3>
              <div className="mb-3">
                <input
                  type="text"
                  value={customPackName}
                  onChange={(e) => setCustomPackName(e.target.value)}
                  placeholder="Pack name (e.g. Inside Jokes)"
                  className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm md:text-base text-white placeholder-white/45 outline-none focus:border-cyan-300"
                />
              </div>
              <div className="mb-3">
                <textarea
                  value={customPackItemsText}
                  onChange={(e) => setCustomPackItemsText(e.target.value)}
                  placeholder={"One word or phrase per line\nLike this\nAnd this"}
                  rows={4}
                  className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm md:text-base text-white placeholder-white/45 outline-none focus:border-cyan-300"
                />
              </div>
              {customPackError && (
                <p className="text-xs text-rose-300 mb-3">{customPackError}</p>
              )}
              <button
                type="button"
                onClick={handleAddCustomPack}
                className="button w-full"
              >
                Save Custom Pack
              </button>
            </div>
          )}

          {customPacks.length > 0 && (
            <div className="space-y-2 mb-6">
              {customPacks.map((pack) => {
                const packKey = `custom:${pack.id}`;
                const selected = selectedPacks.includes(packKey);
                return (
                  <div key={pack.id} className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => togglePack(packKey)}
                      className={`pack-tile flex-1${selected ? " selected" : ""}`}
                    >
                      <span className="font-medium">{pack.name}</span>
                      <span className="float-right text-xs opacity-70 mt-0.5">
                        {pack.items.length} items
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomPack(pack.id)}
                      className="button px-3"
                      aria-label={`Remove ${pack.name}`}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}

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
