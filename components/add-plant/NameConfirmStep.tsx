"use client";

import { ActionButton, Card, Badge } from "@/components/ui";
import type { SpeciesMatch, LightOption } from "./types";
import { LIGHT_OPTIONS } from "./types";

interface NameConfirmStepProps {
  photoPreviewUrl: string | null;
  selectedSpecies: SpeciesMatch | null;
  lightSetup: LightOption | null;
  nickname: string;
  isLoading: boolean;
  onNicknameChange: (name: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function NameConfirmStep({
  photoPreviewUrl,
  selectedSpecies,
  lightSetup,
  nickname,
  isLoading,
  onNicknameChange,
  onConfirm,
  onBack,
}: NameConfirmStepProps) {
  const lightLabel = LIGHT_OPTIONS.find((l) => l.value === lightSetup)?.label || lightSetup;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-forest mb-1">
          Name your plant
        </h3>
        <p className="text-sm text-forest/60">
          Give your plant a nickname to personalize it
        </p>
      </div>

      <input
        type="text"
        value={nickname}
        onChange={(e) => onNicknameChange(e.target.value)}
        placeholder={selectedSpecies?.speciesName || "Plant name"}
        className="w-full px-4 py-3 rounded-xl border-2 border-forest/10 focus:border-green focus:outline-none bg-white text-forest placeholder:text-forest/40 text-lg font-medium"
      />

      {/* Preview Card */}
      <Card hover={false}>
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          {photoPreviewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={photoPreviewUrl}
              alt="Plant preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-forest/10 flex items-center justify-center">
              <span className="text-forest/40">No photo</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h4 className="text-lg font-display font-semibold text-white">
              {nickname || selectedSpecies?.speciesName || "Your Plant"}
            </h4>
            <p className="text-sm text-white/80">{selectedSpecies?.speciesName}</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="green">{lightLabel}</Badge>
            <Badge variant="sky">{selectedSpecies?.careInfo.water}</Badge>
          </div>
          {selectedSpecies && (
            <div className="text-xs text-forest/60">
              <p>
                <span className="font-medium">Light:</span> {selectedSpecies.careInfo.light}
              </p>
              <p>
                <span className="font-medium">Humidity:</span> {selectedSpecies.careInfo.humidity}
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3 pt-2">
        <ActionButton
          variant="secondary"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </ActionButton>
        <ActionButton
          variant="primary"
          onClick={onConfirm}
          disabled={!nickname.trim() || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
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
              Adding...
            </span>
          ) : (
            "Add to Garden"
          )}
        </ActionButton>
      </div>
    </div>
  );
}
