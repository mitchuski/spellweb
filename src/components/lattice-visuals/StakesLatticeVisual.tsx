
import { useMemo } from 'react';

/**
 * The Stakes — Custos's open square. A finite-resource stake driven into the
 * ground in daylight and witnessed by all: where the Circuit proves by revealing
 * nothing, the Stakes proves by revealing everything. The lock is open. Mirrors
 * master /stakes so the forge popup shows the Staking Proof's own imagery after
 * evoke. Gem: Hematite (#94a3b8). V49, shares with the Jeweler by stance.
 * Hydration-safe.
 */
const ACCENT = '#94a3b8';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function StakesLatticeVisual({
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
  const witnesses = Array.from({ length: 10 }, (_, i) => ({ x: 170 + i * 42, y: 300 }));
  const coins = [{ x: cx - 22, y: 246 }, { x: cx + 22, y: 246 }, { x: cx, y: 262 }];

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Stakes — a resource stake driven into the open square, lock open, witnessed by all around, over the sovereignty lattice">
        <defs>
          <radialGradient id="stGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="stSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={cx} cy={180} r={120} fill="url(#stGlow)" />

        <g filter="url(#stSoft)">
          {/* the ground line — the open square */}
          <line x1={150} y1={276} x2={570} y2={276} stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.5} />
          {/* the stake, driven upright, visible top to bottom */}
          <line x1={cx} y1={110} x2={cx} y2={276} stroke={ACCENT} strokeWidth={3} strokeOpacity={0.75} strokeLinecap="round" />
          <path d={`M${cx} 100 L${cx - 10} 116 L${cx + 10} 116 Z`} fill={ACCENT} fillOpacity={0.6} />
          {/* the open lock at its head — proof by revealing everything */}
          <rect x={cx - 12} y={128} width={24} height={20} rx={4} fill={ACCENT} fillOpacity={0.12} stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.8} />
          <path d="M0 0" />
          <path d={`M${cx - 8} 128 v-8 a8 8 0 0 1 16 0`} fill="none" stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.8} />
          {/* the staked resource, in the open */}
          {coins.map((c, i) => (
            <circle key={`coin-${i}`} cx={c.x} cy={c.y} r={7} fill={ACCENT} fillOpacity={0.18} stroke={ACCENT} strokeWidth={1.2} strokeOpacity={0.7} />
          ))}
          {/* witnesses around the square */}
          {witnesses.map((wt, i) => (
            <g key={`w-${i}`}>
              <line x1={cx} y1={200} x2={wt.x} y2={wt.y - 6} stroke={ACCENT} strokeOpacity={0.12} strokeWidth={1} />
              <circle cx={wt.x} cy={wt.y} r={2.6} fill={ACCENT} opacity={0.6}>
                {i % 3 === 0 && <animate attributeName="opacity" values="0.4;0.85;0.4" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />}
              </circle>
            </g>
          ))}
          {showLabels && (
            <text x={cx} y={330} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>
              staked in daylight · proven by revealing everything
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
