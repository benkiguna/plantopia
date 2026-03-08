"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Badge, ActionButton } from "@/components/ui";
import { Leaf, TrendUp, Microscope, Drop, Sparkle, ChartBar, Robot, Lightbulb, Sun, Plant } from "@phosphor-icons/react";
import type { HealthEntry, Species, DetailedHealthAnalysis, HealthConcern } from "@/types/database";

interface AIInsightsTabProps {
  plantId: string;
  healthTimeline: HealthEntry[];
  species: Species | null;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const dimensionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  leaf_health: { label: "Leaf Health", icon: <Leaf weight="bold" /> },
  growth_vitality: { label: "Growth & Vitality", icon: <TrendUp weight="bold" /> },
  pest_disease: { label: "Pest & Disease", icon: <Microscope weight="bold" /> },
  hydration: { label: "Hydration", icon: <Drop weight="bold" /> },
  overall_appearance: { label: "Overall Appearance", icon: <Sparkle weight="bold" /> },
};

function DimensionBar({
  dimension,
  score,
  observation,
}: {
  dimension: string;
  score: number;
  observation: string;
}) {
  const { label, icon } = dimensionLabels[dimension] || { label: dimension, icon: <ChartBar weight="bold" /> };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-1 font-mono">
          <span>{icon}</span>
          {label}
        </span>
        <span
          className={`text-sm font-semibold ${
            score >= 80 ? "text-neon-emerald" : score >= 60 ? "text-amber" : "text-coral"
          }`}
        >
          {score}
        </span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 80 ? "bg-neon-emerald shadow-[0_0_8px_rgba(34,211,138,0.8)]" : score >= 60 ? "bg-amber shadow-[0_0_8px_rgba(229,151,15,0.8)]" : "bg-coral shadow-[0_0_8px_rgba(217,79,59,0.8)]"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-white/60 leading-relaxed pt-1">{observation}</p>
    </div>
  );
}

function ConcernCard({ concern }: { concern: HealthConcern }) {
  const severityColors = {
    low: "bg-amber/10 border-amber/30 text-amber",
    medium: "bg-coral/10 border-coral/30 text-coral",
    high: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  const severityBadgeVariants: Record<string, "warning" | "coral" | "red"> = {
    low: "warning",
    medium: "coral",
    high: "red",
  };

  return (
    <div className={`p-3 rounded-lg border ${severityColors[concern.severity]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm text-white">{concern.issue}</span>
        <Badge variant={severityBadgeVariants[concern.severity]}>
          {concern.severity}
        </Badge>
      </div>
      <div className="space-y-1 text-xs text-white/70 mt-2">
        <p className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Likely cause</span>
          <span>{concern.likely_cause}</span>
        </p>
        <p className="flex flex-col gap-0.5 mt-2">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">What to do</span>
          <span>{concern.recommendation}</span>
        </p>
      </div>
    </div>
  );
}

export function AIInsightsTab({ plantId, healthTimeline, species }: AIInsightsTabProps) {
  const router = useRouter();
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestEntry = healthTimeline[0];
  const analysis = latestEntry?.analysis as unknown as DetailedHealthAnalysis | null;

  const handleReanalyze = async () => {
    if (!latestEntry) return;

    setIsReanalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthEntryId: latestEntry.id,
          plantId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze");
      }

      // Refresh the page to show new analysis
      router.refresh();
    } catch (err) {
      console.error("Re-analysis failed:", err);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">
          {error}
        </div>
      )}

      {/* Latest Analysis with detailed breakdown */}
      {latestEntry ? (
        <>
          <Card hover={false}>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-white">
                  Health Analysis
                </h3>
                <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">
                  {formatDate(latestEntry.created_at)}
                </span>
              </div>

              {/* Overall Score */}
              <div className="p-5 bg-[#1A1C1B] rounded-xl border border-white/5 shadow-inner mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-emerald/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/60">
                    Overall Health Score
                  </span>
                  <span
                    className={`text-4xl font-display font-bold ${
                      latestEntry.health_score >= 80
                        ? "text-neon-emerald drop-shadow-[0_0_10px_rgba(34,211,138,0.5)]"
                        : latestEntry.health_score >= 60
                        ? "text-amber drop-shadow-[0_0_10px_rgba(229,151,15,0.5)]"
                        : "text-coral drop-shadow-[0_0_10px_rgba(217,79,59,0.5)]"
                    }`}
                  >
                    {latestEntry.health_score}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden relative z-10">
                  <div
                    className={`h-full rounded-full transition-all ${
                      latestEntry.health_score >= 80
                        ? "bg-neon-emerald shadow-[0_0_10px_rgba(34,211,138,1)]"
                        : latestEntry.health_score >= 60
                        ? "bg-amber shadow-[0_0_10px_rgba(229,151,15,1)]"
                        : "bg-coral shadow-[0_0_10px_rgba(217,79,59,1)]"
                    }`}
                    style={{ width: `${latestEntry.health_score}%` }}
                  />
                </div>
              </div>

              {/* Dimension Scores */}
              {analysis?.dimensions && (
                <div className="space-y-4 mb-4">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 border-b border-white/5 pb-2">
                    Breakdown by Category
                  </h4>
                  {Object.entries(analysis.dimensions).map(([key, dim]) => (
                    <DimensionBar
                      key={key}
                      dimension={key}
                      score={dim.score}
                      observation={dim.observation}
                    />
                  ))}
                </div>
              )}

              {/* Positive Signs */}
              {analysis?.positive_signs && analysis.positive_signs.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 border-b border-white/5 pb-2">
                    Positive Signs
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.positive_signs.map((sign, i) => (
                      <Badge key={i} variant="green">
                        {sign}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Concerns */}
              {analysis?.concerns && analysis.concerns.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 border-b border-white/5 pb-2">
                    Concerns
                  </h4>
                  <div className="space-y-2">
                    {analysis.concerns.map((concern, i) => (
                      <ConcernCard key={i} concern={concern} />
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {analysis?.summary ? (
                <div className="p-4 bg-neon-emerald/5 rounded-xl border border-neon-emerald/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-neon-emerald shadow-[0_0_10px_rgba(34,211,138,0.8)]" />
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-neon-emerald mb-2 font-semibold">AI Summary</h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              ) : latestEntry.ai_notes ? (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm text-white/80 leading-relaxed">
                    {latestEntry.ai_notes}
                  </p>
                </div>
              ) : null}

              {/* Re-analyze Button */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={handleReanalyze}
                  disabled={isReanalyzing}
                  className="w-full"
                >
                  {isReanalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-green/30 border-t-green rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    "Re-analyze This Photo"
                  )}
                </ActionButton>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card hover={false}>
          <CardContent>
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-white/5 text-white/50 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Robot weight="duotone" className="w-8 h-8" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">
                No AI Analysis Yet
              </h3>
              <p className="text-sm text-white/50">
                Upload a photo to get AI-powered health insights about your plant.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Species-specific Tips */}
      {species && (
        <Card hover={false}>
          <CardContent>
            <h3 className="font-display font-semibold text-white mb-3">
              Care Tips for {species.name}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-xl">
                <Lightbulb weight="fill" className="text-xl text-amber flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    Watering
                  </p>
                  <p className="text-xs text-white/60">
                    Water every {species.water_days} days. Check the top inch of
                    soil before watering.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/5 rounded-xl">
                <Sun weight="fill" className="text-xl text-amber flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">Light</p>
                  <p className="text-xs text-white/60">
                    Thrives in {species.light.replace(/_/g, " ")} conditions.
                  </p>
                </div>
              </div>
              {species.tip && (
                <div className="flex items-start gap-3 p-4 bg-neon-emerald/10 border border-neon-emerald/20 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-neon-emerald/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <Plant weight="fill" className="text-xl text-neon-emerald flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-neon-emerald font-semibold mb-1">
                      Pro Tip
                    </p>
                    <p className="text-xs text-white/80 leading-relaxed">{species.tip}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      {healthTimeline.length > 1 && (
        <Card hover={false}>
          <CardContent>
            <h3 className="font-display font-semibold text-white mb-3">
              Analysis History
            </h3>
            <div className="space-y-2">
              {healthTimeline.slice(0, 5).map((entry) => {
                const entryAnalysis = entry.analysis as unknown as DetailedHealthAnalysis | null;
                const concernCount = entryAnalysis?.concerns?.length || 0;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${
                          entry.health_score >= 80
                            ? "bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20 shadow-[inset_0_0_10px_rgba(34,211,138,0.2)]"
                            : entry.health_score >= 60
                            ? "bg-amber/10 text-amber border-amber/20 shadow-[inset_0_0_10px_rgba(229,151,15,0.2)]"
                            : "bg-coral/10 text-coral border-coral/20 shadow-[inset_0_0_10px_rgba(217,79,59,0.2)]"
                        }`}
                      >
                        {entry.health_score}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white/80">
                          {formatDate(entry.created_at).split(",")[0]}
                        </p>
                        {concernCount > 0 && (
                          <p className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5">
                            {concernCount} concern{concernCount > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
