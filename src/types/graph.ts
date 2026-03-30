// ═══════════════════════════════════════════════════════════════
// SPELLWEB TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export type NodeType = 'document' | 'concept' | 'theorem' | 'spell' | 'act' | 'persona' | 'term' | 'skill';

// ═══════════════════════════════════════════════════════════════
// HEXAGRAM SYSTEM (64-Tetrahedra Lattice Mapping)
// ═══════════════════════════════════════════════════════════════

/**
 * Six-line hexagram state (binary: 0 = yin, 1 = yang)
 * Maps to 6 dimensions: d1Hide → d6Delegate
 */
export type HexagramLine = 0 | 1;
export type HexagramState = [HexagramLine, HexagramLine, HexagramLine, HexagramLine, HexagramLine, HexagramLine];

/**
 * Node dimensions from spellweb (0.0 to 1.0 scores)
 */
export interface NodeDimensions {
  d1Hide: number;      // Line 1: Key Custody
  d2Commit: number;    // Line 2: Credential Disclosure
  d3Prove: number;     // Line 3: Agent Delegation
  d4Connect: number;   // Line 4: Data Residency
  d5Reflect: number;   // Line 5: Interaction Mode
  d6Delegate: number;  // Line 6: Trust Boundary
}

/**
 * Hexagram metadata computed from dimensions
 */
export interface HexagramInfo {
  lines: HexagramState;      // Binary line states
  bladeId: number;           // 0-63, binary encoding
  layer: number;             // 0-6, Hamming weight (Pascal's row)
  layerName: string;         // Human-readable layer name
  yangCount: number;         // Number of yang lines
}

/**
 * Layer names based on Pascal's row distribution
 */
export const HEXAGRAM_LAYER_NAMES: Record<number, string> = {
  0: 'Null',        // 000000 - No assertions
  1: 'Single-edge', // One yang line
  2: 'Twin-edge',   // Two yang lines
  3: 'Triple-edge', // Three yang lines (trust triad)
  4: 'Quad-edge',   // Four yang lines
  5: 'Penta-edge',  // Five yang lines (near-sovereign)
  6: 'Dragon',      // 111111 - Full sovereignty
};

/**
 * Convert node dimensions to hexagram state
 */
export function nodeToHexagram(dimensions: NodeDimensions, threshold = 0.5): HexagramState {
  return [
    dimensions.d1Hide >= threshold ? 1 : 0,
    dimensions.d2Commit >= threshold ? 1 : 0,
    dimensions.d3Prove >= threshold ? 1 : 0,
    dimensions.d4Connect >= threshold ? 1 : 0,
    dimensions.d5Reflect >= threshold ? 1 : 0,
    dimensions.d6Delegate >= threshold ? 1 : 0,
  ];
}

/**
 * Convert hexagram to blade ID (0-63)
 * Binary encoding: line 1 = LSB, line 6 = MSB
 */
export function hexagramToBladeId(hex: HexagramState): number {
  return hex[0] + hex[1]*2 + hex[2]*4 + hex[3]*8 + hex[4]*16 + hex[5]*32;
}

/**
 * Get hexagram layer (Hamming weight / yang count)
 */
export function hexagramLayer(hex: HexagramState): number {
  return hex.reduce<number>((sum, line) => sum + line, 0);
}

/**
 * Compute full hexagram info from dimensions
 */
export function computeHexagramInfo(dimensions: NodeDimensions): HexagramInfo {
  const lines = nodeToHexagram(dimensions);
  const yangCount = hexagramLayer(lines);
  return {
    lines,
    bladeId: hexagramToBladeId(lines),
    layer: yangCount,
    layerName: HEXAGRAM_LAYER_NAMES[yangCount],
    yangCount,
  };
}

/**
 * Render hexagram as ASCII (for display)
 */
export function renderHexagramASCII(hex: HexagramState): string {
  return hex.map((line, i) => {
    const yangSymbol = '━━━';
    const yinSymbol = '━ ━';
    const dimNames = ['d1Hide', 'd2Commit', 'd3Prove', 'd4Connect', 'd5Reflect', 'd6Delegate'];
    return `${line ? yangSymbol : yinSymbol}  ${dimNames[i]}`;
  }).reverse().join('\n');
}

export type Domain = 'swordsman' | 'mage' | 'first_person' | 'shared';

export type Spellbook = 'first_person' | 'zero_knowledge' | 'blockchain_canon' | 'parallel_society' | 'plurality';

export type Layer = 'knowledge' | 'narrative';

export type EdgeType =
  | 'defines'
  | 'proves'
  | 'implements'
  | 'extends'
  | 'narrates'
  | 'follows'
  | 'references'
  | 'compresses_to'
  | 'contradicts'
  | 'persona_knows';

export interface SpellwebNode {
  id: string;
  type: NodeType;
  label: string;
  domain: Domain;
  layer: Layer;
  desc: string;
  version?: string;
  emoji?: string;
  proverb?: string;
  emojiSpell?: string;
  matchScore?: number;
  txid?: string;
  spellbook?: Spellbook;
  // 6-dimensional privacy scoring
  dimensions?: NodeDimensions;
  // Computed hexagram info (derived from dimensions)
  hexagram?: HexagramInfo;
  // D3 simulation properties (added at runtime)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  index?: number;
}

export interface SpellwebEdge {
  source: string | SpellwebNode;
  target: string | SpellwebNode;
  type: EdgeType;
}

export interface NodeVisual {
  fill: string;
  stroke: string;
  icon: string;
}

export interface EdgeStyle {
  color: string;
  width: number;
  dash: string | null;
}

export interface Theme {
  bg: string;
  panelBg: string;
  panelBorder: string;
  text: string;
  textDim: string;
  textBright: string;
  accent: string;
  nodes: {
    document: NodeVisual;
    concept: {
      swordsman: NodeVisual;
      mage: NodeVisual;
      first_person: NodeVisual;
      shared: NodeVisual;
    };
    theorem: NodeVisual;
    spell: NodeVisual;
    act: NodeVisual;
    persona: NodeVisual;
    term: NodeVisual;
    skill: NodeVisual;
  };
  edges: Record<EdgeType, EdgeStyle>;
}

export interface FilterState {
  knowledge: boolean;
  narrative: boolean;
}

export interface TypeFilterState {
  document: boolean;
  concept: boolean;
  theorem: boolean;
  spell: boolean;
  act: boolean;
  persona: boolean;
  term: boolean;
  skill: boolean;
}

export interface SpellbookFilterState {
  first_person: boolean;
  zero_knowledge: boolean;
  blockchain_canon: boolean;
  parallel_society: boolean;
  plurality: boolean;
}

export interface ConnectedNode {
  node: SpellwebNode;
  type: EdgeType;
  direction: 'in' | 'out';
}
