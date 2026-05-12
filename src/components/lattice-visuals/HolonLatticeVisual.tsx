
import { useMemo } from 'react';

/**
 * The holon traced through the 64-vertex sovereignty lattice.
 * A six-petaled rose — each petal a whole that is also a part — radiating from
 * a central crown. Mirrors the Oasis ROSE motif while reading as the holonic
 * "wholes-within-wholes" structure of paratimes nested in a network.
 *
 * Used on /holon — the Oasis Network workshop.
 */
export default function HolonLatticeVisual({
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

  const cx = 360;
  const cy = 180;

  // Six petals · ROSE · each is a holon (whole + part)
  const petalAngles = [0, 60, 120, 180, 240, 300];
  const petalRx = 32;
  const petalRy = 78;
  // Petal centre is offset from crown along its angle.
  const petalOffset = 60;

  function petalCenter(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.round(cx + petalOffset * Math.cos(rad)),
      y: Math.round(cy - petalOffset * Math.sin(rad)),
    };
  }

  // Anchor labels mark three of the petals as the operational paratimes.
  const labelledPetals = [
    { angle: 90, label: 'α', sub: 'Sapphire' },
    { angle: 210, label: 'β', sub: 'Emerald' },
    { angle: 330, label: 'γ', sub: 'Cipher' },
  ];

  // Petal anchor (used for the glow + label) sits at the outer tip of the petal.
  function petalTip(angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    const r = petalOffset + petalRy - 8;
    return {
      x: Math.round(cx + r * Math.cos(rad)),
      y: Math.round(cy - r * Math.sin(rad)),
    };
  }

  const featured = labelledPetals.map((p) => ({
    ...petalTip(p.angle),
    label: p.label,
    sub: p.sub,
  }));

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Six-petaled holon traced through the 64-vertex sovereignty lattice"
      >
        <defs>
          <radialGradient id="holonFabric" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.30" />
            <stop offset="55%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
          </radialGradient>
          <radialGradient id="holonCrownGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="holonVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <filter id="holonSoftGlow">
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
              fill="#34d399"
              opacity={0.18 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Six petals · the holon-rose */}
        <g filter="url(#holonSoftGlow)">
          {petalAngles.map((angle) => {
            const c = petalCenter(angle);
            return (
              <ellipse
                key={`p-${angle}`}
                cx={c.x}
                cy={c.y}
                rx={petalRx}
                ry={petalRy}
                transform={`rotate(${-angle} ${c.x} ${c.y})`}
                fill="url(#holonFabric)"
                stroke="#34d399"
                strokeWidth="1.1"
                strokeOpacity="0.5"
              />
            );
          })}
        </g>

        {/* Crown · the central holon */}
        <circle cx={cx} cy={cy} r={28} fill="url(#holonCrownGlow)" />
        <circle cx={cx} cy={cy} r={6} fill="#fbbf24" opacity="0.85">
          <animate
            attributeName="opacity"
            values="0.85;0.5;0.85"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Anchor vertices · α · β · γ at petal tips */}
        {featured.map((f) => (
          <g key={f.label}>
            <circle cx={f.x} cy={f.y} r={14} fill="url(#holonVertexGlow)" />
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
                  y={f.y - 14}
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
                    fill="#34d399"
                    opacity="0.8"
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
