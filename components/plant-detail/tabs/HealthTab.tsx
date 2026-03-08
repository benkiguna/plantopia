"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, ActionButton, HealthRing } from "@/components/ui";
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
      <div className="h-32 flex items-center justify-center bg-forest/5 rounded-lg">
        <p className="text-sm text-forest/60">
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
                isLatest ? "bg-green" : "bg-green/50"
              }`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-forest/50">
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
    <div className="flex gap-3 py-3 border-b border-forest/10 last:border-0">
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-forest/5">
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
          <span className="text-sm text-forest/60">{formatDate(entry.created_at)}</span>
          <div className="flex items-center gap-1">
            <HealthRing score={entry.health_score} size={28} strokeWidth={3} />
          </div>
        </div>
        {entry.ai_notes && (
          <p className="text-sm text-forest/80 line-clamp-2">{entry.ai_notes}</p>
        )}
        {issues.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {issues.map((issue, i) => (
              <span
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  issue.severity === "high"
                    ? "bg-red-100 text-red-700"
                    : issue.severity === "medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green/10 text-green"
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
              <h3 className="font-display font-semibold text-forest">
                Current Health
              </h3>
              {healthTrend !== null && (
                <p
                  className={`text-sm ${
                    healthTrend > 0
                      ? "text-green"
                      : healthTrend < 0
                      ? "text-red-500"
                      : "text-forest/60"
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

          {/* Trend Chart */}
          <h4 className="text-sm font-medium text-forest/70 mb-2">
            Health Trend
          </h4>
          <HealthTrendChart entries={healthTimeline} />
        </CardContent>
      </Card>

      {/* Health Timeline */}
      <Card hover={false}>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-forest">
              Health Timeline
            </h3>
            <Link href={`/plant/${plantId}/check-in`}>
              <ActionButton variant="primary" size="sm">
                New Check-in
              </ActionButton>
            </Link>
          </div>

          {healthTimeline.length > 0 ? (
            <div className="divide-y divide-forest/10">
              {healthTimeline.slice(0, 5).map((entry) => (
                <HealthTimelineEntry key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-forest/60 mb-4">
                No health check-ins yet. Upload a photo to start tracking.
              </p>
              <Link href={`/plant/${plantId}/check-in`}>
                <ActionButton variant="primary" size="sm">
                  Upload Photo for Analysis
                </ActionButton>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
