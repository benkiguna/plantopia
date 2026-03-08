import { GoogleGenAI } from "@google/genai";
import type { HealthEntry, HealthIssue } from "@/types/database";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface PlantIdentificationResult {
  matches: Array<{
    speciesKey: string;
    speciesName: string;
    confidence: number;
    careInfo: {
      water: string;
      light: string;
      humidity: string;
    };
  }>;
  needsClarification: boolean;
  clarificationMessage?: string;
}

export interface HealthAnalysisResult {
  health_score: number;
  trend: "improving" | "stable" | "declining";
  observations: string[];
  issues: HealthIssue[];
  comparison_to_previous: string;
}

export async function identifyPlant(
  imageBase64: string
): Promise<PlantIdentificationResult> {
  const prompt = `You are a plant identification expert. Analyze this plant image and identify the species.

Return your response as valid JSON with this exact structure:
{
  "matches": [
    {
      "speciesKey": "snake_case_name",
      "speciesName": "Common Name",
      "confidence": 85,
      "careInfo": {
        "water": "Every 7-10 days",
        "light": "Bright indirect light",
        "humidity": "Medium"
      }
    }
  ],
  "needsClarification": false,
  "clarificationMessage": null
}

Rules:
- Return top 3 matches maximum, ordered by confidence (highest first)
- Confidence is 0-100 percentage
- speciesKey should be lowercase with underscores (e.g., "monstera_deliciosa")
- If all confidences are below 60%, set needsClarification to true and provide a helpful message asking for a clearer photo
- Common houseplant species keys: monstera_deliciosa, pothos, snake_plant, fiddle_leaf_fig, peace_lily, rubber_plant, zz_plant, spider_plant, philodendron, calathea

Respond with ONLY the JSON, no markdown formatting or extra text.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() || "";

    // Clean up potential markdown formatting
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

    const result = JSON.parse(cleanJson) as PlantIdentificationResult;
    return result;
  } catch (error) {
    console.error("Error identifying plant:", error);
    throw new Error("Failed to identify plant");
  }
}

export async function analyzeHealth(
  imageBase64: string,
  species: string,
  history: Array<{ score: number; date: string; notes: string | null }>
): Promise<HealthAnalysisResult> {
  const historyText =
    history.length > 0
      ? history
          .map(
            (h) =>
              `- ${h.date}: Score ${h.score}/100${h.notes ? ` - ${h.notes}` : ""}`
          )
          .join("\n")
      : "No previous health assessments.";

  const prompt = `You are a plant health analyst. Analyze this plant photo and provide a health assessment.

Species: ${species}

Previous health assessments:
${historyText}

Return your response as valid JSON with this exact structure:
{
  "health_score": 75,
  "trend": "stable",
  "observations": [
    "Leaves show good color and turgor",
    "No visible pests or damage"
  ],
  "issues": [
    {
      "name": "Minor leaf yellowing",
      "severity": "low",
      "recommendation": "Check watering frequency and drainage"
    }
  ],
  "comparison_to_previous": "Plant health has remained stable since last check-in."
}

Rules:
- health_score is 0-100 (100 = perfect health)
- trend must be one of: "improving", "stable", "declining"
- observations should be 2-4 specific observations about the plant's current state
- issues array can be empty if no problems detected
- severity must be one of: "low", "medium", "high"
- comparison_to_previous should reference the history if available
- Be specific and actionable in recommendations

Respond with ONLY the JSON, no markdown formatting or extra text.`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() || "";

    // Clean up potential markdown formatting
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

    const result = JSON.parse(cleanJson) as HealthAnalysisResult;

    // Validate and clamp health_score
    result.health_score = Math.max(0, Math.min(100, Math.round(result.health_score)));

    return result;
  } catch (error) {
    console.error("Error analyzing plant health:", error);
    throw new Error("Failed to analyze plant health");
  }
}

// Helper to convert health entries to history format for AI
export function healthEntriesToHistory(
  entries: HealthEntry[]
): Array<{ score: number; date: string; notes: string | null }> {
  return entries.slice(0, 3).map((entry) => ({
    score: entry.health_score,
    date: new Date(entry.created_at).toLocaleDateString(),
    notes: entry.ai_notes,
  }));
}
