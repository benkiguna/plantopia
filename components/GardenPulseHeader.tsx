"use client";

import React, { useEffect, useRef } from "react";

// ── LOCKED SHAPE CONSTANTS — DO NOT CHANGE ───────────────────
const W = 620;
const H = 160;
const R = 32;
const LEFT_Y = 0;
const RIGHT_Y = 8;
const FLAT_LEFT_END = W * 0.44;
const PEAK_X = W * 0.685;
const FLAT_RIGHT_START = W * 0.84;
const PEAK_Y = -50;

const rise_cp1 = [FLAT_LEFT_END + (PEAK_X - FLAT_LEFT_END) * 0.5, LEFT_Y];
const rise_cp2 = [PEAK_X - (PEAK_X - FLAT_LEFT_END) * 0.28, PEAK_Y];
const fall_cp1 = [PEAK_X + (FLAT_RIGHT_START - PEAK_X) * 0.28, PEAK_Y];
const fall_cp2 = [
  FLAT_RIGHT_START - (FLAT_RIGHT_START - PEAK_X) * 0.4,
  RIGHT_Y,
];

const CARD_PATH = [
  `M ${R} ${LEFT_Y}`,
  `L ${FLAT_LEFT_END} ${LEFT_Y}`,
  `C ${rise_cp1[0].toFixed(1)} ${rise_cp1[1]}, ${rise_cp2[0].toFixed(1)} ${rise_cp2[1]}, ${PEAK_X.toFixed(1)} ${PEAK_Y}`,
  `C ${fall_cp1[0].toFixed(1)} ${fall_cp1[1]}, ${fall_cp2[0].toFixed(1)} ${fall_cp2[1]}, ${FLAT_RIGHT_START.toFixed(1)} ${RIGHT_Y}`,
  `L ${W - R} ${RIGHT_Y}`,
  `Q ${W} ${RIGHT_Y} ${W} ${RIGHT_Y + R}`,
  `L ${W} ${H - R}`,
  `Q ${W} ${H} ${W - R} ${H}`,
  `L ${R} ${H}`,
  `Q 0 ${H} 0 ${H - R}`,
  `L 0 ${LEFT_Y + R}`,
  `Q 0 ${LEFT_Y} ${R} ${LEFT_Y}`,
  `Z`,
].join(" ");

// ── LOCKED DROP ICON PATHS ────────────────────────────────────
const DROP_OUTLINE = `M 0 -14 C -1 -12, -10 -4, -10 4 C -10 10, -5 14, 0 14 C 5 14, 10 10, 10 4 C 10 -4, 1 -12, 0 -14 Z`;
const DROP_WATER = `M -10 4 C -10 10, -5 14, 0 14 C 5 14, 10 10, 10 4 Z`;

// ── LOCKED HEART PATH ─────────────────────────────────────────
const HEART_PATH = `M 0 4 C 0 1 -4 -5.5 -8.5 -3 C -13 -0.5 -11.5 7 0 14 C 11.5 7 13 -0.5 8.5 -3 C 4 -5.5 0 1 0 4 Z`;

// ── LAYOUT CONSTANTS ─────────────────────────────────────────
const COL_L = W * 0.2;
const COL_C = W * 0.5;
const COL_R = W * 0.8;
const NUM_Y = H * 0.5;
const LBL_Y = H * 0.82;
const RING_CY = H * 0.44;
const RING_R = 32;
const RING_ST = 4;
const PAD = 65;
const VIEWBOX = `-12 -${PAD} ${W + 24} ${H + PAD + 20}`;

// ── BACKGROUND — export this for use on your page/screen ─────
// Apply to the parent container / screen background
export const GARDEN_PULSE_BACKGROUND =
  "radial-gradient(ellipse at 40% 50%, #2a5c3a 0%, #183824 55%, #0c1e12 100%)";

// ─────────────────────────────────────────────────────────────

export function GardenPulseHeader({
  totalPlants = 5,
  avgHealth = 78,
  alerts = 2,
}) {
  const shimmerRef = useRef<SVGLinearGradientElement>(null);

  // Shimmer animation
  useEffect(() => {
    const grad: SVGLinearGradientElement = shimmerRef.current!;
    if (!grad) return;
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;
    function sweep() {
      const from = -200,
        to = W + 120,
        dur = 3200;
      const t0 = performance.now();
      function tick() {
        const t = Math.min((performance.now() - t0) / dur, 1);
        const x = from + t * (to - from);
        grad.setAttribute("x1", String(x));
        grad.setAttribute("x2", String(x + 200));
        if (t < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          timeoutId = setTimeout(sweep, 2800);
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    sweep();
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  const circ = 2 * Math.PI * RING_R;
  const healthPct = Math.min(Math.max(avgHealth, 0), 100) / 100;
  const dash = circ * healthPct;
  const gap = circ * (1 - healthPct);

  return (
    <div
      style={{
        width: "100%",
        padding: "0 10px",
        aspectRatio: `${W + 24} / ${H + PAD + 20}`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: "block",
          overflow: "visible",
          filter:
            "drop-shadow(0 24px 50px rgba(0,0,0,0.55)) drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
        }}
      >
        <defs>
          <clipPath id="cardClip">
            <path d={CARD_PATH} />
          </clipPath>

          {/* ── Glassmorphic base: semi-transparent white tint ── */}
          <linearGradient id="gGlass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.06} />
          </linearGradient>

          {/* ── Green colour tint — low opacity, lets bg show through ── */}
          <radialGradient
            id="gGreen"
            cx="32%"
            cy="48%"
            r="62%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#78d060" stopOpacity={0.55} />
            <stop offset="35%" stopColor="#3a9048" stopOpacity={0.42} />
            <stop offset="70%" stopColor="#1e6030" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#0e3018" stopOpacity={0.2} />
          </radialGradient>

          {/* ── Amber glow — bottom-right, warm bleed ── */}
          <radialGradient
            id="gAmber"
            cx="90%"
            cy="90%"
            r="55%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#c08030" stopOpacity={0.5} />
            <stop offset="50%" stopColor="#a06820" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#c08030" stopOpacity={0} />
          </radialGradient>

          {/* ── Top-left specular sheen ── */}
          <linearGradient id="gSheen" x1="0%" y1="0%" x2="45%" y2="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
            <stop offset="35%" stopColor="#ffffff" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          {/* ── Border: bright top-left → warm amber bottom-right ── */}
          <linearGradient id="gBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.7} />
            <stop offset="45%" stopColor="#ffffff" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#c07830" stopOpacity={0.55} />
          </linearGradient>

          {/* ── Shimmer sweep — animated via ref ── */}
          <linearGradient
            id="gShimmer"
            gradientUnits="userSpaceOnUse"
            ref={shimmerRef}
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={0.07} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* ── Layer 1: Frosted glass base (backdrop-filter via foreignObject trick) ── */}
        {/* Since SVG backdropFilter has limited support, we layer transparent fills  */}
        {/* The glassmorphism relies on the bg showing through these low-opacity fills */}

        {/* Glass white tint */}
        <path d={CARD_PATH} fill="url(#gGlass)" />

        {/* Green colour wash */}
        <path d={CARD_PATH} fill="url(#gGreen)" />

        {/* Amber warmth */}
        <path d={CARD_PATH} fill="url(#gAmber)" />

        {/* Top-left specular */}
        <path d={CARD_PATH} fill="url(#gSheen)" />

        {/* Inner edge vignette */}
        <path
          d={CARD_PATH}
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={24}
          clipPath="url(#cardClip)"
          style={{ filter: "blur(8px)" }}
        />

        {/* Outer border */}
        <path
          d={CARD_PATH}
          fill="none"
          stroke="url(#gBorder)"
          strokeWidth={1.5}
        />

        {/* Shimmer sweep */}
        <path d={CARD_PATH} fill="url(#gShimmer)" clipPath="url(#cardClip)" />

        {/* ── LOCKED DROP ICON ── */}
        <g transform={`translate(${PEAK_X}, -22)`}>
          <path d={DROP_WATER} fill="rgba(255,255,255,0.75)" />
          <path
            d={DROP_OUTLINE}
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </g>

        {/* ── CONTENT ── */}
        <g clipPath="url(#cardClip)">
          {/* LEFT — totalPlants */}
          <text
            x={COL_L}
            y={NUM_Y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={81}
            fontWeight={200}
            fontFamily="'Helvetica Neue', -apple-system, sans-serif"
          >
            {totalPlants}
          </text>
          <text
            x={COL_L}
            y={LBL_Y}
            textAnchor="middle"
            fill="rgba(255,255,255,0.60)"
            fontSize={15.6}
            letterSpacing={3.5}
            fontFamily="-apple-system, sans-serif"
          >
            PLANTS
          </text>

          {/* CENTER — health ring */}
          <circle
            cx={COL_C}
            cy={RING_CY}
            r={RING_R}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={RING_ST}
          />
          <circle
            cx={COL_C}
            cy={RING_CY}
            r={RING_R}
            fill="none"
            stroke="rgba(255,255,255,0.92)"
            strokeWidth={RING_ST}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(-90,${COL_C},${RING_CY})`}
          />
          <text
            x={COL_C}
            y={RING_CY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={21.8}
            fontWeight={500}
            fontFamily="-apple-system, sans-serif"
          >
            {avgHealth}%
          </text>
          <text
            x={COL_C}
            y={LBL_Y}
            textAnchor="middle"
            fill="rgba(255,255,255,0.52)"
            fontSize={14.8}
            letterSpacing={2.8}
            fontFamily="-apple-system, sans-serif"
          >
            AVG HEALTH
          </text>

          {/* RIGHT — alerts + heart */}
          <text
            x={COL_R - 14}
            y={NUM_Y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={81}
            fontWeight={200}
            fontFamily="'Helvetica Neue', -apple-system, sans-serif"
          >
            {alerts}
          </text>
          <g transform={`translate(${COL_R + 29}, ${NUM_Y - 2})`}>
            <path
              d={HEART_PATH}
              fill="rgba(185,140,72,0.90)"
              stroke="rgba(210,170,100,0.30)"
              strokeWidth={0.7}
            />
          </g>
          <text
            x={COL_R}
            y={LBL_Y}
            textAnchor="middle"
            fill="rgba(255,255,255,0.60)"
            fontSize={15.6}
            letterSpacing={3.5}
            fontFamily="-apple-system, sans-serif"
          >
            ALERTS
          </text>
        </g>
      </svg>
    </div>
  );
}
