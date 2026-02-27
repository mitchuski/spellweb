import type { SpellwebEdge } from '../types/graph';

// ═══════════════════════════════════════════════════════════════
// EDGE RELATIONSHIPS - Connecting the Five Spellbooks
// ═══════════════════════════════════════════════════════════════

export const EDGES: SpellwebEdge[] = [
  // ══════════════════════════════════════════════════════════════
  // SPELLBOOK STRUCTURE
  // ══════════════════════════════════════════════════════════════

  // First Person Spellbook contains its acts
  { source: "spellbook-firstperson", target: "fp-act-1", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-2", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-13", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-23", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-24", type: "defines" },

  // Zero Knowledge Spellbook contains its tales
  { source: "spellbook-zk", target: "zk-tale-1", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-12", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-23", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-30", type: "defines" },

  // Blockchain Canon contains its chapters
  { source: "spellbook-canon", target: "canon-ch-1", type: "defines" },
  { source: "spellbook-canon", target: "canon-ch-3", type: "defines" },
  { source: "spellbook-canon", target: "canon-ch-7", type: "defines" },

  // Parallel Society Spellbook contains its chapters
  { source: "spellbook-parallel", target: "ps-ch-1", type: "defines" },
  { source: "spellbook-parallel", target: "ps-ch-5", type: "defines" },
  { source: "spellbook-parallel", target: "ps-ch-9", type: "defines" },

  // Plurality Spellbook contains its acts
  { source: "spellbook-plurality", target: "pl-act-1", type: "defines" },
  { source: "spellbook-plurality", target: "pl-act-3", type: "defines" },
  { source: "spellbook-plurality", target: "pl-act-20", type: "defines" },
  { source: "spellbook-plurality", target: "pl-act-30", type: "defines" },

  // ══════════════════════════════════════════════════════════════
  // FIRST PERSON NARRATIVE FLOW
  // ══════════════════════════════════════════════════════════════
  { source: "fp-act-1", target: "fp-act-2", type: "follows" },
  { source: "fp-act-2", target: "fp-act-3", type: "follows" },
  { source: "fp-act-3", target: "fp-act-4", type: "follows" },
  { source: "fp-act-4", target: "fp-act-5", type: "follows" },
  { source: "fp-act-5", target: "fp-act-6", type: "follows" },
  { source: "fp-act-6", target: "fp-act-7", type: "follows" },
  { source: "fp-act-7", target: "fp-act-8", type: "follows" },
  { source: "fp-act-8", target: "fp-act-9", type: "follows" },
  { source: "fp-act-9", target: "fp-act-10", type: "follows" },
  { source: "fp-act-10", target: "fp-act-11", type: "follows" },
  { source: "fp-act-11", target: "fp-act-12", type: "follows" },
  { source: "fp-act-12", target: "fp-act-13", type: "follows" },
  { source: "fp-act-13", target: "fp-act-14", type: "follows" },
  { source: "fp-act-14", target: "fp-act-15", type: "follows" },
  { source: "fp-act-15", target: "fp-act-16", type: "follows" },
  { source: "fp-act-16", target: "fp-act-17", type: "follows" },
  { source: "fp-act-17", target: "fp-act-18", type: "follows" },
  { source: "fp-act-18", target: "fp-act-19", type: "follows" },
  { source: "fp-act-19", target: "fp-act-20", type: "follows" },
  { source: "fp-act-20", target: "fp-act-21", type: "follows" },
  { source: "fp-act-21", target: "fp-act-22", type: "follows" },
  { source: "fp-act-22", target: "fp-act-23", type: "follows" },
  { source: "fp-act-23", target: "fp-act-24", type: "follows" },

  // ══════════════════════════════════════════════════════════════
  // FIRST PERSON → CONCEPTS
  // ══════════════════════════════════════════════════════════════
  { source: "fp-act-1", target: "con-7thcapital", type: "narrates" },
  { source: "fp-act-2", target: "con-dualagent", type: "narrates" },
  { source: "fp-act-2", target: "spell-ceremony", type: "compresses_to" },
  { source: "fp-act-3", target: "per-drake", type: "narrates" },
  { source: "fp-act-4", target: "per-soulbis", type: "narrates" },
  { source: "fp-act-5", target: "con-trusttiers", type: "narrates" },
  { source: "fp-act-6", target: "con-vrc", type: "narrates" },
  { source: "fp-act-7", target: "con-gap", type: "narrates" },
  { source: "fp-act-7", target: "spell-master", type: "compresses_to" },
  { source: "fp-act-8", target: "con-separation", type: "narrates" },
  { source: "fp-act-9", target: "con-zkproofs", type: "narrates" },
  { source: "fp-act-9", target: "tech-zcash", type: "narrates" },
  { source: "fp-act-10", target: "thm-separation", type: "narrates" },
  { source: "fp-act-11", target: "spell-dragon", type: "compresses_to" },
  { source: "fp-act-12", target: "con-rpp", type: "narrates" },
  { source: "fp-act-13", target: "con-promisetheory", type: "narrates" },
  { source: "fp-act-16", target: "con-privacypools", type: "narrates" },
  { source: "fp-act-17", target: "skill-darkforest", type: "narrates" },
  { source: "fp-act-23", target: "per-drake", type: "narrates" },

  // Act 24: Holographic Bound connections (v8.5.0)
  { source: "fp-act-24", target: "con-holographic-bound", type: "narrates" },
  { source: "fp-act-24", target: "con-braid", type: "narrates" },
  { source: "fp-act-24", target: "con-three-axis-separation", type: "narrates" },
  { source: "fp-act-24", target: "con-three-layer-identity", type: "narrates" },
  { source: "fp-act-24", target: "con-dragon-vertex", type: "narrates" },
  { source: "fp-act-24", target: "con-compression-spectrum", type: "narrates" },
  { source: "fp-act-24", target: "per-holonic-architect", type: "narrates" },
  { source: "fp-act-24", target: "spell-holographic", type: "compresses_to" },
  { source: "fp-act-24", target: "con-holon", type: "extends" },
  { source: "fp-act-24", target: "con-shared-parent", type: "extends" },
  { source: "fp-act-24", target: "con-holonic-braid", type: "extends" },
  { source: "fp-act-24", target: "con-uor-torus", type: "narrates" },
  { source: "con-braid", target: "con-generator-solver", type: "defines" },
  { source: "con-three-axis-separation", target: "con-separation", type: "extends" },
  { source: "con-three-layer-identity", target: "con-vrc", type: "extends" },
  { source: "con-dragon-vertex", target: "con-7thcapital", type: "extends" },
  { source: "con-holographic-bound", target: "con-gap", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // ZERO KNOWLEDGE TALE FLOW (selected)
  // ══════════════════════════════════════════════════════════════
  { source: "zk-tale-1", target: "zk-tale-2", type: "follows" },
  { source: "zk-tale-2", target: "zk-tale-3", type: "follows" },
  { source: "zk-tale-3", target: "zk-tale-4", type: "follows" },
  { source: "zk-tale-4", target: "zk-tale-5", type: "follows" },
  { source: "zk-tale-5", target: "zk-tale-6", type: "follows" },
  { source: "zk-tale-6", target: "zk-tale-7", type: "follows" },
  { source: "zk-tale-12", target: "zk-tale-13", type: "follows" },
  { source: "zk-tale-13", target: "zk-tale-14", type: "follows" },
  { source: "zk-tale-14", target: "zk-tale-15", type: "follows" },
  { source: "zk-tale-15", target: "zk-tale-16", type: "follows" },
  { source: "zk-tale-16", target: "zk-tale-17", type: "follows" },

  // ZK Tales → Concepts
  { source: "zk-tale-1", target: "con-zkproofs", type: "narrates" },
  { source: "zk-tale-3", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-12", target: "con-zkproofs", type: "implements" },
  { source: "zk-tale-13", target: "con-zkproofs", type: "implements" },
  { source: "zk-tale-14", target: "con-zkproofs", type: "implements" },
  { source: "zk-tale-18", target: "skill-crypto-zkp", type: "implements" },
  { source: "zk-tale-23", target: "tech-zcash", type: "narrates" },
  { source: "zk-tale-24", target: "con-privacypools", type: "narrates" },
  { source: "zk-tale-25", target: "tech-ethereum", type: "implements" },
  { source: "zk-tale-29", target: "skill-aiagent", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // BLOCKCHAIN CANON FLOW
  // ══════════════════════════════════════════════════════════════
  { source: "canon-ch-0", target: "canon-ch-1", type: "follows" },
  { source: "canon-ch-1", target: "canon-ch-2", type: "follows" },
  { source: "canon-ch-2", target: "canon-ch-3", type: "follows" },
  { source: "canon-ch-3", target: "canon-ch-4", type: "follows" },
  { source: "canon-ch-4", target: "canon-ch-5", type: "follows" },
  { source: "canon-ch-5", target: "canon-ch-6", type: "follows" },
  { source: "canon-ch-6", target: "canon-ch-7", type: "follows" },
  { source: "canon-ch-7", target: "canon-ch-8", type: "follows" },
  { source: "canon-ch-8", target: "canon-ch-9", type: "follows" },
  { source: "canon-ch-9", target: "canon-ch-10", type: "follows" },

  // Canon → Concepts/People
  { source: "canon-ch-1", target: "person-chaum", type: "narrates" },
  { source: "canon-ch-3", target: "person-satoshi", type: "narrates" },
  { source: "canon-ch-4", target: "person-vitalik", type: "narrates" },
  { source: "canon-ch-4", target: "tech-ethereum", type: "narrates" },
  { source: "canon-ch-7", target: "con-surveillance", type: "narrates" },
  { source: "canon-ch-8", target: "con-zkproofs", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // PARALLEL SOCIETY CHAPTER FLOW
  // ══════════════════════════════════════════════════════════════
  { source: "ps-ch-1", target: "ps-ch-2", type: "follows" },
  { source: "ps-ch-2", target: "ps-ch-3", type: "follows" },
  { source: "ps-ch-3", target: "ps-ch-4", type: "follows" },
  { source: "ps-ch-4", target: "ps-ch-5", type: "follows" },
  { source: "ps-ch-5", target: "ps-ch-6", type: "follows" },
  { source: "ps-ch-6", target: "ps-ch-7", type: "follows" },
  { source: "ps-ch-9", target: "ps-ch-10", type: "follows" },
  { source: "ps-ch-10", target: "ps-ch-11", type: "follows" },

  // Parallel Society → Concepts
  { source: "ps-ch-1", target: "con-westphalia", type: "narrates" },
  { source: "ps-ch-5", target: "per-drake", type: "narrates" },
  { source: "ps-ch-6", target: "skill-governance", type: "narrates" },
  { source: "ps-ch-9", target: "con-7thcapital", type: "extends" },
  { source: "ps-ch-14", target: "con-zkproofs", type: "implements" },

  // ══════════════════════════════════════════════════════════════
  // PLURALITY ACT FLOW (selected)
  // ══════════════════════════════════════════════════════════════
  { source: "pl-act-1", target: "pl-act-2", type: "follows" },
  { source: "pl-act-2", target: "pl-act-3", type: "follows" },
  { source: "pl-act-3", target: "pl-act-4", type: "follows" },
  { source: "pl-act-4", target: "pl-act-5", type: "follows" },
  { source: "pl-act-19", target: "pl-act-20", type: "follows" },
  { source: "pl-act-20", target: "pl-act-21", type: "follows" },
  { source: "pl-act-29", target: "pl-act-30", type: "follows" },

  // Plurality → Concepts
  { source: "pl-act-1", target: "con-plurality", type: "narrates" },
  { source: "pl-act-1", target: "spell-plurality", type: "compresses_to" },
  { source: "pl-act-3", target: "person-audrey", type: "narrates" },
  { source: "pl-act-4", target: "tech-polis", type: "narrates" },
  { source: "pl-act-7", target: "person-weyl", type: "references" },
  { source: "pl-act-10", target: "con-myterms", type: "implements" },
  { source: "pl-act-18", target: "tech-polis", type: "implements" },
  { source: "pl-act-20", target: "con-quadratic", type: "narrates" },
  { source: "pl-act-24", target: "per-healer", type: "narrates" },
  { source: "pl-act-30", target: "per-drake", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // CROSS-SPELLBOOK CONNECTIONS
  // ══════════════════════════════════════════════════════════════

  // First Person ↔ Zero Knowledge
  { source: "spellbook-firstperson", target: "spellbook-zk", type: "references" },
  { source: "fp-act-9", target: "zk-tale-23", type: "references" },

  // First Person ↔ Canon
  { source: "spellbook-firstperson", target: "spellbook-canon", type: "references" },
  { source: "fp-act-1", target: "canon-ch-1", type: "references" },

  // First Person ↔ Parallel Society
  { source: "spellbook-firstperson", target: "spellbook-parallel", type: "references" },

  // First Person ↔ Plurality
  { source: "spellbook-firstperson", target: "spellbook-plurality", type: "references" },

  // Canon ↔ ZK
  { source: "spellbook-canon", target: "spellbook-zk", type: "references" },
  { source: "canon-ch-8", target: "zk-tale-1", type: "references" },

  // Parallel Society ↔ Plurality
  { source: "spellbook-parallel", target: "spellbook-plurality", type: "extends" },
  { source: "ps-ch-9", target: "pl-act-1", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // PERSONA → SPELLBOOK KNOWLEDGE
  // ══════════════════════════════════════════════════════════════

  // Soulbis knows Swordsman content
  { source: "per-soulbis", target: "spellbook-firstperson", type: "persona_knows" },
  { source: "per-soulbis", target: "spellbook-zk", type: "persona_knows" },
  { source: "per-soulbis", target: "con-zkproofs", type: "persona_knows" },
  { source: "per-soulbis", target: "con-separation", type: "persona_knows" },
  { source: "per-soulbis", target: "con-myterms", type: "persona_knows" },

  // Soulbae knows Mage content
  { source: "per-soulbae", target: "spellbook-firstperson", type: "persona_knows" },
  { source: "per-soulbae", target: "spellbook-canon", type: "persona_knows" },
  { source: "per-soulbae", target: "spellbook-parallel", type: "persona_knows" },
  { source: "per-soulbae", target: "spellbook-plurality", type: "persona_knows" },
  { source: "per-soulbae", target: "con-vrc", type: "persona_knows" },
  { source: "per-soulbae", target: "con-rpp", type: "persona_knows" },

  // Drake knows everything
  { source: "per-drake", target: "spellbook-firstperson", type: "persona_knows" },
  { source: "per-drake", target: "spellbook-zk", type: "persona_knows" },
  { source: "per-drake", target: "spellbook-canon", type: "persona_knows" },
  { source: "per-drake", target: "spellbook-parallel", type: "persona_knows" },
  { source: "per-drake", target: "spellbook-plurality", type: "persona_knows" },
  { source: "per-drake", target: "con-promisetheory", type: "persona_knows" },

  // Specialized personas
  { source: "per-cipher", target: "spellbook-zk", type: "persona_knows" },
  { source: "per-cipher", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-warden", target: "skill-browser", type: "persona_knows" },
  { source: "per-gatekeeper", target: "skill-personhood", type: "persona_knows" },
  { source: "per-ranger", target: "skill-darkforest", type: "persona_knows" },
  { source: "per-assessor", target: "skill-economics", type: "persona_knows" },
  { source: "per-ambassador", target: "skill-governance", type: "persona_knows" },
  { source: "per-ambassador", target: "org-bgin", type: "persona_knows" },
  { source: "per-chronicler", target: "skill-narrative", type: "persona_knows" },
  { source: "per-weaver", target: "skill-plurality", type: "persona_knows" },
  { source: "per-weaver", target: "spellbook-plurality", type: "persona_knows" },
  { source: "per-architect", target: "skill-aiagent", type: "persona_knows" },

  // ══════════════════════════════════════════════════════════════
  // CONCEPT RELATIONSHIPS
  // ══════════════════════════════════════════════════════════════

  // Core architecture
  { source: "con-paradox", target: "con-dualagent", type: "proves" },
  { source: "con-dualagent", target: "con-separation", type: "implements" },
  { source: "con-dualagent", target: "con-gap", type: "implements" },
  { source: "con-separation", target: "thm-separation", type: "proves" },
  { source: "thm-separation", target: "thm-ceiling", type: "proves" },
  { source: "thm-ceiling", target: "thm-errfloor", type: "proves" },

  // The Gap → 7th Capital
  { source: "con-gap", target: "con-7thcapital", type: "extends" },
  { source: "con-7thcapital", target: "con-surveillance", type: "contradicts" },

  // Trust and credentials
  { source: "con-vrc", target: "con-rpp", type: "implements" },
  { source: "con-trusttiers", target: "con-vrc", type: "implements" },
  { source: "con-promisetheory", target: "con-dualagent", type: "extends" },

  // Privacy tech
  { source: "con-zkproofs", target: "con-separation", type: "implements" },
  { source: "con-privacypools", target: "con-zkproofs", type: "extends" },
  { source: "con-myterms", target: "con-gap", type: "implements" },

  // Plurality concepts
  { source: "con-plurality", target: "con-quadratic", type: "implements" },
  { source: "con-westphalia", target: "con-plurality", type: "contradicts" },

  // ══════════════════════════════════════════════════════════════
  // SPELL COMPRESSIONS
  // ══════════════════════════════════════════════════════════════
  { source: "con-separation", target: "spell-master", type: "compresses_to" },
  { source: "con-gap", target: "spell-gap", type: "compresses_to" },
  { source: "con-vrc", target: "spell-vrc", type: "compresses_to" },
  { source: "con-dualagent", target: "spell-ceremony", type: "compresses_to" },
  { source: "con-trusttiers", target: "spell-dragon", type: "compresses_to" },
  { source: "con-plurality", target: "spell-plurality", type: "compresses_to" },

  // ══════════════════════════════════════════════════════════════
  // TECHNOLOGY IMPLEMENTATIONS
  // ══════════════════════════════════════════════════════════════
  { source: "tech-zcash", target: "con-zkproofs", type: "implements" },
  { source: "tech-zcash", target: "con-privacypools", type: "implements" },
  { source: "tech-ethereum", target: "con-dualagent", type: "implements" },
  { source: "tech-near", target: "con-dualagent", type: "implements" },
  { source: "tech-nillion", target: "con-zkproofs", type: "implements" },
  { source: "tech-polis", target: "con-plurality", type: "implements" },
  { source: "tech-polis", target: "con-quadratic", type: "implements" },

  // ══════════════════════════════════════════════════════════════
  // DOCUMENT DEFINITIONS
  // ══════════════════════════════════════════════════════════════
  { source: "doc-whitepaper", target: "con-dualagent", type: "defines" },
  { source: "doc-whitepaper", target: "con-vrc", type: "defines" },
  { source: "doc-whitepaper", target: "con-trusttiers", type: "defines" },
  { source: "doc-research", target: "con-separation", type: "defines" },
  { source: "doc-research", target: "thm-separation", type: "defines" },
  { source: "doc-research", target: "thm-ceiling", type: "defines" },
  { source: "doc-promise", target: "con-promisetheory", type: "defines" },
  { source: "doc-tokenomics", target: "con-trusttiers", type: "defines" },
  { source: "doc-zypher", target: "con-rpp", type: "defines" },

  // ══════════════════════════════════════════════════════════════
  // HISTORICAL LINEAGE
  // ══════════════════════════════════════════════════════════════
  { source: "person-chaum", target: "person-satoshi", type: "extends" },
  { source: "person-satoshi", target: "person-vitalik", type: "extends" },
  { source: "person-satoshi", target: "tech-zcash", type: "extends" },
  { source: "person-weyl", target: "con-quadratic", type: "defines" },
  { source: "person-audrey", target: "tech-polis", type: "implements" },

  // ══════════════════════════════════════════════════════════════
  // ROLE SKILLS → CONCEPTS & SPELLBOOKS
  // ══════════════════════════════════════════════════════════════

  // Crypto ZKP skill connections
  { source: "skill-crypto-zkp", target: "con-zkproofs", type: "implements" },
  { source: "skill-crypto-zkp", target: "spellbook-zk", type: "references" },
  { source: "skill-crypto-zkp", target: "std-groth16", type: "implements" },
  { source: "skill-crypto-zkp", target: "std-plonk", type: "implements" },
  { source: "skill-crypto-zkp", target: "std-stark", type: "implements" },
  { source: "skill-crypto-zkp", target: "std-nova", type: "implements" },
  { source: "skill-crypto-zkp", target: "std-halo", type: "implements" },

  // Browser privacy skill
  { source: "skill-browser", target: "con-myterms", type: "implements" },
  { source: "skill-browser", target: "proto-myterms", type: "implements" },
  { source: "skill-browser", target: "skill-consent", type: "extends" },

  // Personhood skill
  { source: "skill-personhood", target: "std-did", type: "implements" },
  { source: "skill-personhood", target: "con-gap", type: "extends" },

  // Dark forest skill
  { source: "skill-darkforest", target: "fp-act-17", type: "references" },
  { source: "skill-darkforest", target: "skill-threat", type: "extends" },

  // Economics skill
  { source: "skill-economics", target: "con-7thcapital", type: "implements" },
  { source: "skill-economics", target: "skill-sovereignty-econ", type: "extends" },

  // Governance skill
  { source: "skill-governance", target: "org-bgin", type: "references" },
  { source: "skill-governance", target: "org-toip", type: "references" },
  { source: "skill-governance", target: "org-iiw", type: "references" },
  { source: "skill-governance", target: "skill-governance-agents", type: "extends" },

  // Narrative compression skill
  { source: "skill-narrative", target: "skill-proverbiogenesis", type: "extends" },
  { source: "skill-narrative", target: "skill-spell-encoding", type: "extends" },
  { source: "skill-narrative", target: "skill-grimoire", type: "extends" },
  { source: "skill-narrative", target: "con-rpp", type: "implements" },

  // Plurality skill
  { source: "skill-plurality", target: "con-plurality", type: "implements" },
  { source: "skill-plurality", target: "con-quadratic", type: "implements" },
  { source: "skill-plurality", target: "spellbook-plurality", type: "references" },

  // AI Agent skill
  { source: "skill-aiagent", target: "con-dualagent", type: "implements" },
  { source: "skill-aiagent", target: "skill-agent-interop", type: "extends" },
  { source: "skill-aiagent", target: "std-erc-8004", type: "implements" },

  // Hitchhiker governance
  { source: "skill-hitchhiker", target: "fp-act-21", type: "references" },
  { source: "skill-hitchhiker", target: "fp-act-22", type: "references" },

  // Proverbiogenesis
  { source: "skill-proverbiogenesis", target: "fp-act-12", type: "references" },
  { source: "skill-proverbiogenesis", target: "proto-rpp", type: "implements" },

  // Spell encoding
  { source: "skill-spell-encoding", target: "spell-master", type: "references" },
  { source: "skill-spell-encoding", target: "skill-inscription", type: "extends" },

  // Inscription mechanics
  { source: "skill-inscription", target: "tech-zcash", type: "implements" },

  // Cross-chain
  { source: "skill-cross-chain", target: "tech-ethereum", type: "implements" },
  { source: "skill-cross-chain", target: "tech-zcash", type: "implements" },
  { source: "skill-cross-chain", target: "tech-near", type: "implements" },

  // Armor progression
  { source: "skill-armor-progression", target: "con-trusttiers", type: "implements" },
  { source: "skill-armor-progression", target: "spell-dragon", type: "references" },

  // Key ceremony
  { source: "skill-key-ceremony", target: "spell-ceremony", type: "implements" },
  { source: "skill-key-ceremony", target: "fp-act-2", type: "references" },

  // Separation enforcement
  { source: "skill-separation", target: "con-separation", type: "implements" },
  { source: "skill-separation", target: "thm-separation", type: "references" },
  { source: "skill-separation", target: "skill-boundary", type: "extends" },

  // Selective disclosure
  { source: "skill-selective", target: "con-zkproofs", type: "implements" },
  { source: "skill-selective", target: "proto-privacy-pools", type: "implements" },

  // Nullifier design
  { source: "skill-nullifier", target: "con-zkproofs", type: "implements" },
  { source: "skill-nullifier", target: "proto-privacy-pools", type: "implements" },

  // Recovery RPP
  { source: "skill-recovery-rpp", target: "proto-rpp", type: "implements" },
  { source: "skill-recovery-rpp", target: "con-rpp", type: "implements" },

  // Understanding as key
  { source: "skill-understanding-key", target: "doc-zypher", type: "references" },
  { source: "skill-understanding-key", target: "proto-rpp", type: "implements" },

  // Data dignity
  { source: "skill-data-dignity", target: "con-7thcapital", type: "extends" },
  { source: "skill-data-dignity", target: "con-surveillance", type: "contradicts" },

  // Reputation credentials
  { source: "skill-reputation", target: "proto-vrc", type: "implements" },
  { source: "skill-reputation", target: "std-vc", type: "implements" },

  // Enclave operations
  { source: "skill-enclave", target: "tech-near", type: "implements" },
  { source: "skill-enclave", target: "skill-separation", type: "extends" },

  // Intel pooling
  { source: "skill-intel-pooling", target: "proto-privacy-pools", type: "implements" },
  { source: "skill-intel-pooling", target: "skill-selective", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // PRIVACY-LAYER SKILLS → CORE CONCEPTS
  // ══════════════════════════════════════════════════════════════

  { source: "skill-dragon", target: "per-drake", type: "references" },
  { source: "skill-dragon", target: "con-promisetheory", type: "extends" },

  { source: "skill-vrc-identity", target: "con-vrc", type: "implements" },
  { source: "skill-vrc-identity", target: "proto-vrc", type: "implements" },
  { source: "skill-vrc-identity", target: "std-did", type: "implements" },

  { source: "skill-promise-theory", target: "con-promisetheory", type: "implements" },
  { source: "skill-promise-theory", target: "doc-promise", type: "references" },

  { source: "skill-knowledgegraph", target: "skill-grimoire", type: "extends" },
  { source: "skill-knowledgegraph", target: "skill-constellation", type: "extends" },

  { source: "skill-tetrahedral", target: "spellbook-zk", type: "references" },
  { source: "skill-tetrahedral", target: "fp-act-10", type: "references" },

  { source: "skill-edge-value", target: "con-vrc", type: "implements" },
  { source: "skill-edge-value", target: "skill-trust-spanning", type: "extends" },

  { source: "skill-temporal", target: "skill-armor-progression", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // PROTOCOLS → CONCEPTS & STANDARDS
  // ══════════════════════════════════════════════════════════════

  { source: "proto-privacy-pools", target: "con-privacypools", type: "implements" },
  { source: "proto-privacy-pools", target: "con-zkproofs", type: "implements" },
  { source: "proto-privacy-pools", target: "fp-act-16", type: "references" },

  { source: "proto-x402", target: "con-dualagent", type: "implements" },
  { source: "proto-x402", target: "skill-agent-interop", type: "implements" },

  { source: "proto-vrc", target: "con-vrc", type: "implements" },
  { source: "proto-vrc", target: "std-vc", type: "extends" },
  { source: "proto-vrc", target: "std-did", type: "extends" },

  { source: "proto-rpp", target: "con-rpp", type: "implements" },
  { source: "proto-rpp", target: "doc-zypher", type: "references" },

  { source: "proto-myterms", target: "con-myterms", type: "implements" },
  { source: "proto-myterms", target: "skill-consent", type: "implements" },

  // ══════════════════════════════════════════════════════════════
  // STANDARDS → CONCEPTS & TECHNOLOGIES
  // ══════════════════════════════════════════════════════════════

  { source: "std-erc-8004", target: "tech-ethereum", type: "implements" },
  { source: "std-erc-8004", target: "skill-aiagent", type: "implements" },

  { source: "std-erc-7812", target: "tech-ethereum", type: "implements" },
  { source: "std-erc-7812", target: "con-zkproofs", type: "implements" },

  { source: "std-did", target: "con-gap", type: "implements" },
  { source: "std-did", target: "org-toip", type: "references" },

  { source: "std-vc", target: "con-vrc", type: "extends" },
  { source: "std-vc", target: "org-toip", type: "references" },

  { source: "std-groth16", target: "tech-zcash", type: "implements" },
  { source: "std-groth16", target: "con-zkproofs", type: "implements" },

  { source: "std-plonk", target: "con-zkproofs", type: "implements" },
  { source: "std-plonk", target: "zk-tale-13", type: "references" },

  { source: "std-stark", target: "con-zkproofs", type: "implements" },
  { source: "std-stark", target: "zk-tale-14", type: "references" },

  { source: "std-nova", target: "con-zkproofs", type: "implements" },
  { source: "std-nova", target: "zk-tale-17", type: "references" },

  { source: "std-halo", target: "con-zkproofs", type: "implements" },
  { source: "std-halo", target: "tech-zcash", type: "implements" },
  { source: "std-halo", target: "zk-tale-15", type: "references" },

  // ══════════════════════════════════════════════════════════════
  // ADDITIONAL PERSONA → SKILL CONNECTIONS
  // ══════════════════════════════════════════════════════════════

  { source: "per-soulbis", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-browser", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-personhood", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-darkforest", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-separation", type: "persona_knows" },

  { source: "per-soulbae", target: "skill-aiagent", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-economics", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-governance", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-narrative", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-hitchhiker", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-plurality", type: "persona_knows" },

  { source: "per-cipher", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-cipher", target: "skill-nullifier", type: "persona_knows" },
  { source: "per-cipher", target: "std-groth16", type: "persona_knows" },
  { source: "per-cipher", target: "std-plonk", type: "persona_knows" },

  { source: "per-warden", target: "skill-browser", type: "persona_knows" },
  { source: "per-warden", target: "skill-consent", type: "persona_knows" },
  { source: "per-warden", target: "proto-myterms", type: "persona_knows" },

  { source: "per-gatekeeper", target: "skill-personhood", type: "persona_knows" },
  { source: "per-gatekeeper", target: "std-did", type: "persona_knows" },

  { source: "per-ranger", target: "skill-darkforest", type: "persona_knows" },
  { source: "per-ranger", target: "skill-threat", type: "persona_knows" },
  { source: "per-ranger", target: "skill-intel-pooling", type: "persona_knows" },

  { source: "per-sentinel", target: "skill-perimeter", type: "persona_knows" },
  { source: "per-sentinel", target: "skill-enclave", type: "persona_knows" },
  { source: "per-sentinel", target: "skill-key-ceremony", type: "persona_knows" },

  { source: "per-assessor", target: "skill-economics", type: "persona_knows" },
  { source: "per-assessor", target: "skill-sovereignty-econ", type: "persona_knows" },
  { source: "per-assessor", target: "skill-edge-value", type: "persona_knows" },

  { source: "per-ambassador", target: "skill-governance", type: "persona_knows" },
  { source: "per-ambassador", target: "skill-governance-agents", type: "persona_knows" },
  { source: "per-ambassador", target: "org-bgin", type: "persona_knows" },
  { source: "per-ambassador", target: "org-toip", type: "persona_knows" },
  { source: "per-ambassador", target: "org-iiw", type: "persona_knows" },

  { source: "per-chronicler", target: "skill-narrative", type: "persona_knows" },
  { source: "per-chronicler", target: "skill-proverbiogenesis", type: "persona_knows" },
  { source: "per-chronicler", target: "skill-grimoire", type: "persona_knows" },
  { source: "per-chronicler", target: "skill-knowledgegraph", type: "persona_knows" },

  { source: "per-shipwright", target: "skill-hitchhiker", type: "persona_knows" },
  { source: "per-shipwright", target: "skill-plurality", type: "persona_knows" },

  { source: "per-weaver", target: "skill-plurality", type: "persona_knows" },
  { source: "per-weaver", target: "con-quadratic", type: "persona_knows" },
  { source: "per-weaver", target: "tech-polis", type: "persona_knows" },

  { source: "per-healer", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-healer", target: "skill-selective", type: "persona_knows" },
  { source: "per-healer", target: "pl-act-24", type: "references" },

  { source: "per-witness", target: "skill-darkforest", type: "persona_knows" },
  { source: "per-witness", target: "skill-metadata", type: "persona_knows" },

  { source: "per-architect", target: "skill-aiagent", type: "persona_knows" },
  { source: "per-architect", target: "skill-agent-interop", type: "persona_knows" },
  { source: "per-architect", target: "std-erc-8004", type: "persona_knows" },
  { source: "per-architect", target: "proto-x402", type: "persona_knows" },

  { source: "per-pedagogue", target: "skill-narrative", type: "persona_knows" },
  { source: "per-pedagogue", target: "skill-story-diffusion", type: "persona_knows" },
  { source: "per-pedagogue", target: "skill-understanding-key", type: "persona_knows" },

  { source: "per-drake", target: "skill-dragon", type: "persona_knows" },
  { source: "per-drake", target: "skill-tetrahedral", type: "persona_knows" },
  { source: "per-drake", target: "skill-promise-theory", type: "persona_knows" },

  // ══════════════════════════════════════════════════════════════
  // MORE ZK TALE FLOWS
  // ══════════════════════════════════════════════════════════════
  { source: "zk-tale-7", target: "zk-tale-8", type: "follows" },
  { source: "zk-tale-8", target: "zk-tale-9", type: "follows" },
  { source: "zk-tale-9", target: "zk-tale-10", type: "follows" },
  { source: "zk-tale-10", target: "zk-tale-11", type: "follows" },
  { source: "zk-tale-11", target: "zk-tale-12", type: "follows" },
  { source: "zk-tale-17", target: "zk-tale-18", type: "follows" },
  { source: "zk-tale-18", target: "zk-tale-19", type: "follows" },
  { source: "zk-tale-19", target: "zk-tale-20", type: "follows" },
  { source: "zk-tale-20", target: "zk-tale-21", type: "follows" },
  { source: "zk-tale-21", target: "zk-tale-22", type: "follows" },
  { source: "zk-tale-22", target: "zk-tale-23", type: "follows" },
  { source: "zk-tale-23", target: "zk-tale-24", type: "follows" },
  { source: "zk-tale-24", target: "zk-tale-25", type: "follows" },
  { source: "zk-tale-25", target: "zk-tale-26", type: "follows" },
  { source: "zk-tale-26", target: "zk-tale-27", type: "follows" },
  { source: "zk-tale-27", target: "zk-tale-28", type: "follows" },
  { source: "zk-tale-28", target: "zk-tale-29", type: "follows" },
  { source: "zk-tale-29", target: "zk-tale-30", type: "follows" },

  // More ZK Tale → Concept connections
  { source: "zk-tale-5", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-6", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-7", target: "std-plonk", type: "narrates" },
  { source: "zk-tale-8", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-9", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-15", target: "std-halo", type: "narrates" },
  { source: "zk-tale-16", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-17", target: "std-nova", type: "narrates" },
  { source: "zk-tale-19", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-20", target: "skill-crypto-zkp", type: "narrates" },
  { source: "zk-tale-21", target: "tech-ethereum", type: "narrates" },
  { source: "zk-tale-26", target: "skill-personhood", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // MORE PLURALITY ACT FLOWS
  // ══════════════════════════════════════════════════════════════
  { source: "pl-act-5", target: "pl-act-6", type: "follows" },
  { source: "pl-act-6", target: "pl-act-7", type: "follows" },
  { source: "pl-act-7", target: "pl-act-8", type: "follows" },
  { source: "pl-act-8", target: "pl-act-9", type: "follows" },
  { source: "pl-act-9", target: "pl-act-10", type: "follows" },
  { source: "pl-act-10", target: "pl-act-11", type: "follows" },
  { source: "pl-act-11", target: "pl-act-12", type: "follows" },
  { source: "pl-act-12", target: "pl-act-13", type: "follows" },
  { source: "pl-act-13", target: "pl-act-14", type: "follows" },
  { source: "pl-act-14", target: "pl-act-15", type: "follows" },
  { source: "pl-act-15", target: "pl-act-16", type: "follows" },
  { source: "pl-act-16", target: "pl-act-17", type: "follows" },
  { source: "pl-act-17", target: "pl-act-18", type: "follows" },
  { source: "pl-act-18", target: "pl-act-19", type: "follows" },
  { source: "pl-act-21", target: "pl-act-22", type: "follows" },
  { source: "pl-act-22", target: "pl-act-23", type: "follows" },
  { source: "pl-act-23", target: "pl-act-24", type: "follows" },
  { source: "pl-act-24", target: "pl-act-25", type: "follows" },
  { source: "pl-act-25", target: "pl-act-26", type: "follows" },
  { source: "pl-act-26", target: "pl-act-27", type: "follows" },
  { source: "pl-act-27", target: "pl-act-28", type: "follows" },
  { source: "pl-act-28", target: "pl-act-29", type: "follows" },

  // More Plurality → Concept connections
  { source: "pl-act-6", target: "skill-network-topology", type: "narrates" },
  { source: "pl-act-10", target: "std-did", type: "narrates" },
  { source: "pl-act-11", target: "skill-plurality", type: "narrates" },
  { source: "pl-act-12", target: "skill-economics", type: "narrates" },
  { source: "pl-act-17", target: "skill-aiagent", type: "narrates" },
  { source: "pl-act-19", target: "skill-governance-agents", type: "narrates" },
  { source: "pl-act-23", target: "skill-aiagent", type: "narrates" },
  { source: "pl-act-25", target: "skill-narrative", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // MORE PARALLEL SOCIETY FLOWS
  // ══════════════════════════════════════════════════════════════
  { source: "ps-ch-7", target: "ps-ch-8", type: "follows" },
  { source: "ps-ch-8", target: "ps-ch-9", type: "follows" },
  { source: "ps-ch-11", target: "ps-ch-12", type: "follows" },
  { source: "ps-ch-12", target: "ps-ch-13", type: "follows" },
  { source: "ps-ch-13", target: "ps-ch-14", type: "follows" },
  { source: "ps-ch-14", target: "ps-ch-15", type: "follows" },
  { source: "ps-ch-15", target: "ps-ch-16", type: "follows" },
  { source: "ps-ch-16", target: "ps-ch-17", type: "follows" },

  // More Parallel Society → Concept connections
  { source: "ps-ch-2", target: "con-surveillance", type: "narrates" },
  { source: "ps-ch-3", target: "skill-governance", type: "narrates" },
  { source: "ps-ch-4", target: "person-chaum", type: "references" },
  { source: "ps-ch-4", target: "person-satoshi", type: "references" },
  { source: "ps-ch-7", target: "skill-data-dignity", type: "narrates" },
  { source: "ps-ch-8", target: "con-plurality", type: "references" },
  { source: "ps-ch-10", target: "con-promisetheory", type: "narrates" },
  { source: "ps-ch-11", target: "skill-governance", type: "narrates" },
  { source: "ps-ch-12", target: "proto-vrc", type: "narrates" },
  { source: "ps-ch-14", target: "skill-crypto-zkp", type: "narrates" },
  { source: "ps-ch-17", target: "con-7thcapital", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // SPELLBOOK CONTAINMENT (more acts)
  // ══════════════════════════════════════════════════════════════
  { source: "spellbook-firstperson", target: "fp-act-7", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-9", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-12", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-16", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-17", type: "defines" },
  { source: "spellbook-firstperson", target: "fp-act-21", type: "defines" },

  { source: "spellbook-zk", target: "zk-tale-7", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-13", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-14", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-15", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-17", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-21", type: "defines" },

  { source: "spellbook-canon", target: "canon-ch-0", type: "defines" },
  { source: "spellbook-canon", target: "canon-ch-4", type: "defines" },
  { source: "spellbook-canon", target: "canon-ch-8", type: "defines" },

  { source: "spellbook-parallel", target: "ps-ch-3", type: "defines" },
  { source: "spellbook-parallel", target: "ps-ch-8", type: "defines" },
  { source: "spellbook-parallel", target: "ps-ch-14", type: "defines" },
  { source: "spellbook-parallel", target: "ps-ch-17", type: "defines" },

  { source: "spellbook-plurality", target: "pl-act-7", type: "defines" },
  { source: "spellbook-plurality", target: "pl-act-10", type: "defines" },
  { source: "spellbook-plurality", target: "pl-act-18", type: "defines" },
  { source: "spellbook-plurality", target: "pl-act-24", type: "defines" },

  // ══════════════════════════════════════════════════════════════
  // HOLONIC ARCHITECTURE CONNECTIONS
  // ══════════════════════════════════════════════════════════════

  // Document defines holonic concepts
  { source: "doc-holonic", target: "con-holon", type: "defines" },
  { source: "doc-holonic", target: "con-identity-independence", type: "defines" },
  { source: "doc-holonic", target: "con-multi-provider", type: "defines" },
  { source: "doc-holonic", target: "con-shared-parent", type: "defines" },
  { source: "doc-holonic", target: "con-holonic-braid", type: "defines" },
  { source: "doc-holonic", target: "tech-oasis", type: "defines" },
  { source: "doc-holonic", target: "tech-hyperdrive", type: "defines" },
  { source: "doc-holonic", target: "tech-cosmic-orm", type: "defines" },
  { source: "doc-holonic", target: "tech-star-odk", type: "defines" },

  // Holonic concept relationships
  { source: "con-holon", target: "con-identity-independence", type: "implements" },
  { source: "con-holon", target: "con-multi-provider", type: "implements" },
  { source: "con-holon", target: "con-shared-parent", type: "extends" },
  { source: "con-shared-parent", target: "con-agent-memory", type: "implements" },
  { source: "con-holonic-braid", target: "con-holon", type: "implements" },
  { source: "con-holonic-marvin", target: "con-holon", type: "implements" },
  { source: "con-holonic-marvin", target: "con-agent-memory", type: "implements" },

  // Technologies implement holonic concepts
  { source: "tech-oasis", target: "con-holon", type: "implements" },
  { source: "tech-oasis", target: "con-multi-provider", type: "implements" },
  { source: "tech-hyperdrive", target: "con-multi-provider", type: "implements" },
  { source: "tech-hyperdrive", target: "tech-oasis", type: "extends" },
  { source: "tech-cosmic-orm", target: "tech-oasis", type: "extends" },
  { source: "tech-star-odk", target: "tech-cosmic-orm", type: "extends" },

  // Holonic connects to existing concepts
  { source: "con-identity-independence", target: "std-did", type: "extends" },
  { source: "con-identity-independence", target: "con-gap", type: "extends" },
  { source: "con-multi-provider", target: "con-separation", type: "extends" },
  { source: "con-multi-provider", target: "tech-ethereum", type: "implements" },
  { source: "con-multi-provider", target: "skill-cross-chain", type: "implements" },
  { source: "con-holonic-braid", target: "skill-aiagent", type: "extends" },
  { source: "con-agent-memory", target: "skill-aiagent", type: "implements" },

  // Holonic skills implement concepts
  { source: "skill-holonic", target: "con-holon", type: "implements" },
  { source: "skill-holonic", target: "con-shared-parent", type: "implements" },
  { source: "skill-provider-abstraction", target: "con-multi-provider", type: "implements" },
  { source: "skill-provider-abstraction", target: "tech-hyperdrive", type: "implements" },
  { source: "skill-chain-agnostic", target: "con-multi-provider", type: "implements" },
  { source: "skill-chain-agnostic", target: "skill-cross-chain", type: "extends" },

  // Persona knows holonic content
  { source: "per-holonic-architect", target: "skill-holonic", type: "persona_knows" },
  { source: "per-holonic-architect", target: "skill-provider-abstraction", type: "persona_knows" },
  { source: "per-holonic-architect", target: "skill-chain-agnostic", type: "persona_knows" },
  { source: "per-holonic-architect", target: "tech-oasis", type: "persona_knows" },
  { source: "per-holonic-architect", target: "tech-hyperdrive", type: "persona_knows" },
  { source: "per-holonic-architect", target: "con-holonic-braid", type: "persona_knows" },
  { source: "per-holonic-architect", target: "doc-holonic", type: "persona_knows" },

  // Existing personas who should know holonic concepts
  { source: "per-architect", target: "skill-holonic", type: "persona_knows" },
  { source: "per-architect", target: "con-holonic-braid", type: "persona_knows" },
  { source: "per-architect", target: "con-holonic-marvin", type: "persona_knows" },
  { source: "per-drake", target: "con-holon", type: "persona_knows" },
  { source: "per-drake", target: "con-shared-parent", type: "persona_knows" },

  // Holonic references Promise Theory (mentioned in whitepaper)
  { source: "con-holon", target: "con-promisetheory", type: "references" },
];
