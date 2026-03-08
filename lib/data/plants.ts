import { createSimpleServerClient } from "@/lib/supabase/server";
import type {
  Plant,
  PlantInsert,
  PlantUpdate,
  PlantWithSpecies,
  PlantWithLatestHealth,
  HealthEntry,
  Species,
} from "@/types/database";

export async function getPlants(userId: string): Promise<PlantWithLatestHealth[]> {
  const supabase = createSimpleServerClient();

  // Get plants with species info
  const { data: plants, error } = await supabase
    .from("plants")
    .select(`
      *,
      species (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching plants:", error);
    throw new Error("Failed to fetch plants");
  }

  // Get latest health entry for each plant
  const plantsWithHealth: PlantWithLatestHealth[] = await Promise.all(
    ((plants ?? []) as Array<Plant & { species: Species | null }>).map(async (plant) => {
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

  return plantsWithHealth;
}

export async function getPlant(plantId: string): Promise<PlantWithSpecies | null> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("plants")
    .select(`
      *,
      species (*)
    `)
    .eq("id", plantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching plant:", error);
    throw new Error("Failed to fetch plant");
  }

  const plantData = data as Plant & { species: Species | null };
  return {
    ...plantData,
    species: plantData.species,
  };
}

export async function createPlant(plant: PlantInsert): Promise<Plant> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("plants")
    .insert(plant as never)
    .select()
    .single();

  if (error) {
    console.error("Error creating plant:", error);
    throw new Error(`Failed to create plant: ${error.message}`);
  }

  return data as Plant;
}

export async function updatePlant(
  plantId: string,
  updates: PlantUpdate
): Promise<Plant> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("plants")
    .update(updates as never)
    .eq("id", plantId)
    .select()
    .single();

  if (error) {
    console.error("Error updating plant:", error);
    throw new Error("Failed to update plant");
  }

  return data as Plant;
}

export async function deletePlant(plantId: string): Promise<void> {
  const supabase = createSimpleServerClient();

  const { error } = await supabase
    .from("plants")
    .delete()
    .eq("id", plantId);

  if (error) {
    console.error("Error deleting plant:", error);
    throw new Error("Failed to delete plant");
  }
}
