
import { useMemo } from 'react';

/**
 * The Persona Circuit — a claim bound into a proof circuit and shown true
 * *without* revealing what it is. Constraint nodes wire to a sealed veil; only
 * a single ✓ escapes it. Mirrors master /circuit so the forge popup shows the
 * Witness Circuit's own imagery after evoke. Gem: Clear Quartz (#c4b5fd).
 * V38 ⊥ V25 (Lethe stays dark by design). Hydration-safe.
 */
const ACCENT = '#c4b5fd';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function CircuitLatticeVisual({
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

  // constraint gates feeding a sealed veil; one proof escapes
  const gates = [
    { x: 210, y: 150 }, { x: 210, y: 210 }, { x: 270, y: 120 },
    { x: 270, y: 180 }, { x: 270, y: 240 }, { x: 330, y: 150 }, { x: 330, y: 210 },
  ];
  const veilX = 430;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Persona Circuit — constraint gates wired into a sealed veil, with a single proof escaping, over the sovereignty lattice">
        <defs>
          <radialGradient id="ciGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="ciSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={360} cy={180} r={120} fill="url(#ciGlow)" />

        <g filter="url(#ciSoft)">
          {/* wires from gates into the veil */}
          {gates.map((g, i) => (
            <line key={`wire-${i}`} x1={g.x} y1={g.y} x2={veilX - 40} y2={180} stroke={ACCENT} strokeOpacity={0.28} strokeWidth={1} />
          ))}
          {gates.map((g, i) => (
            <g key={`gate-${i}`}>
              <rect x={g.x - 8} y={g.y - 8} width={16} height={16} rx={3} fill={ACCENT} fillOpacity={0.08} stroke={ACCENT} strokeWidth={1.2} strokeOpacity={0.6} />
              <circle cx={g.x} cy={g.y} r={2} fill={ACCENT} opacity={0.7} />
            </g>
          ))}
          {/* the sealed veil — nothing behind it is revealed */}
          <rect x={veilX - 40} y={110} width={70} height={140} rx={6} fill={ACCENT} fillOpacity={0.1} stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.75} strokeDasharray="2 4" />
          <text x={veilX - 5} y={185} textAnchor="middle" fontSize={16} opacity={0.85}>🔒</text>
          {/* the single proof that escapes */}
          <line x1={veilX + 30} y1={180} x2={560} y2={180} stroke={ACCENT} strokeWidth={2} strokeOpacity={0.7} strokeLinecap="round" />
          <circle cx={572} cy={180} r={16} fill="none" stroke={ACCENT} strokeWidth={2} strokeOpacity={0.8} />
          <text x={572} y={186} textAnchor="middle" fontSize={15} fill={ACCENT}>✓</text>
          <circle cx={572} cy={180} r={22} fill={ACCENT} fillOpacity={0}>
            <animate attributeName="fill-opacity" values="0;0.12;0" dur="2.8s" repeatCount="indefinite" />
          </circle>
          {showLabels && (
            <>
              <text x={270} y={286} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={8} fill={ACCENT} opacity={0.6}>the claim, bound</text>
              <text x={360} y={306} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>proven true · revealing nothing</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
