"use client";

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
  const lightConfig = LIGHT_OPTIONS.find((l) => l.value === lightSetup);
  const lightLabel = lightConfig?.label || lightSetup;

  return (
    <div className="flex flex-col w-full h-full animate-slide-up">
      {/* HEADER */}
      <div className="text-center space-y-0.5 shrink-0 px-6 pt-4">
        <h2 className="text-2xl font-serif italic text-white/95 tracking-tight">
          Name your plant
        </h2>
        <p className="text-[9px] text-white/30 tracking-[0.4em] uppercase font-body">
          Give it a nickname to personalize it
        </p>
      </div>

      {/* CONTENT — no scroll, fits viewport */}
      <div className="flex-1 flex flex-col px-6 py-3 gap-3 min-h-0">
        {/* Name Input */}
        <input
          type="text"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder={selectedSpecies?.speciesName || "Plant nickname…"}
          className="w-full shrink-0 px-5 py-3.5 rounded-2xl border border-white/10 text-white font-serif italic text-lg placeholder:text-white/20 outline-none transition-all focus:border-white/25"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
        />

        {/* Preview Card */}
        <div
          className="flex-1 min-h-0 relative w-full rounded-[32px] overflow-hidden border border-white/5 flex flex-col"
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          {/* Photo */}
          <div className="relative flex-1 min-h-0 w-full overflow-hidden">
            {photoPreviewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoPreviewUrl}
                alt="Plant preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <span className="text-white/20 text-xs uppercase tracking-widest font-bold">No photo</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h4 className="text-xl font-serif italic text-white/95 leading-tight">
                {nickname || selectedSpecies?.speciesName || "Your Plant"}
              </h4>
              <p className="text-[10px] text-white/40 mt-0.5 font-body">
                {selectedSpecies?.speciesName}
              </p>
            </div>
          </div>

          {/* Info row */}
          <div className="shrink-0 p-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              {lightLabel && (
                <span
                  className="px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border"
                  style={{
                    backgroundColor: `${lightConfig?.color || "#4ade80"}18`,
                    borderColor: `${lightConfig?.color || "#4ade80"}35`,
                    color: lightConfig?.color || "#4ade80",
                  }}
                >
                  {lightLabel}
                </span>
              )}
            </div>
            {selectedSpecies && (
              <p className="text-[10px] text-white/35 leading-relaxed font-body">
                {selectedSpecies.careInfo.water}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PINNED ACTION BAR */}
      <div className="shrink-0 px-6 pb-6 pt-3">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40 disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={onConfirm}
            disabled={!nickname.trim() || isLoading}
            className={`flex-[2] py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${nickname.trim() && !isLoading
                ? "bg-glass-emerald text-emerald-950 shadow-[0_8px_24px_rgba(74,222,128,0.25)]"
                : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin" />
                Adding…
              </>
            ) : (
              "Add to Garden"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
