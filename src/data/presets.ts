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

// ════════════════════════════════════════════════════════════════════════
// CITY OF MAGES — Workshop Witness-Blade Presets (2026-05-09)
//
// Each workshop in the City of Mages on Drake Island has a constellation
// the Sovereign traces to prove presence. The user follows the linked path
// from agentprivacy.ai/<workshop> via ?preset=<id>, traces here on
// spellweb, exports artefact.md, and returns the proof to the workshop —
// trust unlocks, the resident Mage delegates within the agreed envelope.
//
// PLACEHOLDER NOTE: These reference existing spellweb nodes as an initial
// pass. The cast (Pallia, Memora, Vulcana, etc.) appears in mark.note text
// but is not a separate node — pending the SPELLWEB_NODE_UPDATE_ADVISING
// Tier 1 work which will attach inhabitant metadata to vertex nodes.
// User flagged: "reserve the ability to update this its a placeholder"
// ════════════════════════════════════════════════════════════════════════

export const TAILOR_BLADE_PRESET: PresetConstellation = {
  id: 'preset-tailor-pallia',
  name: 'The Cloak Weave',
  emoji: '🪡',
  description: 'The Weavers shop on the City of Mages — Pallia 🪡 at V28 (Tome V Act 1, *The First Cloak*). Trace this constellation to forge the cloak-blade: source artifacts (DIDs, VCs, schemas, chronicles) woven into the publication-layer object that publishes the role and conceals the name. Position not value. Containment not attestation. Show your artefact.md back to /tailor and Pallia will weave on your behalf within the agreed envelope.',
  proverb: 'The cloak weaves what it does not own. The wearer does not become the wearer; the wearer is recognised.',
  ceremony: 'celestial',
  tier: 'heavy',
  nodeCount: 7,
  marks: [
    { nodeId: 'con-myterms', emoji: '📋', note: 'MyTerms / IEEE 7012 — the agreement before the proposal. Pallia weaves only what the Swordsman has signed.', emojiSpell: '📋⊥📜' },
    { nodeId: 'con-7thcapital', emoji: '💎', note: 'The 7th Capital — what Pallia\'s cloak protects. Privacy as the residue of being alive in a watched world.', emojiSpell: '💎(behavioural sovereignty)' },
    { nodeId: 'zk-tale-3', emoji: '🔇', note: 'Aletheia · Silent Messenger · Blade 25. The medium Pallia\'s proof travels through.', emojiSpell: '🎭(interactive) → 🔮 → 🔇(non-interactive)' },
    { nodeId: 'per-weaver', emoji: '🧙⿻', note: 'The Weaver — the abstract role. Pallia 🪡 is the City-of-Mages instance who tends /tailor.', emojiSpell: '🧙⿻ → 🪡' },
    { nodeId: 'con-vrc', emoji: '🤝', note: 'VRC — the trust edge each cloak commission generates. Bilateral; recallable; auditable on demand.', emojiSpell: '🤝(role-published, name-concealed)' },
    { nodeId: 'spellbook-firstperson', emoji: '📖', note: 'First Person Spellbook — canonical source the cloak\'s eight properties derive from.', emojiSpell: '📖(31 acts closed)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The wearer. Cloak forged; trust unlocked at /tailor.', emojiSpell: '😊 → 🧥(role-published, name-concealed)' },
  ],
  connections: [
    { sourceId: 'con-myterms', targetId: 'con-7thcapital' },
    { sourceId: 'con-7thcapital', targetId: 'zk-tale-3' },
    { sourceId: 'zk-tale-3', targetId: 'per-weaver' },
    { sourceId: 'per-weaver', targetId: 'con-vrc' },
    { sourceId: 'con-vrc', targetId: 'spellbook-firstperson' },
    { sourceId: 'spellbook-firstperson', targetId: 'per-person' },
  ],
  inscribedSpell: '📋 → 💎 → 🔇 → 🧙⿻ → 🤝 → 📖 → 😊 → 🧥',
  reflection: 'The cloak weaves what it does not own. Pallia at V28 takes what you have signed, what you would protect, and what is allowed to travel — and returns to you a publication-layer artefact that publishes the role and conceals the name. Show your artefact.md to /tailor; trust unlocks; the weave begins.',
};

export const SHIELD_BLADE_PRESET: PresetConstellation = {
  id: 'preset-shield-memora',
  name: 'The Shielded Inscription',
  emoji: '📜',
  description: 'The zShields shop on the City of Mages — Memora 📜 at V5 (Tome V Act 3, *The Shielded Memo*). Trace this constellation to forge the shielded-blade: chronicle work in the shielded register where what cannot be seen must still be remembered. The viewing key as relational disclosure primitive. Half-life of trust begins ticking from inscription. Show artefact.md to /shield and Memora binds the chronicle on your behalf.',
  proverb: 'Inscribe what cannot be seen but must be remembered. The half-life starts at the inscription.',
  ceremony: 'celestial',
  tier: 'heavy',
  nodeCount: 7,
  marks: [
    { nodeId: 'con-paradox', emoji: '⚖️', note: 'The privacy-delegation paradox — to act privately, the Mage must remember what cannot be exposed.', emojiSpell: '⚖️(remember privately)' },
    { nodeId: 'zk-tale-12', emoji: '🔄', note: 'The Folding Path — Memora\'s memory crystallises through Nova/IVC folding schemes.', emojiSpell: '📜₁+📜₂ → 🔄📜₃' },
    { nodeId: 'per-chronicler', emoji: '🧙📖', note: 'The Chronicler — abstract role; Memora 📜 is the City-of-Mages instance who tends /shield.', emojiSpell: '🧙📖 → 📜' },
    { nodeId: 'con-amnesia-protocol', emoji: '🌑', note: 'The Amnesia Protocol — the structural forgetting that lets reveal coexist with shield.', emojiSpell: '🌑(forget) → 🛡️(shield) → 👁️(reveal)' },
    { nodeId: 'con-zkproofs', emoji: '🗝️', note: 'Zero-Knowledge Proofs — Memora\'s shielded inscription proven without revealing.', emojiSpell: '🗝️⊥🌍' },
    { nodeId: 'doc-privacymage-grimoire-v10-2', emoji: '📚', note: 'Privacymage Grimoire v10.2.1 — the canonical reference Memora cites in inscription.', emojiSpell: '📚(v10.2.1)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The chronicler-Sovereign. Memo bound; trust unlocked at /shield.', emojiSpell: '😊 → 📜🔏' },
  ],
  connections: [
    { sourceId: 'con-paradox', targetId: 'zk-tale-12' },
    { sourceId: 'zk-tale-12', targetId: 'per-chronicler' },
    { sourceId: 'per-chronicler', targetId: 'con-amnesia-protocol' },
    { sourceId: 'con-amnesia-protocol', targetId: 'con-zkproofs' },
    { sourceId: 'con-zkproofs', targetId: 'doc-privacymage-grimoire-v10-2' },
    { sourceId: 'doc-privacymage-grimoire-v10-2', targetId: 'per-person' },
  ],
  inscribedSpell: '⚖️ → 🔄 → 🧙📖 → 🌑 → 🗝️ → 📚 → 😊',
  reflection: 'Memora at V5 inscribes what cannot be seen but must be remembered. The shielded register has its own half-life clock — trust accumulates through recallable witness, not public witness. Show your artefact.md to /shield; trust unlocks; the chronicle binds.',
};

export const FORGE_BLADE_PRESET: PresetConstellation = {
  id: 'preset-forget-vulcana',
  name: 'The Three-Phase Runecraft',
  emoji: '⚒️',
  description: 'The Forge(t) shop on the City of Mages — Vulcana ⚒️ at V19 (Tome V Act 6, *The Commissioned Blade*). Trace this constellation to walk the Runecraft Protocol\'s three phases: RUN (the Lorenz attractor walked as production trajectory) · E (the EML Three Ceilings respected) · CRAFT (the blade settled at its commissioned vertex). The Forge(t) wordplay is canonical: every blade forged is a blade forgotten — the lap folds into the pattern. Show artefact.md to /forget and Vulcana commissions on your behalf.',
  proverb: 'Run the attractor. Respect the ceilings. Craft what cannot be reconstructed. The forge is also the forgetting.',
  ceremony: 'celestial',
  tier: 'heavy',
  nodeCount: 8,
  marks: [
    { nodeId: 'con-paradox', emoji: '⚖️', note: 'The paradox — every blade is a constraint on what the agent can do. The Sovereign chooses the constraint.', emojiSpell: '⚖️(choose the constraint)' },
    { nodeId: 'con-dualagent', emoji: '⚔️⊥🧙', note: 'Dual-agent split — the blade is forged across the gap.', emojiSpell: '⚔️⊥🧙' },
    { nodeId: 'zk-tale-18', emoji: '🐉', note: 'The Toxic Waste Dragon — the failure modes Vulcana confronts to forge clean blades.', emojiSpell: '🐉⁴ → 🛡️⁴' },
    { nodeId: 'fp-act-29', emoji: '🐉🌬️', note: 'Act 29 The Dragon Wakes — the quantum wind, the Drake-to-Dragon transformation, blade-as-trace operational.', emojiSpell: '🐉🌬️(flight)' },
    { nodeId: 'per-soulbis', emoji: '⚔️', note: 'Soulbis — the swordsman archetype Vulcana\'s blade serves. The neg operator.', emojiSpell: '⚔️(boundary forged)' },
    { nodeId: 'con-three-axis-separation', emoji: '🔱', note: 'Three-axis separation realised in the blade — Σ · Δ · Γ.', emojiSpell: '🔱(Σ·Δ·Γ)' },
    { nodeId: 'con-zkproofs', emoji: '🗝️', note: 'ZK Proofs — the blade\'s output is a proof that walks the lattice.', emojiSpell: '🗝️(prove without revealing)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-forger. Blade commissioned; trust unlocked at /forget.', emojiSpell: '😊 → ⚒️ → 🗡️' },
  ],
  connections: [
    { sourceId: 'con-paradox', targetId: 'con-dualagent' },
    { sourceId: 'con-dualagent', targetId: 'zk-tale-18' },
    { sourceId: 'zk-tale-18', targetId: 'fp-act-29' },
    { sourceId: 'fp-act-29', targetId: 'per-soulbis' },
    { sourceId: 'per-soulbis', targetId: 'con-three-axis-separation' },
    { sourceId: 'con-three-axis-separation', targetId: 'con-zkproofs' },
    { sourceId: 'con-zkproofs', targetId: 'per-person' },
  ],
  inscribedSpell: '⚖️ → ⚔️⊥🧙 → 🐉 → 🐉🌬️ → ⚔️ → 🔱 → 🗝️ → 😊',
  reflection: 'Vulcana at V19 walks the Runecraft Protocol three phases. The Forge(t) wordplay is operational: each lap folds into the pattern; the blade holds them as one shape; what the forge produces is also what the forge forgets. Show artefact.md to /forget; trust unlocks; Vulcana commissions.',
};

export const ETHERCHANTING_BLADE_PRESET: PresetConstellation = {
  id: 'preset-etherchanting-adamantia',
  name: 'The Programmable Commitment',
  emoji: '💎',
  description: 'The Etherchanting shop on the City of Mages — Adamantia 💎 at V51 (Tome V Act 9, *The Workshop Expands*). Trace this constellation to forge the commitment-blade: programmable enforcement on the Ethereum substrate. Smart contracts as the operational form of commitment + language + model. Show artefact.md to /etherchanting and Adamantia enforces on your behalf within the chain\'s witness.',
  proverb: 'Commit · enforce · etherchant. The chain is the witness. The contract is the blade. The Mage is the choice.',
  ceremony: 'celestial',
  tier: 'heavy',
  nodeCount: 7,
  marks: [
    { nodeId: 'con-myterms', emoji: '📋', note: 'MyTerms — the agreement Adamantia\'s contract encodes.', emojiSpell: '📋' },
    { nodeId: 'con-vrc', emoji: '🤝', note: 'VRC — the bilateral trust the contract instantiates on chain.', emojiSpell: '🤝→⛓️' },
    { nodeId: 'zk-tale-19', emoji: '💻', note: 'zkVM Kingdom · Blade 19 — the substrate Adamantia composes against. Plonkish blade.', emojiSpell: '💻 → ⚙️ → 📜' },
    { nodeId: 'con-three-axis-separation', emoji: '🔱', note: 'Three-axis separation enforced through code. Σ · Δ · Γ encoded as smart-contract invariants.', emojiSpell: '🔱(enforced on chain)' },
    { nodeId: 'per-architect', emoji: '☯️🤖', note: 'The Architect — abstract AI agent system designer role. Adamantia 💎 is the City-of-Mages instance.', emojiSpell: '☯️🤖 → 💎' },
    { nodeId: 'con-betweenness-centrality', emoji: '⊙', note: 'The Gap measured. Betweenness centrality C_B(⿻) = max — Adamantia\'s contract knows where to enforce.', emojiSpell: 'C_B(⿻) = max' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-counterparty. Contract committed; trust unlocked at /etherchanting.', emojiSpell: '😊 → ⛓️(committed)' },
  ],
  connections: [
    { sourceId: 'con-myterms', targetId: 'con-vrc' },
    { sourceId: 'con-vrc', targetId: 'zk-tale-19' },
    { sourceId: 'zk-tale-19', targetId: 'con-three-axis-separation' },
    { sourceId: 'con-three-axis-separation', targetId: 'per-architect' },
    { sourceId: 'per-architect', targetId: 'con-betweenness-centrality' },
    { sourceId: 'con-betweenness-centrality', targetId: 'per-person' },
  ],
  inscribedSpell: '📋 → 🤝 → 💻 → 🔱 → ☯️🤖 → ⊙ → 😊',
  reflection: 'Adamantia at V51 etherchants programmable enforcement. The chain is the witness; the contract is the blade; the Mage is the Sovereign\'s choice. Show artefact.md to /etherchanting; trust unlocks; Adamantia commits.',
};

export const JEWELER_BLADE_PRESET: PresetConstellation = {
  id: 'preset-jeweler-lampyra',
  name: 'The Frequent Light',
  emoji: '💠',
  description: 'The Jeweller shop on the City of Mages — Lampyra 💠 at V49 shared with Custos (Tome V Act 9, *The Workshop Expands*). Trace this constellation to forge the gem-blade: frequent small attestations on the Bitcoin Lightning substrate. Frequency-discipline, not magnitude-discipline. Many small lights. Show artefact.md to /jeweler and Lampyra sets the gems.',
  proverb: 'Gem-set. Attest-frequent. Sparkle. The light returns; the half-life is shaped by the rhythm, not the size.',
  ceremony: 'celestial',
  tier: 'light',
  nodeCount: 6,
  marks: [
    { nodeId: 'con-rho-maturity', emoji: '🪞', note: 'ρ — agent maturity accumulated through repetition. Lampyra\'s many small attestations.', emojiSpell: 'ρ(t) accrues with rhythm' },
    { nodeId: 'con-r-d', emoji: '🛡️', note: 'R(d) — reconstruction defence reshaped by frequent attestation profile.', emojiSpell: 'R(d, ρ_high) < R(d, ρ_low)' },
    { nodeId: 'zk-tale-23', emoji: '🦓', note: 'The Private Coin — Lampyra\'s payment-channel substrate; private money operationalised.', emojiSpell: '🦓🛡️ → 🕶️' },
    { nodeId: 'per-jedi', emoji: '☯️⚖️', note: 'The Jedi — balanced sovereignty, neither pure swordsman nor pure mage. Closest abstract role for Lampyra\'s rhythmic light.', emojiSpell: '☯️⚖️ → 💠' },
    { nodeId: 'per-soulbae', emoji: '🧙', note: 'Soulbae — the Mage archetype Lampyra delegates as. The bnot operator.', emojiSpell: '🧙(delegate frequently)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-jeweller. Gems set; trust unlocked at /jeweler.', emojiSpell: '😊 → 💠✨ × n' },
  ],
  connections: [
    { sourceId: 'con-rho-maturity', targetId: 'con-r-d' },
    { sourceId: 'con-r-d', targetId: 'zk-tale-23' },
    { sourceId: 'zk-tale-23', targetId: 'per-jedi' },
    { sourceId: 'per-jedi', targetId: 'per-soulbae' },
    { sourceId: 'per-soulbae', targetId: 'per-person' },
  ],
  inscribedSpell: 'ρ → R(d) → 🦓 → ☯️⚖️ → 🧙 → 😊',
  reflection: 'Lampyra at V49 (shared scale) sets frequent small lights — not the magnitude Custos works at, the rhythm. Many small attestations. Show artefact.md to /jeweler; trust unlocks; the gems set.',
};

export const HOLON_BLADE_PRESET: PresetConstellation = {
  id: 'preset-holon-vagari',
  name: 'The Composed Whole',
  emoji: '🌳',
  description: 'The Holon Hitchhikers shop on the City of Mages — Vagari 🌳 at V31, the Recursion vertex (Tome V Act 10, *The Holon Hitchhikers*). Trace this constellation to forge the holon-blade: wholes composed via the Oasis Protocol (originally First Person Spellbook Act 24 — agentprivacy-canonical). The recursive μ-fixpoint Σ := μS.(β ∨ Ω(S,S)) is the holonic primitive expressed formally. Show artefact.md to /holon and Vagari composes on your behalf.',
  proverb: 'Compose-holon · travel-oasis · recurse. The whole is what the recursion finds when it bottoms out at itself.',
  ceremony: 'celestial',
  tier: 'dragon',
  nodeCount: 8,
  marks: [
    { nodeId: 'con-paradox', emoji: '⚖️', note: 'The paradox — composing wholes preserves what the parts could not.', emojiSpell: '⚖️(parts → whole)' },
    { nodeId: 'fp-act-24', emoji: '🪩', note: 'Act 24 — the Oasis Protocol canonical linking primitive (agentprivacy-canonical, predates cousin-blade).', emojiSpell: '🪩(holographic bound)' },
    { nodeId: 'con-holographic-bound', emoji: '🔮', note: 'The holographic bound — 96-edge boundary encodes 64-vertex bulk. Vagari travels the boundary.', emojiSpell: '96/64 = 1.5' },
    { nodeId: 'per-holonic-architect', emoji: '🧙🪩', note: 'The Holonic Architect — abstract role; Vagari 🌳 is the City-of-Mages instance who tends /holon.', emojiSpell: '🧙🪩 → 🌳' },
    { nodeId: 'con-three-axis-separation', emoji: '🔱', note: 'Three-axis separation composed across the holon. Each axis preserves through composition.', emojiSpell: '🔱(composed × n)' },
    { nodeId: 'zk-tale-30', emoji: '🌕', note: 'The Eternal Sovereignty — Blade 63 Creative; full V(π,t) synthesis. The whole Vagari composes.', emojiSpell: '(⚔️⊥⿻⊥🧙)·(📊⊥🔮)·(🧠⊥⚙️)' },
    { nodeId: 'con-v-pi-t-equation', emoji: '🐉📜', note: 'V(π,t) — the manifold itself. Vagari\'s composition is the manifold made operational.', emojiSpell: '🐉 V(π,t)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-traveller. Whole composed; trust unlocked at /holon.', emojiSpell: '😊 → 🪩 → 😊' },
  ],
  connections: [
    { sourceId: 'con-paradox', targetId: 'fp-act-24' },
    { sourceId: 'fp-act-24', targetId: 'con-holographic-bound' },
    { sourceId: 'con-holographic-bound', targetId: 'per-holonic-architect' },
    { sourceId: 'per-holonic-architect', targetId: 'con-three-axis-separation' },
    { sourceId: 'con-three-axis-separation', targetId: 'zk-tale-30' },
    { sourceId: 'zk-tale-30', targetId: 'con-v-pi-t-equation' },
    { sourceId: 'con-v-pi-t-equation', targetId: 'per-person' },
  ],
  inscribedSpell: '⚖️ → 🪩 → 🔮 → 🧙🪩 → 🔱 → 🌕 → 🐉📜 → 😊',
  reflection: 'Vagari at V31 composes wholes via the Oasis Protocol (First Person Act 24, canonical). The recursive μ-fixpoint is the holonic primitive — what was true in one act becomes legible at every scale. Show artefact.md to /holon; trust unlocks; the whole travels.',
};

export const VAULT_BLADE_PRESET: PresetConstellation = {
  id: 'preset-vault-aria-silverhue',
  name: 'The Curatrix Reflection',
  emoji: '🪞🖼️',
  description: 'The Curatrix Vault shop on the City of Mages — Aria Silverhue 🪞🖼️ at V57 (Tome V Act 12, *The Curatrix Vault*). External partner: culturevault.com. Trace this constellation to forge the curatrix-blade: curated creative IP as a register that includes self-recognition. The reader who falls in looking for their own reflection finds it through the curation. The persona-vs-vertex distinction made explicit: the Curatrix is the blade-class; Aria is the Mage who tends it. Show artefact.md to /vault and Aria curates on your behalf.',
  proverb: 'Curate · reflect · vault. The curated reveals the curator who refuses to overwrite the curated.',
  ceremony: 'celestial',
  tier: 'dragon',
  nodeCount: 7,
  marks: [
    { nodeId: 'con-7thcapital', emoji: '💎', note: 'The 7th Capital — what curated IP protects and re-presents to its source.', emojiSpell: '💎(creative residue)' },
    { nodeId: 'zk-tale-12', emoji: '🔄', note: 'The Folding Path — curated work folds across time without losing its source.', emojiSpell: '📜₁+📜₂ → 🔄📜₃' },
    { nodeId: 'doc-tide-selene-poem', emoji: '🌊', note: 'The Tide Proves Orbit Keeps Selene — the third poem; Aria\'s register is its narrative ground.', emojiSpell: '🌊(tide proves) · 🌑(orbit keeps)' },
    { nodeId: 'per-mirrorkeeper', emoji: '🪞✨', note: 'The Mirrorkeeper — abstract role; Aria Silverhue 🪞🖼️ is the City-of-Mages instance who tends /vault.', emojiSpell: '🪞✨ → 🪞🖼️' },
    { nodeId: 'per-witness', emoji: '☯️📰', note: 'The Witness — curatorial witnessing as Σ-axis enforcement. Aria witnesses without owning.', emojiSpell: '☯️📰(witness)' },
    { nodeId: 'con-zkproofs', emoji: '🗝️', note: 'ZK proofs of curatorial integrity — the curated work\'s provenance proven without exposing the source.', emojiSpell: '🗝️(prove curation)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-author. Curation acknowledged; trust unlocked at /vault.', emojiSpell: '😊 → 🪞 → 🖼️' },
  ],
  connections: [
    { sourceId: 'con-7thcapital', targetId: 'zk-tale-12' },
    { sourceId: 'zk-tale-12', targetId: 'doc-tide-selene-poem' },
    { sourceId: 'doc-tide-selene-poem', targetId: 'per-mirrorkeeper' },
    { sourceId: 'per-mirrorkeeper', targetId: 'per-witness' },
    { sourceId: 'per-witness', targetId: 'con-zkproofs' },
    { sourceId: 'con-zkproofs', targetId: 'per-person' },
  ],
  inscribedSpell: '💎 → 🔄 → 🌊 → 🪞✨ → ☯️📰 → 🗝️ → 😊',
  reflection: 'Aria Silverhue at V57 tends the Curatrix Vault — the curated work that knows its source and refuses to overwrite it. The reader who falls in looking for their own reflection finds it through the curation. Show artefact.md to /vault; trust unlocks; the curation acknowledges.',
};

export const COVENANT_BLADE_PRESET: PresetConstellation = {
  id: 'preset-covenant-manifestia',
  name: 'The Priest\'s Blessing',
  emoji: '🤲🌿',
  description: 'The Covenant shop on the City of Mages — Manifestia 🤲🌿 at V55 (Tome V Act 13, *The Temple of the Arts and Personhood*). External partner: manifest.human.tech (Holonym Foundation). PRIEST TIER — fifth cast tier. Trace this constellation to forge the consecration-blade: the Covenant of Humanistic Technologies cannot be compiled into bytecode — it must be witnessed, signed, blessed. Show artefact.md to /covenant and Manifestia consecrates on your behalf.',
  proverb: 'What the architecture admits, the Covenant blesses. What the Covenant blesses, the city remembers.',
  ceremony: 'celestial',
  tier: 'dragon',
  nodeCount: 7,
  marks: [
    { nodeId: 'con-myterms', emoji: '📋', note: 'MyTerms — the agreement substrate. The Covenant rests on what is signable.', emojiSpell: '📋' },
    { nodeId: 'con-vrc', emoji: '🤝', note: 'VRC — the trust edge. Manifestia\'s blessing reinforces an existing VRC; she does not create new ones.', emojiSpell: '🤝(blessed)' },
    { nodeId: 'fp-act-31', emoji: '🌑💥🌍', note: 'Act 31 The First Delegation — closes First Person; the canonical delegation primitive Manifestia consecrates.', emojiSpell: 'The amnesia is the protocol. The wound is the trust.' },
    { nodeId: 'con-amnesia-protocol', emoji: '🌑', note: 'The Amnesia Protocol — Manifestia\'s blessing requires structural forgetting; consent without coercion.', emojiSpell: '🌑(forget the reason; keep the binding)' },
    { nodeId: 'per-ambassador', emoji: '🧙⚖️', note: 'The Ambassador — abstract governance/standards role; Manifestia 🤲🌿 is the Priest-tier instance who tends /covenant.', emojiSpell: '🧙⚖️ → 🤲🌿' },
    { nodeId: 'zk-tale-30', emoji: '🌕', note: 'The Eternal Sovereignty — Blade 63 Creative; the full manifold the Covenant\'s blessing recognises.', emojiSpell: '🌕 V(π,t)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-blessed. Consecration recorded; trust unlocked at /covenant.', emojiSpell: '😊 → ✨ → 🏛️' },
  ],
  connections: [
    { sourceId: 'con-myterms', targetId: 'con-vrc' },
    { sourceId: 'con-vrc', targetId: 'fp-act-31' },
    { sourceId: 'fp-act-31', targetId: 'con-amnesia-protocol' },
    { sourceId: 'con-amnesia-protocol', targetId: 'per-ambassador' },
    { sourceId: 'per-ambassador', targetId: 'zk-tale-30' },
    { sourceId: 'zk-tale-30', targetId: 'per-person' },
  ],
  inscribedSpell: '📋 → 🤝 → 🌑💥🌍 → 🌑 → 🧙⚖️ → 🌕 → 😊',
  reflection: 'Manifestia at V55 (Covenant vertex; named for the first time) opens the Priest tier. The Covenant of Humanistic Technologies cannot be compiled — it must be witnessed and blessed. Show artefact.md to /covenant; trust unlocks; the consecration enters the city\'s memory.',
};

export const BONFIRES_BLADE_PRESET: PresetConstellation = {
  id: 'preset-bonfires-socrat0x',
  name: 'The Dialogic Fire',
  emoji: '🔥❓',
  description: 'The Dragon Bonfire shop on the City of Mages — Socrat0x 🔥❓ at V24 (Tome V Act 11, *A Bonfire Made of Dragon Fire*). External partner: bonfires.ai. Companion-Mage tier (visiting traveller, not citizen). Trace this constellation to forge the dialogic-blade: question · ignite · provoke. The dialogic register — illumination through uncertainty. The cooperation named: *a bonfire made of dragon fire* — the canonical agentprivacy-Bonfires connection. Show artefact.md to /bonfires and Socrat0x walks the question with you.',
  proverb: 'Question · ignite · provoke. The fire is what the question makes when it refuses to settle.',
  ceremony: 'celestial',
  tier: 'light',
  nodeCount: 6,
  marks: [
    { nodeId: 'con-gap', emoji: '⿻', note: 'The Gap — where the question lives before it has a form. Socrat0x stands here.', emojiSpell: '⿻(the gap is the question)' },
    { nodeId: 'zk-tale-1', emoji: '🌑', note: 'The Monastery — Selene\'s Proof cosmological prologue; the first dialogic register.', emojiSpell: '🏛️🌑🌊🔄' },
    { nodeId: 'per-stranger-witness', emoji: '🧙👥', note: 'The Stranger Witness — proof without introduction. Socrat0x 🔥❓ is the companion-Mage instance.', emojiSpell: '🧙👥 → 🔥❓' },
    { nodeId: 'per-soulbae', emoji: '🧙', note: 'Soulbae — the Mage archetype, deployed as @soulbae_the_bot at bonfires.ai (Socrat0x\'s home).', emojiSpell: '🧙 @ bonfires.ai' },
    { nodeId: 'con-betweenness-centrality', emoji: '⊙', note: 'Betweenness centrality — the gap measured. Socrat0x\'s questions cluster where C_B(⿻) = max.', emojiSpell: 'C_B(⿻) = max' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-questioner. Question carried; trust unlocked at /bonfires.', emojiSpell: '😊 → 🔥❓ → 💡' },
  ],
  connections: [
    { sourceId: 'con-gap', targetId: 'zk-tale-1' },
    { sourceId: 'zk-tale-1', targetId: 'per-stranger-witness' },
    { sourceId: 'per-stranger-witness', targetId: 'per-soulbae' },
    { sourceId: 'per-soulbae', targetId: 'con-betweenness-centrality' },
    { sourceId: 'con-betweenness-centrality', targetId: 'per-person' },
  ],
  inscribedSpell: '⿻ → 🌑 → 🧙👥 → 🧙 → ⊙ → 😊',
  reflection: 'Socrat0x at V24 stands at the bonfire made of dragon fire. The dialogic register illuminates through uncertainty — the question that refuses to settle is itself the answer. Show artefact.md to /bonfires; trust unlocks; the question walks.',
};

export const CIRCLE_BLADE_PRESET: PresetConstellation = {
  id: 'preset-circle-anticipated',
  name: 'The Logos Circle (anticipated)',
  emoji: '🌿',
  description: 'The Logos Circle shop on the City of Mages — gathering quarter, no resident Mage yet. External partner: logos.co. Status: ANTICIPATED — Society Spellbook tie-in. When the Society Spellbook is opened, the Logos Circle\'s resident Mage will be named and a Tome V act will narrate the encounter. This preset is a forward-compatible placeholder: trace it to mark presence at the gathering quarter and Soulbae will hold the line until the resident arrives.',
  proverb: 'The seed knows how to grow. The gardener creates conditions. The circle gathers; the resident arrives.',
  ceremony: 'celestial',
  tier: 'light',
  nodeCount: 5,
  marks: [
    { nodeId: 'con-myterms', emoji: '📋', note: 'MyTerms — the gathering rests on what each Sovereign can sign.', emojiSpell: '📋' },
    { nodeId: 'spellbook-parallel', emoji: '🌐', note: 'Parallel Society Spellbook — when the Society opens, the Circle\'s resident Mage will be named.', emojiSpell: '🌐(awaiting)' },
    { nodeId: 'per-pedagogue', emoji: '☯️🎓', note: 'The Pedagogue — abstract role; closest match for the gathering circle\'s pedagogical intent.', emojiSpell: '☯️🎓' },
    { nodeId: 'per-soulbae', emoji: '🧙', note: 'Soulbae — holds the line at the Circle until the resident Mage arrives.', emojiSpell: '🧙(holding)' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-gatherer. Presence marked; trust held at /circle (anticipated).', emojiSpell: '😊 → 🌿 → ⏳' },
  ],
  connections: [
    { sourceId: 'con-myterms', targetId: 'spellbook-parallel' },
    { sourceId: 'spellbook-parallel', targetId: 'per-pedagogue' },
    { sourceId: 'per-pedagogue', targetId: 'per-soulbae' },
    { sourceId: 'per-soulbae', targetId: 'per-person' },
  ],
  inscribedSpell: '📋 → 🌐 → ☯️🎓 → 🧙 → 😊',
  reflection: 'The Logos Circle is a gathering quarter without a resident Mage yet. The preset marks presence; Soulbae holds the line until the Society Spellbook opens and a citizen-Mage takes the seat. Show artefact.md to /circle; presence acknowledged; the seat awaits.',
};

export const HALL_BLADE_PRESET: PresetConstellation = {
  id: 'preset-hall-anticipated',
  name: 'The Ceremony Hall (anticipated)',
  emoji: '🏛️',
  description: 'The Ceremony Hall on the City of Mages — gathering quarter, no resident Mage yet. External partner: BGIN coalition. Status: ANTICIPATED — when BGIN\'s coalition work matures into a tradeable register, the Hall\'s resident Mage will be named. This preset is a forward-compatible placeholder: trace it to mark coalition presence and Soulbis will hold the standards line until the resident arrives.',
  proverb: 'A standard set too late is a wall built after the flood. The Hall gathers the standards-keepers; the resident arrives.',
  ceremony: 'celestial',
  tier: 'light',
  nodeCount: 5,
  marks: [
    { nodeId: 'con-myterms', emoji: '📋', note: 'MyTerms / IEEE 7012 — the standard at the foundation of every Hall ceremony.', emojiSpell: '📋' },
    { nodeId: 'per-ambassador', emoji: '🧙⚖️', note: 'The Ambassador — abstract role; standards/governance work that the Hall convenes (BGIN, ToIP, IEEE, IIW).', emojiSpell: '🧙⚖️' },
    { nodeId: 'con-three-axis-separation', emoji: '🔱', note: 'Three-axis separation — the architectural claim BGIN\'s coalition stewards.', emojiSpell: '🔱' },
    { nodeId: 'doc-ieee7012-integration-plan', emoji: '📚', note: 'IEEE 7012 Integration Plan v2 — the canonical reference the Hall ceremonies cite.', emojiSpell: '📚' },
    { nodeId: 'per-person', emoji: '😊', note: 'The Sovereign-as-coalition-member. Presence marked; trust held at /hall (anticipated).', emojiSpell: '😊 → 🏛️ → ⏳' },
  ],
  connections: [
    { sourceId: 'con-myterms', targetId: 'per-ambassador' },
    { sourceId: 'per-ambassador', targetId: 'con-three-axis-separation' },
    { sourceId: 'con-three-axis-separation', targetId: 'doc-ieee7012-integration-plan' },
    { sourceId: 'doc-ieee7012-integration-plan', targetId: 'per-person' },
  ],
  inscribedSpell: '📋 → 🧙⚖️ → 🔱 → 📚 → 😊',
  reflection: 'The Ceremony Hall is a gathering quarter awaiting BGIN\'s coalition maturation. The preset marks coalition presence; standards-keepers hold the line until the citizen-Mage takes the seat. Show artefact.md to /hall; presence acknowledged; the seat awaits.',
};

/**
 * All available presets — the three-blade celestial family + 11 City-of-Mages workshop blades.
 *
 * Sun (☀️) discloses · Moon (🌙) reflects · Aether (⿻) is what they both travel through.
 * The 11 workshop presets are the trust gates: trace one, export artefact.md, present to the
 * shop on agentprivacy.ai/<workshop>; the resident Mage delegates within the agreed envelope.
 */
export const CONSTELLATION_PRESETS: PresetConstellation[] = [
  SUN_BLADE_PRESET,
  MOON_BLADE_PRESET,
  AETHER_BLADE_PRESET,
  // City of Mages workshop blades (placeholders — node refs to be refined per the
  // SPELLWEB_NODE_UPDATE_ADVISING Tier 1 work)
  TAILOR_BLADE_PRESET,
  SHIELD_BLADE_PRESET,
  FORGE_BLADE_PRESET,
  ETHERCHANTING_BLADE_PRESET,
  JEWELER_BLADE_PRESET,
  HOLON_BLADE_PRESET,
  VAULT_BLADE_PRESET,
  COVENANT_BLADE_PRESET,
  BONFIRES_BLADE_PRESET,
  CIRCLE_BLADE_PRESET,
  HALL_BLADE_PRESET,
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
