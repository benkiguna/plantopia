import { NextRequest, NextResponse } from "next/server";
import { analyzeHealth } from "@/lib/ai";
import { getPlant, getHealthTimeline, updateHealthEntry, getHealthEntry } from "@/lib/data";
import { createSimpleServerClient } from "@/lib/supabase/server";
import type { HealthConcern } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { healthEntryId, plantId } = body;

    if (!healthEntryId || !plantId) {
      return NextResponse.json(
        { error: "Missing required fields: healthEntryId, plantId" },
        { status: 400 }
      );
    }

    // Get plant details
    const plant = await getPlant(plantId);
    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    // Get health entry
    const healthEntry = await getHealthEntry(healthEntryId);
    if (!healthEntry) {
      return NextResponse.json({ error: "Health entry not found" }, { status: 404 });
    }

    // Fetch the image from Supabase Storage
    const photoUrl = healthEntry.photo_url;
    let imageBase64: string;

    try {
      // The photo_url is a full URL to Supabase Storage
      const response = await fetch(photoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString("base64");
    } catch (fetchError) {
      console.error("Error fetching plant image:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch plant image from storage" },
        { status: 500 }
      );
    }

    // Get previous health history for context
    const healthTimeline = await getHealthTimeline(plantId, 3);
    const history = healthTimeline
      .filter((entry) => entry.id !== healthEntryId) // Exclude current entry
      .map((entry) => ({
        score: entry.health_score,
        date: new Date(entry.created_at).toLocaleDateString(),
        notes: entry.ai_notes,
      }));

    // Analyze health with detailed prompt
    const speciesName = plant.species?.name || "Unknown plant";
    const lightSetup = plant.light_setup || "bright_indirect";

    const analysis = await analyzeHealth(imageBase64, speciesName, lightSetup, history);

    // Convert concerns to issues format for backward compatibility
    const issues = analysis.concerns.map((concern: HealthConcern) => ({
      name: concern.issue,
      severity: concern.severity,
      recommendation: concern.recommendation,
    }));

    // Update the health entry with the analysis
    const updatedEntry = await updateHealthEntry(healthEntryId, {
      health_score: analysis.overall_score,
      ai_notes: analysis.summary,
      issues,
      analysis,
    });

    return NextResponse.json({
      healthEntry: updatedEntry,
      analysis,
    });
  } catch (error) {
    console.error("Error in /api/analyze/health:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to analyze plant health: ${errorMessage}` },
      { status: 500 }
    );
  }
}
