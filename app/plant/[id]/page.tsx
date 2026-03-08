import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { HealthRing } from "@/components/ui";
import { getPlant, getHealthTimeline, getCareLog, getPlantCareSchedule } from "@/lib/data";
import { PlantDetailTabs } from "@/components/plant-detail/PlantDetailTabs";
import { QuickCareActions } from "@/components/plant-detail/QuickCareActions";

interface PlantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
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

  // Get care schedule based on species
  const careSchedule = await getPlantCareSchedule(id, plant.species);

  const latestHealth = healthTimeline[0] ?? null;
  const healthScore = latestHealth?.health_score ?? 75;
  const photoUrl = latestHealth?.photo_url;
  const speciesName = plant.species?.name ?? "Unknown Species";

  return (
    <MobileShell showBack showNav={false}>
      {/* Hero Image */}
      <div className="relative h-80 bg-green-light/20">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={plant.nickname}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-24 h-24 text-green/30"
            >
              <path d="M7 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2" />
              <path d="M12 12a5 5 0 0 0-5 5" />
              <path d="M12 12a5 5 0 0 1 5 5" />
              <path d="M12 3v9" />
            </svg>
          </div>
        )}

        {/* Camera button for new photo */}
        <Link
          href={`/plant/${id}/check-in`}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-forest"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </Link>

        {/* Health ring */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-forest/60 backdrop-blur-sm rounded-full p-2">
            <HealthRing score={healthScore} size={56} strokeWidth={5} />
          </div>
        </div>

        {/* Plant info with gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h1 className="text-2xl font-display font-bold text-white">
            {plant.nickname}
          </h1>
          <p className="text-white/80">{speciesName}</p>
        </div>
      </div>

      {/* Quick Care Actions */}
      <QuickCareActions plantId={id} careSchedule={careSchedule} />

      {/* Tabs */}
      <PlantDetailTabs
        plant={plant}
        healthTimeline={healthTimeline}
        careLog={careLog}
        careSchedule={careSchedule}
      />
    </MobileShell>
  );
}
