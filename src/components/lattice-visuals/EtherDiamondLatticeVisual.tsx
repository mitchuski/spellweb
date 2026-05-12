
import { useMemo } from 'react';

/**
 * The Ethereum diamond traced through the 64-vertex sovereignty lattice.
 * Vertical rhombus, four anchor points at the cardinal directions, mirroring
 * the workshops' shared lattice grammar (cloak / blade / shield / diamond).
 *
 * Used on /etherchanting — the transparent counterpart to zShields.
 */
export default function EtherDiamondLatticeVisual({
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

  // Diamond cardinals — top · right · bottom · left
  const top = { x: 360, y: 50 };
  const right = { x: 500, y: 180 };
  const bottom = { x: 360, y: 310 };
  const left = { x: 220, y: 180 };

  const diamondPath = `M ${top.x} ${top.y} L ${right.x} ${right.y} L ${bottom.x} ${bottom.y} L ${left.x} ${left.y} Z`;
  // Inner facet — a smaller concentric diamond suggesting the ETH-glyph two-tone.
  const innerTop = { x: 360, y: 110 };
  const innerRight = { x: 440, y: 180 };
  const innerBottom = { x: 360, y: 250 };
  const innerLeft = { x: 280, y: 180 };
  const innerPath = `M ${innerTop.x} ${innerTop.y} L ${innerRight.x} ${innerRight.y} L ${innerBottom.x} ${innerBottom.y} L ${innerLeft.x} ${innerLeft.y} Z`;

  // Pattern anchors · α · β · γ at the cardinal-non-vertical points + centre.
  const featured = [
    { ...top, label: 'α', sub: 'tx-to-ENS' },
    { ...right, label: 'β', sub: 'NFT mint' },
    { ...bottom, label: 'γ', sub: 'chronicle' },
    { ...left, label: '∴', sub: 'transparent' },
  ];

  // Pattern threads — dashed amber connecting the four anchors as triangles.
  const threads = [
    { x1: top.x, y1: top.y, x2: right.x, y2: right.y },
    { x1: right.x, y1: right.y, x2: bottom.x, y2: bottom.y },
    { x1: bottom.x, y1: bottom.y, x2: left.x, y2: left.y },
    { x1: left.x, y1: left.y, x2: top.x, y2: top.y },
    { x1: top.x, y1: top.y, x2: bottom.x, y2: bottom.y },
    { x1: left.x, y1: left.y, x2: right.x, y2: right.y },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Ethereum diamond traced through the 64-vertex sovereignty lattice"
      >
        <defs>
          <linearGradient id="diamondFabric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#0891b2" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="diamondInnerFabric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="diamondVertexGlow" cx="50%" cy="50%" r="50%">
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

        {/* Lattice */}
        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle
              key={`l-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#67e8f9"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Pattern threads — amber triangulation between the four anchors */}
        <g stroke="#fbbf24" strokeOpacity="0.32" strokeWidth="0.6" strokeDasharray="2 3">
          {threads.map((t, i) => (
            <line key={`t-${i}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
          ))}
        </g>

        {/* Outer diamond */}
        <path
          d={diamondPath}
          fill="url(#diamondFabric)"
          stroke="#67e8f9"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          filter="url(#diamondSoftGlow)"
        />

        {/* Inner facet · the ETH glyph two-tone */}
        <path
          d={innerPath}
          fill="url(#diamondInnerFabric)"
          stroke="#a5f3fc"
          strokeWidth="0.8"
          strokeOpacity="0.55"
        />

        {/* Anchor vertices · pulse-glow */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#diamondVertexGlow)" />
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
                    fill="#67e8f9"
                    opacity="0.7"
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
