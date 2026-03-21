"use client";

import { useRef } from "react";
import { SunIcon, ApertureIcon, XIcon } from "@phosphor-icons/react";
import { LIGHT_OPTIONS } from "./types";
import type { LightAnalysisData } from "./types";

interface LightSetupStepProps {
  selectedLight: string | null;
  lightAnalysis: LightAnalysisData | null;
  isAnalyzing: boolean;
  onSelectLight: (value: string) => void;
  onAnalyzeLight: (file: File) => void;
  onClearAnalysis: () => void;
  onContinue: () => void;
  onBack: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLight =
    LIGHT_OPTIONS.find((l) => l.value === selectedLight) || LIGHT_OPTIONS[1];

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAnalyzeLight(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col w-full h-full animate-slide-up">
      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 overflow-hidden px-6 py-4">
        {/* Header */}
        <div className="text-center space-y-0.5 shrink-0">
          <h3 className="text-xl font-serif italic text-white/95 tracking-tight">
            Environmental Light
          </h3>
          <p className="text-[9px] text-white/30 tracking-[0.4em] uppercase font-body italic">
            Ambient Exposure Analysis
          </p>
        </div>

        {/* The Lucent Dial */}
        <div className="relative flex items-center justify-center shrink-0 w-full">
          <div
            className="absolute w-48 h-48 rounded-full blur-[80px] transition-all duration-1000 opacity-25"
            style={{ backgroundColor: currentLight.color }}
          />
          <div
            className="relative w-44 h-44 flex flex-col items-center justify-center transition-all duration-700"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, transparent 75%)",
            }}
          >
            <SunIcon
              size={36}
              weight="duotone"
              className="transition-all duration-700 mb-2"
              style={{
                color: currentLight.color,
                filter: `drop-shadow(0 0 8px ${currentLight.color})`,
              }}
            />
            <div className="text-center px-6 space-y-1">
              <h4 className="text-lg font-serif italic text-white/90 leading-tight">
                {currentLight.label}
              </h4>
              <p className="text-[8px] text-white/40 uppercase tracking-[0.2em] font-bold leading-relaxed max-w-[130px] mx-auto">
                {currentLight.description}
              </p>
            </div>
          </div>
        </div>

        {/* Optical Analysis Trigger / Result */}
        {lightAnalysis ? (
          <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.04] shrink-0">
            <div className="flex items-center gap-3">
              <ApertureIcon size={15} className="text-glass-emerald" weight="fill" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">
                  {lightAnalysis.light_level}
                </p>
                <p className="text-[8px] text-white/40 mt-0.5">
                  ~{lightAnalysis.estimated_daily_hours}h / day · {Math.round(lightAnalysis.confidence * 100)}% confidence
                </p>
              </div>
            </div>
            <button onClick={onClearAnalysis} className="text-white/30 hover:text-white/60 transition-colors">
              <XIcon size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleCameraClick}
            disabled={isAnalyzing}
            className="group relative flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all shrink-0 disabled:opacity-50"
          >
            <div className="absolute inset-0 rounded-full bg-glass-emerald/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <ApertureIcon
              size={16}
              className={`text-glass-emerald ${isAnalyzing ? "animate-spin" : "animate-pulse"}`}
              weight="fill"
            />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">
              {isAnalyzing ? "Analyzing…" : "Analyze with Camera"}
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Selection Tiles */}
        <div className="w-full flex gap-2 shrink-0">
          {LIGHT_OPTIONS.map((option) => {
            const isSelected = selectedLight === option.value;
            const isAiPick = lightAnalysis !== null && isSelected;
            return (
              <button
                key={option.value}
                onClick={() => onSelectLight(option.value)}
                className="relative flex-1 py-2.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all duration-500"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.02)",
                  color: isSelected ? "#fff" : "rgba(255, 255, 255, 0.2)",
                  border: isSelected
                    ? "1px solid rgba(255, 255, 255, 0.15)"
                    : "1px solid transparent",
                }}
              >
                {option.label.split(" ")[0]}
                {isAiPick && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[6px] font-bold uppercase tracking-wider bg-glass-emerald text-bg-dark px-1.5 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- PINNED ACTION BAR --- */}
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
            disabled={!selectedLight}
            className={`flex-[2] py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500
              ${selectedLight ? "bg-amber-400 text-amber-950 shadow-xl" : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"}
            `}
          >
            Confirm Setup
          </button>
        </div>
      </div>
    </div>
  );
}
