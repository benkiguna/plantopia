import { MobileShell } from "@/components/MobileShell";
import { ActionButton, HealthRing, Card, CardContent } from "@/components/ui";

interface PlantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlantDetailPage({ params }: PlantDetailPageProps) {
  const { id } = await params;

  return (
    <MobileShell showBack showNav={false}>
      {/* Hero Image */}
      <div className="relative h-80 bg-green-light/20">
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
            <path d="M12 2L2 7v15h20V7L12 2z" />
            <path d="M12 22V12" />
            <path d="M12 12L2 7" />
            <path d="M12 12l10-5" />
          </svg>
        </div>
        <div className="absolute bottom-4 right-4">
          <div className="bg-forest/60 backdrop-blur-sm rounded-full p-2">
            <HealthRing score={85} size={56} strokeWidth={5} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h1 className="text-2xl font-display font-bold text-white">
            Plant Name
          </h1>
          <p className="text-white/80">Species Name</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-b border-forest/10">
        <div className="flex justify-around">
          {[
            { icon: "droplet", label: "Water" },
            { icon: "flower", label: "Feed" },
            { icon: "spray", label: "Mist" },
            { icon: "rotate", label: "Rotate" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-1 p-2 text-forest/70 hover:text-green transition-colors"
            >
              <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
                <span className="text-green text-sm font-medium">
                  {action.label[0]}
                </span>
              </div>
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="px-4 py-4">
        <div className="flex gap-2 border-b border-forest/10 pb-4 mb-4">
          {["Health", "Care", "AI Insights", "Setup"].map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-green text-cream"
                  : "text-forest/60 hover:bg-forest/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Health Tab Content Placeholder */}
        <div className="space-y-4">
          <Card hover={false}>
            <CardContent>
              <h3 className="font-display font-semibold text-forest mb-2">
                Health Timeline
              </h3>
              <p className="text-sm text-forest/60">
                No health check-ins yet. Upload a photo to start tracking.
              </p>
              <div className="mt-4">
                <ActionButton variant="primary" size="sm">
                  Upload Photo for Analysis
                </ActionButton>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-forest/40 py-4">
            Plant ID: {id}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
