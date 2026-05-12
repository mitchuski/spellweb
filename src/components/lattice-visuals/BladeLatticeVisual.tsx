
import { useMemo } from 'react';

/**
 * The blade traced horizontally through the 64-vertex sovereignty lattice.
 * Pommel left, tip right. The silhouette is built from straight edges so the
 * geometry reads as a constellation: hilt-grip-crossguard-blade as a chain of
 * triangles between vertices.
 *
 * Used on /forget — the Forge(t) workshop. The actual forging happens at
 * spellweb.ai during the Celestial Ceremony.
 */
export default function BladeLatticeVisual({
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

  // ─────────────────────────────────────────────────────────────────────────
  // Sword silhouette · all straight lines so the constellation reads cleanly.
  //
  //  pommel ────── grip ────── crossguard ─────────── blade ─────── tip
  //   (left)                    (vertical bar)                     (right)
  //
  // y centre = 180. The blade narrows from its base (260) to the tip (660).
  // ─────────────────────────────────────────────────────────────────────────

  const POMMEL_X = 95;
  const GRIP_TOP_Y = 173;
  const GRIP_BOTTOM_Y = 187;
  const CROSSGUARD_LEFT_X = 240;
  const CROSSGUARD_RIGHT_X = 268;
  const CROSSGUARD_TOP_Y = 130;
  const CROSSGUARD_BOTTOM_Y = 230;
  const BLADE_BASE_TOP_Y = 168;
  const BLADE_BASE_BOTTOM_Y = 192;
  const TIP_X = 658;
  const TIP_Y = 180;

  const swordPath = `
    M ${POMMEL_X} ${GRIP_TOP_Y}
    L ${CROSSGUARD_LEFT_X} ${GRIP_TOP_Y}
    L ${CROSSGUARD_LEFT_X} ${CROSSGUARD_TOP_Y}
    L ${CROSSGUARD_RIGHT_X} ${CROSSGUARD_TOP_Y}
    L ${CROSSGUARD_RIGHT_X} ${BLADE_BASE_TOP_Y}
    L ${TIP_X} ${TIP_Y}
    L ${CROSSGUARD_RIGHT_X} ${BLADE_BASE_BOTTOM_Y}
    L ${CROSSGUARD_RIGHT_X} ${CROSSGUARD_BOTTOM_Y}
    L ${CROSSGUARD_LEFT_X} ${CROSSGUARD_BOTTOM_Y}
    L ${CROSSGUARD_LEFT_X} ${GRIP_BOTTOM_Y}
    L ${POMMEL_X} ${GRIP_BOTTOM_Y}
    Z
  `;

  // Featured vertices · the blade's constellation anchors.
  const featured = [
    { x: POMMEL_X, y: 180, label: '🌑', sub: '' },
    { x: CROSSGUARD_LEFT_X, y: CROSSGUARD_TOP_Y, label: '⚔️', sub: 'Swordsman' },
    { x: CROSSGUARD_LEFT_X, y: CROSSGUARD_BOTTOM_Y, label: '🧙', sub: 'Mage' },
    { x: TIP_X, y: TIP_Y, label: '😊', sub: 'First Person' },
  ];

  // Constellation triangles — explicit dashed triangulation between anchors.
  // Two triangles share the crossguard edge, like a bowtie laid sideways:
  //   left:  pommel  ↔ crossguard-top ↔ crossguard-bottom
  //   right: tip     ↔ crossguard-top ↔ crossguard-bottom
  const leftTriangle = `M ${POMMEL_X} 180 L ${CROSSGUARD_LEFT_X} ${CROSSGUARD_TOP_Y} L ${CROSSGUARD_LEFT_X} ${CROSSGUARD_BOTTOM_Y} Z`;
  const rightTriangle = `M ${TIP_X} ${TIP_Y} L ${CROSSGUARD_LEFT_X} ${CROSSGUARD_TOP_Y} L ${CROSSGUARD_LEFT_X} ${CROSSGUARD_BOTTOM_Y} Z`;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Horizontal blade silhouette traced through the 64-vertex sovereignty lattice as constellation triangles"
      >
        <defs>
          <linearGradient id="bladeFabric" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.05" />
            <stop offset="35%" stopColor="#fb7185" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id="bladeVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="bladeSoftGlow">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lattice */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#fb7185"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Constellation triangles · dashed amber triangulation between anchors */}
        <g stroke="#fbbf24" strokeOpacity="0.45" strokeWidth="0.7" strokeDasharray="3 3" fill="none">
          <path d={leftTriangle} />
          <path d={rightTriangle} />
        </g>

        {/* Sword silhouette · straight edges */}
        <path
          d={swordPath}
          fill="url(#bladeFabric)"
          stroke="#fb7185"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          filter="url(#bladeSoftGlow)"
        />

        {/* Featured anchor vertices */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#bladeVertexGlow)" />
            <circle cx={f.x} cy={f.y} r={3.6} fill="#fbbf24">
              <animate
                attributeName="opacity"
                values="1;0.55;1"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
            {showLabels && (
              <>
                <text
                  x={f.x}
                  y={f.y - 22}
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                  fontSize="11"
                  fontWeight="500"
                  fill="#fbbf24"
                  opacity="0.95"
                >
                  {f.label}
                </text>
                {f.sub && (
                  <text
                    x={f.x}
                    y={f.y + 28}
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                    fontSize="8"
                    fill="#fb7185"
                    opacity="0.75"
                  >
                    {f.sub}
                  </text>
                )}
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
