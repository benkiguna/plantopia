"use client";

import React, { useState } from "react";
import { SunIcon, DropIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import type { SpeciesMatch } from "./types";

interface SpeciesSelectStepProps {
  matches: SpeciesMatch[];
  needsClarification: boolean;
  clarificationMessage?: string;
  selectedSpecies: SpeciesMatch | null;
  isLoading: boolean;
  onSelectSpecies: (species: SpeciesMatch) => void;
  onManualSearch: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function SpeciesSelectStep({
  matches,
  selectedSpecies,
  isLoading,
  onSelectSpecies,
  onManualSearch,
  onContinue,
  onBack,
}: SpeciesSelectStepProps) {
  return (
    /* FIXED VIEWPORT LOCK */
    <div className="flex flex-col w-full h-full animate-slide-up">
      {/* HEADER */}
      <div className="text-center space-y-0.5 shrink-0 px-6 pt-4">
        <h2 className="text-2xl font-serif italic text-white/95 tracking-tight">
          Is this your plant?
        </h2>
        <p className="text-[9px] text-white/30 tracking-[0.4em] uppercase font-body">
          Bio-Identification Results
        </p>
      </div>

      {/* THE LIST AREA (The only part allowed to scroll) */}
      <div className="w-full flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-4">
        {matches.map((match) => {
          const isSelected = selectedSpecies?.speciesKey === match.speciesKey;

          return (
            <button
              key={match.speciesKey}
              onClick={() => onSelectSpecies(match)}
              className="relative w-full p-6 rounded-[40px] text-left transition-all duration-500 border overflow-hidden"
              style={{
                backgroundColor: isSelected
                  ? "rgba(74, 222, 128, 0.1)"
                  : "rgba(255, 255, 255, 0.02)",
                borderColor: isSelected
                  ? "rgba(74, 222, 128, 0.4)"
                  : "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
              }}
            >
              {/* TOP INFO */}
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-serif italic text-white/90 leading-none">
                    {match.speciesName}
                  </h4>
                  <p className="text-[9px] text-white/20 tracking-widest font-bold uppercase italic">
                    {match.speciesKey}
                  </p>
                </div>
                <div
                  className="w-fit px-4 py-2 rounded-full border flex flex-col items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(74, 222, 128, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                    borderColor: isSelected
                      ? "rgba(74, 222, 128, 0.4)"
                      : "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span className="text-[9px] font-bold text-white/80 leading-none mb-1">
                    {match.confidence}%
                  </span>
                  <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/30 leading-none">
                    Match
                  </span>
                </div>
              </div>

              {/* DATA GRID - Eliminates internal scrollbars */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/20">
                    <SunIcon size={12} weight="fill" />
                    <span className="text-[7px] uppercase tracking-widest font-bold">
                      Exposure
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed font-medium line-clamp-3">
                    {match.careInfo.light}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/20">
                    <DropIcon size={12} weight="fill" />
                    <span className="text-[7px] uppercase tracking-widest font-bold">
                      Hydration
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed font-medium line-clamp-3">
                    {match.careInfo.water}
                  </p>
                </div>
              </div>
            </button>
          );
        })}

        <button
          onClick={onManualSearch}
          className="w-full py-5 rounded-[40px] border border-dashed border-white/10 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]"
        >
          None of these — search manually
        </button>
      </div>

      {/* ACTION BAR */}
      <div className="shrink-0 px-6 pb-6 pt-3">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40"
          >
            Back
          </button>
          <button
            onClick={onContinue}
            disabled={!selectedSpecies || isLoading}
            className={`flex-[2] py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all
              ${selectedSpecies ? "bg-glass-emerald text-emerald-950 shadow-[0_8px_24px_rgba(74,222,128,0.25)]" : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"}
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

interface ManualSearchProps {
  onSelect: (species: SpeciesMatch) => void;
  onBack: () => void;
}

export function ManualSpeciesSearch({ onSelect, onBack }: ManualSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpeciesMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/analyze/search?q=${encodeURIComponent(value.trim())}`,
        );
        if (response.ok) {
          const data: SpeciesMatch[] = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Error searching species:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  return (
    <div className="flex flex-col w-full h-full animate-slide-up">
      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 pt-4 min-h-0">
        {/* Header */}
        <div className="text-center space-y-0.5 shrink-0 mb-4">
          <h3 className="text-xl font-serif italic text-white/95 tracking-tight">
            Search by Name
          </h3>
          <p className="text-[9px] text-white/30 tracking-[0.4em] uppercase font-body italic">
            AI Plant Encyclopedia
          </p>
        </div>

        {/* Search bar */}
        <div className="relative shrink-0 mb-4">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
            <MagnifyingGlassIcon size={18} weight="light" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="e.g. monstera, snake plant…"
            autoFocus
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-white/10 text-white font-serif italic placeholder:text-white/20 outline-none transition-all"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-white/10 border-t-glass-emerald rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-2">
          {results.length > 0 ? (
            results.map((match, index) => (
              <button
                key={match.speciesKey}
                onClick={() => onSelect(match)}
                className="w-full text-left p-5 rounded-2xl border transition-all"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderColor: "rgba(255, 255, 255, 0.06)",
                  animationDelay: `${index * 40}ms`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-serif italic text-white/90 leading-tight">
                      {match.speciesName}
                    </h4>
                    <p className="text-[8px] text-white/20 tracking-widest font-bold uppercase mt-0.5">
                      {match.speciesKey.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-glass-emerald/10 border border-glass-emerald/20 text-[7px] text-glass-emerald/70 font-bold uppercase tracking-widest shrink-0 ml-3">
                    {match.confidence}% match
                  </div>
                </div>
                <div className="flex gap-4 border-t border-white/5 pt-3 text-white/30 text-[10px]">
                  <span>{match.careInfo.light}</span>
                  <span>·</span>
                  <span>{match.careInfo.water}</span>
                </div>
              </button>
            ))
          ) : query.length >= 2 && !isSearching ? (
            <div className="text-center py-12">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                No matches found
              </p>
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-12">
              <p className="text-[9px] text-white/15 uppercase tracking-[0.2em] font-bold">
                Type to search…
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* --- PINNED ACTION BAR --- */}
      <div className="shrink-0 px-6 pb-6 pt-3">
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40"
        >
          Back
        </button>
      </div>
    </div>
  );
}
