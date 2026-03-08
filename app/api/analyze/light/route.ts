import { NextRequest, NextResponse } from "next/server";
import { analyzeLight, type LightAnalysisResult } from "@/lib/ai";

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

    const result: LightAnalysisResult = await analyzeLight(imageBase64);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/analyze/light:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to analyze light: ${errorMessage}` },
      { status: 500 }
    );
  }
}
