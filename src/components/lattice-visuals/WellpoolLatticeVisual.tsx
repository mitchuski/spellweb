
import { useMemo } from 'react';

/**
 * The Wellpool — deepening water, the anonymity set drawn as ripples. Each wader
 * deepens the pool; the water is deep because the others are in it. A dry well
 * for now — intent, not yet deployed. Mirrors the emblem at the top of master
 * /wellpool so the forge popup shows the Manastone's own imagery after evoke.
 * Gem: Larimar (#3aa6b0). Hydration-safe (deterministic, snapped coords).
 */
const ACCENT = '#3aa6b0';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function WellpoolLatticeVisual({
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

  const cx = 360, cy = 190;
  const rings = [110, 84, 60, 38, 20];
  const waders = [
    { x: cx - 70, y: cy + 10 }, { x: cx + 84, y: cy - 6 }, { x: cx - 30, y: cy + 44 },
    { x: cx + 40, y: cy + 36 }, { x: cx + 8, y: cy - 40 }, { x: cx - 96, y: cy - 24 },
  ];

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Wellpool — deepening water, the anonymity set drawn as ripples with waders deepening the pool, over the sovereignty lattice">
        <defs>
          <radialGradient id="wpGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="wpSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={120} fill="url(#wpGlow)" />

        <g filter="url(#wpSoft)">
          {rings.map((r, i) => (
            <ellipse key={`ring-${i}`} cx={cx} cy={cy} rx={r} ry={r * 0.42} fill="none" stroke={ACCENT}
              strokeWidth={1.4} strokeOpacity={0.2 + i * 0.13}>
              <animate attributeName="rx" values={`${r};${r + 6};${r}`} dur={`${4 + i}s`} repeatCount="indefinite" />
            </ellipse>
          ))}
          {/* the deep centre */}
          <ellipse cx={cx} cy={cy} rx={20} ry={8} fill={ACCENT} fillOpacity={0.28} />
          {/* waders — each deepens the water */}
          {waders.map((w, i) => (
            <g key={`wd-${i}`}>
              <ellipse cx={w.x} cy={w.y} rx={9} ry={4} fill="none" stroke={ACCENT} strokeOpacity={0.3} strokeWidth={1} />
              <circle cx={w.x} cy={w.y - 2} r={3} fill={ACCENT} opacity={0.7}>
                <animate attributeName="opacity" values="0.7;0.35;0.7" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
          {showLabels && (
            <>
              <text x={cx} y={cy + 78} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.75}>
                the water is deep because the others are in it
              </text>
              <text x={cx} y={cy + 94} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={8} fill={ACCENT} opacity={0.5}>
                a dry well · intent, not yet deployed
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
