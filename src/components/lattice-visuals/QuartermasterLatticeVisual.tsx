
import { useMemo } from 'react';

/**
 * The Quartermaster's rig — a fitted harness hung on a rack, drawn over the
 * 64-vertex lattice. The six-phase loop is a ring of nodes; the two agent-orbs
 * (⚔️ ⊥ 🧙) are held apart by the Gap at its centre. A config, not a fork.
 *
 * Mirrors the emblem at the top of master /quartermaster so the spellweb forge
 * popup shows the Kitbag's own imagery instead of a generic blade after evoke.
 * Gem: Bronzite (#9ca3af). Hydration-safe (deterministic, snapped coords).
 */
const ACCENT = '#9ca3af';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function QuartermasterLatticeVisual({
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
  const ring = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return { x: snap(cx + 58 * Math.cos(a)), y: snap(196 + 58 * Math.sin(a)) };
  });

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Quartermaster's fitted rig — the six-phase loop with two agents held apart by the Gap, over the sovereignty lattice">
        <defs>
          <radialGradient id="qmGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="qmSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={cx} cy={190} r={120} fill="url(#qmGlow)" />

        <g filter="url(#qmSoft)">
          {/* the rack bar + hangers */}
          <line x1={200} y1={96} x2={520} y2={96} stroke={ACCENT} strokeWidth={2.5} strokeOpacity={0.75} strokeLinecap="round" />
          {[240, cx, 480].map((x) => (
            <line key={x} x1={x} y1={96} x2={x} y2={120} stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.5} />
          ))}
          {showLabels && (
            <text x={cx} y={82} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.6}>
              the rack · drawn and returned
            </text>
          )}
          {/* the rig: the six-phase loop-ring, two orbs held apart by the Gap */}
          <path d={`M${ring.map((p, i) => `${i === 0 ? '' : 'L'}${p.x} ${p.y}`).join(' ')} Z`} fill="none" stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.55} />
          {ring.map((p, i) => (
            <circle key={`r-${i}`} cx={p.x} cy={p.y} r={3} fill={ACCENT} opacity={0.7} />
          ))}
          <circle cx={cx - 34} cy={196} r={9} fill="none" stroke="#e8523a" strokeWidth={2} />
          <text x={cx - 34} y={200} textAnchor="middle" fontSize={11}>⚔️</text>
          <circle cx={cx + 34} cy={196} r={9} fill="none" stroke="#4dd9e8" strokeWidth={2} />
          <text x={cx + 34} y={200} textAnchor="middle" fontSize={11}>🧙</text>
          <circle cx={cx} cy={196} r={5} fill={ACCENT}>
            <animate attributeName="opacity" values="1;0.5;1" dur="2.6s" repeatCount="indefinite" />
          </circle>
          {showLabels && (
            <text x={cx} y={296} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>
              a config, not a fork
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
