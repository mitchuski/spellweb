
import { useMemo } from 'react';

/**
 * The runecraft hub visual — a tetrahedron projected on the 64-vertex lattice,
 * with two crossed blades (Aletheia 🌟 disclosure · Lethe 🌀 forgetting) running
 * through its centroid. Six edges of the tetrahedron carry the six dimensions of
 * sovereignty; the two blades are the dihedral pair that crosses every cloak,
 * shield, and forging.
 *
 * Used on /runecraft.
 */
export default function RuneLatticeVisual({
  className,
  height = 'h-56 sm:h-72',
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

  // ─── Tetrahedron (Schlegel diagram · 4 vertices · 6 edges) ──────────────
  // Outer triangle (one face) + inner vertex (the back vertex projected inside).
  const apex = { x: 360, y: 70 };
  const baseL = { x: 250, y: 290 };
  const baseR = { x: 470, y: 290 };
  const inner = { x: 360, y: 195 }; // approx centroid · the back-vertex projection

  const tetraEdges: Array<[{ x: number; y: number }, { x: number; y: number }]> = [
    // Outer face (visible triangle)
    [apex, baseL],
    [baseL, baseR],
    [baseR, apex],
    // Inner connections (front vertex to the three other vertices)
    [apex, inner],
    [baseL, inner],
    [baseR, inner],
  ];

  // ─── Two blades crossing through the centroid ──────────────────────────
  // Aletheia · disclosure · NW→SE · gold-amber
  // Lethe    · forgetting · NE→SW · violet
  const aletheiaTipNW = { x: 110, y: 90 };
  const aletheiaTipSE = { x: 610, y: 290 };
  const letheTipNE = { x: 610, y: 90 };
  const letheTipSW = { x: 110, y: 290 };

  // Build a thin lozenge polygon for each blade.
  function bladePath(p1: { x: number; y: number }, p2: { x: number; y: number }, halfWidth: number) {
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const sAx = cx + px * halfWidth;
    const sAy = cy + py * halfWidth;
    const sBx = cx - px * halfWidth;
    const sBy = cy - py * halfWidth;
    return `M ${p1.x} ${p1.y} L ${sAx.toFixed(1)} ${sAy.toFixed(1)} L ${p2.x} ${p2.y} L ${sBx.toFixed(1)} ${sBy.toFixed(1)} Z`;
  }

  const aletheiaPath = bladePath(aletheiaTipNW, aletheiaTipSE, 7);
  const lethePath = bladePath(letheTipNE, letheTipSW, 7);

  // Featured anchor vertices · 4 tetrahedron + 2 blade-tip markers = 6
  const anchors = [
    { ...apex, label: 'apex' },
    { ...baseL, label: 'BL' },
    { ...baseR, label: 'BR' },
    { ...inner, label: 'centroid' },
    { ...aletheiaTipNW, label: '🌟 Aletheia', tone: 'aletheia' },
    { ...letheTipNE, label: '🌀 Lethe', tone: 'lethe' },
  ];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`w-full ${height}`}
        role="img"
        aria-label="Tetrahedron on the 64-vertex sovereignty lattice with the Aletheia and Lethe blades crossed through its centroid"
      >
        <defs>
          <radialGradient id="runeGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.03" />
          </radialGradient>
          <radialGradient id="runeVertexGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="aletheiaFabric" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="letheFabric" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.85" />
          </linearGradient>
          <filter id="runeSoftGlow">
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
              fill="#a78bfa"
              opacity={0.16 + (((d.row + d.col) % 4) * 0.04)}
            />
          ))}
        </g>

        {/* Tetrahedron edges · faded scaffold behind the blades */}
        <g stroke="#67e8f9" strokeOpacity="0.22" strokeWidth="1">
          {tetraEdges.map(([a, b], i) => (
            <line key={`e-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ))}
        </g>

        {/* Centroid glow — the convergence */}
        <circle cx={inner.x} cy={inner.y} r={70} fill="url(#runeGlow)" />

        {/* Aletheia blade · disclosure · NW→SE · amber */}
        <path
          d={aletheiaPath}
          fill="url(#aletheiaFabric)"
          stroke="#fbbf24"
          strokeWidth="0.9"
          strokeOpacity="0.9"
          filter="url(#runeSoftGlow)"
        />

        {/* Lethe blade · forgetting · NE→SW · violet */}
        <path
          d={lethePath}
          fill="url(#letheFabric)"
          stroke="#c4b5fd"
          strokeWidth="0.9"
          strokeOpacity="0.9"
          filter="url(#runeSoftGlow)"
        />

        {/* Anchor vertices · 4 tetrahedron + 2 blade tips · pulse-glow */}
        {anchors.map((a) => (
          <g key={a.label}>
            <circle cx={a.x} cy={a.y} r={12} fill="url(#runeVertexGlow)" />
            <circle cx={a.x} cy={a.y} r={2.8} fill="#fbbf24" opacity="0.85">
              <animate
                attributeName="opacity"
                values="0.85;0.45;0.85"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
