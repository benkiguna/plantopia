import { NextRequest, NextResponse } from "next/server";
import { createPlant, getSpecies, createSpecies } from "@/lib/data";
import { addHealthEntry } from "@/lib/data";
import { analyzeHealth } from "@/lib/ai";
import { MOCK_USER_ID } from "@/lib/supabase/client";
import type { PlantInsert, HealthEntryInsert, HealthConcern, Json } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      speciesKey,
      speciesName,
      careInfo,
      nickname,
      lightSetup,
      photoUrl,
      photoBase64,
      lightPhotoUrl,
      lightAnalysis,
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
      } else if (careInfo) {
        try {
          // Parse water days from string like "Every 7-10 days"
          const waterDaysMatch = careInfo.water?.match(/\d+/);
          const waterDays = waterDaysMatch ? parseInt(waterDaysMatch[0], 10) : 7;
          
          console.log(`Creating new species: ${speciesKey}`);
          const newSpecies = await createSpecies({
            key: speciesKey,
            name: speciesName || speciesKey.replace(/_/g, " "),
            water_days: waterDays,
            light: careInfo.light || "Medium",
            humidity: careInfo.humidity || "Medium",
            fertilize_days: 30, // sensible default
          });
          validatedSpeciesKey = newSpecies.key;
        } catch (createErr) {
          console.error(`Failed to create new species "${speciesKey}", setting to null`, createErr);
        }
      } else {
        console.log(`Species key "${speciesKey}" not found in database and no careInfo provided, setting to null`);
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

    // Perform detailed health analysis on the initial photo
    let healthScore = 75;
    let aiNotes = "Initial photo from plant registration.";
    let issues: Array<{ name: string; severity: string; recommendation: string }> = [];
    let analysis = null;

    if (photoBase64) {
      try {
        console.log("Performing initial health analysis...");
        const plantSpeciesName = speciesName || "Unknown plant";
        const plantLightSetup = lightSetup || "bright_indirect";

        const healthAnalysis = await analyzeHealth(
          photoBase64,
          plantSpeciesName,
          plantLightSetup,
          [] // No history for new plant
        );

        healthScore = healthAnalysis.overall_score;
        aiNotes = healthAnalysis.summary;
        issues = healthAnalysis.concerns.map((concern: HealthConcern) => ({
          name: concern.issue,
          severity: concern.severity,
          recommendation: concern.recommendation,
        }));
        analysis = healthAnalysis;

        console.log("Initial health analysis complete:", healthScore);
      } catch (analysisError) {
        console.error("Health analysis failed, using defaults:", analysisError);
        // Continue with default values if analysis fails
      }
    }

    // Create initial health entry with the photo and analysis
    const healthEntryData: HealthEntryInsert = {
      plant_id: plant.id,
      photo_url: photoUrl,
      health_score: healthScore,
      ai_notes: aiNotes,
      issues,
      analysis: analysis as Json | null,
    };

    const healthEntry = await addHealthEntry(healthEntryData);

    return NextResponse.json({
      plant,
      healthEntry,
      analysis,
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
