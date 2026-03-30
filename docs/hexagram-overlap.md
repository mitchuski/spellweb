# Hexagram Overlap: Spellweb ↔ AgentPrivacy Integration

> *"The swordsman who never strikes guards nothing; the mage who never casts commands nothing."*
> — Act 1, Venice 1494

## Overview

This document describes the conceptual and technical overlap between the **Spellweb graph structure** and the **AgentPrivacy hexagram system**. The core insight: spellweb's 6-dimensional node model maps directly to the I Ching's 6-line hexagram, creating a **64-vertex privacy manifold** that unifies both systems.

```
Spellweb Node                    Hexagram Line
─────────────────────────────────────────────────────
d1Hide        ←──────────────→   Line 1: Key Custody
d2Commit      ←──────────────→   Line 2: Credential Disclosure
d3Prove       ←──────────────→   Line 3: Agent Delegation
d4Connect     ←──────────────→   Line 4: Data Residency
d5Reflect     ←──────────────→   Line 5: Interaction Mode
d6Delegate    ←──────────────→   Line 6: Trust Boundary
```

## The Manifold

Both systems encode the same 2^6 = 64 privacy states:

```
                    ━━━  Line 6 (d6Delegate)
                    ━ ━  Line 5 (d5Reflect)
                    ━━━  Line 4 (d4Connect)
                    ━ ━  Line 3 (d3Prove)
                    ━━━  Line 2 (d2Commit)
                    ━━━  Line 1 (d1Hide)

                    Hexagram 43: 決 (Breakthrough)
                    Binary: 111011 = Blade 59
                    Layer: 5 (Penta-edge)
```

### Pascal's Row Distribution

The 64 blades distribute across 7 layers following Pascal's row:

| Layer | Count | Yang Lines | Privacy State |
|-------|-------|------------|---------------|
| 0 | 1 | 0 | Null (full yin) — No assertions |
| 1 | 6 | 1 | Single-edge — One dimension active |
| 2 | 15 | 2 | Twin-edge — Sword + Mage cooperation |
| 3 | 20 | 3 | Triple-edge — Trust triad |
| 4 | 15 | 4 | Quad-edge — Multi-domain sovereignty |
| 5 | 6 | 5 | Penta-edge — Near-sovereign |
| 6 | 1 | 6 | Dragon — Full sovereignty (full yang) |

## Dimensional Semantics

### d1Hide → Line 1: Key Custody

**Spellweb**: How well does the tale hide user identity?
**Hexagram**: Who holds the keys?

| State | Spellweb Score | Hexagram Line | Privacy Assertion |
|-------|----------------|---------------|-------------------|
| Yang | d1Hide ≥ 0.5 | ━━━ | `SELF_CUSTODY` |
| Yin | d1Hide < 0.5 | ━ ━ | Custodial/delegated keys |

**Emoji**: 🛡️🔒🔐🚫

---

### d2Commit → Line 2: Credential Disclosure

**Spellweb**: Does the tale use commitment schemes?
**Hexagram**: How are credentials revealed?

| State | Spellweb Score | Hexagram Line | Privacy Assertion |
|-------|----------------|---------------|-------------------|
| Yang | d2Commit ≥ 0.5 | ━━━ | `SELECTIVE_DISCLOSURE` (ZKP) |
| Yin | d2Commit < 0.5 | ━ ━ | Full disclosure required |

**Emoji**: 📦✓🎭👁️

---

### d3Prove → Line 3: Agent Delegation

**Spellweb**: What proof mechanisms exist?
**Hexagram**: Who executes actions?

| State | Spellweb Score | Hexagram Line | Privacy Assertion |
|-------|----------------|---------------|-------------------|
| Yang | d3Prove ≥ 0.5 | ━━━ | `SELF_EXECUTE` |
| Yin | d3Prove < 0.5 | ━ ━ | Emissary-execute |

**Emoji**: 🔮⚖️📜✨

---

### d4Connect → Line 4: Data Residency

**Spellweb**: How is data distributed?
**Hexagram**: Where does data live?

| State | Spellweb Score | Hexagram Line | Privacy Assertion |
|-------|----------------|---------------|-------------------|
| Yang | d4Connect ≥ 0.5 | ━━━ | `LOCAL_DATA` (sovereign) |
| Yin | d4Connect < 0.5 | ━ ━ | Federated/shared |

**Emoji**: 🌐⛓️🏠🔗

---

### d5Reflect → Line 5: Interaction Mode

**Spellweb**: Does the tale support self-reflection?
**Hexagram**: Who speaks?

| State | Spellweb Score | Hexagram Line | Privacy Assertion |
|-------|----------------|---------------|-------------------|
| Yang | d5Reflect ≥ 0.5 | ━━━ | `FIRST_PERSON` |
| Yin | d5Reflect < 0.5 | ━ ━ | Delegated/third-person |

**Emoji**: 👤🗡️📖🔑

---

### d6Delegate → Line 6: Trust Boundary

**Spellweb**: What delegation patterns exist?
**Hexagram**: How open is the perimeter?

| State | Spellweb Score | Hexagram Line | Privacy Assertion |
|-------|----------------|---------------|-------------------|
| Yang | d6Delegate ≥ 0.5 | ━━━ | `CLOSED_PERIMETER` |
| Yin | d6Delegate < 0.5 | ━ ━ | Open perimeter |

**Emoji**: 🤝🐉⚔️👑

---

## Integration Points

### 1. Node → Hexagram Computation

Every spellweb node already has 6 dimensions. Convert to hexagram:

```typescript
function nodeToHexagram(node: SpellwebNode): HexagramState {
  const threshold = 0.5
  return [
    node.dimensions.d1Hide >= threshold ? 1 : 0,
    node.dimensions.d2Commit >= threshold ? 1 : 0,
    node.dimensions.d3Prove >= threshold ? 1 : 0,
    node.dimensions.d4Connect >= threshold ? 1 : 0,
    node.dimensions.d5Reflect >= threshold ? 1 : 0,
    node.dimensions.d6Delegate >= threshold ? 1 : 0
  ]
}

function hexagramToBladeId(hex: HexagramState): number {
  // Binary encoding: line 1 = LSB, line 6 = MSB
  return hex[0] + hex[1]*2 + hex[2]*4 + hex[3]*8 + hex[4]*16 + hex[5]*32
}
```

### 2. Edge → Hexagram Transformation

Edge relationships can be modeled as hexagram transformations:

| Edge Type | Transformation | I Ching Concept |
|-----------|----------------|-----------------|
| `principle_extends` | Change 1-2 lines | 變 (biàn) - Change |
| `implements` | Flip specific line | 爻 (yáo) - Line movement |
| `inscription_echo` | Same hexagram | 同人 (tóng rén) - Fellowship |
| `dependency` | Inverse relationship | 綜 (zōng) - Inversion |

### 3. Inscription → Evocation Binding

Spellweb inscriptions can trigger evocations:

```typescript
interface InscriptionEvocation {
  txid: string              // Zcash transaction
  hexagram: HexagramState   // Computed from act dimensions
  blade: Blade              // Forged blade
  proverb: string           // Grimoire wisdom
  emojiSpell: string        // Visual incantation
}
```

**Example**: Act 1 inscription maps to:
```
txid: 8e49bef31adfe4d5bad51b50eedb7d7de319548e309dabf0e1440a72a5782032
hexagram: [1, 0, 1, 0, 1, 0] → Blade 21 → Layer 3
proverb: "The ledger that balances itself in darkness
          still casts a shadow in the light."
spell: 📖💰 → 🐉⏳ → ⚔️🔮
```

### 4. VRC Progression → Layer Unlocking

The VRC attestation system maps to blade layer progression:

| VRC Level | Attestations | Blade Layer | Unlocked Acts |
|-----------|--------------|-------------|---------------|
| 1 | 1 | 0-1 | Acts 1-2 (Story) |
| 3 | 3 | 2 | Acts 3-4 (Story + ZK) |
| 10 | 10 | 3 | Acts 5-6 (ZK) |
| 15 | 15 | 4 | Acts 7-8 (Canon) |
| 30 | 30 | 5 | Acts 9-12 (Canon + Parallel) |
| 50 | 50 | 6 | Acts 13-15 (Plurality + Drake) |

---

## Spellweb Graph Enhancement

### New Node Properties

Add hexagram state to spellweb nodes:

```json
{
  "id": "tale-01-village",
  "label": "The Village with Two Guardians",
  "dimensions": {
    "d1Hide": 0.6,
    "d2Commit": 0.5,
    "d3Prove": 0.4,
    "d4Connect": 0.5,
    "d5Reflect": 0.3,
    "d6Delegate": 0.2
  },
  "hexagram": {
    "lines": [1, 1, 0, 1, 0, 0],
    "bladeId": 11,
    "layer": 3,
    "kingWenNumber": 26,
    "name": "大畜 (The Taming Power of the Great)"
  }
}
```

### New Edge Properties

Add transformation metadata:

```json
{
  "source": "tale-01-village",
  "target": "tale-02-ceremony",
  "type": "principle_extends",
  "transformation": {
    "linesChanged": [3, 5],
    "fromHexagram": 26,
    "toHexagram": 44,
    "movementType": "ascending"
  }
}
```

### Hexagram Visualization

Render hexagrams in the spellweb graph:

```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    │                                │
    │   ○ tale-01-village            │
    │   ━ ━  d6Delegate (yin)        │
    │   ━ ━  d5Reflect  (yin)        │
    │   ━━━  d4Connect  (yang)       │
    │   ━ ━  d3Prove    (yin)        │
    │   ━━━  d2Commit   (yang)       │
    │   ━━━  d1Hide     (yang)       │
    │                                │
    │   Blade 11 · Layer 3           │
    │   大畜 The Taming Power        │
    │                                │
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## The Drake Connection

When all 6 dimensions reach yang state (blade 63, layer 6), the Drake awakens:

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

The Drake is summoned through the convergence of:
- Swordsman orb (MyTerms assertions)
- Mage orb (Deep scanning intelligence)
- Constellation geometry (spell cast positions)
- Hexagram alignment (all 6 dimensions yang)

---

## Implementation Roadmap

### Phase 1: Node Hexagram Computation
- Add `hexagram` property to all spellweb nodes
- Compute from existing dimension scores
- Display in node tooltips/cards

### Phase 2: Edge Transformation Tracking
- Track which lines change between connected nodes
- Visualize as I Ching line movements
- Model principle evolution through hexagram sequences

### Phase 3: Inscription Evocation Binding
- Link on-chain inscriptions to hexagram states
- Generate evocation text from proverbs
- Emit emoji spell sequences on hover

### Phase 4: Interactive Forging
- Allow users to "forge" blades by visiting tales
- Track VRC progression through graph traversal
- Unlock acts as layers are achieved

### Phase 5: Drake Summoning Ceremony
- Detect when user achieves full yang alignment
- Trigger Drake animation across the graph
- Inscribe the moment on-chain

---

## Appendix: King Wen Sequence

The 64 hexagrams follow the traditional King Wen ordering:

```
Blade 0  → Hexagram 2  坤 The Receptive
Blade 63 → Hexagram 1  乾 The Creative
...
```

Full mapping table available in `blade-forge.ts`.

---

## References

- `swordsman-blade/src/content/blade-forge.ts` — Forge implementation
- `swordsman-blade/src/content/evoke.ts` — Evocation system
- `shared/types/blade.ts` — Type definitions
- `spellweb/public/spellweb/nodes.json` — Existing dimension model
- `spellweb/agentprivacy-docs-main/privacymage-grimoire-v8.4.0-canonical.json` — Grimoire acts

---

*"What is inscribed endures; what endures becomes law."*
— Act 8, The On-Chain Inscription
