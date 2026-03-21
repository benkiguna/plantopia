import { createSimpleServerClient } from "@/lib/supabase/server";
import type { Species, Database } from "@/types/database";

export async function getAllSpecies(): Promise<Species[]> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("species")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching species:", error);
    throw new Error("Failed to fetch species");
  }

  return (data ?? []) as Species[];
}

export async function getSpecies(key: string): Promise<Species | null> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("species")
    .select("*")
    .eq("key", key)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching species:", error);
    throw new Error("Failed to fetch species");
  }

  return data as Species;
}

export async function searchSpecies(query: string): Promise<Species[]> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("species")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error searching species:", error);
    throw new Error("Failed to search species");
  }

  return (data ?? []) as Species[];
}

export async function createSpecies(
  speciesData: Database["public"]["Tables"]["species"]["Insert"]
): Promise<Species> {
  const supabase = createSimpleServerClient();

  const { data, error } = await supabase
    .from("species")
    .insert(speciesData)
    .select()
    .single();

  if (error) {
    console.error("Error creating species:", error);
    throw new Error("Failed to create species");
  }

  return data as Species;
}
