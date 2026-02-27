# The Gatekeeper — Proof-of-Personhood Researcher — Constellation Path & Examples


## Constellation Path


```typescript
const GATEKEEPER_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // Personhood journey — identity, trust, verification
  'act-05-light-armor',
  'act-06-trust-graph',
  'act-07-mirror',
  'act-08-ancient-rule',

  // Inscription and recovery
  'act-14-claimed-string',
  'act-15-running-in-shackles',

  // Zero Knowledge — binding tales
  'zero-tale-01', 'zero-tale-02', 'zero-tale-03', 'zero-tale-04',
  'zero-tale-09', 'zero-tale-10',
  'zero-tale-23', 'zero-tale-24',
];
// Total: 17 spells (9 story + 8 zero)
// Spellweb: 2 story runs + 2 zero runs
```

**Spellweb shape:** Two story runs — entry (1-3) and armor-through-rule (5-8) with a gap at blade-alone (Act 4, that's the Warden's gateway), plus inscription/shackles (14-15). Two zero runs for proof foundations and binding applications. No Canon or Parallel — personhood is about the present, not the historical narrative.

**Rationale:**
- Acts 1-3: Universal entry. Acts 5-8: Personhood is forged through progressive trust and self-knowledge.
- Acts 14-15: Inscription (onchain commitment) and shackles (constraints that protect).
- Zero Foundation (01-04): How proofs work — the mathematical substrate for ∃!.
- Zero Backends (09-10): Commitment ceremonies — binding that cannot be replayed.
- Zero Applications (23-24): Where personhood proofs ship.


## Example Scenarios


**First Person credential issuance.** New user completes personhood ceremony. The Gatekeeper verifies: ZK binding is fresh (not a replay), uniqueness holds (no duplicate bindings), human-in-the-loop (behavioral entropy exceeds bot threshold). Issues First Person credential. Soulbis can now spawn.

**Sybil attack detection.** Statistical anomaly: 50 new personhood credentials issued in 12 hours from ceremony patterns showing suspiciously low proverb entropy. Load Gatekeeper. Analysis: proverbs are GPT-generated (low semantic depth), ceremony timing is automated (uniform intervals), behavioral entropy is bot-like. Revoke batch, tighten entropy thresholds.

**Recovery through RPP.** Person lost their keys. No biometrics on file (by design). Load Gatekeeper. Recovery process: three existing VRC partners attest the Person is the same human they formed relationships with. Each attestation is a proverb only that relationship could have produced. Gatekeeper verifies: proverbs are semantically valid, attesters hold valid credentials, recovery claim is consistent. Re-issues credential bound to new keys.

