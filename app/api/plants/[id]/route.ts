import { NextRequest, NextResponse } from "next/server";
import { getPlant, updatePlant, deletePlant } from "@/lib/data";
import type { PlantUpdate } from "@/types/database";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const plant = await getPlant(id);

    if (!plant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    return NextResponse.json({ plant });
  } catch (error) {
    console.error("Error fetching plant:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch plant: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate plant exists
    const existingPlant = await getPlant(id);
    if (!existingPlant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    // Build update object with only allowed fields
    const updates: PlantUpdate = {};
    if (body.nickname !== undefined) updates.nickname = body.nickname;
    if (body.light_setup !== undefined) updates.light_setup = body.light_setup;
    if (body.location !== undefined) updates.location = body.location;
    if (body.pot_size !== undefined) updates.pot_size = body.pot_size;
    if (body.soil_type !== undefined) updates.soil_type = body.soil_type;
    if (body.species_key !== undefined) updates.species_key = body.species_key;

    const plant = await updatePlant(id, updates);

    return NextResponse.json({ plant });
  } catch (error) {
    console.error("Error updating plant:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to update plant: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate plant exists
    const existingPlant = await getPlant(id);
    if (!existingPlant) {
      return NextResponse.json({ error: "Plant not found" }, { status: 404 });
    }

    await deletePlant(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plant:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to delete plant: ${errorMessage}` },
      { status: 500 }
    );
  }
}
