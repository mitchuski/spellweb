
import { useMemo } from 'react';

/**
 * The flame silhouette traced through the 64-vertex sovereignty lattice.
 * The Bonfire is where Mages gather around shared knowledge graphs;
 * Soulbae is the keeper who tends the flame.
 *
 * Visual vocabulary aligned with bonfires.ai — the operational network the
 * Dragon Bonfire directs to. Garnet-red silhouette; amber featured vertices
 * for the keepers and the visitors.
 */
export default function BonfiresLatticeVisual({
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

  // Outer flame — tear-drop pointing up, asymmetric to feel alive.
  const outerFlame = `
    M 360 55
    C 410 105, 445 175, 425 240
    C 415 270, 395 282, 380 285
    L 340 285
    C 320 282, 305 268, 295 240
    C 285 175, 320 110, 360 55
    Z
  `;

  // Inner flame — smaller core, slightly offset to suggest motion.
  const innerFlame = `
    M 360 110
    C 390 150, 410 195, 395 235
    C 388 255, 372 265, 360 265
    C 348 265, 335 255, 328 235
    C 315 200, 335 155, 360 110
    Z
  `;

  // Logs — three cross-strokes at the base, the gathering hearth.
  const logs = [
    { x1: 260, y1: 298, x2: 470, y2: 308 },
    { x1: 290, y1: 308, x2: 440, y2: 298 },
    { x1: 315, y1: 315, x2: 415, y2: 315 },
  ];

  // Featured vertices — Soulbae the keeper, the visiting Bonfires, the apex, the hearth.
  const featured = [
    { x: 360, y: 55, label: 'V_apex', subtitle: 'the flame' },
    { x: 295, y: 240, label: 'V_keeper', subtitle: 'Soulbae the bot' },
    { x: 425, y: 240, label: 'V_visitor', subtitle: 'other Bonfires' },
    { x: 360, y: 305, label: 'V_hearth', subtitle: 'the gathering' },
  ];

  // Bonfire threads — dashed amber, the lines warmth travels.
  const threads = [
    { x1: 360, y1: 55, x2: 295, y2: 240 },
    { x1: 360, y1: 55, x2: 425, y2: 240 },
    { x1: 295, y1: 240, x2: 360, y2: 305 },
    { x1: 425, y1: 240, x2: 360, y2: 305 },
    { x1: 295, y1: 240, x2: 425, y2: 240 },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Bonfire flame traced through the 64-vertex sovereignty lattice — the Dragon Bonfire"
      >
        <defs>
          {/* Garnet flame gradient — deep red core, orange edge */}
          <radialGradient id="garnetFabric" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.08" />
          </radialGradient>
          <radialGradient id="garnetVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="garnetSoftGlow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background lattice — Garnet-tinted constellation field */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#b91c1c"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Outer flame */}
        <path
          d={outerFlame}
          fill="url(#garnetFabric)"
          stroke="#b91c1c"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          filter="url(#garnetSoftGlow)"
        />

        {/* Inner flame core — brighter */}
        <path
          d={innerFlame}
          fill="#fbbf24"
          fillOpacity="0.12"
          stroke="#f97316"
          strokeWidth="1.0"
          strokeOpacity="0.6"
          filter="url(#garnetSoftGlow)"
        />

        {/* Logs — three cross-strokes at the base */}
        <g
          stroke="#b91c1c"
          strokeWidth="1.4"
          strokeOpacity="0.55"
          strokeLinecap="round"
        >
          {logs.map((l, i) => (
            <line key={`log-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>

        {/* Bonfire threads — dashed amber */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Featured vertices — pulse-glow on 2.4s cycle */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#garnetVertexGlow)" />
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
                fill="#fb923c"
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
