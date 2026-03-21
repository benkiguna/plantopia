"use client";

import { Camera } from "@phosphor-icons/react";
import { CheckInOverlay } from "./CheckInOverlay";

interface CheckInButtonProps {
  plantId: string;
  previousScore: number;
}

export function CheckInButton({ plantId, previousScore }: CheckInButtonProps) {
  return (
    <CheckInOverlay plantId={plantId} previousScore={previousScore} className="self-end">
      <button
        type="button"
        className="w-8 h-8 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Check in plant health"
      >
        <Camera weight="bold" className="w-3.5 h-3.5" />
      </button>
    </CheckInOverlay>
  );
}
