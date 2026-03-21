"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PottedPlant } from "@phosphor-icons/react";
import type { PlantWithLatestHealth } from "@/types/database";

interface PlantCardProps {
  plant: PlantWithLatestHealth;
  onWater?: () => void;
}

function getHealthColor(score: number): string {
  if (score >= 80) return "text-glass-emerald";
  if (score >= 60) return "text-warning-gold";
  return "text-alert-red";
}

function getHealthBgGlow(score: number): string {
  if (score >= 80)
    return "bg-glass-emerald/15 shadow-[0_0_12px_rgba(74,222,128,0.2)]";
  if (score >= 60)
    return "bg-warning-gold/15 shadow-[0_0_12px_rgba(250,204,21,0.2)]";
  return "bg-alert-red/15 shadow-[0_0_12px_rgba(248,113,113,0.2)]";
}

function getHealthLabel(score: number): string {
  if (score >= 80) return "HEALTHY";
  if (score >= 60) return "FAIR";
  return "ATTENTION NEEDED";
}

function getLightLabel(lightSetup: string): {
  label: string;
  icon: React.ReactNode;
} {
  if (lightSetup.includes("direct") || lightSetup.includes("full")) {
    return {
      label: "Full Sun",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-warning-gold/70"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
        </svg>
      ),
    };
  }
  if (lightSetup.includes("partial") || lightSetup.includes("indirect")) {
    return {
      label: "Partial",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-warning-gold/50"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 4v1M18.36 5.64l-.71.71M20 12h-1M18.36 18.36l-.71-.71M12 19v1M5.64 18.36l.71-.71M4 12h1M5.64 5.64l.71.71" />
        </svg>
      ),
    };
  }
  return {
    label: "Low Light",
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-text-muted/50"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  };
}

export function LightIndicatorCoin() {
  // This SVG path defines the specific 'scooped' top-left corner
  const COIN_SHAPE =
    "M0,40 C0,15 15,0 40,0 L80,0 C102,0 120,18 120,40 L120,80 C120,102 102,120 80,120 L40,120 C18,120 0,102 0,80 Z";

  return (
    <div className="relative group">
      {/* 1. OUTER GLOW: Adds the soft amber radiance behind the coin */}
      <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* 2. THE GLASS COIN */}
      <div
        className="relative w-[120px] h-[120px] border border-white/10 flex flex-col items-center justify-center gap-1"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(24px) saturate(180%)",
          clipPath: `path('${COIN_SHAPE}')`, // The organic curve
        }}
      >
        {/* 3. THE ICON: With specular glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400/40 blur-lg rounded-full" />
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            className="relative z-10 drop-shadow-[0_0_8px_rgba(255,213,128,0.8)]"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        </div>

        {/* 4. TYPOGRAPHY */}
        <p className="text-[10px] font-sans font-bold text-gray-400 tracking-widest uppercase">
          Full Sun
        </p>
      </div>
    </div>
  );
}

export function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  const healthScore = plant.latest_health_entry?.health_score ?? 75;
  const photoUrl = plant.latest_health_entry?.photo_url;
  const speciesName = plant.species?.name ?? "Unknown Species";
  const lightSetup = plant.light_setup?.replace(/_/g, " ") ?? "indirect light";
  const light = getLightLabel(lightSetup);

  return (
    <motion.div
      className="glass-card mb-4 overflow-hidden cursor-pointer group"
      onClick={() => router.push(`/plant/${plant.id}`)}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.15 }}
    >
        {/* Photo area */}
        <motion.div
          layoutId={`plant-photo-${plant.id}`}
          className="relative h-60 w-full bg-slate-gray"
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={plant.nickname}
              fill
              className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-gray to-bg-dark flex items-center justify-center">
              <PottedPlant
                weight="fill"
                className="w-12 h-12 opacity-20 text-white"
              />
            </div>
          )}

          {/* Gradient overlay — stronger at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Health Badge - top left */}
          <div className="absolute top-3 left-3">
            <div
              className={`rounded-full px-2.5 py-1 backdrop-blur-md border border-white/10 flex items-center gap-1.5 ${getHealthBgGlow(healthScore)}`}
            >
              <span
                className={`font-sans text-[10px] font-semibold tracking-[0.05em] ${getHealthColor(healthScore)}`}
              >
                {healthScore}% {getHealthLabel(healthScore)}
              </span>
            </div>
          </div>

          {/* Three-dot menu - top right */}
          <div className="absolute top-3 right-3">
            <button
              className="p-2 text-white/40 hover:text-white/70 transition-colors"
              aria-label="Plant options"
              onClick={(e) => e.preventDefault()}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
            {/* Plant name + species */}
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="font-serif text-[22px] font-bold text-white leading-tight mb-0.5 truncate">
                {plant.nickname}
              </h3>
              <p className="font-sans text-[11px] text-white/50 italic tracking-[0.02em] truncate">
                {speciesName}
              </p>
            </div>

            {/* Light badge */}
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm rounded-full px-2.5 py-1.5 border border-white/10 shrink-0">
              {light.icon}
              <span className="font-sans text-[10px] text-white/70 tracking-[0.05em]">
                {light.label}
              </span>
            </div>
          </div>
        </motion.div>
    </motion.div>
  );
}
