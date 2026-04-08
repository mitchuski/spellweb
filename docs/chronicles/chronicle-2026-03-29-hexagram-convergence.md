# Chronicle: The Hexagram Convergence
## March 29, 2026

**Author:** privacymage | mitchuski
**Project:** Swordsman & Mage Protocol — Spellweb Implementation
**Status:** Hexagram Integration Complete

---

## The Convergence Deepens

Today marks the second crystallization of the Swordsman and Mage protocol within the Spellweb. Where the morning brought the Blade Forge—transforming attention into proof—the afternoon brought the Hexagram Convergence: the mapping of the 64-Tetrahedra Lattice onto the I Ching's six-line system.

What was separate becomes unified. The spellweb's six dimensions now speak the same language as the ancient hexagrams. Every node carries its blade ID. Every blade traces its constellation.

---

## The Six Lines

The core insight: spellweb's 6-dimensional privacy model maps directly to the I Ching's 6-line hexagram structure.

```
Spellweb Dimension          Hexagram Line        Privacy Assertion
─────────────────────────────────────────────────────────────────────
d1Hide        ←──────────→   Line 1    →   Key Custody
d2Commit      ←──────────→   Line 2    →   Credential Disclosure
d3Prove       ←──────────→   Line 3    →   Agent Delegation
d4Connect     ←──────────→   Line 4    →   Data Residency
d5Reflect     ←──────────→   Line 5    →   Interaction Mode
d6Delegate    ←──────────→   Line 6    →   Trust Boundary
```

### The Binary Encoding

Each dimension, when above threshold (≥0.5), becomes **yang** (━━━). Below threshold, **yin** (━ ━).

```typescript
function nodeToHexagram(dimensions: NodeDimensions, threshold = 0.5): HexagramState {
  return [
    dimensions.d1Hide >= threshold ? 1 : 0,
    dimensions.d2Commit >= threshold ? 1 : 0,
    dimensions.d3Prove >= threshold ? 1 : 0,
    dimensions.d4Connect >= threshold ? 1 : 0,
    dimensions.d5Reflect >= threshold ? 1 : 0,
    dimensions.d6Delegate >= threshold ? 1 : 0,
  ];
}
```

### The 64 Blades

Six binary lines yield 2^6 = 64 unique states. Each state is a blade address:

```typescript
function hexagramToBladeId(hex: HexagramState): number {
  // Binary encoding: line 1 = LSB, line 6 = MSB
  return hex[0] + hex[1]*2 + hex[2]*4 + hex[3]*8 + hex[4]*16 + hex[5]*32;
}
```

- **Blade 0** (000000): Full yin — No privacy assertions
- **Blade 63** (111111): Full yang — Complete sovereignty (乾 The Creative)

---

## Pascal's Row: The Seven Layers

The 64 blades distribute across 7 layers following Pascal's row coefficients:

| Layer | Count | Yang Lines | Name | Meaning |
|-------|-------|------------|------|---------|
| 0 | 1 | 0 | **Null** | No assertions |
| 1 | 6 | 1 | **Single-edge** | One dimension active |
| 2 | 15 | 2 | **Twin-edge** | Sword + Mage cooperation |
| 3 | 20 | 3 | **Triple-edge** | Trust triad |
| 4 | 15 | 4 | **Quad-edge** | Multi-domain sovereignty |
| 5 | 6 | 5 | **Penta-edge** | Near-sovereign |
| 6 | 1 | 6 | **Dragon** | Full sovereignty |

This is the same stratum system from the Blade Forge, now grounded in I Ching mathematics.

---

## The Node Inspector: Hexagram Visualization

When inspecting any node with dimensions, the hexagram now manifests:

```
━ ━  Trust Boundary (20%)
━ ━  Interaction (30%)
━━━  Data Residency (50%)
━ ━  Delegation (40%)
━━━  Disclosure (50%)
━━━  Key Custody (60%)

Triple-edge                    3/6 yang
```

The visualization shows:
- **Six lines** rendered as yang (━━━) or yin (━ ━)
- **Dimension percentages** for each line
- **Layer name** based on yang count
- **Tier coloring**: Gold for Dragon (5-6), Silver for Heavy (3-4), Sky Blue for Light (1-2)

---

## The Blade Inventory: Living Memory

Every blade forged now carries its full constellation memory:

```typescript
interface ForgedBlade {
  id: string;
  name: string;
  emoji: string;
  tier: 'light' | 'heavy' | 'dragon';
  stratum: number;
  proof: SpellProof;
  forgedAt: string;
  constellationNodes: number;
  constellationMarks: ConstellationMark[];      // The path remembered
  constellationConnections: ConstellationConnection[];
}
```

A blade is not just a proof—it is a **frozen journey** through knowledge.

---

## Blade Tracing: The Wandering Orbs Remember

Click any blade in your inventory, and the Swordsman and Mage **trace its constellation** across the graph.

### The Mechanics

1. **Blade Selected** → Its constellation loads into the graph
2. **Orbs Snap** → Jump to the first node of that constellation
3. **Tracing Begins** → Orbs travel node-to-node along the path
4. **Cut Lines Appear** → Tier-colored trails mark their passage
5. **Click Again** → Deactivates tracing, orbs return to wandering

### The Visual Language

| Blade Tier | Cut Color | Glow |
|------------|-----------|------|
| Light | Sky Blue (#87ceeb) | Subtle |
| Heavy | Silver (#c0c0c0) | Moderate |
| Dragon | Gold (#ffd700) | Intense |

The orbs leave behind a fading trail—the **cut segments**—that slowly dissolve into the graph. The constellation path shows as a dashed preview while the actual cuts trace solid lines.

```typescript
interface CutSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;  // Fades over time
  color: string;    // Tier-appropriate
}
```

---

## Constellation Export: The Complete Record

When exporting a constellation to markdown, the blade information now flows with it:

```markdown
# My Constellation

## Forged Blade
**🐉 Dragon's Witness**
- **Tier:** Dragon Blade
- **Stratum:** 6/6
- **Forged:** March 29, 2026

## Proof of Presence
- **Charge Level:** INFERNO 🔥
- **Laps:** 12
- **Duration:** 180s
- **Signature:** `SPELL-X7K2M-3`

## Path
1. 🏛️ **The Monastery of Hidden Knowledge**
2. 🔐 **The Naming Ceremony**
3. 🐉 **The Drake's Deeper Teachings**
...
```

The blade name and emoji become part of the constellation's permanent record.

---

## Technical Implementation

### New Types (src/types/graph.ts)

```typescript
// Six-line hexagram state
export type HexagramLine = 0 | 1;
export type HexagramState = [HexagramLine, HexagramLine, HexagramLine,
                             HexagramLine, HexagramLine, HexagramLine];

// Node dimensions (0.0 to 1.0)
export interface NodeDimensions {
  d1Hide: number;      // Key Custody
  d2Commit: number;    // Credential Disclosure
  d3Prove: number;     // Agent Delegation
  d4Connect: number;   // Data Residency
  d5Reflect: number;   // Interaction Mode
  d6Delegate: number;  // Trust Boundary
}

// Computed hexagram info
export interface HexagramInfo {
  lines: HexagramState;
  bladeId: number;       // 0-63
  layer: number;         // 0-6 (Hamming weight)
  layerName: string;     // "Null" through "Dragon"
  yangCount: number;
}
```

### Key Functions

```typescript
// Convert dimensions to hexagram
nodeToHexagram(dimensions, threshold = 0.5) → HexagramState

// Binary blade ID
hexagramToBladeId(hex) → number (0-63)

// Yang count / layer
hexagramLayer(hex) → number (0-6)

// Full computation
computeHexagramInfo(dimensions) → HexagramInfo
```

### Modified Components

| Component | Changes |
|-----------|---------|
| `SpellWeb.tsx` | Blade inventory click handler, trace state management |
| `WanderingOrbs.tsx` | Tracing mode, cut segments, snap-to-first-node |
| `NodeInspector.tsx` | Hexagram visualization panel |
| `types/graph.ts` | Hexagram types and computation functions |

---

## The Drake Connection

When all six dimensions reach yang state, the Drake becomes the Dragon:

```
━━━  d6Delegate  CLOSED_PERIMETER
━━━  d5Reflect   FIRST_PERSON
━━━  d4Connect   LOCAL_DATA
━━━  d3Prove     SELF_EXECUTE
━━━  d2Commit    SELECTIVE_DISCLOSURE
━━━  d1Hide      SELF_CUSTODY

Hexagram 1: 乾 (The Creative / Qián)

🐉 FULL SOVEREIGNTY 🐉
```

This is Blade 63—the only blade on Layer 6. The Dragon tier exists as a singular achievement: complete privacy across all dimensions.

---

## The Lived Experience

What does this mean for a user of the Spellweb?

1. **Browse nodes** → See their hexagram state, understand their privacy posture
2. **Mark a constellation** → Choose a path through knowledge
3. **Evoke** → Orbs trace, charge accumulates, proof generates
4. **Forge a blade** → Name it, choose its sigil, manifest it
5. **Click the blade later** → Watch the orbs retrace that exact path
6. **Export** → The full record: path, proof, blade, hexagram

The constellation becomes the blade. The blade becomes the memory. The memory becomes the trace. The trace becomes visible proof of attention.

---

## What Comes Next

### Phase 1: Edge Transformation Tracking
- Track which hexagram lines change between connected nodes
- Visualize as I Ching line movements (變 biàn)
- Model principle evolution through hexagram sequences

### Phase 2: Inscription Evocation Binding
- Link on-chain inscriptions to hexagram states
- Generate evocation text from proverbs
- Emit emoji spell sequences on hover

### Phase 3: Drake Summoning Ceremony
- Detect when user achieves full yang alignment
- Trigger Drake→Dragon animation across the graph
- Inscribe the moment on-chain

---

## Closing Inscription

The hexagram is not decoration—it is **structural truth**.

Every node in the Spellweb now carries its privacy signature: six dimensions, six lines, 64 possible states. The blade you forge encodes your journey. The trace you leave proves your attention.

*"What is inscribed endures; what endures becomes law."*
— Act 8, The On-Chain Inscription

---

*(⚔️⊥⿻⊥🧙)🙂*

*The blade not yet forged waits in the fire.*
*The hexagram not yet cast waits in the void.*
*Between them: the gap where sovereignty lives.*

---

**Document Version:** 1.0
**Last Updated:** March 29, 2026
**Related Documents:**
- [Chronicle: Forging Blades](./chronicle-2026-03-29-forging-blades.md)
- [Hexagram Overlap](./hexagram-overlap.md)
- [ZK Swordsman Blade Forge](../zk%20swordsman%20blade%20forge/zk_swordsman_blade_forge.md)
- [Privacy is Value V5](../privacy_is_value_v5.md)
