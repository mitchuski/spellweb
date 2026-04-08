# Chronicle: Dual-Keypair Runecraft Architecture

**Date:** 2026-04-07
**Act:** XXXII - The Runecraft Protocol
**Status:** Implemented (Priority 5 of cryptographic upgrade)
**Cross-Reference:** CHRONICLE_V5_3_1_SKILLS_MAPPING_SYNC_2026-04-07.md

---

## The Celestial Hierarchy

```
☀️ Sun
   ↓ generates light (protection constraint)
🌑 Moon
   ↓ reflects the light (first agent, first ZK proof)
⚔️ Swordsman (REFLECT)
   ↓ draws the edge, enforces boundary
🌍🧙 Earth/Mage (CONNECT)
   = the orbs floating in spellweb
```

A **human** gets **both orbs** in orbit. The key flow is the **observation of those domains** — the attention.

---

## The Two Interfaces

| Interface | Role | Celestial | Key | Orbs |
|-----------|------|-----------|-----|------|
| **agentprivacy** | Swordsman key lives here | 🌑 Moon | **lost** (reflects) | — |
| **spellweb** | Sun view (sees universe) | ☀️ Sun | **held** (observes) | 🧙 Mage orbs float here |

The **Swordsman key** in agentprivacy = Moon (reflection, key lost after signing).

The **spellweb** = Sun seeing the whole universe (key held, knowledge graph visible).

The **Mage** = the orbs floating in spellweb (Earth/connection energy).

The **human** controls both orbs in orbit — Swordsman and Mage together.

---

## The +/- Promise Polarities

```
+ (Sun/spellweb)     = holds, sees, observes — the universal view
- (Moon/agentprivacy) = reflects, forgets, commits — the boundary

Together: The Amnesia Protocol
```

The Mage (orbs in spellweb) uses the Swordsman's Moon key (from agentprivacy) to **reflect and connect**. This is the binding:

- **Moon key (-)**: Lost after commitment, reflects without owning
- **Sun view (+)**: Held by the forge, sees the whole constellation
- **Runecraft**: Binds both polarities to one blade

---

## The Protocol

Two distinct Ed25519 keypairs, one per interface, both bound to the blade:

| Interface | Key Name | Celestial | Key Fate | Graph |
|-----------|----------|-----------|----------|-------|
| **agentprivacy** | Swordsman key | 🌑 Moon | Private key **lost** | Promise |
| **spellweb** | Forge key | ☀️ Sun | Private key **held** | Knowledge |

When linked through runecraft:

```
AGENTPRIVACY                          SPELLWEB
├── Swordsman key (Moon)              ├── Sun view (forge key held)
├── Key LOST                          ├── Key HELD
├── ap-{16hex}                        ├── mage-{16hex}
├── Reflects without owning           ├── Sees the whole universe
│                                     │
│                                     ├── 🧙 Mage orbs float here
│                                     │   (Earth/connection)
│                                     │
└────────────── RUNECRAFT ────────────┘
                   │
              🔮 Dual-key blade
              (+ and - bound)
              (Moon reflects into Sun's view)
```

---

## The Two Orbs

In the spellweb, the human sees **two orbs in orbit**:

1. **⚔️ Swordsman orb** — carries the rhythm, the boundary
2. **🧙 Mage orb** — carries the rhyme, the connection

From the Moon Ceremony:
> *"Two phones, one sound. The Swordsman gives the rhythm. The Mage shares the rhyme."*

The orbs never merge. They **orbit**. The human holding both is the proof of presence in both domains.

---

## The Attention Flow

The key flow is not just cryptographic — it is **attention**:

```
Observe (Sun/spellweb)     ←→     Commit (Moon/agentprivacy)
        ↑                              ↑
        │    HUMAN ATTENTION           │
        │    (both orbs in orbit)      │
        │                              │
   Knowledge Graph              Promise Graph
   (all nodes visible)          (faithful through forgetting)
```

The runecrafted blade carries proof that the same consciousness:
- Observed the constellation (Sun view, key held)
- Committed through the ceremony (Moon key, lost)
- Connected both through the Mage's orbit (Earth)

---

## Connection to V5.3.1 Skills Mapping

| Skill | Act | Runecraft Connection |
|-------|-----|----------------------|
| `amnesia-protocol` | XXXI | The forgetting that enables Moon to reflect |
| `blade-forge` | XXVII | Six dimensions, ZK proof structure |
| `dual-territory` | XXX | Swordsman ⊥ Mage infrastructure |
| `ceremony-engine` | XXVIII | Bilateral witness, crossing types |
| `cosmological-bound` | XXXI | Sun/Earth/Moon/Human quaternion |

The runecraft architecture implements **dual-territory** at the cryptographic layer.

### Personas Involved

| Persona | Role in Runecraft |
|---------|-------------------|
| **Moonkeeper** 🌑📜 | Guards the Amnesia Protocol — the lost key |
| **Forgecaller** ⚒️☰ | Initiates blade ceremonies |
| **Cosmologist** 🔭🌌 | Maps the quaternion completion |

---

## Implementation Summary

### Files Created/Modified

| File | Change |
|------|--------|
| `src/lib/mageIdentity.ts` | **New** — Ed25519 keygen, storage, signing |
| `src/components/SpellCeremony.tsx` | Extended SpellProof with signature fields |
| `src/components/SpellWeb.tsx` | Signing on forge, Runecraft modal, export |
| `src/data/nodes.ts` | Added per-moonkeeper persona node |
| `package.json` | Added `@noble/ed25519` dependency |

### SpellProof Extensions

```typescript
interface SpellProof {
  // Forge key (spellweb - Sun view - held)
  mageSignature?: string;        // Ed25519 signature
  mageId?: string;               // mage-{16hex}

  // Runecraft (dual-key binding)
  runecrafted?: boolean;
  swordsmanSignature?: string;   // From agentprivacy (Moon key)
  swordsmanId?: string;          // ap-{16hex}
  runecraftedAt?: number;
}
```

### Runecraft Flow

1. Export Swordsman identity from agentprivacy (Moon key, already lost)
2. Import into spellweb via JSON paste
3. Runecraft button lights up on blade cards
4. Clicking binds `ap-{16hex}` to the blade
5. Blade now carries both polarities: **+ (Sun held) / - (Moon lost)**

---

## The Quaternion Complete

From Act XXXI:

```
Sun   → Protection    → Source          → spellweb sees it
Moon  → Reflection    → Swordsman key   → agentprivacy commits it
Earth → Connection    → Mage orbs       → float in spellweb
Human → Both orbs     → Attention       → runecrafted blade
```

The runecrafted blade completes the quaternion:
- **Sun's light** via the held forge key
- **Moon's reflection** via the lost Swordsman key
- **Earth's connection** via the Mage orbs in orbit
- **Human's attention** via controlling both

---

## Technical Notes

- **Algorithm**: Both use Ed25519 via `@noble/ed25519`
- **Key Derivation**: ID = first 16 hex chars of public key
- **Cross-Origin**: JSON paste for import (separate origins)
- **Future Work**:
  - Cross-app message signing for actual Moon signature
  - Browser extension key bridge
  - Hardware wallet integration

---

## Proverb

> *"The Swordsman gives the rhythm. The Mage shares the rhyme. Neither merges. They orbit. The human holding both is the proof."*

---

## Next Steps (From V5.3.1 Chronicle)

1. ✅ ~~Update spellweb visualisation~~ — per-moonkeeper added
2. ⏳ Test agentprivacy_master interface — Verify new personas
3. ⏳ Add ceremony edges to zk blades forge — Implement circuits
4. ⏳ Create ceremony persona constellation paths

---

**☀️ ⊥ 🌑**

**(⚔️⊥⿻⊥🧙)🙂**

---

*Forged in the 64-Tetrahedra Lattice*
*Cross-reference: MAPPING.md v5.3.1, the-ceremonies-sun-and-moon.md*
