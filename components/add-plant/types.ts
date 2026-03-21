export interface LightAnalysisData {
  light_level: string;
  light_source: string;
  estimated_daily_hours: number;
  notes: string;
  confidence: number;
}

export interface PlantFlowState {
  step: 1 | 2 | 3 | 4;
  photoBase64: string | null;
  photoBlob: Blob | null;
  photoPreviewUrl: string | null;
  photoUrl: string | null;
  selectedSpecies: SpeciesMatch | null;
  lightSetup: LightOption | null;
  lightPhotoBase64: string | null;
  lightPhotoBlob: Blob | null;
  lightAnalysis: LightAnalysisData | null;
  nickname: string;
  isLoading: boolean;
  error: string | null;
}

export interface SpeciesMatch {
  speciesKey: string;
  speciesName: string;
  confidence: number;
  careInfo: {
    water: string;
    light: string;
    humidity: string;
  };
}

export type LightOption = "bright_direct" | "bright_indirect" | "medium" | "low";

export interface LightOptionConfig {
  value: LightOption;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const LIGHT_OPTIONS: LightOptionConfig[] = [
  {
    value: "bright_direct",
    label: "Bright Direct",
    description: "Direct sunlight for several hours",
    icon: "sun",
    color: "#fbbf24",
  },
  {
    value: "bright_indirect",
    label: "Bright Indirect",
    description: "Near a window, no direct rays",
    icon: "sun-dim",
    color: "#f59e0b",
  },
  {
    value: "medium",
    label: "Medium",
    description: "A few feet from a window",
    icon: "cloud-sun",
    color: "#6ee7b7",
  },
  {
    value: "low",
    label: "Low Light",
    description: "Far from windows, shaded areas",
    icon: "cloud",
    color: "#94a3b8",
  },
];
