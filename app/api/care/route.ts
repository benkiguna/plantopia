import { NextRequest, NextResponse } from "next/server";
import { addCareLog } from "@/lib/data";
import type { CareLogInsert } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plantId, action, notes } = body;

    if (!plantId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: plantId, action" },
        { status: 400 }
      );
    }

    const validActions = ["water", "fertilize", "mist", "rotate", "repot", "prune"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    const careLogData: CareLogInsert = {
      plant_id: plantId,
      action,
      notes: notes || null,
    };

    const careLog = await addCareLog(careLogData);

    return NextResponse.json({ careLog });
  } catch (error) {
    console.error("Error in /api/care:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to log care action: ${errorMessage}` },
      { status: 500 }
    );
  }
}
