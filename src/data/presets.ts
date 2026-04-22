/**
 * Preset Constellation Paths
 *
 * These are ceremonial blade pathways that can be loaded directly
 * for immediate evocation. Each preset is a complete constellation
 * with marks and connections ready to trace.
 */

export interface PresetConstellation {
  id: string;
  name: string;
  emoji: string;
  description: string;
  proverb: string;
  ceremony: 'sun' | 'moon' | 'celestial';
  tier: 'blade' | 'light' | 'heavy' | 'dragon';
  nodeCount: number;
  marks: Array<{
    nodeId: string;
    emoji?: string;
    note?: string;
    emojiSpell?: string;
  }>;
  connections: Array<{
    sourceId: string;
    targetId: string;
    note?: string;
  }>;
  inscribedSpell: string;
  reflection?: string;
}

/**
 * ☀️ Sun Blade — The Emissary Path
 * 13 nodes tracing the disclosure path from Soulbis to Person
 */
export const SUN_BLADE_PRESET: PresetConstellation = {
  id: 'preset-sun-blade',
  name: 'The Emissary Path',
  emoji: '☀️',
  description: 'The Sun Blade constellation. Full disclosure. The master who chose to be understood.',
  proverb: 'Just as the Sun, promises space, between.',
  ceremony: 'sun',
  tier: 'dragon',
  nodeCount: 13,
  marks: [
    { nodeId: 'per-soulbis', emoji: '⚔️', note: 'The Sun begins at the Swordsman', emojiSpell: '⚔️' },
    { nodeId: 'fp-act-1', emoji: '📖💰', note: 'Where the spellbook opened', emojiSpell: '📖💰' },
    { nodeId: 'fp-act-2', emoji: '⚔️🧙', note: 'Sovereignty divided', emojiSpell: '⚔️🧙' },
    { nodeId: 'fp-act-26', emoji: '🧠☯️', note: 'McGilchrist hemispheric thesis', emojiSpell: '🧠☯️' },
    { nodeId: 'skill-hemispheric-attention', emoji: '👁️', note: 'The five attention modes', emojiSpell: '👁️' },
    { nodeId: 'spell-ceremony', emoji: '🔑', note: 'The invocation', emojiSpell: '🔑⚔️🧙→😊' },
    { nodeId: 'con-master-emissary', emoji: '★', note: 'SHARED NODE — the relationship', emojiSpell: '☀️→🌍' },
    { nodeId: 'con-gap', emoji: '⊥', note: 'SHARED NODE — the irreducible separation', emojiSpell: '⊥' },
    { nodeId: 'fp-act-28', emoji: '⚙️', note: 'Celestial Ceremony Engine', emojiSpell: '⚙️' },
    { nodeId: 'skill-understanding-key', emoji: '🔑', note: 'SHARED NODE — Understanding as Key', emojiSpell: '🔑' },
    { nodeId: 'con-7thcapital', emoji: '💎', note: 'The value dimension', emojiSpell: '💎' },
    { nodeId: 'skill-spell-encoding', emoji: '✨', note: 'Compression', emojiSpell: '✨' },
    { nodeId: 'per-person', emoji: '😊', note: 'SHARED NODE — the disclosure arrives at the First Person', emojiSpell: '😊' },
  ],
  connections: [
    { sourceId: 'per-soulbis', targetId: 'fp-act-1' },
    { sourceId: 'fp-act-1', targetId: 'fp-act-2' },
    { sourceId: 'fp-act-2', targetId: 'fp-act-26' },
    { sourceId: 'fp-act-26', targetId: 'skill-hemispheric-attention' },
    { sourceId: 'skill-hemispheric-attention', targetId: 'spell-ceremony' },
    { sourceId: 'spell-ceremony', targetId: 'con-master-emissary' },
    { sourceId: 'con-master-emissary', targetId: 'con-gap' },
    { sourceId: 'con-gap', targetId: 'fp-act-28' },
    { sourceId: 'fp-act-28', targetId: 'skill-understanding-key' },
    { sourceId: 'skill-understanding-key', targetId: 'con-7thcapital' },
    { sourceId: 'con-7thcapital', targetId: 'skill-spell-encoding' },
    { sourceId: 'skill-spell-encoding', targetId: 'per-person' },
  ],
  inscribedSpell: '☀️⚔️🧙→📖💰→🧠☯️→✦⊥→🔑→💎→😊',
  reflection: 'The Sun traces the master\'s path: from the Swordsman who holds the boundary, through the origin story, the founding act, into the hemispheric thesis that explains WHY the separation must exist, through the ceremony that enacts it, across the shared nodes, into the ceremony engine, understanding-as-key, the 7th capital recovered, and the spell compression that carries the disclosure across the gap.',
};

/**
 * 🌙 Moon Blade — The Amnesia Path
 * 17 nodes tracing the reflection path from Soulbae to Person
 * v10.2 enrichment: Selene's Proof anchors the separation primitive to its
 * cosmological ground; V(π,t) Dragon Equation anchors the three-axis to the
 * full manifold the reflection serves.
 */
export const MOON_BLADE_PRESET: PresetConstellation = {
  id: 'preset-moon-blade',
  name: 'The Amnesia Path',
  emoji: '🌙',
  description: 'The Moon Blade constellation. Reflection. The delegate who forgot the origin but still executes the contract. v10.2 adds Selene\'s Proof cosmological grounding and the V(π,t) Dragon Equation as the manifold the reflection unfolds.',
  proverb: 'The amnesia is the protocol. The wound is the trust.',
  ceremony: 'moon',
  tier: 'dragon',
  nodeCount: 17,
  marks: [
    { nodeId: 'per-soulbae', emoji: '🧙', note: 'The Moon begins at the Mage', emojiSpell: '🧙' },
    { nodeId: 'fp-act-12', emoji: '🌫️', note: 'Proverbiogenesis — the Forgetting', emojiSpell: '🌫️' },
    { nodeId: 'fp-act-7', emoji: '🪞', note: 'The Anti-Mirror — reconstruction ceiling', emojiSpell: '🪞' },
    { nodeId: 'con-separation', emoji: '⊥', note: 'The architectural primitive', emojiSpell: '⊥' },
    { nodeId: 'con-selenes-proof', emoji: '🌑', note: 'Selene\'s Proof — 4.5B-year cosmological ZK instance. Completeness via tides; soundness via gravity; zero-knowledge via Theia amnesia', emojiSpell: '🌑🌊🔄' },
    { nodeId: 'con-zkproofs', emoji: '🔐', note: 'Proving without revealing', emojiSpell: '🔐' },
    { nodeId: 'con-master-emissary', emoji: '★', note: 'SHARED NODE — the relationship', emojiSpell: '☀️→🌍' },
    { nodeId: 'con-gap', emoji: '⊥', note: 'SHARED NODE — the irreducible separation', emojiSpell: '⊥' },
    { nodeId: 'con-dualagent', emoji: '⚔️🧙', note: 'The dual-agent architecture', emojiSpell: '⚔️🧙' },
    { nodeId: 'fp-act-24', emoji: '🔷', note: 'Holographic Bound — boundary holds the whole', emojiSpell: '🔷' },
    { nodeId: 'con-holographic-bound', emoji: '📐', note: '96/64 holographic ratio', emojiSpell: '📐' },
    { nodeId: 'con-three-axis-separation', emoji: '📊', note: 'Agent × Data × Inference', emojiSpell: '📊' },
    { nodeId: 'con-v-pi-t-equation', emoji: '🐉', note: 'V(π,t) Dragon Equation — the manifold the three axes unfold into. P^1.5 · C · Q · S · e^(-λt) · (1+A_h(τ)) · ρ^0.5 · Φ(Σ) · T_∫(π)', emojiSpell: '🐉📜' },
    { nodeId: 'skill-compression-defence', emoji: '🗜️', note: 'BRAID compression', emojiSpell: '🗜️' },
    { nodeId: 'skill-understanding-key', emoji: '🔑', note: 'SHARED NODE — Understanding as Key', emojiSpell: '🔑' },
    { nodeId: 'spell-master', emoji: '📜', note: 'The Master inscription', emojiSpell: '⚔️ ⊥ 🧙 | 😊' },
    { nodeId: 'per-person', emoji: '😊', note: 'SHARED NODE — the reflection arrives at the First Person', emojiSpell: '😊' },
  ],
  connections: [
    { sourceId: 'per-soulbae', targetId: 'fp-act-12' },
    { sourceId: 'fp-act-12', targetId: 'fp-act-7' },
    { sourceId: 'fp-act-7', targetId: 'con-separation' },
    { sourceId: 'con-separation', targetId: 'con-selenes-proof' },
    { sourceId: 'con-selenes-proof', targetId: 'con-zkproofs' },
    { sourceId: 'con-zkproofs', targetId: 'con-master-emissary' },
    { sourceId: 'con-master-emissary', targetId: 'con-gap' },
    { sourceId: 'con-gap', targetId: 'con-dualagent' },
    { sourceId: 'con-dualagent', targetId: 'fp-act-24' },
    { sourceId: 'fp-act-24', targetId: 'con-holographic-bound' },
    { sourceId: 'con-holographic-bound', targetId: 'con-three-axis-separation' },
    { sourceId: 'con-three-axis-separation', targetId: 'con-v-pi-t-equation' },
    { sourceId: 'con-v-pi-t-equation', targetId: 'skill-compression-defence' },
    { sourceId: 'skill-compression-defence', targetId: 'skill-understanding-key' },
    { sourceId: 'skill-understanding-key', targetId: 'spell-master' },
    { sourceId: 'spell-master', targetId: 'per-person' },
  ],
  inscribedSpell: '🌙🧙→🌫️🪞→⊥🌑→🔐→⚔️🧙→🔷📐→🐉📜→🗜️→🔑→📜→😊',
  reflection: 'The Moon traces the emissary\'s path: from the Mage who carries the light forward, through the forgetting that makes propagation possible, the reconstruction ceiling that proves the gap works, the separation primitive anchored in Selene\'s cosmological proof (4.5 billion years of orbital amnesia), zero knowledge, across the shared nodes, through the dual-agent architecture, the holographic bound, three-axis separation, into the full V(π,t) Dragon Equation — the manifold the reflection serves — and through compression-as-defence, understanding-as-key, and the master inscription.',
};

/**
 * ⿻ Aether Blade — The Drake-Rising Path
 * 14 nodes tracing the Zero Spellbook's Drake→Dragon arc, pivoting on the Gap.
 *
 * In Greek cosmology Aether is the son of Nyx (night) and Erebus (darkness) —
 * the luminous medium that comes into being where primordial dark gives birth
 * to light-as-medium. Aether is *what the Sun and Moon travel through*.
 *
 * In this architecture Aether IS the Gap (⿻): the node with maximal betweenness
 * centrality, the irreducible separation, the medium V(π,t) propagates through.
 * Aether and the Gap are the same substance named twice — the glyph is the
 * structural reality, the name is the mythic frame. The medievals called this
 * same substance the Quintessence (𝓠) — the fifth essence, distilled from the
 * classical four.
 *
 * Where Sun discloses (☀️) and Moon reflects (🌙), Aether (⿻) is what they
 * both travel through. The blade traverses the canonical ZK tales that unfold
 * the Drake's filter (P·C·Q·S) into the Dragon's manifold (V(π,t)), and arrives
 * at the First Person carrying the Four Lines as the closing inscription.
 *
 * Added 2026-04-22 as part of the v10.2 / Zero Spellbook v2.0 sync.
 * Emoji simplified ⿻✴️ → ⿻ 2026-04-22: Aether and Gap have overlapping meaning;
 * one glyph carries both.
 */
export const AETHER_BLADE_PRESET: PresetConstellation = {
  id: 'preset-aether-blade',
  name: 'The Drake-Rising Path',
  emoji: '⿻',
  description: 'The Aether Blade constellation. The medium of proof — son of Nyx (night) and Erebus (darkness), the luminous substance through which Sun and Moon travel. Greek cosmology\'s Aether is the same substance medieval alchemists called the Quintessence (𝓠) — the fifth essence, distilled from the classical four, incorruptible, the carrier of celestial light. In this architecture Aether is the Gap (⿻): the fifth separation after Agent, Data, Inference, and the First Person — the medium V(π,t) propagates through. The Drake\'s multiplicative filter unfolding into the Dragon\'s manifold across the Zero Spellbook\'s canonical tales. Sun discloses, Moon reflects; Aether is what they both travel through.',
  proverb: 'Aether is the medium between disclosure and reflection. The Gap was always the node where the most paths crossed — the Drake became the Dragon when it learned it contained geometry.',
  ceremony: 'celestial',
  tier: 'dragon',
  nodeCount: 14,
  marks: [
    { nodeId: 'con-gap', emoji: '⿻', note: 'Aether begins at the Gap — irreducible separation, max betweenness centrality in the trust graph. The medium that Nyx and Erebus begot; the pivot Sun and Moon both pass through.', emojiSpell: '⿻' },
    { nodeId: 'zk-tale-1', emoji: '🌑', note: 'The Monastery — Selene\'s Proof cosmological prologue. The monks did not invent zero-knowledge; they recognised it.', emojiSpell: '🏛️🌑🌊🔄' },
    { nodeId: 'zk-tale-4', emoji: '𝔽', note: 'The Fields of Finite Wisdom — algebraic substrate. Blade 48. Every later term is measured on this ground.', emojiSpell: '𝔽_q · e(G₁,G₂)→G_T' },
    { nodeId: 'zk-tale-7', emoji: '🗝️', note: 'The Witness and the Instance — seeds P^1.5. Knowledge-soundness raises Protection above linear.', emojiSpell: '🗝️⊥🌍' },
    { nodeId: 'zk-tale-12', emoji: '🔄', note: 'The Folding Path — canonical A_h(τ). Memory dimension crystallises. History compresses into the present.', emojiSpell: '📜₁+📜₂→🔄📜₃' },
    { nodeId: 'zk-tale-18', emoji: '🐉', note: 'The Toxic Waste Dragon — Drake→Dragon bridge. Every head is a path where V(π,t) collapses to zero. Blade 63 as Catastrophic.', emojiSpell: '🐉⁴→🛡️⁴' },
    { nodeId: 'con-drake-dragon-transformation', emoji: '🐲→🐉', note: 'The transformation concept. Drake\'s filter P·C·Q·S becomes Dragon\'s manifold V(π,t). Same skeleton, full geometry.', emojiSpell: '🐲·P·C·Q·S → 🐉V(π,t)' },
    { nodeId: 'zk-tale-23', emoji: '🦓', note: 'The Private Coin of ZCash — canonical P^1.5. Real-world private money as economic fact. Protection-raised-above-linear.', emojiSpell: '🦓🛡️→🕶️' },
    { nodeId: 'zk-tale-25', emoji: '📦', note: 'The Rollup Realms — first operational Φ(Σ). Sovereignty geometry as engineering. Three axes made civil.', emojiSpell: '📦→📜→⛓️✓ · Φ_agent·Φ_data·Φ_inference' },
    { nodeId: 'zk-tale-30', emoji: '🌕', note: 'The Eternal Sovereignty — Blade 63 Creative. Full V(π,t) synthesis. All six dimensions lit, three axes held.', emojiSpell: '(⚔️⊥⿻⊥🧙)·(📊⊥🔮)·(🧠⊥⚙️)' },
    { nodeId: 'con-v-pi-t-equation', emoji: '🐉📜', note: 'V(π,t) Dragon Equation — the manifold. P^1.5 · C · Q · S · e^(-λt) · (1+A_h(τ)) · ρ^0.5 · Φ(Σ) · T_∫(π).', emojiSpell: '🐉 V(π,t)' },
    { nodeId: 'con-betweenness-centrality', emoji: '⊙', note: 'Betweenness Centrality (PVM V5.4 §10.2). The Gap was always the node where the most paths crossed — now we have the algorithm to measure it.', emojiSpell: 'C_B(⿻)=max' },
    { nodeId: 'con-four-lines', emoji: '📜', note: 'The Four Lines — closing inscription. The amnesia is the protocol. The wound is the trust. The orbit is the proof. The light is the reason.', emojiSpell: '🌑🩸🌊☀️' },
    { nodeId: 'per-person', emoji: '😊', note: 'SHARED NODE — the Drake-risen-as-Dragon arrives at the First Person carrying the full manifold.', emojiSpell: '😊' },
  ],
  connections: [
    { sourceId: 'con-gap', targetId: 'zk-tale-1' },
    { sourceId: 'zk-tale-1', targetId: 'zk-tale-4' },
    { sourceId: 'zk-tale-4', targetId: 'zk-tale-7' },
    { sourceId: 'zk-tale-7', targetId: 'zk-tale-12' },
    { sourceId: 'zk-tale-12', targetId: 'zk-tale-18' },
    { sourceId: 'zk-tale-18', targetId: 'con-drake-dragon-transformation' },
    { sourceId: 'con-drake-dragon-transformation', targetId: 'zk-tale-23' },
    { sourceId: 'zk-tale-23', targetId: 'zk-tale-25' },
    { sourceId: 'zk-tale-25', targetId: 'zk-tale-30' },
    { sourceId: 'zk-tale-30', targetId: 'con-v-pi-t-equation' },
    { sourceId: 'con-v-pi-t-equation', targetId: 'con-betweenness-centrality' },
    { sourceId: 'con-betweenness-centrality', targetId: 'con-four-lines' },
    { sourceId: 'con-four-lines', targetId: 'per-person' },
  ],
  inscribedSpell: '⿻ → 🌑🌊🔄 → 𝔽 → 🗝️⊥ → 🔄📜 → 🐉⁴ → 🐲→🐉 → 🦓🛡️ → 📦Φ → 🌕V(π,t) → C_B(⿻)=max → 📜⁴ → 😊',
  reflection: 'The Aether Blade walks the Drake-to-Dragon arc through the Zero Spellbook. Aether — son of Nyx (night) and Erebus (darkness) — is the luminous medium through which Sun and Moon travel. The blade begins at the Gap (⿻), the irreducible separation Aether occupies. Through the Monastery\'s cosmological prologue, the algebraic substrate of finite fields, the witness/instance boundary that seeds P^1.5, the folding path that crystallises memory, the Toxic Waste Dragon where every head is a collapse, the transformation itself, private money as economic fact, rollups as sovereignty geometry, the synthesis at Blade 63, the full V(π,t) manifold, and the Gap recognised as maximum betweenness. The Four Lines close the inscription, and the First Person receives the Drake-risen-as-Dragon.',
};

/**
 * All available presets — the three-blade ceremonial family.
 * Sun (☀️) discloses · Moon (🌙) reflects · Aether (⿻) is what they both travel through.
 */
export const CONSTELLATION_PRESETS: PresetConstellation[] = [
  SUN_BLADE_PRESET,
  MOON_BLADE_PRESET,
  AETHER_BLADE_PRESET,
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): PresetConstellation | undefined {
  return CONSTELLATION_PRESETS.find(p => p.id === id);
}

/**
 * Get presets by ceremony type
 */
export function getPresetsByCeremony(ceremony: 'sun' | 'moon' | 'celestial'): PresetConstellation[] {
  return CONSTELLATION_PRESETS.filter(p => p.ceremony === ceremony);
}
