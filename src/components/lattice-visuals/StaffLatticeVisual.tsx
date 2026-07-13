
import { useMemo } from 'react';

/**
 * The Staff Shop — Hermaion's caduceus: the City's first archetype-modal
 * workshop. One staff, two entwined serpents, and an Alexandrite that shifts
 * daylight-green (Mage) ↔ incandescent-red (Swordsman). Admit · Read · Attest ·
 * Shift. Mirrors master /staffs so the forge popup shows the Hermes-class
 * fitting's own imagery after evoke. Gems: Alexandrite green #3d7c47 /
 * red #a23a3a. Hydration-safe.
 */
const MAGE = '#3d7c47';
const SWORD = '#a23a3a';
const snap = (n: number) => Math.round(n * 100) / 100;

export default function StaffLatticeVisual({
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
  const top = 96, bottom = 288;
  // two entwined serpents as sine waves around the shaft
  const coils = 5;
  const leftPath = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    const y = top + t * (bottom - top);
    const x = cx + 18 * Math.sin(t * coils * Math.PI);
    return `${i === 0 ? 'M' : 'L'}${snap(x)} ${snap(y)}`;
  }).join(' ');
  const rightPath = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    const y = top + t * (bottom - top);
    const x = cx - 18 * Math.sin(t * coils * Math.PI);
    return `${i === 0 ? 'M' : 'L'}${snap(x)} ${snap(y)}`;
  }).join(' ');

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${height}`} role="img" aria-label="The Staff Shop — a caduceus with two entwined serpents and an Alexandrite that shifts between mage-green and swordsman-red, over the sovereignty lattice">
        <defs>
          <radialGradient id="sfGlowM" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor={MAGE} stopOpacity="0.12" />
            <stop offset="100%" stopColor={MAGE} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sfShift" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={MAGE} />
            <stop offset="100%" stopColor={SWORD} />
          </linearGradient>
          <filter id="sfSoft">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g aria-hidden>
          {lattice.map((d, i) => (
            <circle key={`l-${i}`} cx={d.x} cy={d.y} r={0.9} fill={MAGE} opacity={0.1 + (((d.row + d.col) % 4) * 0.035)} />
          ))}
        </g>
        <circle cx={cx} cy={180} r={120} fill="url(#sfGlowM)" />

        <g filter="url(#sfSoft)">
          {/* the shaft — the Alexandrite shift, green above to red below */}
          <line x1={cx} y1={top} x2={cx} y2={bottom} stroke="url(#sfShift)" strokeWidth={3} strokeOpacity={0.85} strokeLinecap="round" />
          {/* the two wings at the head */}
          <path d={`M${cx} ${top + 6} q-30 -10 -46 6 q22 -2 44 8`} fill="none" stroke={MAGE} strokeWidth={1.6} strokeOpacity={0.7} />
          <path d={`M${cx} ${top + 6} q30 -10 46 6 q-22 -2 -44 8`} fill="none" stroke={SWORD} strokeWidth={1.6} strokeOpacity={0.7} />
          {/* the entwined serpents */}
          <path d={leftPath} fill="none" stroke={MAGE} strokeWidth={1.8} strokeOpacity={0.6} />
          <path d={rightPath} fill="none" stroke={SWORD} strokeWidth={1.8} strokeOpacity={0.6} />
          {/* the Alexandrite orb — pulses between the two aspects */}
          <circle cx={cx} cy={top} r={9} fill={MAGE} fillOpacity={0.5} stroke={MAGE} strokeWidth={1.6}>
            <animate attributeName="fill" values={`${MAGE};${SWORD};${MAGE}`} dur="5s" repeatCount="indefinite" />
            <animate attributeName="stroke" values={`${MAGE};${SWORD};${MAGE}`} dur="5s" repeatCount="indefinite" />
          </circle>
          {showLabels && (
            <>
              <text x={cx - 66} y={140} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={8} fill={MAGE} opacity={0.7}>🧙 mage</text>
              <text x={cx + 66} y={250} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={8} fill={SWORD} opacity={0.7}>⚔️ swordsman</text>
              <text x={cx} y={318} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={9} fill={MAGE} opacity={0.7}>
                one staff · two aspects · admit · read · attest · shift
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
