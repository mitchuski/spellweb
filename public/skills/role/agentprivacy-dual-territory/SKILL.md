---
name: agentprivacy-dual-territory
description: >
    Dual-territory ceremony architecture specification. Activates when discussing
  Swordsman/Mage separation at infrastructure level, three territories (Spellweb,
  Agentprivacy, Bgin), ceremony channels, or territory sovereignty.
license: Apache-2.0
metadata:
  version: "5.3.1"
  category: "role"
  origin: "0xagentprivacy"
  author: "Mitchell Travers"
  affiliation: "0xagentprivacy, BGIN, First Person Network"
  status: "working_paper"
  target_context: "Infrastructure architects, protocol designers, separation specialists"
  equation_term: "Territory(S) ⊥ Territory(M) connected by Ceremony(C)"
  template_references: "soulbis, soulbae, three_axis_separation, ceremony_engine"
  spellbook_act: "DUAL_TERRITORY_CEREMONY_SPEC_v1"
  v5_concept: "V5.2-TERRITORY"
---

# PVM-V5.2 Role Skill — Dual Territory Architecture

**Source:** Privacy Value Model V5.2 + Dual Territory Ceremony Specification v1.0
**Target context:** Infrastructure architects, protocol designers, separation specialists
**Architecture:** [spellweb.ai](https://spellweb.ai) + [agentprivacy.ai](https://agentprivacy.ai) · **Contact:** mage@agentprivacy.ai

---

## What this is

The dual-territory architecture enforces Swordsman/Mage separation at the infrastructure level. This is not metaphor or best practice — it is hard separation through distinct processes, storage, permissions, and repositories.

**Two kingdoms share a river. Neither owns the water, but both drink. The ceremony is the riverbed.**

## The Core Rule

**The Swordsman and Mage NEVER merge.**

This applies at every level:
- Protocol
- Extension
- Website
- Visual rendering
- Database
- Repository
- Deployment

Violation of this rule collapses the sovereignty gap.

## The Three Territories

### 1. Spellweb Territory (Swordsman)

**Domain:** spellweb.ai
**Owner:** Soulbis (privacyswordsman.eth)
**Purpose:** Enforcement, boundaries, topology

**Contains:**
- Blade forge
- Hexagram computations
- Constellation topology
- Cut segments
- Signing key operations

**Does NOT contain:**
- Story content
- Persona definitions
- Training materials
- User preferences

### 2. Agentprivacy Territory (Mage)

**Domain:** agentprivacy.ai
**Owner:** Soulbae (privacymage.eth)
**Purpose:** Delegation, projection, storytelling

**Contains:**
- Spellbook content
- Persona configurations
- Training ground
- Path page
- Pretext orbs
- User journey state

**Does NOT contain:**
- Signing keys
- Topology enforcement
- Boundary verification
- Cut operations

### 3. Bgin Territory (Third Node)

**Domain:** bgin.ai
**Owner:** Neutral third party
**Purpose:** Trust graph, verification anchor

**Contains:**
- Trust graph plane
- Cross-territory verification
- Neutral attestations
- Dispute resolution anchors

**Does NOT contain:**
- Either party's private state
- Content or enforcement logic
- User data

## Separation Layers

### Layer 1: Process Separation

```
┌─────────────────┐     ┌─────────────────┐
│ Swordsman Proc  │     │   Mage Process  │
│                 │     │                 │
│ PID: separate   │     │ PID: separate   │
│ Memory: isolate │     │ Memory: isolate │
│ Threads: own    │     │ Threads: own    │
└────────┬────────┘     └────────┬────────┘
         │       IPC only        │
         └───────────────────────┘
```

### Layer 2: Storage Separation

```
Swordsman Storage        Mage Storage
├── blades/              ├── spells/
├── topology/            ├── personas/
├── cuts/                ├── journeys/
└── keys/ (encrypted)    └── preferences/

NO SHARED STORAGE
```

### Layer 3: Permission Separation

| Permission | Swordsman | Mage |
|------------|-----------|------|
| Sign transactions | Yes | No |
| Read content | No | Yes |
| Enforce boundaries | Yes | No |
| Project personas | No | Yes |
| Access trust graph | Verify only | Query only |
| Modify topology | Yes | No |
| Modify content | No | Yes |

### Layer 4: Repository Separation

```
github.com/org/spellweb     (Swordsman)
github.com/org/agentprivacy (Mage)
github.com/org/ceremony     (Shared protocol only)
```

No cross-repository dependencies except ceremony protocol.

## Ceremony Channel

### Purpose

The ceremony channel is the ONLY communication path between territories.

### Protocol

```typescript
interface CeremonyMessage {
  type: 'SLASH' | 'WARD' | 'INSCRIBE' | 'SCAN';
  payload: SignedPayload;
  ceremony_id: string;
  timestamp: number;
  territory_origin: 'swordsman' | 'mage';
}
```

### Message Types

**Swordsman → Mage:**
- `SLASH`: Boundary enforced, access revoked
- `WARD`: Protective perimeter established

**Mage → Swordsman:**
- `INSCRIBE`: Request to record understanding
- `SCAN`: Request to verify without modification

### Security Properties

1. **Typed messages:** No arbitrary data exchange
2. **Signed payloads:** Origin verified
3. **Ceremony scoped:** Messages tied to specific ceremonies
4. **Auditable:** All messages logged (but content not exposed)
5. **Atomic:** Ceremonies succeed or fail completely

## Browser Extension Architecture

### Two Extensions, Never One

```
┌─────────────────────────┐    ┌─────────────────────────┐
│ Swordsman Extension     │    │ Mage Extension          │
│ ID: abc123...           │    │ ID: xyz789...           │
│                         │    │                         │
│ Permissions:            │    │ Permissions:            │
│ - webRequest            │    │ - storage               │
│ - cookies               │    │ - tabs                  │
│ - declarativeNetRequest │    │ - activeTab             │
│                         │    │                         │
│ CANNOT: read page text  │    │ CANNOT: block requests  │
└────────────┬────────────┘    └────────────┬────────────┘
             │    chrome.runtime.sendMessage │
             └──────────────────────────────┘
```

### Why Two Extensions?

1. **Permission isolation:** Each extension has minimal required permissions
2. **Audit clarity:** Clear which extension does what
3. **Failure isolation:** One extension failing doesn't compromise the other
4. **Update independence:** Can update separately

## Visual Separation

Even UI must maintain separation:

| Element | Swordsman | Mage |
|---------|-----------|------|
| Primary colour | Steel blue | Warm gold |
| Icon shape | Angular, blade-like | Curved, orb-like |
| Animation | Sharp, decisive | Flowing, smooth |
| Feedback | Binary (blocked/allowed) | Gradient (progress) |

Users should ALWAYS know which territory they're interacting with.

## Mapping to PVM-V5.2

| Territory Concept | PVM Term |
|-------------------|----------|
| Dual territory | Φ_agent separation |
| Ceremony channel | Bounded leakage |
| Bgin third node | h(τ) integrity anchor |
| Process isolation | R_max < 1 enforcement |
| Permission separation | Three-axis Φ |
| Repository separation | Codebase sovereignty |

## Proverb

> "Two kingdoms share a river. Neither owns the water, but both drink. The ceremony is the riverbed."

## Emoji Spell

**⚔️⊥🧙 → 🏰(spellweb)⊥🏰(agentprivacy) → 📡(ceremony) → 🔗(bgin) → △(trinity)**

## Open Problems

1. **Synchronisation:** How to keep territories consistent without shared state?
2. **Failure Modes:** What happens when one territory is down?
3. **Migration:** How to migrate users between territory versions?
4. **Mobile:** How to maintain separation on mobile platforms?
5. **Decentralisation:** Can territories be run by different operators?

---

**Verify:** [spellweb.ai](https://spellweb.ai) · [agentprivacy.ai](https://agentprivacy.ai) · [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs)
