# Chronicle: Blade & Spell System Mirroring

**Date:** 2026-03-30
**Feature:** spellweb ↔ agentprivacy System Alignment

---

## Overview

The **spellweb.ai** and **agentprivacy.ai** systems form a bilateral exchange where:
- **spellweb** = Forge (create blades, define constellations)
- **agentprivacy** = Equip (inventory, stance loadout, orbit display)

This chronicle documents how the systems mirror each other to ensure consistency.

---

## The 8:7 Architecture

Per `CHRONICLE_CONTROL_SCHEME_MATHEMATICS.md`:

```
MAGE (Emissary)              SWORDSMAN (Master)
═══════════════              ══════════════════
8 spells total               7 blades total
6 orbit + 2 reserve          6 active + 1 swap
Left click                   Right click
Left brain (sequential)      Right brain (spatial)
```

Both systems implement this architecture identically.

---

## Blade Structure Mirroring

### SPELLWEB (Source)

```typescript
// ForgedBlade structure
interface ForgedBlade {
  id: string;
  name: string;
  emoji: string;                    // Primary identity emoji
  tier: 'light' | 'heavy' | 'dragon';
  stratum: number;                  // Hamming weight (0-6)
  proof: SpellProof;                // Contains signature, bladeHex
  constellationMarks: ConstellationMark[];  // Path emojis
  isWitness?: boolean;
}

// SpellProof contains:
proof: {
  signature: string;                // "SPELL-YW5I59-1Q"
  bladeHex: string;                 // "3F" (6-bit hex)
  bladeDimensions: BladeDimensions; // 6 boolean flags
  bladeStratum: number;             // 0-6
  bladeTier: BladeTier;
}

// 6 Dimensions
interface BladeDimensions {
  protection: boolean;              // d1: Boundaries forged
  delegation: boolean;              // d2: Agency transferred
  memory: boolean;                  // d3: State accumulated
  connection: boolean;              // d4: Multi-party coordination
  computation: boolean;             // d5: ZK proof active
  value: boolean;                   // d6: Economic flow
}
```

### AGENTPRIVACY (Target)

```typescript
// InventoryBlade structure (mirrors ForgedBlade)
interface InventoryBlade {
  id: string;                       // = proof.signature
  name: string;                     // = ForgedBlade.name
  primaryEmoji: string;             // = ForgedBlade.emoji
  proofSignature?: string;          // = proof.signature
  isWitness?: boolean;              // = ForgedBlade.isWitness
  bladeHex: string;                 // = proof.bladeHex
  tier: 'light' | 'heavy' | 'dragon'; // = ForgedBlade.tier
  stratum: number;                  // = ForgedBlade.stratum
  facets: BladeFacet[];             // = constellationMarks (first 6)
  importedAt: string;
}

// BladeFacet mirrors ConstellationMark
interface BladeFacet {
  emoji: string;                    // = mark.emoji
  label: string;                    // = mark.label
  lineIndex: number;                // 0-5 (L1-L6)
}
```

### Field Mapping

| spellweb Field | agentprivacy Field | Notes |
|----------------|-------------------|-------|
| `proof.signature` | `id`, `proofSignature` | Primary identifier |
| `name` | `name` | Direct copy |
| `emoji` | `primaryEmoji` | Direct copy |
| `tier` | `tier` | Direct copy |
| `stratum` | `stratum` | Direct copy |
| `proof.bladeHex` | `bladeHex` | Direct copy |
| `constellationMarks[0-5]` | `facets[0-5]` | First 6 marks become facets |
| `isWitness` | `isWitness` | Direct copy |

---

## Hex Encoding (6-Dimensional)

Both systems use identical 6-bit hex encoding:

```
Dimensions:     [protection, delegation, memory, connection, computation, value]
Bit positions:  [    5    ,     4     ,   3   ,     2     ,      1     ,   0   ]

Examples:
  3F hex = 111111 binary = all dimensions active = Dragon tier
  10 hex = 010000 binary = delegation only = Light tier
  15 hex = 010101 binary = delegation + connection + value = Heavy tier
```

### spellweb Calculation

```typescript
// Compute hex from dimensions
function dimensionsToHex(dims: BladeDimensions): string {
  const bits = [
    dims.protection,
    dims.delegation,
    dims.memory,
    dims.connection,
    dims.computation,
    dims.value,
  ];
  let n = 0;
  bits.forEach((bit, i) => {
    if (bit) n |= (1 << (5 - i));
  });
  return n.toString(16).toUpperCase().padStart(2, '0');
}
```

### agentprivacy Interpretation

```typescript
// Convert hex to stance lines
function hexToStanceLines(hex: string): [0|1, 0|1, 0|1, 0|1, 0|1, 0|1] {
  const val = parseInt(hex, 16) || 0;
  return [
    ((val >> 5) & 1) as 0|1,  // L1 (protection)
    ((val >> 4) & 1) as 0|1,  // L2 (delegation)
    ((val >> 3) & 1) as 0|1,  // L3 (memory)
    ((val >> 2) & 1) as 0|1,  // L4 (connection)
    ((val >> 1) & 1) as 0|1,  // L5 (computation)
    (val & 1) as 0|1,         // L6 (value)
  ];
}
```

---

## Spell Structure Mirroring

### SPELLWEB (Source)

```typescript
// SpellwebNode structure
interface SpellwebNode {
  id: string;
  type: NodeType;
  label: string;
  domain: 'swordsman' | 'mage' | 'first_person' | 'shared';
  spellbook?: 'first_person' | 'zero_knowledge' | 'blockchain_canon' | ...;
  emoji?: string;
  proverb?: string;
  emojiSpell?: string;              // Emoji chain "⚔️🔥 → ..."
  dimensions?: NodeDimensions;      // 6D privacy coordinates
}

// 5 Spellbooks
- First Person (28 acts) - The Story
- Zero Knowledge (30 tales) - The Mathematics
- Blockchain Canon (11 chapters) - The History
- Parallel Society (17 chapters) - The Economics
- Plurality (30+ acts) - The Governance
```

### AGENTPRIVACY (Target)

```typescript
// LearnedSpell structure (mirrors SpellwebNode for training)
interface LearnedSpell {
  id: string;
  type: 'emoji' | 'proverb' | 'keyword' | 'hexagram';
  content: string;
  emoji?: string;
  myTermsMapping: string;           // Privacy concept mapping
  weight: number;
  yangYin: 'yang' | 'yin';
  source: 'story' | 'zk' | 'canon' | 'parallel' | 'plurality';
  learnedInSection: string;
}

// DEFAULT_SPELLS (7 base spells)
const DEFAULT_SPELLS = [
  { id: 'emoji_shield', emoji: '🛡️', myTermsMapping: 'DO_NOT_TRACK', yangYin: 'yang', source: 'story' },
  { id: 'emoji_crystal', emoji: '🔮', myTermsMapping: 'SELECTIVE_DISCLOSURE', yangYin: 'yin', source: 'zk' },
  { id: 'emoji_dragon', emoji: '🐉', myTermsMapping: 'TRUST_EXTENSION', yangYin: 'yang', source: 'story' },
  { id: 'proverb_gap', emoji: '⊥', myTermsMapping: 'DATA_MINIMISATION', yangYin: 'yang', source: 'story' },
  { id: 'proverb_weather', emoji: '🌧️', myTermsMapping: 'EPHEMERAL_SESSION', yangYin: 'yin', source: 'story' },
  { id: 'keyword_dnt', emoji: '🚫', myTermsMapping: 'DO_NOT_TRACK', yangYin: 'yang', source: 'canon' },
  { id: 'keyword_dns', emoji: '💰', myTermsMapping: 'DO_NOT_SELL', yangYin: 'yang', source: 'canon' },
];
```

### Spellbook → Source Mapping

| spellweb Spellbook | agentprivacy Source | Node Count |
|--------------------|---------------------|------------|
| `first_person` | `story` | 28 acts |
| `zero_knowledge` | `zk` | 30 tales |
| `blockchain_canon` | `canon` | 11 chapters |
| `parallel_society` | `parallel` | 17 chapters |
| `plurality` | `plurality` | 30+ acts |

---

## Stance Line ↔ Dimension Mapping

Both systems use identical line-to-dimension mapping:

| Line | Dimension | spellweb | agentprivacy | Emoji |
|------|-----------|----------|--------------|-------|
| L1 | Protection | `d1Hide` | `DO_NOT_TRACK` | 🛡️ |
| L2 | Delegation | `d2Commit` | `AGENT_DELEGATION` | 🤝 |
| L3 | Memory | `d3Prove` | `DATA_RESIDENCY` | 📜 |
| L4 | Connection | `d4Connect` | `MULTI_PARTY` | 🔗 |
| L5 | Computation | `d5Reflect` | `ZK_PROOF` | ⚡ |
| L6 | Value | `d6Delegate` | `ECONOMIC_FLOW` | 💎 |

---

## Import/Export Flow

### Export (spellweb → URL)

```typescript
// 1. Forge blade with constellation
const blade: ForgedBlade = {
  id: 'blade-1234',
  name: 'Universe',
  emoji: '🐉',
  tier: 'dragon',
  stratum: 6,
  proof: {
    signature: 'SPELL-YW5I59-1Q',
    bladeHex: '3F',
    ...
  },
  constellationMarks: [
    { emoji: '🔑⚔️🧙→😊', label: 'Genesis Ceremony' },
    { emoji: '🗡️🔮', label: 'Dual Ceremony' },
    // ... 4 more
  ]
};

// 2. Encode for URL
const payload: SpellwebBladeImportPayloadV1 = {
  v: 1,
  bladeId: blade.proof.signature,
  name: blade.name,
  primaryEmoji: blade.emoji,
  markEmojis: blade.constellationMarks.map(m => m.emoji),
  proofSignature: blade.proof.signature,
  isWitness: blade.isWitness,
};

// 3. Base64URL encode
const token = encodeSpellwebBladePayloadForUrl(payload);
// Opens: agentprivacy.ai/spells?spellwebBlade={token}
```

### Import (URL → agentprivacy)

```typescript
// 1. Decode URL parameter
const payload = decodeSpellwebBladePayload(urlParam);

// 2. Parse and add to inventory
const blade: InventoryBlade = {
  id: payload.proofSignature || `blade-${Date.now()}`,
  name: payload.name,
  primaryEmoji: payload.primaryEmoji,
  proofSignature: payload.proofSignature,
  isWitness: payload.isWitness,
  bladeHex: extractedHex,  // From markdown or computed
  tier: computeTier(stratum),
  stratum: computeStratum(hex),
  facets: payload.markEmojis.slice(0, 6).map((emoji, i) => ({
    emoji,
    label: `Facet ${i + 1}`,
    lineIndex: i,
  })),
  importedAt: new Date().toISOString(),
};

// 3. Save to inventory
saveBladeInventory([...existing, blade]);
```

### Markdown Import

Both systems support importing blade `.md` files with this format:

```markdown
# 🐉 Universe

**Signature:** SPELL-YW5I59-1Q
**Hex:** 3F
**Tier:** Dragon Blade
**Stratum:** 6/6

## Constellation Path

1. 🔑⚔️🧙→😊 **Genesis Ceremony**
2. 🗡️🔮 **Dual Ceremony**
3. 📖💰 **Venice, 1494**
4. ✦ **7th Capital**
5. ✦ **The Gap ⊥**
6. 😊 **Person**
```

---

## Orb Loadout Mirroring

### SPELLWEB Constellation Display

```typescript
// Constellation marks orbit the forge
constellationMarks.forEach((mark, i) => {
  const angle = (i / 6) * Math.PI * 2;
  // Render at orbit position
});
```

### AGENTPRIVACY Orb Display

```typescript
// Dual orb loadout
interface OrbLoadout {
  version: 2;
  stanceHexLines: [0|1, 0|1, 0|1, 0|1, 0|1, 0|1];
  swordsman: OrbLoadoutSlot[];  // 6 slots from blade facets
  mage: OrbLoadoutSlot[];       // 6 slots from spell choices
}

// Swordsman orb uses blade facet emojis
// Mage orb uses spell emojis from grimoire/training
```

### Sync Flow

```
spellweb constellationMarks[0-5]
    ↓ (import)
agentprivacy blade.facets[0-5]
    ↓ (equip)
agentprivacy orbLoadout.swordsman[0-5].emoji
    ↓ (render)
Training orbs with facet emojis orbiting
```

---

## Storage Key Mirroring

### SPELLWEB Keys

```typescript
const SPELLWEB_KEYS = {
  forgedBlades: 'spellweb-forged-blades',
  equippedBlade: 'spellweb-equipped-blade',
  constellations: 'spellweb-constellations',
  userEdges: 'spellweb-user-edges',
};
```

### AGENTPRIVACY Keys

```typescript
const AGENTPRIVACY_KEYS = {
  bladeMeta: 'agentprivacy_spellweb_blade_meta',
  bladeInventory: 'agentprivacy_spellweb_blade_inventory',
  equippedBlade: 'agentprivacy_spellweb_equipped_blade',
  stanceLoadout: 'agentprivacy_spellweb_stance_loadout',
  orbLoadout: 'agentprivacy_orb_loadout_v1',
  spellRepertoire: 'agentprivacy_spell_repertoire',
};
```

---

## Validation Rules

Both systems enforce these rules:

### Blade Validation

1. **Hex must be 2 characters** (00-3F valid range)
2. **Stratum must match hex** (Hamming weight of binary)
3. **Tier must match stratum**:
   - 0-2 active dims → `light`
   - 3-4 active dims → `heavy`
   - 5-6 active dims → `dragon`
4. **Signature format**: `SPELL-{6chars}-{2char checksum}`

### Spell Validation

1. **Emoji must be valid Unicode** (codepoint > 0x2FF)
2. **Source must be valid spellbook** (`story`, `zk`, `canon`, `parallel`, `plurality`)
3. **YangYin must be binary** (`yang` or `yin`)

---

## Ceremony → Soul Mapping

The convergence ceremony produces a `.soul` file that captures the full mirror state:

```typescript
interface SoulFile {
  // Swordsman (7 blades)
  swordsman: {
    bladeRing: {
      L1: SoulBlade | null;  // From blade.facets[0]
      L2: SoulBlade | null;  // From blade.facets[1]
      L3: SoulBlade | null;  // From blade.facets[2]
      L4: SoulBlade | null;  // From blade.facets[3]
      L5: SoulBlade | null;  // From blade.facets[4]
      L6: SoulBlade | null;  // From blade.facets[5]
      swap: SoulBlade | null; // 7th blade
    };
    combinedHex: string;     // All blade hexes joined
  };

  // Mage (8 spells)
  mage: {
    spellOrbit: SoulSpell[];   // 6 active orbit spells
    spellReserve: SoulSpell[]; // 2 reserve spells
    totalSpells: number;        // Should be 8
  };
}
```

---

## Verification Checklist

To ensure systems are properly mirrored:

- [ ] Blade hex encodes same 6 dimensions in both systems
- [ ] Stratum calculation matches (Hamming weight)
- [ ] Tier thresholds identical (1-2=light, 3-4=heavy, 5-6=dragon)
- [ ] Facet emojis transfer correctly (first 6 constellation marks)
- [ ] Signature format validated on import
- [ ] Spellbook → source mapping consistent
- [ ] Yang/yin assignment follows dimension parity
- [ ] Orb display uses correct facet/spell emojis

---

*"The forge and the stance are mirrors. What you forge, you can equip. What you equip, you can assert."*

---

*Forged in the 64-Tetrahedra Lattice*
*(⚔️⊥⿻⊥🧙)🙂*
