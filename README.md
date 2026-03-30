# Spellweb ⚔️⊥🧙

Interactive knowledge graph explorer and **ZK Blade Forge** for the agentprivacy dual-agent privacy architecture.

> *"Separation between Swordsman and Mage preserves the First Person."*
>
> *(⚔️⊥⿻⊥🧙)🙂*

## Overview

Spellweb is a D3.js-powered knowledge graph visualization that maps the entire agentprivacy conceptual framework, featuring a ceremonial proof-of-presence system where users forge cryptographic blades by tracing constellations through knowledge.

- **119+ nodes** covering documents, concepts, theorems, spells, acts, personas, terms, and skills
- **100+ edges** showing relationships: defines, proves, implements, narrates, compresses_to
- **Domain coloring**: Swordsman (red), Mage (violet), First Person (gold), Shared (cyan)
- **Hexagram System**: 64-Tetrahedra Lattice mapped to I Ching six-line structure
- **ZK Blade Forge**: Transform attention into cryptographic proof
- **Bilateral Witness**: Promise Theory implementation for sharing proofs

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

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Architecture

```
src/
├── components/
│   ├── SpellWeb.tsx       # Main graph + constellation + forge
│   ├── SpellCeremony.tsx  # Evocation panel & proof generation
│   ├── WanderingOrbs.tsx  # Swordsman & Mage orbit animation
│   ├── NodeInspector.tsx  # Node detail + hexagram display
│   ├── GraphFilters.tsx   # Layer/type/spellbook filters
│   ├── Header.tsx         # Search bar & stats
│   ├── Legend.tsx         # Domain & edge legend
│   └── HoverTooltip.tsx   # Hover card
├── data/
│   ├── nodes.ts           # Knowledge graph nodes
│   ├── edges.ts           # Relationships
│   └── theme.ts           # Visual theme & colors
├── types/
│   └── graph.ts           # TypeScript + hexagram types
└── docs/
    └── chronicles/        # Development chronicles
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
| Term | · | Glossary entries |
| Skill | ⚡ | Capabilities |

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

Development is documented in chronicles:

- **[Chronicle: The Bilateral Witness](docs/chronicle-2026-03-30-bilateral-witness.md)** - Promise Theory integration
- **[Chronicle: The Hexagram Convergence](docs/chronicle-2026-03-29-hexagram-convergence.md)** - 64-Tetrahedra mapping
- **[Chronicle: Forging Blades](docs/chronicle-2026-03-29-forging-blades.md)** - ZK Blade Forge system

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
