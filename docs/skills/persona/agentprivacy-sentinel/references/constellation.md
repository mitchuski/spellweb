# The Sentinel — Infrastructure Security Architect — Constellation Path & Examples


## Constellation Path


```typescript
const SENTINEL_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // Infrastructure journey
  'act-09-zcash-shield',
  'act-10-topology',
  'act-11-sovereignty-spiral',
  'act-12-forgetting',
  'act-13-book-of-promises',

  // Dark forest and reconstruction
  'act-17-bonfire-dark-forest',
  'act-18-mirror-in-dust',

  // Zero Knowledge — infrastructure-relevant tales
  'zero-tale-01', 'zero-tale-02', 'zero-tale-03', 'zero-tale-04',
  'zero-tale-09', 'zero-tale-10', 'zero-tale-11',
  'zero-tale-12', 'zero-tale-13', 'zero-tale-14',

  // Canon — infrastructure failure history
  'chapter-03-synthesis',
  'chapter-05-first-fracture',
  'chapter-06-great-schism',
  'chapter-07-surveillance-truth',
];
// Total: 24 spells (10 story + 10 zero + 4 canon)
// Spellweb: 2 story runs + 1 long zero run + 1 canon run
```

**Spellweb shape:** Story hub has entry (1-3) plus a deep infrastructure run (9-13) covering Zcash shield, topology, sovereignty spiral, forgetting, and promises — the acts where the system's infrastructure is most visible. A separate run for dark forest + mirror-in-dust (17-18). Zero hub has one long contiguous run through foundations and backends (01-04, 09-14) — the proof infrastructure. Canon hub has a 4-node chain through the fracture, schism, and surveillance — the infrastructure failure history.

**Rationale:**
- Acts 9-13: The infrastructure arc. Where the stack becomes visible — shielding, topology, spiralling sovereignty, data forgetting, promise architecture.
- Acts 17-18: Dark forest operations require secure infrastructure to navigate without being priced.
- Zero Foundation + Backends: Deep proof infrastructure — how commitments, folding, and verification work at the implementation level.
- Canon Chapters 3,5,6,7: Synthesis (how it should work), first fracture (how it broke), great schism (how it split), surveillance truth (what happened next). Infrastructure failure case studies.


## Example Scenarios


**TEE compromise indicator.** Attestation freshness for the Soulbis TEE instance drifts from 10-second updates to 45-second updates. Load Sentinel. Analysis: not yet a compromise, but degradation pattern consistent with memory pressure from side-channel attack probing. Action: rotate signing key to fresh TEE instance, quarantine suspect instance for forensic analysis, alert Sith for red-team validation.

**Cross-chain bridge anomaly.** State proof from Ethereum claims a credential was revoked, but Zcash shielded transaction referencing that credential settled 3 blocks ago. Load Sentinel. Investigation: Ethereum reorganisation made the revocation proof valid on the new canonical chain. Action: halt cross-chain credential operations, wait for finality on both chains, re-verify state.

**Agent channel leakage.** Sith red team discovers that timing correlation between Soulbis signing operations and Soulbae viewing key operations leaks 0.3 bits per transaction — enough to violate R_max < 1 over 10,000 transactions. Load Sentinel. Fix: randomised delay injection in channel routing, bringing correlation below measurable threshold. Verify: re-run timing analysis, confirm I(S;M|π) within bounds.

