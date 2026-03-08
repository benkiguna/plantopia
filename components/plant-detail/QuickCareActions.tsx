"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CareSchedule } from "@/lib/data/care";

interface QuickCareActionsProps {
  plantId: string;
  careSchedule: CareSchedule;
}

const careActions = [
  { action: "water", label: "Water", icon: "💧" },
  { action: "fertilize", label: "Feed", icon: "🌱" },
  { action: "mist", label: "Mist", icon: "💨" },
  { action: "rotate", label: "Rotate", icon: "🔄" },
] as const;

export function QuickCareActions({ plantId, careSchedule }: QuickCareActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [recentActions, setRecentActions] = useState<Set<string>>(new Set());

  const handleCareAction = async (action: string) => {
    setLoading(action);
    try {
      const response = await fetch("/api/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantId, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to log care action");
      }

      // Mark as recently completed
      setRecentActions((prev) => new Set([...prev, action]));

      // Refresh to update care schedule
      router.refresh();

      // Remove from recent after 3 seconds
      setTimeout(() => {
        setRecentActions((prev) => {
          const next = new Set(prev);
          next.delete(action);
          return next;
        });
      }, 3000);
    } catch (error) {
      console.error("Error logging care action:", error);
    } finally {
      setLoading(null);
    }
  };

  const isOverdue = (action: string): boolean => {
    if (action === "water") return careSchedule.water.isOverdue;
    if (action === "fertilize") return careSchedule.fertilize.isOverdue;
    return false;
  };

  return (
    <div className="px-4 py-4 border-b border-forest/10">
      <div className="flex justify-around">
        {careActions.map(({ action, label, icon }) => {
          const isLoading = loading === action;
          const isRecent = recentActions.has(action);
          const needsAttention = isOverdue(action);

          return (
            <button
              key={action}
              onClick={() => handleCareAction(action)}
              disabled={isLoading}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                isRecent
                  ? "text-green scale-110"
                  : needsAttention
                  ? "text-amber-600"
                  : "text-forest/70 hover:text-green"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isRecent
                    ? "bg-green/20 ring-2 ring-green"
                    : needsAttention
                    ? "bg-amber-100 ring-2 ring-amber-400"
                    : "bg-green/10"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-green/30 border-t-green rounded-full animate-spin" />
                ) : isRecent ? (
                  <svg
                    className="w-5 h-5 text-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-xl">{icon}</span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
              {needsAttention && !isRecent && (
                <span className="text-[10px] text-amber-600">Overdue</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
