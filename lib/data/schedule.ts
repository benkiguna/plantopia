import { createSimpleServerClient } from "@/lib/supabase/server";
import { generateCareSchedule, CareSchedule, ScheduleItem } from "@/lib/utils/care-scheduling";
import type { PlantWithSpecies, CareLog } from "@/types/database";

export async function getScheduleForUser(userId: string): Promise<CareSchedule> {
  const supabase = createSimpleServerClient();

  // 1. Fetch plants with species
  const { data: plantsData, error: plantsError } = await supabase
    .from("plants")
    .select(`
      *,
      species (*)
    `)
    .eq("user_id", userId);

  if (plantsError) {
    console.error("Error fetching plants for schedule:", plantsError);
    throw new Error("Failed to fetch plants for schedule");
  }

  const plants = (plantsData as unknown) as PlantWithSpecies[];

  if (!plants || plants.length === 0) {
    return { overdue: [], today: [], thisWeek: [], later: [] };
  }

  // 2. Fetch care logs for all these plants
  const plantIds = plants.map((p) => p.id);
  const { data: logsData, error: logsError } = await supabase
    .from("care_logs")
    .select("*")
    .in("plant_id", plantIds);

  if (logsError) {
    console.error("Error fetching care logs for schedule:", logsError);
    throw new Error("Failed to fetch care logs");
  }

  const logs = (logsData as unknown) as CareLog[];

  // 3. Fetch latest health entries for thumbnails
  const { data: healthData, error: healthError } = await supabase
    .from("health_entries")
    .select("plant_id, photo_url")
    .in("plant_id", plantIds)
    .order("created_at", { ascending: false });

  if (healthError) {
    console.warn("Could not fetch health entries for thumbnails", healthError);
  }

  // Create a quick lookup for thumbnails
  const thumbnailMap = new Map<string, string>();
  if (healthData) {
    // Iterate in reverse since we ordered by created_at desc, keeping the latest one
    // Actually, we want the most recent, so since it's desc, the first one is newest
    for (const entry of healthData) {
      if (!thumbnailMap.has(entry.plant_id) && entry.photo_url) {
        thumbnailMap.set(entry.plant_id, entry.photo_url);
      }
    }
  }

  // 4. Generate the base schedule
  const baseSchedule = generateCareSchedule(plants, logs);

  // 5. Attach thumbnails
  const attachThumbnails = (items: ScheduleItem[]) => {
    return items.map(item => ({
      ...item,
      plant_photo_url: thumbnailMap.get(item.plant_id) || null
    }));
  };

  return {
    overdue: attachThumbnails(baseSchedule.overdue),
    today: attachThumbnails(baseSchedule.today),
    thisWeek: attachThumbnails(baseSchedule.thisWeek),
    later: attachThumbnails(baseSchedule.later)
  };
}

export async function logCareAction(plantId: string, action: string, notes?: string): Promise<CareLog> {
  const supabase = createSimpleServerClient();
  
  const { data, error } = await supabase
    .from("care_logs")
    .insert({
      plant_id: plantId,
      action,
      notes: notes || null
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error logging care action:", error);
    throw new Error("Failed to log care action");
  }
  
  return data as CareLog;
}
