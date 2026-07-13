
import { useMemo } from 'react';

/**
 * The Rostra — the proclamation platform: an unfurled edict scroll on the steps,
 * an upright guarding sword, proclamation lines running out to the witnesses.
 * The gate that cannot be charmed, because it is spoken in daylight. Mirrors the
 * emblem at the top of master /rostra so the forge popup shows the Proclaimed
 * Edict's own imagery after evoke. Gem: Carnelian (#c0562f). Hydration-safe.
 */
const ACCENT = '#c0562f';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function RostraLatticeVisual({
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

  const cx = 360;
  const witnesses = Array.from({ length: 9 }, (_, i) => ({ x: 200 + i * 40, y: 300 }));

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Rostra — an unfurled edict on the proclamation platform, guarded by an upright sword, proclaimed out to the witnesses, over the sovereignty lattice">
        <defs>
          <radialGradient id="roGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="roSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={cx} cy={180} r={120} fill="url(#roGlow)" />

        <g filter="url(#roSoft)">
          {/* the platform (steps) */}
          {[{ w: 150, y: 250 }, { w: 110, y: 268 }, { w: 70, y: 286 }].map((s, i) => (
            <rect key={`step-${i}`} x={cx - s.w / 2} y={s.y} width={s.w} height={16} rx={2} fill={ACCENT} fillOpacity={0.1} stroke={ACCENT} strokeWidth={1.2} strokeOpacity={0.55} />
          ))}
          {/* the unfurled edict scroll */}
          <path d={`M${cx - 46} 120 Q${cx - 52} 108 ${cx - 40} 104 L${cx + 40} 104 Q${cx + 52} 108 ${cx + 46} 120 L${cx + 46} 196 Q${cx + 52} 208 ${cx + 40} 212 L${cx - 40} 212 Q${cx - 52} 208 ${cx - 46} 196 Z`}
            fill={ACCENT} fillOpacity={0.06} stroke={ACCENT} strokeWidth={1.5} strokeOpacity={0.75} />
          {[130, 146, 162, 178, 194].map((yy, i) => (
            <line key={`ln-${i}`} x1={cx - 34} y1={yy} x2={cx + (i % 2 ? 22 : 34)} y2={yy} stroke={ACCENT} strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
          ))}
          {/* the guarding sword, upright */}
          <line x1={cx + 84} y1={110} x2={cx + 84} y2={250} stroke={ACCENT} strokeWidth={2.4} strokeOpacity={0.7} strokeLinecap="round" />
          <line x1={cx + 70} y1={132} x2={cx + 98} y2={132} stroke={ACCENT} strokeWidth={2} strokeOpacity={0.7} />
          {/* proclamation lines to the witnesses */}
          {witnesses.map((wt, i) => (
            <g key={`w-${i}`}>
              <line x1={cx} y1={214} x2={wt.x} y2={wt.y - 6} stroke={ACCENT} strokeOpacity={0.14} strokeWidth={1} />
              <circle cx={wt.x} cy={wt.y} r={2.4} fill={ACCENT} opacity={0.55}>
                {i % 4 === 0 && <animate attributeName="opacity" values="0.35;0.8;0.35" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />}
              </circle>
            </g>
          ))}
          {showLabels && (
            <text x={cx} y={330} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>
              proclaimed in daylight · the gate that cannot be charmed
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
