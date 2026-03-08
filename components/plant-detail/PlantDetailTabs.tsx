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
    <div className="px-4 py-4">
      {/* Tab buttons */}
      <div className="flex gap-2 border-b border-forest/10 pb-4 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "bg-green text-cream"
                : "text-forest/60 hover:bg-forest/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
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
