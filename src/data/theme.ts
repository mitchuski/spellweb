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
  },
  edges: {
    defines: { color: "#00d9ff", width: 1.5, dash: null },
    proves: { color: "#e74c3c", width: 2, dash: null },
    implements: { color: "#7b68ee", width: 1.5, dash: null },
    extends: { color: "#2ecc71", width: 1.2, dash: null },
    narrates: { color: "#2ecc71", width: 1.5, dash: "4,4" },
    follows: { color: "#2ecc71", width: 3, dash: null },
    references: { color: "#444460", width: 0.8, dash: "2,4" },
    compresses_to: { color: "#ffd700", width: 2, dash: "6,3" },
    contradicts: { color: "#ff4444", width: 1.5, dash: "2,2" },
    persona_knows: { color: "#a78bfa", width: 1, dash: "3,3" },
  },
};

export function getNodeVisual(node: SpellwebNode): NodeVisual {
  const t = THEME.nodes;
  if (node.type === "concept") {
    const conceptColors = t.concept;
    return conceptColors[node.domain] || conceptColors.shared;
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
    default: return 10;
  }
}

export function getEdgeStyle(type: EdgeType): EdgeStyle {
  return THEME.edges[type] || { color: "#333", width: 1, dash: null };
}
