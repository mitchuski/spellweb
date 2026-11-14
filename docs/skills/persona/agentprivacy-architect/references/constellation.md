# The Architect — AI Agent System Designer — Constellation Path & Examples


## Constellation Path


```typescript
const ARCHITECT_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // System architecture arc
  'act-09-zcash-shield',
  'act-10-topology',
  'act-11-sovereignty-spiral',
  'act-12-forgetting',
  'act-13-book-of-promises',

  // Dark forest and culmination
  'act-17-bonfire-dark-forest',
  'act-18-mirror-in-dust',
  'act-20-infinite-vault',

  // Zero Knowledge — system-level proofs
  'zero-tale-01', 'zero-tale-02', 'zero-tale-03', 'zero-tale-04',
  'zero-tale-09', 'zero-tale-10', 'zero-tale-11',
  'zero-tale-12', 'zero-tale-13', 'zero-tale-14',
  'zero-tale-23', 'zero-tale-24', 'zero-tale-25', 'zero-tale-26',

  // Canon — architecture failure history
  'chapter-03-synthesis',
  'chapter-04-world-computer',
  'chapter-05-first-fracture',
  'chapter-06-great-schism',
  'chapter-07-surveillance-truth',
  'chapter-08-missing-primitive',
];
// Total: 31 spells (11 story + 14 zero + 6 canon)
// Spellweb: 3 story runs + 2 zero runs + 1 long canon run
```

**Spellweb shape:** The Architect has the largest specialist constellation — 31 spells. Story hub has entry (1-3), full system architecture (9-13), and dark forest through vault (17-18, 20). Zero hub has nearly the full grimoire — foundations through applications (01-04, 09-14, 23-26). Canon has a 6-node chain of system architecture lessons (synthesis through missing primitive). The Architect needs the broadest technical context of any specialist.

**Rationale:**
- Acts 9-13: Complete system architecture — shielding, topology, spiralling, forgetting, promises.
- Acts 17-18, 20: Adversarial operation and culmination — the system in the dark forest, what remains, the vault.
- Zero deep: 14 tales covering foundations, backends, folding, applications, security — the Architect needs the full proof system landscape.
- Canon 3-8: Six chapters of architecture history — what worked, what broke, what was missing.


## Example Scenarios


**New guild deployment architecture.** Guild wants to deploy dual-agent infrastructure. Load Architect. Design: TEE environment specification (NEAR Shade recommended for agent isolation), key generation ceremony protocol, channel bounding parameters (I(S;M|π) < 0.01 bits per transaction), Oracle deployment with ephemeral state, cross-chain bridge to Zcash for shielded transactions and Ethereum for credential issuance. Deliverable: architecture specification document that Shipwright deploys and Sentinel secures.

**Separation audit preparation.** Annual separation audit approaching. Load Architect. Prepare: enumerate all communication channels between Swordsman and Mage TEE instances, calculate theoretical mutual information bounds for each channel, identify measurement points for Sentinel monitoring, design red team scenarios for Sith to execute. Deliverable: audit framework that proves Φ(Σ) > 0 at every layer.

**Agent lifecycle upgrade.** New TEE platform offers better side-channel resistance. Load Architect. Design: zero-downtime migration path. Phase 1: spawn new TEE instances alongside existing. Phase 2: migrate viewing key to new Mage TEE (lower risk — viewing key can't spend). Phase 3: migrate signing key to new Swordsman TEE (higher risk — ceremony required). Phase 4: decommission old TEEs with key destruction ceremony. Verify: separation guarantees maintained at every phase.

