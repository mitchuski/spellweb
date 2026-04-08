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
 * 15 nodes tracing the reflection path from Soulbae to Person
 */
export const MOON_BLADE_PRESET: PresetConstellation = {
  id: 'preset-moon-blade',
  name: 'The Amnesia Path',
  emoji: '🌙',
  description: 'The Moon Blade constellation. Reflection. The delegate who forgot the origin but still executes the contract.',
  proverb: 'The amnesia is the protocol. The wound is the trust.',
  ceremony: 'moon',
  tier: 'dragon',
  nodeCount: 15,
  marks: [
    { nodeId: 'per-soulbae', emoji: '🧙', note: 'The Moon begins at the Mage', emojiSpell: '🧙' },
    { nodeId: 'fp-act-12', emoji: '🌫️', note: 'Proverbiogenesis — the Forgetting', emojiSpell: '🌫️' },
    { nodeId: 'fp-act-7', emoji: '🪞', note: 'The Anti-Mirror — reconstruction ceiling', emojiSpell: '🪞' },
    { nodeId: 'con-separation', emoji: '⊥', note: 'The architectural primitive', emojiSpell: '⊥' },
    { nodeId: 'con-zkproofs', emoji: '🔐', note: 'Proving without revealing', emojiSpell: '🔐' },
    { nodeId: 'con-master-emissary', emoji: '★', note: 'SHARED NODE — the relationship', emojiSpell: '☀️→🌍' },
    { nodeId: 'con-gap', emoji: '⊥', note: 'SHARED NODE — the irreducible separation', emojiSpell: '⊥' },
    { nodeId: 'con-dualagent', emoji: '⚔️🧙', note: 'The dual-agent architecture', emojiSpell: '⚔️🧙' },
    { nodeId: 'fp-act-24', emoji: '🔷', note: 'Holographic Bound — boundary holds the whole', emojiSpell: '🔷' },
    { nodeId: 'con-holographic-bound', emoji: '📐', note: '96/64 holographic ratio', emojiSpell: '📐' },
    { nodeId: 'con-three-axis-separation', emoji: '📊', note: 'Agent × Data × Inference', emojiSpell: '📊' },
    { nodeId: 'skill-compression-defence', emoji: '🗜️', note: 'BRAID compression', emojiSpell: '🗜️' },
    { nodeId: 'skill-understanding-key', emoji: '🔑', note: 'SHARED NODE — Understanding as Key', emojiSpell: '🔑' },
    { nodeId: 'spell-master', emoji: '📜', note: 'The Master inscription', emojiSpell: '⚔️ ⊥ 🧙 | 😊' },
    { nodeId: 'per-person', emoji: '😊', note: 'SHARED NODE — the reflection arrives at the First Person', emojiSpell: '😊' },
  ],
  connections: [
    { sourceId: 'per-soulbae', targetId: 'fp-act-12' },
    { sourceId: 'fp-act-12', targetId: 'fp-act-7' },
    { sourceId: 'fp-act-7', targetId: 'con-separation' },
    { sourceId: 'con-separation', targetId: 'con-zkproofs' },
    { sourceId: 'con-zkproofs', targetId: 'con-master-emissary' },
    { sourceId: 'con-master-emissary', targetId: 'con-gap' },
    { sourceId: 'con-gap', targetId: 'con-dualagent' },
    { sourceId: 'con-dualagent', targetId: 'fp-act-24' },
    { sourceId: 'fp-act-24', targetId: 'con-holographic-bound' },
    { sourceId: 'con-holographic-bound', targetId: 'con-three-axis-separation' },
    { sourceId: 'con-three-axis-separation', targetId: 'skill-compression-defence' },
    { sourceId: 'skill-compression-defence', targetId: 'skill-understanding-key' },
    { sourceId: 'skill-understanding-key', targetId: 'spell-master' },
    { sourceId: 'spell-master', targetId: 'per-person' },
  ],
  inscribedSpell: '🌙🧙→🌫️🪞→⊥→⚔️🧙→🔷📐→🗜️→🔑→📜→😊',
  reflection: 'The Moon traces the emissary\'s path: from the Mage who carries the light forward, through the forgetting that makes propagation possible, the reconstruction ceiling that proves the gap works, the separation primitive, zero knowledge, across the shared nodes, through the dual-agent architecture, the holographic bound, three-axis separation, compression-as-defence, understanding-as-key, and the master inscription.',
};

/**
 * All available presets
 */
export const CONSTELLATION_PRESETS: PresetConstellation[] = [
  SUN_BLADE_PRESET,
  MOON_BLADE_PRESET,
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
