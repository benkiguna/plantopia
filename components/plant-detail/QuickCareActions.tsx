"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CareSchedule } from "@/lib/data/care";

import { Drop, Flask, Wind, Sun, Check } from "@phosphor-icons/react";

interface QuickCareActionsProps {
  plantId: string;
  careSchedule: CareSchedule;
  lightSetup: string;
}

export function QuickCareActions({ plantId, careSchedule, lightSetup }: QuickCareActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [recentActions, setRecentActions] = useState<Set<string>>(new Set());

  const getDaysText = (nextDateStr: Date | string) => {
    const nextDate = new Date(nextDateStr);
    const diffTime = nextDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tmrw";
    return `In ${diffDays}d`;
  };

  const careActions = [
    { action: "water", label: "HYDRATION", icon: <Drop weight="bold" className="w-5 h-5" />, defaultStat: careSchedule.water ? getDaysText(careSchedule.water.nextDate) : "Unknown" },
    { action: "fertilize", label: "NUTRIENTS", icon: <Flask weight="bold" className="w-5 h-5" />, defaultStat: careSchedule.fertilize ? getDaysText(careSchedule.fertilize.nextDate) : "Unknown" },
    { action: "mist", label: "AERATION", icon: <Wind weight="bold" className="w-5 h-5" />, defaultStat: "Optimum" },
    { action: "rotate", label: "EXPOSURE", icon: <Sun weight="bold" className="w-5 h-5" />, defaultStat: lightSetup.replace(/_/g, " ") },
  ] as const;

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

      setRecentActions((prev) => new Set([...prev, action]));
      router.refresh();

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
    if (action === "water") return careSchedule.water?.isOverdue || false;
    if (action === "fertilize") return careSchedule.fertilize?.isOverdue || false;
    return false;
  };

  return (
    <div className="px-4 py-6 -mt-8 relative z-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {careActions.map(({ action, label, icon, defaultStat }) => {
          const isLoading = loading === action;
          const isRecent = recentActions.has(action);
          const needsAttention = isOverdue(action);

          return (
            <button
              key={action}
              onClick={() => handleCareAction(action)}
              disabled={isLoading}
              className={`flex flex-col items-start justify-between p-4 h-32 rounded-[32px] transition-all backdrop-blur-md border ${
                isRecent
                  ? "bg-neon-emerald/20 border-neon-emerald text-white"
                  : needsAttention
                  ? "bg-coral/10 border-coral/50 text-white"
                  : "bg-[#1A1C1B]/80 hover:bg-[#222524] border-white/5 text-white/50 hover:text-white"
              }`}
              style={{
                boxShadow: isRecent ? '0 0 20px rgba(34, 211, 138, 0.2)' : '0 10px 30px -10px rgba(0,0,0,0.5)'
              }}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isRecent
                    ? "bg-neon-emerald text-[#051F14]"
                    : needsAttention
                    ? "bg-coral text-white"
                    : "bg-[#2A2D2C] text-white"
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#1A1C1B] border-t-neon-emerald rounded-full animate-spin" />
                ) : isRecent ? (
                  <Check weight="bold" className="w-5 h-5" />
                ) : (
                  <span className="text-white">{icon}</span>
                )}
              </div>
              <div className="text-left mt-auto">
                <span className="text-[10px] font-mono tracking-widest block opacity-70 mb-1">{label}</span>
                <span className="text-sm font-bold block text-white">{defaultStat}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
