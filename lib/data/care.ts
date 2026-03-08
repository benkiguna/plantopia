import { createSimpleServerClient } from "@/lib/supabase/server";
import type { CareLog, CareLogInsert, Species } from "@/types/database";

export async function getCareLog(
  plantId: string,
  limit = 20
): Promise<CareLog[]> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("care_logs")
    .select("*")
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching care log:", error);
    throw new Error("Failed to fetch care log");
  }

  return (data ?? []) as CareLog[];
}

export async function addCareLog(entry: CareLogInsert): Promise<CareLog> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("care_logs")
    .insert(entry as never)
    .select()
    .single();

  if (error) {
    console.error("Error adding care log:", error);
    throw new Error("Failed to add care log");
  }

  return data as CareLog;
}

export async function getLastCareAction(
  plantId: string,
  action: string
): Promise<CareLog | null> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("care_logs")
    .select("*")
    .eq("plant_id", plantId)
    .eq("action", action)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching last care action:", error);
    throw new Error("Failed to fetch last care action");
  }

  return data as CareLog;
}

export function calculateNextCareDate(
  lastCareDate: Date | null,
  intervalDays: number
): Date {
  const baseDate = lastCareDate || new Date();
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
}

export function isDueSoon(nextCareDate: Date, thresholdDays = 1): boolean {
  const now = new Date();
  const diffMs = nextCareDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= thresholdDays;
}

export function isOverdue(nextCareDate: Date): boolean {
  return nextCareDate < new Date();
}

export interface CareSchedule {
  water: { lastDate: Date | null; nextDate: Date; isOverdue: boolean };
  fertilize: { lastDate: Date | null; nextDate: Date; isOverdue: boolean };
}

export async function getPlantCareSchedule(
  plantId: string,
  species: Species | null
): Promise<CareSchedule> {
  const waterDays = species?.water_days || 7;
  const fertilizeDays = species?.fertilize_days || 30;

  const [lastWater, lastFertilize] = await Promise.all([
    getLastCareAction(plantId, "water"),
    getLastCareAction(plantId, "fertilize"),
  ]);

  const lastWaterDate = lastWater ? new Date(lastWater.created_at) : null;
  const lastFertilizeDate = lastFertilize ? new Date(lastFertilize.created_at) : null;

  const nextWaterDate = calculateNextCareDate(lastWaterDate, waterDays);
  const nextFertilizeDate = calculateNextCareDate(lastFertilizeDate, fertilizeDays);

  return {
    water: {
      lastDate: lastWaterDate,
      nextDate: nextWaterDate,
      isOverdue: isOverdue(nextWaterDate),
    },
    fertilize: {
      lastDate: lastFertilizeDate,
      nextDate: nextFertilizeDate,
      isOverdue: isOverdue(nextFertilizeDate),
    },
  };
}
