import { NextRequest, NextResponse } from "next/server";
import { identifyPlant, type PlantIdentificationResult } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing imageBase64 in request body" },
        { status: 400 }
      );
    }

    const result: PlantIdentificationResult = await identifyPlant(imageBase64);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/analyze/identify:", error);
    return NextResponse.json(
      { error: "Failed to identify plant" },
      { status: 500 }
    );
  }
}
