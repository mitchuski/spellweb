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
  { source: "fp-act-24", target: "fp-act-25", type: "follows" },
  { source: "fp-act-25", target: "fp-act-26", type: "follows" },
  { source: "fp-act-26", target: "fp-act-27", type: "follows" },
  { source: "fp-act-27", target: "fp-act-28", type: "follows" },
  { source: "fp-act-28", target: "fp-act-29", type: "follows" },
  { source: "fp-act-29", target: "fp-act-30", type: "follows" },
  { source: "fp-act-30", target: "fp-act-31", type: "follows" },

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
  { source: "skill-selective", target: "con-privacypools", type: "implements" },

  // Nullifier design
  { source: "skill-nullifier", target: "con-zkproofs", type: "implements" },
  { source: "skill-nullifier", target: "con-privacypools", type: "implements" },

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
  { source: "skill-intel-pooling", target: "con-privacypools", type: "implements" },
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

  { source: "proto-x402", target: "con-dualagent", type: "implements" },
  { source: "proto-x402", target: "skill-agent-interop", type: "implements" },

  { source: "proto-vrc", target: "con-vrc", type: "implements" },
  { source: "proto-vrc", target: "std-vc", type: "extends" },
  { source: "proto-vrc", target: "std-did", type: "extends" },

  { source: "proto-rpp", target: "con-rpp", type: "implements" },
  { source: "proto-rpp", target: "doc-zypher", type: "references" },

  // Merged proto → con relationships
  { source: "con-myterms", target: "skill-consent", type: "implements" },

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
  { source: "per-warden", target: "con-myterms", type: "persona_knows" },

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
  { source: "zk-tale-30", target: "zk-tale-31", type: "follows" },

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

  { source: "spellbook-zk", target: "zk-tale-2", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-3", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-4", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-5", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-6", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-7", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-8", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-9", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-10", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-11", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-13", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-14", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-15", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-16", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-17", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-18", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-19", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-20", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-21", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-22", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-24", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-25", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-26", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-27", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-28", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-29", type: "defines" },
  { source: "spellbook-zk", target: "zk-tale-31", type: "defines" },

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
// Act 31 persona knowledge
  { source: "per-soulbis", target: "con-amnesia-protocol", type: "persona_knows" },
  { source: "per-soulbis", target: "per-moon", type: "persona_knows" },
  { source: "per-soulbis", target: "con-zk-orbit", type: "persona_knows" },
  { source: "per-soulbae", target: "con-quaternion", type: "persona_knows" },
  { source: "per-soulbae", target: "con-emissary-recursion", type: "persona_knows" },
  { source: "per-soulbae", target: "con-life-forge", type: "persona_knows" },
  { source: "per-drake", target: "con-quaternion", type: "persona_knows" },
  { source: "per-drake", target: "con-amnesia-protocol", type: "persona_knows" },
  { source: "per-drake", target: "con-theia", type: "persona_knows" },
  { source: "per-chronicler", target: "doc-amnesia-poems", type: "persona_knows" },

  // V5.3 Ceremony Personas
  { source: "per-dragonwaker", target: "per-drake", type: "persona_knows" },
  { source: "per-dragonwaker", target: "skill-dragon-flight", type: "persona_knows" },
  { source: "per-dragonwaker", target: "con-dragon-vertex", type: "persona_knows" },
  { source: "per-dragonwaker", target: "fp-act-29", type: "persona_knows" },

  { source: "per-mirrorkeeper", target: "con-dihedral", type: "persona_knows" },
  { source: "per-mirrorkeeper", target: "skill-spellweb", type: "persona_knows" },
  { source: "per-mirrorkeeper", target: "fp-act-30", type: "persona_knows" },

  { source: "per-forgecaller", target: "skill-hexagram-convergence", type: "persona_knows" },
  { source: "per-forgecaller", target: "per-forgemaster", type: "persona_knows" },
  { source: "per-forgecaller", target: "fp-act-27", type: "persona_knows" },

  { source: "per-manaweaver", target: "skill-mana-economy", type: "persona_knows" },
  { source: "per-manaweaver", target: "skill-pretext-measurement", type: "persona_knows" },
  { source: "per-manaweaver", target: "fp-act-28", type: "persona_knows" },

  // Holonic references Promise Theory (mentioned in whitepaper)
  { source: "con-holon", target: "con-promisetheory", type: "references" },

  // ══════════════════════════════════════════════════════════════
  // V5 PERSONA RELATIONSHIPS (Acts XXV-XXVI Integration)
  // ══════════════════════════════════════════════════════════════

  // Sith (Red Team) knowledge
  { source: "per-sith", target: "skill-darkforest", type: "persona_knows" },
  { source: "per-sith", target: "skill-threat", type: "persona_knows" },
  { source: "per-sith", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-sith", target: "con-separation", type: "persona_knows" },
  { source: "per-sith", target: "thm-ceiling", type: "persona_knows" },

  // Netkeeper (Mesh) knowledge
  { source: "per-netkeeper", target: "skill-mesh-architecture", type: "persona_knows" },
  { source: "per-netkeeper", target: "con-mesh-sovereignty", type: "persona_knows" },
  { source: "per-netkeeper", target: "skill-darkforest", type: "persona_knows" },
  { source: "per-netkeeper", target: "con-three-axis-separation", type: "persona_knows" },
  { source: "per-netkeeper", target: "skill-enclave", type: "persona_knows" },

  // Priest (Ceremony) knowledge
  { source: "per-priest", target: "skill-key-ceremony", type: "persona_knows" },
  { source: "per-priest", target: "spell-ceremony", type: "persona_knows" },
  { source: "per-priest", target: "con-vrc", type: "persona_knows" },
  { source: "per-priest", target: "skill-proverbiogenesis", type: "persona_knows" },

  // Person (First Person) knowledge
  { source: "per-person", target: "con-7thcapital", type: "persona_knows" },
  { source: "per-person", target: "con-gap", type: "persona_knows" },
  { source: "per-person", target: "spellbook-firstperson", type: "persona_knows" },

  // Kyra (Vision) knowledge
  { source: "per-kyra", target: "skill-intel-pooling", type: "persona_knows" },
  { source: "per-kyra", target: "skill-darkforest", type: "persona_knows" },
  { source: "per-kyra", target: "con-dragon-vertex", type: "persona_knows" },

  // Jedi (Balance) knowledge
  { source: "per-jedi", target: "con-dualagent", type: "persona_knows" },
  { source: "per-jedi", target: "con-gap", type: "persona_knows" },
  { source: "per-jedi", target: "skill-separation", type: "persona_knows" },
  { source: "per-jedi", target: "con-master-emissary", type: "persona_knows" },

  // Herald (Standards) knowledge
  { source: "per-herald", target: "skill-governance", type: "persona_knows" },
  { source: "per-herald", target: "org-bgin", type: "persona_knows" },
  { source: "per-herald", target: "skill-plurality", type: "persona_knows" },

  // Archer (Precision) knowledge
  { source: "per-archer", target: "skill-selective", type: "persona_knows" },
  { source: "per-archer", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-archer", target: "con-zkproofs", type: "persona_knows" },

  // ══════════════════════════════════════════════════════════════
  // V5 SKILL → CONCEPT RELATIONSHIPS
  // ══════════════════════════════════════════════════════════════

  // Mesh Architecture connections
  { source: "skill-mesh-architecture", target: "con-mesh-sovereignty", type: "implements" },
  { source: "skill-mesh-architecture", target: "con-three-axis-separation", type: "extends" },
  { source: "skill-mesh-architecture", target: "con-separation", type: "implements" },

  // Media Plurality connections
  { source: "skill-media-plurality", target: "skill-plurality", type: "extends" },
  { source: "skill-media-plurality", target: "con-plurality", type: "implements" },
  { source: "per-witness", target: "skill-media-plurality", type: "persona_knows" },
  { source: "per-chronicler", target: "skill-media-plurality", type: "persona_knows" },

  // Hemispheric Attention connections
  { source: "skill-hemispheric-attention", target: "con-master-emissary", type: "implements" },
  { source: "skill-hemispheric-attention", target: "con-gap", type: "extends" },
  { source: "skill-hemispheric-attention", target: "con-dualagent", type: "references" },

  // Environmental Commons connections
  { source: "skill-environmental-commons", target: "skill-governance", type: "extends" },
  { source: "skill-environmental-commons", target: "skill-plurality", type: "extends" },
  { source: "per-shipwright", target: "skill-environmental-commons", type: "persona_knows" },

  // Guild Efficiency connections
  { source: "skill-guild-efficiency", target: "con-shared-parent", type: "implements" },
  { source: "skill-guild-efficiency", target: "con-braid", type: "extends" },
  { source: "skill-guild-efficiency", target: "con-c8-guild-scalability", type: "references" },
  { source: "per-shipwright", target: "skill-guild-efficiency", type: "persona_knows" },
  { source: "per-weaver", target: "skill-guild-efficiency", type: "persona_knows" },

  // Spellweb Navigation connections
  { source: "skill-spellweb", target: "skill-path-integral", type: "implements" },
  { source: "skill-spellweb", target: "skill-grimoire", type: "extends" },
  { source: "skill-spellweb", target: "con-holographic-bound", type: "references" },
  { source: "per-chronicler", target: "skill-spellweb", type: "persona_knows" },
  { source: "per-pedagogue", target: "skill-spellweb", type: "persona_knows" },

  // Path Integral connections
  { source: "skill-path-integral", target: "skill-edge-value", type: "extends" },
  { source: "skill-path-integral", target: "con-holographic-bound", type: "implements" },

  // Compression Defence connections
  { source: "skill-compression-defence", target: "con-braid", type: "implements" },
  { source: "skill-compression-defence", target: "con-compression-spectrum", type: "extends" },
  { source: "skill-compression-defence", target: "con-c7-compression", type: "references" },

  // Master-Emissary Pattern connections
  { source: "skill-master-emissary", target: "con-master-emissary", type: "implements" },
  { source: "skill-master-emissary", target: "skill-hemispheric-attention", type: "extends" },
  { source: "skill-master-emissary", target: "con-dualagent", type: "references" },

  // ══════════════════════════════════════════════════════════════
  // V5 CONCEPT RELATIONSHIPS
  // ══════════════════════════════════════════════════════════════

  // Master-Emissary concept connections
  { source: "con-master-emissary", target: "con-dualagent", type: "extends" },
  { source: "con-master-emissary", target: "con-gap", type: "implements" },
  { source: "con-master-emissary", target: "per-soulbis", type: "references" },
  { source: "con-master-emissary", target: "per-soulbae", type: "references" },

  // Mesh Sovereignty connections
  { source: "con-mesh-sovereignty", target: "con-separation", type: "implements" },
  { source: "con-mesh-sovereignty", target: "con-three-axis-separation", type: "extends" },

  // V5 Conjectures connections
  { source: "con-c6-holographic", target: "con-holographic-bound", type: "extends" },
  { source: "con-c6-holographic", target: "con-uor-torus", type: "references" },
  { source: "con-c7-compression", target: "con-braid", type: "extends" },
  { source: "con-c7-compression", target: "skill-compression-defence", type: "references" },
  { source: "con-c8-guild-scalability", target: "skill-guild-efficiency", type: "references" },
  { source: "con-c8-guild-scalability", target: "con-shared-parent", type: "extends" },
  { source: "con-c10-three-axis", target: "con-three-axis-separation", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // ACT 24 → V5 CONCEPT CONNECTIONS (expanding existing Act 24)
  // ══════════════════════════════════════════════════════════════
  { source: "fp-act-24", target: "con-master-emissary", type: "narrates" },
  { source: "fp-act-24", target: "skill-guild-efficiency", type: "narrates" },
  { source: "fp-act-24", target: "skill-path-integral", type: "narrates" },
  { source: "fp-act-24", target: "skill-compression-defence", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // ACT 25: THE DRAGON'S HIDE (Mesh Architecture)
  // ══════════════════════════════════════════════════════════════
  { source: "spellbook-firstperson", target: "fp-act-25", type: "defines" },
  { source: "fp-act-25", target: "skill-mesh-architecture", type: "narrates" },
  { source: "fp-act-25", target: "con-mesh-sovereignty", type: "narrates" },
  { source: "fp-act-25", target: "con-three-axis-separation", type: "narrates" },
  { source: "fp-act-25", target: "per-netkeeper", type: "narrates" },
  { source: "fp-act-25", target: "con-separation", type: "extends" },
  { source: "fp-act-25", target: "skill-media-plurality", type: "references" },

  // ══════════════════════════════════════════════════════════════
  // ACT 26: MASTER AND EMISSARY (Hemispheric Attention)
  // ══════════════════════════════════════════════════════════════
  { source: "spellbook-firstperson", target: "fp-act-26", type: "defines" },
  { source: "fp-act-26", target: "con-master-emissary", type: "narrates" },
  { source: "fp-act-26", target: "skill-hemispheric-attention", type: "narrates" },
  { source: "fp-act-26", target: "skill-master-emissary", type: "narrates" },
  { source: "fp-act-26", target: "con-dualagent", type: "extends" },
  { source: "fp-act-26", target: "con-gap", type: "extends" },
  { source: "fp-act-26", target: "per-soulbis", type: "narrates" },
  { source: "fp-act-26", target: "per-soulbae", type: "narrates" },
  { source: "fp-act-26", target: "skill-environmental-commons", type: "references" },

  // ══════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════
  // ACT 27: THE SWORDSMAN'S FORGE (V5.2 - Blade Configuration Mechanics)
  // ══════════════════════════════════════════════════════════════
  { source: "spellbook-firstperson", target: "fp-act-27", type: "defines" },
  { source: "fp-act-27", target: "per-soulbis", type: "narrates" },
  { source: "fp-act-27", target: "skill-blade-forge", type: "narrates" },
  { source: "fp-act-27", target: "skill-hexagram-convergence", type: "narrates" },
  { source: "fp-act-27", target: "skill-tetrahedral", type: "extends" },
  { source: "fp-act-27", target: "skill-uor-toroidal", type: "extends" },
  { source: "fp-act-27", target: "con-holographic-bound", type: "extends" },
  { source: "fp-act-27", target: "con-three-axis-separation", type: "extends" },
  { source: "fp-act-27", target: "fp-act-24", type: "extends" },
  { source: "fp-act-27", target: "fp-act-26", type: "extends" },
  { source: "fp-act-27", target: "skill-crypto-zkp", type: "narrates" },
  { source: "fp-act-27", target: "per-forgemaster", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // ACT 28: THE CEREMONY ENGINE (Pretext, dual extension, ceremonies)
  // ══════════════════════════════════════════════════════════════
  { source: "spellbook-firstperson", target: "fp-act-28", type: "defines" },
  { source: "fp-act-28", target: "con-dualagent", type: "extends" },
  { source: "fp-act-28", target: "con-gap", type: "extends" },
  { source: "fp-act-28", target: "con-myterms", type: "narrates" },
  { source: "fp-act-28", target: "con-rpp", type: "narrates" },
  { source: "fp-act-28", target: "skill-browser", type: "narrates" },
  { source: "fp-act-28", target: "per-soulbis", type: "narrates" },
  { source: "fp-act-28", target: "per-soulbae", type: "narrates" },
  { source: "fp-act-28", target: "fp-act-2", type: "extends" },
  { source: "fp-act-28", target: "fp-act-7", type: "extends" },
  { source: "fp-act-28", target: "fp-act-26", type: "extends" },
  { source: "fp-act-28", target: "skill-ceremony-engine", type: "narrates" },
  { source: "fp-act-28", target: "skill-pretext-measurement", type: "narrates" },
  { source: "fp-act-28", target: "skill-mana-economy", type: "narrates" },
  { source: "fp-act-28", target: "skill-hexagram-convergence", type: "narrates" },
  { source: "fp-act-28", target: "per-ceremonist", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // ACT 29: THE DRAGON WAKES (V5.2 - Quantum Defence & Dragon Flight)
  // ══════════════════════════════════════════════════════════════
  { source: "spellbook-firstperson", target: "fp-act-29", type: "defines" },
  { source: "fp-act-29", target: "skill-quantum-defence", type: "narrates" },
  { source: "fp-act-29", target: "skill-dragon-flight", type: "narrates" },
  { source: "fp-act-29", target: "skill-understanding-key", type: "extends" },
  { source: "fp-act-29", target: "skill-ceremony-engine", type: "extends" },
  { source: "fp-act-29", target: "per-quantum-sentinel", type: "narrates" },
  { source: "fp-act-29", target: "per-drake", type: "narrates" },
  { source: "fp-act-29", target: "fp-act-27", type: "extends" },
  { source: "fp-act-29", target: "fp-act-28", type: "extends" },
  { source: "fp-act-29", target: "fp-act-24", type: "extends" },
  { source: "fp-act-29", target: "fp-act-25", type: "extends" },
  { source: "fp-act-29", target: "con-holographic-bound", type: "extends" },
  { source: "fp-act-29", target: "skill-crypto-zkp", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // V5.2 PERSONA KNOWLEDGE (New Personas)
  // ══════════════════════════════════════════════════════════════
  { source: "per-forgemaster", target: "skill-blade-forge", type: "persona_knows" },
  { source: "per-forgemaster", target: "skill-hexagram-convergence", type: "persona_knows" },
  { source: "per-forgemaster", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-forgemaster", target: "skill-tetrahedral", type: "persona_knows" },
  { source: "per-forgemaster", target: "fp-act-27", type: "persona_knows" },

  { source: "per-ceremonist", target: "skill-ceremony-engine", type: "persona_knows" },
  { source: "per-ceremonist", target: "skill-understanding-key", type: "persona_knows" },
  { source: "per-ceremonist", target: "skill-mana-economy", type: "persona_knows" },
  { source: "per-ceremonist", target: "fp-act-28", type: "persona_knows" },
  { source: "per-ceremonist", target: "fp-act-29", type: "persona_knows" },

  { source: "per-quantum-sentinel", target: "skill-quantum-defence", type: "persona_knows" },
  { source: "per-quantum-sentinel", target: "skill-dragon-flight", type: "persona_knows" },
  { source: "per-quantum-sentinel", target: "skill-crypto-zkp", type: "persona_knows" },
  { source: "per-quantum-sentinel", target: "fp-act-29", type: "persona_knows" },

  // ══════════════════════════════════════════════════════════════
  // V5.2 SKILL RELATIONSHIPS
  // ══════════════════════════════════════════════════════════════
  { source: "skill-blade-forge", target: "skill-tetrahedral", type: "extends" },
  { source: "skill-blade-forge", target: "skill-uor-toroidal", type: "extends" },
  { source: "skill-blade-forge", target: "skill-crypto-zkp", type: "implements" },

  { source: "skill-hexagram-convergence", target: "skill-blade-forge", type: "extends" },
  { source: "skill-hexagram-convergence", target: "skill-tetrahedral", type: "references" },

  { source: "skill-ceremony-engine", target: "skill-understanding-key", type: "extends" },
  { source: "skill-ceremony-engine", target: "skill-vrc-identity", type: "extends" },

  { source: "skill-pretext-measurement", target: "skill-browser", type: "extends" },
  { source: "skill-pretext-measurement", target: "con-gap", type: "implements" },

  { source: "skill-mana-economy", target: "skill-sovereignty-econ", type: "extends" },

  { source: "skill-quantum-defence", target: "skill-crypto-zkp", type: "extends" },
  { source: "skill-quantum-defence", target: "skill-blade-forge", type: "references" },

  { source: "skill-dual-territory", target: "con-gap", type: "implements" },
  { source: "skill-dual-territory", target: "con-dualagent", type: "implements" },

  { source: "skill-dragon-flight", target: "skill-blade-forge", type: "extends" },
  { source: "skill-dragon-flight", target: "skill-ceremony-engine", type: "extends" },
  { source: "skill-dragon-flight", target: "skill-quantum-defence", type: "extends" },
  { source: "skill-dragon-flight", target: "skill-dragon", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // V5.2 SOULBIS/SOULBAE SKILL KNOWLEDGE UPDATES
  // ══════════════════════════════════════════════════════════════
  { source: "per-soulbis", target: "skill-blade-forge", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-pretext-measurement", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-quantum-defence", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-dual-territory", type: "persona_knows" },

  { source: "per-soulbae", target: "skill-ceremony-engine", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-hexagram-convergence", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-mana-economy", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-dragon-flight", type: "persona_knows" },

  // ══════════════════════════════════════════════════════════════
  // PVM-V5.2 PERSONA RELATIONSHIPS (UOR Convergence)
  // ══════════════════════════════════════════════════════════════
  { source: "per-soulbis", target: "per-algebraist", type: "parent_of" },
  { source: "per-soulbae", target: "per-stranger-witness", type: "parent_of" },
  { source: "per-soulbis", target: "con-dihedral", type: "embodies" },
  { source: "per-soulbae", target: "con-dihedral", type: "embodies" },

  // PVM-V5.2 CONCEPT RELATIONSHIPS
  { source: "con-dihedral", target: "con-ring-algebra", type: "requires" },
  { source: "con-holographic-bound", target: "skill-atlas-geometry", type: "implements" },
  { source: "con-understanding-as-key", target: "skill-stranger-ceremony", type: "implements" },

  // PVM-V5.2 ACT CONNECTIONS
  { source: "fp-act-27", target: "con-dihedral", type: "introduces" },
  { source: "fp-act-27", target: "con-ring-algebra", type: "introduces" },
  { source: "fp-act-27", target: "skill-five-strikes", type: "teaches" },
  { source: "fp-act-29", target: "con-understanding-as-key", type: "introduces" },
  { source: "fp-act-29", target: "skill-stranger-ceremony", type: "teaches" },

  // PVM-V5.2 NEW PERSONA SKILLS
  { source: "per-algebraist", target: "skill-ring-algebra", type: "persona_knows" },
  { source: "per-algebraist", target: "skill-five-strikes", type: "persona_knows" },
  { source: "per-algebraist", target: "con-dihedral", type: "persona_knows" },
  { source: "per-topologist", target: "skill-atlas-geometry", type: "persona_knows" },
  { source: "per-topologist", target: "con-holographic-bound", type: "persona_knows" },
  { source: "per-topologist", target: "skill-toroidal-witness", type: "persona_knows" },
  { source: "per-stranger-witness", target: "skill-stranger-ceremony", type: "persona_knows" },
  { source: "per-stranger-witness", target: "con-understanding-as-key", type: "persona_knows" },
  { source: "per-stranger-witness", target: "skill-derivation-certificate", type: "persona_knows" },

  // PVM-V5.2 SKILL RELATIONSHIPS
  { source: "skill-ring-algebra", target: "skill-blade-forge", type: "extends" },
  { source: "skill-dihedral-sovereignty", target: "con-dihedral", type: "implements" },
  { source: "skill-content-addressing", target: "skill-derivation-certificate", type: "extends" },
  { source: "skill-stranger-ceremony", target: "skill-ceremony-engine", type: "extends" },

  // ORPHAN NODE CONNECTIONS
  // con-content-addressing
  { source: "con-content-addressing", target: "con-three-layer-identity", type: "extends" },
  { source: "con-content-addressing", target: "skill-content-addressing", type: "implements" },

  // skill-academic, skill-forensic, skill-revocation
  { source: "per-soulbis", target: "skill-forensic", type: "persona_knows" },
  { source: "per-soulbis", target: "skill-revocation", type: "persona_knows" },
  { source: "per-soulbae", target: "skill-academic", type: "persona_knows" },
  { source: "skill-forensic", target: "con-privacypools", type: "implements" },
  { source: "skill-revocation", target: "skill-crypto-zkp", type: "extends" },

  // thm-degradation
  { source: "thm-degradation", target: "con-gap", type: "implements" },

  // ══════════════════════════════════════════════════════════════
  // v10.0.0 NODE CONNECTIONS
  // ══════════════════════════════════════════════════════════════

  // Act 30: Dihedral Mirror connections
  { source: "spellbook-firstperson", target: "fp-act-30", type: "defines" },
  { source: "fp-act-30", target: "con-dihedral", type: "narrates" },
  { source: "fp-act-30", target: "con-ring-algebra", type: "narrates" },
  { source: "fp-act-30", target: "con-atlas-resonance", type: "introduces" },
  { source: "fp-act-30", target: "con-prism-spectrum", type: "introduces" },
  { source: "fp-act-30", target: "con-serenity-kernel", type: "introduces" },
  { source: "fp-act-30", target: "spell-dihedral-door", type: "compresses_to" },
  { source: "fp-act-30", target: "fp-act-27", type: "extends" },
  { source: "fp-act-30", target: "fp-act-29", type: "extends" },
  { source: "fp-act-30", target: "fp-act-26", type: "extends" },

// ══════════════════════════════════════════════════════════════
  // Act 31: The First Delegation connections
  // ══════════════════════════════════════════════════════════════  { source: "spellbook-firstperson", target: "fp-act-31", type: "defines" },
  { source: "fp-act-31", target: "con-amnesia-protocol", type: "narrates" },
  { source: "fp-act-31", target: "con-theia", type: "narrates" },
  { source: "fp-act-31", target: "con-quaternion", type: "narrates" },
  { source: "fp-act-31", target: "con-zk-orbit", type: "narrates" },
  { source: "fp-act-31", target: "con-life-forge", type: "narrates" },
  { source: "fp-act-31", target: "con-merge-catastrophe", type: "narrates" },
  { source: "fp-act-31", target: "con-deflection", type: "narrates" },
  { source: "fp-act-31", target: "con-emissary-recursion", type: "narrates" },
  { source: "fp-act-31", target: "per-moon", type: "narrates" },
  { source: "fp-act-31", target: "per-sun", type: "narrates" },
  { source: "fp-act-31", target: "per-theia", type: "narrates" },
  { source: "fp-act-31", target: "per-life", type: "narrates" },
  { source: "fp-act-31", target: "per-soulbis", type: "narrates" },
  { source: "fp-act-31", target: "per-soulbae", type: "narrates" },
  { source: "fp-act-31", target: "per-drake", type: "narrates" },
  { source: "fp-act-31", target: "fp-act-30", type: "extends" },
  { source: "fp-act-31", target: "fp-act-26", type: "extends" },
  { source: "fp-act-31", target: "fp-act-7", type: "extends" },
  // Amnesia Protocol concept relationships  { source: "con-amnesia-protocol", target: "con-separation", type: "relates_to" },
  { source: "con-amnesia-protocol", target: "con-zkproofs", type: "relates_to" },
  { source: "con-theia", target: "con-amnesia-protocol", type: "relates_to" },
  { source: "con-quaternion", target: "con-master-emissary", type: "relates_to" },
  { source: "con-zk-orbit", target: "con-zkproofs", type: "relates_to" },
  { source: "con-zk-orbit", target: "con-promisetheory", type: "relates_to" },
  { source: "con-merge-catastrophe", target: "con-gap", type: "relates_to" },
  { source: "con-merge-catastrophe", target: "con-separation", type: "relates_to" },
  { source: "con-life-forge", target: "skill-blade-forge", type: "relates_to" },
  { source: "con-quaternion", target: "con-master-emissary", type: "compresses_to" },
  { source: "con-zk-orbit", target: "con-zkproofs", type: "compresses_to" },
  // Amnesia poems document
  { source: "doc-amnesia-poems", target: "fp-act-31", type: "relates_to" },
  { source: "doc-amnesia-poems", target: "con-amnesia-protocol", type: "defines" },
  { source: "doc-amnesia-poems", target: "con-deflection", type: "defines" },
  { source: "doc-amnesia-poems", target: "con-quaternion", type: "defines" },
  // Cosmological persona relationships — The Quaternion
  // Sun (Master) → Earth (Emissary=Soulbae) → Moon (Swordsman=Soulbis) + Human (Person)
  // Earth delegates through: Theia (instant→Moon) and Life (gradual→Human)
  { source: "per-sun", target: "per-soulbae", type: "generates" },       // Sun is Master, Earth/Soulbae is Emissary
  { source: "per-soulbae", target: "per-theia", type: "delegates_via" }, // Earth delegates instantly via Theia
  { source: "per-soulbae", target: "per-life", type: "delegates_via" },  // Earth delegates gradually via Life
  { source: "per-theia", target: "per-moon", type: "generates" },        // Theia collision creates Moon
  { source: "per-moon", target: "per-soulbis", type: "manifests_as" },   // Moon manifests as Soulbis
  { source: "per-life", target: "per-person", type: "generates" },       // Life produces Human/Person
  { source: "per-sun", target: "per-moon", type: "reflects_through" },   // Sun's light reflects through Moon
  { source: "per-moon", target: "per-theia", type: "remembers" },        // Moon remembers Theia (the wound)
  // Emissary poem and concept connections
  { source: "doc-emissary-poem", target: "con-emissary-recursion", type: "defines" },
  { source: "doc-emissary-poem", target: "spell-emissary-recursion", type: "compresses_to" },
  { source: "con-emissary-recursion", target: "con-master-emissary", type: "extends" },
  { source: "con-emissary-recursion", target: "fp-act-26", type: "narrates" },
  { source: "spell-emissary-recursion", target: "con-emissary-recursion", type: "compresses_to" },

  // New concept relationships
  { source: "con-serenity-kernel", target: "con-dihedral", type: "implements" },
  { source: "con-atlas-resonance", target: "con-holographic-bound", type: "implements" },
  { source: "con-prism-spectrum", target: "con-ring-algebra", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // V5.4 EDGES (April 12, 2026) — Betweenness Centrality & Selene's Proof
  // ══════════════════════════════════════════════════════════════
  // Betweenness Centrality relationships
  { source: "con-betweenness-centrality", target: "con-gap", type: "defines" },
  { source: "con-betweenness-centrality", target: "doc-privacy-value-v5", type: "referenced_in" },
  { source: "con-gap", target: "con-betweenness-centrality", type: "measured_by" },
  { source: "con-betweenness-centrality", target: "con-promisetheory", type: "relates_to" },
  // Selene's Proof relationships
  { source: "con-selenes-proof", target: "con-zk-orbit", type: "names" },
  { source: "con-selenes-proof", target: "con-amnesia-protocol", type: "proves" },
  { source: "con-selenes-proof", target: "per-moon", type: "defines" },
  { source: "per-theia", target: "con-selenes-proof", type: "proves" },
  { source: "con-selenes-proof", target: "con-zkproofs", type: "relates_to" },
  { source: "con-zk-orbit", target: "con-selenes-proof", type: "compresses_to" },
  { source: "con-selenes-proof", target: "con-gap", type: "relates_to" },

  // New document connections
  { source: "doc-what-agentprivacy-is", target: "con-paradox", type: "defines" },
  { source: "doc-what-agentprivacy-is", target: "con-dualagent", type: "defines" },
  { source: "doc-systems-hexagram", target: "con-ring-algebra", type: "implements" },
  { source: "doc-systems-hexagram", target: "skill-blade-forge", type: "implements" },
  { source: "doc-dual-territory-ceremony", target: "skill-ceremony-engine", type: "implements" },
  { source: "doc-uor-mapping", target: "con-atlas-resonance", type: "implements" },
  { source: "doc-uor-mapping", target: "con-holographic-bound", type: "implements" },
  { source: "doc-zk-blade-forge", target: "skill-blade-forge", type: "implements" },
  { source: "doc-zk-blade-forge", target: "con-ring-algebra", type: "implements" },
  { source: "doc-privacy-value-v5", target: "con-three-axis-separation", type: "defines" },
  { source: "doc-privacy-value-v5", target: "con-holographic-bound", type: "defines" },

  // Origins spell connections
  { source: "spell-symphony-within", target: "per-soulbis", type: "narrates" },
  { source: "spell-symphony-within", target: "per-soulbae", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // CELESTIAL CEREMONY EDGES
  // ══════════════════════════════════════════════════════════════

  // Document connections
  { source: "doc-celestial-ceremonies", target: "con-sun-ceremony", type: "defines" },
  { source: "doc-celestial-ceremonies", target: "con-moon-ceremony", type: "defines" },
  { source: "doc-celestial-ceremonies", target: "con-aether-ceremony", type: "defines" },
  { source: "doc-celestial-ceremonies", target: "con-celestial-key", type: "defines" },
  { source: "doc-celestial-ceremonies", target: "doc-emissary-poem", type: "references" },
  { source: "doc-celestial-ceremonies", target: "doc-amnesia-poems", type: "references" },
  { source: "doc-celestial-ceremonies", target: "doc-tide-selene-poem", type: "references" },
  { source: "doc-celestial-key-guide", target: "con-celestial-key", type: "implements" },
  { source: "doc-celestial-key-guide", target: "skill-ceremonial-forge", type: "implements" },
  { source: "doc-celestial-key-guide", target: "con-progressive-trust", type: "defines" },
  { source: "doc-forging-celestial-overlap", target: "skill-blade-forge", type: "extends" },
  { source: "doc-forging-celestial-overlap", target: "skill-behavioural-density", type: "defines" },
  { source: "doc-forging-celestial-overlap", target: "con-celestial-key", type: "narrates" },
  { source: "doc-blade-pathway", target: "con-sun-ceremony", type: "implements" },
  { source: "doc-blade-pathway", target: "con-moon-ceremony", type: "implements" },
  { source: "doc-blade-pathway", target: "spell-sun-blade", type: "defines" },
  { source: "doc-blade-pathway", target: "spell-moon-blade", type: "defines" },

  // Sun Ceremony concept relationships
  { source: "con-sun-ceremony", target: "con-disclosure", type: "implements" },
  { source: "con-sun-ceremony", target: "con-witnessing", type: "requires" },
  { source: "con-sun-ceremony", target: "spell-sun-ceremony", type: "compresses_to" },
  { source: "con-sun-ceremony", target: "per-sun", type: "references" },
  { source: "con-sun-ceremony", target: "doc-emissary-poem", type: "references" },
  { source: "con-sun-ceremony", target: "con-moon-ceremony", type: "extends" },

  // Moon Ceremony concept relationships
  { source: "con-moon-ceremony", target: "con-reflection", type: "implements" },
  { source: "con-moon-ceremony", target: "con-cousin-blades", type: "defines" },
  { source: "con-moon-ceremony", target: "spell-moon-ceremony", type: "compresses_to" },
  { source: "con-moon-ceremony", target: "per-moon", type: "references" },
  { source: "con-moon-ceremony", target: "doc-amnesia-poems", type: "references" },
  { source: "con-moon-ceremony", target: "con-amnesia-protocol", type: "implements" },

  // Aether Ceremony concept relationships — the between, the third voice
  { source: "con-aether-ceremony", target: "con-gap", type: "implements" },
  { source: "con-aether-ceremony", target: "con-betweenness-centrality", type: "requires" },
  { source: "con-aether-ceremony", target: "con-selenes-proof", type: "defines" },
  { source: "con-aether-ceremony", target: "spell-aether-ceremony", type: "compresses_to" },
  { source: "con-aether-ceremony", target: "doc-tide-selene-poem", type: "references" },
  { source: "con-aether-ceremony", target: "con-amnesia-protocol", type: "relates_to" },
  { source: "con-sun-ceremony", target: "con-aether-ceremony", type: "extends" },
  { source: "con-moon-ceremony", target: "con-aether-ceremony", type: "extends" },

  // Tide/Orbit/Selene poem relationships
  { source: "doc-tide-selene-poem", target: "con-selenes-proof", type: "defines" },
  { source: "doc-tide-selene-poem", target: "con-gap", type: "relates_to" },
  { source: "doc-tide-selene-poem", target: "con-amnesia-protocol", type: "relates_to" },
  { source: "doc-tide-selene-poem", target: "spell-aether-ceremony", type: "compresses_to" },
  { source: "per-cosmologist", target: "doc-tide-selene-poem", type: "persona_knows" },
  { source: "per-chronicler", target: "doc-tide-selene-poem", type: "persona_knows" },

  // Celestial Key relationships
  { source: "con-celestial-key", target: "con-sun-ceremony", type: "implements" },
  { source: "con-celestial-key", target: "con-moon-ceremony", type: "implements" },
  { source: "con-celestial-key", target: "con-aether-ceremony", type: "implements" },
  { source: "con-celestial-key", target: "spell-celestial-key", type: "compresses_to" },
  { source: "con-celestial-key", target: "skill-trust-graph-formation", type: "implements" },
  { source: "con-celestial-key", target: "con-bilateral-witness", type: "defines" },

  // Ceremony propagation
  { source: "con-propagation", target: "con-sun-ceremony", type: "narrates" },
  { source: "con-propagation", target: "con-moon-ceremony", type: "narrates" },
  { source: "con-propagation", target: "con-aether-ceremony", type: "narrates" },
  { source: "con-propagation", target: "con-emissary-recursion", type: "implements" },

  // Disclosure/Reflection concepts
  { source: "con-disclosure", target: "per-sun", type: "references" },
  { source: "con-reflection", target: "per-moon", type: "references" },
  { source: "con-reflection", target: "con-amnesia-protocol", type: "implements" },
  { source: "con-witnessing", target: "con-disclosure", type: "extends" },

  // Persona ceremony connections
  { source: "per-sun", target: "con-sun-ceremony", type: "persona_knows" },
  { source: "per-moon", target: "con-moon-ceremony", type: "persona_knows" },
  { source: "per-theia", target: "con-celestial-key", type: "persona_knows" },
  { source: "per-forgemaster", target: "skill-ceremonial-forge", type: "persona_knows" },
  { source: "per-forgecaller", target: "con-sun-ceremony", type: "persona_knows" },
  { source: "per-forgecaller", target: "con-moon-ceremony", type: "persona_knows" },

  // Blade spell connections
  { source: "spell-sun-blade", target: "con-sun-ceremony", type: "compresses_to" },
  { source: "spell-moon-blade", target: "con-moon-ceremony", type: "compresses_to" },
  { source: "spell-paired-inscription", target: "spell-sun-blade", type: "extends" },
  { source: "spell-paired-inscription", target: "spell-moon-blade", type: "extends" },
  { source: "spell-sun-ceremony", target: "spell-emissary-recursion", type: "extends" },
  { source: "spell-moon-ceremony", target: "spell-master", type: "extends" },

  // Skill relationships
  { source: "skill-ceremonial-forge", target: "skill-blade-forge", type: "extends" },
  { source: "skill-ceremonial-forge", target: "skill-key-ceremony", type: "extends" },
  { source: "skill-witness-protocol", target: "con-witnessing", type: "implements" },
  { source: "skill-trust-graph-formation", target: "con-propagation", type: "implements" },
  { source: "skill-behavioural-density", target: "skill-compression-defence", type: "extends" },
  { source: "skill-reflect-connect", target: "con-moon-ceremony", type: "implements" },
  { source: "skill-reflect-connect", target: "con-propagation", type: "implements" },

  // Progressive trust relationships
  { source: "con-progressive-trust", target: "con-understanding-as-key", type: "implements" },
  { source: "con-progressive-trust", target: "skill-constellation", type: "implements" },
  { source: "con-progressive-trust", target: "skill-blade-forge", type: "implements" },
  { source: "con-progressive-trust", target: "con-trusttiers", type: "extends" },

  // Bilateral witness relationships
  { source: "con-bilateral-witness", target: "con-vrc", type: "extends" },
  { source: "con-bilateral-witness", target: "skill-witness-protocol", type: "implements" },

  // Sun Blade constellation path connections (per blade-pathway.md)
  { source: "per-soulbis", target: "fp-act-1", type: "narrates" },
  { source: "fp-act-1", target: "fp-act-2", type: "follows" },
  { source: "fp-act-2", target: "fp-act-26", type: "follows" },
  { source: "fp-act-26", target: "skill-hemispheric-attention", type: "narrates" },
  { source: "skill-hemispheric-attention", target: "spell-ceremony", type: "references" },
  { source: "spell-ceremony", target: "con-master-emissary", type: "references" },
  { source: "con-master-emissary", target: "con-gap", type: "defines" },
  { source: "con-gap", target: "fp-act-28", type: "narrates" },
  { source: "fp-act-28", target: "skill-understanding-key", type: "narrates" },
  { source: "skill-understanding-key", target: "con-7thcapital", type: "references" },
  { source: "con-7thcapital", target: "skill-spell-encoding", type: "references" },
  { source: "skill-spell-encoding", target: "per-person", type: "narrates" },

  // Moon Blade constellation path connections (per blade-pathway.md)
  { source: "per-soulbae", target: "fp-act-12", type: "narrates" },
  { source: "fp-act-12", target: "fp-act-7", type: "follows" },
  { source: "fp-act-7", target: "con-separation", type: "narrates" },
  { source: "con-separation", target: "con-zkproofs", type: "relates_to" },
  { source: "con-zkproofs", target: "con-master-emissary", type: "relates_to" },
  { source: "con-dualagent", target: "fp-act-24", type: "narrates" },
  { source: "fp-act-24", target: "con-holographic-bound", type: "defines" },
  { source: "con-holographic-bound", target: "con-three-axis-separation", type: "implements" },
  { source: "con-three-axis-separation", target: "skill-compression-defence", type: "implements" },
  { source: "skill-compression-defence", target: "skill-understanding-key", type: "extends" },
  { source: "skill-understanding-key", target: "spell-master", type: "references" },
  { source: "spell-master", target: "per-person", type: "narrates" },

  // ══════════════════════════════════════════════════════════════
  // V5.3.1 CEREMONY COMPLETE EDGES (April 2026)
  // ══════════════════════════════════════════════════════════════

  // Amnesia Protocol relationships (Act XXXI)
  { source: "skill-amnesia-protocol", target: "con-amnesia-protocol", type: "implements" },
  { source: "skill-amnesia-protocol", target: "per-moon", type: "defines" },
  { source: "skill-amnesia-protocol", target: "fp-act-31", type: "narrates" },

  // Theia Derivation relationships
  { source: "skill-theia-derivation", target: "con-theia", type: "implements" },
  { source: "skill-theia-derivation", target: "per-theia", type: "defines" },
  { source: "skill-theia-derivation", target: "skill-amnesia-protocol", type: "extends" },

  // Quaternion Mapping relationships
  { source: "skill-quaternion-mapping", target: "con-quaternion", type: "implements" },
  { source: "skill-quaternion-mapping", target: "per-sun", type: "relates_to" },
  { source: "skill-quaternion-mapping", target: "per-moon", type: "relates_to" },
  { source: "skill-quaternion-mapping", target: "per-life", type: "relates_to" },

  // Cosmological Bound relationships
  { source: "skill-cosmological-bound", target: "skill-quaternion-mapping", type: "extends" },
  { source: "skill-cosmological-bound", target: "skill-theia-derivation", type: "extends" },
  { source: "skill-cosmological-bound", target: "skill-amnesia-protocol", type: "extends" },
  { source: "skill-cosmological-bound", target: "fp-act-31", type: "narrates" },

  // Ceremony persona relationships
  { source: "per-dragonwaker", target: "skill-quantum-defence", type: "implements" },
  { source: "per-dragonwaker", target: "skill-dragon-flight", type: "implements" },
  { source: "per-dragonwaker", target: "fp-act-29", type: "narrates" },

  { source: "per-forgecaller", target: "skill-blade-forge", type: "implements" },
  { source: "per-forgecaller", target: "skill-hexagram-convergence", type: "implements" },
  { source: "per-forgecaller", target: "fp-act-27", type: "narrates" },

  { source: "per-manaweaver", target: "skill-pretext-measurement", type: "implements" },
  { source: "per-manaweaver", target: "skill-mana-economy", type: "implements" },
  { source: "per-manaweaver", target: "fp-act-28", type: "narrates" },

  { source: "per-mirrorkeeper", target: "skill-dual-territory", type: "implements" },
  { source: "per-mirrorkeeper", target: "skill-dihedral-sovereignty", type: "implements" },
  { source: "per-mirrorkeeper", target: "fp-act-30", type: "narrates" },

  { source: "per-moonkeeper", target: "skill-amnesia-protocol", type: "implements" },
  { source: "per-moonkeeper", target: "per-moon", type: "relates_to" },
  { source: "per-moonkeeper", target: "fp-act-31", type: "narrates" },

  { source: "per-cosmologist", target: "skill-cosmological-bound", type: "implements" },
  { source: "per-cosmologist", target: "skill-quaternion-mapping", type: "implements" },
  { source: "per-cosmologist", target: "fp-act-31", type: "narrates" },

  // Ceremony Act flow
  { source: "fp-act-27", target: "fp-act-28", type: "follows" },
  { source: "fp-act-28", target: "fp-act-29", type: "follows" },
  { source: "fp-act-29", target: "fp-act-30", type: "follows" },
  { source: "fp-act-30", target: "fp-act-31", type: "follows" },

  // ══════════════════════════════════════════════════════════════
  // V10.0.0 NOTATION CONCEPT EDGES (April 7, 2026)
  // ══════════════════════════════════════════════════════════════

  // Moon Phase Notation
  { source: "con-moon-phase-notation", target: "fp-act-27", type: "narrates" },
  { source: "con-moon-phase-notation", target: "skill-ring-algebra", type: "implements" },
  { source: "con-moon-phase-notation", target: "per-moon", type: "references" },

  // Celestial Ceremony Notation
  { source: "con-celestial-ceremony-notation", target: "fp-act-28", type: "narrates" },
  { source: "con-celestial-ceremony-notation", target: "con-celestial-key", type: "implements" },
  { source: "con-celestial-ceremony-notation", target: "con-sun-ceremony", type: "references" },
  { source: "con-celestial-ceremony-notation", target: "con-moon-ceremony", type: "references" },
  { source: "con-celestial-ceremony-notation", target: "con-aether-ceremony", type: "references" },

  // Runecraft Notation
  { source: "con-runecraft-notation", target: "fp-act-27", type: "narrates" },
  { source: "con-runecraft-notation", target: "skill-blade-forge", type: "implements" },
  { source: "con-runecraft-notation", target: "per-forgecaller", type: "references" },

  // Progressive Trust extends to Runecraft
  { source: "con-progressive-trust", target: "con-runecraft-notation", type: "extends" },

  // ══════════════════════════════════════════════════════════════
  // V10.2 / ZERO v2.0 EDGES (April 22, 2026)
  // Persona cameos, V(π,t) term anchors, spec references, chronicles, MyTerms
  // ══════════════════════════════════════════════════════════════

  // ─── Persona → Zero Tale cameos (from CHRONICLE_ZERO_SPELLBOOK_V2 §7) ───
  // Cipher: ZKP Protocol Engineer in arithmetization + circuit tales
  { source: "per-cipher", target: "zk-tale-5", type: "narrates" },
  { source: "per-cipher", target: "zk-tale-6", type: "narrates" },
  { source: "per-cipher", target: "zk-tale-8", type: "narrates" },
  { source: "per-cipher", target: "zk-tale-21", type: "narrates" },
  // Architect: System designer in zkVM + ecosystem tales
  { source: "per-architect", target: "zk-tale-19", type: "narrates" },
  { source: "per-architect", target: "zk-tale-20", type: "narrates" },
  { source: "per-architect", target: "zk-tale-22", type: "narrates" },
  // Sentinel: Infra security in toxic-waste + vulnerability tales
  { source: "per-sentinel", target: "zk-tale-18", type: "narrates" },
  { source: "per-sentinel", target: "zk-tale-26", type: "narrates" },
  // Ranger: Dark forest navigator in the Tornado mixing tale
  { source: "per-ranger", target: "zk-tale-24", type: "narrates" },

  // ─── Zero Tale → V(π,t) canonical term anchors ───
  // Umbrella equation — Tale 30 is the full synthesis
  { source: "zk-tale-30", target: "con-v-pi-t-equation", type: "implements" },
  { source: "zk-tale-30", target: "con-three-axis-separation", type: "narrates" },
  { source: "zk-tale-30", target: "con-betweenness-centrality", type: "narrates" },
  { source: "zk-tale-30", target: "con-selenes-proof", type: "narrates" },
  { source: "zk-tale-30", target: "con-holographic-bound", type: "narrates" },
  { source: "zk-tale-30", target: "con-drake-dragon-transformation", type: "narrates" },
  // P^1.5 — Tale 7 seeds, Tale 23 is canonical, Tale 24 extends via anonymity set
  { source: "zk-tale-7", target: "con-p-1-5", type: "introduces" },
  { source: "zk-tale-23", target: "con-p-1-5", type: "implements" },
  { source: "zk-tale-24", target: "con-p-1-5", type: "extends" },
  // A_h(τ) — Tale 11 whispers, Tale 12 canonical (IVC folding), Tales 15/16 extend, Tale 27 ecosystem-scale
  { source: "zk-tale-11", target: "con-a-h-tau", type: "introduces" },
  { source: "zk-tale-12", target: "con-a-h-tau", type: "implements" },
  { source: "zk-tale-15", target: "con-a-h-tau", type: "extends" },
  { source: "zk-tale-16", target: "con-a-h-tau", type: "extends" },
  { source: "zk-tale-27", target: "con-a-h-tau", type: "extends" },
  // ρ — Tale 8 first whisper, compounds through scaling/ceremony tales
  { source: "zk-tale-8", target: "con-rho-maturity", type: "introduces" },
  { source: "zk-tale-15", target: "con-rho-maturity", type: "extends" },
  { source: "zk-tale-17", target: "con-rho-maturity", type: "extends" },
  { source: "zk-tale-27", target: "con-rho-maturity", type: "extends" },
  // Φ(Σ) — Tale 25 first operational (rollup architecture = sovereignty geometry)
  { source: "zk-tale-25", target: "con-phi-sigma", type: "implements" },
  { source: "zk-tale-28", target: "con-phi-sigma", type: "extends" },
  { source: "con-phi-sigma", target: "con-three-axis-separation", type: "relates_to" },
  // T_∫(π) — zkVM trace tales carry the path integral
  { source: "zk-tale-19", target: "con-t-int-pi", type: "implements" },
  { source: "zk-tale-20", target: "con-t-int-pi", type: "extends" },
  { source: "zk-tale-22", target: "con-t-int-pi", type: "extends" },
  { source: "zk-tale-25", target: "con-t-int-pi", type: "extends" },
  // R(d) — Tale 18 canonical (Toxic Waste Dragon); Tale 26 catalogue
  { source: "zk-tale-18", target: "con-r-d", type: "implements" },
  { source: "zk-tale-26", target: "con-r-d", type: "extends" },
  { source: "zk-tale-18", target: "con-drake-dragon-transformation", type: "narrates" },

  // ─── V(π,t) umbrella relationships ───
  { source: "con-v-pi-t-equation", target: "con-p-1-5", type: "defines" },
  { source: "con-v-pi-t-equation", target: "con-a-h-tau", type: "defines" },
  { source: "con-v-pi-t-equation", target: "con-rho-maturity", type: "defines" },
  { source: "con-v-pi-t-equation", target: "con-phi-sigma", type: "defines" },
  { source: "con-v-pi-t-equation", target: "con-t-int-pi", type: "defines" },
  { source: "con-v-pi-t-equation", target: "con-r-d", type: "defines" },
  { source: "con-p-1-5", target: "con-holographic-bound", type: "relates_to" },
  { source: "con-drake-dragon-transformation", target: "con-v-pi-t-equation", type: "relates_to" },

  // ─── Zero Tale 1 → cosmological grounding ───
  { source: "zk-tale-1", target: "con-selenes-proof", type: "narrates" },
  { source: "zk-tale-1", target: "con-amnesia-protocol", type: "narrates" },

  // ─── Moon Phase notation grounded in Zero tales (all carry a phase) ───
  { source: "con-moon-phase-notation", target: "spellbook-zk", type: "implements" },
  { source: "doc-moon-phase-notation", target: "con-moon-phase-notation", type: "defines" },

  // ─── Last Page → Four Lines inscription ───
  { source: "con-four-lines", target: "spellbook-zk", type: "relates_to" },
  { source: "con-four-lines", target: "doc-celestial-ceremonies", type: "relates_to" },
  { source: "con-four-lines", target: "con-amnesia-protocol", type: "references" },

  // ─── ZK Blade Forge SPECIFICATION v1.0.1 ───
  { source: "doc-zk-blade-forge-spec", target: "con-betweenness-centrality", type: "references" },
  { source: "doc-zk-blade-forge-spec", target: "con-selenes-proof", type: "references" },
  { source: "doc-zk-blade-forge-spec", target: "con-three-axis-separation", type: "defines" },
  { source: "doc-zk-blade-forge-spec", target: "con-moon-phase-notation", type: "defines" },
  { source: "doc-zk-blade-forge-spec", target: "doc-zk-blade-forge", type: "extends" },
  { source: "fp-act-27", target: "doc-zk-blade-forge-spec", type: "implements" },
  { source: "zk-tale-30", target: "doc-zk-blade-forge-spec", type: "references" },

  // ─── Zero Tale 31 (Naming of the Unnamed / Blade 38 Lethe) ───
  // Complement edge (bnot): Blade 25 ⊥ Blade 38, XOR = Blade 63
  { source: "zk-tale-31", target: "zk-tale-25", type: "relates_to" },
  { source: "zk-tale-31", target: "zk-tale-7", type: "references" },
  { source: "zk-tale-31", target: "zk-tale-30", type: "references" },
  // V(π,t) term anchors — Tale 31 extends Φ(Σ), A_h(τ), ρ (disclosure-φ as sovereignty proportion)
  { source: "zk-tale-31", target: "con-phi-sigma", type: "extends" },
  { source: "zk-tale-31", target: "con-a-h-tau", type: "extends" },
  { source: "zk-tale-31", target: "con-rho-maturity", type: "extends" },
  // The proem: the Tide/Orbit/Selene poem opens the naming
  { source: "zk-tale-31", target: "doc-tide-selene-poem", type: "references" },
  { source: "zk-tale-31", target: "doc-zk-blade-forge-spec", type: "references" },

  // ─── Grimoire v10.2 doc node ───
  { source: "doc-privacymage-grimoire-v10-2", target: "spellbook-firstperson", type: "defines" },
  { source: "doc-privacymage-grimoire-v10-2", target: "spellbook-zk", type: "defines" },
  { source: "doc-privacymage-grimoire-v10-2", target: "con-v-pi-t-equation", type: "references" },

  // ─── Chronicle nodes ───
  { source: "doc-chronicle-zk-v2", target: "spellbook-zk", type: "references" },
  { source: "doc-chronicle-zk-v2", target: "doc-privacymage-grimoire-v10-2", type: "references" },
  { source: "doc-chronicle-zk-v2", target: "con-drake-dragon-transformation", type: "references" },
  { source: "doc-chronicle-v10-2-deploy", target: "doc-chronicle-zk-v2", type: "extends" },
  { source: "doc-chronicle-v10-2-deploy", target: "doc-privacymage-grimoire-v10-2", type: "references" },
  { source: "doc-chronicle-v10-2-deploy", target: "spellbook-firstperson", type: "references" },

  // ─── MyTerms / IEEE 7012 integration ───
  { source: "doc-myterms-alliance-application", target: "con-myterms", type: "references" },
  { source: "doc-ieee7012-integration-plan", target: "con-myterms", type: "implements" },
  { source: "doc-ieee7012-integration-plan", target: "con-three-axis-separation", type: "references" },
  { source: "doc-privacy-is-value-equation", target: "con-v-pi-t-equation", type: "defines" },
  { source: "doc-privacy-is-value-equation", target: "doc-ieee7012-integration-plan", type: "references" },
  { source: "per-soulbis", target: "doc-ieee7012-integration-plan", type: "persona_knows" },
  { source: "per-architect", target: "doc-ieee7012-integration-plan", type: "persona_knows" },

  // ─── Persona embodiments of V(π,t) terms ───
  // Soulbis anchors Protect-heavy terms; Soulbae anchors Project-heavy terms
  { source: "per-soulbis", target: "con-p-1-5", type: "embodies" },
  { source: "per-soulbis", target: "con-r-d", type: "embodies" },
  { source: "per-soulbae", target: "con-t-int-pi", type: "embodies" },
  { source: "per-soulbae", target: "con-rho-maturity", type: "embodies" },
  // Cosmological persona anchors
  { source: "per-moonkeeper", target: "con-selenes-proof", type: "embodies" },
  { source: "per-theia", target: "con-amnesia-protocol", type: "embodies" },
  { source: "per-topologist", target: "con-betweenness-centrality", type: "embodies" },
  { source: "per-holonic-architect", target: "con-holographic-bound", type: "embodies" },
  { source: "per-holonic-architect", target: "con-three-axis-separation", type: "embodies" },
];
