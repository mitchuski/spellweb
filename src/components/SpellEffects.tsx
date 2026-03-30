/**
 * SpellEffects - Animated orbs traveling the constellation circuit
 *
 * Features:
 * - Dual orbiting agents: Swordsman (⚔) and Mage (✦)
 * - Orbs travel along the constellation path when casting
 * - Each node's spell is cast as orbs pass by
 * - Spell particles with emojis from each node's emojiSpell
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Orb {
  id: 'swordsman' | 'mage';
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  symbol: string;
  // Circuit tracking
  targetIndex: number;
  progress: number; // 0-1 progress to current target
}

interface SpellParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  opacity: number;
  scale: number;
  rotation: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
}

interface CircuitNode {
  id: string;
  x: number;
  y: number;
  emoji?: string;
  emojiSpell?: string;
  label: string;
}

interface SpellEffectsProps {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  isActive: boolean;
  isCasting: boolean;
  circuitNodes: CircuitNode[]; // Constellation nodes with positions
  onSpellCast?: (node: CircuitNode) => void;
  onOrbPositionUpdate?: (swordsman: { x: number; y: number }, mage: { x: number; y: number }) => void;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SWORDSMAN_COLOR = '#e74c3c';
const MAGE_COLOR = '#9b59b6';
const CONVERGENCE_POINT_COLOR = '#ffd700';

const DEFAULT_EMOJIS = ['✦', '⚡', '🌟', '💫', '🔮', '⚔️', '🛡️', '🔥', '🌙', '💎'];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function parseSpellEmojis(node: CircuitNode): string[] {
  const spellString = node.emojiSpell || node.emoji || '';
  if (!spellString) return DEFAULT_EMOJIS;

  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
  const matches = spellString.match(emojiRegex);
  return matches && matches.length > 0 ? matches : DEFAULT_EMOJIS;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function SpellEffects({
  width,
  height,
  centerX,
  centerY,
  isActive,
  isCasting,
  circuitNodes,
  onSpellCast,
  onOrbPositionUpdate,
}: SpellEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const lastCastIndexRef = useRef<number>(-1);

  // Particles
  const [particles, setParticles] = useState<SpellParticle[]>([]);

  // Orbs - swordsman goes clockwise, mage goes counter-clockwise
  const [swordsman, setSwordsman] = useState<Orb>({
    id: 'swordsman',
    x: centerX,
    y: centerY,
    radius: 22,
    color: SWORDSMAN_COLOR,
    glowColor: '#ff6b6b',
    symbol: '⚔️',
    targetIndex: 0,
    progress: 0,
  });

  const [mage, setMage] = useState<Orb>({
    id: 'mage',
    x: centerX,
    y: centerY,
    radius: 22,
    color: MAGE_COLOR,
    glowColor: '#a78bfa',
    symbol: '✦',
    targetIndex: 0,
    progress: 0,
  });

  // Emit particles at a position with specific emojis
  const emitParticles = useCallback((x: number, y: number, emojis: string[], count: number, color: string) => {
    const newParticles: SpellParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      newParticles.push({
        id: `p-${Date.now()}-${i}-${Math.random()}`,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        emoji,
        opacity: 1,
        scale: 0.7 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        lifetime: 0,
        maxLifetime: 2000 + Math.random() * 1000,
        color,
      });
    }

    setParticles(prev => [...prev.slice(-60), ...newParticles]);
  }, []);

  // Cast spell at a circuit node
  const castSpellAtNode = useCallback((node: CircuitNode) => {
    const emojis = parseSpellEmojis(node);
    emitParticles(node.x, node.y, emojis, 12, CONVERGENCE_POINT_COLOR);
    onSpellCast?.(node);
  }, [emitParticles, onSpellCast]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hasCircuit = circuitNodes.length >= 2;
    const speed = 0.0008; // Circuit traversal speed

    const animate = (timestamp: number) => {
      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;

      ctx.clearRect(0, 0, width, height);

      // Update orbs
      if (isCasting && hasCircuit) {
        // === CIRCUIT MODE: Travel along constellation path ===

        setSwordsman(prev => {
          let newProgress = prev.progress + deltaTime * speed;
          let newTargetIndex = prev.targetIndex;

          // Reached current target?
          if (newProgress >= 1) {
            // Cast spell at this node
            const currentNode = circuitNodes[newTargetIndex];
            if (currentNode && newTargetIndex !== lastCastIndexRef.current) {
              castSpellAtNode(currentNode);
              lastCastIndexRef.current = newTargetIndex;
            }

            // Move to next node (loop around)
            newTargetIndex = (newTargetIndex + 1) % circuitNodes.length;
            newProgress = 0;
          }

          // Calculate position along path
          const fromIndex = (newTargetIndex - 1 + circuitNodes.length) % circuitNodes.length;
          const fromNode = circuitNodes[fromIndex];
          const toNode = circuitNodes[newTargetIndex];

          const easedProgress = easeInOutCubic(newProgress);
          const x = lerp(fromNode?.x ?? centerX, toNode?.x ?? centerX, easedProgress);
          const y = lerp(fromNode?.y ?? centerY, toNode?.y ?? centerY, easedProgress);

          return { ...prev, x, y, progress: newProgress, targetIndex: newTargetIndex };
        });

        // Mage follows same path but offset by half the circuit
        setMage(prev => {
          const offset = Math.floor(circuitNodes.length / 2);
          let newProgress = prev.progress + deltaTime * speed;
          let newTargetIndex = prev.targetIndex;

          if (newProgress >= 1) {
            newTargetIndex = (newTargetIndex + 1) % circuitNodes.length;
            newProgress = 0;
          }

          const fromIndex = (newTargetIndex - 1 + circuitNodes.length) % circuitNodes.length;
          const fromNode = circuitNodes[(fromIndex + offset) % circuitNodes.length];
          const toNode = circuitNodes[(newTargetIndex + offset) % circuitNodes.length];

          const easedProgress = easeInOutCubic(newProgress);
          const x = lerp(fromNode?.x ?? centerX, toNode?.x ?? centerX, easedProgress);
          const y = lerp(fromNode?.y ?? centerY, toNode?.y ?? centerY, easedProgress);

          return { ...prev, x, y, progress: newProgress, targetIndex: newTargetIndex };
        });

      } else {
        // === ORBIT MODE: Circle around center ===
        const time = timestamp * 0.001;
        const orbitRadius = 120;

        setSwordsman(prev => ({
          ...prev,
          x: centerX + Math.cos(time * 0.5) * orbitRadius,
          y: centerY + Math.sin(time * 0.5) * orbitRadius * 0.6,
        }));

        setMage(prev => ({
          ...prev,
          x: centerX + Math.cos(time * 0.5 + Math.PI) * orbitRadius,
          y: centerY + Math.sin(time * 0.5 + Math.PI) * orbitRadius * 0.6,
        }));

        lastCastIndexRef.current = -1; // Reset cast tracking
      }

      // Update particles
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.03,
            vx: p.vx * 0.98,
            opacity: Math.max(0, 1 - p.lifetime / p.maxLifetime),
            rotation: p.rotation + 0.03,
            lifetime: p.lifetime + deltaTime,
          }))
          .filter(p => p.lifetime < p.maxLifetime)
      );

      // Emit trail particles from orbs - only when evoke is active
      if (isCasting && Math.random() > 0.9) {
        emitParticles(swordsman.x, swordsman.y, ['⚔️', '🔥', '⚡'], 1, SWORDSMAN_COLOR);
        emitParticles(mage.x, mage.y, ['✦', '🔮', '💫'], 1, MAGE_COLOR);
      }

      // Notify parent
      onOrbPositionUpdate?.({ x: swordsman.x, y: swordsman.y }, { x: mage.x, y: mage.y });

      // Draw circuit path
      if (isCasting && hasCircuit) {
        drawCircuitPath(ctx, circuitNodes);
      }

      // Draw particles
      particles.forEach(p => drawParticle(ctx, p));

      // Draw orbs
      drawOrb(ctx, swordsman);
      drawOrb(ctx, mage);

      // Draw circuit nodes markers
      if (isCasting && hasCircuit) {
        circuitNodes.forEach((node, i) => {
          drawCircuitNode(ctx, node, i);
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isCasting, circuitNodes, centerX, centerY, width, height,
      swordsman, mage, particles, emitParticles, castSpellAtNode, onOrbPositionUpdate]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// DRAWING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function drawOrb(ctx: CanvasRenderingContext2D, orb: Orb) {
  ctx.save();

  // Outer glow
  const gradient = ctx.createRadialGradient(
    orb.x, orb.y, orb.radius * 0.5,
    orb.x, orb.y, orb.radius * 2
  );
  gradient.addColorStop(0, orb.glowColor + '60');
  gradient.addColorStop(0.5, orb.glowColor + '30');
  gradient.addColorStop(1, orb.glowColor + '00');

  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius * 2, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Core
  const coreGradient = ctx.createRadialGradient(
    orb.x - orb.radius * 0.3, orb.y - orb.radius * 0.3, 0,
    orb.x, orb.y, orb.radius
  );
  coreGradient.addColorStop(0, '#ffffff');
  coreGradient.addColorStop(0.4, orb.color);
  coreGradient.addColorStop(1, orb.color + '80');

  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
  ctx.fillStyle = coreGradient;
  ctx.fill();
  ctx.strokeStyle = orb.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Symbol
  ctx.fillStyle = '#ffffff';
  ctx.font = `${orb.radius * 0.9}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(orb.symbol, orb.x, orb.y);

  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: SpellParticle) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.scale(p.scale, p.scale);

  ctx.shadowColor = p.color;
  ctx.shadowBlur = 8;

  ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.emoji, 0, 0);

  ctx.restore();
}

function drawCircuitPath(ctx: CanvasRenderingContext2D, nodes: CircuitNode[]) {
  if (nodes.length < 2) return;

  ctx.save();
  ctx.strokeStyle = CONVERGENCE_POINT_COLOR + '40';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);

  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);

  for (let i = 1; i < nodes.length; i++) {
    ctx.lineTo(nodes[i].x, nodes[i].y);
  }
  ctx.lineTo(nodes[0].x, nodes[0].y); // Close the circuit
  ctx.stroke();

  ctx.restore();
}

function drawCircuitNode(ctx: CanvasRenderingContext2D, node: CircuitNode, index: number) {
  ctx.save();

  // Glowing ring around circuit nodes
  const pulseScale = 1 + Math.sin(Date.now() * 0.003 + index) * 0.15;

  ctx.beginPath();
  ctx.arc(node.x, node.y, 28 * pulseScale, 0, Math.PI * 2);
  ctx.strokeStyle = CONVERGENCE_POINT_COLOR + '60';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Node emoji
  if (node.emoji) {
    ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = CONVERGENCE_POINT_COLOR;
    ctx.fillText(node.emoji, node.x, node.y - 35);
  }

  ctx.restore();
}

export default SpellEffects;
