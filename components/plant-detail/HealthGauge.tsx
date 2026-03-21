export function HealthGauge({ score, size = 96 }: { score: number; size?: number }) {
  const strokeWidth = 9;
  const r = size / 2 - strokeWidth / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arcAngle = 270;
  const arcLength = (arcAngle / 360) * circumference;
  const gapLength = circumference - arcLength;
  const fillLength = Math.max(0, Math.min(1, score / 100)) * arcLength;

  const color = score >= 80 ? "#22D39A" : score >= 60 ? "#E5970F" : "#D94F3B";
  const colorDim = score >= 80 ? "#0E6644" : score >= 60 ? "#7A4D00" : "#7A2318";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      <defs>
        <linearGradient id="hg" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colorDim} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
        <filter id="hglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${arcLength} ${gapLength}`}
        strokeLinecap="round"
        transform={`rotate(135, ${cx}, ${cy})`}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="url(#hg)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${fillLength} ${circumference - fillLength}`}
        strokeLinecap="round"
        transform={`rotate(135, ${cx}, ${cy})`}
        filter="url(#hglow)"
      />
      <text
        x={cx} y={cy - size * 0.08}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize={size * 0.25}
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {score}
      </text>
      <text
        x={cx} y={cy + size * 0.17}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize={size * 0.1}
        fontFamily="monospace"
        letterSpacing={size * 0.025}
      >
        HEALTH
      </text>
    </svg>
  );
}
