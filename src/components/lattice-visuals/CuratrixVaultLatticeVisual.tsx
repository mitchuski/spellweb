
import { useMemo } from 'react';

/**
 * The amphora silhouette traced through the 64-vertex sovereignty lattice.
 * Curation is the act of placing a vertex; the vault is what holds the placed.
 *
 * Visual vocabulary aligned with culturevault.com — the operational gallery the
 * Curatrix Vault directs to. Pearl-iridescent silhouette; amber featured vertices
 * for placed-by-Curatrix positions.
 */
export default function CuratrixVaultLatticeVisual({
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

  // 64-vertex sovereignty lattice — 16 cols × 10 rows, hexagonally offset.
  // Same substrate as every other workshop visual; what differs is the silhouette.
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

  // Amphora body — closed silhouette traced through the lattice.
  // Mouth at top, shoulders at row 3-4, body tapering to a small foot.
  const amphoraBody = `
    M 335 55
    L 385 55
    L 388 72
    Q 395 85, 400 95
    C 470 110, 490 200, 410 285
    L 405 320
    L 315 320
    L 310 285
    C 230 200, 250 110, 320 95
    Q 325 85, 332 72
    L 335 55
    Z
  `;

  // Handles — two C-arc strokes attached to the body, characteristic of the amphora.
  const rightHandle = 'M 388 95 C 460 100, 470 160, 430 175';
  const leftHandle = 'M 332 95 C 260 100, 250 160, 290 175';

  // Featured vertices — the placed positions. Each is a vertex a Curatrix has
  // declared meaningful: where the artifact is anchored, who anchored it.
  const featured = [
    { x: 360, y: 55, label: 'V_lip', subtitle: 'the opening' },
    { x: 270, y: 130, label: 'V_curatrix', subtitle: 'Aria Silverhue' },
    { x: 360, y: 200, label: 'V_heart', subtitle: 'the held artifact' },
    { x: 360, y: 320, label: 'V_foot', subtitle: 'the vault rests' },
  ];

  // Curation threads — golden lines from silhouette boundary to placed vertices.
  // Mirrors the weave-thread pattern: the act of placing IS the curation.
  const threads = [
    { x1: 335, y1: 55, x2: 270, y2: 130 },
    { x1: 385, y1: 55, x2: 450, y2: 130 },
    { x1: 270, y1: 130, x2: 360, y2: 200 },
    { x1: 450, y1: 130, x2: 360, y2: 200 },
    { x1: 360, y1: 200, x2: 315, y2: 320 },
    { x1: 360, y1: 200, x2: 405, y2: 320 },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Amphora silhouette traced through the 64-vertex sovereignty lattice — the Curatrix Vault"
      >
        <defs>
          {/* Pearl-iridescent fabric — soft white core, pink-blue shimmer at edges */}
          <radialGradient id="pearlFabric" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#f5f0e6" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#fce7f3" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="vaultVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="pearlSoftGlow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background lattice — faint constellation field, Pearl-tinted */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#f5f0e6"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Amphora body silhouette */}
        <path
          d={amphoraBody}
          fill="url(#pearlFabric)"
          stroke="#f5f0e6"
          strokeWidth="1.2"
          strokeOpacity="0.65"
          filter="url(#pearlSoftGlow)"
        />

        {/* Handles — drawn as open strokes outside the body */}
        <g
          fill="none"
          stroke="#f5f0e6"
          strokeWidth="1.2"
          strokeOpacity="0.6"
          filter="url(#pearlSoftGlow)"
        >
          <path d={rightHandle} />
          <path d={leftHandle} />
        </g>

        {/* Curation threads — dashed amber, the placement signature */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Featured vertices — placed positions, pulse-glow on 2.4s cycle */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#vaultVertexGlow)" />
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
                fill="#f5f0e6"
                opacity="0.7"
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
