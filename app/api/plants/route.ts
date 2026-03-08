import { NextRequest, NextResponse } from "next/server";
import { createPlant } from "@/lib/data";
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
      initialHealthScore = 75,
    } = body;

    if (!nickname || !photoUrl) {
      return NextResponse.json(
        { error: "Missing required fields: nickname, photoUrl" },
        { status: 400 }
      );
    }

    // Create the plant
    const plantData: PlantInsert = {
      user_id: MOCK_USER_ID,
      species_key: speciesKey || null,
      nickname,
      light_setup: lightSetup || "bright_indirect",
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
    return NextResponse.json(
      { error: "Failed to create plant" },
      { status: 500 }
    );
  }
}
