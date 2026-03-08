"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, HealthRing, Badge, ActionButton } from "@/components/ui";
import type { PlantWithLatestHealth } from "@/types/database";

interface PlantCardProps {
  plant: PlantWithLatestHealth;
  onWater?: () => void;
  onFeed?: () => void;
}

export function PlantCard({ plant, onWater, onFeed }: PlantCardProps) {
  const healthScore = plant.latest_health_entry?.health_score ?? 75;
  const photoUrl = plant.latest_health_entry?.photo_url;
  const speciesName = plant.species?.name ?? "Unknown Species";

  return (
    <Card>
      <Link href={`/plant/${plant.id}`}>
        <div className="relative h-48">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={plant.nickname}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-green-light/20 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-green/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 2L2 7v15h20V7L12 2z"
                />
              </svg>
            </div>
          )}
          <div className="absolute bottom-3 right-3">
            <div className="bg-forest/60 backdrop-blur-sm rounded-full p-1">
              <HealthRing score={healthScore} size={44} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-lg font-display font-semibold text-white">
              {plant.nickname}
            </h3>
            <p className="text-sm text-white/80">{speciesName}</p>
          </div>
        </div>
      </Link>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="green">{plant.light_setup.replace(/_/g, " ")}</Badge>
        </div>
        <div className="flex gap-2">
          <ActionButton variant="secondary" size="sm" onClick={onWater}>
            Water
          </ActionButton>
          <ActionButton variant="ghost" size="sm" onClick={onFeed}>
            Feed
          </ActionButton>
          <Link href={`/plant/${plant.id}`}>
            <ActionButton variant="ghost" size="sm">
              Check-in
            </ActionButton>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
