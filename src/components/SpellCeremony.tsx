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
  constellationHash: string; // SHA-256 hash of node IDs (first 12 hex chars)
  nodeCount: number;
  chargeLevel: 'spark' | 'ember' | 'flame' | 'inferno' | 'dragon';
  signature: string; // unique proof token (SHA-256 based)
  spellsCast: number; // number of spell clicks during evoke (randomness attribute)
  // Blade Forge attributes
  bladeDimensions: BladeDimensions;
  bladeStratum: number;  // Hamming weight (0-6)
  bladeTier: BladeTier;
  bladeHex: string;      // 6-bit hex representation
  // Hash chain attributes (blade lineage)
  previousBladeHash: string | null; // null for inception blade
  bladeHash: string; // SHA-256 of this blade's canonical data
  chainLength: number; // position in the chain (1 = inception)
  // Commitment scheme (pre-evocation lock)
  commitment: string; // SHA-256(constellationHash + nonce) - locked at evoke start
  commitmentNonce: string; // random nonce used in commitment
  commitmentVerified: boolean; // true if reveal matches commitment
  // Mage identity signature (added when blade is claimed/manifested)
  mageSignature?: string;        // Ed25519 signature of blade data
  mageId?: string;               // mage-{16hex} identifier
  // Runecraft (dual-key binding - Mage + Swordsman)
  runecrafted?: boolean;         // True if both signatures present
  swordsmanSignature?: string;   // Ed25519 signature from agentprivacy Swordsman
  swordsmanId?: string;          // ap-{16hex} identifier
  runecraftedAt?: number;        // Timestamp when runecraft completed
}

// Equipped blade structure (swordsman's wielded blade - gives his orb emojis)
export interface EquippedBladeData {
  id: string;
  name: string;
  emoji: string;
  constellationMarks: Array<{
    nodeId: string;
    emoji?: string;
    emojiSpell?: string;
  }>;
}

// Mage's learned spell (one of her 6 chosen - gives her orb emojis)
export interface MageSpellData {
  nodeId: string;
  label: string;
  emoji?: string;
  emojiSpell?: string;
  proverb?: string;
  hexagramLine: number; // 0-5
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
  isShineMode?: boolean; // Shine (100%) vs Shadow (15%)
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
  // Swordsman's equipped blade (his orb emojis come from this path)
  equippedBlade?: EquippedBladeData | null;
  // Mage's 6 chosen spells (her orb emojis come from these)
  mageSpells?: MageSpellData[];
  // Forge mode - show Forge button instead of Evoke when proof ready
  hasProof?: boolean;
  onForge?: () => void;
  // Menu openers - Mage and Sword buttons open detailed modals
  onOpenMageMenu?: () => void;
  onOpenBladesModal?: () => void;
  // Spell cast callback - called when clicking during ceremony to deduct mana
  onSpellCast?: () => void;
  // Casting mode toggle: 'constellation' (free) or 'mage' (costs mana)
  castingMode?: 'constellation' | 'mage';
  onToggleCastingMode?: () => void;
  // Mana floor - below this, mage mode is greyed out
  manaFloor?: number;
  // Hovered node - displayed in ceremony panel instead of tooltip
  hoveredNode?: { label: string; emoji?: string; type: string; desc?: string } | null;
  // Selected spell for info bar (mage side)
  selectedSpell?: { label: string; emoji?: string; proverb?: string } | null;
  // Mana points for the info bar
  manaPoints?: number;
  maxMana?: number;
  // Mobile minimize callback
  onMinimize?: () => void;
  // Mobile ceremony presets - sun/moon/aether constellation loading
  onLoadSunConstellation?: () => void;
  onLoadMoonConstellation?: () => void;
  onLoadAetherConstellation?: () => void;
  // Audio URLs for R2 narrations (played on long-press)
  sunAudioUrl?: string;
  moonAudioUrl?: string;
  aetherAudioUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const SWORDSMAN_COLOR = '#e74c3c';
const MAGE_COLOR = '#9b59b6';
const GOLD = '#ffd700';

const WAITING_WIDTH = 440; // Wider for spell emojis to fit
const WAITING_HEIGHT = 200; // Increased for info bar at bottom
const WAITING_HEIGHT_MOBILE_EMPTY = 90; // Compact: just orbs circling
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

// SHA-256 hash for constellation (cryptographic, collision-resistant)
async function hashConstellation(nodes: CircuitNode[]): Promise<string> {
  const str = nodes.map(n => n.id).join(':');
  const data = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // First 12 hex chars = 48 bits, readable but collision-resistant
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}

// Determine charge level based on laps (Fibonacci progression)
// spark(6) → ember(13) → flame(21) → inferno(38) → dragon(62)
function getChargeLevel(laps: number): SpellProof['chargeLevel'] {
  if (laps >= 62) return 'dragon';
  if (laps >= 38) return 'inferno';
  if (laps >= 21) return 'flame';
  if (laps >= 13) return 'ember';
  return 'spark';
}

// Generate unique proof signature (SHA-256 based)
async function generateSignature(nodes: CircuitNode[], laps: number, timestamp: number): Promise<string> {
  const constellationHash = await hashConstellation(nodes);
  const data = `${constellationHash}-${laps}-${timestamp}`;
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  // Format: SPELL-[6 hex chars]-[lap count in base36]
  return `SPELL-${hex.slice(0, 6).toUpperCase()}-${laps.toString(36).toUpperCase()}`;
}

// Compute blade hash for hash chain (SHA-256 of canonical blade data)
async function computeBladeHash(
  constellationHash: string,
  laps: number,
  duration: number,
  bladeHex: string,
  bladeStratum: number,
  previousBladeHash: string | null,
  timestamp: number
): Promise<string> {
  const canonical = JSON.stringify({
    constellation: constellationHash,
    laps,
    duration,
    hex: bladeHex,
    stratum: bladeStratum,
    previous: previousBladeHash,
    timestamp
  });
  const encoded = new TextEncoder().encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get previous blade hash and chain length from localStorage
function getPreviousBladeInfo(): { previousHash: string | null; chainLength: number } {
  try {
    const stored = localStorage.getItem('spellweb_blade_chain');
    if (stored) {
      const chain = JSON.parse(stored);
      return {
        previousHash: chain.lastBladeHash || null,
        chainLength: (chain.length || 0) + 1
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { previousHash: null, chainLength: 1 };
}

// Update blade chain in localStorage
function updateBladeChain(bladeHash: string, chainLength: number): void {
  try {
    localStorage.setItem('spellweb_blade_chain', JSON.stringify({
      lastBladeHash: bladeHash,
      length: chainLength
    }));
  } catch {
    // Ignore storage errors
  }
}

// Generate a random nonce for commitment scheme
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate commitment: SHA-256(constellationHash + nonce)
async function generateCommitment(constellationHash: string, nonce: string): Promise<string> {
  const data = constellationHash + nonce;
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify commitment matches reveal
async function verifyCommitment(commitment: string, constellationHash: string, nonce: string): Promise<boolean> {
  const computed = await generateCommitment(constellationHash, nonce);
  return computed === commitment;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ═══════════════════════════════════════════════════════════════
// BLADE FORGE CALCULATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate blade dimensions based on proof attributes
 * Different ceremony styles produce different hexagram stances:
 *
 * QUICK STRIKE (few nodes, fast, few spells): Light blades, focused dimensions
 * MEDITATIVE (longer time, steady pace): Memory/Value dimensions unlock
 * SPELL-HEAVY (many spells cast): Delegation/Computation active
 * EXPANSIVE (many nodes, many laps): Connection/Protection strong
 *
 * The hexagram reflects HOW you approached the ceremony, not just "more = better"
 */
function calculateBladeDimensions(
  nodeCount: number,
  lapCount: number,
  duration: number,
  chargeLevel: SpellProof['chargeLevel'],
  spellsCast: number = 0
): BladeDimensions {
  const seconds = duration / 1000;
  const minutes = duration / 60000;

  // Ceremony style indicators
  const isQuick = seconds < 20;
  const isMeditative = minutes >= 1;
  const isSpellHeavy = spellsCast >= 3;
  const isExpansive = nodeCount >= 4;
  const isDeep = lapCount >= 3;

  return {
    // d1: Protection (🛡️) - Boundaries forged
    // Activates: Has a clear path with structure (not too simple)
    protection: nodeCount >= 2 || lapCount >= 2,

    // d2: Delegation (🤝) - Agency transferred
    // Activates: Spell-casting focus OR deep iteration
    delegation: isSpellHeavy || isDeep,

    // d3: Memory (📜) - State accumulated
    // Activates: Meditative time investment OR many interactions
    memory: isMeditative || (seconds >= 30 && lapCount >= 2),

    // d4: Connection (🔗) - Multi-party coordination
    // Activates: Expansive constellation OR repeated traversal
    connection: isExpansive || (nodeCount >= 3 && lapCount >= 2),

    // d5: Computation (⚡) - ZK proof active
    // Activates: Quick decisive action OR spell intensity
    computation: isQuick || isSpellHeavy || nodeCount >= 1,

    // d6: Value (💎) - Economic flow
    // Activates: High charge from sustained presence, or meditative + spells
    value: chargeLevel === 'flame' || chargeLevel === 'inferno' || chargeLevel === 'dragon'
           || (isMeditative && spellsCast >= 1),
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
/**
 * Calculate blade tier from lap count (Fibonacci power thresholds)
 * 6 laps → Light blade
 * 21 laps → Heavy blade
 * 62 laps → Dragon blade
 */
function calculateBladeTier(lapCount: number): BladeTier {
  if (lapCount >= 62) return 'dragon';
  if (lapCount >= 21) return 'heavy';
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
  isShineMode,
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
  equippedBlade,
  mageSpells = [],
  hasProof,
  onForge,
  onOpenMageMenu,
  onOpenBladesModal,
  onSpellCast,
  castingMode = 'constellation',
  onToggleCastingMode,
  manaFloor = 7,
  hoveredNode: _hoveredNode,
  selectedSpell,
  manaPoints = 0,
  maxMana = 64,
  onMinimize,
  onLoadSunConstellation,
  onLoadMoonConstellation,
  onLoadAetherConstellation,
  sunAudioUrl = 'https://voice.agentprivacy.ai/The_Emissary_Who_Forgot_the_Master.mp3',
  moonAudioUrl = 'https://voice.agentprivacy.ai/The_Amnesia_Protocol.mp3',
  aetherAudioUrl = 'https://voice.agentprivacy.ai/The_Tide_Proves_Orbit_Keeps_Selene.mp3',
}: SpellCeremonyProps) {
  // hoveredNode is available via _hoveredNode if needed
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
  // On mobile with no constellation, show compact orb-only view
  const isEmptyMobile = isMobile && circuitNodes.length === 0;
  const panelHeight = isCasting
    ? (isMobile ? Math.min(windowSize.height - 250, 400) : EVOKE_HEIGHT)
    : (isEmptyMobile ? WAITING_HEIGHT_MOBILE_EMPTY : WAITING_HEIGHT);

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

  // Commitment scheme - locks constellation at evoke start
  const commitmentRef = useRef<string>('');
  const commitmentNonceRef = useRef<string>('');

  // Audio refs for R2 narrations (mobile long-press)
  const sunAudioRef = useRef<HTMLAudioElement | null>(null);
  const moonAudioRef = useRef<HTMLAudioElement | null>(null);
  const aetherAudioRef = useRef<HTMLAudioElement | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const LONG_PRESS_DURATION = 500; // ms before audio starts

  // Mana system - depletes per lap (blade mana), not per click
  const [mana, setMana] = useState(100);

  // Panel minimize state
  const [isMinimized, setIsMinimized] = useState(false);
  const MANA_COST_PER_LAP = 1; // Cost 1 mana per lap completed

  // Spell tracking - per lap and total
  const spellsCastThisLapRef = useRef(0);
  const spellsPerLapRef = useRef<number[]>([]); // Track spells cast in each lap

  // Imprints - spell emojis drawn on the chart when cast
  const imprintsRef = useRef<Array<{
    x: number;
    y: number;
    emoji: string;
    opacity: number;
    scale: number;
    rotation: number;
    createdAt: number;
  }>>([]);

  // Particles
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    emoji: string; opacity: number; scale: number; rotation: number;
    lifetime: number; maxLifetime: number; color: string;
  }>>([]);

  // Current spell display - tracks which orb triggered it
  const [currentSpell, setCurrentSpell] = useState<{ node: CircuitNode; triggeredBy: 'swordsman' | 'mage' } | null>(null);

  // Separate emoji queues for swordsman (from equipped blade) and mage (from 6 spells)
  const swordsmanEmojiQueueRef = useRef<string[]>([]);
  const mageEmojiQueueRef = useRef<string[]>([]);
  const swordsmanQueueIndexRef = useRef(0);
  const mageQueueIndexRef = useRef(0);
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

      // Generate commitment (pre-evocation lock)
      // This proves the constellation was locked BEFORE the ceremony began
      (async () => {
        const constellationHash = await hashConstellation(circuitNodes);
        const nonce = generateNonce();
        const commitment = await generateCommitment(constellationHash, nonce);
        commitmentRef.current = commitment;
        commitmentNonceRef.current = nonce;
      })();
      setCurrentSpell(null);
      particlesRef.current = [];

      // Build SEPARATE emoji queues for swordsman and mage
      const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;

      // SWORDSMAN: Emojis from equipped blade's constellation path
      const swordsmanEmojis: string[] = [];
      if (equippedBlade?.constellationMarks) {
        equippedBlade.constellationMarks.forEach(mark => {
          const spellString = mark.emojiSpell || mark.emoji || '';
          const matches = spellString.match(emojiRegex);
          if (matches) swordsmanEmojis.push(...matches);
        });
      }
      // Fallback to circuit nodes if no blade equipped
      if (swordsmanEmojis.length === 0) {
        circuitNodes.forEach(node => {
          const spellString = node.emojiSpell || node.emoji || '';
          const matches = spellString.match(emojiRegex);
          if (matches) swordsmanEmojis.push(...matches);
        });
      }
      swordsmanEmojiQueueRef.current = swordsmanEmojis.length > 0 ? swordsmanEmojis : ['⚔️', '🗡️', '🔥', '⚡'];

      // MAGE: Emojis from her 6 chosen spells
      const mageEmojis: string[] = [];
      mageSpells.forEach(spell => {
        const spellString = spell.emojiSpell || spell.emoji || '';
        const matches = spellString.match(emojiRegex);
        if (matches) mageEmojis.push(...matches);
      });
      mageEmojiQueueRef.current = mageEmojis.length > 0 ? mageEmojis : ['✦', '🔮', '💫', '🌟', '✨', '🌙'];

      swordsmanQueueIndexRef.current = 0;
      mageQueueIndexRef.current = 0;
      lastEmitOrbRef.current = 'mage';
      spellsCastRef.current = 0; // Reset spell click counter
      spellsCastThisLapRef.current = 0; // Reset per-lap counter
      spellsPerLapRef.current = []; // Reset lap tracking
      setMana(100); // Reset mana to full (blade mana)
      imprintsRef.current = []; // Clear imprints
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

      // Calculate blade forge attributes based on ceremony style
      const bladeDimensions = calculateBladeDimensions(
        circuitNodes.length,
        lapCount,
        duration,
        chargeLevel,
        spellsCastRef.current
      );
      const bladeStratum = calculateBladeStratum(bladeDimensions);
      const bladeTier = calculateBladeTier(lapCount);
      const bladeHex = bladeToHex(bladeDimensions);

      // Generate cryptographic hashes asynchronously
      (async () => {
        const [constellationHash, signature] = await Promise.all([
          hashConstellation(circuitNodes),
          generateSignature(circuitNodes, lapCount, ceremonyStartRef.current)
        ]);

        // Get hash chain info
        const { previousHash, chainLength } = getPreviousBladeInfo();

        // Compute blade hash for the chain
        const bladeHash = await computeBladeHash(
          constellationHash,
          lapCount,
          duration,
          bladeHex,
          bladeStratum,
          previousHash,
          completedAt
        );

        // Verify commitment (the constellation hash at end should match what was locked at start)
        const commitmentVerified = await verifyCommitment(
          commitmentRef.current,
          constellationHash,
          commitmentNonceRef.current
        );

        const proof: SpellProof = {
          lapCount,
          duration,
          startedAt: ceremonyStartRef.current,
          completedAt,
          constellationHash,
          nodeCount: circuitNodes.length,
          chargeLevel,
          signature,
          spellsCast: spellsCastRef.current,
          // Blade Forge attributes
          bladeDimensions,
          bladeStratum,
          bladeTier,
          bladeHex,
          // Hash chain attributes
          previousBladeHash: previousHash,
          bladeHash,
          chainLength,
          // Commitment scheme attributes
          commitment: commitmentRef.current,
          commitmentNonce: commitmentNonceRef.current,
          commitmentVerified,
        };

        // Update the chain for next blade
        updateBladeChain(bladeHash, chainLength);

        onProofGenerated?.(proof);
      })();
    }
    prevCastingRef.current = isCasting;
  }, [isCasting, lapCount, circuitNodes, onProofGenerated]);

  // Click handler - cast spell, consume mana, imprint on chart
  const handleCeremonyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCasting) return;

    // Check casting mode and mana
    // Mage mode: uses selected spell from inventory, costs mana
    // Constellation mode: uses path spells from orb queues, free
    const useMageMode = castingMode === 'mage' && manaPoints >= manaFloor && selectedSpell?.emoji;

    if (useMageMode && onSpellCast) {
      onSpellCast(); // Deduct mana in SpellWeb
    }

    // Track spell clicks
    spellsCastThisLapRef.current++;
    spellsCastRef.current++;

    // Determine which emoji to cast based on mode
    let emoji: string;
    let color: string;

    if (useMageMode && selectedSpell?.emoji) {
      // Mage mode: cast the selected spell from inventory (costs mana)
      emoji = selectedSpell.emoji;
      color = MAGE_COLOR;
    } else {
      // Constellation mode: use path spells (free)
      // Alternate between swordsman and mage orb queues
      const emitOrb = lastEmitOrbRef.current === 'swordsman' ? 'mage' : 'swordsman';
      lastEmitOrbRef.current = emitOrb;

      if (emitOrb === 'swordsman') {
        const queue = swordsmanEmojiQueueRef.current;
        if (queue.length === 0) return;
        emoji = queue[swordsmanQueueIndexRef.current % queue.length];
        swordsmanQueueIndexRef.current++;
        color = SWORDSMAN_COLOR;
      } else {
        const queue = mageEmojiQueueRef.current;
        if (queue.length === 0) return;
        emoji = queue[mageQueueIndexRef.current % queue.length];
        mageQueueIndexRef.current++;
        color = MAGE_COLOR;
      }
    }

    // Get click position relative to canvas
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Imprint the spell emoji on the chart at click position
    imprintsRef.current.push({
      x: clickX,
      y: clickY,
      emoji,
      opacity: 1,
      scale: 1.2,
      rotation: (Math.random() - 0.5) * 0.3,
      createdAt: Date.now(),
    });

    // Emit burst of particles from click position
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.3;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x: clickX + (Math.random() - 0.5) * 15,
        y: clickY + (Math.random() - 0.5) * 15,
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
              // Deduct mana per lap
              setMana(prev => Math.max(0, prev - MANA_COST_PER_LAP));
              // Record spells cast this lap
              spellsPerLapRef.current.push(spellsCastThisLapRef.current);
              spellsCastThisLapRef.current = 0; // Reset for next lap
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

      } else {
        // === WAITING MODE: Orbs orbit peacefully ===
        const time = timestamp * 0.001;
        // Compact mobile: smaller orbit, centered vertically
        const isCompact = panelHeight <= WAITING_HEIGHT_MOBILE_EMPTY;
        const orbitRadius = isCompact ? 35 : 45;
        const centerX = panelWidth / 2;
        const orbY = isCompact ? panelHeight / 2 : panelHeight - 35; // Center on compact, bottom otherwise

        swordsmanRef.current.x = centerX + Math.cos(time * 0.8) * orbitRadius;
        swordsmanRef.current.y = orbY + Math.sin(time * 0.8) * (isCompact ? 8 : 10);

        mageRef.current.x = centerX + Math.cos(time * 0.8 + Math.PI) * orbitRadius;
        mageRef.current.y = orbY + Math.sin(time * 0.8 + Math.PI) * (isCompact ? 8 : 10);

        // Draw subtle glow path under orbs
        ctx.beginPath();
        ctx.ellipse(centerX, orbY, orbitRadius, isCompact ? 8 : 10, 0, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD + '15';
        ctx.lineWidth = isCompact ? 15 : 20;
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

      // Draw imprints - spell emojis cast on the chart
      const now = Date.now();
      imprintsRef.current = imprintsRef.current
        .map(imp => {
          const age = now - imp.createdAt;
          const fadeStart = 8000; // Start fading after 8 seconds
          const fadeTime = 4000; // Fade over 4 seconds
          const opacity = age > fadeStart
            ? Math.max(0, 1 - (age - fadeStart) / fadeTime)
            : 1;
          return { ...imp, opacity };
        })
        .filter(imp => imp.opacity > 0);

      imprintsRef.current.forEach(imp => {
        ctx.save();
        ctx.globalAlpha = imp.opacity * 0.85;
        ctx.translate(imp.x, imp.y);
        ctx.rotate(imp.rotation);
        ctx.scale(imp.scale, imp.scale);
        ctx.shadowColor = MAGE_COLOR;
        ctx.shadowBlur = 12;
        ctx.font = '24px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(imp.emoji, 0, 0);
        ctx.restore();
      });

      // Mana depletes per lap - no regeneration during evoke

      // Draw orbs - bigger in evoke mode!
      drawOrb(ctx, swordsmanRef.current.x, swordsmanRef.current.y, '⚔️', SWORDSMAN_COLOR, '#ff6b6b', isCasting ? 22 : 13);
      drawOrb(ctx, mageRef.current.x, mageRef.current.y, '✦', MAGE_COLOR, '#a78bfa', isCasting ? 22 : 13);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive, isCasting, panelWidth, panelHeight, mappedNodes, circuitNodes.length]);

  if (!isActive) return null;

  // Minimized view - just a small expandable bar
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
        }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            padding: '10px 24px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.95), rgba(20, 20, 35, 0.98))',
            border: '1px solid #444',
            color: '#aaa',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#666';
            e.currentTarget.style.color = '#ddd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#444';
            e.currentTarget.style.color = '#aaa';
          }}
        >
          <span>⚔️</span>
          <span>Ceremony</span>
          <span>✦</span>
          <span style={{ marginLeft: 8, fontSize: 16 }}>▲</span>
        </button>
      </div>
    );
  }

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
      {/* PROOF BAR - Lap count and charge level */}
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
                width: lapCount >= 42 ? '100%' : `${Math.min(100, (lapCount / 10) * 100)}%`,
                height: '100%',
                background: lapCount >= 42
                  ? 'linear-gradient(90deg, #7b68ee, #ffd700, #7b68ee)'
                  : `linear-gradient(90deg, ${SWORDSMAN_COLOR}, ${GOLD}, ${MAGE_COLOR})`,
                borderRadius: 5,
                transition: 'width 0.3s ease-out',
                boxShadow: lapCount >= 42
                  ? '0 0 20px #7b68ee, 0 0 40px #ffd700'
                  : lapCount > 0 ? `0 0 15px ${GOLD}` : 'none',
              }} />
            </div>
            <span style={{ fontSize: 20 }}>✨</span>
          </div>
          <div style={{
            fontSize: 14,
            color: lapCount >= 42 ? '#7b68ee' : lapCount >= 7 ? '#ff6b6b' : lapCount >= 4 ? GOLD : '#aaa',
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: lapCount >= 4 ? 'bold' : 'normal',
            letterSpacing: 1,
          }}>
            {lapCount} {lapCount === 1 ? 'LAP' : 'LAPS'} • {getChargeLevel(lapCount).toUpperCase()}
          </div>

          {/* Mana Bar - tracks spell casts during evoke */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            background: 'rgba(155, 89, 182, 0.1)',
            borderRadius: 12,
            border: `1px solid ${manaPoints > 0 ? MAGE_COLOR + '50' : '#ff444450'}`,
          }}>
            <span style={{ fontSize: 14 }}>🔮</span>
            <div style={{
              width: 60,
              height: 6,
              background: 'rgba(155, 89, 182, 0.2)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(100, (manaPoints / maxMana) * 100)}%`,
                height: '100%',
                background: manaPoints > maxMana / 2
                  ? `linear-gradient(90deg, ${MAGE_COLOR}, #a78bfa)`
                  : manaPoints > maxMana / 4
                    ? 'linear-gradient(90deg, #9b59b6, #e74c3c)'
                    : 'linear-gradient(90deg, #e74c3c, #ff4444)',
                borderRadius: 3,
                transition: 'width 0.15s ease-out',
                boxShadow: manaPoints > 0 ? `0 0 6px ${MAGE_COLOR}` : 'none',
              }} />
            </div>
            <span style={{
              fontSize: 11,
              color: manaPoints > 0 ? MAGE_COLOR : '#ff6666',
              fontFamily: '"JetBrains Mono", monospace',
              minWidth: 32,
            }}>
              {manaPoints}/{maxMana}
            </span>
          </div>

          {/* Casting Mode Toggle - Stars (constellation/free) vs Crystal (mage/mana) */}
          {onToggleCastingMode && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              background: 'rgba(30, 30, 40, 0.8)',
              borderRadius: 16,
              border: '1px solid #444',
            }}>
              {/* Constellation mode - free spells from path */}
              <button
                onClick={() => castingMode !== 'constellation' && onToggleCastingMode()}
                title="Constellation spells (free)"
                style={{
                  padding: '4px 8px',
                  borderRadius: 12,
                  background: castingMode === 'constellation'
                    ? 'linear-gradient(135deg, #ffd70030, #ffd70020)'
                    : 'transparent',
                  border: castingMode === 'constellation' ? '1px solid #ffd700' : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: 16,
                  opacity: castingMode === 'constellation' ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
              >
                ✨
              </button>
              {/* Mage mode - inventory spells, costs mana */}
              <button
                onClick={() => castingMode !== 'mage' && manaPoints >= manaFloor && onToggleCastingMode()}
                title={manaPoints < manaFloor ? `Need ${manaFloor}+ mana` : "Mage spells (costs mana)"}
                disabled={manaPoints < manaFloor}
                style={{
                  padding: '4px 8px',
                  borderRadius: 12,
                  background: castingMode === 'mage' && manaPoints >= manaFloor
                    ? 'linear-gradient(135deg, #9b59b630, #9b59b620)'
                    : 'transparent',
                  border: castingMode === 'mage' && manaPoints >= manaFloor
                    ? `1px solid ${MAGE_COLOR}`
                    : '1px solid transparent',
                  cursor: manaPoints < manaFloor ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                  opacity: manaPoints < manaFloor ? 0.3 : castingMode === 'mage' ? 1 : 0.5,
                  filter: manaPoints < manaFloor ? 'grayscale(100%)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                🔮
              </button>
            </div>
          )}
        </div>
      )}{/* FORGE BLADE - Prominent button at top after evoke completes */}
{hasProof && !isCasting && onForge && (
  <button
    onClick={onForge}
    style={{
      padding: '16px 32px',
      borderRadius: 25,
      background: 'linear-gradient(135deg, #ffd70060, #ff660050, #ffd70060)',
      border: '2px solid #ffd700',
      color: '#ffd700',
      fontSize: 16,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: '"JetBrains Mono", monospace',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      letterSpacing: 2,
      transition: 'all 0.2s',
      boxShadow: '0 0 30px #ffd70050, 0 0 60px #ffd70030',
      animation: 'forgeGlow 2s ease-in-out infinite',
    }}
  >
    <span style={{ fontSize: 20 }}>??</span> FORGE BLADE <span style={{ fontSize: 20 }}>??</span>
  </button>
)}

{/* ACTION BUTTONS BAR - Below ceremony panel */}
      <div
        style={{
          order: 2, // Place after ceremony panel
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? 6 : 8,
          padding: isMobile ? '6px 10px' : '8px 14px',
          background: isCasting ? 'rgba(10, 10, 20, 0.95)' : 'rgba(10, 10, 20, 0.9)',
          borderRadius: 20,
          border: `1px solid ${isCasting ? GOLD + '50' : '#444'}`,
          backdropFilter: 'blur(12px)',
          flexWrap: 'wrap',
        }}
      >
        {/* MOBILE: Sun ceremony button (left of evoke) */}
        {isMobile && onLoadSunConstellation && (
          <button
            onClick={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
              onLoadSunConstellation();
            }}
            onTouchStart={() => {
              longPressTimerRef.current = setTimeout(() => {
                // Long press - play audio
                if (!sunAudioRef.current) {
                  sunAudioRef.current = new Audio(sunAudioUrl);
                }
                // Stop moon audio if playing
                if (moonAudioRef.current) {
                  moonAudioRef.current.pause();
                  moonAudioRef.current.currentTime = 0;
                }
                sunAudioRef.current.play();
                longPressTimerRef.current = null;
              }, LONG_PRESS_DURATION);
            }}
            onTouchEnd={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            onTouchCancel={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            title="☀️ Sun Ceremony (hold for audio)"
            style={{
              padding: '10px 14px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #ffd70025, #ff8c0015)',
              border: '1px solid #ffd70060',
              color: '#ffd700',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.15)',
            }}
          >
            ☀️
          </button>
        )}

        {/* Minimize button - on mobile, also hides panel entirely */}
        <button
          onClick={() => {
            setIsMinimized(true);
            // On mobile, call parent minimize to hide panel
            if (isMobile && onMinimize) {
              onMinimize();
            }
          }}
          title="Minimize ceremony panel"
          style={{
            padding: '8px 10px',
            borderRadius: 18,
            background: 'rgba(60, 60, 80, 0.5)',
            border: '1px solid #555',
            color: '#888',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            display: isMobile ? 'none' : 'flex', // Hide on mobile
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 10 }}>▼</span>
        </button>

        {/* Sword [s] - Open blades modal - DESKTOP ONLY */}
        {!isMobile && onOpenBladesModal && (
          <button
            onClick={onOpenBladesModal}
            title="Open Blades inventory [s to cycle]"
            style={{
              padding: '8px 12px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(231, 76, 60, 0.1))',
              border: `1px solid ${SWORDSMAN_COLOR}60`,
              color: SWORDSMAN_COLOR,
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
            <span style={{ fontSize: 14 }}>⚔️</span> Sword
          </button>
        )}

        {/* Shine/Shadow toggle - simple lights on/off - DESKTOP ONLY */}
        {!isMobile && onShine && (
          <button
            onClick={onShine}
            disabled={isCasting}
            title={isCasting ? "Cannot toggle while evoking" : (isShineMode ? "Switch to Shadow (15%)" : "Switch to Shine (100%)")}
            style={{
              padding: '8px 14px',
              borderRadius: 18,
              background: isCasting
                ? (isShineMode ? 'rgba(255, 215, 0, 0.05)' : 'rgba(180, 190, 210, 0.05)')
                : (isShineMode
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 180, 0, 0.15))'
                    : 'linear-gradient(135deg, rgba(100, 120, 160, 0.25), rgba(60, 70, 100, 0.2))'),
              border: `1px solid ${isCasting
                ? (isShineMode ? '#ffd70030' : '#8090b030')
                : (isShineMode ? '#ffd700' : '#8090b0')}`,
              color: isCasting
                ? (isShineMode ? '#ffd70040' : '#8090b040')
                : (isShineMode ? '#ffd700' : '#b0c0d8'),
              fontSize: 12,
              fontWeight: 600,
              cursor: isCasting ? 'not-allowed' : 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
              boxShadow: isCasting ? 'none' : (isShineMode
                ? '0 0 12px rgba(255, 215, 0, 0.2)'
                : '0 0 12px rgba(140, 160, 200, 0.15)'),
              opacity: isCasting ? 0.5 : 1,
            }}
          >
            {isShineMode ? "✨" : "🌑"} {isShineMode ? "Shine" : "Shadow"}
          </button>
        )}

        {/* Orbs Control - Bring home or send wandering - DESKTOP ONLY */}
        {!isMobile && onToggleOrbsHome && !isCasting && (
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

        {/* Save Path button - saves current path to library - DESKTOP ONLY */}
        {!isMobile && onSavePath && canSave && (
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

        {/* Connect button - start connection mode - DESKTOP ONLY */}
        {!isMobile && onConnect && (
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

        {/* Waypoint / Close Portal - DESKTOP ONLY */}
        {!isMobile && (canClosePortal && onClosePortal ? (
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
        ))}

        {/* Mage [m] - Open mage spells menu - DESKTOP ONLY */}
        {!isMobile && onOpenMageMenu && (
          <button
            onClick={onOpenMageMenu}
            title="Open Mage spells [m to cycle]"
            style={{
              padding: '8px 12px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.15), rgba(155, 89, 182, 0.1))',
              border: `1px solid ${MAGE_COLOR}60`,
              color: MAGE_COLOR,
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
            <span style={{ fontSize: 14 }}>✦</span> Mage
          </button>
        )}

        {/* RIGHT: EVOKE/FORGE Button - Shows Forge when proof is ready */}
        {hasProof && !isCasting && onForge ? (
          <button
            onClick={onForge}
            style={{
              padding: '10px 20px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #ffd70050, #ff660040)',
              border: '1px solid #ffd700',
              color: '#ffd700',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: 1,
              transition: 'all 0.2s',
              boxShadow: '0 0 20px #ffd70040',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <span style={{ fontSize: 14 }}>🔥</span> FORGE BLADE
          </button>
        ) : onToggleEvoke && (
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

        {/* MOBILE: Moon ceremony button (right of evoke) */}
        {isMobile && onLoadMoonConstellation && (
          <button
            onClick={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
              onLoadMoonConstellation();
            }}
            onTouchStart={() => {
              longPressTimerRef.current = setTimeout(() => {
                // Long press - play audio
                if (!moonAudioRef.current) {
                  moonAudioRef.current = new Audio(moonAudioUrl);
                }
                // Stop sun audio if playing
                if (sunAudioRef.current) {
                  sunAudioRef.current.pause();
                  sunAudioRef.current.currentTime = 0;
                }
                moonAudioRef.current.play();
                longPressTimerRef.current = null;
              }, LONG_PRESS_DURATION);
            }}
            onTouchEnd={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            onTouchCancel={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            title="🌙 Moon Ceremony (hold for audio)"
            style={{
              padding: '10px 14px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #7b68ee25, #9b59b615)',
              border: '1px solid #7b68ee60',
              color: '#7b68ee',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 0 10px rgba(123, 104, 238, 0.15)',
            }}
          >
            🌙
          </button>
        )}

        {/* MOBILE: Aether ceremony button (the medium Sun and Moon travel through) */}
        {isMobile && onLoadAetherConstellation && (
          <button
            onClick={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
              onLoadAetherConstellation();
            }}
            onTouchStart={() => {
              longPressTimerRef.current = setTimeout(() => {
                // Long press - play audio if an Aether URL was provided
                if (aetherAudioUrl) {
                  if (!aetherAudioRef.current) {
                    aetherAudioRef.current = new Audio(aetherAudioUrl);
                  }
                  // Stop sibling audio if playing
                  if (sunAudioRef.current) {
                    sunAudioRef.current.pause();
                    sunAudioRef.current.currentTime = 0;
                  }
                  if (moonAudioRef.current) {
                    moonAudioRef.current.pause();
                    moonAudioRef.current.currentTime = 0;
                  }
                  aetherAudioRef.current.play();
                }
                longPressTimerRef.current = null;
              }, LONG_PRESS_DURATION);
            }}
            onTouchEnd={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            onTouchCancel={() => {
              if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
            }}
            title="⿻ Aether Ceremony — the medium between disclosure and reflection (Drake-Rising Path)"
            style={{
              padding: '10px 14px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #00d4ff25, #20b2aa15)',
              border: '1px solid #00d4ff60',
              color: '#00d4ff',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 0 10px rgba(0, 212, 255, 0.15)',
            }}
          >
            ⿻
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
      {/* Hidden on compact mobile empty state (just show orbs) */}
      {!isCasting && !isEmptyMobile && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 100, // Leave space for orbs at bottom, taller info area
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


        </div>
      )}

      {/* Spell display - ABOVE the panel - Click to learn/copy spell */}
      {isCasting && currentSpell && (
        <div
          key={`${currentSpell.node.id}-${currentSpell.triggeredBy}`}
          onClick={() => {
            const spellText = currentSpell.node.emojiSpell || currentSpell.node.emoji || currentSpell.node.label;
            navigator.clipboard.writeText(spellText);
            // Visual feedback - could add a toast notification here
          }}
          title="Click to learn spell (copy to clipboard)"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 20,
            maxWidth: 650,
            padding: '18px 28px 14px',
            background: 'rgba(5, 5, 15, 0.97)',
            borderRadius: 14,
            border: `1px solid ${currentSpell.triggeredBy === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR}50`,
            boxShadow: `0 6px 40px rgba(0, 0, 0, 0.6), 0 0 60px ${currentSpell.triggeredBy === 'swordsman' ? SWORDSMAN_COLOR : MAGE_COLOR}25`,
            animation: 'spellAppear 0.4s ease-out',
            cursor: 'pointer',
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
              marginBottom: 10,
            }}>
              "{currentSpell.node.proverb}"
            </div>
          )}

          {/* MANA BAR - Attached to spell display */}
          <div style={{
            marginTop: 12,
            padding: '8px 12px',
            background: 'rgba(155, 89, 182, 0.08)',
            borderRadius: 10,
            border: `1px solid ${MAGE_COLOR}30`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14 }}>{selectedSpell?.emoji || '🔮'}</span>
            <div style={{
              width: 100,
              height: 6,
              background: 'rgba(155, 89, 182, 0.15)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${mana}%`,
                height: '100%',
                background: mana > 50
                  ? `linear-gradient(90deg, ${MAGE_COLOR}, #a78bfa)`
                  : mana > 20
                    ? 'linear-gradient(90deg, #9b59b6, #e74c3c)'
                    : 'linear-gradient(90deg, #e74c3c, #ff4444)',
                borderRadius: 3,
                transition: 'width 0.1s ease-out',
                boxShadow: mana > 50 ? `0 0 6px ${MAGE_COLOR}` : 'none',
              }} />
            </div>
            <span style={{
              fontSize: 10,
              color: mana > 50 ? MAGE_COLOR : mana > 20 ? '#888' : '#ff6666',
              fontFamily: '"JetBrains Mono", monospace',
              minWidth: 28,
            }}>
              {Math.round(mana)}%
            </span>
            <span style={{ fontSize: 10, color: '#666' }}>MANA</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spellAppear {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
        @keyframes forgeGlow {
          0%, 100% { box-shadow: 0 0 30px #ffd70050, 0 0 60px #ffd70030; }
          50% { box-shadow: 0 0 50px #ffd70080, 0 0 100px #ffd70050; }
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

      {/* INFO BAR - Bottom of ceremony panel showing blade/spell/mana */}
      {!isCasting && (
        <div
          style={{
            order: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '8px 16px',
            background: 'rgba(10, 10, 20, 0.9)',
            borderRadius: 16,
            border: `1px solid #444`,
            backdropFilter: 'blur(12px)',
            minWidth: 320,
          }}
        >
          {/* Equipped Blade (Swordsman side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: SWORDSMAN_COLOR }}>⚔️</span>
            {equippedBlade ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{equippedBlade.emoji}</span>
                <span style={{
                  fontSize: 10,
                  color: '#e74c3c',
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  {equippedBlade.name.slice(0, 12)}
                </span>
              </div>
            ) : (
              <span style={{
                fontSize: 10,
                color: '#666',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                NO BLADE
              </span>
            )}
          </div>

          {/* Mana Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>💜</span>
            <div style={{
              width: 80,
              height: 6,
              background: 'rgba(155, 89, 182, 0.2)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(100, (manaPoints / maxMana) * 100)}%`,
                height: '100%',
                background: manaPoints > maxMana / 2
                  ? `linear-gradient(90deg, ${MAGE_COLOR}, #a78bfa)`
                  : manaPoints > maxMana / 4
                    ? 'linear-gradient(90deg, #9b59b6, #e74c3c)'
                    : 'linear-gradient(90deg, #e74c3c, #ff4444)',
                borderRadius: 3,
                transition: 'width 0.2s ease-out',
                boxShadow: manaPoints > 0 ? `0 0 6px ${MAGE_COLOR}` : 'none',
              }} />
            </div>
            <span style={{
              fontSize: 10,
              color: manaPoints > 0 ? MAGE_COLOR : '#666',
              fontFamily: '"JetBrains Mono", monospace',
              minWidth: 24,
            }}>
              {manaPoints}
            </span>
          </div>

          {/* Selected Spell (Mage side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: MAGE_COLOR }}>✦</span>
            {selectedSpell ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{selectedSpell.emoji || '🔮'}</span>
                <span style={{
                  fontSize: 10,
                  color: '#9b59b6',
                  fontFamily: '"JetBrains Mono", monospace',
                }}>
                  {selectedSpell.label?.slice(0, 12) || 'SPELL'}
                </span>
              </div>
            ) : mageSpells.length > 0 ? (
              <span style={{
                fontSize: 10,
                color: '#666',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                {mageSpells.length}/8 spells
              </span>
            ) : (
              <span style={{
                fontSize: 10,
                color: '#666',
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                NO SPELLS
              </span>
            )}
          </div>
        </div>
      )}
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
