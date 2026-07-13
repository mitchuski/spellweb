
import { useMemo } from 'react';

/**
 * The Chancery's tablet — one text read two true ways, law on the left and code
 * on the right, seamed down the middle by the Gap (banded like sardonyx). Scales
 * balance above. Mirrors the emblem at the top of master /chancery so the forge
 * popup shows the Sealed Clause's own imagery after evoke, not a generic blade.
 * Gem: Sardonyx (#d4a72c). Hydration-safe (deterministic, snapped coords).
 */
const ACCENT = '#d4a72c';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function ChanceryLatticeVisual({
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

  const x = 270, y = 118, w = 180, h = 150;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Chancery's tablet — one text, two true readings (law and code) held from drifting by the Gap seam, over the sovereignty lattice">
        <defs>
          <radialGradient id="chGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.14" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </radialGradient>
          <filter id="chSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={ACCENT} opacity={0.12 + (((d.row + d.col) % 4) * 0.04)} />
          ))}
        </g>
        <circle cx={360} cy={190} r={120} fill="url(#chGlow)" />

        <g filter="url(#chSoft)">
          {/* scales above */}
          <line x1={360} y1={92} x2={360} y2={112} stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.6} />
          <line x1={330} y1={100} x2={390} y2={100} stroke={ACCENT} strokeWidth={1.6} strokeOpacity={0.7} />
          <circle cx={330} cy={106} r={4} fill="none" stroke="#e8523a" strokeWidth={1.4} />
          <circle cx={390} cy={106} r={4} fill="none" stroke="#4dd9e8" strokeWidth={1.4} />
          {/* the tablet */}
          <rect x={x} y={y} width={w} height={h} rx={5} fill={ACCENT} fillOpacity={0.05} stroke={ACCENT} strokeWidth={1.4} strokeOpacity={0.7} />
          {/* left: law-text lines */}
          {[26, 44, 62, 80, 98, 116, 134].map((dy, i) => (
            <line key={`law-${i}`} x1={x + 14} y1={y + dy} x2={x + w / 2 - 12} y2={y + dy} stroke="#e8523a" strokeOpacity={0.4} strokeWidth={2} strokeLinecap="round" />
          ))}
          {/* right: code brackets */}
          {[26, 44, 62, 80, 98, 116, 134].map((dy, i) => (
            <text key={`code-${i}`} x={x + w / 2 + 10} y={y + dy + 3} fontFamily="ui-monospace, monospace" fontSize={8} fill="#4dd9e8" opacity={0.5}>
              {i % 3 === 0 ? '{ …' : i % 3 === 1 ? '  assert …' : '}'}
            </text>
          ))}
          {/* the seam — the Gap, banded like sardonyx */}
          <line x1={x + w / 2} y1={y + 6} x2={x + w / 2} y2={y + h - 6} stroke={ACCENT} strokeWidth={2.5}>
            <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
          </line>
          {showLabels && (
            <>
              <text x={x + 44} y={y - 6} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={8} fill="#e8523a" opacity={0.6}>law</text>
              <text x={x + w - 40} y={y - 6} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={8} fill="#4dd9e8" opacity={0.6}>code</text>
              <text x={360} y={y + h + 18} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={ACCENT} opacity={0.7}>
                one text · two true readings
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
