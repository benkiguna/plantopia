import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "green" | "coral" | "amber" | "sky" | "forest";
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "green",
  pulse = false,
  className = "",
}: BadgeProps) {
  const variants = {
    green: "bg-green-light/20 text-green",
    coral: "bg-coral/20 text-coral",
    amber: "bg-amber/20 text-amber",
    sky: "bg-sky/20 text-sky",
    forest: "bg-forest/20 text-forest",
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
        ${variants[variant]}
        ${pulse ? "animate-pulse" : ""}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
