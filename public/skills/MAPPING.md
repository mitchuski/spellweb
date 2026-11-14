---
id: agent-skills-mapping
name: "Agent Skills Migration Mapping"
version: "5.3.1"
date: 2026-04-07
updated: 2026-06-21
origin: 0xagentprivacy
total_skills: 114
total_personas: 38
guide_skills: 28
grimoire_version: "9.4.1"
includes_ceremony_integration: true
note: "2026-06-21 — added the wikis/ category (19 fedwiki onboarding skills · the Librarian's Wikis · +19 to total_skills on this doc's skills-only basis). Counts across MAPPING/README/CODEX predate several cohorts and are being reconciled; the authoritative folder inventory is the directory tree (all folders incl. personas ≈ 166 after the 2026-07-02 +1 (guide-gatehouse · first Gatekeeper-kept wikis skill · persona aspects: cipher/herald/registry-keeper), 2026-06-28 +2 (llm-knowledge-base, resync) and 2026-06-27 +7 (claude-import, dsl, document, assets, see-section, compact-references, offline-check))."
---

# Agent Skills Migration Mapping

Complete mapping of agentprivacy-skills-v5 "Ceremony Complete" release.
Use this document to update webapp routing, imports, and skill discovery.

---

## Structure

```
agentprivacy-skills-v5/
├── .claude-plugin/plugin.json
├── privacy-layer/     (19 foundational skills)
├── role/              (64 domain skills)
├── meta/              (3 philosophical skills)
├── persona/           (38 persona skills)
└── wikis/             (29 skills · the Librarian's Wikis · 19 on 2026-06-21 + 7 on 2026-06-27 + 2 on 2026-06-28 + 1 on 2026-07-02: guide-gatehouse, Gatekeeper-kept)
```

Each skill folder contains:
- `SKILL.md` — Required entrypoint with YAML frontmatter + instructions
- `references/` — Optional detailed docs loaded on demand
- `assets/` — Optional static resources (proverbs, spells, templates)

---

## Wikis / Onboarding Skills (19) — the Librarian's Wikis (NEW · 2026-06-21)

The git-less onboarding/distribution layer. Vendored + re-framed from **skill.fedwiki.club** (pages titled "…Skill" are forkable Claude skills; owner "Anon" / "from marvin"). Kept by the **Librarian 🗃️** — the Layer-2 cast attachment of the Chronicler, resident in the Tower's Wikis. Each skill carries `category: guide`, `layer: onboarding`, `keeper: librarian`, and an `upstream:` provenance field. Thesis: **a fedwiki URL is a git-less clone** — `agentprivacy-wiki-to-skill` is the fork desk that materializes a `SKILL.md` from a wiki page on demand (forking, not lending — the journal is the lineage).

| Agent Skills Name | Folder | Description |
|------------------|--------|-------------|
| `agentprivacy-wiki-page` | `wikis/agentprivacy-wiki-page/` | Author fedwiki page JSON (story items, IDs, create journal, reindex) — the seed |
| `agentprivacy-wiki-to-skill` | `wikis/agentprivacy-wiki-to-skill/` | The fork desk — convert a wiki page → Claude SKILL.md (the git-less clone) |
| `agentprivacy-wiki-skill-library` | `wikis/agentprivacy-wiki-skill-library/` | The convention: "…Skill" pages = a forkable, federated skill library |
| `agentprivacy-wiki-skill-anatomy` | `wikis/agentprivacy-wiki-skill-anatomy/` | What a Claude skill is — SKILL.md format, storage, invocation |
| `agentprivacy-wiki-skill-vs-library` | `wikis/agentprivacy-wiki-skill-vs-library/` | Prompt-skill vs executable-library; when to graduate one to the other |
| `agentprivacy-wiki-journal` | `wikis/agentprivacy-wiki-journal/` | Strip a page journal to a clean create entry |
| `agentprivacy-wiki-ghost-pages` | `wikis/agentprivacy-wiki-ghost-pages/` | Server-generated lineup pages, never stored (html-form → FastAPI) |
| `agentprivacy-wiki-claude-ghost` | `wikis/agentprivacy-wiki-claude-ghost/` | Ghost page whose body is written live by Claude via the API |
| `agentprivacy-wiki-new-domain` | `wikis/agentprivacy-wiki-new-domain/` | Create a new local/private or public Nextcloud-synced wiki domain |
| `agentprivacy-wiki-reindex` | `wikis/agentprivacy-wiki-reindex/` | Rebuild a local domain's sitemap + search index after disk writes |
| `agentprivacy-wiki-merge` | `wikis/agentprivacy-wiki-merge/` | Analyze + clean a superseded domain (categorize/move/trash/delete) |
| `agentprivacy-wiki-delete-site` | `wikis/agentprivacy-wiki-delete-site/` | Permanently remove a public domain via WebDAV |
| `agentprivacy-wiki-welcome` | `wikis/agentprivacy-wiki-welcome/` | Create a welcome-visitors landing page (fixed 10-item structure) |
| `agentprivacy-wiki-nextcloud-push` | `wikis/agentprivacy-wiki-nextcloud-push/` | WebDAV-push a page when the desktop sync client stalls |
| `agentprivacy-wiki-create-plugin` | `wikis/agentprivacy-wiki-create-plugin/` | Scaffold a new wiki-plugin-{name} package (reconstructed · refresh) |
| `agentprivacy-wiki-document-plugin` | `wikis/agentprivacy-wiki-document-plugin/` | Publish plugin docs on plugin.fedwiki.club (reconstructed · refresh) |
| `agentprivacy-wiki-publish-plugin` | `wikis/agentprivacy-wiki-publish-plugin/` | End-to-end plugin release: docs/version/GitHub/npm (reconstructed · refresh) |
| `agentprivacy-wiki-searching-plugins` | `wikis/agentprivacy-wiki-searching-plugins/` | Six cost-ordered channels to find a plugin (or prove none exists) |
| `agentprivacy-wiki-similarity-plugin` | `wikis/agentprivacy-wiki-similarity-plugin/` | Semantic similarity search plugin (BGE vectors · two item types) |
| `agentprivacy-wiki-import` | `wikis/agentprivacy-wiki-import/` | Install a skill (or a whole set-of-skills page) from a fedwiki into the local agent — the import counterpart to wiki-to-skill |
| `agentprivacy-wiki-dsl` | `wikis/agentprivacy-wiki-dsl/` | The line-oriented plugin item-text DSL (UPPERCASE command · lowercase data · optional colon) |
| `agentprivacy-wiki-document` | `wikis/agentprivacy-wiki-document/` | Make a help page for a Claude skill + publish its SKILL.md as a downloadable asset |
| `agentprivacy-wiki-assets` | `wikis/agentprivacy-wiki-assets/` | Add an `# Assets` section (heading + assets item) above the `# See` section |
| `agentprivacy-wiki-see-section` | `wikis/agentprivacy-wiki-see-section/` | Write/tidy a page `## See` section — grouped wikilinks on compact lines |
| `agentprivacy-wiki-compact-references` | `wikis/agentprivacy-wiki-compact-references/` | Compact forked reference items into `[[wikilink]]` bullets inside a `# See` item |
| `agentprivacy-wiki-offline-check` | `wikis/agentprivacy-wiki-offline-check/` | Review a plugin/endpoint/script/skill for Offline Edit Mode correctness |
| `agentprivacy-wiki-llm-knowledge-base` | `wikis/agentprivacy-wiki-llm-knowledge-base/` | The LLM-Wiki pattern (persistent LLM-maintained knowledge base) + the agentprivacy federation as its worked instance |
| `agentprivacy-wiki-resync` | `wikis/agentprivacy-wiki-resync/` | The per-turn op: lint (`audit.js`) + one-command auto-sync (`resync.js`) of the federation |
| `agentprivacy-guide-gatehouse` | `wikis/agentprivacy-guide-gatehouse/` | The Gatehouse — sigil-gates: documents encrypted inside the public guide behind emoji-sigil + canon-proverb (PBKDF2 → AES-GCM, client-side decrypt at /gates/); letter-keyed vs canon-keyed classes; Workers deploy path. **First non-Librarian keeper in wikis/: kept by the Gatekeeper 🗡️👤** (the skill IS a gate) · crypto aspect → Cipher 🗡️🔐 · correspondence/mageletters aspect → Herald 🧙📡 · register aspect → Registry-keeper ⚚ · authored by the Chronicler 🧙📖 |

*Four skills marked "reconstructed · refresh" had their upstream `.json` return HTTP 404 at materialization (2026-06-21); their bodies were reconstructed from the sitemap synopsis + sibling cross-references and should be refreshed via `agentprivacy-wiki-to-skill` when the upstream pages resolve.*

---

## Privacy Layer Skills (19)

Always loaded as ground state. Mathematical foundations of the architecture.

### Original (9) — V5.0

| Agent Skills Name | Folder | Description |
|------------------|--------|-------------|
| `agentprivacy-dragon` | `privacy-layer/agentprivacy-dragon/` | Pattern-space intelligence, sovereign value conditions |
| `agentprivacy-edge-value` | `privacy-layer/agentprivacy-edge-value/` | Relationship value calculation, trust metrics |
| `agentprivacy-knowledgegraph` | `privacy-layer/agentprivacy-knowledgegraph/` | Graph structures, semantic relationships |
| `agentprivacy-network-topology` | `privacy-layer/agentprivacy-network-topology/` | Network structure analysis, connectivity |
| `agentprivacy-promise-theory` | `privacy-layer/agentprivacy-promise-theory/` | Bergstra & Burgess foundations, autonomy axiom |
| `agentprivacy-temporal-dynamics` | `privacy-layer/agentprivacy-temporal-dynamics/` | Time-based analysis, A(τ) memory |
| `agentprivacy-tetrahedral-sovereignty` | `privacy-layer/agentprivacy-tetrahedral-sovereignty/` | 64-vertex lattice, sovereignty dimensions |
| `agentprivacy-uor-toroidal` | `privacy-layer/agentprivacy-uor-toroidal/` | UOR torus, the 96/64 question (C4 reopened), recursive patterns |
| `agentprivacy-vrc-identity` | `privacy-layer/agentprivacy-vrc-identity/` | Verifiable Relationship Credentials |

### V5.1 Holographic (4)

| Agent Skills Name | Folder | Description |
|------------------|--------|-------------|
| `agentprivacy-holographic-bound` | `privacy-layer/agentprivacy-holographic-bound/` | Boundary encodes volume, P^1.5 ratio |
| `agentprivacy-three-axis-separation` | `privacy-layer/agentprivacy-three-axis-separation/` | Agent × Data × Inference separation |
| `agentprivacy-compression-defence` | `privacy-layer/agentprivacy-compression-defence/` | Compression spectrum, reconstruction resistance |
| `agentprivacy-path-integral` | `privacy-layer/agentprivacy-path-integral/` | T_∫(π) traversal proofs |

### V5.2 UOR Convergence (4)

| Agent Skills Name | Folder | Description |
|------------------|--------|-------------|
| `agentprivacy-ring-algebra` | `privacy-layer/agentprivacy-ring-algebra/` | Z/(2⁶)Z modular ring, five operations |
| `agentprivacy-content-addressing` | `privacy-layer/agentprivacy-content-addressing/` | Same bytes → same hash → same identity |
| `agentprivacy-atlas-geometry` | `privacy-layer/agentprivacy-atlas-geometry/` | 96-vertex Atlas of Resonance; 96/64 reading open (C4 reopened) |
| `agentprivacy-dihedral-sovereignty` | `privacy-layer/agentprivacy-dihedral-sovereignty/` | D₂ₙ group structure, neg∘bnot=succ |

### V5.3.1 Ceremony (2)

| Agent Skills Name | Folder | Ceremony Act | Description |
|------------------|--------|--------------|-------------|
| `agentprivacy-amnesia-protocol` | `privacy-layer/agentprivacy-amnesia-protocol/` | XXXI | The wound is the trust, cosmological quaternion |
| `agentprivacy-dragon-flight` | `privacy-layer/agentprivacy-dragon-flight/` | XXIX | Quantum threshold activation, manifold defence |

---

## Role Skills (64)

Domain knowledge loaded by persona on demand.

### Original (40) — V5.0

| Agent Skills Name | Folder |
|------------------|--------|
| `agentprivacy-academic` | `role/agentprivacy-academic/` |
| `agentprivacy-agent-interop` | `role/agentprivacy-agent-interop/` |
| `agentprivacy-ai-agent` | `role/agentprivacy-ai-agent/` |
| `agentprivacy-armor-progression` | `role/agentprivacy-armor-progression/` |
| `agentprivacy-boundary-enforcement` | `role/agentprivacy-boundary-enforcement/` |
| `agentprivacy-consent-infrastructure` | `role/agentprivacy-consent-infrastructure/` |
| `agentprivacy-constellation-method` | `role/agentprivacy-constellation-method/` |
| `agentprivacy-cross-chain` | `role/agentprivacy-cross-chain/` |
| `agentprivacy-crypto-zkp` | `role/agentprivacy-crypto-zkp/` |
| `agentprivacy-dark-forest` | `role/agentprivacy-dark-forest/` |
| `agentprivacy-data-dignity` | `role/agentprivacy-data-dignity/` |
| `agentprivacy-economics` | `role/agentprivacy-economics/` |
| `agentprivacy-enclave-operations` | `role/agentprivacy-enclave-operations/` |
| `agentprivacy-forensic-defense` | `role/agentprivacy-forensic-defense/` |
| `agentprivacy-governance-agents` | `role/agentprivacy-governance-agents/` |
| `agentprivacy-grimoire-navigation` | `role/agentprivacy-grimoire-navigation/` |
| `agentprivacy-hitchhiker-governance` | `role/agentprivacy-hitchhiker-governance/` |
| `agentprivacy-inscription-mechanics` | `role/agentprivacy-inscription-mechanics/` |
| `agentprivacy-intel-pooling` | `role/agentprivacy-intel-pooling/` |
| `agentprivacy-key-ceremony` | `role/agentprivacy-key-ceremony/` |
| `agentprivacy-lane-chronicle` | `role/agentprivacy-lane-chronicle/` |
| `agentprivacy-metadata-resistance` | `role/agentprivacy-metadata-resistance/` |
| `agentprivacy-narrative-compression` | `role/agentprivacy-narrative-compression/` |
| `agentprivacy-nullifier-design` | `role/agentprivacy-nullifier-design/` |
| `agentprivacy-perimeter-hardening` | `role/agentprivacy-perimeter-hardening/` |
| `agentprivacy-personhood-sybil` | `role/agentprivacy-personhood-sybil/` |
| `agentprivacy-plurality-cooperative` | `role/agentprivacy-plurality-cooperative/` |
| `agentprivacy-policy-governance` | `role/agentprivacy-policy-governance/` |
| `agentprivacy-proverbiogenesis` | `role/agentprivacy-proverbiogenesis/` |
| `agentprivacy-recovery-rpp` | `role/agentprivacy-recovery-rpp/` |
| `agentprivacy-reputation-credentials` | `role/agentprivacy-reputation-credentials/` |
| `agentprivacy-revocation-mechanics` | `role/agentprivacy-revocation-mechanics/` |
| `agentprivacy-selective-disclosure` | `role/agentprivacy-selective-disclosure/` |
| `agentprivacy-separation-enforcement` | `role/agentprivacy-separation-enforcement/` |
| `agentprivacy-sovereignty-economics` | `role/agentprivacy-sovereignty-economics/` |
| `agentprivacy-spell-encoding` | `role/agentprivacy-spell-encoding/` |
| `agentprivacy-story-diffusion` | `role/agentprivacy-story-diffusion/` |
| `agentprivacy-swordsman-browser` | `role/agentprivacy-swordsman-browser/` |
| `agentprivacy-threat-adversarial` | `role/agentprivacy-threat-adversarial/` |
| `agentprivacy-trust-spanning` | `role/agentprivacy-trust-spanning/` |
| `agentprivacy-understanding-as-key` | `role/agentprivacy-understanding-as-key/` |

### V5.1 Holographic & Plurality (10)

| Agent Skills Name | Folder | Description |
|------------------|--------|-------------|
| `agentprivacy-braid-reasoning` | `role/agentprivacy-braid-reasoning/` | Bounded reasoning graphs |
| `agentprivacy-environmental-commons` | `role/agentprivacy-environmental-commons/` | Plural coordination for environment |
| `agentprivacy-guild-efficiency` | `role/agentprivacy-guild-efficiency/` | 74× compression, generator-solver |
| `agentprivacy-hemispheric-attention` | `role/agentprivacy-hemispheric-attention/` | McGilchrist mapping |
| `agentprivacy-holonic-identity` | `role/agentprivacy-holonic-identity/` | OASIS identity model |
| `agentprivacy-holonic-persistence` | `role/agentprivacy-holonic-persistence/` | Multi-provider storage |
| `agentprivacy-holonic-reasoning` | `role/agentprivacy-holonic-reasoning/` | BRAID over holons |
| `agentprivacy-media-plurality` | `role/agentprivacy-media-plurality/` | Rebuilding shared reality |
| `agentprivacy-mesh-architecture` | `role/agentprivacy-mesh-architecture/` | Dragon's hide, Tailscale patterns |
| `agentprivacy-shared-parent-patterns` | `role/agentprivacy-shared-parent-patterns/` | O(1) agent coordination |
| `agentprivacy-spellweb` | `role/agentprivacy-spellweb/` | Knowledge graph visualization |

### V5.2 UOR Convergence (4)

| Agent Skills Name | Folder | Description |
|------------------|--------|-------------|
| `agentprivacy-five-strikes` | `role/agentprivacy-five-strikes/` | neg/bnot/xor/and/or transformations |
| `agentprivacy-derivation-certificate` | `role/agentprivacy-derivation-certificate/` | Content-addressed path records |
| `agentprivacy-stranger-ceremony` | `role/agentprivacy-stranger-ceremony/` | Trust genesis without prior relationship |
| `agentprivacy-toroidal-witness` | `role/agentprivacy-toroidal-witness/` | Infinite cyclic paths, computational hardness |

### V5.3.1 Ceremony (9)

| Agent Skills Name | Folder | Ceremony Act | Description |
|------------------|--------|--------------|-------------|
| `agentprivacy-blade-forge` | `role/agentprivacy-blade-forge/` | XXVII | ZK blade forging, six dimensions |
| `agentprivacy-ceremony-engine` | `role/agentprivacy-ceremony-engine/` | XXVIII | Five crossing types, bilateral verification |
| `agentprivacy-dual-territory` | `role/agentprivacy-dual-territory/` | XXX | Swordsman ⊥ Mage territories |
| `agentprivacy-hexagram-convergence` | `role/agentprivacy-hexagram-convergence/` | XXVII | I Ching mapping to sovereignty lattice |
| `agentprivacy-mana-economy` | `role/agentprivacy-mana-economy/` | XXVIII | Proof-of-practice, non-transferable energy |
| `agentprivacy-pretext-measurement` | `role/agentprivacy-pretext-measurement/` | XXVIII | DOM-free browser measurement |
| `agentprivacy-quantum-defence` | `role/agentprivacy-quantum-defence/` | XXIX | Post-quantum manifold strategies |
| `agentprivacy-quaternion-mapping` | `role/agentprivacy-quaternion-mapping/` | XXXI | Sun/Earth/Moon/Human cosmology |
| `agentprivacy-theia-derivation` | `role/agentprivacy-theia-derivation/` | XXXI | Origin witness, Theia impact pattern |

---

## Meta Skills (3)

Philosophical and cosmological foundations.

| Agent Skills Name | Folder | Description |
|------------------|--------|-------------|
| `agentprivacy-drake-dragon-duality` | `meta/agentprivacy-drake-dragon-duality/` | Drake (2D) → Dragon (6D) transformation |
| `agentprivacy-master-emissary` | `meta/agentprivacy-master-emissary/` | McGilchrist hemispheric thesis |
| `agentprivacy-cosmological-bound` | `meta/agentprivacy-cosmological-bound/` | Act XXXI: Sun/Earth/Moon/Human quaternion |

---

## Persona Skills (38)

Behavioural configurations organized by wing alignment.

Each persona folder contains:
- `SKILL.md` — Identity, operational patterns, skill guidance
- `references/constellation.md` — Spellbook path and example scenarios
- `references/interaction-model.md` — Persona-to-persona relationships
- `assets/proverb-and-spell.txt` — Canonical proverb and emoji spell

### Canonical (2) — Tier 0

| Persona | Wing | Emoji | ENS | Version |
|---------|------|-------|-----|---------|
| `agentprivacy-soulbis` | swordsman | ⚔️ | privacysoulbis.eth | V5.3 |
| `agentprivacy-soulbae` | mage | 🧙 | privacysoulbae.eth | V5.3 |

### Swordsman Wing (10)

| Persona | Emoji | Tier | Description |
|---------|-------|------|-------------|
| `agentprivacy-archer` | 🗡️🎯 | 1 | Precision privacy enforcer |
| `agentprivacy-cipher` | 🗡️🔐 | 1 | ZKP protocol engineer |
| `agentprivacy-gatekeeper` | 🗡️👤 | 1 | Proof-of-personhood researcher |
| `agentprivacy-netkeeper` | 🗡️🕸️ | 2 | Mesh network builder |
| `agentprivacy-ranger` | 🗡️🌲 | 1 | Dark forest strategist |
| `agentprivacy-sentinel` | 🗡️🛡️ | 1 | Infrastructure security |
| `agentprivacy-sith` | 🗡️🔴 | 2 | Adversarial researcher (red team) |
| `agentprivacy-warden` | 🗡️🌐 | 1 | Browser privacy builder |
| `agentprivacy-algebraist` | ⚔️🔢 | 1 | Guardian of Z/(2⁶)Z ring |
| `agentprivacy-quantum-sentinel` | ⚔️⚛️ | 2 | Post-quantum boundary guardian |

### Mage Wing (9)

| Persona | Emoji | Tier | Description |
|---------|-------|------|-------------|
| `agentprivacy-ambassador` | 🧙⚖️ | 1 | Standards & governance |
| `agentprivacy-assessor` | 🧙💰 | 1 | Privacy data economist |
| `agentprivacy-chronicler` | 🧙📖 | 1 | Knowledge compression builder |
| `agentprivacy-priest` | 🧙🕯️ | 1 | Ceremony protocol designer |
| `agentprivacy-shipwright` | 🧙🏴‍☠️ | 1 | DAO & community architect |
| `agentprivacy-weaver` | 🧙⿻ | 1 | Plural technology researcher |
| `agentprivacy-stranger-witness` | 🧙👥 | 2 | Proof without introduction |
| `agentprivacy-manaweaver` | 🌊📜 | 2 | Pretext librarian, DOM-free |
| `agentprivacy-cosmologist` | 🔭🌌 | 2 | Quaternion observer |

### Balanced Wing (11)

| Persona | Emoji | Tier | Description |
|---------|-------|------|-------------|
| `agentprivacy-architect` | ☯️🤖 | 1 | AI agent system designer |
| `agentprivacy-healer` | ☯️🏥 | 1 | Healthcare privacy architect |
| `agentprivacy-jedi` | ☯️⚖️ | 2 | Force balance keeper |
| `agentprivacy-kyra` | ☯️🔮 | 2 | Vision & strategic planning |
| `agentprivacy-pedagogue` | ☯️🎓 | 1 | Privacy education designer |
| `agentprivacy-person` | 😊 | 0 | The First Person |
| `agentprivacy-witness` | ☯️📰 | 1 | Privacy-preserving journalist |
| `agentprivacy-holonic-architect` | ☯️🔷 | 2 | Identity-independent data structures |
| `agentprivacy-topologist` | ☯️🌐 | 2 | Reader of boundaries |
| `agentprivacy-herald` | 📯 | 2 | Protocol announcer |
| `agentprivacy-mirrorkeeper` | 🪞✨ | 2 | Dihedral convergence navigator |

### V5.3.1 Ceremony Personas (6)

| Persona | Wing | Emoji | Ceremony Act | Description |
|---------|------|-------|--------------|-------------|
| `agentprivacy-forgemaster` | swordsman | ⚔️🔨 | XXVII | Sovereignty lattice smith |
| `agentprivacy-ceremonist` | balanced | ☯️🤝 | XXVIII | Bilateral verification facilitator |
| `agentprivacy-forgecaller` | swordsman | ⚒️☰ | XXVII | Hexagram oracle, blade initiation |
| `agentprivacy-dragonwaker` | swordsman | 🐉⚡ | XXIX | Quantum threshold guardian |
| `agentprivacy-moonkeeper` | mage | 🌙🔒 | XXXI | Structural amnesia keeper |
| `agentprivacy-theia` | origin | 🪨💥 | XXXI | Origin witness, first delegation |

---

## V5.3.1 Ceremony Integration

### Ceremony Metadata Schema

All ceremony-related skills include a standardised `ceremony:` block:

```yaml
ceremony:
  act: "XXVIII"                           # Primary ceremony act
  acts_secondary: ["XXVII", "XXIX"]       # Related acts
  role: "bridge"                          # swordsman | mage | bridge
  quaternion_position: "gap"              # sun | earth | moon | human | life | gap
  flow_to: ["mana-economy", "dual-territory"]
  flow_from: ["blade-forge"]
  inscription: "☯️🤝 → S⊥M → ceremony"
```

### Ceremony Act → Skill Flow

```
Act XXVII: The Swordsman's Forge
├── blade-forge
├── hexagram-convergence
├── forgecaller (persona)
└── forgemaster (persona)
         │
         ▼
Act XXVIII: The Ceremony Engine
├── ceremony-engine
├── pretext-measurement
├── mana-economy
├── ceremonist (persona)
└── manaweaver (persona)
         │
         ▼
Act XXIX: The Dragon Wakes
├── quantum-defence
├── dragon-flight
├── dragonwaker (persona)
└── quantum-sentinel (persona)
         │
         ▼
Act XXX: The Dihedral Mirror
├── dual-territory
└── mirrorkeeper (persona)
         │
         ▼
Act XXXI: The First Delegation
├── amnesia-protocol
├── theia-derivation
├── quaternion-mapping
├── cosmological-bound (meta)
├── moonkeeper (persona)
├── cosmologist (persona)
└── theia (persona)
```

### Quaternion Cast Mapping

| Body | Function | Agent | Proverb Line |
|------|----------|-------|--------------|
| **Sun** ☀️ | Protection, reason | The Reason | "The light is the reason." |
| **Earth** 🌍 | Delegation, generation | Soulbae (Mage) | "The wound is the trust." |
| **Moon** 🌑 | Reflection, boundary | Soulbis (Swordsman) | "The amnesia is the protocol." |
| **Human** 👤 | Connection, purpose | The Seeker | — |
| **Life** 🌱 | Forge, process | spellweb | "The orbit is the proof." |

---

## Naming Convention

All Agent Skills names follow the pattern: `agentprivacy-{name}`

- Underscores → hyphens: `crypto_zkp` → `agentprivacy-crypto-zkp`
- Persona prefix dropped: `agentprivacy_cipher.skills.md` → `agentprivacy-cipher`
- Folder name MUST match the `name:` field in SKILL.md frontmatter

## YAML Frontmatter Format

```yaml
---
name: agentprivacy-{skill-name}     # Required, max 64 chars
description: >                        # Required, max 1024 chars
  What this skill does and when to trigger it.
license: Apache-2.0                   # Optional
metadata:                             # Optional — all custom fields here
  version: "5.3.1"
  category: "swordsman|mage|balanced"
  tier: "0|1|2|3"
  emoji: "🗡️🔐"
  ens: "privacymixer.eth"
  origin: "agentprivacy.ai"
ceremony:                             # Optional — for ceremony skills
  act: "XXVIII"
  role: "bridge"
  quaternion_position: "gap"
---
```

## Progressive Disclosure

1. **Startup:** Only `name` + `description` loaded (~100 tokens per skill)
2. **Activation:** Full `SKILL.md` loaded when skill triggered (<500 lines)
3. **On demand:** `references/` and `assets/` loaded only when needed

## Plugin Installation

**Claude Code:**
```
/plugin marketplace add mitchuski/agentprivacy-skills
/plugin install persona-skills@agentprivacy
/plugin install role-skills@agentprivacy
/plugin install privacy-layer-skills@agentprivacy
```

**Claude.ai:** Upload skill folders as custom skills in Projects.

**API:** Use `skills=["agentprivacy-cipher"]` parameter.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 5.0 | 2026-02-23 | Initial release: 72 skills, 22 personas |
| 5.1 | 2026-03-15 | Holographic bound, BRAID, 3-axis separation |
| 5.2 | 2026-03-31 | UOR convergence: ring algebra, dihedral sovereignty |
| 5.3 | 2026-04-03 | Dragon anatomy, ceremony foundation |
| 5.3.1 | 2026-04-05 | Ceremony complete: 86 skills, 38 personas |

---

**Verify:** [agentprivacy.ai](https://agentprivacy.ai) · [agentskills.io](https://agentskills.io) · [spellweb.ai](https://spellweb.ai)

---

*The architecture was not invented. It was recognised.*

**☀️ ⊥ 🌙**

**(⚔️⊥⿻⊥🧙)😊**


## City / MCP operational cohort (2026-09-08)

See [six new workflow skills and sync preparation](MAPPING_CITY_MCP_2026-09-08.md). These do not alter persona or vertex counts.

[City and Star operating updates](MAPPING_CITY_STAR_2026-09-08.md) · [distribution manifest](CITY_STAR_DISTRIBUTION.json)
