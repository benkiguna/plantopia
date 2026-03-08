export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LightSetup =
  | "bright_direct"
  | "bright_indirect"
  | "medium"
  | "low"
  | "low_to_bright"
  | "low_to_bright_indirect"
  | "low_to_medium"
  | "medium_to_bright_indirect"
  | "medium_indirect";

export type Humidity = "low" | "medium" | "high";

export type CareAction = "water" | "fertilize" | "mist" | "rotate" | "repot" | "prune";

export interface HealthIssue {
  name: string;
  severity: "low" | "medium" | "high";
  recommendation: string;
}

export interface HealthConcern {
  issue: string;
  severity: "low" | "medium" | "high";
  likely_cause: string;
  recommendation: string;
}

export interface DimensionScore {
  score: number;
  observation: string;
}

export interface DetailedHealthAnalysis {
  overall_score: number;
  dimensions: {
    leaf_health: DimensionScore;
    growth_vitality: DimensionScore;
    pest_disease: DimensionScore;
    hydration: DimensionScore;
    overall_appearance: DimensionScore;
  };
  positive_signs: string[];
  concerns: HealthConcern[];
  summary: string;
}

export interface LightAnalysis {
  light_level: LightSetup;
  light_source: string;
  estimated_daily_hours: number;
  notes: string;
  confidence: number;
}

export interface Database {
  public: {
    Tables: {
      species: {
        Row: {
          key: string;
          name: string;
          water_days: number;
          light: string;
          humidity: string;
          fertilize_days: number;
          tip: string | null;
        };
        Insert: {
          key: string;
          name: string;
          water_days?: number;
          light?: string;
          humidity?: string;
          fertilize_days?: number;
          tip?: string | null;
        };
        Update: {
          key?: string;
          name?: string;
          water_days?: number;
          light?: string;
          humidity?: string;
          fertilize_days?: number;
          tip?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      plants: {
        Row: {
          id: string;
          user_id: string;
          species_key: string | null;
          nickname: string;
          light_setup: string;
          pot_size: string | null;
          soil_type: string | null;
          location: string | null;
          light_photo_url: string | null;
          light_analysis: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          species_key?: string | null;
          nickname: string;
          light_setup?: string;
          pot_size?: string | null;
          soil_type?: string | null;
          location?: string | null;
          light_photo_url?: string | null;
          light_analysis?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          species_key?: string | null;
          nickname?: string;
          light_setup?: string;
          pot_size?: string | null;
          soil_type?: string | null;
          location?: string | null;
          light_photo_url?: string | null;
          light_analysis?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plants_species_key_fkey";
            columns: ["species_key"];
            referencedRelation: "species";
            referencedColumns: ["key"];
          },
          {
            foreignKeyName: "plants_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      health_entries: {
        Row: {
          id: string;
          plant_id: string;
          photo_url: string;
          health_score: number;
          ai_notes: string | null;
          issues: Json;
          analysis: Json | null;
          user_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plant_id: string;
          photo_url: string;
          health_score: number;
          ai_notes?: string | null;
          issues?: Json;
          analysis?: Json | null;
          user_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string;
          photo_url?: string;
          health_score?: number;
          ai_notes?: string | null;
          issues?: Json;
          analysis?: Json | null;
          user_notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_entries_plant_id_fkey";
            columns: ["plant_id"];
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
      care_logs: {
        Row: {
          id: string;
          plant_id: string;
          action: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plant_id: string;
          action: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plant_id?: string;
          action?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "care_logs_plant_id_fkey";
            columns: ["plant_id"];
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience type aliases
export type Species = Database["public"]["Tables"]["species"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Plant = Database["public"]["Tables"]["plants"]["Row"];
export type HealthEntry = Database["public"]["Tables"]["health_entries"]["Row"];
export type CareLog = Database["public"]["Tables"]["care_logs"]["Row"];

export type PlantInsert = Database["public"]["Tables"]["plants"]["Insert"];
export type PlantUpdate = Database["public"]["Tables"]["plants"]["Update"];
export type HealthEntryInsert = Database["public"]["Tables"]["health_entries"]["Insert"];
export type CareLogInsert = Database["public"]["Tables"]["care_logs"]["Insert"];

// Extended types with relations
export interface PlantWithSpecies extends Plant {
  species: Species | null;
}

export interface PlantWithLatestHealth extends PlantWithSpecies {
  latest_health_entry: HealthEntry | null;
}
