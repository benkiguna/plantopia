"use client";

import { ReactNode } from "react";
import { Card, CardContent, Badge } from "@/components/ui";
import { Drop, Flask, Wind, ArrowsClockwise, Plant, Scissors, Lightbulb, Note } from "@phosphor-icons/react";
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

const actionIcons: Record<string, ReactNode> = {
  water: <Drop weight="fill" className="text-sky" />,
  fertilize: <Flask weight="fill" className="text-amber" />,
  mist: <Wind weight="fill" className="text-slate-300" />,
  rotate: <ArrowsClockwise weight="bold" className="text-neon-emerald" />,
  repot: <Plant weight="fill" className="text-green" />,
  prune: <Scissors weight="fill" className="text-gray-400" />,
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
    <div className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors -mx-2 px-2 rounded-lg">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-xl">
        {actionIcons[entry.action] || <Note weight="fill" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">
          {actionLabels[entry.action] || entry.action}
        </p>
        {entry.notes && (
          <p className="text-xs text-white/50">{entry.notes}</p>
        )}
      </div>
      <span className="text-xs text-white/40">
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
          <h3 className="font-display font-semibold text-white mb-3">
            Care Schedule
          </h3>
          <div className="space-y-3">
            {/* Water */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky/20 border border-sky/30 flex items-center justify-center flex-shrink-0 text-sky text-xl">
                  <Drop weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Water</p>
                  <p className="text-xs text-white/60">
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
                  <p className="text-[10px] text-white/40 mt-1">
                    Last: {formatDate(careSchedule.water.lastDate.toISOString())}
                  </p>
                )}
              </div>
            </div>

            {/* Fertilize */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber/20 border border-amber/30 flex items-center justify-center flex-shrink-0 text-amber text-xl">
                  <Flask weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Fertilize</p>
                  <p className="text-xs text-white/60">
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
                  <p className="text-[10px] text-white/40 mt-1">
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
            <h3 className="font-display font-semibold text-white mb-3">
              {species.name} Care Guide
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-center shadow-inner">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Light</p>
                <p className="text-sm font-semibold text-white capitalize">
                  {species.light.replace(/_/g, " ")}
                </p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-center shadow-inner">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Humidity</p>
                <p className="text-sm font-semibold text-white capitalize">
                  {species.humidity}
                </p>
              </div>
            </div>
            {species.tip && (
              <div className="p-3 bg-neon-emerald/10 rounded-lg border border-neon-emerald/20">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb weight="fill" className="text-lg text-amber" />
                  <p className="text-[10px] font-mono text-neon-emerald font-semibold uppercase tracking-widest">Pro Tip</p>
                </div>
                <p className="text-sm text-white/90 leading-relaxed">{species.tip}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      <Card hover={false}>
        <CardContent>
          <h3 className="font-display font-semibold text-white mb-3">
            Activity Log
          </h3>
          {careLog.length > 0 ? (
            <div>
              {careLog.slice(0, 10).map((entry) => (
                <CareLogEntry key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50 text-center py-6 bg-white/5 rounded-xl border border-white/5 border-dashed">
              No care activities logged yet. Use the quick actions above to
              start tracking.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
