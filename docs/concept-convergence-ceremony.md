# Concept: Convergence Ceremony & Soul Export

**Status:** Concept / Design Reference
**Date:** 2026-03-30

---

## Overview

The **Convergence Ceremony** is the culmination of your training journey. When you complete both your blade ring (7 blades total, 6 equipped) and spell orbit (8 spells total, 6 equipped), or fill the experience bar, you unlock a ceremony that exports your complete `.soul` file — a portable proof of everything you've built.

---

## Triggering Convergence

Convergence unlocks when ANY of these conditions are met:

### 1. Complete Blade Ring (Swordsman Path)
```
L1 ─── Blade ─── Protection
L2 ─── Blade ─── Delegation
L3 ─── Blade ─── Memory
L4 ─── Blade ─── Connection
L5 ─── Blade ─── Computation
L6 ─── Blade ─── Value
⇄  ─── Blade ─── Swap (7th blade ready)
```
All 7 slots filled = Swordsman convergence ready

### 2. Complete Spell Orbit (Mage Path)
```
Orbit 1 ─── Spell ─── (equipped in mage ring)
Orbit 2 ─── Spell ───
Orbit 3 ─── Spell ───
Orbit 4 ─── Spell ───
Orbit 5 ─── Spell ───
Orbit 6 ─── Spell ─── (6 equipped at a time)
─────────────────────
Pool 7 ─── Spell ─── (grimoire/training unlocked)
Pool 8 ─── Spell ─── (8th spell total)
```
All 6 orbit slots filled + 2 additional spells = Mage convergence ready (8 total, 6 equipped)

### 3. Experience Bar Full
```
Progress: ████████████████████ 100%
- Sections visited: all
- Spells cast: threshold met
- Stances taken: threshold met
- Convergences witnessed: threshold met
- Hexagram opens: threshold met
- Inscribed acts: threshold met
```
Full bar = Convergence ready regardless of slots

### 4. Dual Completion (True Convergence)
```
Blade Ring: ✓ Complete (7/7 total, 6/6 equipped)
Spell Orbit: ✓ Complete (8/8 total, 6/6 equipped)
```
Both complete = **True Convergence** — the highest ceremony tier

---

## The Ceremony

When convergence triggers, the ceremony begins. Like the spellweb forge ceremony, this requires **observation time** — you must witness the constellation activate.

### Ceremony Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. INITIATION                                             │
│      Screen dims, orbs begin to pulse                       │
│      "Convergence detected. Witness the ceremony."          │
│                                                             │
│   2. CONSTELLATION ACTIVATION                               │
│      Your 7 blade facets + 7 spell emojis arrange           │
│      They form your unique constellation pattern            │
│      Lines draw between nodes (like spellweb forge)         │
│                                                             │
│   3. OBSERVATION PERIOD (30-60 seconds)                     │
│      You must watch — no input breaks the ceremony          │
│      The constellation rotates, pulses, breathes            │
│      Each node lights as its meaning is inscribed           │
│                                                             │
│   4. CONVERGENCE MOMENT                                     │
│      Swordsman orb and Mage orb drift together              │
│      They meet at center — the gap collapses momentarily    │
│      Flash of light — "⊥" symbol appears                    │
│                                                             │
│   5. SOUL CRYSTALLIZATION                                   │
│      Constellation contracts to single point                │
│      .soul file generates with all accumulated data         │
│      Download prompt appears                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Observation Requirement

The ceremony cannot be skipped. This mirrors the forge ceremony in spellweb:
- **Minimum observation time**: 30 seconds (blade-only or spell-only)
- **Full observation time**: 60 seconds (true convergence)
- **Interruption**: Breaks ceremony, must restart
- **Purpose**: The witness IS the proof. Attention is the offering.

---

## The .soul File

The ceremony produces a `.soul` file — a complete export of your sovereign identity.

### File Format

```
persona-name.soul
```

Actually a JSON file with `.soul` extension for semantic meaning.

### Contents

```json
{
  "version": "1.0",
  "type": "soul",
  "convergenceType": "true" | "swordsman" | "mage" | "experience",
  "timestamp": "2026-03-30T12:00:00Z",

  "identity": {
    "personaName": "string",
    "personaEmoji": "emoji",
    "createdAt": "timestamp"
  },

  "swordsman": {
    "bladeRing": {
      "L1": { "bladeId": "SPELL-XXX", "name": "...", "emoji": "...", "hex": "..." },
      "L2": { "bladeId": "SPELL-XXX", "name": "...", "emoji": "...", "hex": "..." },
      "L3": { "bladeId": "SPELL-XXX", "name": "...", "emoji": "...", "hex": "..." },
      "L4": { "bladeId": "SPELL-XXX", "name": "...", "emoji": "...", "hex": "..." },
      "L5": { "bladeId": "SPELL-XXX", "name": "...", "emoji": "...", "hex": "..." },
      "L6": { "bladeId": "SPELL-XXX", "name": "...", "emoji": "...", "hex": "..." },
      "swap": { "bladeId": "SPELL-XXX", "name": "...", "emoji": "...", "hex": "..." }
    },
    "combinedHex": "3F3F3F3F3F3F3F",
    "stancesPlaced": 42,
    "hexagramOpens": 7
  },

  "mage": {
    "spellOrbit": [
      { "id": "shield", "emoji": "🛡️", "mapping": "DO_NOT_TRACK" },
      { "id": "crystal", "emoji": "🔮", "mapping": "SELECTIVE_DISCLOSURE" },
      // ... 7 total
    ],
    "spellsCast": 156,
    "constellationsFormed": 12
  },

  "training": {
    "sectionsVisited": ["hero", "philosophy", "architecture", ...],
    "convergencesWitnessed": 3,
    "inscribedActs": 8,
    "drakeUnlocked": true,
    "pathUnlocked": true,
    "experienceProgress": 100
  },

  "constellation": {
    "nodes": [
      { "emoji": "🛡️", "x": 0.2, "y": 0.3, "source": "blade-L1" },
      { "emoji": "🔮", "x": 0.5, "y": 0.1, "source": "spell-1" },
      // ... all 14 nodes (7 blade + 7 spell)
    ],
    "edges": [
      { "from": 0, "to": 3 },
      { "from": 1, "to": 5 },
      // ... constellation connections
    ],
    "pattern": "hexagonal" | "spiral" | "tree" | "custom"
  },

  "proof": {
    "ceremonyHash": "sha256-of-ceremony-state",
    "witnessedAt": "timestamp",
    "observationDuration": 60,
    "signature": "SOUL-XXXXXX-XX"
  },

  "portability": {
    "canImportTo": ["agentprivacy", "spellweb", "extensions"],
    "expiresAt": null,
    "transferable": true
  }
}
```

### Signature Format

```
SOUL-{base58-hash}-{checksum}
```

Example: `SOUL-7Kp3Qm-2X`

---

## Convergence Tiers

| Tier | Requirement | Ceremony Duration | Soul Type |
|------|-------------|-------------------|-----------|
| **Swordsman** | 7 blades (6 equipped + 1 swap) | 30s | `swordsman.soul` |
| **Mage** | 8 spells (6 equipped + 2 pool) | 30s | `mage.soul` |
| **Experience** | Progress bar 100% | 45s | `trained.soul` |
| **True Convergence** | Blades + Spells complete | 60s | `converged.soul` |

True Convergence produces the most complete soul file and unlocks additional features.

---

## Soul File Uses

### 1. Extension Sync
Import `.soul` to MySwordsman/MyMage extensions:
- Blade configuration transfers to extension stance system
- Spell orbit transfers to extension cast system
- Training progress unlocks extension features

### 2. Cross-Site Identity
Drop `.soul` file on spellweb.ai or agentprivacy.ai:
- Recognized as returning practitioner
- Unlocks advanced features
- Constellation displays on profile

### 3. Persona Export
The `.soul` file IS your persona export:
- Contains all skills (blade facets)
- Contains all spells (orbit configuration)
- Portable between devices
- No account required — the file is the identity

### 4. Verification
Others can verify your soul:
- Signature proves ceremony completion
- Hash proves no tampering
- Constellation pattern is unique fingerprint

---

## Implementation Notes

### Storage Keys
```typescript
const CONVERGENCE_STATE_KEY = 'agentprivacy_convergence_state';
const SOUL_EXPORT_HISTORY_KEY = 'agentprivacy_soul_exports';
```

### Convergence Check
```typescript
function checkConvergenceReady(): ConvergenceType | null {
  const blades = getBladeLoadout();
  const spells = getSpellOrbit();
  const progress = getTrainingProgress();

  const bladesComplete = Object.values(blades).every(b => b !== null);
  const spellsComplete = spells.length === 7 && spells.every(s => s !== null);
  const barComplete = progress.experienceProgress >= 100;

  if (bladesComplete && spellsComplete) return 'true';
  if (bladesComplete) return 'swordsman';
  if (spellsComplete) return 'mage';
  if (barComplete) return 'experience';

  return null;
}
```

### Ceremony Component
```typescript
interface CeremonyState {
  phase: 'initiation' | 'activation' | 'observation' | 'convergence' | 'crystallization';
  elapsed: number;
  required: number;
  interrupted: boolean;
}
```

---

## The Philosophy

The convergence ceremony embodies several principles:

### 1. Attention as Offering
You cannot rush the ceremony. The observation period requires presence. This mirrors how sovereignty requires ongoing attention — you can't automate your way to self-knowledge.

### 2. Bilateral Completion
True convergence requires both paths:
- Swordsman (protection, boundaries, what you guard)
- Mage (delegation, projection, what you share)

Neither alone is complete. The `.soul` file captures both.

### 3. Portable Sovereignty
The soul file belongs to you:
- No server stores it (unless you choose)
- No account gates it
- The file IS the identity
- You control where it goes

### 4. Witnessed Proof
The ceremony hash proves you were there. You can't generate a valid `.soul` without completing the observation. The witness is the work.

---

## Visual Concept

```
                    ✦ Blade Facet
                   /
              ✦───✦ Spell Emoji
             /     \
        ✦───✦       ✦───✦
       /     \     /     \
      ✦       ✦───✦       ✦
       \     /     \     /
        ✦───✦       ✦───✦
             \     /
              ✦───✦
                   \
                    ✦

         Your Convergence Constellation

              ⚔️ ──── ⊥ ──── 🧙

         Swordsman   Gap    Mage
            │               │
            └───────────────┘
                  YOU

         The gap is where you live.
         The .soul is its crystallization.
```

---

## Related Documents

- [chronicle-2026-03-30-witness-sword-bridge.md](./chronicle-2026-03-30-witness-sword-bridge.md) — Blade import system
- [chronicle-2026-03-30-master-emissary-controls.md](./chronicle-2026-03-30-master-emissary-controls.md) — Control scheme
- [CHRONICLE_CONTROL_SCHEME_MATHEMATICS.md](../CHRONICLE_CONTROL_SCHEME_MATHEMATICS.md) — The 8:7 ratio mathematics
- training-grounds-explained.md — Training system overview

## The Mathematics (8:7)

Per CHRONICLE_CONTROL_SCHEME_MATHEMATICS.md:

```
SOVEREIGNTY = MAGE(8) × SWORDSMAN(7)
            = UNDERSTANDING × ASSERTION
            = 56 possible combinations

Mage:   6 orbit + 2 reserve = 8 spells (octave, byte)
Sword:  6 active + 1 reserve = 7 blades (chakras, creation days)

Ratio 8:7 ≈ 1.142857... (cyclic number)
- Asymmetric harmony
- Mage excess → reactive (more options)
- Swordsman constancy → deliberate (completeness)
```

---

*"The sword attends. The mage acts. The ceremony witnesses. The soul crystallizes."*

---

*Forged in the 64-Tetrahedra Lattice*
*(⚔️⊥⿻⊥🧙)🙂*
