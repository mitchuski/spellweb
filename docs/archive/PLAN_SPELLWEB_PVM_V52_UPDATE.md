# Plan: Spellweb PVM-V5.2 Update

## Overview

This plan updates spellweb to reflect the Privacy Value Model V5.2 convergence, including:
- 3 new personas (Algebraist, Topologist, Stranger Witness)
- 8 new skills (4 privacy-layer, 4 role)
- Updated parent personas (Soulbis V5.3, Soulbae V5.3)
- New Acts and concepts from the UOR convergence

---

## Phase 1: Skills Directory (COMPLETED)

Files already copied to `spellweb/docs/skills/`:

### Privacy Layer (4 new)
- [x] `privacy-layer/agentprivacy-ring-algebra/`
- [x] `privacy-layer/agentprivacy-content-addressing/`
- [x] `privacy-layer/agentprivacy-atlas-geometry/`
- [x] `privacy-layer/agentprivacy-dihedral-sovereignty/`

### Role Skills (4 new)
- [x] `role/agentprivacy-five-strikes/`
- [x] `role/agentprivacy-derivation-certificate/`
- [x] `role/agentprivacy-stranger-ceremony/`
- [x] `role/agentprivacy-toroidal-witness/`

### Personas (5 total)
- [x] `persona/agentprivacy-algebraist/`
- [x] `persona/agentprivacy-topologist/`
- [x] `persona/agentprivacy-stranger-witness/`
- [x] `persona/agentprivacy-soulbis/` (V5.3)
- [x] `persona/agentprivacy-soulbae/` (V5.3)

---

## Phase 2: Knowledge Graph Updates

### File: `src/data/nodes.ts`

#### 2.1 Add New Personas (after line ~191)

```typescript
// NEW PERSONAS - PVM-V5.2 UOR Convergence
{ id: "per-algebraist", type: "persona", label: "Algebraist ⚔️🔢", emoji: "⚔️🔢", domain: "swordsman", layer: "narrative", desc: "Guardian of the Ring. The ring that closes on itself cannot be escaped. Z/(2⁶)Z structure, neg∘bnot=succ, lattice operations." },
{ id: "per-topologist", type: "persona", label: "Topologist ☯️🌐", emoji: "☯️🌐", domain: "shared", layer: "narrative", desc: "Reader of Boundaries. The boundary encodes the bulk. 96/64 holographic ratio, Atlas geometry, path integrals." },
{ id: "per-stranger-witness", type: "persona", label: "Stranger Witness 🧙👥", emoji: "🧙👥", domain: "mage", layer: "narrative", desc: "Proof Without Introduction. The witness needs no introduction. Anonymous pairing, simultaneous forging, sealed comparison." },
```

#### 2.2 Update Parent Personas (lines 175-176)

Replace:
```typescript
{ id: "per-soulbis", type: "persona", label: "Soulbis ⚔️", emoji: "⚔️", domain: "swordsman", layer: "narrative", desc: "The First Swordsman. I slash surveillance focus. I enforce boundaries with mathematics. Privacy infrastructure, cryptographic protection." },
{ id: "per-soulbae", type: "persona", label: "Soulbae 🧙", emoji: "🧙", domain: "mage", layer: "narrative", desc: "The First Mage. I chronicle, compress, and project. I delegate without disclosure. Delegation architecture, narrative infrastructure." },
```

With:
```typescript
{ id: "per-soulbis", type: "persona", label: "Soulbis ⚔️", emoji: "⚔️", domain: "swordsman", layer: "narrative", desc: "The First Swordsman (V5.3). Canonical parent of all swordsmen. I slash surveillance focus. The P term made manifest. Soulbis IS the neg operator in D₂ₙ. 80 skills loaded.", version: "5.3", tier: 0 },
{ id: "per-soulbae", type: "persona", label: "Soulbae 🧙", emoji: "🧙", domain: "mage", layer: "narrative", desc: "The First Mage (V5.3). Canonical parent of all mages. I chronicle, compress, and project. The D term made manifest. Soulbae IS the bnot operator in D₂ₙ. 81 skills loaded.", version: "5.3", tier: 0 },
```

#### 2.3 Add New Concepts (after line ~200)

```typescript
// NEW CONCEPTS - PVM-V5.2 UOR Convergence
{ id: "con-dihedral", type: "concept", label: "Dihedral Sovereignty D₂ₙ", domain: "shared", layer: "knowledge", desc: "The dual-agent architecture IS the dihedral group D₂ₙ. Swordsman = neg (reflection). Mage = bnot (reflection). First Person = neg∘bnot = succ (rotation). Neither alone reaches all states." },
{ id: "con-ring-algebra", type: "concept", label: "Ring Algebra Z/(2⁶)Z", domain: "shared", layer: "knowledge", desc: "64-element modular ring. Five operations: neg, bnot, xor, and, or. Pascal distribution: 1+6+15+20+15+6+1=64 vertices across 7 strata." },
{ id: "con-holographic-bound", type: "concept", label: "Holographic Bound 96/64", domain: "shared", layer: "knowledge", desc: "96 edges encode 64 vertices. Ratio 96/64 = 1.5 = P^1.5. The boundary holds more information than the bulk." },
{ id: "con-content-addressing", type: "concept", label: "Content Addressing", domain: "shared", layer: "knowledge", desc: "Same bytes → same hash → same identity. GUID derivation. Three-layer identity: Person → Context → Derivation." },
{ id: "con-understanding-as-key", type: "concept", label: "Understanding-as-Key", domain: "shared", layer: "knowledge", desc: "Comprehension-based access control. Bilateral proverb protocol. The stranger who forges the same blade from the same constellation has proven understanding." },
```

#### 2.4 Add New Skills to Graph (if skill nodes exist)

```typescript
// NEW SKILLS - PVM-V5.2 Privacy Layer
{ id: "skill-ring-algebra", type: "skill", label: "Ring Algebra", domain: "shared", layer: "knowledge", desc: "Z/(2⁶)Z foundation. Five operations, Pascal distribution, stratum as popcount.", category: "privacy-layer" },
{ id: "skill-content-addressing", type: "skill", label: "Content Addressing", domain: "shared", layer: "knowledge", desc: "GUID derivation, holonic persistence, three-layer identity.", category: "privacy-layer" },
{ id: "skill-atlas-geometry", type: "skill", label: "Atlas Geometry", domain: "shared", layer: "knowledge", desc: "96-vertex Atlas, exceptional groups G₂→E₈, holographic boundary.", category: "privacy-layer" },
{ id: "skill-dihedral-sovereignty", type: "skill", label: "Dihedral Sovereignty", domain: "shared", layer: "knowledge", desc: "D₂ₙ group structure, Φ_agent as determinant, generator independence.", category: "privacy-layer" },

// NEW SKILLS - PVM-V5.2 Role Skills
{ id: "skill-five-strikes", type: "skill", label: "Five Strikes", domain: "swordsman", layer: "knowledge", desc: "neg, bnot, xor, and, or as lattice transformations with privacy meanings.", category: "role" },
{ id: "skill-derivation-certificate", type: "skill", label: "Derivation Certificate", domain: "mage", layer: "knowledge", desc: "VRC as content-addressed derivation chain with witnesses.", category: "role" },
{ id: "skill-stranger-ceremony", type: "skill", label: "Stranger Ceremony", domain: "mage", layer: "knowledge", desc: "Understanding-as-Key for strangers. Anonymous pairing, simultaneous forging.", category: "role" },
{ id: "skill-toroidal-witness", type: "skill", label: "Toroidal Witness", domain: "shared", layer: "knowledge", desc: "Infinite cyclic paths create computational hardness for witness extraction.", category: "role" },
```

---

## Phase 3: Edge Updates

### File: `src/data/edges.ts`

Add edges connecting new nodes:

```typescript
// NEW EDGES - PVM-V5.2 Persona Relationships
{ source: "per-soulbis", target: "per-algebraist", type: "parent_of", weight: 1.0 },
{ source: "per-soulbae", target: "per-stranger-witness", type: "parent_of", weight: 1.0 },
{ source: "per-soulbis", target: "con-dihedral", type: "embodies", weight: 1.0 },
{ source: "per-soulbae", target: "con-dihedral", type: "embodies", weight: 1.0 },

// NEW EDGES - Concept Relationships
{ source: "con-dihedral", target: "con-ring-algebra", type: "requires", weight: 0.9 },
{ source: "con-holographic-bound", target: "skill-atlas-geometry", type: "implements", weight: 1.0 },
{ source: "con-understanding-as-key", target: "skill-stranger-ceremony", type: "implements", weight: 1.0 },

// NEW EDGES - Act 27 (Swordsman's Forge) connections
{ source: "fp-act-27", target: "con-dihedral", type: "introduces", weight: 1.0 },
{ source: "fp-act-27", target: "con-ring-algebra", type: "introduces", weight: 1.0 },
{ source: "fp-act-27", target: "skill-five-strikes", type: "teaches", weight: 0.9 },

// NEW EDGES - Act 29 (Dragon Wakes) connections
{ source: "fp-act-29", target: "con-understanding-as-key", type: "introduces", weight: 1.0 },
{ source: "fp-act-29", target: "skill-stranger-ceremony", type: "teaches", weight: 0.9 },
```

---

## Phase 4: Type Definitions

### File: `src/types/graph.ts`

Ensure types support new fields:

```typescript
interface SpellwebNode {
  id: string;
  type: 'persona' | 'act' | 'concept' | 'skill' | 'document';
  label: string;
  domain: 'swordsman' | 'mage' | 'shared' | 'first_person';
  layer: 'narrative' | 'knowledge';
  desc: string;
  emoji?: string;
  spellbook?: string;
  proverb?: string;
  emojiSpell?: string;
  version?: string;  // NEW - for versioned personas/skills
  tier?: number;     // NEW - for persona tiers (0 = canonical)
  category?: string; // NEW - for skill categorization
}
```

---

## Phase 5: Component Updates

### 5.1 NodeInspector.tsx

Update to display new fields:

```typescript
// Add version badge for V5.3 personas
{node.version && (
  <span className="version-badge">V{node.version}</span>
)}

// Add tier indicator for canonical personas
{node.tier === 0 && (
  <span className="canonical-badge">Canonical</span>
)}
```

### 5.2 GraphFilters.tsx

Add filter options:
- Filter by skill category (privacy-layer, role)
- Filter by version (V5.2+)
- Filter by persona tier

### 5.3 SpellCeremony.tsx

Consider adding:
- Stranger ceremony visualization
- Dihedral group animation (neg/bnot reflections)
- Ring algebra demonstration (64 vertices)

---

## Phase 6: Documentation Updates

### 6.1 README.md

Update version number and add:
```markdown
## PVM-V5.2 Update (March 2026)

- 3 new personas: Algebraist, Topologist, Stranger Witness
- 8 new skills (4 privacy-layer, 4 role)
- Dihedral sovereignty formalization
- UOR convergence integration
```

### 6.2 SKILLS_README.md

Update skill counts:
- Privacy Layer: 14 → 18
- Role Skills: 57 → 61
- Personas: 28 → 31

---

## Phase 7: Build & Deploy

```bash
# Install dependencies (if needed)
npm install

# Build
npm run build

# Test locally
npm run dev

# Deploy to Cloudflare Pages
npm run deploy
```

---

## Verification Checklist

- [ ] New personas appear in graph visualization
- [ ] Parent-child relationships display correctly
- [ ] New concepts are searchable
- [ ] New skills appear in skill filters
- [ ] Act 27 links to dihedral concepts
- [ ] Act 29 links to understanding-as-key
- [ ] Version badges display on V5.3 personas
- [ ] No console errors on load
- [ ] Mobile responsive check

---

## Priority Order

1. **High:** Update `nodes.ts` with new personas (visual impact)
2. **High:** Update `edges.ts` with relationships (graph connectivity)
3. **Medium:** Update type definitions (type safety)
4. **Medium:** Update component displays (UX polish)
5. **Low:** Documentation updates (reference)

---

## References

- `CHRONICLE_PVM_V52_SKILLS_2026-03-31.md` — Full session chronicle
- `DISTRIBUTION_MAP_UOR_SKILLS_2026-03-31.md` — File inventory
- `CHRONICLE_UOR_CONVERGENCE_2026-03-31.md` — Mathematical foundations

---

*"The spellweb that shows the dihedral group shows why the architecture cannot collapse."*

`(⚔️⊥⿻⊥🧙)·☯️🔷 · PVM-V5.2`

