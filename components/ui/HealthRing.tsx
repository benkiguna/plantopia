interface HealthRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function HealthRing({
  score,
  size = 48,
  strokeWidth = 4,
  className = "",
}: HealthRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getColor = (score: number): string => {
    if (score >= 80) return "var(--neon-emerald)";
    if (score >= 60) return "var(--amber)";
    return "var(--coral)";
  };

  const getGlowColor = (score: number): string => {
    if (score >= 80) return "rgba(34, 211, 138, 0.6)";
    if (score >= 60) return "rgba(229, 151, 15, 0.6)";
    return "rgba(217, 79, 59, 0.6)";
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 overflow-visible"
        aria-label={`Health score: ${score}%`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${getGlowColor(score)})` }}
        />
      </svg>
      <span className="absolute text-[13px] font-display font-bold text-white tracking-wide">
        {score}
      </span>
    </div>
  );
}
