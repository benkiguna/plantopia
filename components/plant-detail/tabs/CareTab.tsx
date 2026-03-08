"use client";

import { Card, CardContent, Badge } from "@/components/ui";
import type { PlantWithSpecies, CareLog } from "@/types/database";
import type { CareSchedule } from "@/lib/data/care";

interface CareTabProps {
  plant: PlantWithSpecies;
  careLog: CareLog[];
  careSchedule: CareSchedule;
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

function formatFutureDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Overdue";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const actionIcons: Record<string, string> = {
  water: "💧",
  fertilize: "🌱",
  mist: "💨",
  rotate: "🔄",
  repot: "🪴",
  prune: "✂️",
};

const actionLabels: Record<string, string> = {
  water: "Watered",
  fertilize: "Fertilized",
  mist: "Misted",
  rotate: "Rotated",
  repot: "Repotted",
  prune: "Pruned",
};

function CareLogEntry({ entry }: { entry: CareLog }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-forest/10 last:border-0">
      <span className="text-xl">{actionIcons[entry.action] || "📝"}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-forest">
          {actionLabels[entry.action] || entry.action}
        </p>
        {entry.notes && (
          <p className="text-xs text-forest/60">{entry.notes}</p>
        )}
      </div>
      <span className="text-xs text-forest/50">
        {formatDate(entry.created_at)}
      </span>
    </div>
  );
}

export function CareTab({ plant, careLog, careSchedule }: CareTabProps) {
  const species = plant.species;

  return (
    <div className="space-y-4">
      {/* Care Schedule */}
      <Card hover={false}>
        <CardContent>
          <h3 className="font-display font-semibold text-forest mb-3">
            Care Schedule
          </h3>
          <div className="space-y-3">
            {/* Water */}
            <div className="flex items-center justify-between p-3 bg-forest/5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">💧</span>
                <div>
                  <p className="text-sm font-medium text-forest">Water</p>
                  <p className="text-xs text-forest/60">
                    Every {species?.water_days || 7} days
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={careSchedule.water.isOverdue ? "warning" : "green"}
                >
                  {formatFutureDate(careSchedule.water.nextDate)}
                </Badge>
                {careSchedule.water.lastDate && (
                  <p className="text-[10px] text-forest/50 mt-1">
                    Last: {formatDate(careSchedule.water.lastDate.toISOString())}
                  </p>
                )}
              </div>
            </div>

            {/* Fertilize */}
            <div className="flex items-center justify-between p-3 bg-forest/5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌱</span>
                <div>
                  <p className="text-sm font-medium text-forest">Fertilize</p>
                  <p className="text-xs text-forest/60">
                    Every {species?.fertilize_days || 30} days
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    careSchedule.fertilize.isOverdue ? "warning" : "green"
                  }
                >
                  {formatFutureDate(careSchedule.fertilize.nextDate)}
                </Badge>
                {careSchedule.fertilize.lastDate && (
                  <p className="text-[10px] text-forest/50 mt-1">
                    Last:{" "}
                    {formatDate(careSchedule.fertilize.lastDate.toISOString())}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Species Care Guide */}
      {species && (
        <Card hover={false}>
          <CardContent>
            <h3 className="font-display font-semibold text-forest mb-3">
              {species.name} Care Guide
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-forest/5 rounded-lg">
                <p className="text-xs text-forest/60 mb-1">Light</p>
                <p className="text-sm font-medium text-forest capitalize">
                  {species.light.replace(/_/g, " ")}
                </p>
              </div>
              <div className="p-3 bg-forest/5 rounded-lg">
                <p className="text-xs text-forest/60 mb-1">Humidity</p>
                <p className="text-sm font-medium text-forest capitalize">
                  {species.humidity}
                </p>
              </div>
            </div>
            {species.tip && (
              <div className="p-3 bg-green/10 rounded-lg border border-green/20">
                <p className="text-xs text-green font-medium mb-1">Pro Tip</p>
                <p className="text-sm text-forest">{species.tip}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card hover={false}>
        <CardContent>
          <h3 className="font-display font-semibold text-forest mb-3">
            Activity Log
          </h3>
          {careLog.length > 0 ? (
            <div>
              {careLog.slice(0, 10).map((entry) => (
                <CareLogEntry key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-forest/60 text-center py-4">
              No care activities logged yet. Use the quick actions above to
              start tracking.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
