
import { useMemo } from 'react';

/**
 * The temple silhouette traced through the 64-vertex sovereignty lattice.
 * The Covenant is the bond signed at the threshold; the temple is what holds the signing.
 *
 * Visual vocabulary aligned with manifest.human.tech — the operational forum the
 * Covenant directs to. Diamond-clear silhouette; amber featured vertices for placed
 * positions where the priest officiates.
 */
export default function CovenantLatticeVisual({
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

  // Temple silhouette — pediment + entablature + columns + stylobate.
  // Drawn as a closed outline so the diamond fabric fills the interior.
  const templeOutline = `
    M 360 50
    L 530 130
    L 530 145
    L 530 290
    L 545 290
    L 545 310
    L 175 310
    L 175 290
    L 190 290
    L 190 145
    L 190 130
    Z
  `;

  // Six column strokes — open vertical lines inside the temple body.
  const columnX = [228, 280, 332, 388, 440, 492];
  const columnY1 = 150;
  const columnY2 = 286;

  // Featured vertices — placed positions the priest declares.
  // Apex = the divine; portico capitals = the ascending columns; threshold = where the Covenant is signed.
  const featured = [
    { x: 360, y: 50, label: 'V_apex', subtitle: 'the divine' },
    { x: 220, y: 145, label: 'V_left', subtitle: 'the witness' },
    { x: 500, y: 145, label: 'V_right', subtitle: 'the priest' },
    { x: 360, y: 290, label: 'V_threshold', subtitle: 'sign the Covenant' },
  ];

  // Covenant threads — dashed amber, the priest's officiating lines.
  const threads = [
    { x1: 360, y1: 50, x2: 220, y2: 145 },
    { x1: 360, y1: 50, x2: 500, y2: 145 },
    { x1: 220, y1: 145, x2: 360, y2: 290 },
    { x1: 500, y1: 145, x2: 360, y2: 290 },
    { x1: 220, y1: 145, x2: 500, y2: 145 },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Temple silhouette traced through the 64-vertex sovereignty lattice — the Covenant"
      >
        <defs>
          {/* Diamond-clear fabric — cool blue with refractive shimmer */}
          <radialGradient id="diamondFabric" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#bfdbfe" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="covenantVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="diamondSoftGlow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background lattice — Diamond-tinted constellation field */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#60a5fa"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Temple silhouette */}
        <path
          d={templeOutline}
          fill="url(#diamondFabric)"
          stroke="#60a5fa"
          strokeWidth="1.2"
          strokeOpacity="0.65"
          filter="url(#diamondSoftGlow)"
        />

        {/* Columns — six vertical strokes inside the temple */}
        <g
          stroke="#60a5fa"
          strokeWidth="1.0"
          strokeOpacity="0.55"
          filter="url(#diamondSoftGlow)"
        >
          {columnX.map((x, i) => (
            <line key={`col-${i}`} x1={x} y1={columnY1} x2={x} y2={columnY2} />
          ))}
        </g>

        {/* Covenant threads — dashed amber */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Featured vertices — placed positions, pulse-glow on 2.4s cycle */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#covenantVertexGlow)" />
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
                fill="#60a5fa"
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
