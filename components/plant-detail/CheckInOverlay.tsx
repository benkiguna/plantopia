"use client";

import { useState, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/utils";
import { Camera, Sparkle, X } from "@phosphor-icons/react";

interface CheckInOverlayProps {
  plantId: string;
  children?: ReactNode;
  className?: string;
}

export function CheckInOverlay({ plantId, children, className }: CheckInOverlayProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for hash or query change if we wanted to trigger it that way, 
  // but let's expose a global way or just wrap standard buttons.

  const handleCaptureClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOpen(true);
    setIsAnalyzing(true);
    setError(null);

    try {
      // 1. Compress
      const compressed = await compressImage(file);

      // 2. Upload and Analyze via our API
      // The old add flow used /api/plants, but for an existing plant, 
      // we need an endpoint to just add a health entry.
      // Wait, is there an endpoint for this?
      // Let's check api/analyze/health
      const response = await fetch("/api/analyze/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId,
          imageBase64: compressed.base64,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze photo");
      }

      // Success! Refresh the page to show new stats
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to analyze");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Trigger Button logic */}
      {children ? (
        <div onClick={handleCaptureClick} className={className || "w-full"}>
          {children}
        </div>
      ) : (
        <button
          onClick={handleCaptureClick}
          className="absolute top-20 right-6 w-14 h-14 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center text-white bg-charcoal/40 hover:bg-white/10 transition-colors z-20 shadow-[0_0_20px_rgba(34,211,138,0.2)]"
          aria-label="Scan Plant"
        >
          <Camera weight="bold" className="w-5 h-5" />
        </button>
      )}

      {/* Analyzing Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/90 backdrop-blur-sm p-6">
          <div className="bg-charcoal-light border border-neon-emerald/30 p-8 rounded-[32px] max-w-sm w-full text-center shadow-[0_0_40px_rgba(34,211,138,0.1)]">
            {isAnalyzing ? (
              <>
                <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-neon-emerald/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-neon-emerald rounded-full border-t-transparent animate-spin"></div>
                  <Sparkle weight="fill" className="w-8 h-8 text-neon-emerald animate-pulse" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2 italic">Scanning Subject</h3>
                <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
                  Analyzing leaf structures & vitality...
                </p>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 bg-coral/10 text-coral rounded-full flex items-center justify-center mx-auto mb-6">
                  <X weight="bold" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">Analysis Failed</h3>
                <p className="text-sm text-white/60 mb-6">{error}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 bg-white/5 text-white rounded-xl font-mono text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCaptureClick}
                    className="flex-1 py-3 bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/30 rounded-xl font-mono text-xs uppercase tracking-widest"
                  >
                    Try Again
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
