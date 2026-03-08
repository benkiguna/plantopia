"use client";

import { useState } from "react";
import { HealthTab } from "./tabs/HealthTab";
import { CareTab } from "./tabs/CareTab";
import { AIInsightsTab } from "./tabs/AIInsightsTab";
import { SetupTab } from "./tabs/SetupTab";
import type { PlantWithSpecies, HealthEntry, CareLog } from "@/types/database";
import type { CareSchedule } from "@/lib/data/care";

interface PlantDetailTabsProps {
  plant: PlantWithSpecies;
  healthTimeline: HealthEntry[];
  careLog: CareLog[];
  careSchedule: CareSchedule;
}

const tabs = ["Health", "Care", "AI Insights", "Setup"] as const;
type Tab = (typeof tabs)[number];

export function PlantDetailTabs({
  plant,
  healthTimeline,
  careLog,
  careSchedule,
}: PlantDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Health");

  return (
    <div className="mt-8 mb-12 px-6">
      <div className="flex space-x-6 border-b border-white/10 mb-6 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "text-neon-emerald border-b-2 border-neon-emerald"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "Health" && (
          <HealthTab plantId={plant.id} healthTimeline={healthTimeline} />
        )}
        {activeTab === "Care" && (
          <CareTab
            plant={plant}
            careLog={careLog}
            careSchedule={careSchedule}
          />
        )}
        {activeTab === "AI Insights" && (
          <AIInsightsTab
            plantId={plant.id}
            healthTimeline={healthTimeline}
            species={plant.species}
          />
        )}
        {activeTab === "Setup" && <SetupTab plant={plant} />}
      </div>
    </div>
  );
}
