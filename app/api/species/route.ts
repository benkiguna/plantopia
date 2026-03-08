import { NextRequest, NextResponse } from "next/server";
import { getAllSpecies, searchSpecies } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    const species = query ? await searchSpecies(query) : await getAllSpecies();

    return NextResponse.json(species);
  } catch (error) {
    console.error("Error in /api/species:", error);
    return NextResponse.json(
      { error: "Failed to fetch species" },
      { status: 500 }
    );
  }
}
