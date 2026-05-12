import type { Theme, SpellwebNode, NodeVisual, EdgeStyle, EdgeType } from '../types/graph';

// ═══════════════════════════════════════════════════════════════
// VISUAL THEME
// ═══════════════════════════════════════════════════════════════

export const THEME: Theme = {
  bg: "#06060e",
  panelBg: "#0c0c18",
  panelBorder: "#1a1a30",
  text: "#c8c8d8",
  textDim: "#666680",
  textBright: "#e8e8f0",
  accent: "#ffd700",
  nodes: {
    document: { fill: "#1e1e3a", stroke: "#3a3a5c", icon: "📜" },
    concept: {
      swordsman: { fill: "#8b1a2b", stroke: "#e94560", icon: "⚔️" },
      mage: { fill: "#3b2d7a", stroke: "#7b68ee", icon: "🧙" },
      first_person: { fill: "#6b5a00", stroke: "#ffd700", icon: "😊" },
      shared: { fill: "#0a4a5c", stroke: "#00d9ff", icon: "◆" },
    },
    theorem: { fill: "#5c1a1a", stroke: "#e74c3c", icon: "△" },
    spell: { fill: "#5c4a00", stroke: "#ffd700", icon: "✦" },
    act: { fill: "#0a4a2a", stroke: "#2ecc71", icon: "◇" },
    persona: { fill: "#2a1a4a", stroke: "#a78bfa", icon: "○" },
    term: { fill: "#1a1a2a", stroke: "#555570", icon: "·" },
    skill: { fill: "#3a2a00", stroke: "#f39c12", icon: "⚙" },
    chronicle: { fill: "#1a2a3a", stroke: "#00bcd4", icon: "📜" },
    // Universe integration (2026-05-10): four-domain universe
    workshop:  { fill: "#1c1c2c", stroke: "#d4af37", icon: "🏛" },   // gem-color stroke (default gold; overridden per-node via gemColor)
    cast:      { fill: "#2a1f3a", stroke: "#c4a8ff", icon: "✦" },    // tier-tinted; default summoned violet
    vertex:    { fill: "#0e0e1a", stroke: "#d4af37", icon: "·" },    // gold-stroked dot for inhabited; renderer dims for open
    geography: { fill: "#1a0e0a", stroke: "#7a3a1a", icon: "🐉" },   // Drake; deep ember
    civic:     { fill: "#1e1a2e", stroke: "#e4c84f", icon: "🏰" },   // City of Mages
    gateway:   { fill: "#0e1e2c", stroke: "#86c5ff", icon: "↗" },    // sister-city / cousin-substrate
    artefact:  { fill: "#1c1c2e", stroke: "#ffd700", icon: "✦" },    // Sovereign's deviation node; stroke replaced per-tier in getNodeVisual
  },
  edges: {
    defines: { color: "#00d9ff", width: 1.5, dash: null },
    proves: { color: "#e74c3c", width: 2, dash: null },
    implements: { color: "#7b68ee", width: 1.5, dash: null },
    extends: { color: "#2ecc71", width: 1.2, dash: null },
    narrates: { color: "#2ecc71", width: 1.5, dash: "4,4" },
    follows: { color: "#2ecc71", width: 3, dash: null },
    references: { color: "#444460", width: 0.8, dash: "2,4" },
    referenced_in: { color: "#444460", width: 0.8, dash: "2,4" },
    compresses_to: { color: "#ffd700", width: 2, dash: "6,3" },
    contradicts: { color: "#ff4444", width: 1.5, dash: "2,2" },
    persona_knows: { color: "#a78bfa", width: 1, dash: "3,3" },
    parent_of: { color: "#ffd700", width: 2, dash: null },
    embodies: { color: "#9b59b6", width: 1.5, dash: "4,2" },
    requires: { color: "#e74c3c", width: 1.2, dash: null },
    introduces: { color: "#2ecc71", width: 1.5, dash: null },
    teaches: { color: "#f39c12", width: 1.2, dash: "3,3" },
        relates_to: { color: "#666680", width: 1, dash: "2,3" },
    measured_by: { color: "#00bcd4", width: 1.5, dash: "3,2" },
    names: { color: "#a78bfa", width: 1.2, dash: null },
    // Celestial hierarchy edges (Act XXXI cosmology)
    generates: { color: "#ffd700", width: 2.5, dash: null },
    delegates_via: { color: "#4169e1", width: 2, dash: "4,2" },
    manifests_as: { color: "#32cd32", width: 1.5, dash: null },
    reflects_through: { color: "#c0c0c0", width: 2, dash: "3,3" },
    remembers: { color: "#9370db", width: 1.5, dash: "2,4" },
    // Universe integration (2026-05-10): geometric / civic / kinship edges
    founds:        { color: "#d4af37", width: 1.6, dash: null },     // act → workshop, gold solid
    founded_in:    { color: "#d4af37", width: 1.6, dash: null },     // workshop → act (reciprocal)
    inhabits:      { color: "#c4a8ff", width: 2, dash: null },       // cast/workshop → vertex; thick, gem-tinted
    kin_to:        { color: "#e4c84f", width: 1.2, dash: "5,3" },    // dashed gold; mutual lateral kinship
    gateway_to:    { color: "#86c5ff", width: 1.5, dash: "2,3" },    // dotted; city → sister
    built_on:      { color: "#5a4a3a", width: 1, dash: null },       // civic → geography; subdued stone
    quarter_of:    { color: "#a78bfa", width: 1, dash: null },       // workshop → civic; thin violet
    adjacent_to:   { color: "#333355", width: 0.5, dash: "1,2" },    // declared but unused; lattice geometry
    // V5.5 Attachment Architecture edges (2026-05-11)
    divergent_of:    { color: "#9333ea", width: 2, dash: "6,2" },    // purple dashed; cast → primary persona with register-shift (Lethae → Moonkeeper)
    complement_pair: { color: "#fbbf24", width: 1.8, dash: "3,3,1,3" }, // amber double-dashed; vertex bit-complement pair (Aletheia ⊥ Lethae)
  },
};

// Cast tier tints (overrides default cast stroke when tier is set)
const CAST_TIER_STROKE: Record<string, string> = {
  archetype: "#ffd700",  // gold — the canonical archetypes (Soulbis, Soulbae)
  cousin:    "#c0c0c0",  // silver — cousin instances (GenitriX, flaxscrip)
  summoned:  "#c4a8ff",  // violet — citizen-Mages of the city
  companion: "#ff9f4a",  // ember — Socrat0x
  priest:    "#f0ead6",  // bone-white — Manifestia
};

export function getNodeVisual(node: SpellwebNode): NodeVisual {
  const t = THEME.nodes;
  if (node.type === "concept") {
    const conceptColors = t.concept;
    return conceptColors[node.domain] || conceptColors.shared;
  }
  // Workshop: stroke from gemColor when set
  if (node.type === "workshop" && node.gemColor) {
    return { ...t.workshop, stroke: node.gemColor };
  }
  // Cast: stroke from tier when it's a CastTier string
  if (node.type === "cast" && typeof node.tier === "string" && CAST_TIER_STROKE[node.tier]) {
    return { ...t.cast, stroke: CAST_TIER_STROKE[node.tier] };
  }
  // Vertex: dim when uninhabited (attribution: 'open')
  if (node.type === "vertex" && node.attribution === "open") {
    return { ...t.vertex, stroke: "#3a3a4a" };
  }
  // Artefact (deviation): stroke from blade tier; icon from the Sovereign's chosen emoji
  if (node.type === "artefact") {
    const tierStroke =
      node.bladeTier === 'dragon' ? '#ffd700' :
      node.bladeTier === 'heavy'  ? '#c0c0c0' :
                                    '#87ceeb';
    return { ...t.artefact, stroke: tierStroke, icon: node.emoji || t.artefact.icon };
  }
  return t[node.type] || t.term;
}

export function getNodeRadius(node: SpellwebNode): number {
  switch (node.type) {
    case "document": return 18;
    case "concept": return 13;
    case "theorem": return 11;
    case "spell": return 14;
    case "act": return 15;
    case "persona": return 14;
    case "term": return 8;
    case "skill": return 9;
    // Universe integration (2026-05-10)
    case "workshop":  return 14;
    case "cast":      return 12;
    case "vertex":    return 6;
    case "geography": return 32;
    case "civic":     return 24;
    case "gateway":   return 8;
    case "artefact":  return 13;
    default: return 10;
  }
}

export function getEdgeStyle(type: EdgeType): EdgeStyle {
  return THEME.edges[type] || { color: "#333", width: 1, dash: null };
}
