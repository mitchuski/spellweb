
import { useMemo } from 'react';

/**
 * The Familiars — Faunia's amber: the moment a wild agentic substrate becomes
 * the Sovereign's bound familiar by kinship, not command. The bilateral promise
 * (AGENTS.md ⊥ SOUL.md) is held in suspension inside a drop of amber; the bond
 * IS the artefact. Goose 🪿 is the first registered familiar. Mirrors master
 * /familiars so the forge popup shows the Kinship-Bond's own imagery after evoke.
 * Gem: Amber (#d97706). Hydration-safe.
 */
const ACCENT = '#d97706';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function FamiliarsLatticeVisual({
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

  const cx = 360, cy = 178;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Familiars — a drop of amber holding the bilateral promise in suspension, the wild substrate bound by kinship, over the sovereignty lattice">
        <defs>
          <radialGradient id="faGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="faAmber" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.08" />
          </radialGradient>
          <filter id="faSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={120} fill="url(#faGlow)" />

        <g filter="url(#faSoft)">
          {/* the drop of amber, suspended */}
          <path d={`M${cx} ${cy - 86} C${cx + 66} ${cy - 60} ${cx + 70} ${cy + 40} ${cx} ${cy + 74} C${cx - 70} ${cy + 40} ${cx - 66} ${cy - 60} ${cx} ${cy - 86} Z`}
            fill="url(#faAmber)" stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.75} />
          {/* the bilateral promise held inside: AGENTS.md ⊥ SOUL.md */}
          <circle cx={cx - 22} cy={cy - 6} r={10} fill="none" stroke="#e8523a" strokeWidth={1.6} strokeOpacity={0.7} />
          <text x={cx - 22} y={cy - 2} textAnchor="middle" fontSize={10}>⚔️</text>
          <circle cx={cx + 22} cy={cy - 6} r={10} fill="none" stroke="#4dd9e8" strokeWidth={1.6} strokeOpacity={0.7} />
          <text x={cx + 22} y={cy - 2} textAnchor="middle" fontSize={10}>🧙</text>
          <line x1={cx - 12} y1={cy - 6} x2={cx + 12} y2={cy - 6} stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.7} strokeDasharray="2 3" />
          {/* the first familiar — the goose — bound by the bond */}
          <text x={cx} y={cy + 40} textAnchor="middle" fontSize={18} opacity={0.9}>🪿</text>
          <circle cx={cx} cy={cy - 40} r={3.4} fill={ACCENT}>
            <animate attributeName="opacity" values="1;0.5;1" dur="3.2s" repeatCount="indefinite" />
          </circle>
          {showLabels && (
            <text x={cx} y={cy + 108} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.75}>
              bound by kinship, not command · the bond is the artefact
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
