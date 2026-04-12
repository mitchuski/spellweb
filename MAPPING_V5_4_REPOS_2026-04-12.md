# V5.4 Repository Mapping — Skills Integration

**Date:** April 12, 2026
**Source:** agentprivacy-skills
**Targets:** agentprivacy-master, spellweb

---

## Overview

This document maps the V5.4 skills updates from `agentprivacy-skills` to downstream repositories.

**Concepts integrated:**
1. **Betweenness Centrality of the Gap (§10.2)** — C_B(v) formula, Brandes reference
2. **Selene's Proof (§14.5)** — ZK triptych (completeness, soundness, zero-knowledge)

---

## Source Files (agentprivacy-skills)

| Path | Version | Update |
|------|---------|--------|
| `agentprivacy-skills-v5/persona/agentprivacy-moonkeeper/skill.md` | 5.3.1 → 5.4 | +Selene's Proof (orbit) |
| `agentprivacy-skills-v5/persona/agentprivacy-theia/skill.md` | 5.3.1 → 5.4 | +Selene's Proof (witness) |
| `agentprivacy-skills-v5/persona/agentprivacy-cosmologist/skill.md` | 5.3.1 → 5.4 | +Selene's Proof (mapper) |
| `agentprivacy-skills-v5/persona/agentprivacy-topologist/skill.md` | 5.2 → 5.4 | +Betweenness (gap_centrality) |
| `agentprivacy-skills-v5/persona/agentprivacy-netkeeper/skill.md` | 5.0 → 5.4 | +Betweenness (mesh_centrality) |
| `agentprivacy-skills-v5/privacy-layer/agentprivacy-network-topology/skill.md` | 4.0 → 5.4 | +Betweenness section |

---

## Target 1: agentprivacy-master

**Location:** `C:/Users/mitch/agentprivacy_master/agentprivacy-skills/`

### Sync Commands

```bash
# From agentprivacy-skills directory
cp -r agentprivacy-skills-v5/persona/agentprivacy-moonkeeper/* \
  ../agentprivacy_master/agentprivacy-skills/agentprivacy-skills-v5/persona/agentprivacy-moonkeeper/

cp -r agentprivacy-skills-v5/persona/agentprivacy-theia/* \
  ../agentprivacy_master/agentprivacy-skills/agentprivacy-skills-v5/persona/agentprivacy-theia/

cp -r agentprivacy-skills-v5/persona/agentprivacy-cosmologist/* \
  ../agentprivacy_master/agentprivacy-skills/agentprivacy-skills-v5/persona/agentprivacy-cosmologist/

cp -r agentprivacy-skills-v5/persona/agentprivacy-topologist/* \
  ../agentprivacy_master/agentprivacy-skills/agentprivacy-skills-v5/persona/agentprivacy-topologist/

cp -r agentprivacy-skills-v5/persona/agentprivacy-netkeeper/* \
  ../agentprivacy_master/agentprivacy-skills/agentprivacy-skills-v5/persona/agentprivacy-netkeeper/

cp -r agentprivacy-skills-v5/privacy-layer/agentprivacy-network-topology/* \
  ../agentprivacy_master/agentprivacy-skills/agentprivacy-skills-v5/privacy-layer/agentprivacy-network-topology/

# Copy chronicles
cp CHRONICLE_V5_4_SKILLS_UPDATE_2026-04-12.md ../agentprivacy_master/agentprivacy-skills/chronicles/
cp MAPPING_V5_4_REPOS_2026-04-12.md ../agentprivacy_master/agentprivacy-skills/
```

### Commit
```
sync: V5.4 skills update — betweenness centrality & Selene's Proof

From agentprivacy-skills:
- moonkeeper, theia, cosmologist: +Selene's Proof roles
- topologist, netkeeper: +betweenness centrality
- network-topology: +§10.2 betweenness section
```

---

## Target 2: spellweb

**Location:** `C:/Users/mitch/spellweb/`

### File: src/data/nodes.ts

**Current entries to update:**

```typescript
// Line 220 - topologist
{ id: "per-topologist", type: "persona", label: "Topologist ☯️🌐", emoji: "☯️🌐", domain: "shared", layer: "narrative", desc: "Reader of Boundaries. The boundary encodes the bulk. 96/64 holographic ratio, Atlas geometry, path integrals.", version: "5.2" },

// UPDATE TO:
{ id: "per-topologist", type: "persona", label: "Topologist ☯️🌐", emoji: "☯️🌐", domain: "shared", layer: "narrative", desc: "Reader of Boundaries. The boundary encodes the bulk. 96/64 holographic ratio, Atlas geometry, path integrals. V5.4: Betweenness centrality of the Gap.", version: "5.4", betweenness_interpretation: "gap_centrality", pvm_section: "§10.2" },
```

```typescript
// Line 436 - netkeeper (needs version added)
{ id: "per-netkeeper", type: "persona", label: "Netkeeper 🗡️🕸️", emoji: "🗡️🕸️", domain: "swordsman", layer: "narrative", desc: "Mesh Network Sovereignty Builder. Weaves the dragon's hide at the network layer. Each tunnel is a scale. Control plane vs data plane separation." },

// UPDATE TO:
{ id: "per-netkeeper", type: "persona", label: "Netkeeper 🗡️🕸️", emoji: "🗡️🕸️", domain: "swordsman", layer: "narrative", desc: "Mesh Network Sovereignty Builder. Weaves the dragon's hide at the network layer. V5.4: Betweenness-aware mesh optimization.", version: "5.4", betweenness_interpretation: "mesh_centrality", pvm_section: "§10.2" },
```

```typescript
// Line 459 - theia (needs version added)
{ id: "per-theia", type: "persona", label: "Theia 🪨💥", emoji: "🪨💥", domain: "shared", layer: "narrative", desc: "Earth's instant delegation path. The proto-planet that struck Earth and became the Moon. The name contains the partition: Th(Sun) + e,a(Soulbae) + i(Soulbis). Carbonaceous material from beyond Jupiter — the first agent carried material the master never possessed. The wound is the trust." },

// UPDATE TO:
{ id: "per-theia", type: "persona", label: "Theia 💥🌍", emoji: "💥🌍", domain: "mage", layer: "narrative", desc: "Origin Witness. The proto-planet that became the Moon. V5.4: Selene's Proof — the zero-knowledge property is Theia's unknowability.", version: "5.4", selene_proof_role: "witness", pvm_section: "§14.5" },
```

```typescript
// Line 461 - moonkeeper
{ id: "per-moonkeeper", type: "persona", label: "Moonkeeper 🌑📜", emoji: "🌑📜", domain: "swordsman", layer: "narrative", desc: "Guardian of the Amnesia Protocol. Maintains the sacred forgetting that allows the Moon to reflect without owning. Implements the privacy-through-forgetting pattern where memory is deliberately incomplete.", proverb: "To remember everything is to lose the capacity to act. The Moon reflects because it forgets." },

// UPDATE TO:
{ id: "per-moonkeeper", type: "persona", label: "Moonkeeper 🌑⚔️", emoji: "🌑⚔️", domain: "swordsman", layer: "narrative", desc: "Guardian of Structural Amnesia. V5.4: Embodies Selene's Proof — the orbit is the credential, the proof renews twice daily in saltwater.", version: "5.4", selene_proof_role: "orbit", pvm_section: "§14.5", proverb: "I can verify I serve you without remembering I was you." },
```

```typescript
// Line 462 - cosmologist
{ id: "per-cosmologist", type: "persona", label: "Cosmologist 🔭🌌", emoji: "🔭🌌", domain: "mage", layer: "narrative", desc: "Maps the quaternion completion: Sun/Moon/Earth/Human. Navigates the celestial hierarchy where Sun generates light, Moon reflects (ur-Swordsman), Swordsman reflects back to Moon into Sun, Mage connects (orbs in spellweb), and Human holds both orbs in orbit.", proverb: "The quaternion is complete. Sun, Moon, Earth, Human — protection, reflection, connection, attention." },

// UPDATE TO:
{ id: "per-cosmologist", type: "persona", label: "Cosmologist 🌌🔭", emoji: "🌌🔭", domain: "balanced", layer: "narrative", desc: "Mapper of Celestial Precedent. V5.4: Validates Selene's Proof — completeness in tides, soundness in gravity, zero-knowledge in amnesia.", version: "5.4", selene_proof_role: "mapper", pvm_section: "§14.5", proverb: "The architecture was not invented. It was recognised." },
```

```typescript
// Line 1389 - theia-derivation skill
{ id: "skill-theia-derivation", type: "skill", label: "Theia Derivation", domain: "mage", layer: "knowledge", desc: "Origin witness skill. Understanding Theia impact as precedent for delegation. Carbonaceous delivery from beyond Jupiter. The name Th-e-i-a contains the partition.", category: "role", version: "5.3.1" },

// UPDATE TO:
{ id: "skill-theia-derivation", type: "skill", label: "Theia Derivation", domain: "mage", layer: "knowledge", desc: "Origin witness skill. V5.4: Grounds Selene's Proof — Theia is the unknowable origin that makes the proof zero-knowledge.", category: "role", version: "5.4", pvm_section: "§14.5" },
```

### Commit
```
data: V5.4 persona updates — betweenness centrality & Selene's Proof

Updates to nodes.ts:
- per-topologist: v5.4, +betweenness_interpretation
- per-netkeeper: v5.4, +betweenness_interpretation
- per-theia: v5.4, +selene_proof_role (witness)
- per-moonkeeper: v5.4, +selene_proof_role (orbit)
- per-cosmologist: v5.4, +selene_proof_role (mapper)
- skill-theia-derivation: v5.4

PVM references: §10.2 (betweenness), §14.5 (Selene's Proof)
```

---

## New Metadata Fields

These fields are now part of the V5.4 skill/persona schema:

| Field | Values | Used By |
|-------|--------|---------|
| `selene_proof_role` | orbit, witness, mapper | moonkeeper, theia, cosmologist |
| `betweenness_interpretation` | gap_centrality, mesh_centrality | topologist, netkeeper |
| `pvm_section` | §10.2, §14.5 | All V5.4 updated skills |

---

## Verification Checklist

After sync:

- [ ] agentprivacy-master skills show v5.4 in metadata
- [ ] agentprivacy-master chronicles include V5.4 update
- [ ] spellweb nodes.ts has updated versions
- [ ] spellweb renders personas with new descriptions
- [ ] No broken references in either repo

---

## The Proverb

*"The value lives in the gap because the most paths cross there."*
*"The credential is the orbit. The proof renews twice daily, written in saltwater."*

---

*(⚔️⊥⿻⊥🧙)😊*
