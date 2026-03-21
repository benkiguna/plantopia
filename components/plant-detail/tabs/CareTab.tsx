"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui";
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

interface ScheduleRowProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  frequencyLabel: string;
  isDefault?: boolean;
  nextLabel: string;
  isOverdue: boolean;
  lastLabel: string | null;
}

function ScheduleRow({
  icon,
  iconBg,
  label,
  frequencyLabel,
  isDefault,
  nextLabel,
  isOverdue,
  lastLabel,
}: ScheduleRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {frequencyLabel}
            {isDefault && (
              <span className="ml-1 text-white/25 italic">· species default</span>
            )}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
            isOverdue
              ? "bg-coral/10 border-coral/30 text-coral"
              : "bg-neon-emerald/10 border-neon-emerald/20 text-neon-emerald"
          }`}
        >
          {nextLabel}
        </span>
        {lastLabel && (
          <p className="text-[10px] text-white/30 mt-1">Last: {lastLabel}</p>
        )}
      </div>
    </div>
  );
}

export function CareTab({ plant, careLog, careSchedule }: CareTabProps) {
  const species = plant.species;

  // Derive last mist/rotate dates from careLog
  const lastMistEntry = careLog.find((e) => e.action === "mist");
  const lastRotateEntry = careLog.find((e) => e.action === "rotate");

  const lastMistLabel = lastMistEntry ? formatDate(lastMistEntry.created_at) : null;
  const lastRotateLabel = lastRotateEntry ? formatDate(lastRotateEntry.created_at) : null;

  // Compute next mist/rotate (every 3 / every 7 days respectively)
  const now = new Date();
  const mistNext = lastMistEntry
    ? (() => {
        const d = new Date(lastMistEntry.created_at);
        d.setDate(d.getDate() + 3);
        return d;
      })()
    : null;
  const rotateNext = lastRotateEntry
    ? (() => {
        const d = new Date(lastRotateEntry.created_at);
        d.setDate(d.getDate() + 7);
        return d;
      })()
    : null;

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
            <ScheduleRow
              icon={<Drop weight="fill" />}
              iconBg="bg-sky/20 border border-sky/30 text-sky"
              label="Water"
              frequencyLabel={`Every ${species?.water_days || 7} days`}
              isDefault={true}
              nextLabel={formatFutureDate(careSchedule.water.nextDate)}
              isOverdue={careSchedule.water.isOverdue}
              lastLabel={
                careSchedule.water.lastDate
                  ? formatDate(careSchedule.water.lastDate.toISOString())
                  : null
              }
            />

            {/* Fertilize */}
            <ScheduleRow
              icon={<Flask weight="fill" />}
              iconBg="bg-amber/20 border border-amber/30 text-amber"
              label="Fertilize"
              frequencyLabel={`Every ${species?.fertilize_days || 30} days`}
              isDefault={true}
              nextLabel={formatFutureDate(careSchedule.fertilize.nextDate)}
              isOverdue={careSchedule.fertilize.isOverdue}
              lastLabel={
                careSchedule.fertilize.lastDate
                  ? formatDate(careSchedule.fertilize.lastDate.toISOString())
                  : null
              }
            />

            {/* Mist */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-400/10 border border-slate-400/20 flex items-center justify-center flex-shrink-0 text-xl text-slate-300">
                  <Wind weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Mist</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Every 3 days
                    <span className="ml-1 text-white/25 italic">· recommended</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                {mistNext ? (
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      mistNext < now
                        ? "bg-coral/10 border-coral/30 text-coral"
                        : "bg-neon-emerald/10 border-neon-emerald/20 text-neon-emerald"
                    }`}
                  >
                    {formatFutureDate(mistNext)}
                  </span>
                ) : (
                  <span className="text-[10px] text-white/25 italic">Never logged</span>
                )}
                {lastMistLabel && (
                  <p className="text-[10px] text-white/30 mt-1">Last: {lastMistLabel}</p>
                )}
              </div>
            </div>

            {/* Rotate */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-emerald/10 border border-neon-emerald/20 flex items-center justify-center flex-shrink-0 text-xl text-neon-emerald">
                  <ArrowsClockwise weight="bold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Rotate</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Every 7 days
                    <span className="ml-1 text-white/25 italic">· for even growth</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                {rotateNext ? (
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      rotateNext < now
                        ? "bg-coral/10 border-coral/30 text-coral"
                        : "bg-neon-emerald/10 border-neon-emerald/20 text-neon-emerald"
                    }`}
                  >
                    {formatFutureDate(rotateNext)}
                  </span>
                ) : (
                  <span className="text-[10px] text-white/25 italic">Never logged</span>
                )}
                {lastRotateLabel && (
                  <p className="text-[10px] text-white/30 mt-1">Last: {lastRotateLabel}</p>
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
              {careLog.length > 10 && (
                <p className="text-center text-[10px] text-white/25 pt-3 font-mono uppercase tracking-widest">
                  Showing 10 of {careLog.length} activities
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/50 text-center py-6 bg-white/5 rounded-xl border border-white/5 border-dashed">
              No care activities logged yet. Use the quick actions above to start tracking.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
