import { NextRequest, NextResponse } from "next/server";
import { searchPlants } from "@/lib/ai";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchPlants(query.trim());
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in /api/analyze/search:", error);
    return NextResponse.json(
      { error: "Failed to search plants" },
      { status: 500 }
    );
  }
}
