/**
 * WanderingOrbs - Soul orbs that float through the spellweb
 *
 * The Swordsman and Mage orbit each other while slowly drifting through
 * the graph. When evoke starts, they animate back to the ceremony panel.
 * When tracing a blade's constellation, they follow the path and draw cut lines.
 */

import { useEffect, useRef } from 'react';

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

      // Update orbit angle (slow rotation)
      orbitAngleRef.current += ORBIT_SPEED * 16; // ~60fps assumed

      // Calculate orb positions orbiting the center
      const swordsmanX = center.x + Math.cos(orbitAngleRef.current) * ORBIT_RADIUS;
      const swordsmanY = center.y + Math.sin(orbitAngleRef.current) * ORBIT_RADIUS * 0.6; // Slight ellipse

      const mageX = center.x + Math.cos(orbitAngleRef.current + Math.PI) * ORBIT_RADIUS;
      const mageY = center.y + Math.sin(orbitAngleRef.current + Math.PI) * ORBIT_RADIUS * 0.6;

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

      // Draw orbs
      drawOrb(ctx, swordsmanX, swordsmanY, '⚔️', SWORDSMAN_COLOR, '#ff6b6b', 14);
      drawOrb(ctx, mageX, mageY, '✦', MAGE_COLOR, '#a78bfa', 14);

      // Update emoji orbit angle (slightly faster than main orbit)
      emojiOrbitAngleRef.current += 0.0012 * 16;

      // Draw swordsman's orbiting emojis (from equipped blade)
      if (swordsmanOrbitEmojis.length > 0) {
        const EMOJI_ORBIT_RADIUS = 28;
        const emojiCount = swordsmanOrbitEmojis.length;
        swordsmanOrbitEmojis.forEach((emoji, i) => {
          const angle = emojiOrbitAngleRef.current + (i * (2 * Math.PI) / emojiCount);
          const ex = swordsmanX + Math.cos(angle) * EMOJI_ORBIT_RADIUS;
          const ey = swordsmanY + Math.sin(angle) * EMOJI_ORBIT_RADIUS * 0.7;
          drawOrbiterEmoji(ctx, ex, ey, emoji, SWORDSMAN_COLOR);
        });
      }

      // Draw mage's orbiting emojis (from learned spells)
      if (mageOrbitEmojis.length > 0) {
        const EMOJI_ORBIT_RADIUS = 28;
        const emojiCount = mageOrbitEmojis.length;
        mageOrbitEmojis.forEach((emoji, i) => {
          const angle = -emojiOrbitAngleRef.current + (i * (2 * Math.PI) / emojiCount); // Opposite direction
          const ex = mageX + Math.cos(angle) * EMOJI_ORBIT_RADIUS;
          const ey = mageY + Math.sin(angle) * EMOJI_ORBIT_RADIUS * 0.7;
          drawOrbiterEmoji(ctx, ex, ey, emoji, MAGE_COLOR);
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, isEvoking, waypointNodes, ceremonyPosition, isTracing, traceColor, onNodeReached, swordsmanOrbitEmojis, mageOrbitEmojis]);

  // Don't render when orbs have returned to ceremony
  if (isEvoking && returningRef.current) {
    const center = centerRef.current;
    const dist = Math.hypot(ceremonyPosition.x - center.x, ceremonyPosition.y - center.y);
    if (dist < 40) {
      return null;
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
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
