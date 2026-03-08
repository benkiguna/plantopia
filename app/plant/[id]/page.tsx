import { notFound } from "next/navigation";
import Image from "next/image";
import { MobileShell } from "@/components/MobileShell";
import { getPlant, getHealthTimeline, getPlantCareSchedule, getPlants, getCareLog } from "@/lib/data";
import { QuickCareActions } from "@/components/plant-detail/QuickCareActions";
import { SpecimenCarousel } from "@/components/plant-detail/SpecimenCarousel";
import { CheckInOverlay } from "@/components/plant-detail/CheckInOverlay";
import { WarningIcon } from "@/components/ui/WarningIcon";
import { PlantDetailTabs } from "@/components/plant-detail/PlantDetailTabs";
import { createSimpleServerClient } from "@/lib/supabase/server";
import type { PlantWithSpecies } from "@/types/database";

interface PlantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { id } = await params;
  
  // Get user session to fetch all plants for carousel
  const supabase = createSimpleServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Fetch all plant data in parallel
  const [plant, healthTimeline, userPlants, careLog] = await Promise.all([
    getPlant(id),
    getHealthTimeline(id),
    userId ? getPlants(userId) : Promise.resolve([]),
    getCareLog(id)
  ]);

  if (!plant) {
    notFound();
  }

  // Get care schedule based on species
  const careSchedule = await getPlantCareSchedule(id, plant.species);

  const latestHealth = healthTimeline[0] ?? null;
  const healthScore = latestHealth?.health_score ?? 75;
  const photoUrl = latestHealth?.photo_url;
  const speciesName = plant.species?.name ?? "Unknown Species";

  const isInterventionRequired = healthScore < 60 || (latestHealth?.issues && (latestHealth.issues as Record<string, unknown>[]).length > 0);

  return (
    <MobileShell showBack topBarContent={
      <div className="flex justify-between w-full font-mono text-xs uppercase tracking-widest text-white/70">
        <span>Project / My Garden</span>
      </div>
    } transparentHeader>
      
      {/* Hero Stage */}
      <div className="relative h-96 w-full bg-charcoal overflow-hidden pt-16">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={plant.nickname}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E20]/40 to-charcoal"></div>
        )}
        
        {/* Top-right camera / scanner btn */}
        <CheckInOverlay plantId={id} />
        
        {/* Gradient overlays for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-transparent to-transparent z-0"></div>

        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="flex justify-between items-end">
            <div>
              {/* Plant typography */}
              <h1 className="text-6xl md:text-7xl font-display font-bold italic text-white leading-none tracking-tight -ml-1">
                {plant.nickname}
              </h1>
              <p className="text-white/60 font-mono text-sm tracking-widest mt-4 uppercase">
                {speciesName}
              </p>
            </div>
            
            {/* Health Pulse Component */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase mb-1 mr-4">
                Health Status
              </span>
              <div className="flex items-end">
                <span className="text-5xl font-bold text-neon-emerald leading-none mr-2">
                  {healthScore}%
                </span>
                {/* Vertical liquid bar representation */}
                <div className="w-1.5 h-16 bg-white/10 rounded-full overflow-hidden flex flex-col justify-end">
                  <div 
                    className="w-full bg-neon-emerald transition-all duration-1000 ease-out"
                    style={{ height: `${healthScore}%`, boxShadow: '0 0 10px #10B981' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tray */}
      <QuickCareActions plantId={id} careSchedule={careSchedule} lightSetup={plant.light_setup} />

      {/* Dynamic Main Rest Of Page */}
      <div className="px-6 py-6 pb-24">
        
        <div className="mb-10">
          <h3 className="text-xs font-mono text-white/50 tracking-widest uppercase mb-4">Active Specimens</h3>
          <SpecimenCarousel plants={userPlants} activeId={id} />
        </div>

        {/* Insight / Intervention Card */}
        {isInterventionRequired && (
          <div className="w-full bg-gradient-to-br from-emerald to-[#084024] p-6 rounded-[24px] border border-neon-emerald/30 shadow-[0_0_30px_-5px_var(--color-emerald)]">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-charcoal rounded-xl flex items-center justify-center mr-4 text-neon-emerald shadow-inner flex-shrink-0">
                <WarningIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-neon-emerald font-bold font-mono tracking-wide text-sm mb-1 uppercase">AI Intervention Required</h4>
                <p className="text-white/80 text-sm leading-relaxed font-body">
                  {latestHealth?.ai_notes || "Anomaly detected in recent health scan. Immediate attention to environmental conditions is recommended to prevent rapid decline."}
                </p>
                <CheckInOverlay plantId={id}>
                  <button className="mt-4 inline-block px-5 py-2 bg-charcoal text-neon-emerald font-mono text-xs rounded-full hover:bg-black transition-colors">
                    SCAN AGAIN -&gt;
                  </button>
                </CheckInOverlay>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Region */}
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
