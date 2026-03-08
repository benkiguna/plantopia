"use client";

import { useState, useRef } from "react";
import { ActionButton } from "@/components/ui";
import { LIGHT_OPTIONS, type LightOption, type LightAnalysisData } from "./types";

interface LightSetupStepProps {
  selectedLight: LightOption | null;
  lightAnalysis: LightAnalysisData | null;
  isAnalyzing: boolean;
  onSelectLight: (light: LightOption) => void;
  onAnalyzeLight: (file: File) => Promise<void>;
  onClearAnalysis: () => void;
  onContinue: () => void;
  onBack: () => void;
}

type Mode = "choose" | "photo" | "manual";

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

function CameraIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function getLightOptionFromLevel(level: string): LightOption {
  // Map AI light levels to the 4 basic options
  if (level === "bright_direct") return "bright_direct";
  if (level === "bright_indirect" || level === "medium_to_bright_indirect" || level === "low_to_bright_indirect") return "bright_indirect";
  if (level === "medium" || level === "medium_indirect" || level === "low_to_medium") return "medium";
  return "low";
}

function getLightOptionConfig(option: LightOption) {
  return LIGHT_OPTIONS.find(o => o.value === option);
}

export function LightSetupStep({
  selectedLight,
  lightAnalysis,
  isAnalyzing,
  onSelectLight,
  onAnalyzeLight,
  onClearAnalysis,
  onContinue,
  onBack,
}: LightSetupStepProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAnalyzeLight(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTakePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleAcceptAnalysis = () => {
    if (lightAnalysis) {
      const lightOption = getLightOptionFromLevel(lightAnalysis.light_level);
      onSelectLight(lightOption);
      onContinue();
    }
  };

  const handleEditAnalysis = (option: LightOption) => {
    onSelectLight(option);
  };

  const handleRetryPhoto = () => {
    onClearAnalysis();
    fileInputRef.current?.click();
  };

  // Choose mode - initial selection between photo and manual
  if (mode === "choose") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-forest mb-1">
            Where does your plant live?
          </h3>
          <p className="text-sm text-forest/60">
            Choose how to set up the light conditions
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("photo")}
            className="p-6 rounded-xl border-2 border-transparent bg-white hover:border-green/50 text-center transition-all"
          >
            <div className="flex justify-center mb-3 text-green">
              <CameraIcon />
            </div>
            <h4 className="font-semibold text-forest text-sm">Take a Photo</h4>
            <p className="text-xs text-forest/60 mt-1">AI analyzes your space</p>
          </button>

          <button
            onClick={() => setMode("manual")}
            className="p-6 rounded-xl border-2 border-transparent bg-white hover:border-forest/20 text-center transition-all"
          >
            <div className="flex justify-center mb-3 text-forest/60">
              <GridIcon />
            </div>
            <h4 className="font-semibold text-forest text-sm">Select Manually</h4>
            <p className="text-xs text-forest/60 mt-1">Choose from options</p>
          </button>
        </div>

        <div className="pt-2">
          <ActionButton variant="secondary" onClick={onBack} className="w-full">
            Back
          </ActionButton>
        </div>
      </div>
    );
  }

  // Photo analysis mode
  if (mode === "photo") {
    return (
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <div>
          <h3 className="text-lg font-display font-semibold text-forest mb-1">
            Photograph the spot
          </h3>
          <p className="text-sm text-forest/60">
            Take a photo of where your plant will live for AI analysis
          </p>
        </div>

        {/* Loading state */}
        {isAnalyzing && (
          <div className="p-6 bg-white rounded-xl text-center">
            <div className="animate-pulse mb-3">
              <div className="w-12 h-12 mx-auto bg-green/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-forest/60">Analyzing light conditions...</p>
          </div>
        )}

        {/* Analysis result */}
        {lightAnalysis && !isAnalyzing && (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border-2 border-green/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-forest">AI Analysis</span>
                </div>
                <span className="text-xs text-forest/50">{lightAnalysis.confidence}% confident</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-forest/50 mb-1">Light Condition</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const option = getLightOptionConfig(getLightOptionFromLevel(lightAnalysis.light_level));
                      return option ? (
                        <>
                          <div className="text-green">
                            <LightIcon type={option.icon} />
                          </div>
                          <span className="font-semibold text-forest">{option.label}</span>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-forest/50 mb-1">Light Source</p>
                  <p className="text-sm text-forest">{lightAnalysis.light_source}</p>
                </div>

                <div>
                  <p className="text-xs text-forest/50 mb-1">Estimated Daily Light</p>
                  <p className="text-sm text-forest">{lightAnalysis.estimated_daily_hours} hours</p>
                </div>

                <div>
                  <p className="text-xs text-forest/50 mb-1">Notes</p>
                  <p className="text-sm text-forest/80">{lightAnalysis.notes}</p>
                </div>
              </div>

              {/* Edit light level */}
              <div className="mt-4 pt-3 border-t border-forest/10">
                <p className="text-xs text-forest/50 mb-2">Adjust if needed:</p>
                <div className="flex gap-2 flex-wrap">
                  {LIGHT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleEditAnalysis(option.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedLight === option.value ||
                        (!selectedLight && getLightOptionFromLevel(lightAnalysis.light_level) === option.value)
                          ? "bg-green text-white"
                          : "bg-forest/5 text-forest/70 hover:bg-forest/10"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <ActionButton variant="secondary" onClick={handleRetryPhoto} className="flex-1">
                Retake
              </ActionButton>
              <ActionButton onClick={handleAcceptAnalysis} className="flex-1">
                Continue
              </ActionButton>
            </div>
          </div>
        )}

        {/* Initial state - no photo taken yet */}
        {!lightAnalysis && !isAnalyzing && (
          <div className="space-y-4">
            <button
              onClick={handleTakePhoto}
              className="w-full p-8 bg-white rounded-xl border-2 border-dashed border-forest/20 hover:border-green/50 transition-colors"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center text-green">
                  <CameraIcon />
                </div>
                <div className="text-center">
                  <p className="font-medium text-forest">Take a photo</p>
                  <p className="text-xs text-forest/50 mt-1">
                    Capture the window or light source
                  </p>
                </div>
              </div>
            </button>

            <div className="flex gap-3">
              <ActionButton
                variant="secondary"
                onClick={() => setMode("choose")}
                className="flex-1"
              >
                Back
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() => setMode("manual")}
                className="flex-1"
              >
                Select Manually
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Manual selection mode
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-forest mb-1">
          Select light conditions
        </h3>
        <p className="text-sm text-forest/60">
          Choose the best match for your plant&apos;s location
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

      <div className="flex gap-3 pt-2">
        <ActionButton variant="secondary" onClick={() => setMode("choose")} className="flex-1">
          Back
        </ActionButton>
        <ActionButton
          onClick={onContinue}
          disabled={!selectedLight}
          className="flex-1"
        >
          Continue
        </ActionButton>
      </div>
    </div>
  );
}
