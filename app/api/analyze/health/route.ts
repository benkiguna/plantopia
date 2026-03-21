import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { analyzeHealth } from "@/lib/ai";
import {
  getPlant,
  getHealthTimeline,
  updateHealthEntry,
  getHealthEntry,
  addHealthEntry,
} from "@/lib/data";
import { createSimpleServerClient } from "@/lib/supabase/server";
import { MOCK_USER_ID } from "@/lib/supabase/client";
import type { HealthConcern } from "@/types/database";

const BUCKET = "plant-photos";

// Upload a base64 image to Supabase Storage and return the public URL
async function uploadPhoto(base64: string, plantId: string, userId: string): Promise<string> {
  const supabase = createSimpleServerClient();
  const buffer = Buffer.from(base64, "base64");
  const filename = `${userId}/${plantId}/${Date.now()}.jpg`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType: "image/jpeg", upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plantId, imageBase64, healthEntryId } = body as {
      plantId?: string;
      imageBase64?: string;
      healthEntryId?: string;
    };

    if (!plantId) {
      return NextResponse.json({ error: "Missing required field: plantId" }, { status: 400 });
    }

    // ── Get plant ────────────────────────────────────────────────────────────
    const plant = await getPlant(plantId);
    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    const speciesName = plant.species?.name ?? "Unknown plant";
    const lightSetup = plant.light_setup ?? "bright_indirect";

    let imageBase64ForAnalysis: string;
    let entryId: string;

    // ── Branch: new check-in vs re-analyze ──────────────────────────────────
    if (imageBase64) {
      // NEW CHECK-IN — upload photo, create entry, then analyze

      const photoUrl = await uploadPhoto(imageBase64, plantId, MOCK_USER_ID);

      // Create a health entry with a placeholder score; we'll update after analysis
      const newEntry = await addHealthEntry({
        plant_id: plantId,
        photo_url: photoUrl,
        health_score: 75,
        issues: [],
      });

      entryId = newEntry.id;
      imageBase64ForAnalysis = imageBase64;

    } else if (healthEntryId) {
      // RE-ANALYZE — fetch the existing entry's stored photo
      const healthEntry = await getHealthEntry(healthEntryId);
      if (!healthEntry) {
        return NextResponse.json({ error: "Health entry not found" }, { status: 404 });
      }

      const response = await fetch(healthEntry.photo_url);
      if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch plant image" }, { status: 500 });
      }
      imageBase64ForAnalysis = Buffer.from(await response.arrayBuffer()).toString("base64");
      entryId = healthEntryId;

    } else {
      return NextResponse.json(
        { error: "Provide either imageBase64 (new check-in) or healthEntryId (re-analyze)" },
        { status: 400 }
      );
    }

    // ── Analyze ──────────────────────────────────────────────────────────────
    const healthTimeline = await getHealthTimeline(plantId, 3);
    const history = healthTimeline
      .filter((e) => e.id !== entryId)
      .map((e) => ({
        score: e.health_score,
        date: new Date(e.created_at).toLocaleDateString(),
        notes: e.ai_notes,
      }));

    const analysis = await analyzeHealth(imageBase64ForAnalysis, speciesName, lightSetup, history);

    const issues = analysis.concerns.map((concern: HealthConcern) => ({
      name: concern.issue,
      severity: concern.severity,
      recommendation: concern.recommendation,
    }));

    const updatedEntry = await updateHealthEntry(entryId, {
      health_score: analysis.overall_score,
      ai_notes: analysis.summary,
      issues,
      analysis,
    });

    // Invalidate the plant detail page so router.refresh() gets fresh data
    revalidatePath(`/plant/${plantId}`);

    return NextResponse.json({
      health_score: analysis.overall_score,
      healthEntry: updatedEntry,
      analysis,
    });

  } catch (error) {
    console.error("Error in /api/analyze/health:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to analyze plant health: ${message}` }, { status: 500 });
  }
}
