/**
 * WanderingOrbs - Soul orbs that float through the spellweb
 *
 * The Swordsman and Mage orbit each other while slowly drifting through
 * the graph. With a City Key equipped, the key's chosen stance — the Star's
 * geometry (ε, m, n, core, ⚔️:🧙 ratio) — shapes the orbit: the separation
 * breathes with ε·sin(mφ)·cos(nθ), the ellipse follows the core, the two orbs
 * sit at radii in the ⚔️:🧙 ratio, and n sets the pace. Colours come from the
 * key's palette. No label is drawn: the shape and the colours are the sign. When evoke starts, they animate back to the ceremony panel.
 * When tracing a blade's constellation, they follow the path and draw cut lines.
 */

import { useEffect, useRef } from 'react';
import { useEquippedStar, useStarGeometry } from '../lib/starLoadout';
import { useStarAppearance } from '../lib/starAppearance';

interface WanderingOrbsProps {
  width: number;
  height: number;
  isEvoking: boolean;
  waypointNodes: Array<{ x: number; y: number; id: string; emoji?: string }>;
  ceremonyPosition: { x: number; y: number }; // Center of ceremony panel
  onOrbsReturned?: () => void; // Called when orbs reach ceremony panel
  isTracing?: boolean; // Whether to trace the constellation path
  traceColor?: string; // Color for the cut lines
  onNodeReached?: (nodeId: string) => void; // Called when reaching a node
  // Orbiting emojis for each orb
  swordsmanOrbitEmojis?: string[]; // Emojis from equipped blade (up to 6)
  mageOrbitEmojis?: string[]; // Emojis from mage's learned spells (up to 6)
}

const SWORDSMAN_COLOR = '#e74c3c';
const MAGE_COLOR = '#9b59b6';

// Cut trail segment
interface CutSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
  color: string;
}

export function WanderingOrbs({
  width,
  height,
  isEvoking,
  waypointNodes,
  ceremonyPosition,
  isTracing = false,
  traceColor = '#ffd700',
  onNodeReached,
  swordsmanOrbitEmojis = [],
  mageOrbitEmojis = [],
}: WanderingOrbsProps) {
  const equipped = useEquippedStar();
  const equippedRef = useRef(equipped); equippedRef.current = equipped;
  const geometry = useStarGeometry();
  const geometryRef = useRef(geometry); geometryRef.current = geometry;
  const appearance = useStarAppearance();
  const paletteRef = useRef(appearance?.palette);
  paletteRef.current = appearance?.palette;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Shared center that drifts slowly through the graph
  const centerRef = useRef({
    x: width / 2,
    y: height / 2 - 100,
    targetX: width / 2,
    targetY: height / 2 - 100,
    vx: 0,
    vy: 0,
  });

  // Orbit angle for the paired orbs
  const orbitAngleRef = useRef(0);
  const returningRef = useRef(false);
  const lastTargetChangeRef = useRef(0);

  // Tracing state
  const traceIndexRef = useRef(0);
  const traceProgressRef = useRef(0);
  const cutSegmentsRef = useRef<CutSegment[]>([]);
  const lastReachedNodeRef = useRef<string | null>(null);
  const wasTracingRef = useRef(false); // Track if we were tracing in previous frame

  // Emoji orbiter angle (separate from main orbit)
  const emojiOrbitAngleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ORBIT_RADIUS = 35; // How far apart they orbit
    const ORBIT_SPEED = 0.0008; // Very slow orbit
    const DRIFT_SPEED = 0.002; // Very slow drift through graph
    const TRACE_SPEED = 0.008; // Speed for tracing constellation

    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, width, height);

      const center = centerRef.current;

      if (isEvoking) {
        // Animate toward ceremony panel
        returningRef.current = true;
        const returnSpeed = 0.06;

        center.x += (ceremonyPosition.x - center.x) * returnSpeed;
        center.y += (ceremonyPosition.y - center.y) * returnSpeed;

        // Check if close enough to hide
        const dist = Math.hypot(ceremonyPosition.x - center.x, ceremonyPosition.y - center.y);
        if (dist < 30) {
          cancelAnimationFrame(animationRef.current);
          return;
        }
      } else if (isTracing && waypointNodes.length >= 2) {
        // TRACE MODE: Follow constellation path and draw cuts
        returningRef.current = false;

        // Initialize tracing from current position when it starts
        if (!wasTracingRef.current) {
          wasTracingRef.current = true;
          traceIndexRef.current = -1; // Start at -1 to indicate "coming from current position"
          traceProgressRef.current = 0;
          cutSegmentsRef.current = [];
          lastReachedNodeRef.current = null;
          // Keep current position - orbs will smoothly travel to first node
          // (center.x and center.y already have the current orb position)
        }

        let currentIndex = traceIndexRef.current;
        let nextIndex: number;
        let currentNode: { x: number; y: number };
        let nextNode: { x: number; y: number };

        if (currentIndex === -1) {
          // Coming from ceremony to first node
          currentNode = { x: center.x, y: center.y };
          nextNode = waypointNodes[0];
          nextIndex = 0;
        } else {
          nextIndex = (currentIndex + 1) % waypointNodes.length;
          currentNode = waypointNodes[currentIndex];
          nextNode = waypointNodes[nextIndex];
        }

        // Guard against undefined nodes (can happen during resize/mobile)
        if (!currentNode?.x || !nextNode?.x) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        // Progress along current segment
        traceProgressRef.current += TRACE_SPEED;

        if (traceProgressRef.current >= 1) {
          // Reached the next node - snap to exact position
          center.x = nextNode.x;
          center.y = nextNode.y;

          // Add cut segment (only for actual constellation nodes)
          if (currentIndex >= 0) {
            const prevNode = waypointNodes[currentIndex];
            cutSegmentsRef.current.push({
              x1: prevNode.x,
              y1: prevNode.y,
              x2: nextNode.x,
              y2: nextNode.y,
              opacity: 1,
              color: traceColor,
            });
          }

          // Notify about reached node
          const reachedNode = waypointNodes[nextIndex];
          if (reachedNode && reachedNode.id !== lastReachedNodeRef.current) {
            lastReachedNodeRef.current = reachedNode.id;
            onNodeReached?.(reachedNode.id);
          }

          // Move to next segment
          traceIndexRef.current = nextIndex;
          traceProgressRef.current = 0;
        } else {
          // Interpolate position smoothly between nodes
          const t = traceProgressRef.current;
          center.x = currentNode.x + (nextNode.x - currentNode.x) * t;
          center.y = currentNode.y + (nextNode.y - currentNode.y) * t;
        }

        // Fade out old cut segments
        cutSegmentsRef.current = cutSegmentsRef.current
          .map(seg => ({ ...seg, opacity: seg.opacity - 0.003 }))
          .filter(seg => seg.opacity > 0);

        // Draw cut segments
        cutSegmentsRef.current.forEach(seg => {
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.strokeStyle = seg.color + Math.floor(seg.opacity * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Add glow effect
          ctx.shadowColor = seg.color;
          ctx.shadowBlur = 15 * seg.opacity;
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Draw constellation path preview (dim)
        ctx.beginPath();
        ctx.moveTo(waypointNodes[0].x, waypointNodes[0].y);
        waypointNodes.forEach((node, i) => {
          if (i > 0) ctx.lineTo(node.x, node.y);
        });
        ctx.lineTo(waypointNodes[0].x, waypointNodes[0].y);
        ctx.strokeStyle = traceColor + '30';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw nodes
        waypointNodes.forEach((node, i) => {
          const isNext = i === nextIndex;
          ctx.beginPath();
          ctx.arc(node.x, node.y, isNext ? 8 : 5, 0, Math.PI * 2);
          ctx.fillStyle = isNext ? traceColor : traceColor + '60';
          ctx.fill();
        });

      } else {
        // WANDER MODE: Normal drifting behavior
        returningRef.current = false;
        wasTracingRef.current = false; // Reset so next trace starts fresh

        // Reset trace state when not tracing
        traceIndexRef.current = 0;
        traceProgressRef.current = 0;
        cutSegmentsRef.current = [];
        lastReachedNodeRef.current = null;

        // Pick new drift target occasionally
        if (timestamp - lastTargetChangeRef.current > 8000) { // Change target every 8 seconds
          lastTargetChangeRef.current = timestamp;

          if (waypointNodes.length > 0 && Math.random() > 0.4) {
            // Drift toward a waypoint node
            const targetNode = waypointNodes[Math.floor(Math.random() * waypointNodes.length)];
            center.targetX = targetNode.x;
            center.targetY = targetNode.y;
          } else {
            // Random position in the graph area
            center.targetX = 150 + Math.random() * (width - 300);
            center.targetY = 150 + Math.random() * (height - 400);
          }
        }

        // Very slow drift toward target
        center.vx += (center.targetX - center.x) * DRIFT_SPEED;
        center.vy += (center.targetY - center.y) * DRIFT_SPEED;
        center.vx *= 0.99; // High friction for slow movement
        center.vy *= 0.99;
        center.x += center.vx;
        center.y += center.vy;

        // Keep center in bounds
        center.x = Math.max(100, Math.min(width - 100, center.x));
        center.y = Math.max(100, Math.min(height - 200, center.y));
      }

      // The equipped key's stance shapes the orbit; without one the orbit is the plain ellipse.
      const g = equippedRef.current ? geometryRef.current : null;

      // Update orbit angle (slow rotation; n sets the pace — n = 6 is the default pace)
      orbitAngleRef.current += ORBIT_SPEED * 16 * (g ? g.n / 6 : 1); // ~60fps assumed

      // Calculate orb positions orbiting the center
      const a = orbitAngleRef.current;
      const breathe = g ? 1 + g.eps * 0.6 * Math.sin(g.m * a) * Math.cos(g.n * emojiOrbitAngleRef.current * 0.25) : 1; // r = R + ε·sin(mφ)·cos(nθ), the manifold's own rule
      const squash = g ? 0.35 + g.core * 0.5 : 0.6; // the core sets how flat the ellipse is
      const ratio = g ? g.smRatio : 1;              // ⚔️:🧙 — the Swordsman sits farther out when the ratio is above 1
      const rSword = ORBIT_RADIUS * breathe * (2 * ratio / (1 + ratio));
      const rMage = ORBIT_RADIUS * breathe * (2 / (1 + ratio));
      const swordsmanX = center.x + Math.cos(a) * rSword;
      const swordsmanY = center.y + Math.sin(a) * rSword * squash;

      const mageX = center.x + Math.cos(a + Math.PI) * rMage;
      const mageY = center.y + Math.sin(a + Math.PI) * rMage * squash;

      // Draw subtle connection line between orbs
      ctx.beginPath();
      ctx.moveTo(swordsmanX, swordsmanY);
      ctx.lineTo(mageX, mageY);
      ctx.strokeStyle = isTracing ? traceColor + '30' : 'rgba(255, 215, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw soft glow at center
      const centerGlow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, ORBIT_RADIUS * 1.5);
      centerGlow.addColorStop(0, isTracing ? traceColor + '20' : 'rgba(255, 215, 0, 0.08)');
      centerGlow.addColorStop(1, isTracing ? traceColor + '00' : 'rgba(255, 215, 0, 0)');
      ctx.beginPath();
      ctx.arc(center.x, center.y, ORBIT_RADIUS * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      if (equippedRef.current) {
        // The paired star binds the two orbs visually; their ceremony path stays intact. Its size follows the
        // core, and it turns with the orbit: the stella octangula drawn in its own dimension, so it reads as
        // the eight-pointed star the Star renders — a flat pair of triangles is only its silhouette down a
        // body diagonal, and that silhouette is a hexagram, which is not the figure.
        const mark = 27 * (g ? g.core / 0.6 : 1);
        drawStellaOctangula(ctx, center.x, center.y, mark, a * 0.9, paletteRef.current?.sword ?? '#ff6b6b', paletteRef.current?.mage ?? '#a78bfa');
      }
      // Draw orbs
      drawOrb(ctx, swordsmanX, swordsmanY, '⚔️', paletteRef.current?.sword ?? SWORDSMAN_COLOR, paletteRef.current?.sword ?? '#ff6b6b', 14);
      drawOrb(ctx, mageX, mageY, '✦', paletteRef.current?.mage ?? MAGE_COLOR, paletteRef.current?.mage ?? '#a78bfa', 14);

      // Update emoji orbit angle (slightly faster than main orbit)
      emojiOrbitAngleRef.current += 0.0012 * 16;

      // Draw swordsman's orbiting emojis (from equipped blade)
      if (swordsmanOrbitEmojis.length > 0) {
        const EMOJI_ORBIT_RADIUS = 28;
        const emojiCount = swordsmanOrbitEmojis.length;
        swordsmanOrbitEmojis.forEach((emoji, i) => {
          const angle = emojiOrbitAngleRef.current + (i * (2 * Math.PI) / emojiCount);
          const r = EMOJI_ORBIT_RADIUS * (g ? 1 + g.eps * 0.5 * Math.sin(g.m * angle) : 1); // the blade's marks feel the stance too
          const ex = swordsmanX + Math.cos(angle) * r;
          const ey = swordsmanY + Math.sin(angle) * r * 0.7;
          drawOrbiterEmoji(ctx, ex, ey, emoji, paletteRef.current?.sword ?? SWORDSMAN_COLOR);
        });
      }

      // Draw mage's orbiting emojis (from learned spells)
      if (mageOrbitEmojis.length > 0) {
        const EMOJI_ORBIT_RADIUS = 28;
        const emojiCount = mageOrbitEmojis.length;
        mageOrbitEmojis.forEach((emoji, i) => {
          const angle = -emojiOrbitAngleRef.current + (i * (2 * Math.PI) / emojiCount); // Opposite direction
          const r = EMOJI_ORBIT_RADIUS * (g ? 1 + g.eps * 0.5 * Math.sin(g.m * angle) : 1); // the spells you have learned ride the same stance
          const ex = mageX + Math.cos(angle) * r;
          const ey = mageY + Math.sin(angle) * r * 0.7;
          drawOrbiterEmoji(ctx, ex, ey, emoji, paletteRef.current?.mage ?? MAGE_COLOR);
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, isEvoking, waypointNodes, ceremonyPosition, isTracing, traceColor, onNodeReached, swordsmanOrbitEmojis, mageOrbitEmojis]);
  void equipped; // read through equippedRef inside the frame loop

  // Don't render when orbs have returned to ceremony
  if (isEvoking && returningRef.current) {
    const center = centerRef.current;
    const dist = Math.hypot(ceremonyPosition.x - center.x, ceremonyPosition.y - center.y);
    if (dist < 40) {
      return null;
    }
  }

  return (
    <>
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        // absolute (not fixed) so the canvas anchors to its nearest positioned
        // ancestor — full viewport on desktop SpellWeb, the ceremony orbs box
        // on mobile. Without this the orbs trace at viewport (0,0), missing
        // the constellation entirely on mobile.
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
    </>
  );
}

// The stella octangula: two regular tetrahedra crossing — the Swordsman's in the sword colour, the Mage's in the
// mage colour — projected from three dimensions with fixed tilts that keep the view off the body diagonals
// (where the figure collapses to a hexagram) and off the axes (where it collapses to a square).
const TET_A: ReadonlyArray<readonly [number, number, number]> = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
const TET_B: ReadonlyArray<readonly [number, number, number]> = TET_A.map(([x, y, z]) => [-x, -y, -z] as const);
const TET_EDGES: ReadonlyArray<readonly [number, number]> = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
function drawStellaOctangula(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number,
  angle: number,
  swordColor: string,
  mageColor: string
) {
  const tilt = 0.62, roll = 0.31;
  const cA = Math.cos(angle), sA = Math.sin(angle), cT = Math.cos(tilt), sT = Math.sin(tilt), cR = Math.cos(roll), sR = Math.sin(roll);
  const s = size / Math.sqrt(3); // vertices sit at radius √3, so the figure fits the mark radius
  const project = ([x, y, z]: readonly [number, number, number]) => {
    const X1 = x * cA + z * sA, Z1 = -x * sA + z * cA;          // turn about the vertical axis with the orbit
    const Y2 = y * cT - Z1 * sT, Z2 = y * sT + Z1 * cT;         // tilt toward the viewer
    const X3 = X1 * cR - Y2 * sR, Y3 = X1 * sR + Y2 * cR;       // a small roll
    return { x: cx + X3 * s, y: cy + Y3 * s * 0.92, d: (Z2 + Math.sqrt(3)) / (2 * Math.sqrt(3)) }; // d: 0 far … 1 near
  };
  const hex = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  const draw = (tet: ReadonlyArray<readonly [number, number, number]>, color: string) => {
    const P = tet.map(project);
    for (const [i, j] of TET_EDGES) {
      const p = P[i], q = P[j], d = (p.d + q.d) / 2;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
      ctx.strokeStyle = color + hex(70 + 150 * d); // nearer edges brighter and heavier
      ctx.lineWidth = 0.7 + 0.9 * d;
      ctx.stroke();
    }
  };
  draw(TET_A, swordColor);
  draw(TET_B, mageColor);
}

function drawOrbiterEmoji(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  emoji: string,
  orbColor: string
) {
  // Subtle glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
  gradient.addColorStop(0, orbColor + '40');
  gradient.addColorStop(1, orbColor + '00');
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Small background circle
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a1580';
  ctx.fill();
  ctx.strokeStyle = orbColor + '60';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Emoji
  ctx.fillStyle = '#fff';
  ctx.font = '10px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
}

function drawOrb(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  symbol: string,
  color: string,
  glowColor: string,
  radius: number
) {
  // Outer glow
  const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 2.5);
  gradient.addColorStop(0, glowColor + '50');
  gradient.addColorStop(0.5, glowColor + '20');
  gradient.addColorStop(1, glowColor + '00');
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Core
  const coreGradient = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.25, 0, x, y, radius);
  coreGradient.addColorStop(0, '#ffffff');
  coreGradient.addColorStop(0.4, color);
  coreGradient.addColorStop(1, color + '80');
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = coreGradient;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Symbol
  ctx.fillStyle = '#fff';
  ctx.font = `${radius * 0.8}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, x, y);
}

export default WanderingOrbs;
