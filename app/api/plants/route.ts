import { NextRequest, NextResponse } from "next/server";
import { createPlant, getSpecies } from "@/lib/data";
import { addHealthEntry } from "@/lib/data";
import { MOCK_USER_ID } from "@/lib/supabase/client";
import type { PlantInsert, HealthEntryInsert } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      speciesKey,
      nickname,
      lightSetup,
      photoUrl,
      lightPhotoUrl,
      lightAnalysis,
      initialHealthScore = 75,
    } = body;

    if (!nickname || !photoUrl) {
      return NextResponse.json(
        { error: "Missing required fields: nickname, photoUrl" },
        { status: 400 }
      );
    }

    // Validate species key exists in database, otherwise set to null
    let validatedSpeciesKey: string | null = null;
    if (speciesKey) {
      const species = await getSpecies(speciesKey);
      if (species) {
        validatedSpeciesKey = speciesKey;
      } else {
        console.log(`Species key "${speciesKey}" not found in database, setting to null`);
      }
    }

    // Create the plant
    const plantData: PlantInsert = {
      user_id: MOCK_USER_ID,
      species_key: validatedSpeciesKey,
      nickname,
      light_setup: lightSetup || "bright_indirect",
      light_photo_url: lightPhotoUrl || null,
      light_analysis: lightAnalysis || null,
    };

    const plant = await createPlant(plantData);

    // Create initial health entry with the photo
    const healthEntryData: HealthEntryInsert = {
      plant_id: plant.id,
      photo_url: photoUrl,
      health_score: initialHealthScore,
      ai_notes: "Initial photo from plant registration.",
      issues: [],
    };

    const healthEntry = await addHealthEntry(healthEntryData);

    return NextResponse.json({
      plant,
      healthEntry,
    });
  } catch (error) {
    console.error("Error in /api/plants:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create plant: ${errorMessage}` },
      { status: 500 }
    );
  }
}
