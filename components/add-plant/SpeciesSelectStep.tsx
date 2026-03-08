"use client";

import { useState } from "react";
import { ActionButton, Card, Badge } from "@/components/ui";
import type { SpeciesMatch } from "./types";
import type { Species } from "@/types/database";

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
  needsClarification,
  clarificationMessage,
  selectedSpecies,
  isLoading,
  onSelectSpecies,
  onManualSearch,
  onContinue,
  onBack,
}: SpeciesSelectStepProps) {
  if (needsClarification) {
    return (
      <div className="space-y-6">
        <Card hover={false}>
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-display font-semibold text-forest mb-2">
              Not Sure About This One
            </h3>
            <p className="text-sm text-forest/60 mb-4">
              {clarificationMessage ||
                "Can you take a closer photo of a leaf? This will help with identification."}
            </p>
            <div className="flex gap-3">
              <ActionButton variant="secondary" onClick={onBack} className="flex-1">
                Retake Photo
              </ActionButton>
              <ActionButton variant="primary" onClick={onManualSearch} className="flex-1">
                Search Manually
              </ActionButton>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-forest mb-1">
          Is this your plant?
        </h3>
        <p className="text-sm text-forest/60">
          Select the best match or search manually
        </p>
      </div>

      <div className="space-y-3">
        {matches.map((match) => (
          <button
            key={match.speciesKey}
            onClick={() => onSelectSpecies(match)}
            className={`
              w-full text-left p-4 rounded-xl border-2 transition-all
              ${
                selectedSpecies?.speciesKey === match.speciesKey
                  ? "border-green bg-green/5"
                  : "border-transparent bg-white hover:border-forest/20"
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-forest">{match.speciesName}</h4>
                <p className="text-xs text-forest/50">{match.speciesKey}</p>
              </div>
              <Badge
                variant={match.confidence >= 80 ? "green" : match.confidence >= 60 ? "amber" : "coral"}
              >
                {match.confidence}% match
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-forest/60">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                {match.careInfo.light}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                {match.careInfo.water}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onManualSearch}
        className="w-full p-4 rounded-xl border-2 border-dashed border-forest/20 text-forest/60 hover:border-forest/40 hover:text-forest transition-colors"
      >
        None of these — search manually
      </button>

      <div className="flex gap-3 pt-2">
        <ActionButton variant="secondary" onClick={onBack} className="flex-1">
          Back
        </ActionButton>
        <ActionButton
          variant="primary"
          onClick={onContinue}
          disabled={!selectedSpecies || isLoading}
          className="flex-1"
        >
          Continue
        </ActionButton>
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
  const [results, setResults] = useState<Species[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/species?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Error searching species:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSpecies = (species: Species) => {
    onSelect({
      speciesKey: species.key,
      speciesName: species.name,
      confidence: 100,
      careInfo: {
        water: `Every ${species.water_days} days`,
        light: species.light.replace(/_/g, " "),
        humidity: species.humidity,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-forest mb-1">
          Search for your plant
        </h3>
        <p className="text-sm text-forest/60">
          Type the plant name to find it
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search plants..."
          className="w-full px-4 py-3 rounded-xl border-2 border-forest/10 focus:border-green focus:outline-none bg-white text-forest placeholder:text-forest/40"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-5 h-5 text-forest/40" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((species) => (
            <button
              key={species.key}
              onClick={() => handleSelectSpecies(species)}
              className="w-full text-left p-4 bg-white rounded-xl hover:bg-green/5 transition-colors"
            >
              <h4 className="font-semibold text-forest">{species.name}</h4>
              <p className="text-xs text-forest/60">
                Water every {species.water_days} days • {species.light.replace(/_/g, " ")}
              </p>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && !isSearching && (
        <p className="text-center text-forest/60 py-4">
          No plants found matching &quot;{query}&quot;
        </p>
      )}

      <ActionButton variant="secondary" onClick={onBack} className="w-full">
        Back to matches
      </ActionButton>
    </div>
  );
}
