import { GoogleGenAI } from "@google/genai";
import type { HealthEntry, HealthIssue, LightSetup } from "@/types/database";

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
    console.log("Calling Gemini API for plant identification...");
    console.log("Image base64 length:", imageBase64.length);

    // Use the models/gemini-1.5-flash format as per Google AI documentation
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
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

    console.log("Gemini response received");

    // The response object has a text property that is a getter
    let text: string;
    if (typeof response.text === "string") {
      text = response.text;
    } else if (typeof response.text === "function") {
      text = (response.text as () => string)();
    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure:", JSON.stringify(response, null, 2));
      throw new Error("Unexpected response structure from Gemini API");
    }

    console.log("Raw response text:", text.substring(0, 200));

    // Clean up potential markdown formatting
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

    const result = JSON.parse(cleanJson) as PlantIdentificationResult;
    return result;
  } catch (error) {
    console.error("Error identifying plant:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to identify plant: ${error.message}`);
    }
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
      model: "gemini-2.5-flash",
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

    let text: string;
    if (typeof response.text === "string") {
      text = response.text;
    } else if (typeof response.text === "function") {
      text = (response.text as () => string)();
    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response structure from Gemini API");
    }

    // Clean up potential markdown formatting
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

    const result = JSON.parse(cleanJson) as HealthAnalysisResult;

    // Validate and clamp health_score
    result.health_score = Math.max(0, Math.min(100, Math.round(result.health_score)));

    return result;
  } catch (error) {
    console.error("Error analyzing plant health:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze plant health: ${error.message}`);
    }
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

export interface LightAnalysisResult {
  light_level: LightSetup;
  light_source: string;
  estimated_daily_hours: number;
  notes: string;
  confidence: number;
}

export async function analyzeLight(
  imageBase64: string
): Promise<LightAnalysisResult> {
  const prompt = `You are an expert at analyzing indoor lighting conditions for houseplants. Analyze this photo of where a plant will be placed and determine the light conditions.

Return your response as valid JSON with this exact structure:
{
  "light_level": "bright_indirect",
  "light_source": "South-facing window with sheer curtains",
  "estimated_daily_hours": 6,
  "notes": "Good indirect light throughout the day. The sheer curtains diffuse direct sunlight well.",
  "confidence": 85
}

Rules:
- light_level must be one of: "bright_direct", "bright_indirect", "medium", "low", "low_to_bright", "low_to_bright_indirect", "low_to_medium", "medium_to_bright_indirect", "medium_indirect"
  - bright_direct: Direct sunlight for 4+ hours (south-facing unobstructed window)
  - bright_indirect: Bright but filtered/diffused light (sheer curtains, near bright window but not in direct sun)
  - medium: Moderate light (east/west window, or a few feet from bright window)
  - low: Low light (north-facing window, far from windows, or artificial light only)
  - Use combination values like "low_to_bright_indirect" if conditions vary throughout the day
- light_source: Describe the primary light source (e.g., "East-facing window", "Skylight", "Fluorescent office lighting")
- estimated_daily_hours: Estimated hours of usable plant light per day (0-14)
- notes: Brief assessment of the lighting quality and any recommendations (1-2 sentences)
- confidence: Your confidence in this assessment (0-100). Lower if image is unclear or lighting is ambiguous.

Respond with ONLY the JSON, no markdown formatting or extra text.`;

  try {
    console.log("Calling Gemini API for light analysis...");

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
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

    let text: string;
    if (typeof response.text === "string") {
      text = response.text;
    } else if (typeof response.text === "function") {
      text = (response.text as () => string)();
    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure:", JSON.stringify(response, null, 2));
      throw new Error("Unexpected response structure from Gemini API");
    }

    console.log("Raw light analysis response:", text.substring(0, 200));

    // Clean up potential markdown formatting
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

    const result = JSON.parse(cleanJson) as LightAnalysisResult;

    // Validate and clamp values
    result.confidence = Math.max(0, Math.min(100, Math.round(result.confidence)));
    result.estimated_daily_hours = Math.max(0, Math.min(14, result.estimated_daily_hours));

    return result;
  } catch (error) {
    console.error("Error analyzing light:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze light: ${error.message}`);
    }
    throw new Error("Failed to analyze light");
  }
}
