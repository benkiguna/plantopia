"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PottedPlant } from "@phosphor-icons/react";
import { PlantCard } from "./PlantCard";
import type { PlantWithLatestHealth, Plant, Species, HealthEntry } from "@/types/database";
import { MOCK_USER_ID, createBrowserClient } from "@/lib/supabase";

export function GardenView() {
  const [plants, setPlants] = useState<PlantWithLatestHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlants = useCallback(async () => {
    try {
      const supabase = createBrowserClient();

      // Fetch plants with species
      const { data: plantsData, error } = await supabase
        .from("plants")
        .select(`
          *,
          species (*)
        `)
        .eq("user_id", MOCK_USER_ID)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch latest health entry for each plant
      const typedPlants = (plantsData || []) as Array<Plant & { species: Species | null }>;
      const plantsWithHealth: PlantWithLatestHealth[] = await Promise.all(
        typedPlants.map(async (plant) => {
          const { data: healthEntries } = await supabase
            .from("health_entries")
            .select("*")
            .eq("plant_id", plant.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...plant,
            species: plant.species,
            latest_health_entry: (healthEntries as HealthEntry[] | null)?.[0] ?? null,
          };
        })
      );

      setPlants(plantsWithHealth);
    } catch (error) {
      console.error("Error fetching plants:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const handleWater = async (plantId: string) => {
    try {
      const supabase = createBrowserClient();
      await supabase.from("care_logs").insert({
        plant_id: plantId,
        action: "water",
      });
      // Could add optimistic UI update here
    } catch (error) {
      console.error("Error logging water:", error);
    }
  };

  // Calculate stats
  const totalPlants = plants.length;
  const avgHealth =
    totalPlants > 0
      ? Math.round(
          plants.reduce(
            (sum, p) => sum + (p.latest_health_entry?.health_score ?? 75),
            0
          ) / totalPlants
        )
      : 0;
  const needsCare = 0; // Will implement with care schedule later

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-6">
        {/* Stats Skeleton */}
        <div className="flex justify-between bg-charcoal-light/60 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] border border-white/5 animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 bg-white/10 rounded mx-auto mb-1" />
            <div className="w-12 h-3 bg-white/10 rounded mx-auto" />
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-white/10 rounded mx-auto mb-1" />
            <div className="w-12 h-3 bg-white/10 rounded mx-auto" />
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-white/10 rounded mx-auto mb-1" />
            <div className="w-12 h-3 bg-white/10 rounded mx-auto" />
          </div>
        </div>

        {/* Card Skeleton */}
        <div className="bg-charcoal-light/60 border border-white/5 rounded-[32px] overflow-hidden animate-pulse">
          <div className="h-64 bg-white/5" />
          <div className="p-6 pt-2 space-y-4">
            <div className="flex gap-2">
              <div className="w-20 h-6 bg-white/10 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-white/5 rounded-2xl" />
              <div className="h-12 bg-white/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Stats Strip */}
      <div className="flex justify-between bg-charcoal-light/60 backdrop-blur-md rounded-[24px] p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)] border border-white/5 mb-8">
        <div className="text-center">
          <p className="text-4xl font-display font-semibold text-white">
            {totalPlants}
          </p>
          <p className="text-[10px] font-mono tracking-widest uppercase text-white/50 mt-1">Plants</p>
        </div>
        
        <div className="w-[1px] bg-white/10" />
        
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center">
            <p className="text-4xl font-display font-semibold text-neon-emerald">
              {totalPlants > 0 ? `${avgHealth}%` : "--"}
            </p>
          </div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-neon-emerald/80 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse"></span>
            Avg Health
          </p>
        </div>
        
        <div className="w-[1px] bg-white/10" />
        
        <div className="text-center">
          <p className="text-4xl font-display font-semibold text-coral">
            {needsCare}
          </p>
          <p className="text-[10px] font-mono tracking-widest uppercase text-coral/80 mt-1">Need Care</p>
        </div>
      </div>

      {plants.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-neon-emerald/20 blur-2xl rounded-full"></div>
            <div className="w-24 h-24 bg-charcoal-light border border-neon-emerald/30 shadow-[0_0_30px_-5px_var(--color-neon-emerald)] rounded-full flex items-center justify-center relative z-10">
              <PottedPlant weight="fill" className="w-10 h-10 opacity-80 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-semibold text-white mb-2 italic tracking-tight">
            Your garden is empty
          </h2>
          <p className="text-white/50 mb-8 max-w-xs font-mono text-[10px] uppercase tracking-widest leading-relaxed">
            Initialize your first active specimen to begin health tracking.
          </p>
          <Link href="/add">
            <button className="px-8 py-4 bg-neon-emerald text-charcoal font-mono text-xs font-bold uppercase tracking-widest rounded-full hover:brightness-110 hover:shadow-[0_0_20px_rgba(34,211,138,0.4)] transition-all active:scale-95">
              ADD SPECIMEN -&gt;
            </button>
          </Link>
        </div>
      ) : (
        /* Plant Cards */
        <div className="space-y-4">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onWater={() => handleWater(plant.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
