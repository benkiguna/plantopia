"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HealthGauge } from "./HealthGauge";

interface PlantDetailHeroProps {
  plantId: string;
  photoUrl: string | undefined;
  nickname: string;
  speciesName: string | null;
  healthScore: number;
}


export function PlantDetailHero({
  plantId,
  photoUrl,
  nickname,
  speciesName,
  healthScore,
}: PlantDetailHeroProps) {
  return (
    <div className="relative h-96 w-full overflow-hidden pt-16">
      {/* Shared photo element — layoutId matches PlantCard */}
      <motion.div
        layoutId={`plant-photo-${plantId}`}
        className="absolute inset-0"
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={nickname}
            fill
            className="object-cover opacity-90"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E20]/60 to-charcoal" />
        )}
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-transparent to-transparent z-0" />

      {/* Text content — fades in after photo settles */}
      <motion.div
        className="absolute bottom-6 left-6 right-6 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
      >
        <div className="flex justify-between items-end">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-5xl md:text-6xl font-display font-bold italic text-white leading-none tracking-tight -ml-1 line-clamp-2">
              {nickname}
            </h1>
            {speciesName && (
              <p className="text-white/50 font-mono text-xs tracking-widest mt-3 uppercase truncate">
                {speciesName}
              </p>
            )}
          </div>
          <div className="shrink-0">
            <HealthGauge score={healthScore} size={96} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
