"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, Badge, ActionButton } from "@/components/ui";
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

const dimensionLabels: Record<string, { label: string; icon: string }> = {
  leaf_health: { label: "Leaf Health", icon: "🌿" },
  growth_vitality: { label: "Growth & Vitality", icon: "📈" },
  pest_disease: { label: "Pest & Disease", icon: "🔬" },
  hydration: { label: "Hydration", icon: "💧" },
  overall_appearance: { label: "Overall Appearance", icon: "✨" },
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
  const { label, icon } = dimensionLabels[dimension] || { label: dimension, icon: "📊" };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-forest/70 flex items-center gap-1">
          <span>{icon}</span>
          {label}
        </span>
        <span
          className={`text-sm font-semibold ${
            score >= 80 ? "text-green" : score >= 60 ? "text-amber-500" : "text-red-500"
          }`}
        >
          {score}
        </span>
      </div>
      <div className="w-full bg-forest/10 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            score >= 80 ? "bg-green" : score >= 60 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-forest/60 leading-relaxed">{observation}</p>
    </div>
  );
}

function ConcernCard({ concern }: { concern: HealthConcern }) {
  const severityColors = {
    low: "bg-amber-50 border-amber-200",
    medium: "bg-orange-50 border-orange-200",
    high: "bg-red-50 border-red-200",
  };

  const severityBadgeVariants: Record<string, "warning" | "coral" | "red"> = {
    low: "warning",
    medium: "coral",
    high: "red",
  };

  return (
    <div className={`p-3 rounded-lg border ${severityColors[concern.severity]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm text-forest">{concern.issue}</span>
        <Badge variant={severityBadgeVariants[concern.severity]}>
          {concern.severity}
        </Badge>
      </div>
      <div className="space-y-1 text-xs text-forest/70">
        <p>
          <span className="font-medium">Likely cause:</span> {concern.likely_cause}
        </p>
        <p>
          <span className="font-medium">What to do:</span> {concern.recommendation}
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
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Latest Analysis with detailed breakdown */}
      {latestEntry ? (
        <>
          <Card hover={false}>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-forest">
                  Health Analysis
                </h3>
                <span className="text-xs text-forest/50">
                  {formatDate(latestEntry.created_at)}
                </span>
              </div>

              {/* Overall Score */}
              <div className="p-4 bg-forest/5 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-forest">
                    Overall Health Score
                  </span>
                  <span
                    className={`text-3xl font-bold ${
                      latestEntry.health_score >= 80
                        ? "text-green"
                        : latestEntry.health_score >= 60
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {latestEntry.health_score}
                  </span>
                </div>
                <div className="w-full bg-forest/10 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      latestEntry.health_score >= 80
                        ? "bg-green"
                        : latestEntry.health_score >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${latestEntry.health_score}%` }}
                  />
                </div>
              </div>

              {/* Dimension Scores */}
              {analysis?.dimensions && (
                <div className="space-y-4 mb-4">
                  <h4 className="text-sm font-medium text-forest/70">
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
                  <h4 className="text-sm font-medium text-forest/70 mb-2">
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
                  <h4 className="text-sm font-medium text-forest/70 mb-2">
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
                <div className="p-3 bg-green/5 rounded-lg border border-green/20">
                  <h4 className="text-sm font-medium text-green mb-1">Summary</h4>
                  <p className="text-sm text-forest leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              ) : latestEntry.ai_notes ? (
                <div className="p-3 bg-forest/5 rounded-lg">
                  <p className="text-sm text-forest leading-relaxed">
                    {latestEntry.ai_notes}
                  </p>
                </div>
              ) : null}

              {/* Re-analyze Button */}
              <div className="mt-4 pt-4 border-t border-forest/10">
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
              <div className="w-16 h-16 bg-forest/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="font-display font-semibold text-forest mb-2">
                No AI Analysis Yet
              </h3>
              <p className="text-sm text-forest/60">
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
            <h3 className="font-display font-semibold text-forest mb-3">
              Care Tips for {species.name}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green/5 rounded-lg">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-sm font-medium text-forest mb-1">
                    Watering
                  </p>
                  <p className="text-xs text-forest/70">
                    Water every {species.water_days} days. Check the top inch of
                    soil before watering.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green/5 rounded-lg">
                <span className="text-lg">☀️</span>
                <div>
                  <p className="text-sm font-medium text-forest mb-1">Light</p>
                  <p className="text-xs text-forest/70">
                    Thrives in {species.light.replace(/_/g, " ")} conditions.
                  </p>
                </div>
              </div>
              {species.tip && (
                <div className="flex items-start gap-3 p-3 bg-green/5 rounded-lg">
                  <span className="text-lg">🌱</span>
                  <div>
                    <p className="text-sm font-medium text-forest mb-1">
                      Pro Tip
                    </p>
                    <p className="text-xs text-forest/70">{species.tip}</p>
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
            <h3 className="font-display font-semibold text-forest mb-3">
              Analysis History
            </h3>
            <div className="space-y-2">
              {healthTimeline.slice(0, 5).map((entry) => {
                const entryAnalysis = entry.analysis as unknown as DetailedHealthAnalysis | null;
                const concernCount = entryAnalysis?.concerns?.length || 0;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 bg-forest/5 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          entry.health_score >= 80
                            ? "bg-green/20 text-green"
                            : entry.health_score >= 60
                            ? "bg-amber-100 text-amber-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {entry.health_score}
                      </span>
                      <div>
                        <p className="text-xs text-forest/60">
                          {formatDate(entry.created_at).split(",")[0]}
                        </p>
                        {concernCount > 0 && (
                          <p className="text-[10px] text-forest/50">
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
