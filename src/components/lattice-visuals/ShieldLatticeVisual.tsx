
import { useMemo } from 'react';

/**
 * The shield traced through the 64-vertex sovereignty lattice.
 * Heater-shield silhouette over the same lattice the Weavers and Forge use.
 * Featured vertices mark the three Zcash inscription patterns
 * (A · shielded memo · B · DID anchor · C · governance stake).
 *
 * Used on /shield — the zShields workshop. The Oracle Swordsman stamps the
 * actual inscriptions on the Zcash dual-ledger.
 */
export default function ShieldLatticeVisual({
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

  // Heater shield silhouette · flat top, sides curving inward to point at bottom.
  const shieldPath = `
    M 240 50
    L 480 50
    C 478 145, 460 240, 360 332
    C 260 240, 242 145, 240 50
    Z
  `;

  // Three pattern vertices on the shield · A shielded · B anchor · C governance.
  const featured = [
    { x: 290, y: 130, label: 'A', subtitle: 'shielded memo' },
    { x: 430, y: 130, label: 'B', subtitle: 'DID anchor' },
    { x: 360, y: 270, label: 'C', subtitle: 'governance stake' },
  ];

  // Weave threads — dashed lines linking the three patterns into one shield.
  const threads = [
    { x1: 290, y1: 130, x2: 430, y2: 130 },
    { x1: 290, y1: 130, x2: 360, y2: 270 },
    { x1: 430, y1: 130, x2: 360, y2: 270 },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Heater shield silhouette traced through the 64-vertex sovereignty lattice"
      >
        <defs>
          <radialGradient id="shieldFabric" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#71717a" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#27272a" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="shieldVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="shieldSoftGlow">
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
              fill="#71717a"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Shield silhouette */}
        <path
          d={shieldPath}
          fill="url(#shieldFabric)"
          stroke="#71717a"
          strokeWidth="1.2"
          strokeOpacity="0.6"
          filter="url(#shieldSoftGlow)"
        />

        {/* Pattern threads — golden ratio between the three inscription kinds */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Featured vertices · the three patterns */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={16} fill="url(#shieldVertexGlow)" />
            <circle cx={f.x} cy={f.y} r={4} fill="#fbbf24">
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
                fontSize="11"
                fontWeight="500"
                fill="#fbbf24"
                opacity="0.95"
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
                fill="#71717a"
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
