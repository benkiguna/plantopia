"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlantCard } from "./PlantCard";
import { ActionButton } from "@/components/ui";
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

  const handleFeed = async (plantId: string) => {
    try {
      const supabase = createBrowserClient();
      await supabase.from("care_logs").insert({
        plant_id: plantId,
        action: "fertilize",
      });
    } catch (error) {
      console.error("Error logging feed:", error);
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
        <div className="flex justify-between bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 bg-forest/10 rounded mx-auto mb-1" />
            <div className="w-12 h-3 bg-forest/10 rounded mx-auto" />
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-forest/10 rounded mx-auto mb-1" />
            <div className="w-12 h-3 bg-forest/10 rounded mx-auto" />
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-forest/10 rounded mx-auto mb-1" />
            <div className="w-12 h-3 bg-forest/10 rounded mx-auto" />
          </div>
        </div>

        {/* Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-forest/10" />
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <div className="w-20 h-6 bg-forest/10 rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-8 bg-forest/10 rounded-full" />
              <div className="w-16 h-8 bg-forest/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Stats Strip */}
      <div className="flex justify-between bg-white rounded-xl p-4 shadow-sm">
        <div className="text-center">
          <p className="text-2xl font-display font-semibold text-forest">
            {totalPlants}
          </p>
          <p className="text-xs text-forest/60">Plants</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-semibold text-green">
            {totalPlants > 0 ? `${avgHealth}%` : "--"}
          </p>
          <p className="text-xs text-forest/60">Avg Health</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display font-semibold text-amber">
            {needsCare}
          </p>
          <p className="text-xs text-forest/60">Need Care</p>
        </div>
      </div>

      {plants.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-32 h-32 mb-6 bg-green-light/20 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-16 h-16 text-green"
            >
              <path d="M12 2L2 7v15h20V7L12 2z" />
              <path d="M12 22V12" />
              <path d="M12 12L2 7" />
              <path d="M12 12l10-5" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-forest mb-2">
            Your garden is empty
          </h2>
          <p className="text-forest/60 mb-6 max-w-xs">
            Add your first plant to start tracking its health and get
            personalized care reminders.
          </p>
          <Link href="/add">
            <ActionButton variant="primary" size="lg">
              Add Your First Plant
            </ActionButton>
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
              onFeed={() => handleFeed(plant.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
