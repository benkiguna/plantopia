"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Warning, Camera } from "@phosphor-icons/react";
import { CheckInOverlay } from "./CheckInOverlay";

interface PlantActionRowProps {
  plantId: string;
  previousScore: number;
  healthScore: number;
  hasIssues: boolean;
}

export function PlantActionRow({
  plantId,
  previousScore,
  healthScore,
  hasIssues,
}: PlantActionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const showWarning = healthScore < 60 || hasIssues;
  const warningDetail =
    healthScore < 60
      ? `Health score is ${healthScore} — check the Health tab for details`
      : "Active issues detected — see the Health tab for recommendations";

  return (
    <div className="mx-4 mt-3">
      {/* Icon row */}
      <div className="flex items-center justify-between">

        {/* Left: warning icon — tappable to expand */}
        {showWarning ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2.5 min-w-0"
            aria-expanded={expanded}
          >
            <div className="w-9 h-9 rounded-full bg-coral/15 border border-coral/25 flex items-center justify-center shrink-0">
              <Warning weight="fill" className="w-4 h-4 text-coral" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-coral truncate">
                Needs attention
              </span>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-coral/50 text-[10px] shrink-0"
              >
                ▾
              </motion.span>
            </div>
          </button>
        ) : (
          /* Spacer so camera stays right-aligned when no warning */
          <div />
        )}

        {/* Right: camera check-in button */}
        <CheckInOverlay plantId={plantId} previousScore={previousScore} className="shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Check in plant health"
          >
            <Camera weight="bold" className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
              Check In
            </span>
          </button>
        </CheckInOverlay>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && showWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-xs text-white/50 leading-relaxed pt-2 pl-11">
              {warningDetail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
