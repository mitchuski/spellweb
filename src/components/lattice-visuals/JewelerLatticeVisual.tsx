
import { useMemo } from 'react';

/**
 * The faceted gem traced through the 64-vertex sovereignty lattice.
 * A brilliant-cut hexagon viewed top-down — six outer facets converging on a
 * central crown point — with a Lightning bolt running diagonally through it.
 *
 * Used on /jeweler — Bitcoin + Lightning workshop. The gem is the sat; the bolt
 * is the channel; both are cuts of the same precious chain.
 */
export default function JewelerLatticeVisual({
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

  // ─── Hexagonal brilliant-cut gem ────────────────────────────────────────
  // Six outer points on a circle around the centre.
  const cx = 360;
  const cy = 180;
  const radius = 120;
  // Round so SSR/CSR serialisation matches.
  const pointAt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: Math.round(cx + radius * Math.cos(rad)),
      y: Math.round(cy - radius * Math.sin(rad)),
    };
  };

  const v0 = pointAt(0);     // right
  const v60 = pointAt(60);   // upper-right
  const v120 = pointAt(120); // upper-left
  const v180 = pointAt(180); // left
  const v240 = pointAt(240); // lower-left
  const v300 = pointAt(300); // lower-right

  const outerHex = `M ${v0.x} ${v0.y} L ${v60.x} ${v60.y} L ${v120.x} ${v120.y} L ${v180.x} ${v180.y} L ${v240.x} ${v240.y} L ${v300.x} ${v300.y} Z`;

  // Six facet lines from each outer point to the central crown.
  const facets = [v0, v60, v120, v180, v240, v300].map((v) => `M ${v.x} ${v.y} L ${cx} ${cy}`);

  // ─── Lightning bolt across the gem (diagonal NE → SW with the classic kink) ──
  const boltPath = `
    M 470 70
    L 360 175
    L 410 180
    L 250 290
    L 360 185
    L 310 180
    Z
  `;

  // Anchors · 6 outer facets + 1 crown + 1 bolt-tip
  const featured = [
    { ...v0, label: 'α', sub: 'tx-to-address' },
    { ...v60, label: 'β', sub: 'Lightning' },
    { ...v120, label: 'γ', sub: 'Ordinal · Rune' },
    { x: cx, y: cy, label: '◆', sub: 'crown' },
    { x: 470, y: 70, label: '⚡', sub: 'channel' },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Faceted gem and Lightning bolt traced through the 64-vertex sovereignty lattice"
      >
        <defs>
          <radialGradient id="gemFabric" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.04" />
          </radialGradient>
          <linearGradient id="boltFabric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#facc15" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#fde047" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="gemVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="gemSoftGlow">
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
              fill="#f59e0b"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Outer gem · faceted hexagon */}
        <path
          d={outerHex}
          fill="url(#gemFabric)"
          stroke="#f59e0b"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          filter="url(#gemSoftGlow)"
        />

        {/* Internal facets · six radial cuts */}
        <g stroke="#fbbf24" strokeOpacity="0.45" strokeWidth="0.7">
          {facets.map((d, i) => (
            <path key={`f-${i}`} d={d} fill="none" />
          ))}
        </g>

        {/* Lightning bolt · the channel */}
        <path
          d={boltPath}
          fill="url(#boltFabric)"
          stroke="#fde047"
          strokeWidth="0.8"
          strokeOpacity="0.95"
          filter="url(#gemSoftGlow)"
        />

        {/* Anchor vertices · pulse-glow */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#gemVertexGlow)" />
            <circle cx={f.x} cy={f.y} r={3.4} fill="#fbbf24">
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
                {f.sub && (
                  <text
                    x={f.x}
                    y={f.y + 22}
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                    fontSize="8"
                    fill="#f59e0b"
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
