
import { useMemo } from 'react';

/**
 * The cloak woven through the 64-vertex sovereignty lattice.
 * Lattice points form a constellation; the cloak silhouette is traced through it,
 * its threads pulled from specific vertices.
 *
 * Visual vocabulary aligned with weaver.archon.social — the operational tool the
 * Weavers shop directs to.
 */
export default function CloakLatticeVisual({
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

  // Lattice — 16 cols × 10 rows = 160 dots, hexagonally offset.
  // The 64-vertex sovereignty lattice is conceptually a 2^6 hypercube; this
  // 2D projection reads as a constellation field.
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

  // Cloak silhouette — a draped form flowing from neckline through the lattice
  // out to a wide hem. Bezier-defined so it stays smooth at any scale.
  const cloakPath = `
    M 290 60
    C 320 52, 400 52, 430 60
    L 470 88
    C 520 160, 575 240, 615 320
    Q 360 350, 105 320
    C 145 240, 200 160, 250 88
    Z
  `;

  // Featured vertices — the cardinal positions named in the corpus.
  const featured = [
    { x: 360, y: 60, label: 'V0', subtitle: 'origin' },
    { x: 220, y: 175, label: 'V28', subtitle: 'Pallia · weaver' },
    { x: 500, y: 175, label: 'V63', subtitle: 'all six burning' },
    { x: 360, y: 320, label: 'hem', subtitle: 'cloak descends' },
  ];

  // Weave threads — short lines from cloak edge into lattice vertices.
  const threads = [
    { x1: 290, y1: 60, x2: 220, y2: 175 },
    { x1: 430, y1: 60, x2: 500, y2: 175 },
    { x1: 220, y1: 175, x2: 360, y2: 320 },
    { x1: 500, y1: 175, x2: 360, y2: 320 },
    { x1: 360, y1: 60, x2: 220, y2: 175 },
    { x1: 360, y1: 60, x2: 500, y2: 175 },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Cloak silhouette woven through the 64-vertex sovereignty lattice"
      >
        <defs>
          <radialGradient id="cloakFabric" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="vertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background lattice — a faint constellation field */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#a78bfa"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Cloak silhouette */}
        <path
          d={cloakPath}
          fill="url(#cloakFabric)"
          stroke="#a78bfa"
          strokeWidth="1.2"
          strokeOpacity="0.55"
          filter="url(#softGlow)"
        />

        {/* Weave threads */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Featured vertices — pulse-glow like weaver.archon.social */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#vertexGlow)" />
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
                fill="#a78bfa"
                opacity="0.6"
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
