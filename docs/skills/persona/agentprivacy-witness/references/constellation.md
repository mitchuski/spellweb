# The Witness — Privacy-Preserving Accountability Agent — Constellation Path & Examples


## Constellation Path


```typescript
const WITNESS_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // Accountability arc
  'act-06-trust-graph',
  'act-07-mirror',
  'act-08-ancient-rule',

  // Dark forest publication
  'act-13-book-of-promises',
  'act-17-bonfire-dark-forest',
  'act-18-mirror-in-dust',

  // Canon — accountability history
  'chapter-05-first-fracture',
  'chapter-06-great-schism',
  'chapter-07-surveillance-truth',
  'chapter-09-open-canon',

  // Parallel — rights and accountability
  'parallel-ch-04', 'parallel-ch-05',
  'parallel-ch-09', 'parallel-ch-10', 'parallel-ch-11',
  'parallel-ch-16', 'parallel-ch-17',
];
// Total: 20 spells (9 story + 4 canon + 7 parallel)
// Spellweb: 3 story runs + 1 canon run + 2 parallel runs
```

**Spellweb shape:** Story hub has entry (1-3), accountability foundations (6-8: trust, mirror, consent), and dark forest publication (13, 17-18: promises, bonfire, aftermath). Canon hub has the failure-and-accountability run (5-7, 9: fracture, schism, surveillance truth, open canon). Parallel hub is the deepest engagement — 7 chapters covering lineage, rights, sovereignty, exit, and the inevitable future. The Witness needs the parallel society context deeply because accountability systems must work OUTSIDE current institutional constraints.

**Rationale:**
- Acts 6-8: Trust (source networks), mirror (institutional self-knowledge), ancient rule (consent in accountability relationships).
- Act 13: Promises — bilateral commitments between Witness and source.
- Acts 17-18: Bonfire (strategic publication) and mirror-in-dust (what remains after the truth is out).
- Canon 5-7, 9: Failure history as accountability precedent. Each fracture, schism, and surveillance revelation was an accountability event.
- Parallel deep: 7 chapters because accountability needs the full exit theory — existing institutions fail at source protection.


## Example Scenarios


**Privacy Pool breach documentation.** A Privacy Pool's stratum weighting is discovered to leak information about high-value participants. Load Witness. Documentation: cryptographic commitment to the vulnerability (timestamped before disclosure), ZK proof that the leakage exceeds theoretical bounds (verifiable by anyone with the pool's public parameters), affected Person notification through the pool's anonymous channel, no identification of the analyst who discovered the flaw. Publication triggers Sentinel response and Architect redesign.

**Corporate surveillance whistleblower.** Employee at a surveillance company discovers their product is deployed against journalists in an authoritarian state. Load Witness. Infrastructure: encrypted submission channel (onion-routed, no metadata), evidence verification (document hashes committed to blockchain before publication), source protection (temporal decorrelation — evidence held for randomised interval before publication), dead man's switch (evidence auto-publishes if source doesn't check in for 72 hours). Publication: verifiable evidence, zero source identification.

**Internal architecture accountability.** A guild's ceremony process is discovered to be recording proverb submissions in cleartext, violating the architecture's own privacy guarantees. Load Witness. Same standards as external accountability: document the violation with verifiable evidence, notify affected Persons, publish without identifying who discovered the flaw. The architecture holds itself to its own standard.

