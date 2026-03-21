"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, ActionButton, Badge } from "@/components/ui";
import type { PlantWithSpecies, LightAnalysis } from "@/types/database";

interface SetupTabProps {
  plant: PlantWithSpecies;
}

const LIGHT_OPTIONS = [
  { value: "bright_direct", label: "Bright Direct", desc: "Direct sunlight for several hours" },
  { value: "bright_indirect", label: "Bright Indirect", desc: "Near a window, no direct rays" },
  { value: "medium", label: "Medium", desc: "A few feet from a window" },
  { value: "low", label: "Low Light", desc: "Far from windows, shaded areas" },
  { value: "low_to_bright", label: "Low to Bright", desc: "Variable — low to bright over the day" },
  { value: "low_to_bright_indirect", label: "Low to Bright Indirect", desc: "Variable — shaded to filtered light" },
  { value: "low_to_medium", label: "Low to Medium", desc: "Variable — low to moderate light" },
  { value: "medium_to_bright_indirect", label: "Medium to Bright Indirect", desc: "Moderate to filtered bright light" },
  { value: "medium_indirect", label: "Medium Indirect", desc: "Moderate, away from direct sun" },
];

export function SetupTab({ plant }: SetupTabProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState(plant.nickname);
  const [lightSetup, setLightSetup] = useState(plant.light_setup);
  const [location, setLocation] = useState(plant.location || "");
  const [potSize, setPotSize] = useState(plant.pot_size || "");
  const [soilType, setSoilType] = useState(plant.soil_type || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const lightAnalysis = plant.light_analysis as LightAnalysis | null;

  const handleCancel = () => {
    setIsEditing(false);
    setNickname(plant.nickname);
    setLightSetup(plant.light_setup);
    setLocation(plant.location || "");
    setPotSize(plant.pot_size || "");
    setSoilType(plant.soil_type || "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/plants/${plant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim() || plant.nickname,
          light_setup: lightSetup,
          location: location || null,
          pot_size: potSize || null,
          soil_type: soilType || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update plant");

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating plant:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/plants/${plant.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete plant");
      router.push("/");
    } catch (error) {
      console.error("Error deleting plant:", error);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Light Environment */}
        <Card hover={false}>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-white">Light Environment</h3>
              {lightAnalysis && <Badge variant="green">AI Analyzed</Badge>}
            </div>

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

            {lightAnalysis && (
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Light Level</span>
                  <span className="text-sm font-semibold text-neon-emerald capitalize tracking-wide">
                    {lightAnalysis.light_level.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Light Source</span>
                  <span className="text-sm font-medium text-white">{lightAnalysis.light_source}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Daily Hours</span>
                  <span className="text-sm font-medium text-white">~{lightAnalysis.estimated_daily_hours}h</span>
                </div>
                {lightAnalysis.notes && (
                  <p className="text-xs text-white/60 pt-3 mt-1 border-t border-white/10 leading-relaxed">
                    {lightAnalysis.notes}
                  </p>
                )}
              </div>
            )}

            <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Current Light Setting</p>
              <p className="text-sm font-semibold text-white capitalize">
                {plant.light_setup.replace(/_/g, " ")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plant Details */}
        <Card hover={false}>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white">Plant Details</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-neon-emerald font-semibold"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {/* Nickname */}
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-white/50 mb-2 block">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g., My Monstera"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-neon-emerald focus:border-neon-emerald transition-all"
                  />
                </div>

                {/* Light Setup — all 9 presets */}
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-white/50 mb-2 block">
                    Light Setup
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {LIGHT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLightSetup(option.value)}
                        className={`p-3 rounded-xl text-left transition-all border ${
                          lightSetup === option.value
                            ? "bg-neon-emerald/10 border-neon-emerald shadow-[inset_0_0_15px_rgba(34,211,138,0.15)]"
                            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                        }`}
                      >
                        <p className={`text-sm font-semibold ${lightSetup === option.value ? "text-neon-emerald" : "text-white"}`}>
                          {option.label}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${lightSetup === option.value ? "text-neon-emerald/70" : "text-white/40"}`}>
                          {option.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-white/50 mb-2 block">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Living room window"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-neon-emerald focus:border-neon-emerald transition-all"
                  />
                </div>

                {/* Pot Size */}
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-white/50 mb-2 block">Pot Size</label>
                  <input
                    type="text"
                    value={potSize}
                    onChange={(e) => setPotSize(e.target.value)}
                    placeholder="e.g., 6 inch"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-neon-emerald focus:border-neon-emerald transition-all"
                  />
                </div>

                {/* Soil Type */}
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-white/50 mb-2 block">Soil Type</label>
                  <input
                    type="text"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    placeholder="e.g., Well-draining potting mix"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-neon-emerald focus:border-neon-emerald transition-all"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <ActionButton variant="secondary" size="sm" onClick={handleCancel}>
                    Cancel
                  </ActionButton>
                  <ActionButton variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Nickname</span>
                  <span className="text-sm font-medium text-white">{plant.nickname}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Location</span>
                  <span className="text-sm font-medium text-white">{plant.location || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Pot Size</span>
                  <span className="text-sm font-medium text-white">{plant.pot_size || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Soil Type</span>
                  <span className="text-sm font-medium text-white">{plant.soil_type || "Not set"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card hover={false}>
          <CardContent>
            <h3 className="font-display font-semibold text-coral mb-3">Danger Zone</h3>
            <p className="text-sm text-white/60 mb-4">
              Deleting this plant will permanently remove all associated health entries and care
              logs. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200 active:scale-[0.98]"
            >
              Delete Plant
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => { if (!deleting) setShowDeleteModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1A1C1B] border border-white/10 rounded-2xl p-6 mx-4 w-full max-w-sm"
            >
              <h2 className="font-display font-semibold text-white text-lg mb-2">
                Delete &ldquo;{plant.nickname}&rdquo;?
              </h2>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                This will permanently remove your plant and all its health and care history.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-red-400 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
