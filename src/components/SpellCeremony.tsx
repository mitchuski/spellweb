/**
 * SpellCeremony - Floating ceremony panel
 *
 * - Small waiting state: Orbs orbit while waiting
 * - Expanded evoke state: Shows actual constellation shape, orbs travel the pattern
 */

import { useState, useEffect, useRef, useMemo } from 'react';

interface CircuitNode {
  id: string;
  x: number;  // Original graph x position
  y: number;  // Original graph y position
  emoji?: string;
  emojiSpell?: string;
  label: string;
  proverb?: string;
}

// 6-dimensional blade configuration from ZK Swordsman Blade Forge
export interface BladeDimensions {
  protection: boolean;   // d1: Boundaries forged
  delegation: boolean;   // d2: Agency transferred
  memory: boolean;       // d3: State accumulated
  connection: boolean;   // d4: Multi-party coordination
  computation: boolean;  // d5: ZK proof active
  value: boolean;        // d6: Economic flow
}

export type BladeTier = 'light' | 'heavy' | 'dragon';

// Proof of presence - generated when evoke completes
export interface SpellProof {
  lapCount: number;
  duration: number; // ms
  startedAt: number; // timestamp
  completedAt: number; // timestamp
  constellationHash: string; // hash of node IDs
  nodeCount: number;
  chargeLevel: 'spark' | 'ember' | 'flame' | 'blaze' | 'inferno';
  signature: string; // unique proof token
  spellsCast: number; // number of spell clicks during evoke (randomness attribute)
  // Blade Forge attributes
  bladeDimensions: BladeDimensions;
  bladeStratum: number;  // Hamming weight (0-6)
  bladeTier: BladeTier;
  bladeHex: string;      // 6-bit hex representation
}

interface SpellCeremonyProps {
  isActive: boolean;
  isCasting: boolean;
  circuitNodes: CircuitNode[];
  onProofGenerated?: (proof: SpellProof) => void;
  onToggleEvoke?: () => void;
  // Action bar props
  onClearConstellation?: () => void;
  onShine?: () => void;
  onSavePath?: () => void;
  onConnect?: () => void;
  onStartWaypoint?: () => void;
  onClosePortal?: () => void;
  canStartWaypoint?: boolean;
  canClosePortal?: boolean;
  canConnect?: boolean;
  canSave?: boolean;
  waypointActive?: boolean;
  // Orb control
  orbsAtHome?: boolean;
  onToggleOrbsHome?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SWORDSMAN_COLOR = '#e74c3c';
const MAGE_COLOR = '#9b59b6';
const GOLD = '#ffd700';

const WAITING_WIDTH = 400;
const WAITING_HEIGHT = 180;
const EVOKE_WIDTH = 800;
const EVOKE_HEIGHT = 500;

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Simple hash function for constellation
function hashConstellation(nodes: CircuitNode[]): string {
  const str = nodes.map(n => n.id).join(':');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Determine charge level based on laps
function getChargeLevel(laps: number): SpellProof['chargeLevel'] {
  if (laps >= 10) return 'inferno';
  if (laps >= 7) return 'blaze';
  if (laps >= 4) return 'flame';
  if (laps >= 2) return 'ember';
  return 'spark';
}

// Generate unique proof signature
function generateSignature(nodes: CircuitNode[], laps: number, timestamp: number): string {
  const data = `${hashConstellation(nodes)}-${laps}-${timestamp}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return `SPELL-${Math.abs(hash).toString(36).toUpperCase()}-${laps.toString(36).toUpperCase()}`;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═══════════════════════════════════════════════════════════════
// BLADE FORGE CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate blade dimensions based on proof attributes
 * Each dimension activates based on ceremony performance
 */
function calculateBladeDimensions(
  nodeCount: number,
  lapCount: number,
  duration: number,
  chargeLevel: SpellProof['chargeLevel']
): BladeDimensions {
  return {
    // d1: Protection - boundaries forged (has path)
    protection: nodeCount >= 1,
    // d2: Delegation - agency transferred (shared across laps)
    delegation: lapCount >= 2,
    // d3: Memory - state accumulated (duration threshold)
    memory: duration >= 30000, // 30+ seconds
    // d4: Connection - multi-party coordination (3+ nodes)
    connection: nodeCount >= 3,
    // d5: Computation - ZK proof active (always true when proof generated)
    computation: true,
    // d6: Value - economic flow (high charge level)
    value: chargeLevel === 'flame' || chargeLevel === 'blaze' || chargeLevel === 'inferno',
  };
}

/**
 * Calculate stratum (Hamming weight) from blade dimensions
 */
function calculateBladeStratum(dims: BladeDimensions): number {
  return [
    dims.protection,
    dims.delegation,
    dims.memory,
    dims.connection,
    dims.computation,
    dims.value,
  ].filter(Boolean).length;
}

/**
 * Determine blade tier from stratum
 * - Light: 1-2 edges (simple proofs)
 * - Heavy: 3-4 edges (substantial proofs)
 * - Dragon: 5-6 edges (full sovereignty)
 */
function calculateBladeTier(stratum: number): BladeTier {
  if (stratum >= 5) return 'dragon';
  if (stratum >= 3) return 'heavy';
  return 'light';
}

/**
 * Convert blade dimensions to 6-bit hex representation
 */
function bladeToHex(dims: BladeDimensions): string {
  const bits = [
    dims.protection,
    dims.delegation,
    dims.memory,
    dims.connection,
    dims.computation,
    dims.value,
  ];
  const value = bits.reduce((acc, bit, i) => acc | (bit ? (1 << (5 - i)) : 0), 0);
  return value.toString(16).toUpperCase().padStart(2, '0');
}

// Map constellation positions to panel, preserving shape
function mapConstellationToPanel(
  nodes: CircuitNode[],
  panelWidth: number,
  panelHeight: number,
  padding: number = 50
): Array<{ x: number; y: number; node: CircuitNode }> {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    return [{ x: panelWidth / 2, y: panelHeight / 2, node: nodes[0] }];
  }

  // Find bounding box of original positions
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const origWidth = maxX - minX || 1;
  const origHeight = maxY - minY || 1;

  // Calculate scale to fit in panel while preserving aspect ratio
  const availableWidth = panelWidth - padding * 2;
  const availableHeight = panelHeight - padding * 2;
  const scale = Math.min(availableWidth / origWidth, availableHeight / origHeight);

  // Center offset
  const scaledWidth = origWidth * scale;
  const scaledHeight = origHeight * scale;
  const offsetX = padding + (availableWidth - scaledWidth) / 2;
  const offsetY = padding + (availableHeight - scaledHeight) / 2;

  return nodes.map(node => ({
    x: offsetX + (node.x - minX) * scale,
    y: offsetY + (node.y - minY) * scale,
    node,
  }));
}

// ═══════════════════════════════════════════════════════════════
// ANIMATED EMOJI SPELL COMPONENT
// ═══════════════════════════════════════════════════════════════

function AnimatedEmojiSpell({ spell }: { spell: string }) {
  // Parse spell into tokens (emojis and arrows/symbols)
  const tokens: Array<{ type: 'emoji' | 'symbol'; value: string }> = [];

  // Match emojis and other characters
  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
  let lastIndex = 0;
  let match;

  while ((match = emojiRegex.exec(spell)) !== null) {
    // Add any symbols before this emoji
    if (match.index > lastIndex) {
      const symbols = spell.slice(lastIndex, match.index).trim();
      if (symbols) {
        tokens.push({ type: 'symbol', value: symbols });
      }
    }
    tokens.push({ type: 'emoji', value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  // Add any remaining symbols
  if (lastIndex < spell.length) {
    const symbols = spell.slice(lastIndex).trim();
    if (symbols) {
      tokens.push({ type: 'symbol', value: symbols });
    }
  }

  const emojiCount = tokens.filter(t => t.type === 'emoji').length;
  let emojiIndex = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
      {tokens.map((token, i) => {
        if (token.type === 'symbol') {
          return (
            <span key={i} style={{ color: '#666', fontSize: 14, margin: '0 2px' }}>
              {token.value}
            </span>
          );
        }

        const currentEmojiIndex = emojiIndex++;
        const delay = (currentEmojiIndex / emojiCount) * 2; // Stagger over 2 seconds

        return (
          <span
            key={i}
            style={{
              fontSize: 22,
              display: 'inline-block',
              animation: `emojiGlow 2s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            {token.value}
          </span>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function SpellCeremony({
  isActive,
  isCasting,
  circuitNodes,
  onProofGenerated,
  onToggleEvoke,
  onClearConstellation,
  onShine,
  onSavePath,
  onConnect,
  onStartWaypoint,
  onClosePortal,
  canStartWaypoint,
  canClosePortal,
  canConnect,
  canSave,
  waypointActive,
  orbsAtHome,
  onToggleOrbsHome,
}: SpellCeremonyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Responsive dimensions
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < MOBILE_BREAKPOINT;

  // Panel dimensions - responsive on mobile
  const panelWidth = isCasting
    ? Math.min(windowSize.width - 32, EVOKE_WIDTH)
    : Math.min(windowSize.width - 32, WAITING_WIDTH);
  const panelHeight = isCasting
    ? (isMobile ? Math.min(windowSize.height - 250, 400) : EVOKE_HEIGHT)
    : WAITING_HEIGHT;

  // Orb state
  const swordsmanRef = useRef({ x: panelWidth / 2 - 40, y: panelHeight / 2, targetIndex: 0, progress: 0 });
  const mageRef = useRef({ x: panelWidth / 2 + 40, y: panelHeight / 2, targetIndex: 0, progress: 0 });
  const lastSwordsmanCastRef = useRef(-1);
  const lastMageCastRef = useRef(-1);

  // Proof of presence tracking
  const [lapCount, setLapCount] = useState(0);
  const ceremonyStartRef = useRef<number>(0);
  const swordsmanStartNodeRef = useRef(0); // Track where swordsman started to count laps
  const lastLapNodeRef = useRef(-1); // Last node that triggered a lap count

  // Particles
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    emoji: string; opacity: number; scale: number; rotation: number;
    lifetime: number; maxLifetime: number; color: string;
  }>>([]);

  // Current spell display - tracks which orb triggered it
  const [currentSpell, setCurrentSpell] = useState<{ node: CircuitNode; triggeredBy: 'swordsman' | 'mage' } | null>(null);

  // Emoji queue for click-to-cast during evoke
  const emojiQueueRef = useRef<string[]>([]);
  const emojiQueueIndexRef = useRef(0);
  const lastEmitOrbRef = useRef<'swordsman' | 'mage'>('mage'); // Alternate between orbs
  const spellsCastRef = useRef(0); // Count spell clicks for randomness

  // Map constellation to panel coordinates (responsive)
  const mappedNodes = useMemo(() => {
    if (!isCasting) return [];
    const padding = isMobile ? 40 : 60;
    return mapConstellationToPanel(circuitNodes, panelWidth, panelHeight, padding);
  }, [circuitNodes, isCasting, panelWidth, panelHeight, isMobile]);

  // Track previous casting state and session initialization
  const wasCastingRef = useRef(false);
  const sessionInitializedRef = useRef(false);

  // Reset orb positions when switching modes - only on actual mode change
  useEffect(() => {
    // Only initialize when STARTING to cast (transition from false to true)
    if (isCasting && !wasCastingRef.current && mappedNodes.length > 0) {
      // Starting evoke - initialize ceremony
      swordsmanRef.current = { x: mappedNodes[0].x, y: mappedNodes[0].y, targetIndex: 1, progress: 0 };
      const mageStart = Math.floor(mappedNodes.length / 2);
      mageRef.current = { x: mappedNodes[mageStart]?.x || mappedNodes[0].x, y: mappedNodes[mageStart]?.y || mappedNodes[0].y, targetIndex: (mageStart + 1) % mappedNodes.length, progress: 0 };
      lastSwordsmanCastRef.current = -1;
      lastMageCastRef.current = mageStart;

      // Initialize proof tracking
      ceremonyStartRef.current = Date.now();
      swordsmanStartNodeRef.current = 0;
      lastLapNodeRef.current = -1;
      setLapCount(0);
      sessionInitializedRef.current = true;
      setCurrentSpell(null);
      particlesRef.current = [];

      // Build emoji queue from all nodes' emojiSpell fields
      const allEmojis: string[] = [];
      const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;
      circuitNodes.forEach(node => {
        const spellString = node.emojiSpell || node.emoji || '';
        const matches = spellString.match(emojiRegex);
        if (matches) {
          allEmojis.push(...matches);
        }
      });
      emojiQueueRef.current = allEmojis.length > 0 ? allEmojis : ['✦', '⚔️', '🔮', '💫'];
      emojiQueueIndexRef.current = 0;
      lastEmitOrbRef.current = 'mage';
      spellsCastRef.current = 0; // Reset spell click counter
    } else if (!isCasting && wasCastingRef.current) {
      // Stopping evoke - reset to waiting mode
      const waitW = Math.min(windowSize.width - 32, WAITING_WIDTH);
      swordsmanRef.current = { x: waitW / 2 - 40, y: WAITING_HEIGHT / 2, targetIndex: 0, progress: 0 };
      mageRef.current = { x: waitW / 2 + 40, y: WAITING_HEIGHT / 2, targetIndex: 0, progress: 0 };
      sessionInitializedRef.current = false;
      setCurrentSpell(null);
      particlesRef.current = [];
    }
    wasCastingRef.current = isCasting;
  }, [isCasting, mappedNodes]);

  // Track previous casting state for proof generation
  const prevCastingRef = useRef(false);

  // Generate proof when evoke ends
  useEffect(() => {
    // Check if we just stopped casting (was true, now false)
    if (prevCastingRef.current && !isCasting && lapCount > 0 && circuitNodes.length > 0) {
      const completedAt = Date.now();
      const duration = completedAt - ceremonyStartRef.current;
      const chargeLevel = getChargeLevel(lapCount);

      // Calculate blade forge attributes
      const bladeDimensions = calculateBladeDimensions(
        circuitNodes.length,
        lapCount,
        duration,
        chargeLevel
      );
      const bladeStratum = calculateBladeStratum(bladeDimensions);
      const bladeTier = calculateBladeTier(bladeStratum);
      const bladeHex = bladeToHex(bladeDimensions);

      const proof: SpellProof = {
        lapCount,
        duration,
        startedAt: ceremonyStartRef.current,
        completedAt,
        constellationHash: hashConstellation(circuitNodes),
        nodeCount: circuitNodes.length,
        chargeLevel,
        signature: generateSignature(circuitNodes, lapCount, ceremonyStartRef.current),
        spellsCast: spellsCastRef.current,
        // Blade Forge attributes
        bladeDimensions,
        bladeStratum,
        bladeTier,
        bladeHex,
      };
      onProofGenerated?.(proof);
    }
    prevCastingRef.current = isCasting;
  }, [isCasting, lapCount, circuitNodes, onProofGenerated]);

  // Click handler - emit next emoji from orbs during evoke
  const handleCeremonyClick = () => {
    if (!isCasting || emojiQueueRef.current.length === 0) return;

    // Track spell clicks for randomness attribute
    spellsCastRef.current++;

    // Get next emoji (loop around)
    const emoji = emojiQueueRef.current[emojiQueueIndexRef.current % emojiQueueRef.current.length];
    emojiQueueIndexRef.current++;

    // Alternate between orbs
    const emitOrb = lastEmitOrbRef.current === 'swordsman' ? 'mage' : 'swordsman';
    lastEmitOrbRef.current = emitOrb;

    const orbPos = emitOrb === 'swordsman' ? swordsmanRef.current : mageRef.current;
    const color = emitOrb === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR;

    // Emit burst of particles with the emoji
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.3;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x: orbPos.x + (Math.random() - 0.5) * 15,
        y: orbPos.y + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        emoji,
        opacity: 1,
        scale: 0.8 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2,
        lifetime: 0,
        maxLifetime: 1500 + Math.random() * 800,
        color,
      });
    }
  };

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = panelWidth;
    canvas.height = panelHeight;

    const speed = 0.0006;

    const animate = (timestamp: number) => {
      const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;

      ctx.clearRect(0, 0, panelWidth, panelHeight);

      // Draw background
      const bgGradient = ctx.createRadialGradient(
        panelWidth / 2, panelHeight / 2, 0,
        panelWidth / 2, panelHeight / 2, Math.max(panelWidth, panelHeight)
      );
      bgGradient.addColorStop(0, 'rgba(15, 15, 30, 0.98)');
      bgGradient.addColorStop(1, 'rgba(5, 5, 15, 0.99)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, panelWidth, panelHeight);

      if (isCasting && mappedNodes.length >= 2) {
        // === EVOKE MODE: Show constellation shape ===

        // Draw constellation edges (connect nodes in order + close loop)
        ctx.strokeStyle = GOLD + '35';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(mappedNodes[0].x, mappedNodes[0].y);
        for (let i = 1; i < mappedNodes.length; i++) {
          ctx.lineTo(mappedNodes[i].x, mappedNodes[i].y);
        }
        ctx.lineTo(mappedNodes[0].x, mappedNodes[0].y); // Close loop
        ctx.stroke();

        // Draw constellation nodes
        mappedNodes.forEach((mn, i) => {
          const pulse = 1 + Math.sin(timestamp * 0.003 + i * 0.5) * 0.15;

          // Outer glow ring
          ctx.beginPath();
          ctx.arc(mn.x, mn.y, 30 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = GOLD + '30';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Inner ring
          ctx.beginPath();
          ctx.arc(mn.x, mn.y, 18 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = GOLD + '50';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Core dot
          ctx.beginPath();
          ctx.arc(mn.x, mn.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = GOLD;
          ctx.fill();

          // Node emoji above
          if (mn.node.emoji) {
            ctx.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = GOLD;
            ctx.fillText(mn.node.emoji, mn.x, mn.y - 38);
          }

          // Node label below
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#888';
          ctx.fillText(mn.node.label.slice(0, 20), mn.x, mn.y + 42);
        });

        // Update swordsman - follows constellation path
        const swordsman = swordsmanRef.current;
        swordsman.progress += deltaTime * speed;

        if (swordsman.progress >= 1) {
          // Arrived at target - update spell display
          const targetNode = mappedNodes[swordsman.targetIndex];
          if (targetNode && swordsman.targetIndex !== lastSwordsmanCastRef.current) {
            setCurrentSpell({ node: targetNode.node, triggeredBy: 'swordsman' });
            lastSwordsmanCastRef.current = swordsman.targetIndex;

            // Check for lap completion - when swordsman returns to start node
            if (swordsman.targetIndex === 0 && lastLapNodeRef.current !== 0) {
              setLapCount(prev => prev + 1);
              lastLapNodeRef.current = 0;
            } else if (swordsman.targetIndex !== 0) {
              lastLapNodeRef.current = swordsman.targetIndex;
            }
          }

          // Move to next node
          swordsman.targetIndex = (swordsman.targetIndex + 1) % mappedNodes.length;
          swordsman.progress = 0;
        }

        const fromIdx = (swordsman.targetIndex - 1 + mappedNodes.length) % mappedNodes.length;
        const eased = easeInOutCubic(swordsman.progress);
        swordsman.x = lerp(mappedNodes[fromIdx].x, mappedNodes[swordsman.targetIndex].x, eased);
        swordsman.y = lerp(mappedNodes[fromIdx].y, mappedNodes[swordsman.targetIndex].y, eased);

        // Update mage - follows same path but offset
        const mage = mageRef.current;
        mage.progress += deltaTime * speed;

        if (mage.progress >= 1) {
          // Arrived at target - update spell display
          const mageTargetNode = mappedNodes[mage.targetIndex];
          if (mageTargetNode && mage.targetIndex !== lastMageCastRef.current) {
            setCurrentSpell({ node: mageTargetNode.node, triggeredBy: 'mage' });
            lastMageCastRef.current = mage.targetIndex;
          }

          mage.targetIndex = (mage.targetIndex + 1) % mappedNodes.length;
          mage.progress = 0;
        }

        const mageFromIdx = (mage.targetIndex - 1 + mappedNodes.length) % mappedNodes.length;
        const mageEased = easeInOutCubic(mage.progress);
        mage.x = lerp(mappedNodes[mageFromIdx].x, mappedNodes[mage.targetIndex].x, mageEased);
        mage.y = lerp(mappedNodes[mageFromIdx].y, mappedNodes[mage.targetIndex].y, mageEased);

        // No particle trails - keep constellation clean

      } else {
        // === WAITING MODE: Orbs orbit peacefully at bottom ===
        const time = timestamp * 0.001;
        const orbitRadius = 45;
        const centerX = panelWidth / 2;
        const orbY = panelHeight - 35; // Orbs at bottom

        swordsmanRef.current.x = centerX + Math.cos(time * 0.8) * orbitRadius;
        swordsmanRef.current.y = orbY + Math.sin(time * 0.8) * 10;

        mageRef.current.x = centerX + Math.cos(time * 0.8 + Math.PI) * orbitRadius;
        mageRef.current.y = orbY + Math.sin(time * 0.8 + Math.PI) * 10;

        // Draw subtle glow path under orbs
        ctx.beginPath();
        ctx.ellipse(centerX, orbY, orbitRadius, 10, 0, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD + '15';
        ctx.lineWidth = 20;
        ctx.stroke();
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.035,
          vx: p.vx * 0.97,
          opacity: Math.max(0, 1 - p.lifetime / p.maxLifetime),
          rotation: p.rotation + 0.02,
          lifetime: p.lifetime + deltaTime,
        }))
        .filter(p => p.lifetime < p.maxLifetime);

      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scale, p.scale);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.font = '18px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      // Draw orbs - bigger in evoke mode!
      drawOrb(ctx, swordsmanRef.current.x, swordsmanRef.current.y, '⚔️', SWORDSMAN_COLOR, '#ff6b6b', isCasting ? 22 : 13);
      drawOrb(ctx, mageRef.current.x, mageRef.current.y, '✦', MAGE_COLOR, '#a78bfa', isCasting ? 22 : 13);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive, isCasting, panelWidth, panelHeight, mappedNodes, circuitNodes.length]);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        zIndex: 200,
      }}
    >
      {/* PROOF BAR - Top of display when casting */}
      {isCasting && (
        <div
          style={{
            padding: '14px 28px',
            background: 'rgba(5, 5, 15, 0.95)',
            borderRadius: 25,
            border: `2px solid ${lapCount >= 4 ? GOLD : lapCount >= 2 ? '#666' : '#444'}`,
            boxShadow: lapCount >= 4 ? `0 0 40px ${GOLD}40, inset 0 0 20px ${GOLD}10` : 'none',
            transition: 'all 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔥</span>
            <div style={{
              width: 180,
              height: 10,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 5,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(100, (lapCount / 10) * 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${SWORDSMAN_COLOR}, ${GOLD}, ${MAGE_COLOR})`,
                borderRadius: 5,
                transition: 'width 0.3s ease-out',
                boxShadow: lapCount > 0 ? `0 0 15px ${GOLD}` : 'none',
              }} />
            </div>
            <span style={{ fontSize: 20 }}>✨</span>
          </div>
          <div style={{
            fontSize: 14,
            color: lapCount >= 7 ? '#ff6b6b' : lapCount >= 4 ? GOLD : '#aaa',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: lapCount >= 4 ? 'bold' : 'normal',
            letterSpacing: 1,
          }}>
            {lapCount} {lapCount === 1 ? 'LAP' : 'LAPS'} • {getChargeLevel(lapCount).toUpperCase()}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS BAR - Below ceremony panel */}
      <div
        style={{
          order: 2, // Place after ceremony panel
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: isCasting ? 'rgba(10, 10, 20, 0.95)' : 'rgba(10, 10, 20, 0.9)',
          borderRadius: 20,
          border: `1px solid ${isCasting ? GOLD + '50' : '#444'}`,
          backdropFilter: 'blur(12px)',
          flexWrap: 'wrap',
        }}
      >
        {/* Shine - Reset everything to fresh state */}
        {onShine && (
          <button
            onClick={onShine}
            style={{
              padding: '8px 14px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 180, 0, 0.15))',
              border: '1px solid #ffd700',
              color: '#ffd700',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
              boxShadow: '0 0 12px rgba(255, 215, 0, 0.2)',
            }}
          >
            <span style={{ fontSize: 14 }}>✨</span> Shine
          </button>
        )}

        {/* Orbs Control - Bring home or send wandering */}
        {onToggleOrbsHome && !isCasting && (
          <button
            onClick={onToggleOrbsHome}
            style={{
              padding: '8px 14px',
              borderRadius: 18,
              background: orbsAtHome
                ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(155, 89, 182, 0.15))'
                : 'rgba(60, 60, 80, 0.3)',
              border: `1px solid ${orbsAtHome ? '#e74c3c80' : '#555'}`,
              color: orbsAtHome ? '#e0a0a0' : '#888',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
              boxShadow: orbsAtHome ? '0 0 10px rgba(231, 76, 60, 0.2)' : 'none',
            }}
          >
            {orbsAtHome ? (
              <>
                <span style={{ fontSize: 14 }}>🌟</span> Wander
              </>
            ) : (
              <>
                <span style={{ fontSize: 14 }}>🏠</span> Home
              </>
            )}
          </button>
        )}

        {/* Clear path button - shows when path is loaded */}
        {circuitNodes.length > 0 && !isCasting && onClearConstellation && (
          <button
            onClick={onClearConstellation}
            style={{
              padding: '8px 14px',
              borderRadius: 18,
              background: 'rgba(255, 100, 100, 0.1)',
              border: '1px solid #ff666680',
              color: '#ff6666',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 14 }}>✕</span> Clear
          </button>
        )}

        {/* Save Path button - saves current path to library */}
        {onSavePath && canSave && (
          <button
            onClick={onSavePath}
            title="Save this path to your Paths library"
            style={{
              padding: '8px 14px',
              borderRadius: 18,
              background: 'rgba(80, 200, 120, 0.15)',
              border: '1px solid #50c878',
              color: '#50c878',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 14 }}>💾</span> Save Path
          </button>
        )}

        {/* Connect button - start connection mode */}
        {onConnect && (
          <button
            onClick={onConnect}
            disabled={!canConnect}
            style={{
              padding: '8px 14px',
              borderRadius: 18,
              background: canConnect ? 'rgba(255, 165, 0, 0.15)' : 'rgba(255, 165, 0, 0.05)',
              border: `1px solid ${canConnect ? '#ffa500' : '#ffa50040'}`,
              color: canConnect ? '#ffa500' : '#ffa50050',
              fontSize: 12,
              fontWeight: 600,
              cursor: canConnect ? 'pointer' : 'default',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
              opacity: canConnect ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: 14 }}>🔗</span> Connect
          </button>
        )}

        {/* Waypoint / Close Portal */}
        {canClosePortal && onClosePortal ? (
          <button
            onClick={onClosePortal}
            style={{
              padding: '8px 16px',
              borderRadius: 18,
              background: 'rgba(0, 217, 255, 0.2)',
              border: '1px solid #00d9ff',
              color: '#00d9ff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 14 }}>✨</span> Close Portal
          </button>
        ) : onStartWaypoint && (
          <button
            onClick={onStartWaypoint}
            disabled={!canStartWaypoint && !waypointActive}
            style={{
              padding: '8px 16px',
              borderRadius: 18,
              background: waypointActive ? 'rgba(0, 217, 255, 0.25)' : 'rgba(0, 217, 255, 0.1)',
              border: `1px solid ${waypointActive ? '#00d9ff' : canStartWaypoint ? '#00d9ff80' : '#00d9ff40'}`,
              color: waypointActive ? '#00d9ff' : canStartWaypoint ? '#00d9ff99' : '#00d9ff50',
              fontSize: 12,
              fontWeight: 600,
              cursor: canStartWaypoint || waypointActive ? 'pointer' : 'default',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
              opacity: canStartWaypoint || waypointActive ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: 14 }}>🧭</span> {waypointActive ? 'Tracing...' : canStartWaypoint ? 'Waypoint' : 'Select node'}
          </button>
        )}

        {/* RIGHT: EVOKE Button - Always visible, prominent */}
        {onToggleEvoke && (
          <button
            onClick={onToggleEvoke}
            disabled={circuitNodes.length === 0 && !isCasting}
            style={{
              padding: isCasting ? '8px 18px' : '10px 20px',
              borderRadius: 20,
              background: isCasting
                ? 'linear-gradient(135deg, #ff660060, #ff440050)'
                : circuitNodes.length > 0
                  ? 'linear-gradient(135deg, #ff660040, #ff440030)'
                  : 'linear-gradient(135deg, #ff660020, #ff440015)',
              border: `1px solid ${isCasting ? '#ffaa00' : circuitNodes.length > 0 ? '#ff6600' : '#ff660060'}`,
              color: isCasting ? '#ffcc00' : circuitNodes.length > 0 ? '#ff6600' : '#ff660080',
              fontSize: isCasting ? 12 : 13,
              fontWeight: 700,
              cursor: circuitNodes.length > 0 || isCasting ? 'pointer' : 'default',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: 1,
              transition: 'all 0.2s',
              boxShadow: isCasting ? `0 0 25px #ff660050` : circuitNodes.length > 0 ? '0 0 10px #ff660030' : 'none',
              opacity: circuitNodes.length > 0 || isCasting ? 1 : 0.7,
            }}
          >
            <span style={{ fontSize: 14 }}>🔥</span> {isCasting ? 'STOP EVOKE' : 'EVOKE'}
          </button>
        )}
      </div>

      {/* Main ceremony panel - click to emit emojis during evoke */}
      <div
        onClick={handleCeremonyClick}
        style={{
          order: 1, // Place before action buttons
          width: panelWidth,
          height: panelHeight,
          borderRadius: isCasting ? 20 : 30,
          overflow: 'hidden',
          boxShadow: isCasting
            ? '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.2)'
            : '0 4px 20px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${isCasting ? GOLD + '50' : '#444'}`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          cursor: isCasting ? 'pointer' : 'default',
        }}
      >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: panelWidth, height: panelHeight }}
      />

      {/* Waiting state UI - Evoke button and constellation preview */}
      {!isCasting && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 60, // Leave space for orbs at bottom
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '16px 20px',
          }}
        >
          {/* Constellation preview - shows the spell chain */}
          {circuitNodes.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 22,
              color: GOLD,
              padding: '10px 20px',
              background: 'rgba(255, 215, 0, 0.05)',
              borderRadius: 12,
            }}>
              {circuitNodes.slice(0, 8).map((node, i) => (
                <span key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{node.emoji || '✦'}</span>
                  {i < Math.min(7, circuitNodes.length - 1) && (
                    <span style={{ color: '#555', fontSize: 14 }}>→</span>
                  )}
                </span>
              ))}
              {circuitNodes.length > 8 && (
                <span style={{ color: '#666', fontSize: 12 }}>+{circuitNodes.length - 8}</span>
              )}
            </div>
          )}

          {/* Empty state */}
          {circuitNodes.length === 0 && (
            <div style={{
              fontSize: 13,
              color: '#666',
              fontFamily: '"JetBrains Mono", monospace',
              textAlign: 'center',
              padding: '20px 0',
            }}>
              Create a constellation to begin
            </div>
          )}
        </div>
      )}

      {/* Spell display - ABOVE the panel */}
      {isCasting && currentSpell && (
        <div
          key={`${currentSpell.node.id}-${currentSpell.triggeredBy}`}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 20,
            maxWidth: 650,
            padding: '18px 28px',
            background: 'rgba(5, 5, 15, 0.97)',
            borderRadius: 14,
            border: `1px solid ${currentSpell.triggeredBy === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR}50`,
            boxShadow: `0 6px 40px rgba(0, 0, 0, 0.6), 0 0 60px ${currentSpell.triggeredBy === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR}25`,
            animation: 'spellAppear 0.4s ease-out',
          }}
        >
          {/* Orb indicator + Node label */}
          <div style={{
            fontSize: 11,
            color: '#777',
            fontFamily: '"JetBrains Mono", monospace',
            marginBottom: 10,
            textAlign: 'center',
            letterSpacing: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <span style={{
              color: currentSpell.triggeredBy === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR,
              fontSize: 14,
            }}>
              {currentSpell.triggeredBy === 'swordsman' ? '⚔️' : '✦'}
            </span>
            <span>{currentSpell.node.emoji} {currentSpell.node.label}</span>
          </div>

          {/* Animated emoji spell - each emoji glows in sequence */}
          {currentSpell.node.emojiSpell && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
              marginBottom: 14,
              padding: '12px 16px',
              background: `${currentSpell.triggeredBy === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR}10`,
              borderRadius: 10,
              flexWrap: 'wrap',
            }}>
              <AnimatedEmojiSpell spell={currentSpell.node.emojiSpell} />
            </div>
          )}

          {/* Proverb */}
          {currentSpell.node.proverb && (
            <div style={{
              fontSize: 14,
              color: currentSpell.triggeredBy === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR,
              fontFamily: '"Cormorant Garamond", serif',
              fontStyle: 'italic',
              textAlign: 'center',
              lineHeight: 1.7,
              opacity: 0.9,
            }}>
              "{currentSpell.node.proverb}"
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spellAppear {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes emojiGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
            filter: brightness(1.5) drop-shadow(0 0 8px ${GOLD});
          }
        }
      `}</style>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DRAWING
// ═══════════════════════════════════════════════════════════════

function drawOrb(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  symbol: string,
  color: string,
  glowColor: string,
  radius: number = 16
) {
  // Glow
  const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius * 2);
  gradient.addColorStop(0, glowColor + '50');
  gradient.addColorStop(0.5, glowColor + '20');
  gradient.addColorStop(1, glowColor + '00');
  ctx.beginPath();
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
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

export default SpellCeremony;
