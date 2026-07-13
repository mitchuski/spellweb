
import { useMemo } from 'react';

/**
 * Solchanting — Helia's sun refracted through the Heliodor Prism into parallel
 * beams: the Solana / Sealevel parallel runtime made light. One source, many
 * lanes running at once. Mirrors master /solchanting so the forge popup shows
 * the Heliodor Prism's own imagery after evoke. Gem: Heliodor (#facc15). Shares
 * V51 with Etherchanting by Swordsman stance. Hydration-safe.
 */
const ACCENT = '#facc15';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function SolchantingLatticeVisual({
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
    const cols = 16, rows = 10, padX = 30, padY = 30;
    const dx = (W - 2 * padX) / (cols - 1);
    const dy = (H - 2 * padY) / (rows - 1);
    const dots: { x: number; y: number; row: number; col: number }[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        dots.push({ x: snap(padX + c * dx + (r % 2) * dx / 2), y: snap(padY + r * dy), row: r, col: c });
    return dots;
  }, []);

  const sunX = 210, sunY = 180;
  const prismX = 360;
  const lanes = [-48, -24, 0, 24, 48]; // parallel output beams
  const sunRays = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="Solchanting — a sun refracted through a prism into parallel beams, the parallel runtime made light, over the sovereignty lattice">
        <defs>
          <radialGradient id="soGlow" cx="30%" cy="50%" r="60%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="soSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={sunX} cy={sunY} r={130} fill="url(#soGlow)" />

        <g filter="url(#soSoft)">
          {/* the sun */}
          <circle cx={sunX} cy={sunY} r={30} fill={ACCENT} fillOpacity={0.18} stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.75} />
          {sunRays.map((a, i) => (
            <line key={`sr-${i}`} x1={snap(sunX + 34 * Math.cos(a))} y1={snap(sunY + 34 * Math.sin(a))}
              x2={snap(sunX + 46 * Math.cos(a))} y2={snap(sunY + 46 * Math.sin(a))}
              stroke={ACCENT} strokeOpacity={0.4} strokeWidth={1.2} strokeLinecap="round" />
          ))}
          {/* the single beam into the prism */}
          <line x1={sunX + 30} y1={sunY} x2={prismX - 24} y2={sunY} stroke={ACCENT} strokeWidth={2} strokeOpacity={0.6} strokeLinecap="round" />
          {/* the Heliodor Prism */}
          <path d={`M${prismX} ${sunY - 34} L${prismX + 26} ${sunY + 26} L${prismX - 26} ${sunY + 26} Z`} fill={ACCENT} fillOpacity={0.12} stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.8} />
          {/* the parallel output beams — the runtime lanes */}
          {lanes.map((dy, i) => (
            <g key={`lane-${i}`}>
              <line x1={prismX + 24} y1={sunY} x2={560} y2={sunY + dy} stroke={ACCENT} strokeWidth={1.5} strokeOpacity={0.3 + Math.abs(2 - i) * 0.08}>
                <animate attributeName="stroke-opacity" values="0.25;0.6;0.25" dur={`${3 + i}s`} repeatCount="indefinite" />
              </line>
              <circle cx={562} cy={sunY + dy} r={2.6} fill={ACCENT} opacity={0.7} />
            </g>
          ))}
          {showLabels && (
            <text x={380} y={sunY + 92} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>
              one source · many lanes at once · refract · declare
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
