"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { CareSchedule } from "@/lib/data/care";
import type { CareLog } from "@/types/database";
import { Drop, Flask, Wind, Sun } from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LIGHT_LABELS: Record<string, string> = {
  bright_direct: "Bright Direct",
  bright_indirect: "Bright Indirect",
  medium: "Medium",
  low: "Low",
  low_to_bright: "Low to Bright",
  low_to_bright_indirect: "Low to Bright Indirect",
  low_to_medium: "Low to Medium",
  medium_to_bright_indirect: "Medium to Bright Indirect",
  medium_indirect: "Medium Indirect",
};

function formatLightSetup(lightSetup: string): string {
  return (
    LIGHT_LABELS[lightSetup] ??
    lightSetup
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

function getDaysText(nextDateStr: Date | string): string {
  const diffTime = new Date(nextDateStr).getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tmrw";
  return `In ${diffDays}d`;
}

function getLastActionText(careLog: CareLog[], action: string): string {
  const entry = careLog.find((e) => e.action === action);
  if (!entry) return "Never logged";
  const diffDays = Math.floor((Date.now() - new Date(entry.created_at).getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

// ---------------------------------------------------------------------------
// Animated Icons
// ---------------------------------------------------------------------------

function WaterIcon({ isAnimating }: { isAnimating: boolean }) {
  return (
    <div className="relative w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center">
      <motion.div
        className="absolute inset-x-0 bottom-0 bg-sky"
        initial={{ height: 0 }}
        animate={isAnimating ? { height: "110%" } : { height: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      />
      <Drop weight="fill" className="w-5 h-5 text-white relative z-10" />
    </div>
  );
}

function FlaskIcon({ isAnimating }: { isAnimating: boolean }) {
  return (
    <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center">
      <motion.div
        animate={isAnimating ? { rotate: [0, -15, 4, 0] } : { rotate: 0 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      >
        <Flask weight="fill" className="w-5 h-5 text-white" />
      </motion.div>
    </div>
  );
}

function MistIcon() {
  return (
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
      <Wind weight="bold" className="w-5 h-5 text-white" />
    </div>
  );
}

function RotateIcon({ isAnimating }: { isAnimating: boolean }) {
  return (
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
      <motion.div
        animate={isAnimating ? { rotate: 90 } : { rotate: 0 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <Sun weight="bold" className="w-5 h-5 text-white" />
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card-level particle / vapor effects
// ---------------------------------------------------------------------------

const SPARKLE_POSITIONS = [
  { angle: 40, dist: 20 },
  { angle: 80, dist: 22 },
  { angle: 130, dist: 18 },
  { angle: 160, dist: 24 },
];

function SparkleParticles() {
  return (
    <>
      {SPARKLE_POSITIONS.map(({ angle, dist }, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber pointer-events-none"
            style={{ top: 28, left: 28 }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              scale: [0, 1.3, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.75, delay: i * 0.07, ease: "easeOut" }}
          />
        );
      })}
    </>
  );
}

const VAPOR_LINES = [
  { width: 12, offsetY: -5, delay: 0 },
  { width: 16, offsetY: 1, delay: 0.12 },
  { width: 10, offsetY: 7, delay: 0.22 },
];

function VaporLines() {
  return (
    <>
      {VAPOR_LINES.map((line, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-slate-300 pointer-events-none"
          style={{ width: line.width, height: 2, top: 28 + line.offsetY, left: 40 }}
          initial={{ x: 0, opacity: 0.85 }}
          animate={{ x: 26, opacity: 0 }}
          transition={{ duration: 0.65, delay: line.delay, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PendingUndo {
  action: string;
  label: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface QuickCareActionsProps {
  plantId: string;
  careSchedule: CareSchedule;
  lightSetup: string;
  careLog: CareLog[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuickCareActions({
  plantId,
  careSchedule,
  lightSetup,
  careLog,
}: QuickCareActionsProps) {
  const router = useRouter();

  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);

  const pendingUndoRef = useRef<PendingUndo | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    pendingUndoRef.current = pendingUndo;
  }, [pendingUndo]);

  const careActions = [
    {
      action: "water",
      label: "HYDRATION",
      stat: careSchedule.water ? getDaysText(careSchedule.water.nextDate) : "Unknown",
    },
    {
      action: "fertilize",
      label: "NUTRIENTS",
      stat: careSchedule.fertilize ? getDaysText(careSchedule.fertilize.nextDate) : "Unknown",
    },
    {
      action: "mist",
      label: "MIST",
      stat: getLastActionText(careLog, "mist"),
    },
    {
      action: "rotate",
      label: "ROTATE",
      stat: formatLightSetup(lightSetup),
    },
  ] as const;

  // ─── API commit ────────────────────────────────────────────────────────────

  const commitAction = async (action: string) => {
    try {
      const response = await fetch("/api/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantId, action }),
      });
      if (!response.ok) throw new Error("Failed to log care action");
      router.refresh();
    } catch {
      // silent — tile reverts naturally on next refresh
    }
  };

  // ─── Tile tap handler ──────────────────────────────────────────────────────

  const handleCareAction = (action: string, label: string) => {
    const existing = pendingUndoRef.current;
    if (existing) {
      clearTimeout(existing.timeoutId);
      setPendingUndo(null);
      void commitAction(existing.action);
    }

    // Trigger icon animation
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setActiveAnimation(action);
    animTimerRef.current = setTimeout(() => setActiveAnimation(null), 900);

    const timeoutId = setTimeout(() => {
      setPendingUndo(null);
      setSnackbarVisible(false);
      void commitAction(action);
    }, 5000);

    setPendingUndo({ action, label, timeoutId });
    setSnackbarVisible(true);
  };

  // ─── Undo ──────────────────────────────────────────────────────────────────

  const handleUndo = () => {
    if (!pendingUndo) return;
    clearTimeout(pendingUndo.timeoutId);
    setPendingUndo(null);
    setSnackbarVisible(false);
  };

  const isTileOverdue = (action: string) => {
    if (action === "water") return careSchedule.water?.isOverdue ?? false;
    if (action === "fertilize") return careSchedule.fertilize?.isOverdue ?? false;
    return false;
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const drainBarColor: Record<string, string> = {
    water: "bg-sky",
    fertilize: "bg-amber",
    mist: "bg-slate-300",
    rotate: "bg-yellow-300",
  };

  return (
    <div className="px-4 py-6 relative z-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {careActions.map(({ action, label, stat }) => {
          const isPending = pendingUndo?.action === action;
          const isAnimating = activeAnimation === action;
          const needsAttention = isTileOverdue(action);

          const iconBgClass = needsAttention
            ? "bg-coral text-white"
            : "bg-[#2A2D2C] text-white";

          return (
            <motion.button
              key={action}
              onClick={() => handleCareAction(action, label)}
              disabled={isPending}
              className={`relative flex flex-col items-start justify-between p-4 h-32 rounded-[32px] transition-colors backdrop-blur-md border overflow-hidden ${
                needsAttention
                  ? "bg-coral/10 border-coral/50 text-white"
                  : "bg-[#1A1C1B]/80 hover:bg-[#222524] border-white/5 text-white/50 hover:text-white"
              }`}
              animate={
                isAnimating && action === "water"
                  ? {
                      boxShadow: [
                        "0 10px 30px -10px rgba(0,0,0,0.5)",
                        "0 0 28px rgba(14,165,233,0.45)",
                        "0 10px 30px -10px rgba(0,0,0,0.5)",
                      ],
                    }
                  : { boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }
              }
              transition={{ duration: 0.7 }}
            >
              {/* ── Drain progress bar ────────────────────────────────────── */}
              <AnimatePresence>
                {isPending && (
                  <motion.div
                    key={String(pendingUndo!.timeoutId)}
                    className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${drainBarColor[action] ?? "bg-white"}`}
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                )}
              </AnimatePresence>

              {/* ── Animated icon ─────────────────────────────────────────── */}
              <div className={`${iconBgClass} rounded-2xl`}>
                {action === "water" ? (
                  <WaterIcon isAnimating={isAnimating} />
                ) : action === "fertilize" ? (
                  <FlaskIcon isAnimating={isAnimating} />
                ) : action === "mist" ? (
                  <MistIcon />
                ) : (
                  <RotateIcon isAnimating={isAnimating} />
                )}
              </div>

              {/* ── Card-level particle effects ───────────────────────────── */}
              <AnimatePresence>
                {isAnimating && action === "fertilize" && <SparkleParticles />}
                {isAnimating && action === "mist" && <VaporLines />}
              </AnimatePresence>

              {/* ── Label + stat ──────────────────────────────────────────── */}
              <div className="text-left mt-auto">
                <span
                  className={`text-[10px] font-mono tracking-widest block mb-1 ${
                    needsAttention ? "text-coral/70" : "opacity-70"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`text-sm font-bold block truncate ${
                    needsAttention ? "text-coral" : "text-white"
                  }`}
                >
                  {stat}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Snackbar ──────────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          snackbarVisible && pendingUndo
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-[#1A2A1E] border border-neon-emerald/20 rounded-full px-5 py-3 flex items-center gap-4 shadow-lg whitespace-nowrap">
          <span className="text-sm text-white/80">
            {pendingUndo
              ? `${pendingUndo.label.charAt(0)}${pendingUndo.label.slice(1).toLowerCase()} ✓`
              : ""}
          </span>
          <button
            onClick={handleUndo}
            className="text-neon-emerald text-sm font-bold hover:text-neon-emerald/80 transition-colors"
          >
            Undo
          </button>
        </div>
      </div>
    </div>
  );
}
