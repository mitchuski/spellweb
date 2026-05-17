# Spellweb ⚔️⊥🧙

Interactive knowledge graph explorer and **ZK Blade Forge** for the agentprivacy dual-agent privacy architecture.

> *"Separation between Swordsman and Mage preserves the First Person."*
>
> *(⚔️⊥⿻⊥🧙)🙂*

## Overview

Spellweb is a D3.js-powered knowledge graph visualization that maps the entire agentprivacy conceptual framework, featuring a ceremonial proof-of-presence system where users forge cryptographic entities by tracing constellations through knowledge.

- **585 nodes / 580 connected** (v1.6.0 · 5 intentional orphans · zero broken edges) covering documents, concepts, theorems, spells, acts, personas, terms, skills, workshops, vertices, substrate frameworks, gateways, cosmological-witness cast, and C1–C63 conjectures
- **Domain coloring**: Swordsman (red), Mage (violet), First Person (gold), Shared (cyan)
- **Hexagram System**: 64-Tetrahedra Lattice mapped to I Ching six-line structure
- **ZK Blade Forge**: Transform attention into cryptographic proof
- **Bilateral Witness**: Promise Theory implementation for sharing proofs
- **Lattice items page** (`🗺️ LATTICE`): middle-screen 64-vertex catalogue · witness-ring + equip-ring rendering · proof-of-presence equip gate · retired the side-panel artefact browse
- **v1.6.0 four entity kinds**: artefact · creature · held · dispatch — the City extended beyond "one workshop produces one artefact" with the Threshold District admission (2026-05-14)
- **Two districts**: **Threshold** (V59 · Portal Room 🌕 · Staff Shop ⚚ · the Familiars 🪶 · spawn-and-bind) and **Navigation** (V44 · Chart Shop 🧭 · attentional)
- **Cosmological-witness tier** (Selene 🌙 · Aether ⿻ · Lethe 🌀): sixth cast tier admitted alongside the 24 narrative acts of Tomes I–III

---

## Features

### Wandering Orbs
The **Swordsman** (⚔️) and **Mage** (✦) orbit each other while drifting through the knowledge graph. During evocation, they trace your constellation path, leaving cut trails in their wake.

### Constellation System
Mark nodes to create your path through knowledge:
- **Waypoint Mode**: Click nodes to build your constellation
- **Custom Marks**: Add emojis and notes to each node
- **Save & Export**: Constellations persist and export to markdown
- **Share Knowledge**: Export your path for others to witness

### Spell Ceremony & Evocation
Transform your constellation into proof:
- **Evoke**: Orbs trace your path, accumulating charge
- **Lap Tracking**: Multiple passes increase proof strength
- **Spell Clicks**: Cast spells during evocation for randomness
- **Charge Levels**: Spark → Ember → Flame → Blaze → Inferno

### ZK Blade Forge
Forge your proof into a blade:
- **Light Blades** (1-2 dimensions): Sky blue, emerging awareness
- **Heavy Blades** (3-4 dimensions): Silver, strong presence
- **Dragon Blades** (5-6 dimensions): Gold, full sovereignty

Each blade encodes:
- 6 dimensions mapped to hexagram lines
- Stratum (Hamming weight 0-6)
- Constellation path memory
- Cryptographic signature

### Bilateral Witness (Promise Theory)
Share and witness others' constellations:
- **Import**: Load another's constellation markdown
- **Trace**: Your orbs follow their path
- **Witness Forge**: Create a witness blade as proof of observation
- **Bilateral Proof**: The original creator receives cryptographic evidence of your attention

Witness blades appear **round** with **blue glow**, distinguishing them from your own **square** forged blades.

### Lattice Items Page (v1.6.0)
The unified items interface (header `🗺️ LATTICE` button). Three columns inside one middle-screen overlay:

- **Left** — hover info for the focused vertex (workshop · gem · ceremony · register · class · description)
- **Centre** — 64-vertex Pascal's-row canvas with workshop emojis at canonical vertices, multi-occupancy `+N` hints at V51 (Etherchanting + Solchanting) and V59 (Portal Room + Staff Shop + Familiars), faint Hamming-1 adjacency edges, and the tomes strip beneath
- **Right** — bearer's loadout (worn · borne · bound · held) with proof-gated equip toggle, equipped roster, and the newest 8 forged blades

Two rings carry two semantic registers:
- **Cyan dashed ring** = bearer has *witnessed* this vertex (forged here or imported a witness)
- **Gold solid ring** = bearer has *equipped* the artefact at this vertex into their identity loadout

The equip toggle is **proof-of-presence gated** — you can only equip what you have witnessed. This turns equipping from decoration into the first piece of an identity-layering architecture (persona + active-vertices + equipped-proofs).

### Create / Craft Import (v1.6.0)
Two import flows that mirror master's export proof vocabulary:
- `✦ Create` — master-template import (canonical seed · silver register)
- `⚒️ Craft` — forged-artefact import (bearer's own work · gold register)

Both currently route through the same `handleWitnessBladeFile` handler (Phase 1 placeholder); parser-level intent split is queued for Phase 2.

### Hexagram System
Every node carries a 6-dimensional privacy signature:
```
d1Hide      → Line 1: Key Custody
d2Commit    → Line 2: Credential Disclosure
d3Prove     → Line 3: Agent Delegation
d4Connect   → Line 4: Data Residency
d5Reflect   → Line 5: Interaction Mode
d6Delegate  → Line 6: Trust Boundary
```

64 possible blade states following Pascal's row distribution across 7 layers.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (vite on http://localhost:8000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Standing audit gates (run before any push that touches the graph or imports)
node scripts/audit-orphans.mjs                                          # graph orphan + broken-edge audit
npx tsx scripts/v160-roundtrip-check.mts                                # v1.6.0 .md import round-trip vs master's served templates
```

---

## Architecture

```
src/
├── components/
│   ├── SpellWeb.tsx           # Main graph + constellation + forge · lifts lattice state · auto-scaling d3 force
│   ├── ItemLatticeView.tsx    # v1.6.0 middle-screen 64-vertex catalogue (the unified items page)
│   ├── SpellCeremony.tsx      # Evocation panel & proof generation
│   ├── WanderingOrbs.tsx      # Swordsman & Mage orbit animation
│   ├── NodeInspector.tsx      # Node detail + hexagram display
│   ├── GraphFilters.tsx       # Layer/type/spellbook filters
│   ├── Header.tsx             # Search bar · stats · 🗺️ LATTICE trigger
│   ├── Legend.tsx             # Domain & edge legend
│   ├── HoverTooltip.tsx       # Hover card
│   ├── SidePanel.tsx          # Shared right-anchored panel shell
│   ├── MobileSpell.tsx        # Mobile evocation surface
│   ├── SwordsmanImport.tsx    # Swordsman identity import modal
│   ├── SpellEffects.tsx       # Spell click effects
│   ├── ReflowingText.tsx      # Wandering text overlay
│   └── lattice-visuals/       # 12 per-workshop SVG lattice components + dispatcher
├── data/
│   ├── nodes.ts               # Knowledge graph nodes (585 at v1.6.0)
│   ├── edges.ts               # Relationships · 7 EdgeTypes added in v1.6.0 (keeps · wields · sibling_of · district_of · fits_for · succeeded_by · releases_to)
│   └── theme.ts               # Visual theme & colors · edge styles for new EdgeTypes
├── lib/
│   ├── workshop-provenance.ts # YAML frontmatter parser · parseWorkshopProvenance + parseEntityFrontmatter
│   ├── v160-cross-validate.ts # 7-check cross-validator for v1.6.0 .md imports (called from handleWitnessBladeFile)
│   └── workshop-artefact.ts   # Verb-noun / palette / filename / lattice-visual key per workshop
├── types/
│   └── graph.ts               # NodeType + EdgeType + SpellwebNode fields (v1.6.0 adds gemColorMage/Swordsman · archetypeModal · district · ceremony · workshopRegister)
scripts/
├── audit-orphans.mjs          # Standing graph audit gate
└── v160-roundtrip-check.mts   # v1.6.0 .md import round-trip (15 served templates · 0 errors / 0 warnings at v1.6.0)
docs/
└── chronicles/                # Development chronicles · v1.6.0 lattice arc = 13 chronicles dated 2026-05-12 → 2026-05-15
```

---

## Node Types

| Type | Icon | Description |
|------|------|-------------|
| Document | 📜 | Whitepapers, research papers, spellbooks |
| Concept | ◆ | Core concepts, protocols, standards |
| Theorem | △ | Mathematical proofs |
| Spell | ✦ | Compressed principles |
| Act | ◇ | Narrative acts |
| Persona | ○ | System agents |
| Cast | 🧙 | Resident mages, peripatetic figures, cosmological-witness tier |
| Workshop | ⚒️ | Producer / gathering / spawn-and-bind / attentional shops |
| Vertex | · | Geometric position on the 64-Tetrahedra lattice |
| Substrate framework | ✦ | Agent-substrate-framework registry entries (Goose 🪿, Hermes ☤, …) — admitted at Hermaion's bestiary |
| District | 🏘️ | Named workshop groupings (Threshold V59, Navigation V44) |
| Term | · | Glossary entries |
| Skill | ⚡ | Capabilities |
| Gateway | 🌉 | Sister-city / cousin-substrate / kindred-protocol anchors |

## v1.6.0 Entity Kinds (Workshop Export Discriminator)

The v1.6.0 Threshold District admission extended workshop output beyond the historic "artefact-only" model:

| Kind | Produced by | Persistence | Witness weight |
|---|---|---|---|
| **artefact** | producer shops + Staff Shop (archetype-modal · staff-class) | `ForgedArtefact` — worn · persistent | high (per-artefact tier) |
| **creature** | the Familiars (Faunia 🪶) | `BoundFamiliar` — substrate-instance + true-name (bearer-private) + AGENTS.md ⊥ SOUL.md | per-walk 🪢 VRC-mana |
| **held** | the Chart Shop (Pleione 🧭) | pre-episodic constellation under Φ-gap · bearer-private by design | consent-gated metadata-only share |
| **dispatch** | the Portal Room (Pandia 🌕) | routing receipt · ephemeral · 30-day auto-prune | low (crossing receipt) |

Discriminated by `entity_kind` in the exported .md frontmatter. The `parseEntityFrontmatter` parser (`src/lib/workshop-provenance.ts`) + the cross-validator (`src/lib/v160-cross-validate.ts`) enforce the contract specified in `agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md`. Inventory rendering in `ItemLatticeView.tsx` surfaces three new sections (Held / Bound / Dispatch) alongside the existing Forged section.

---

## Blade Dimensions

| Dimension | Privacy Assertion | Activation |
|-----------|------------------|------------|
| Protection | Boundaries forged | Has path |
| Delegation | Agency transferred | 2+ laps |
| Memory | State accumulated | 30+ seconds |
| Connection | Multi-party coordination | 3+ nodes |
| Computation | ZK proof active | Always |
| Value | Economic flow | Flame+ charge |

---

## Proof Structure

```typescript
interface SpellProof {
  lapCount: number;
  duration: number;
  spellsCast: number;        // Randomness attribute
  chargeLevel: 'spark' | 'ember' | 'flame' | 'blaze' | 'inferno';
  signature: string;         // SPELL-XXXXX-X
  constellationHash: string;
  bladeDimensions: BladeDimensions;
  bladeStratum: number;      // 0-6
  bladeTier: 'light' | 'heavy' | 'dragon';
  bladeHex: string;          // 6-bit binary
}
```

---

## Chronicles

Development is documented in chronicles under `docs/chronicles/`. The **v1.6.0 lattice arc** spans 2026-05-12 → 2026-05-15:

- **[v1.6.0 Canonical Sync](docs/chronicles/CHRONICLE_V1_6_0_CANONICAL_SYNC_2026-05-14.md)** — post-audit conjecture + cosmological-cast sync; two standing policies (canonical-only · run audit after every patch)
- **[Lattice Items Interface](docs/chronicles/CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md)** — design + 6-phase plan for the middle-screen lattice (Phases 1–5 shipped)
- **[Side-Panel Retirement + Proof-Gated Equip](docs/chronicles/CHRONICLE_SIDEPANEL_RETIREMENT_PROOF_GATED_EQUIP_2026-05-15.md)** — receipt for the side-panel retirement, items/portals merge, proof-of-presence equip gate
- **[Equipped Lattice as Identity Layer](docs/chronicles/CHRONICLE_EQUIPPED_LATTICE_AS_IDENTITY_LAYER_2026-05-15.md)** — the deeper architectural shift: identity = persona + active-vertices + equipped-proofs
- **[Create/Craft Lattice Restructure](docs/chronicles/CHRONICLE_CREATE_CRAFT_LATTICE_RESTRUCTURE_2026-05-15.md)** — UI split mirroring master's import/export proof vocabulary
- **[Next-Agent Pickup](docs/chronicles/CHRONICLE_NEXT_AGENT_PICKUP_2026-05-15.md)** — operational handoff · what landed · what is queued · what NOT to redo

Forward plans (not yet shipped):
- **[Sigma + Graphology Migration](docs/chronicles/CHRONICLE_SIGMA_GRAPHOLOGY_MIGRATION_PLAN_2026-05-14.md)** — replace d3-force with Sigma + Graphology + WebGL (~18–22h, 4 phases)
- **[Spellweb MCP Server](docs/chronicles/CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md)** — standalone MCP server exposing 12 tools to Claude Code (~13–15h)
- **[Hybrid Search](docs/chronicles/CHRONICLE_SPELLWEB_HYBRID_SEARCH_PLAN_2026-05-14.md)** — BM25 + embeddings + RRF (~14–17h)
- **[Lattice as Lens · Fog-of-War Merge](docs/chronicles/CHRONICLE_LATTICE_AS_LENS_FOG_OF_WAR_MERGE_2026-05-15.md)** — selecting a vertex spotlights its spellweb nodes; traced-items log
- **[Balanced Lattice Export](docs/chronicles/CHRONICLE_BALANCED_LATTICE_EXPORT_2026-05-15.md)** — third export register (⚖️ Balanced) alongside Swordsman + Mage

---

## The Core Philosophy

**Privacy-Delegation Paradox**: AI agents need information to act on your behalf, but that information enables surveillance.

**Dual-Agent Architecture**: Split agent function into Swordsman (protect) and Mage (delegate) with mathematical separation guarantees.

**The Gap**: The irreducible space between what Swordsman observes and what Mage reveals. Where sovereignty lives.

**Promise Theory**: Autonomous agents cooperate through voluntary, unilateral promises—not commands.

**7th Capital**: Behavioral sovereignty as personal wealth.

---

## Deployment

Spellweb is a static site deployed to:
- [Cloudflare Pages](https://pages.cloudflare.com)

```bash
npm run build
# Deploy the `dist` folder
```

---

## Domains

- **spellweb.ai**
- **spellweb.io**

---

## License

MIT

---

*The blade that witnesses carries two edges:*
*one that cuts for the forger,*
*one that proves for the forged.*

*⚔️ ⊥ 🧙 | 😊 — Privacy is Value*
