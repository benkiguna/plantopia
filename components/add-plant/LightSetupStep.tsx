"use client";

import { ActionButton } from "@/components/ui";
import { LIGHT_OPTIONS, type LightOption } from "./types";

interface LightSetupStepProps {
  selectedLight: LightOption | null;
  onSelectLight: (light: LightOption) => void;
  onBack: () => void;
}

function LightIcon({ type }: { type: string }) {
  switch (type) {
    case "sun":
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case "sun-dim":
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
          <path
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M12 5V3m0 18v-2m7-7h2M3 12h2m12.364-5.364l1.414-1.414M5.222 18.778l1.414-1.414m10.728 0l1.414 1.414M5.222 5.222l1.414 1.414"
            opacity={0.5}
          />
        </svg>
      );
    case "cloud-sun":
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 15h18M7 19h10M5 11a4 4 0 018 0M17 11a3 3 0 11-6 0"
          />
          <circle cx="17" cy="7" r="2" strokeWidth={1.5} opacity={0.5} />
        </svg>
      );
    case "cloud":
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 15h18M7 19h10M5 11a4 4 0 018 0"
          />
        </svg>
      );
    default:
      return null;
  }
}

export function LightSetupStep({
  selectedLight,
  onSelectLight,
  onBack,
}: LightSetupStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-forest mb-1">
          Where does your plant live?
        </h3>
        <p className="text-sm text-forest/60">
          Select the light conditions for your plant
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LIGHT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelectLight(option.value)}
            className={`
              p-4 rounded-xl border-2 text-left transition-all
              ${
                selectedLight === option.value
                  ? "border-green bg-green/5"
                  : "border-transparent bg-white hover:border-forest/20"
              }
            `}
          >
            <div
              className={`mb-2 ${
                selectedLight === option.value ? "text-green" : "text-forest/60"
              }`}
            >
              <LightIcon type={option.icon} />
            </div>
            <h4 className="font-semibold text-forest text-sm">{option.label}</h4>
            <p className="text-xs text-forest/60 mt-0.5">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <ActionButton variant="secondary" onClick={onBack} className="w-full">
          Back
        </ActionButton>
      </div>
    </div>
  );
}
