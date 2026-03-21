"use client";

import { useRef } from "react";
import { ArrowCounterClockwiseIcon, FlowerIcon } from "@phosphor-icons/react";

interface PhotoCaptureStepProps {
  onPhotoSelect: (file: File) => void;
  isLoading: boolean;
  photoPreviewUrl: string | null;
  isIdentified: boolean;
  onIdentify: () => void;
  onContinue: () => void;
  onRetake: () => void;
  onManualSearch: () => void;
}

export function PhotoCaptureStep({
  onPhotoSelect,
  isLoading,
  photoPreviewUrl,
  isIdentified,
  onIdentify,
  onContinue,
  onRetake,
  onManualSearch,
}: PhotoCaptureStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openCamera = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col w-full h-full animate-slide-up">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && onPhotoSelect(e.target.files[0])
        }
      />

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col items-center gap-4 overflow-hidden px-6 pt-4 pb-2 min-h-0">
        {/* Header */}
        <div className="text-center space-y-0.5 shrink-0">
          <h3 className="text-xl font-serif italic text-white/95 tracking-tight">
            {isIdentified ? "Plant Identified" : "Take a Photo"}
          </h3>
          <p className="text-[9px] text-white/30 tracking-[0.4em] uppercase font-body italic">
            {isIdentified
              ? "AI Bio-Identification Complete"
              : "AI Bio-Identification"}
          </p>
        </div>

        {/* Photo Card — fills remaining space */}
        <div className="relative w-full flex-1 min-h-0 rounded-[36px] overflow-hidden border border-white/10 bg-white/[0.02]">
          {photoPreviewUrl ? (
            <>
              <img
                src={photoPreviewUrl}
                className="w-full h-full object-cover"
                alt="Preview"
              />

              {/* Gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {/* Scanning animation overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Scan line */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div
                      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-glass-emerald to-transparent opacity-80"
                      style={{ animation: "scan 1.8s ease-in-out infinite" }}
                    />
                  </div>
                  {/* Corner brackets */}
                  <div className="relative w-28 h-28">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-glass-emerald rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-glass-emerald rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-glass-emerald rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-glass-emerald rounded-br-lg" />
                  </div>
                  <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.4em] text-glass-emerald/70">
                    Scanning…
                  </p>
                </div>
              )}

              {/* Identified badge — top center */}
              {isIdentified && !isLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-glass-emerald/30 backdrop-blur-md whitespace-nowrap">
                  <div className="w-1.5 h-1.5 rounded-full bg-glass-emerald shadow-[0_0_6px_rgba(74,222,128,0.9)]" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-glass-emerald">
                    Identified
                  </span>
                </div>
              )}

              {/* Icon actions — bottom-left of card */}
              {!isLoading && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {/* Retake */}
                  <button
                    onClick={onRetake}
                    className="w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-black/60 transition-all active:scale-90"
                    aria-label="Retake photo"
                  >
                    <ArrowCounterClockwiseIcon size={16} weight="bold" />
                  </button>

                  {/* Re-analyze — only when already identified */}
                  {isIdentified && (
                    <button
                      onClick={onIdentify}
                      className="w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-black/60 transition-all active:scale-90"
                      aria-label="Re-analyze"
                    >
                      <FlowerIcon size={16} weight="bold" />
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Empty state — full card is the tap target */
            <button
              onClick={openCamera}
              className="w-full h-full flex flex-col items-center justify-center gap-5"
            >
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.05] to-transparent rounded-t-[36px] pointer-events-none" />

              {/* Pulsing camera orb */}
              <div className="relative">
                <div className="absolute inset-0 bg-glass-emerald/15 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <svg
                    className="w-9 h-9 text-glass-emerald/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>

              <div className="text-center space-y-1.5 px-10">
                <p className="text-base font-serif italic text-white/70 tracking-tight">
                  Tap to photograph your plant
                </p>
                <p className="text-[8px] text-white/25 tracking-[0.35em] font-body uppercase">
                  or select from gallery
                </p>
              </div>

              {/* Tips at bottom of card */}
              <div className="absolute bottom-5 left-5 right-5 flex gap-2">
                {["Good lighting", "Show leaves clearly"].map((tip, i) => (
                  <div
                    key={i}
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="w-1 h-1 rounded-full bg-glass-emerald/50 shrink-0" />
                    <span className="text-[8px] uppercase tracking-[0.15em] text-white/25 font-medium truncate">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* --- PINNED ACTION BAR --- */}
      <div className="shrink-0 px-6 pb-6 pt-3 space-y-3">
        {photoPreviewUrl ? (
          <button
            onClick={isIdentified ? onContinue : onIdentify}
            disabled={isLoading}
            className="w-full py-3.5 bg-glass-emerald text-emerald-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-[0_8px_24px_rgba(74,222,128,0.25)] disabled:opacity-40 transition-all"
          >
            {isLoading
              ? "Analyzing…"
              : isIdentified
                ? "Continue"
                : "Identify Plant"}
          </button>
        ) : (
          <button
            onClick={openCamera}
            className="w-full py-3.5 bg-glass-emerald text-emerald-950 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-[0_8px_24px_rgba(74,222,128,0.25)]"
          >
            Open Camera
          </button>
        )}

        {/* Manual search — always available */}
        <button
          onClick={onManualSearch}
          disabled={isLoading}
          className="w-full py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/30 disabled:opacity-40 transition-all"
        >
          Search by Name
        </button>
      </div>
    </div>
  );
}
