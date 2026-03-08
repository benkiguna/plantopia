import Link from "next/link";
import Image from "next/image";
import { PlantWithLatestHealth } from "@/types/database";

interface SpecimenCarouselProps {
  plants: PlantWithLatestHealth[];
  activeId: string;
}

export function SpecimenCarousel({ plants, activeId }: SpecimenCarouselProps) {
  if (!plants || plants.length === 0) return null;

  return (
    <div className="flex overflow-x-auto pb-4 -mx-6 px-6 gap-4 no-scrollbar snap-x">
      {plants.map((plant) => {
        const isActive = plant.id === activeId;
        const photoUrl = plant.latest_health_entry?.photo_url;
        
        return (
          <Link
            key={plant.id}
            href={`/plant/${plant.id}`}
            className={`relative w-40 h-28 rounded-2xl overflow-hidden shrink-0 snap-start transition-all duration-300 ${
              isActive 
                ? "border-2 border-neon-emerald shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]" 
                : "border border-white/5 hover:border-white/20 opacity-60 hover:opacity-100"
            }`}
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={plant.nickname}
                fill
                className="object-cover mix-blend-luminosity brightness-75"
                sizes="(max-width: 768px) 160px"
              />
            ) : (
              <div className="absolute inset-0 bg-charcoal-light flex items-center justify-center">
                <span className="text-2xl opacity-30">🪴</span>
              </div>
            )}
            
            {/* Gradient overlay to ensure text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent"></div>
            
            <div className="absolute bottom-3 left-3 right-3">
              <span className={`block font-mono text-[10px] tracking-widest uppercase truncate ${isActive ? "text-neon-emerald font-bold" : "text-white/70"}`}>
                {plant.nickname}
              </span>
            </div>
          </Link>
        );
      })}
      
      {/* Add new plant card */}
      <Link 
        href="/add"
        className="relative w-28 h-28 rounded-2xl border border-dashed border-white/20 shrink-0 snap-start flex flex-col items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
      >
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </Link>
    </div>
  );
}
