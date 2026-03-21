"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { compressImage } from "@/lib/utils";
import { Camera, Sparkle, X, CheckCircle } from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CheckInOverlayProps {
  plantId: string;
  previousScore?: number;
  children?: ReactNode;
  className?: string;
}

type OverlayState = "idle" | "analyzing" | "success" | "error";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseErrorMessage(err: unknown): string | null {
  if (!(err instanceof Error)) return "Analysis failed — try again in better lighting, closer to the plant";
  if (err.name === "AbortError") return null; // user cancelled — do nothing
  const msg = err.message.toLowerCase();
  if (msg.includes("network") || msg.includes("failed to fetch")) {
    return "Connection problem — check your signal and try again";
  }
  return "Analysis failed — try again in better lighting, closer to the plant";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckInOverlay({
  plantId,
  previousScore,
  children,
  className,
}: CheckInOverlayProps) {
  const router = useRouter();

  const [overlayState, setOverlayState] = useState<OverlayState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newScore, setNewScore] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------------------------------------------------------------------------
  // Close / cleanup
  // ---------------------------------------------------------------------------

  const closeOverlay = useCallback(() => {
    setOverlayState("idle");
    setErrorMessage(null);
    setNewScore(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  // ---------------------------------------------------------------------------
  // Cancel in-flight request
  // ---------------------------------------------------------------------------

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    closeOverlay();
  };

  // ---------------------------------------------------------------------------
  // File input trigger
  // ---------------------------------------------------------------------------

  const handleCaptureClick = () => {
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  // ---------------------------------------------------------------------------
  // File selected → compress → analyze
  // ---------------------------------------------------------------------------

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setOverlayState("analyzing");
    setErrorMessage(null);
    setNewScore(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const compressed = await compressImage(file);

      const response = await fetch("/api/analyze/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId,
          imageBase64: compressed.base64,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const data: { error?: string } = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to analyze photo");
      }

      const data: { health_score?: number } = await response.json().catch(() => ({}));
      if (typeof data.health_score === "number") {
        setNewScore(data.health_score);
      }

      setOverlayState("success");
      router.refresh();

      // Auto-close after 2 seconds
      setTimeout(() => {
        closeOverlay();
      }, 2000);
    } catch (err) {
      const message = parseErrorMessage(err);
      if (message === null) {
        // AbortError — user intentionally cancelled, overlay already closed
        return;
      }
      setErrorMessage(message);
      setOverlayState("error");
    } finally {
      abortControllerRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isOpen = overlayState !== "idle";

  return (
    <>
      {/* Hidden file input — no capture attribute so the native picker offers camera + library */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Trigger */}
      {children ? (
        <div onClick={handleCaptureClick} className={className ?? "w-full"}>
          {children}
        </div>
      ) : (
        <button
          onClick={handleCaptureClick}
          className="w-14 h-14 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center text-white bg-charcoal/40 hover:bg-white/10 transition-colors shadow-[0_0_20px_rgba(34,211,138,0.2)]"
          aria-label="Scan Plant"
        >
          <Camera weight="bold" className="w-5 h-5" />
        </button>
      )}

      {/* Full-screen overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* ----------------------------------------------------------------
              Background: blurred photo preview (analyzing) or plain dark (error/success)
          ----------------------------------------------------------------- */}
          {previewUrl && overlayState === "analyzing" ? (
            <>
              <Image
                src={previewUrl}
                alt="Plant photo preview"
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-charcoal/75 backdrop-blur-sm" />
            </>
          ) : (
            <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" />
          )}

          {/* ----------------------------------------------------------------
              Analyzing state
          ----------------------------------------------------------------- */}
          {overlayState === "analyzing" && (
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8">
              {/* Spinning ring + icon */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-neon-emerald/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-neon-emerald rounded-full border-t-transparent animate-spin" />
                <Sparkle weight="fill" className="w-8 h-8 text-neon-emerald animate-pulse" />
              </div>

              <h3 className="text-xl font-serif italic text-white">
                Analysing your plant&hellip;
              </h3>

              <p className="text-xs font-mono text-white/40 uppercase tracking-widest">
                This takes about 10 seconds
              </p>

              <button
                onClick={handleCancel}
                className="mt-2 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ----------------------------------------------------------------
              Success state
          ----------------------------------------------------------------- */}
          {overlayState === "success" && (
            <div className="relative z-10 flex flex-col items-center gap-5 text-center px-8">
              {/* Checkmark with a simple shrinking ring to hint auto-close */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Static outer ring */}
                <div className="absolute inset-0 border-4 border-neon-emerald/20 rounded-full" />
                {/* Animated shrinking progress ring using CSS animation */}
                <div className="absolute inset-0 border-4 border-neon-emerald rounded-full border-r-transparent border-b-transparent animate-[spin_2s_linear_forwards]" />
                <CheckCircle
                  weight="fill"
                  className="w-12 h-12 text-neon-emerald"
                />
              </div>

              <h3 className="text-xl font-serif italic text-white">
                Health check complete
              </h3>

              {newScore !== null && (
                <p className="text-2xl font-bold text-neon-emerald tabular-nums">
                  {previousScore !== undefined
                    ? `${previousScore} \u2192 ${newScore}`
                    : `${newScore}/100`}
                </p>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------------
              Error state
          ----------------------------------------------------------------- */}
          {overlayState === "error" && (
            <div className="relative z-10 bg-charcoal-light border border-neon-emerald/30 p-8 rounded-[32px] max-w-sm w-full text-center shadow-[0_0_40px_rgba(34,211,138,0.1)] mx-6">
              <div className="w-16 h-16 bg-coral/10 text-coral rounded-full flex items-center justify-center mx-auto mb-6">
                <X weight="bold" className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-display font-semibold text-white mb-2">
                Analysis Failed
              </h3>

              <p className="text-sm text-white/60 mb-6">{errorMessage}</p>

              <div className="flex gap-3">
                <button
                  onClick={closeOverlay}
                  className="flex-1 py-3 bg-white/5 text-white rounded-xl font-mono text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setOverlayState("idle");
                    // Small timeout so the overlay closes before the file picker opens
                    setTimeout(handleCaptureClick, 100);
                  }}
                  className="flex-1 py-3 bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/30 rounded-xl font-mono text-xs uppercase tracking-widest"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
