"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckInOverlay } from "@/components/plant-detail/CheckInOverlay";
import { PottedPlant, Drop, Camera } from "@phosphor-icons/react";
import type { PlantWithLatestHealth } from "@/types/database";

interface PlantCardProps {
  plant: PlantWithLatestHealth;
  onWater?: () => void;
}

export function PlantCard({ plant, onWater }: PlantCardProps) {
  const healthScore = plant.latest_health_entry?.health_score ?? 75;
  const photoUrl = plant.latest_health_entry?.photo_url;
  const speciesName = plant.species?.name ?? "Unknown Species";

  return (
    <div className="bg-charcoal-light/60 backdrop-blur-md rounded-[32px] overflow-hidden border border-white/5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] mb-6 transition-all hover:border-white/10">
      <Link href={`/plant/${plant.id}`}>
        <div className="relative h-64 w-full bg-charcoal">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={plant.nickname}
              fill
              className="object-cover opacity-80 brightness-75 hover:brightness-90 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-emerald/40 to-charcoal flex items-center justify-center">
              <PottedPlant weight="fill" className="w-10 h-10 opacity-30 text-white" />
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-charcoal/20 to-charcoal"></div>

          <div className="absolute top-4 right-4">
            <div className="bg-charcoal/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse"></div>
              <span className="text-white font-mono text-xs font-bold">{healthScore}%</span>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-4xl font-display font-bold italic text-white tracking-tight leading-none mb-1">
              {plant.nickname}
            </h3>
            <p className="text-xs font-mono text-white/50 tracking-widest uppercase">{speciesName}</p>
          </div>
        </div>
      </Link>
      
      <div className="p-6 pt-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-mono tracking-widest uppercase text-white/60 border border-white/5">
            {plant.light_setup.replace(/_/g, " ")}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onWater}
            className="flex items-center justify-center gap-2 py-3 bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/20 rounded-2xl font-mono text-xs uppercase tracking-widest hover:bg-neon-emerald/20 transition-all active:scale-95"
          >
            <Drop weight="bold" className="w-4 h-4" /> Hydrate
          </button>
          
          <CheckInOverlay plantId={plant.id}>
            <button
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 text-white border border-white/5 rounded-2xl font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
            >
              <Camera weight="bold" className="w-4 h-4" /> Scan
            </button>
          </CheckInOverlay>
        </div>
      </div>
    </div>
  );
}
