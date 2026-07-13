
import { useMemo } from 'react';

/**
 * The Horizon District — the eastern watch. A horizon line with a rising sun and
 * a durability gauge measured against the quantum horizon (Mosca X+Y>Z): a
 * signal, not an attack. Three stance-differentiated keepers share V35. Mirrors
 * master /horizon so the forge popup shows the Horizon Glass's own imagery after
 * evoke. Gem: Sunstone (#ff8c42). Hydration-safe.
 */
const ACCENT = '#ff8c42';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function HorizonLatticeVisual({
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

  const cx = 360, horizonY = 214;
  const rays = Array.from({ length: 9 }, (_, i) => ((i - 4) / 4) * (Math.PI / 3) - Math.PI / 2);
  // three keepers on the watch
  const keepers = [{ x: cx - 120, e: '🌅' }, { x: cx, e: '🪨' }, { x: cx + 120, e: '🛤️' }];

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Horizon District — a rising sun over a horizon line with a durability gauge measured against the quantum horizon, over the sovereignty lattice">
        <defs>
          <radialGradient id="hoGlow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="hoSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={cx} cy={130} r={130} fill="url(#hoGlow)" />

        <g filter="url(#hoSoft)">
          {/* the horizon line */}
          <line x1={120} y1={horizonY} x2={600} y2={horizonY} stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.6} />
          {/* the rising sun, half over the horizon */}
          <path d={`M${cx - 46} ${horizonY} a46 46 0 0 1 92 0 Z`} fill={ACCENT} fillOpacity={0.16} stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.7} />
          {rays.map((a, i) => (
            <line key={`ray-${i}`} x1={snap(cx + 50 * Math.cos(a))} y1={snap(horizonY + 50 * Math.sin(a))}
              x2={snap(cx + 72 * Math.cos(a))} y2={snap(horizonY + 72 * Math.sin(a))}
              stroke={ACCENT} strokeOpacity={0.4} strokeWidth={1.2} strokeLinecap="round">
              <animate attributeName="stroke-opacity" values="0.25;0.6;0.25" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />
            </line>
          ))}
          {/* the durability gauge — X+Y vs Z */}
          <rect x={cx - 80} y={horizonY + 22} width={160} height={10} rx={5} fill={ACCENT} fillOpacity={0.08} stroke={ACCENT} strokeWidth={1} strokeOpacity={0.5} />
          <rect x={cx - 80} y={horizonY + 22} width={96} height={10} rx={5} fill={ACCENT} fillOpacity={0.35} />
          <line x1={cx + 40} y1={horizonY + 18} x2={cx + 40} y2={horizonY + 36} stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.85} />
          {showLabels && <text x={cx + 40} y={horizonY + 50} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7} fill={ACCENT} opacity={0.6}>X+Y &gt; Z</text>}
          {/* the three keepers on the watch */}
          {keepers.map((k, i) => (
            <text key={`k-${i}`} x={k.x} y={horizonY - 8} textAnchor="middle" fontSize={13} opacity={0.85}>{k.e}</text>
          ))}
          {showLabels && (
            <text x={cx} y={horizonY + 70} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>
              measured against the horizon · a signal, not an attack
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
