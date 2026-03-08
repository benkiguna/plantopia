"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, ActionButton, Badge } from "@/components/ui";
import type { PlantWithSpecies, LightAnalysis } from "@/types/database";

interface SetupTabProps {
  plant: PlantWithSpecies;
}

const lightOptions = [
  { value: "bright_direct", label: "Bright Direct", desc: "Direct sunlight" },
  { value: "bright_indirect", label: "Bright Indirect", desc: "Near window, filtered light" },
  { value: "medium", label: "Medium", desc: "A few feet from window" },
  { value: "low", label: "Low", desc: "Far from windows" },
];

export function SetupTab({ plant }: SetupTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lightSetup, setLightSetup] = useState(plant.light_setup);
  const [location, setLocation] = useState(plant.location || "");
  const [potSize, setPotSize] = useState(plant.pot_size || "");
  const [soilType, setSoilType] = useState(plant.soil_type || "");

  const lightAnalysis = plant.light_analysis as LightAnalysis | null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/plants/${plant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          light_setup: lightSetup,
          location: location || null,
          pot_size: potSize || null,
          soil_type: soilType || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update plant");
      }

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating plant:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Light Environment */}
      <Card hover={false}>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-forest">
              Light Environment
            </h3>
            {lightAnalysis && (
              <Badge variant="green">AI Analyzed</Badge>
            )}
          </div>

          {/* Light Photo */}
          {plant.light_photo_url && (
            <div className="relative h-32 rounded-lg overflow-hidden mb-3">
              <Image
                src={plant.light_photo_url}
                alt="Light environment"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}

          {/* Light Analysis Results */}
          {lightAnalysis && (
            <div className="p-3 bg-green/5 rounded-lg mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-forest/70">Light Level</span>
                <span className="text-sm font-medium text-forest capitalize">
                  {lightAnalysis.light_level.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-forest/70">Light Source</span>
                <span className="text-sm font-medium text-forest">
                  {lightAnalysis.light_source}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-forest/70">Daily Hours</span>
                <span className="text-sm font-medium text-forest">
                  ~{lightAnalysis.estimated_daily_hours}h
                </span>
              </div>
              {lightAnalysis.notes && (
                <p className="text-xs text-forest/60 pt-2 border-t border-forest/10">
                  {lightAnalysis.notes}
                </p>
              )}
            </div>
          )}

          {/* Current Setting */}
          <div className="p-3 bg-forest/5 rounded-lg">
            <p className="text-sm text-forest/70 mb-1">Current Light Setting</p>
            <p className="text-sm font-medium text-forest capitalize">
              {plant.light_setup.replace(/_/g, " ")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Plant Details */}
      <Card hover={false}>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-forest">
              Plant Details
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-green font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {/* Light Setup */}
              <div>
                <label className="text-sm text-forest/70 mb-2 block">
                  Light Setup
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {lightOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLightSetup(option.value)}
                      className={`p-2 rounded-lg text-left transition-all ${
                        lightSetup === option.value
                          ? "bg-green/20 border-2 border-green"
                          : "bg-forest/5 border-2 border-transparent"
                      }`}
                    >
                      <p className="text-sm font-medium text-forest">
                        {option.label}
                      </p>
                      <p className="text-[10px] text-forest/60">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm text-forest/70 mb-2 block">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Living room window"
                  className="w-full p-3 bg-forest/5 rounded-lg text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-green/50"
                />
              </div>

              {/* Pot Size */}
              <div>
                <label className="text-sm text-forest/70 mb-2 block">
                  Pot Size
                </label>
                <input
                  type="text"
                  value={potSize}
                  onChange={(e) => setPotSize(e.target.value)}
                  placeholder="e.g., 6 inch"
                  className="w-full p-3 bg-forest/5 rounded-lg text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-green/50"
                />
              </div>

              {/* Soil Type */}
              <div>
                <label className="text-sm text-forest/70 mb-2 block">
                  Soil Type
                </label>
                <input
                  type="text"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  placeholder="e.g., Well-draining potting mix"
                  className="w-full p-3 bg-forest/5 rounded-lg text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-green/50"
                />
              </div>

              {/* Save/Cancel */}
              <div className="flex gap-2 pt-2">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setLightSetup(plant.light_setup);
                    setLocation(plant.location || "");
                    setPotSize(plant.pot_size || "");
                    setSoilType(plant.soil_type || "");
                  }}
                >
                  Cancel
                </ActionButton>
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </ActionButton>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-forest/5 rounded-lg">
                <span className="text-sm text-forest/70">Location</span>
                <span className="text-sm font-medium text-forest">
                  {plant.location || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest/5 rounded-lg">
                <span className="text-sm text-forest/70">Pot Size</span>
                <span className="text-sm font-medium text-forest">
                  {plant.pot_size || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-forest/5 rounded-lg">
                <span className="text-sm text-forest/70">Soil Type</span>
                <span className="text-sm font-medium text-forest">
                  {plant.soil_type || "Not set"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card hover={false}>
        <CardContent>
          <h3 className="font-display font-semibold text-red-600 mb-3">
            Danger Zone
          </h3>
          <p className="text-sm text-forest/60 mb-3">
            Deleting this plant will remove all associated health entries and
            care logs. This action cannot be undone.
          </p>
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to delete "${plant.nickname}"? This cannot be undone.`
                )
              ) {
                fetch(`/api/plants/${plant.id}`, { method: "DELETE" })
                  .then(() => router.push("/garden"))
                  .catch(console.error);
              }
            }}
            className="text-red-600 hover:bg-red-50"
          >
            Delete Plant
          </ActionButton>
        </CardContent>
      </Card>
    </div>
  );
}
