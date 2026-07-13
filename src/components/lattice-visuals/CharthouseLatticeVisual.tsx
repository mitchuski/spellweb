
import { useMemo } from 'react';

/**
 * The Chart Shop — Pleione's astrolabe: pre-episodic constellations held in
 * suspension, a compass rose, rings that measure without yet deciding. The
 * bearer releases to the Bonfire, the Weavers, or back to the open sea. Mirrors
 * master /charthouse so the forge popup shows the Astrolabe's own imagery after
 * evoke. Gem: Aquamarine (#5eead4). Hydration-safe.
 */
const ACCENT = '#5eead4';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function CharthouseLatticeVisual({
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

  const cx = 360, cy = 185;
  // held constellation — stars in suspension around the astrolabe
  const stars = [
    { x: cx - 62, y: cy - 44 }, { x: cx + 40, y: cy - 58 }, { x: cx + 70, y: cy - 8 },
    { x: cx + 30, y: cy + 46 }, { x: cx - 44, y: cy + 40 }, { x: cx - 78, y: cy + 4 },
  ];
  const spokes = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Chart Shop — an astrolabe with a compass rose and a constellation held in suspension, over the sovereignty lattice">
        <defs>
          <radialGradient id="crGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="crSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={120} fill="url(#crGlow)" />

        <g filter="url(#crSoft)">
          {/* astrolabe rings */}
          {[92, 68, 44].map((r, i) => (
            <circle key={`ring-${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={ACCENT} strokeWidth={1.3} strokeOpacity={0.3 + i * 0.12} />
          ))}
          {/* compass rose spokes */}
          {spokes.map((a, i) => (
            <line key={`spoke-${i}`} x1={cx} y1={cy} x2={snap(cx + 92 * Math.cos(a))} y2={snap(cy + 92 * Math.sin(a))}
              stroke={ACCENT} strokeOpacity={i % 2 === 0 ? 0.4 : 0.18} strokeWidth={i % 2 === 0 ? 1.2 : 0.8} />
          ))}
          {/* the north needle */}
          <path d={`M${cx} ${cy} L${cx - 6} ${cy - 4} L${cx} ${cy - 74} L${cx + 6} ${cy - 4} Z`} fill={ACCENT} fillOpacity={0.55} />
          <circle cx={cx} cy={cy} r={4} fill={ACCENT}>
            <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* the held constellation — traced but not yet released */}
          <path d={`M${stars.map((s, i) => `${i === 0 ? '' : 'L'}${s.x} ${s.y}`).join(' ')} Z`} fill="none" stroke={ACCENT} strokeOpacity={0.28} strokeWidth={0.9} strokeDasharray="2 4" />
          {stars.map((s, i) => (
            <circle key={`star-${i}`} cx={s.x} cy={s.y} r={2.4} fill={ACCENT} opacity={0.75}>
              {i % 2 === 0 && <animate attributeName="opacity" values="0.5;0.9;0.5" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" />}
            </circle>
          ))}
          {showLabels && (
            <text x={cx} y={cy + 116} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>
              held in suspension · hold · compare · map
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
