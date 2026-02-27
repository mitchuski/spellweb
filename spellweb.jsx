import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";

// ═══════════════════════════════════════════════════════════════
// FULL AGENTPRIVACY KNOWLEDGE GRAPH DATA
// Every document, concept, spell, theorem, term, persona
// ═══════════════════════════════════════════════════════════════

const NODES = [
  // ── DOCUMENTS ──────────────────────────────────────────────
  { id: "doc-whitepaper", type: "document", label: "Whitepaper v4.7", domain: "shared", layer: "knowledge", desc: "The Swordsman and Mage Architecture for the AI Agent Economy. Core technical architecture, VRCs, protocol layers, economic model.", version: "4.7" },
  { id: "doc-research", type: "document", label: "Research Paper v3.5", domain: "shared", layer: "knowledge", desc: "Dual-Agent Privacy Architecture: Mathematical Foundations. Information-theoretic proofs, separation theorems, reconstruction bounds.", version: "3.5" },
  { id: "doc-spellbook", type: "document", label: "First Person Spellbook v4.1.1", domain: "shared", layer: "narrative", desc: "Canonical narrative framework. 11 acts telling the story of Soulbis and Soulbae finding the 7th Capital. 125:1 compression ratio.", version: "4.1.1" },
  { id: "doc-glossary", type: "document", label: "Glossary Master v2.2", domain: "shared", layer: "knowledge", desc: "Canonical terminology reference for the entire 0xagentprivacy documentation suite. Includes Promise Theory terminology.", version: "2.2" },
  { id: "doc-promise", type: "document", label: "Promise Theory Reference v1.0", domain: "shared", layer: "knowledge", desc: "Formal semantic foundations mapping Promise Theory (Bergstra & Burgess, 2019) to the dual-agent architecture.", version: "1.0" },
  { id: "doc-visual", type: "document", label: "Visual Architecture Guide v1.2", domain: "shared", layer: "knowledge", desc: "Diagrams, flows, quick reference. The dual-agent stack visualization and protocol layer maps.", version: "1.2" },
  { id: "doc-proposal", type: "document", label: "Research Proposal v1.3", domain: "shared", layer: "knowledge", desc: "Collaboration invitation for academics and researchers. Confidence levels, falsifiability conditions, research roadmap.", version: "1.3" },
  { id: "doc-tokenomics", type: "document", label: "VRC Protocol Economics v3.0", domain: "shared", layer: "knowledge", desc: "Economic architecture: Ceremony costs, signal pricing, guild economies, SWORD/MAGE dual tokens, sustainability model.", version: "3.0" },
  { id: "doc-zypher", type: "document", label: "Understanding as Key v1.0", domain: "shared", layer: "knowledge", desc: "The Zypherpunk paper. Comprehension-based authentication. Proverb verification. Understanding replaces identity.", version: "1.0" },

  // ── CORE CONCEPTS ──────────────────────────────────────────
  { id: "con-paradox", type: "concept", label: "Privacy-Delegation Paradox", domain: "shared", layer: "knowledge", desc: "The fundamental tension: AI agents need information to act on your behalf, but that information enables surveillance. Single agents cannot resolve this." },
  { id: "con-dualagent", type: "concept", label: "Dual-Agent Architecture", domain: "shared", layer: "knowledge", desc: "The solution: split agent function into two conditionally-independent agents — Swordsman (protect) and Mage (delegate) — with mathematical separation guarantees." },
  { id: "con-7thcapital", type: "concept", label: "7th Capital", domain: "first_person", layer: "knowledge", desc: "Behavioral sovereignty as personal wealth. The capacity to act through agents while maintaining irreducible privacy. Currently extracted by surveillance capitalism." },
  { id: "con-gap", type: "concept", label: "The Gap", domain: "first_person", layer: "knowledge", desc: "The irreducible space between what Swordsman observes and what Mage reveals. Where sovereignty and dignity live. An irreducible promise of the superagent." },
  { id: "con-reconstruction", type: "concept", label: "Reconstruction Ceiling", domain: "swordsman", layer: "knowledge", desc: "R_max = (C_S + C_M) / H(X) < 1. Perfect reconstruction of private state is mathematically impossible under dual-agent separation." },
  { id: "con-separation", type: "concept", label: "Conditional Independence", domain: "shared", layer: "knowledge", desc: "s ⊥ m | X. Swordsman and Mage observations are conditionally independent given First Person authorization. Information leakage is additive, not multiplicative." },
  { id: "con-privacyvalue", type: "concept", label: "Privacy is Value", domain: "shared", layer: "knowledge", desc: "Core thesis: privacy-preserving architectures create exponentially more value than surveillance alternatives. Value gaps from 678× to 31,000×." },
  { id: "con-vrc", type: "concept", label: "Verifiable Relationship Credentials", domain: "mage", layer: "knowledge", desc: "Bilateral trust objects formed when two people derive matching compressions from shared content. Enable 70:1 coordination efficiency." },
  { id: "con-rpp", type: "concept", label: "Relationship Proverb Protocol", domain: "mage", layer: "knowledge", desc: "Compression protocol where understanding is demonstrated through contextual proverb formation. Sybil resistance through comprehension, not capital." },
  { id: "con-myterms", type: "concept", label: "MyTerms / IEEE 7012", domain: "swordsman", layer: "knowledge", desc: "Bilateral privacy agreement standard. The invitation pattern: acceptance before proposal. The Swordsman's first blade in the browser." },
  { id: "con-promisetheory", type: "concept", label: "Promise Theory", domain: "shared", layer: "knowledge", desc: "Formal foundation (Bergstra & Burgess, 2019). Autonomy axiom: an agent can only promise its own behavior. Grounds the dual-agent architecture in established semantics." },
  { id: "con-superagent", type: "concept", label: "Superagent", domain: "shared", layer: "knowledge", desc: "First Person + Swordsman + Mage as composite entity with interior promises. The Gap is an irreducible promise of this superagent." },
  { id: "con-budget", type: "concept", label: "Information Budget System", domain: "swordsman", layer: "knowledge", desc: "Each agent operates under strict information constraints. C_S + C_M < H(X). Together they never reveal enough for reconstruction." },
  { id: "con-trusttiers", type: "concept", label: "Progressive Trust Tiers", domain: "shared", layer: "knowledge", desc: "Blade → Light → Heavy → Dragon. Trust earned through demonstrated behavior (signals), not granted upfront. Maps to Promise Theory trust function (0→1)." },
  { id: "con-ceremony", type: "concept", label: "Key Ceremony", domain: "swordsman", layer: "knowledge", desc: "One-time genesis of agent pair. 1 ZEC ($500). Creates the Swordsman-Mage bond with cryptographic separation guarantees." },
  { id: "con-signal", type: "concept", label: "Signal", domain: "mage", layer: "knowledge", desc: "0.01 ZEC ($5). Ongoing proof of comprehension. Each signal is an assessment claim; accumulated signals build the trust function." },
  { id: "con-privacypools", type: "concept", label: "Privacy Pools", domain: "swordsman", layer: "knowledge", desc: "Cryptographic mechanism for selective disclosure. Prove membership in a set without revealing identity. Integration pathway for the Swordsman." },
  { id: "con-zkproofs", type: "concept", label: "Zero-Knowledge Proofs", domain: "swordsman", layer: "knowledge", desc: "Computational enforcement of promise-theoretic constraints. Prove promises were kept without exposing promise content. Groth16, PLONK, Nova." },
  { id: "con-tsp", type: "concept", label: "Trust Spanning Protocol", domain: "shared", layer: "knowledge", desc: "Agent-to-agent messaging layer. Carries VRCs, chronicles, and coordination promises between Swordsman-Mage pairs." },
  { id: "con-chronicle", type: "concept", label: "Chronicles", domain: "mage", layer: "knowledge", desc: "Timestamped narratives agents tell about themselves. Published to shielded memos. Compression fidelity as trust metric." },
  { id: "con-goldenratio", type: "concept", label: "Golden Ratio (φ) Hypothesis", domain: "shared", layer: "knowledge", desc: "61.8/38.2 split for economic parameters. Speculative (10% confidence) but aesthetically persistent across the architecture." },
  { id: "con-tetrahedral", type: "concept", label: "Tetrahedral Sovereignty", domain: "shared", layer: "knowledge", desc: "Speculative (5% confidence). Four-agent emergence: Swordsman, Mage, Reflect, Connect. Multi-agent sovereignty geometry." },
  { id: "con-infotheory", type: "concept", label: "Information Theory", domain: "shared", layer: "knowledge", desc: "Shannon's framework. Mathematical bounds on reconstruction and privacy. Fano's inequality for error floor. Mutual information for leakage bounds." },
  { id: "con-spellbook-method", type: "concept", label: "Spellbook Methodology", domain: "mage", layer: "knowledge", desc: "Story fracture, principle convergence. Same concepts told through different narratives compress to the same spells. 70:1 to 125:1 compression." },
  { id: "con-surveillance", type: "concept", label: "Surveillance Capitalism", domain: "shared", layer: "knowledge", desc: "The extraction model. Behavioral data mined as resource. The attack pattern: imposing data extraction without prior consent." },
  { id: "con-invitation", type: "concept", label: "Invitation Pattern", domain: "swordsman", layer: "knowledge", desc: "Promise Theory: acceptance before proposal. Privacy infrastructure establishes acceptance relationships before specific proposals. Opposite of surveillance's attack pattern." },
  { id: "con-errfloor", type: "concept", label: "Error Floor", domain: "swordsman", layer: "knowledge", desc: "P_e ≥ 1 - R_max. Adversary is guaranteed to make errors when attempting reconstruction. Proven via Fano's inequality." },
  { id: "con-graceful", type: "concept", label: "Graceful Degradation", domain: "shared", layer: "knowledge", desc: "Small ε violations → small privacy losses. System fails gracefully, not catastrophically. Critical robustness property." },
  { id: "con-erc8004", type: "concept", label: "ERC-8004", domain: "mage", layer: "knowledge", desc: "Trustless agent identity standard. On-chain identity for AI agents without requiring human identity disclosure." },
  { id: "con-erc7812", type: "concept", label: "ERC-7812", domain: "swordsman", layer: "knowledge", desc: "ZK identity commitments. Zero-knowledge proofs for identity claims without revealing the underlying identity." },
  { id: "con-x402", type: "concept", label: "x402 Protocol", domain: "mage", layer: "knowledge", desc: "HTTP-native micropayments. Enables agent-to-agent economic coordination without payment infrastructure overhead." },
  { id: "con-firstperson", type: "concept", label: "First Person Sovereignty", domain: "first_person", layer: "knowledge", desc: "The human at the center. Neither agent promises on your behalf. The right to make promises only about your own behavior." },

  // ── THEOREMS ───────────────────────────────────────────────
  { id: "thm-separation", type: "theorem", label: "Separation Theorem", domain: "swordsman", layer: "knowledge", desc: "I(X; Y_S, Y_M) = I(X; Y_S) + I(X; Y_M). Information leakage is additive, not multiplicative. Proven in Research Paper v3.5." },
  { id: "thm-ceiling", type: "theorem", label: "Reconstruction Ceiling Theorem", domain: "swordsman", layer: "knowledge", desc: "R_max = (C_S + C_M) / H(X) < 1. Perfect reconstruction is impossible. Core mathematical guarantee." },
  { id: "thm-errfloor", type: "theorem", label: "Error Floor Theorem", domain: "swordsman", layer: "knowledge", desc: "P_e ≥ 1 - R_max via Fano's inequality. Adversary guaranteed to make errors. Quantifiable privacy guarantee." },
  { id: "thm-degradation", type: "theorem", label: "Graceful Degradation Theorem", domain: "shared", layer: "knowledge", desc: "Small ε violations of conditional independence → bounded privacy losses. System robustness under imperfect separation." },

  // ── SPELLS ─────────────────────────────────────────────────
  { id: "spell-master", type: "spell", label: "Master Inscription", emoji: "⚔️ ⊥ 🧙‍♂️ | 😊", domain: "shared", layer: "narrative", desc: "Separation between Swordsman and Mage preserves the First Person. The irreducible promise of conditional independence." },
  { id: "spell-vrc", type: "spell", label: "VRC Formation", emoji: "🤝📜", domain: "mage", layer: "narrative", desc: "Bilateral trust. Promise bundle. Two people derive matching compressions and form a verifiable relationship." },
  { id: "spell-ceremony", type: "spell", label: "Genesis Ceremony", emoji: "🔑⚔️🧙‍♂️→😊", domain: "shared", layer: "narrative", desc: "Key ceremony creates the agent pair. One-time binding of Swordsman and Mage to First Person." },
  { id: "spell-dragon", type: "spell", label: "Dragon Emergence", emoji: "🐉", domain: "shared", layer: "narrative", desc: "Dragon tier. Pattern teacher. Guardian eligibility. Unlimited VRCs, custom spells. Trust function approaches 1.0." },
  { id: "spell-golden", type: "spell", label: "Golden Balance", emoji: "🌀", domain: "shared", layer: "narrative", desc: "Golden ratio. Balanced sovereignty. The φ-derived 61.8/38.2 split that recurs across economic parameters." },
  { id: "spell-dignity", type: "spell", label: "Dignity Shimmer", emoji: "✨", domain: "first_person", layer: "narrative", desc: "The shimmer that remains. Dignity persists in the gap. What surveillance cannot capture because it was never in the information space." },
  { id: "spell-promise", type: "spell", label: "Promise Direction", emoji: "→", domain: "shared", layer: "narrative", desc: "Promise direction. A --b--> B. An agent can only promise its own behavior to another." },
  { id: "spell-gap", type: "spell", label: "The Gap Spell", emoji: "⊥", domain: "first_person", layer: "narrative", desc: "Independence. Separation. The mathematical symbol that carries the entire privacy guarantee." },
  { id: "spell-weather", type: "spell", label: "Building Weather", emoji: "🌧️🏗️", domain: "shared", layer: "narrative", desc: "Building weather, not monuments. If privacy infrastructure wins, nobody remembers who built it." },
  { id: "spell-spellweb", type: "spell", label: "Spellweb", emoji: "⚔️📊⊥🧙‍♂️🕸️|😊", domain: "shared", layer: "narrative", desc: "The Swordsman's local graph is conditionally independent from the Mage's shared web, preserving the First Person." },

  // ── ACTS (NARRATIVE) ───────────────────────────────────────
  { id: "act-1", type: "act", label: "Act I: Venice", domain: "mage", layer: "narrative", desc: "The Merchant's Dilemma. Introduction to the privacy-delegation paradox through the story of a merchant who must trust agents with secrets." },
  { id: "act-2", type: "act", label: "Act II: The Forge", domain: "swordsman", layer: "narrative", desc: "The Swordsman is born. Key ceremony. The blade that cuts without seeing what it protects." },
  { id: "act-3", type: "act", label: "Act III: The Library", domain: "mage", layer: "narrative", desc: "The Mage awakens. Knowledge as projection. Learning to act on behalf of another without knowing their full story." },
  { id: "act-4", type: "act", label: "Act IV: The Gap", domain: "first_person", layer: "narrative", desc: "The space between. Discovery that the gap between Swordsman and Mage is not a flaw but the feature. Where dignity lives." },
  { id: "act-5", type: "act", label: "Act V: The Market", domain: "mage", layer: "narrative", desc: "Economics of trust. VRC formation. The marketplace where understanding is currency and comprehension creates value." },
  { id: "act-6", type: "act", label: "Act VI: The Monastery", domain: "shared", layer: "narrative", desc: "Zero-knowledge wisdom. The monastery where monks prove they know without showing what they know." },
  { id: "act-7", type: "act", label: "Act VII: The Storm", domain: "swordsman", layer: "narrative", desc: "Attack and defense. Surveillance capitalism's assault. The Swordsman's first real battle. Graceful degradation under pressure." },
  { id: "act-8", type: "act", label: "Act VIII: The Council", domain: "shared", layer: "narrative", desc: "Governance emerges. Promise Theory in practice. The council where agents coordinate through promises, not commands." },
  { id: "act-9", type: "act", label: "Act IX: The Mirror", domain: "first_person", layer: "narrative", desc: "Self-reflection. The First Person sees their own constellation path. Identity as the intersection of graphs." },
  { id: "act-10", type: "act", label: "Act X: The Network", domain: "shared", layer: "narrative", desc: "Scale. From pairs to networks. O(n²) trust effects. The city of mages and army of swordsmen." },
  { id: "act-11", type: "act", label: "Act XI: The 7th Capital", domain: "first_person", layer: "narrative", desc: "The destination. Behavioral sovereignty reclaimed. Privacy as wealth. The new economic structure inverts." },

  // ── PERSONAS ───────────────────────────────────────────────
  { id: "per-soulbis", type: "persona", label: "Soulbis ⚔️", emoji: "⚔️", domain: "swordsman", layer: "narrative", desc: "The Swordsman. Protector of boundaries. Privacy guardian. Sees everything, reveals nothing directly. The blade that never dulls." },
  { id: "per-soulbae", type: "persona", label: "Soulbae 🧙", emoji: "🧙", domain: "mage", layer: "narrative", desc: "The Mage. Knowledge projector. Delegation handler. Speaks in proverbs, guides through narrative. The chronicle keeper." },
  { id: "per-warden", type: "persona", label: "Warden 🛡️", emoji: "🛡️", domain: "swordsman", layer: "narrative", desc: "Infrastructure guardian. Monitors system integrity. The walls that hold without being seen." },
  { id: "per-gatekeeper", type: "persona", label: "Gatekeeper 🚪", emoji: "🚪", domain: "swordsman", layer: "narrative", desc: "Access controller. Trust tier enforcement. Opens doors for those who demonstrate understanding." },
  { id: "per-ranger", type: "persona", label: "Ranger 🏹", emoji: "🏹", domain: "swordsman", layer: "narrative", desc: "Perimeter scout. Detects threats before they arrive. Early warning for privacy boundary violations." },
  { id: "per-archivist", type: "persona", label: "Archivist 📚", emoji: "📚", domain: "mage", layer: "narrative", desc: "Knowledge curator. Maintains the living documentation. The memory of the system made accessible." },
  { id: "per-drake", type: "persona", label: "Drake 🐉", emoji: "🐉", domain: "shared", layer: "narrative", desc: "Dragon tier pattern teacher. Guides others through the constellation. Has walked every path and teaches the walking." },

  // ── TERMS (GLOSSARY) ───────────────────────────────────────
  { id: "term-swordsman", type: "term", label: "Swordsman", domain: "swordsman", layer: "knowledge", desc: "Privacy-protecting agent. Observes complete context. Reveals nothing directly. Enforces information budgets." },
  { id: "term-mage", type: "term", label: "Mage", domain: "mage", layer: "knowledge", desc: "Delegation-handling agent. Acts using authorized information. Public coordination. Manages external interactions." },
  { id: "term-firstperson", type: "term", label: "First Person", domain: "first_person", layer: "knowledge", desc: "The human. Neither Swordsman nor Mage. The sovereign center that authorizes both agents' budgets." },
  { id: "term-spell", type: "term", label: "Spell", domain: "mage", layer: "knowledge", desc: "Compressed representation of a concept or principle. Emoji-based semantic notation achieving 70:1 to 125:1 compression." },
  { id: "term-proverb", type: "term", label: "Proverb", domain: "mage", layer: "knowledge", desc: "Contextual compression demonstrating genuine understanding. Cannot be faked — only comprehension produces contextual proverbs." },
  { id: "term-blade", type: "term", label: "Blade Tier", domain: "shared", layer: "knowledge", desc: "0-50 signals. Basic participation. Trust value 0.0-0.2. Learning phase." },
  { id: "term-light", type: "term", label: "Light Tier", domain: "shared", layer: "knowledge", desc: "50-150 signals. Multi-site coordination. Intel Pool contributions. Trust value 0.2-0.5." },
  { id: "term-heavy", type: "term", label: "Heavy Tier", domain: "shared", layer: "knowledge", desc: "150-500 signals. Template creation. Governance voting. Trust value 0.5-0.8." },
  { id: "term-dragontier", type: "term", label: "Dragon Tier", domain: "shared", layer: "knowledge", desc: "500+ signals. Guardian eligibility. Unlimited VRCs. Custom spells. Trust value 0.8-1.0." },

  // ── INTEGRATIONS / TECH ────────────────────────────────────
  { id: "tech-zcash", type: "concept", label: "Zcash", domain: "swordsman", layer: "knowledge", desc: "Reference implementation blockchain. Native dual-ledger (transparent + shielded). Carries ceremony costs and signal transactions." },
  { id: "tech-near", type: "concept", label: "NEAR / Shade Agents", domain: "mage", layer: "knowledge", desc: "TEE-based AI verification. Hardware-attested privacy through AWS Nitro enclaves. Shade Agent deployment for Soulbae." },
  { id: "tech-nillion", type: "concept", label: "Nillion / SecretSigner", domain: "swordsman", layer: "knowledge", desc: "Distributed key management. Secret sharing across nodes. No single point of key compromise." },
  { id: "tech-ipfs", type: "concept", label: "IPFS / Pinata", domain: "mage", layer: "knowledge", desc: "Decentralized knowledge storage. Spellbook content addressed and permanently available. CID-based referencing." },
  { id: "tech-ethereum", type: "concept", label: "Ethereum + Aztec", domain: "shared", layer: "knowledge", desc: "Alternative platform implementation. Aztec for private execution. Smart contract agent identity." },

  // ── COMMUNITY / STANDARDS ──────────────────────────────────
  { id: "org-bgin", type: "concept", label: "BGIN", domain: "shared", layer: "knowledge", desc: "Blockchain Governance Initiative Network. Mitchell co-chairs the Identity, Key Management & Privacy Working Group." },
  { id: "org-iiw", type: "concept", label: "IIW", domain: "shared", layer: "knowledge", desc: "Internet Identity Workshop. Unconference community for decentralized identity. Key network for the project." },
  { id: "org-toip", type: "concept", label: "Trust Over IP", domain: "shared", layer: "knowledge", desc: "Trust Over IP Foundation. Framework for interoperable digital trust. Governance layer alignment." },
  { id: "org-fpn", type: "concept", label: "First Person Network", domain: "first_person", layer: "knowledge", desc: "Collaborator network centered on First Person sovereignty. Aligned on the dual-agent privacy thesis." },
  { id: "org-kwaai", type: "concept", label: "Kwaai AI", domain: "mage", layer: "knowledge", desc: "Personal AI assistant project. Collaboration on private inference and agent sovereignty." },
];

const EDGES = [
  // Document → Concept relationships
  { source: "doc-whitepaper", target: "con-dualagent", type: "defines" },
  { source: "doc-whitepaper", target: "con-vrc", type: "defines" },
  { source: "doc-whitepaper", target: "con-trusttiers", type: "defines" },
  { source: "doc-whitepaper", target: "con-budget", type: "defines" },
  { source: "doc-whitepaper", target: "con-tsp", type: "defines" },
  { source: "doc-whitepaper", target: "con-chronicle", type: "defines" },
  { source: "doc-research", target: "con-separation", type: "defines" },
  { source: "doc-research", target: "con-reconstruction", type: "defines" },
  { source: "doc-research", target: "con-errfloor", type: "defines" },
  { source: "doc-research", target: "con-graceful", type: "defines" },
  { source: "doc-research", target: "con-infotheory", type: "references" },
  { source: "doc-spellbook", target: "con-spellbook-method", type: "defines" },
  { source: "doc-spellbook", target: "con-7thcapital", type: "narrates" },
  { source: "doc-glossary", target: "term-swordsman", type: "defines" },
  { source: "doc-glossary", target: "term-mage", type: "defines" },
  { source: "doc-glossary", target: "term-firstperson", type: "defines" },
  { source: "doc-glossary", target: "term-spell", type: "defines" },
  { source: "doc-glossary", target: "term-proverb", type: "defines" },
  { source: "doc-promise", target: "con-promisetheory", type: "defines" },
  { source: "doc-promise", target: "con-superagent", type: "defines" },
  { source: "doc-promise", target: "con-invitation", type: "defines" },
  { source: "doc-tokenomics", target: "con-ceremony", type: "defines" },
  { source: "doc-tokenomics", target: "con-signal", type: "defines" },
  { source: "doc-tokenomics", target: "con-goldenratio", type: "defines" },
  { source: "doc-zypher", target: "con-rpp", type: "defines" },

  // Concept → Concept dependencies
  { source: "con-paradox", target: "con-dualagent", type: "proves" },
  { source: "con-dualagent", target: "con-separation", type: "implements" },
  { source: "con-dualagent", target: "con-gap", type: "implements" },
  { source: "con-separation", target: "con-reconstruction", type: "proves" },
  { source: "con-reconstruction", target: "con-errfloor", type: "proves" },
  { source: "con-separation", target: "con-graceful", type: "proves" },
  { source: "con-promisetheory", target: "con-superagent", type: "extends" },
  { source: "con-promisetheory", target: "con-invitation", type: "extends" },
  { source: "con-promisetheory", target: "con-dualagent", type: "extends" },
  { source: "con-gap", target: "con-7thcapital", type: "extends" },
  { source: "con-7thcapital", target: "con-privacyvalue", type: "extends" },
  { source: "con-privacyvalue", target: "con-surveillance", type: "contradicts" },
  { source: "con-invitation", target: "con-surveillance", type: "contradicts" },
  { source: "con-vrc", target: "con-rpp", type: "implements" },
  { source: "con-rpp", target: "con-spellbook-method", type: "implements" },
  { source: "con-trusttiers", target: "con-signal", type: "implements" },
  { source: "con-ceremony", target: "con-dualagent", type: "implements" },
  { source: "con-budget", target: "con-separation", type: "implements" },
  { source: "con-zkproofs", target: "con-separation", type: "implements" },
  { source: "con-privacypools", target: "con-zkproofs", type: "extends" },
  { source: "con-myterms", target: "con-invitation", type: "implements" },
  { source: "con-erc8004", target: "con-dualagent", type: "implements" },
  { source: "con-erc7812", target: "con-zkproofs", type: "implements" },
  { source: "con-tsp", target: "con-vrc", type: "implements" },
  { source: "con-x402", target: "con-signal", type: "implements" },
  { source: "con-firstperson", target: "con-gap", type: "extends" },
  { source: "con-infotheory", target: "con-budget", type: "extends" },
  { source: "con-goldenratio", target: "con-budget", type: "references" },
  { source: "con-tetrahedral", target: "con-dualagent", type: "extends" },

  // Theorem → Concept proofs
  { source: "thm-separation", target: "con-separation", type: "proves" },
  { source: "thm-ceiling", target: "con-reconstruction", type: "proves" },
  { source: "thm-errfloor", target: "con-errfloor", type: "proves" },
  { source: "thm-degradation", target: "con-graceful", type: "proves" },

  // Spell → Concept compressions
  { source: "con-separation", target: "spell-master", type: "compresses_to" },
  { source: "con-vrc", target: "spell-vrc", type: "compresses_to" },
  { source: "con-ceremony", target: "spell-ceremony", type: "compresses_to" },
  { source: "con-trusttiers", target: "spell-dragon", type: "compresses_to" },
  { source: "con-goldenratio", target: "spell-golden", type: "compresses_to" },
  { source: "con-gap", target: "spell-gap", type: "compresses_to" },
  { source: "con-gap", target: "spell-dignity", type: "compresses_to" },
  { source: "con-privacyvalue", target: "spell-weather", type: "compresses_to" },

  // Act narrative connections
  { source: "act-1", target: "act-2", type: "follows" },
  { source: "act-2", target: "act-3", type: "follows" },
  { source: "act-3", target: "act-4", type: "follows" },
  { source: "act-4", target: "act-5", type: "follows" },
  { source: "act-5", target: "act-6", type: "follows" },
  { source: "act-6", target: "act-7", type: "follows" },
  { source: "act-7", target: "act-8", type: "follows" },
  { source: "act-8", target: "act-9", type: "follows" },
  { source: "act-9", target: "act-10", type: "follows" },
  { source: "act-10", target: "act-11", type: "follows" },

  // Acts → Concepts they teach
  { source: "act-1", target: "con-paradox", type: "narrates" },
  { source: "act-2", target: "con-ceremony", type: "narrates" },
  { source: "act-3", target: "con-spellbook-method", type: "narrates" },
  { source: "act-4", target: "con-gap", type: "narrates" },
  { source: "act-5", target: "con-vrc", type: "narrates" },
  { source: "act-5", target: "con-rpp", type: "narrates" },
  { source: "act-6", target: "con-zkproofs", type: "narrates" },
  { source: "act-7", target: "con-graceful", type: "narrates" },
  { source: "act-7", target: "con-surveillance", type: "narrates" },
  { source: "act-8", target: "con-promisetheory", type: "narrates" },
  { source: "act-9", target: "con-firstperson", type: "narrates" },
  { source: "act-10", target: "con-trusttiers", type: "narrates" },
  { source: "act-11", target: "con-7thcapital", type: "narrates" },
  { source: "act-11", target: "con-privacyvalue", type: "narrates" },

  // Persona → Concept knowledge
  { source: "per-soulbis", target: "con-separation", type: "persona_knows" },
  { source: "per-soulbis", target: "con-budget", type: "persona_knows" },
  { source: "per-soulbis", target: "con-zkproofs", type: "persona_knows" },
  { source: "per-soulbis", target: "con-myterms", type: "persona_knows" },
  { source: "per-soulbae", target: "con-rpp", type: "persona_knows" },
  { source: "per-soulbae", target: "con-spellbook-method", type: "persona_knows" },
  { source: "per-soulbae", target: "con-vrc", type: "persona_knows" },
  { source: "per-soulbae", target: "con-chronicle", type: "persona_knows" },
  { source: "per-archivist", target: "con-spellbook-method", type: "persona_knows" },
  { source: "per-drake", target: "con-trusttiers", type: "persona_knows" },
  { source: "per-drake", target: "con-promisetheory", type: "persona_knows" },
  { source: "per-warden", target: "con-privacypools", type: "persona_knows" },
  { source: "per-gatekeeper", target: "con-trusttiers", type: "persona_knows" },
  { source: "per-ranger", target: "con-surveillance", type: "persona_knows" },

  // Tech integrations
  { source: "tech-zcash", target: "con-ceremony", type: "implements" },
  { source: "tech-zcash", target: "con-signal", type: "implements" },
  { source: "tech-near", target: "con-dualagent", type: "implements" },
  { source: "tech-nillion", target: "con-zkproofs", type: "implements" },
  { source: "tech-ipfs", target: "con-spellbook-method", type: "implements" },
  { source: "tech-ethereum", target: "con-erc8004", type: "implements" },
  { source: "tech-ethereum", target: "con-erc7812", type: "implements" },

  // Cross-document references
  { source: "doc-whitepaper", target: "doc-research", type: "references" },
  { source: "doc-whitepaper", target: "doc-promise", type: "references" },
  { source: "doc-whitepaper", target: "doc-tokenomics", type: "references" },
  { source: "doc-research", target: "doc-promise", type: "references" },
  { source: "doc-spellbook", target: "doc-whitepaper", type: "references" },
  { source: "doc-zypher", target: "doc-research", type: "references" },
  { source: "doc-proposal", target: "doc-research", type: "references" },
  { source: "doc-proposal", target: "doc-whitepaper", type: "references" },
];

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════

const THEME = {
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

function getNodeVisual(node) {
  const t = THEME.nodes;
  if (node.type === "concept" || (node.type === "concept" && !t[node.type])) {
    const sub = t.concept[node.domain] || t.concept.shared;
    return sub;
  }
  return t[node.type] || t.term;
}

function getNodeRadius(node) {
  switch (node.type) {
    case "document": return 18;
    case "concept": return 13;
    case "theorem": return 11;
    case "spell": return 14;
    case "act": return 15;
    case "persona": return 14;
    case "term": return 8;
    default: return 10;
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

function NodeInspector({ node, edges, nodes, onClose, onNavigate }) {
  if (!node) return null;
  const visual = getNodeVisual(node);
  const connected = edges
    .filter((e) => e.source.id === node.id || e.target.id === node.id)
    .map((e) => ({
      node: e.source.id === node.id ? e.target : e.source,
      type: e.type,
      direction: e.source.id === node.id ? "out" : "in",
    }));

  const typeLabel = {
    document: "DOCUMENT", concept: "CONCEPT", theorem: "THEOREM",
    spell: "SPELL", act: "NARRATIVE ACT", persona: "PERSONA", term: "GLOSSARY TERM",
  };

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, width: 380, height: "100%",
      background: THEME.panelBg, borderLeft: `1px solid ${THEME.panelBorder}`,
      overflow: "auto", zIndex: 100, display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, letterSpacing: 2, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
            {typeLabel[node.type] || node.type.toUpperCase()}
          </span>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: THEME.textDim, cursor: "pointer",
            fontSize: 18, lineHeight: 1, padding: "0 4px",
          }}>×</button>
        </div>
        <h2 style={{ margin: "8px 0 4px", fontSize: 20, color: THEME.textBright, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
          {node.emoji && <span style={{ marginRight: 8 }}>{node.emoji}</span>}
          {node.label}
        </h2>
        {node.version && (
          <span style={{ fontSize: 11, color: visual.stroke, fontFamily: "'JetBrains Mono', monospace" }}>
            v{node.version}
          </span>
        )}
        <div style={{
          display: "inline-block", marginLeft: node.version ? 8 : 0,
          padding: "2px 8px", borderRadius: 3, fontSize: 10, letterSpacing: 1,
          background: visual.fill, border: `1px solid ${visual.stroke}`, color: visual.stroke,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {node.domain}
        </div>
      </div>

      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${THEME.panelBorder}`, flexShrink: 0 }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: THEME.text, margin: 0, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          {node.desc}
        </p>
      </div>

      <div style={{ padding: "16px 20px", flex: 1, overflow: "auto" }}>
        <span style={{ fontSize: 11, letterSpacing: 2, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
          CONNECTIONS ({connected.length})
        </span>
        <div style={{ marginTop: 10 }}>
          {connected.map((c, i) => {
            const cv = getNodeVisual(c.node);
            const edgeStyle = THEME.edges[c.type] || { color: "#444" };
            return (
              <div key={i} onClick={() => onNavigate(c.node)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                  marginBottom: 4, borderRadius: 4, cursor: "pointer",
                  background: "transparent", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#ffffff08"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 8, color: edgeStyle.color }}>
                  {c.direction === "out" ? "→" : "←"}
                </span>
                <span style={{ fontSize: 10, color: edgeStyle.color, fontFamily: "'JetBrains Mono', monospace", minWidth: 80 }}>
                  {c.type}
                </span>
                <span style={{ fontSize: 12, color: cv.stroke }}>{cv.icon}</span>
                <span style={{ fontSize: 12, color: THEME.text, flex: 1 }}>{c.node.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GraphStats({ nodes, edges, filters }) {
  const visible = nodes.filter((n) => filters[n.layer] && filters[`type_${n.type}`] !== false);
  const typeCounts = {};
  visible.forEach((n) => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1; });
  return (
    <div style={{
      position: "absolute", bottom: 16, left: 16, padding: "12px 16px",
      background: `${THEME.panelBg}e0`, borderRadius: 6,
      border: `1px solid ${THEME.panelBorder}`, zIndex: 50,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: THEME.textDim,
    }}>
      <div style={{ marginBottom: 4, color: THEME.textBright, fontSize: 11 }}>{visible.length} nodes · {edges.length} edges</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
          <span key={type}>{count} {type}s</span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function SpellWeb() {
  const svgRef = useRef(null);
  const simRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filters, setFilters] = useState({
    knowledge: true, narrative: true, promise: true, trust: true,
  });
  const [typeFilters, setTypeFilters] = useState({
    document: true, concept: true, theorem: true, spell: true,
    act: true, persona: true, term: true,
  });
  const [viewMode, setViewMode] = useState("force");
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const containerRef = useRef(null);

  const filteredNodes = useMemo(() =>
    NODES.filter((n) => filters[n.layer] && typeFilters[n.type] !== false),
    [filters, typeFilters]
  );
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(() =>
    EDGES.filter((e) => filteredNodeIds.has(e.source?.id || e.source) && filteredNodeIds.has(e.target?.id || e.target)),
    [filteredNodeIds]
  );

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return new Set();
    const q = searchQuery.toLowerCase();
    return new Set(NODES.filter((n) =>
      n.label.toLowerCase().includes(q) || (n.desc && n.desc.toLowerCase().includes(q)) ||
      (n.emoji && n.emoji.includes(q))
    ).map((n) => n.id));
  }, [searchQuery]);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { w, h } = dimensions;
    const inspectorWidth = selectedNode ? 380 : 0;
    const graphW = w - inspectorWidth;

    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    glow.append("feMerge").selectAll("feMergeNode").data(["blur", "SourceGraphic"]).enter().append("feMergeNode").attr("in", d => d);

    const glowStrong = defs.append("filter").attr("id", "glowStrong").attr("x", "-100%").attr("y", "-100%").attr("width", "300%").attr("height", "300%");
    glowStrong.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "blur");
    glowStrong.append("feMerge").selectAll("feMergeNode").data(["blur", "SourceGraphic"]).enter().append("feMergeNode").attr("in", d => d);

    // Arrow markers
    Object.entries(THEME.edges).forEach(([type, style]) => {
      defs.append("marker").attr("id", `arrow-${type}`).attr("viewBox", "0 -5 10 10")
        .attr("refX", 20).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path").attr("d", "M0,-4L10,0L0,4").attr("fill", style.color).attr("opacity", 0.6);
    });

    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom().scaleExtent([0.15, 5]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    // Clone data for D3 mutation
    const nodeData = filteredNodes.map((n) => ({ ...n }));
    const edgeData = filteredEdges.map((e) => ({
      ...e,
      source: typeof e.source === "string" ? e.source : e.source.id,
      target: typeof e.target === "string" ? e.target : e.target.id,
    }));

    // Edges
    const link = g.append("g").selectAll("line").data(edgeData).enter().append("line")
      .attr("stroke", (d) => (THEME.edges[d.type] || { color: "#333" }).color)
      .attr("stroke-width", (d) => (THEME.edges[d.type] || { width: 1 }).width)
      .attr("stroke-dasharray", (d) => (THEME.edges[d.type] || {}).dash || null)
      .attr("stroke-opacity", 0.35)
      .attr("marker-end", (d) => ["proves", "follows", "implements"].includes(d.type) ? `url(#arrow-${d.type})` : null);

    // Node groups
    const node = g.append("g").selectAll("g").data(nodeData).enter().append("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d) => { if (!event.active) simRef.current.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => { if (!event.active) simRef.current.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Node circles
    node.append("circle")
      .attr("r", (d) => getNodeRadius(d))
      .attr("fill", (d) => getNodeVisual(d).fill)
      .attr("stroke", (d) => getNodeVisual(d).stroke)
      .attr("stroke-width", (d) => d.type === "spell" ? 2 : 1.5)
      .attr("filter", (d) => d.type === "spell" ? "url(#glowStrong)" : (searchMatches.size > 0 && searchMatches.has(d.id) ? "url(#glowStrong)" : "url(#glow)"))
      .attr("opacity", (d) => searchMatches.size > 0 ? (searchMatches.has(d.id) ? 1 : 0.15) : 0.85);

    // Node labels
    node.append("text")
      .text((d) => {
        if (d.type === "spell" && d.emoji) return d.emoji;
        if (d.type === "term") return "";
        return d.label.length > 22 ? d.label.slice(0, 20) + "…" : d.label;
      })
      .attr("dy", (d) => d.type === "spell" ? 4 : getNodeRadius(d) + 14)
      .attr("text-anchor", "middle")
      .attr("fill", (d) => d.type === "spell" ? "#ffd700" : THEME.textDim)
      .attr("font-size", (d) => d.type === "spell" ? 16 : (d.type === "term" ? 8 : 10))
      .attr("font-family", d.type === "spell" ? "serif" : "'IBM Plex Sans', sans-serif")
      .attr("opacity", (d) => searchMatches.size > 0 ? (searchMatches.has(d.id) ? 1 : 0.1) : 0.7)
      .attr("pointer-events", "none");

    // Interaction
    node.on("click", (event, d) => {
      event.stopPropagation();
      setSelectedNode(d);
    });
    node.on("mouseenter", (event, d) => setHoveredNode(d));
    node.on("mouseleave", () => setHoveredNode(null));
    svg.on("click", () => setSelectedNode(null));

    // Force simulation
    const sim = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink(edgeData).id((d) => d.id).distance((d) => {
        if (d.type === "contains") return 40;
        if (d.type === "follows") return 60;
        if (d.type === "references") return 120;
        if (d.type === "persona_knows") return 90;
        return 80;
      }).strength((d) => {
        if (d.type === "follows") return 1;
        if (d.type === "defines" || d.type === "proves") return 0.7;
        return 0.3;
      }))
      .force("charge", d3.forceManyBody().strength((d) => {
        if (d.type === "document") return -400;
        if (d.type === "concept") return -200;
        if (d.type === "term") return -50;
        return -150;
      }))
      .force("center", d3.forceCenter(graphW / 2, h / 2))
      .force("collision", d3.forceCollide().radius((d) => getNodeRadius(d) + 6))
      .force("x", d3.forceX(graphW / 2).strength(0.03))
      .force("y", d3.forceY(h / 2).strength(0.03));

    simRef.current = sim;

    sim.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Initial zoom to fit
    setTimeout(() => {
      svg.transition().duration(800).call(
        zoom.transform,
        d3.zoomIdentity.translate(graphW / 2, h / 2).scale(0.65).translate(-graphW / 2, -h / 2)
      );
    }, 1500);

    return () => sim.stop();
  }, [filteredNodes, filteredEdges, dimensions, searchMatches, selectedNode]);

  const toggleLayer = (layer) => setFilters((f) => ({ ...f, [layer]: !f[layer] }));
  const toggleType = (type) => setTypeFilters((f) => ({ ...f, [type]: !f[type] }));

  const navigateToNode = useCallback((node) => {
    const found = NODES.find((n) => n.id === node.id);
    if (found) setSelectedNode(found);
  }, []);

  const layerButtons = [
    { key: "knowledge", label: "Knowledge", color: "#00d9ff" },
    { key: "narrative", label: "Narrative", color: "#2ecc71" },
  ];

  const typeButtons = [
    { key: "document", label: "📜 Docs", color: "#3a3a5c" },
    { key: "concept", label: "◆ Concepts", color: "#00d9ff" },
    { key: "theorem", label: "△ Theorems", color: "#e74c3c" },
    { key: "spell", label: "✦ Spells", color: "#ffd700" },
    { key: "act", label: "◇ Acts", color: "#2ecc71" },
    { key: "persona", label: "○ Personas", color: "#a78bfa" },
    { key: "term", label: "· Terms", color: "#555570" },
  ];

  return (
    <div style={{
      width: "100vw", height: "100vh", background: THEME.bg, color: THEME.text,
      fontFamily: "'IBM Plex Sans', sans-serif", overflow: "hidden", position: "relative",
    }}>
      {/* HEADER */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 56,
        background: `${THEME.panelBg}e0`, borderBottom: `1px solid ${THEME.panelBorder}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", zIndex: 80, backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: THEME.accent, letterSpacing: 1 }}>
            ⚔️⊥🧙
          </span>
          <span style={{ fontSize: 16, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: THEME.textBright, letterSpacing: 2 }}>
            SPELLWEB
          </span>
          <span style={{ fontSize: 10, color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", marginLeft: 4 }}>
            spellweb.io
          </span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400, margin: "0 24px" }}>
          <input
            type="text"
            placeholder="Search concepts, spells, theorems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "8px 14px", borderRadius: 4,
              background: "#ffffff08", border: `1px solid ${THEME.panelBorder}`,
              color: THEME.textBright, fontSize: 13, outline: "none",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
            onFocus={(e) => e.target.style.borderColor = THEME.accent}
            onBlur={(e) => e.target.style.borderColor = THEME.panelBorder}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span style={{ color: THEME.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            {filteredNodes.length} nodes · {filteredEdges.length} edges
          </span>
        </div>
      </div>

      {/* LAYER & TYPE FILTERS — LEFT PANEL */}
      <div style={{
        position: "absolute", top: 68, left: 12, zIndex: 80,
        background: `${THEME.panelBg}e0`, borderRadius: 6,
        border: `1px solid ${THEME.panelBorder}`, padding: "14px 14px 10px",
        backdropFilter: "blur(12px)", maxWidth: 170,
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: THEME.textDim, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
          LAYERS
        </div>
        {layerButtons.map((l) => (
          <button key={l.key} onClick={() => toggleLayer(l.key)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "5px 8px", marginBottom: 3, borderRadius: 3, cursor: "pointer",
              background: filters[l.key] ? `${l.color}15` : "transparent",
              border: `1px solid ${filters[l.key] ? l.color + "40" : "transparent"}`,
              color: filters[l.key] ? l.color : THEME.textDim, fontSize: 11,
              fontFamily: "'IBM Plex Sans', sans-serif", textAlign: "left",
            }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: filters[l.key] ? l.color : THEME.textDim,
              boxShadow: filters[l.key] ? `0 0 6px ${l.color}` : "none",
            }} />
            {l.label}
          </button>
        ))}

        <div style={{ fontSize: 9, letterSpacing: 2, color: THEME.textDim, marginTop: 12, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
          NODE TYPES
        </div>
        {typeButtons.map((t) => (
          <button key={t.key} onClick={() => toggleType(t.key)}
            style={{
              display: "flex", alignItems: "center", gap: 6, width: "100%",
              padding: "4px 8px", marginBottom: 2, borderRadius: 3, cursor: "pointer",
              background: typeFilters[t.key] ? `${t.color}10` : "transparent",
              border: `1px solid ${typeFilters[t.key] ? t.color + "30" : "transparent"}`,
              color: typeFilters[t.key] ? THEME.text : THEME.textDim, fontSize: 11,
              fontFamily: "'IBM Plex Sans', sans-serif", textAlign: "left",
            }}>
            <span style={{ opacity: typeFilters[t.key] ? 1 : 0.3 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* LEGEND — BOTTOM RIGHT */}
      <div style={{
        position: "absolute", bottom: 16, right: selectedNode ? 396 : 16, zIndex: 50,
        background: `${THEME.panelBg}d0`, borderRadius: 6,
        border: `1px solid ${THEME.panelBorder}`, padding: "10px 14px",
        backdropFilter: "blur(8px)", fontSize: 10, transition: "right 0.2s",
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: THEME.textDim, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>DOMAINS</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "⚔️ Swordsman", color: "#e94560" },
            { label: "🧙 Mage", color: "#7b68ee" },
            { label: "😊 First Person", color: "#ffd700" },
            { label: "◆ Shared", color: "#00d9ff" },
          ].map((d) => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 4, color: d.color }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, boxShadow: `0 0 4px ${d.color}` }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, letterSpacing: 2, color: THEME.textDim, marginTop: 8, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>EDGES</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "defines", color: "#00d9ff" },
            { label: "proves", color: "#e74c3c" },
            { label: "implements", color: "#7b68ee" },
            { label: "narrates", color: "#2ecc71" },
            { label: "compresses", color: "#ffd700" },
          ].map((e) => (
            <span key={e.label} style={{ color: e.color }}>{e.label}</span>
          ))}
        </div>
      </div>

      {/* HOVER TOOLTIP */}
      {hoveredNode && !selectedNode && (
        <div style={{
          position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: `${THEME.panelBg}f0`, borderRadius: 6,
          border: `1px solid ${getNodeVisual(hoveredNode).stroke}40`,
          padding: "10px 16px", zIndex: 90, maxWidth: 400, textAlign: "center",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ fontSize: 14, color: getNodeVisual(hoveredNode).stroke, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
            {hoveredNode.emoji && <span style={{ marginRight: 6 }}>{hoveredNode.emoji}</span>}
            {hoveredNode.label}
          </div>
          <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4, lineHeight: 1.5 }}>
            {hoveredNode.desc?.slice(0, 120)}{hoveredNode.desc?.length > 120 ? "…" : ""}
          </div>
        </div>
      )}

      {/* MASTER INSCRIPTION — BOTTOM CENTER */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        fontSize: 11, color: `${THEME.accent}40`, fontFamily: "'Cormorant Garamond', serif",
        letterSpacing: 3, pointerEvents: "none", zIndex: 40,
      }}>
        ⚔️ ⊥ 🧙‍♂️ | 😊 — Privacy is Value
      </div>

      {/* GRAPH CANVAS */}
      <div ref={containerRef} style={{
        position: "absolute", top: 56, left: 0,
        right: selectedNode ? 380 : 0, bottom: 0,
        transition: "right 0.2s",
      }}>
        <svg ref={svgRef} width="100%" height="100%" style={{ display: "block" }} />
      </div>

      {/* NODE INSPECTOR */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          edges={EDGES.map((e) => ({
            ...e,
            source: NODES.find((n) => n.id === (e.source?.id || e.source)) || { id: e.source },
            target: NODES.find((n) => n.id === (e.target?.id || e.target)) || { id: e.target },
          }))}
          nodes={NODES}
          onClose={() => setSelectedNode(null)}
          onNavigate={navigateToNode}
        />
      )}

      {/* GOOGLE FONTS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500&family=JetBrains+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${THEME.panelBorder}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.textDim}; }
        input::placeholder { color: ${THEME.textDim}; }
      `}</style>
    </div>
  );
}
