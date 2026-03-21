import { notFound } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import {
  getPlant,
  getHealthTimeline,
  getPlantCareSchedule,
  getCareLog,
} from "@/lib/data";
import { QuickCareActions } from "@/components/plant-detail/QuickCareActions";
import { PlantActionRow } from "@/components/plant-detail/PlantActionRow";
import { PlantDetailTabs } from "@/components/plant-detail/PlantDetailTabs";
import { PlantDetailHero } from "@/components/plant-detail/PlantDetailHero";
import type { PlantWithSpecies } from "@/types/database";

interface PlantDetailPageProps {
  params: Promise<{ id: string }>;
}


export default async function PlantDetailPage({
  params,
}: PlantDetailPageProps) {
  const { id } = await params;

  // Fetch all plant data in parallel
  const [plant, healthTimeline, careLog] = await Promise.all([
    getPlant(id),
    getHealthTimeline(id),
    getCareLog(id),
  ]);

  if (!plant) {
    notFound();
  }

  const careSchedule = await getPlantCareSchedule(id, plant.species, new Date(plant.created_at));

  const latestHealth = healthTimeline[0] ?? null;
  const healthScore = latestHealth?.health_score ?? 75;
  const photoUrl = latestHealth?.photo_url;
  const speciesName = plant.species?.name ?? "Unknown Species";

  return (
    <MobileShell
      showBack
      topBarContent={
        <div className="flex justify-between w-full font-mono text-xs uppercase tracking-widest text-white/70">
          <span>My Garden</span>
        </div>
      }
      transparentHeader
    >
      <PlantDetailHero
        plantId={id}
        photoUrl={photoUrl}
        nickname={plant.nickname}
        speciesName={plant.species ? speciesName : null}
        healthScore={healthScore}
      />

      {/* Action row: expandable warning icon + camera check-in */}
      <PlantActionRow
        plantId={id}
        previousScore={healthScore}
        healthScore={healthScore}
        hasIssues={
          !!(latestHealth?.issues &&
            (latestHealth.issues as Record<string, unknown>[]).length > 0)
        }
      />

      {/* Quick Care Actions */}
      <QuickCareActions
        plantId={id}
        careSchedule={careSchedule}
        lightSetup={plant.light_setup}
        careLog={careLog}
      />

      {/* Tabs */}
      <div className="px-0 py-2 pb-24">
        <PlantDetailTabs
          plant={plant as unknown as PlantWithSpecies}
          healthTimeline={healthTimeline}
          careLog={careLog}
          careSchedule={careSchedule}
        />
      </div>
    </MobileShell>
  );
}
