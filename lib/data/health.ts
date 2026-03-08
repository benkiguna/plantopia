import { createSimpleServerClient } from "@/lib/supabase/server";
import type { HealthEntry, HealthEntryInsert } from "@/types/database";

export async function getHealthTimeline(
  plantId: string,
  limit = 10
): Promise<HealthEntry[]> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("health_entries")
    .select("*")
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching health timeline:", error);
    throw new Error("Failed to fetch health timeline");
  }

  return (data ?? []) as HealthEntry[];
}

export async function getLatestHealthEntry(
  plantId: string
): Promise<HealthEntry | null> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("health_entries")
    .select("*")
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching latest health entry:", error);
    throw new Error("Failed to fetch latest health entry");
  }

  return data as HealthEntry;
}

export async function addHealthEntry(
  entry: HealthEntryInsert
): Promise<HealthEntry> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("health_entries")
    .insert(entry as never)
    .select()
    .single();

  if (error) {
    console.error("Error adding health entry:", error);
    throw new Error("Failed to add health entry");
  }

  return data as HealthEntry;
}

export async function getHealthEntry(entryId: string): Promise<HealthEntry | null> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("health_entries")
    .select("*")
    .eq("id", entryId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching health entry:", error);
    throw new Error("Failed to fetch health entry");
  }

  return data as HealthEntry;
}

export function calculateHealthTrend(
  entries: HealthEntry[]
): "improving" | "stable" | "declining" | null {
  if (entries.length < 2) return null;

  const latest = entries[0].health_score;
  const previous = entries[1].health_score;
  const diff = latest - previous;

  if (diff > 5) return "improving";
  if (diff < -5) return "declining";
  return "stable";
}

export function getHealthTrendDelta(entries: HealthEntry[]): number | null {
  if (entries.length < 2) return null;
  return entries[0].health_score - entries[1].health_score;
}
