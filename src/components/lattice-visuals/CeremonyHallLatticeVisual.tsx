
import { useMemo } from 'react';

/**
 * The colonnade-hall silhouette traced through the 64-vertex sovereignty lattice.
 * The Ceremony Hall is where the public-goods guilds meet for bilateral rites.
 * Lapis Lazuli — historic council gem, deep blue with gold flecks for the guilds in residence.
 */
export default function CeremonyHallLatticeVisual({
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

  // Hall outline — pediment + architrave + ground line, with seven arches between.
  // The pediment is wider/lower than the Covenant temple to read as 'long hall' rather than
  // 'tall temple'.
  const hallOutline = `
    M 360 70
    L 600 130
    L 600 145
    L 600 290
    L 615 290
    L 615 310
    L 105 310
    L 105 290
    L 120 290
    L 120 145
    L 120 130
    Z
  `;

  // Seven arches between the columns. Arches drawn as semicircles open at the bottom.
  // Calculated to fit evenly inside x=130..590 (interior of the hall).
  const archCount = 7;
  const archRegionStart = 138;
  const archRegionEnd = 582;
  const archRegionWidth = archRegionEnd - archRegionStart;
  const archGap = archRegionWidth / archCount; // spacing between arch centres
  const archR = (archGap / 2) * 0.78; // arch radius — leaves a stone-column gap between arches
  const archY = 268; // arch baseline (springline)
  const arches: { d: string; cx: number }[] = [];
  for (let i = 0; i < archCount; i++) {
    const cx = archRegionStart + archGap * (i + 0.5);
    // Arch path: start at left springline, semicircle up, end at right springline.
    arches.push({
      cx,
      d: `M ${cx - archR} ${archY} A ${archR} ${archR} 0 0 1 ${cx + archR} ${archY}`,
    });
  }

  // Lapis Lazuli gold flecks — small static circles scattered in the hall interior.
  // Decorative; not animated. Pseudo-random but deterministic for SSR.
  const flecks: { x: number; y: number; r: number }[] = [];
  const fleckSeeds: [number, number][] = [
    [165, 175], [205, 215], [255, 162], [310, 200], [360, 175],
    [415, 210], [460, 165], [510, 198], [555, 178],
    [180, 240], [240, 250], [285, 235], [340, 245], [395, 240],
    [445, 252], [500, 235], [560, 245],
  ];
  fleckSeeds.forEach(([x, y]) => {
    flecks.push({ x, y, r: 1.4 });
  });

  // Featured vertices — apex (the rite); two pillar capitals (the bilateral pair); threshold.
  const featured = [
    { x: 360, y: 70, label: 'V_apex', subtitle: 'the rite' },
    { x: 145, y: 145, label: 'V_left', subtitle: 'first guild' },
    { x: 575, y: 145, label: 'V_right', subtitle: 'second guild' },
    { x: 360, y: 305, label: 'V_threshold', subtitle: 'agreement signed' },
  ];

  // Council threads — diagonals from apex to capitals, capitals to threshold.
  const threads = [
    { x1: 360, y1: 70, x2: 145, y2: 145 },
    { x1: 360, y1: 70, x2: 575, y2: 145 },
    { x1: 145, y1: 145, x2: 360, y2: 305 },
    { x1: 575, y1: 145, x2: 360, y2: 305 },
    { x1: 145, y1: 145, x2: 575, y2: 145 },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Colonnade hall silhouette traced through the 64-vertex sovereignty lattice — the Ceremony Hall"
      >
        <defs>
          {/* Lapis fabric — deep civic blue */}
          <radialGradient id="lapisFabric" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#1e3a8a" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="hallVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="lapisSoftGlow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background lattice — Lapis-tinted constellation field */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#3b82f6"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Hall silhouette */}
        <path
          d={hallOutline}
          fill="url(#lapisFabric)"
          stroke="#3b82f6"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          filter="url(#lapisSoftGlow)"
        />

        {/* Seven arches between columns */}
        <g
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.0"
          strokeOpacity="0.55"
          filter="url(#lapisSoftGlow)"
        >
          {arches.map((a, i) => (
            <path key={`arch-${i}`} d={a.d} />
          ))}
          {/* Column posts beneath each arch springline */}
          {arches.map((a, i) => (
            <line
              key={`post-${i}`}
              x1={a.cx - archR}
              y1={archY}
              x2={a.cx - archR}
              y2={290}
              strokeWidth="0.8"
            />
          ))}
          <line x1={arches[arches.length - 1].cx + archR} y1={archY} x2={arches[arches.length - 1].cx + archR} y2={290} strokeWidth="0.8" />
        </g>

        {/* Gold flecks — Lapis Lazuli matrix */}
        <g fill="#fbbf24" fillOpacity="0.55">
          {flecks.map((f, i) => (
            <circle key={`fleck-${i}`} cx={f.x} cy={f.y} r={f.r} />
          ))}
        </g>

        {/* Council threads — dashed amber */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Featured vertices — pulse-glow on 2.4s cycle */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#hallVertexGlow)" />
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
                fill="#93c5fd"
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
