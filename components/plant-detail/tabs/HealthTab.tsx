"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, HealthRing, Badge } from "@/components/ui";
import { CheckInOverlay } from "@/components/plant-detail/CheckInOverlay";
import {
  Warning,
  CheckCircle,
  Info,
  Plus,
  CaretDown,
  Leaf,
  TrendUp,
  Microscope,
  Drop,
  Sparkle,
  ChartBar,
} from "@phosphor-icons/react";
import type {
  HealthEntry,
  HealthIssue,
  Species,
  DetailedHealthAnalysis,
  HealthConcern,
} from "@/types/database";

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

const dimensionIcons: Record<string, React.ReactNode> = {
  leaf_health: <Leaf weight="bold" />,
  growth_vitality: <TrendUp weight="bold" />,
  pest_disease: <Microscope weight="bold" />,
  hydration: <Drop weight="bold" />,
  overall_appearance: <Sparkle weight="bold" />,
};

const dimensionLabels: Record<string, string> = {
  leaf_health: "Leaf Health",
  growth_vitality: "Growth & Vitality",
  pest_disease: "Pest & Disease",
  hydration: "Hydration",
  overall_appearance: "Appearance",
};

// ─── Internal Components ──────────────────────────────────────────────────────

function DimensionBar({
  dimension,
  score,
  observation,
}: {
  dimension: string;
  score: number;
  observation: string;
}) {
  const label = dimensionLabels[dimension] ?? dimension;
  const icon = dimensionIcons[dimension] ?? <ChartBar weight="bold" />;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[10px] uppercase tracking-widest text-white/50 flex items-center gap-1 font-mono">
          <span>{icon}</span>
          {label}
        </span>
        <span
          className={`text-sm font-semibold ${
            score >= 80
              ? "text-neon-emerald"
              : score >= 60
              ? "text-amber"
              : "text-coral"
          }`}
        >
          {score}
        </span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            score >= 80
              ? "bg-neon-emerald shadow-[0_0_8px_rgba(34,211,138,0.8)]"
              : score >= 60
              ? "bg-amber shadow-[0_0_8px_rgba(229,151,15,0.8)]"
              : "bg-coral shadow-[0_0_8px_rgba(217,79,59,0.8)]"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-white/60 leading-relaxed pt-1">{observation}</p>
    </div>
  );
}

function ConcernCard({ concern }: { concern: HealthConcern }) {
  const severityColors: Record<HealthConcern["severity"], string> = {
    low: "bg-amber/10 border-amber/30 text-amber",
    medium: "bg-coral/10 border-coral/30 text-coral",
    high: "bg-red-500/10 border-red-500/30 text-red-400",
  };

  const severityBadgeVariants: Record<
    HealthConcern["severity"],
    "warning" | "coral" | "red"
  > = {
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
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
            Likely cause
          </span>
          <span>{concern.likely_cause}</span>
        </p>
        <p className="flex flex-col gap-0.5 mt-2">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
            What to do
          </span>
          <span>{concern.recommendation}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusLabel(score: number): { text: string; isHealthy: boolean } {
  if (score >= 80) return { text: "Looking healthy", isHealthy: true };
  if (score >= 60) return { text: "Doing okay", isHealthy: true };
  return { text: "Needs attention", isHealthy: false };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Chart ────────────────────────────────────────────────────────────────────

function HealthTrendChart({ entries }: { entries: HealthEntry[] }) {
  if (entries.length < 2) {
    return (
      <div className="h-32 flex flex-col items-center justify-center gap-3 bg-white/5 rounded-lg border border-white/5">
        <p className="text-[11px] text-white/30 uppercase tracking-widest font-mono">
          Track your plant&apos;s progress
        </p>
        <p className="text-xs text-white/20">
          Take a second health photo to see the trend
        </p>
      </div>
    );
  }

  const chartEntries = entries.slice(0, 7).reverse();
  const maxScore = 100;
  const minScore = 0;

  return (
    <div className="h-32 flex items-end justify-between gap-1 px-2">
      {chartEntries.map((entry, i) => {
        const height =
          ((entry.health_score - minScore) / (maxScore - minScore)) * 100;
        const isLatest = i === chartEntries.length - 1;

        return (
          <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t transition-all ${
                isLatest
                  ? "bg-gradient-to-t from-neon-emerald/50 to-neon-emerald shadow-[0_0_15px_rgba(34,211,138,0.6)]"
                  : "bg-neon-emerald/20"
              }`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-white/50">
              {new Date(entry.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Timeline Entry ───────────────────────────────────────────────────────────

function HealthTimelineEntry({ entry }: { entry: HealthEntry }) {
  const [expanded, setExpanded] = useState(false);
  const issues = (entry.issues as unknown as HealthIssue[]) || [];
  const sortedIssues = [...issues].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
  const status = getStatusLabel(entry.health_score);
  const hasIssues = issues.length > 0;

  return (
    <div className="py-2.5 border-b border-white/10 last:border-0 -mx-2 px-2 rounded-lg">
      <div
        className={`flex gap-3 ${
          hasIssues ? "cursor-pointer hover:bg-white/5" : ""
        } transition-colors rounded-lg`}
        onClick={() => hasIssues && setExpanded(!expanded)}
      >
        {/* Thumbnail — 64px, rounded-xl */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10">
          <Image
            src={entry.photo_url}
            alt="Health check"
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        <div className="flex-1 min-w-0 flex items-center">
          <div className="flex-1">
            <span className="text-xs text-white/50">
              {formatDate(entry.created_at)}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {!hasIssues && status.isHealthy ? (
                <>
                  <CheckCircle
                    weight="fill"
                    className="text-neon-emerald text-sm flex-shrink-0"
                  />
                  <span className="text-sm text-neon-emerald">{status.text}</span>
                </>
              ) : hasIssues ? (
                <>
                  <span className="text-sm text-white/80">
                    {issues.length} {issues.length === 1 ? "issue" : "issues"}{" "}
                    detected
                  </span>
                  <CaretDown
                    weight="bold"
                    className={`text-white/40 text-xs transition-transform ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </>
              ) : (
                <span className="text-sm text-amber">{status.text}</span>
              )}
            </div>
          </div>
          <HealthRing score={entry.health_score} size={32} strokeWidth={3} />
        </div>
      </div>

      {/* Expandable issues list */}
      {expanded && hasIssues && (
        <div className="mt-2 ml-[76px] pl-3 border-l-2 border-white/10 space-y-1.5">
          {sortedIssues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  issue.severity === "high"
                    ? "bg-coral"
                    : issue.severity === "medium"
                    ? "bg-amber"
                    : "bg-neon-emerald"
                }`}
              />
              <span className="text-sm text-white/70">{issue.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HealthTabProps {
  plantId: string;
  healthTimeline: HealthEntry[];
  species: Species | null;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function HealthTab({ plantId, healthTimeline, species: _species }: HealthTabProps) {
  const router = useRouter();
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState<string | null>(null);

  const latestEntry = healthTimeline[0];
  const healthTrend =
    healthTimeline.length >= 2
      ? healthTimeline[0].health_score - healthTimeline[1].health_score
      : null;

  const analysis =
    (latestEntry?.analysis as unknown as DetailedHealthAnalysis | null) ?? null;

  const handleReanalyze = async () => {
    if (!latestEntry) return;
    setIsReanalyzing(true);
    setReanalyzeError(null);

    try {
      const response = await fetch("/api/analyze/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ healthEntryId: latestEntry.id, plantId }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to analyze");
      }

      router.refresh();
    } catch (err) {
      console.error("Re-analysis failed:", err);
      setReanalyzeError(
        err instanceof Error ? err.message : "Analysis failed"
      );
    } finally {
      setIsReanalyzing(false);
    }
  };

  const score = latestEntry?.health_score ?? 0;
  const totalEntries = healthTimeline.length;

  // AI summary: prefer the richer analysis.summary, fall back to ai_notes
  const aiSummary = analysis?.summary || latestEntry?.ai_notes || null;

  const summaryAccentColor =
    score >= 70
      ? "border-neon-emerald/20 bg-neon-emerald/5"
      : score >= 50
      ? "border-amber/20 bg-amber/5"
      : "border-coral/20 bg-coral/5";

  const summaryBarColor =
    score >= 70
      ? "bg-neon-emerald shadow-[0_0_10px_rgba(34,211,138,0.8)]"
      : score >= 50
      ? "bg-amber shadow-[0_0_10px_rgba(229,151,15,0.8)]"
      : "bg-coral shadow-[0_0_10px_rgba(217,79,59,0.8)]";

  const SummaryIcon =
    score >= 70 ? (
      <CheckCircle weight="fill" className="text-neon-emerald text-xl" />
    ) : score >= 50 ? (
      <Info weight="fill" className="text-amber text-xl" />
    ) : (
      <Warning weight="fill" className="text-coral text-xl" />
    );

  return (
    <div className="space-y-4">

      {/* ── Card 1: Trend ─────────────────────────────────────────────────── */}
      <Card hover={false}>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-white">Health Trend</h3>
              {healthTrend !== null && (
                <p className={`text-sm tracking-wide mt-0.5 ${
                  healthTrend > 0 ? "text-neon-emerald" : healthTrend < 0 ? "text-coral" : "text-white/60"
                }`}>
                  {healthTrend > 0 ? "↑" : healthTrend < 0 ? "↓" : "→"}{" "}
                  {healthTrend > 0 ? "+" : ""}{healthTrend} since last check
                </p>
              )}
            </div>
            <HealthRing score={score || 75} size={56} strokeWidth={5} />
          </div>
          <HealthTrendChart entries={healthTimeline} />
        </CardContent>
      </Card>

      {/* ── Card 2: AI Assessment (only if any AI content exists) ─────────── */}
      {latestEntry && (aiSummary || analysis) && (
        <Card hover={false}>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-white">AI Assessment</h3>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                {formatDate(latestEntry.created_at)}
              </span>
            </div>

            {/* Single summary — shown once */}
            {aiSummary && (
              <div className={`mb-5 p-4 rounded-xl border flex gap-3 relative overflow-hidden ${summaryAccentColor}`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${summaryBarColor}`} />
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#111] flex items-center justify-center border border-white/5">
                  {SummaryIcon}
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{aiSummary}</p>
              </div>
            )}

            {/* Dimension breakdown */}
            {analysis?.dimensions && (
              <div className="space-y-4 mb-5">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/5 pb-2">
                  Breakdown
                </h4>
                {Object.entries(analysis.dimensions).map(([key, dim]) => (
                  <DimensionBar key={key} dimension={key} score={dim.score} observation={dim.observation} />
                ))}
              </div>
            )}

            {/* Positive signs */}
            {analysis?.positive_signs && analysis.positive_signs.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/5 pb-2 mb-3">
                  Positive Signs
                </h4>
                <ul className="space-y-2">
                  {analysis.positive_signs.map((sign, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-neon-emerald/15 border border-neon-emerald/30 flex items-center justify-center shrink-0">
                        <CheckCircle weight="fill" className="w-2.5 h-2.5 text-neon-emerald" />
                      </span>
                      <span className="text-sm text-white/70 leading-snug">{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {analysis?.concerns && analysis.concerns.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 border-b border-white/5 pb-2 mb-3">
                  Concerns
                </h4>
                <div className="space-y-2">
                  {analysis.concerns.map((concern, i) => (
                    <ConcernCard key={i} concern={concern} />
                  ))}
                </div>
              </div>
            )}

            {/* Re-analyze */}
            {reanalyzeError && (
              <div className="mb-3 p-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">
                {reanalyzeError}
              </div>
            )}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/8 transition-colors font-mono text-[10px] uppercase tracking-widest disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isReanalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  "Re-analyze with latest photo"
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Card 3: Check-in History ──────────────────────────────────────── */}
      <Card hover={false}>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white">Check-in History</h3>
            <CheckInOverlay plantId={plantId} className="w-auto shrink-0">
              <button
                type="button"
                className="group flex items-center gap-1.5 p-2 -mr-2 hover:bg-neon-emerald/10 rounded-lg transition-colors cursor-pointer"
              >
                <Plus weight="bold" className="text-neon-emerald text-sm" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-neon-emerald font-semibold">
                  New
                </span>
              </button>
            </CheckInOverlay>
          </div>

          {healthTimeline.length > 0 ? (
            <>
              <div className="divide-y divide-white/10 mt-2">
                {healthTimeline.slice(0, 5).map((entry) => (
                  <HealthTimelineEntry key={entry.id} entry={entry} />
                ))}
              </div>
              {totalEntries > 5 && (
                <p className="mt-3 text-center text-[11px] text-white/30 font-mono uppercase tracking-widest">
                  Showing 5 of {totalEntries} check-ins
                </p>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-white/60 mb-4">
                No check-ins yet. Upload a photo to start tracking.
              </p>
              <CheckInOverlay plantId={plantId}>
                <button className="px-5 py-2.5 rounded-xl bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald font-mono text-[10px] uppercase tracking-widest hover:bg-neon-emerald/20 transition-colors">
                  Upload First Photo
                </button>
              </CheckInOverlay>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
