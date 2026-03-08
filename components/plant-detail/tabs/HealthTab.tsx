"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, ActionButton, HealthRing } from "@/components/ui";
import { CheckInOverlay } from "@/components/plant-detail/CheckInOverlay";
import { Warning, Plus } from "@phosphor-icons/react";
import type { HealthEntry, HealthIssue } from "@/types/database";

interface HealthTabProps {
  plantId: string;
  healthTimeline: HealthEntry[];
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

function HealthTrendChart({ entries }: { entries: HealthEntry[] }) {
  if (entries.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center bg-white/5 rounded-lg border border-white/5">
        <p className="text-sm text-white/60">
          Need at least 2 check-ins for trend
        </p>
      </div>
    );
  }

  // Show last 7 entries in reverse order (oldest first)
  const chartEntries = entries.slice(0, 7).reverse();
  const maxScore = 100;
  const minScore = 0;

  return (
    <div className="h-32 flex items-end justify-between gap-1 px-2">
      {chartEntries.map((entry, i) => {
        const height = ((entry.health_score - minScore) / (maxScore - minScore)) * 100;
        const isLatest = i === chartEntries.length - 1;

        return (
          <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t transition-all ${
                isLatest ? "bg-gradient-to-t from-neon-emerald/50 to-neon-emerald shadow-[0_0_15px_rgba(34,211,138,0.6)]" : "bg-neon-emerald/20"
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

function HealthTimelineEntry({ entry }: { entry: HealthEntry }) {
  const issues = (entry.issues as unknown as HealthIssue[]) || [];

  return (
    <div className="flex gap-3 py-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors -mx-2 px-2 rounded-lg">
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
        <Image
          src={entry.photo_url}
          alt="Health check"
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/60">{formatDate(entry.created_at)}</span>
          <div className="flex items-center gap-1">
            <HealthRing score={entry.health_score} size={28} strokeWidth={3} />
          </div>
        </div>
        {entry.ai_notes && (
          <p className="text-sm text-white/80 line-clamp-2">{entry.ai_notes}</p>
        )}
        {issues.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {issues.map((issue, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-0.5 rounded-full border backdrop-blur-sm ${
                  issue.severity === "high"
                    ? "bg-coral/20 text-coral border-coral/30"
                    : issue.severity === "medium"
                    ? "bg-amber/20 text-amber border-amber/30"
                    : "bg-neon-emerald/20 text-neon-emerald border-neon-emerald/30"
                }`}
              >
                {issue.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HealthTab({ plantId, healthTimeline }: HealthTabProps) {
  const latestEntry = healthTimeline[0];
  const healthTrend =
    healthTimeline.length >= 2
      ? healthTimeline[0].health_score - healthTimeline[1].health_score
      : null;

  return (
    <div className="space-y-4">
      {/* Current Health Score Card */}
      <Card hover={false}>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-white">
                Current Health
              </h3>
              {healthTrend !== null && (
                <p
                  className={`text-sm tracking-wide ${
                    healthTrend > 0
                      ? "text-neon-emerald"
                      : healthTrend < 0
                      ? "text-coral"
                      : "text-white/60"
                  }`}
                >
                  {healthTrend > 0 ? "↑" : healthTrend < 0 ? "↓" : "→"}{" "}
                  {healthTrend > 0 ? "+" : ""}
                  {healthTrend} since last check
                </p>
              )}
            </div>
            <HealthRing
              score={latestEntry?.health_score ?? 75}
              size={64}
              strokeWidth={6}
            />
          </div>

          {/* AI Insights Summary */}
          {latestEntry?.ai_notes && (
            <div className="mb-4 p-4 bg-neon-emerald/5 rounded-xl border border-neon-emerald/20 flex gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-emerald shadow-[0_0_10px_rgba(34,211,138,0.8)]" />
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center border border-white/5">
                <Warning weight="fill" className="text-neon-emerald text-xl" />
              </div>
              <div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {latestEntry.ai_notes}
                </p>
              </div>
            </div>
          )}

          {/* Trend Chart */}
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 border-b border-white/5 pb-2">
            Health Trend
          </h4>
          <HealthTrendChart entries={healthTimeline} />
        </CardContent>
      </Card>

      {/* Health Timeline */}
      <Card hover={false}>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-white">
              Health Timeline
            </h3>
            <CheckInOverlay plantId={plantId} className="w-auto shrink-0">
              <button 
                type="button" 
                className="group flex items-center gap-1.5 p-2 -mr-2 hover:bg-neon-emerald/10 rounded-lg transition-colors cursor-pointer"
              >
                <Plus weight="bold" className="text-neon-emerald text-sm" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-neon-emerald font-semibold group-hover:text-neon-emerald/80 transition-colors">
                  New Check-in
                </span>
              </button>
            </CheckInOverlay>
          </div>

          {healthTimeline.length > 0 ? (
            <div className="divide-y divide-white/10 mt-2">
              {healthTimeline.slice(0, 5).map((entry) => (
                <HealthTimelineEntry key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-white/60 mb-4">
                No health check-ins yet. Upload a photo to start tracking.
              </p>
              <CheckInOverlay plantId={plantId}>
                <div className="mx-auto w-max">
                  <ActionButton variant="primary" size="sm">
                    Upload Photo for Analysis
                  </ActionButton>
                </div>
              </CheckInOverlay>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
