
import { useMemo } from 'react';

/**
 * The circle silhouette traced through the 64-vertex sovereignty lattice.
 * The Logos Circle is a garden in the cities we visit others — meeting place,
 * privacy and creation in the same gesture. Tied to the society spellbook /
 * farewell to Westphalia.
 *
 * Visual vocabulary aligned with logos.co — the operational network the
 * Logos Circle directs to. Jade silhouette; amber featured vertices for the
 * cardinal meeting positions.
 */
export default function LogosCircleLatticeVisual({
  className,
  height = 'h-56 sm:h-72',
  showLabels = true,
}: {
  className?: string;
  height?: string;
  showLabels?: boolean;
}) {
  const W = 720;
  const H = 360;

  // 64-vertex sovereignty lattice — same substrate as every other workshop visual.
  const lattice = useMemo(() => {
    const cols = 16;
    const rows = 10;
    const padX = 30;
    const padY = 30;
    const dx = (W - 2 * padX) / (cols - 1);
    const dy = (H - 2 * padY) / (rows - 1);
    const dots: { x: number; y: number; r: number; col: number; row: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: padX + c * dx + (r % 2) * dx / 2,
          y: padY + r * dy,
          r: 0.9,
          col: c,
          row: r,
        });
      }
    }
    return dots;
  }, []);

  const cx = 360;
  const cy = 180;
  const outerR = 120;
  const innerR = 60;

  // Leaf accents at compass points — small almond shapes outside the circle.
  // Placed past the outer circle radius so they read as garden growing around it.
  const leafR = 18;
  const leafD = (px: number, py: number) =>
    `M ${px} ${py - leafR} Q ${px + leafR} ${py}, ${px} ${py + leafR} Q ${px - leafR} ${py}, ${px} ${py - leafR} Z`;
  const leafN = leafD(cx, cy - outerR - 18);
  const leafS = leafD(cx, cy + outerR + 18);
  const leafE = leafD(cx + outerR + 18, cy);
  const leafW = leafD(cx - outerR - 18, cy);

  // Featured vertices — cardinal meeting positions.
  const featured = [
    { x: cx, y: cy - outerR, label: 'V_north', subtitle: 'creation' },
    { x: cx + outerR, y: cy, label: 'V_east', subtitle: 'arrival' },
    { x: cx, y: cy + outerR, label: 'V_south', subtitle: 'privacy' },
    { x: cx - outerR, y: cy, label: 'V_west', subtitle: 'departure' },
  ];

  // Circle threads — chords that cross through the centre.
  const threads = [
    { x1: cx, y1: cy - outerR, x2: cx, y2: cy + outerR },
    { x1: cx - outerR, y1: cy, x2: cx + outerR, y2: cy },
    { x1: cx, y1: cy - outerR, x2: cx + outerR, y2: cy },
    { x1: cx + outerR, y1: cy, x2: cx, y2: cy + outerR },
    { x1: cx, y1: cy + outerR, x2: cx - outerR, y2: cy },
    { x1: cx - outerR, y1: cy, x2: cx, y2: cy - outerR },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Circle silhouette traced through the 64-vertex sovereignty lattice — the Logos Circle"
      >
        <defs>
          {/* Jade gradient — garden green with cool inner shimmer */}
          <radialGradient id="jadeFabric" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#34d399" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="circleVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="jadeSoftGlow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background lattice — Jade-tinted constellation field */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#10b981"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Outer circle — the meeting boundary */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="url(#jadeFabric)"
          stroke="#10b981"
          strokeWidth="1.4"
          strokeOpacity="0.7"
          filter="url(#jadeSoftGlow)"
        />

        {/* Inner circle — the inner sanctum */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.0"
          strokeOpacity="0.5"
          strokeDasharray="3 3"
        />

        {/* Garden leaves — almond shapes at the compass points */}
        <g
          fill="#10b981"
          fillOpacity="0.18"
          stroke="#10b981"
          strokeOpacity="0.55"
          strokeWidth="0.8"
          filter="url(#jadeSoftGlow)"
        >
          <path d={leafN} />
          <path d={leafE} />
          <path d={leafS} />
          <path d={leafW} />
        </g>

        {/* Circle threads — chords through the centre, dashed amber */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Featured vertices — cardinal meeting positions, pulse-glow on 2.4s cycle */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#circleVertexGlow)" />
            <circle cx={f.x} cy={f.y} r={3.6} fill="#fbbf24">
              <animate
                attributeName="opacity"
                values="1;0.55;1"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
            {showLabels && (
              <text
                x={f.x}
                y={f.y - 18}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="9"
                fill="#fbbf24"
                opacity="0.85"
              >
                {f.label}
              </text>
            )}
            {showLabels && f.subtitle && (
              <text
                x={f.x}
                y={f.y + 22}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize="8"
                fill="#34d399"
                opacity="0.75"
              >
                {f.subtitle}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
