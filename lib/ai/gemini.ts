import { GoogleGenAI } from "@google/genai";
import type { HealthEntry, HealthIssue, LightSetup, DetailedHealthAnalysis } from "@/types/database";

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

// Re-export the detailed analysis type
export type { DetailedHealthAnalysis } from "@/types/database";

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
  lightSetup: string,
  history: Array<{ score: number; date: string; notes: string | null }>
): Promise<DetailedHealthAnalysis> {
  const historyText =
    history.length > 0
      ? history
          .map(
            (h) =>
              `- ${h.date}: Score ${h.score}/100${h.notes ? ` - ${h.notes}` : ""}`
          )
          .join("\n")
      : "No previous health assessments.";

  const prompt = `You are a plant health expert. Analyze this plant photo thoroughly.

Species: ${species}
Light setup: ${lightSetup.replace(/_/g, " ")}
Previous history:
${historyText}

Score each dimension 0-100 and describe what you actually SEE in the photo.

Return JSON only:
{
  "overall_score": 75,
  "dimensions": {
    "leaf_health": {
      "score": 80,
      "observation": "specific observation about leaf color, texture, spots, damage"
    },
    "growth_vitality": {
      "score": 70,
      "observation": "specific observation about new growth, stem strength, overall vigor"
    },
    "pest_disease": {
      "score": 90,
      "observation": "specific observation about pest presence, fungal issues, disease signs"
    },
    "hydration": {
      "score": 65,
      "observation": "specific observation about leaf turgor, soil moisture appearance, wilting"
    },
    "overall_appearance": {
      "score": 70,
      "observation": "specific observation about plant shape, symmetry, general aesthetics"
    }
  },
  "positive_signs": ["array of 2-4 good things you observe"],
  "concerns": [
    {
      "issue": "what's wrong",
      "severity": "low|medium|high",
      "likely_cause": "why it's happening",
      "recommendation": "what to do"
    }
  ],
  "summary": "2-3 sentence plain English summary of the plant's health"
}

Rules:
- overall_score should be a weighted average of dimensions (0-100)
- Each dimension score is 0-100 (100 = perfect)
- observations must describe what you ACTUALLY SEE in the image
- positive_signs: 2-4 specific good observations
- concerns array can be empty if plant looks healthy
- severity must be: "low", "medium", or "high"
- summary should be conversational and helpful

Respond with ONLY the JSON, no markdown formatting or extra text.`;

  try {
    console.log("Calling Gemini API for detailed health analysis...");

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

    console.log("Raw health analysis response:", text.substring(0, 300));

    // Clean up potential markdown formatting
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

    const result = JSON.parse(cleanJson) as DetailedHealthAnalysis;

    // Validate and clamp scores
    result.overall_score = Math.max(0, Math.min(100, Math.round(result.overall_score)));

    for (const key of Object.keys(result.dimensions) as Array<keyof typeof result.dimensions>) {
      result.dimensions[key].score = Math.max(0, Math.min(100, Math.round(result.dimensions[key].score)));
    }

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

export interface PlantSearchResult {
  speciesKey: string;
  speciesName: string;
  confidence: number;
  careInfo: {
    water: string;
    light: string;
    humidity: string;
  };
}

export async function searchPlants(query: string): Promise<PlantSearchResult[]> {
  const prompt = `You are a houseplant encyclopedia. The user is searching for "${query}".

Return up to 5 matching houseplant species as valid JSON array:
[
  {
    "speciesKey": "snake_case_species_key",
    "speciesName": "Common Name (Scientific Name)",
    "confidence": 90,
    "careInfo": {
      "water": "Every 7-10 days",
      "light": "Bright indirect light",
      "humidity": "Medium"
    }
  }
]

Rules:
- Match by common name, scientific name, or nickname (e.g. "snake" matches Snake Plant, "money" matches Money Tree or Money Plant)
- Order by relevance to the query (most relevant first)
- confidence reflects how well it matches the search query (not plant health)
- speciesKey: lowercase_with_underscores
- If no good matches exist, return an empty array []
- Respond with ONLY the JSON array, no markdown or extra text`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let text: string;
    if (typeof response.text === "string") {
      text = response.text;
    } else if (typeof response.text === "function") {
      text = (response.text as () => string)();
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response structure from Gemini API");
    }

    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as PlantSearchResult[];
  } catch (error) {
    console.error("Error searching plants:", error);
    throw new Error("Failed to search plants");
  }
}
