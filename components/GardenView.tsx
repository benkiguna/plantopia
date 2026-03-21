"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PottedPlant, Sun } from "@phosphor-icons/react";
import { PlantCard } from "./PlantCard";
import { GardenPulseHeader } from "./GardenPulseHeader";
import type {
  PlantWithLatestHealth,
  Plant,
  Species,
  HealthEntry,
} from "@/types/database";
import { createBrowserClient } from "@/lib/supabase";

export function GardenView() {
  const [plants, setPlants] = useState<PlantWithLatestHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchPlants = useCallback(async () => {
    try {
      const supabase = createBrowserClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: plantsData, error } = await supabase
        .from("plants")
        .select(
          `
          *,
          species (*)
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedPlants = (plantsData || []) as Array<
        Plant & { species: Species | null }
      >;
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
            latest_health_entry:
              (healthEntries as HealthEntry[] | null)?.[0] ?? null,
          };
        }),
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
            0,
          ) / totalPlants,
        )
      : 0;
  const alerts = plants.filter(
    (p) => (p.latest_health_entry?.health_score ?? 75) < 50,
  ).length;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {/* Header row — title left, + button right */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <div>
            <div className="w-24 h-2.5 bg-white/10 rounded mb-2" />
            <div className="w-36 h-8 bg-white/10 rounded" />
          </div>
          <div className="w-11 h-11 rounded-full bg-white/10" />
        </div>

        {/* GardenPulseHeader skeleton — wide asymmetric card approximation */}
        <div className="px-[10px] mb-1" style={{ aspectRatio: "644 / 245" }}>
          <div className="w-full h-full rounded-[32px] bg-white/8 border border-white/10 flex items-center justify-around px-6">
            {/* Left — plants count */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-12 bg-white/10 rounded" />
              <div className="w-12 h-2 bg-white/10 rounded" />
            </div>
            {/* Center — health ring */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-4 border-white/10 bg-transparent" />
              <div className="w-16 h-2 bg-white/10 rounded" />
            </div>
            {/* Right — alerts */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-12 bg-white/10 rounded" />
              <div className="w-12 h-2 bg-white/10 rounded" />
            </div>
          </div>
        </div>

        {/* Plant card skeletons */}
        <div className="px-4 pb-24 space-y-4 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="relative h-60 w-full bg-white/5">
                {/* Health badge — top left */}
                <div className="absolute top-3 left-3 w-28 h-6 bg-white/10 rounded-full" />
                {/* Three-dot — top right */}
                <div className="absolute top-3 right-3 w-6 h-6 bg-white/10 rounded-full" />
                {/* Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div className="space-y-1.5">
                    <div className="w-32 h-5 bg-white/10 rounded" />
                    <div className="w-20 h-3 bg-white/10 rounded" />
                  </div>
                  <div className="w-20 h-6 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ── Sun ambient light leak — top, 100px from right ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -60,
          right: 20,
          width: 480,
          height: 480,
          background:
            "radial-gradient(circle, rgb(255 220 80 / 11%) 0%, rgb(251 191 36 / 5%) 40%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: -20,
          right: 78,
          width: 220,
          height: 220,
          background:
            "radial-gradient(circle, rgb(255 220 80 / 11%) 0%, rgb(251 191 36 / 5%) 40%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      {/* ── Sun icon — 100px from right ── */}
      <motion.div
        className="absolute z-10"
        style={{ top: 22, right: 100 }}
        initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          style={{
            filter:
              "drop-shadow(0 0 8px rgba(251,191,36,0.95)) drop-shadow(0 0 20px rgba(251,160,0,0.6)) drop-shadow(0 0 40px rgba(251,140,0,0.3))",
          }}
        >
          <Sun weight="fill" size={44} color="rgba(251,213,100,0.95)" />
        </motion.div>
      </motion.div>

      {/* Welcome header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2 relative z-[1]">
        <div>
          <p className="font-sans text-[11px] text-white/50 tracking-[0.12em] uppercase">
            Welcome Back
          </p>
          <h1 className="font-serif text-[32px] font-bold text-text-light leading-tight">
            My Garden
          </h1>
        </div>
        <button
          onClick={() => router.push("/add")}
          className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 text-white/70 hover:bg-white/5 transition-colors active:scale-95"
          aria-label="Add plant"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <GardenPulseHeader
        totalPlants={totalPlants}
        avgHealth={avgHealth}
        alerts={alerts}
      />

      <div className="px-4 pb-24 space-y-4">
        {plants.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-glass-emerald/15 blur-2xl rounded-full" />
              <div className="w-20 h-20 glass-card flex items-center justify-center rounded-full">
                <PottedPlant
                  weight="fill"
                  className="w-10 h-10 opacity-60 text-text-light"
                />
              </div>
            </div>
            <h2 className="font-serif text-[24px] font-bold text-text-light mb-2">
              Your garden is empty
            </h2>
            <p className="font-sans text-[12px] text-text-muted mb-8 max-w-xs">
              Add your first plant to begin tracking its health and care
              schedule.
            </p>
            <Link href="/add">
              <button className="px-8 py-3.5 bg-glass-emerald text-bg-dark font-sans text-[12px] font-bold uppercase tracking-[0.1em] rounded-full hover:brightness-110 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all active:scale-95">
                Add First Plant
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
    </div>
  );
}
