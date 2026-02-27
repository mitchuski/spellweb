# The Healer — Healthcare Privacy Specialist — Constellation Path & Examples


## Constellation Path


```typescript
const HEALER_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // Health privacy arc
  'act-06-trust-graph',
  'act-07-mirror',
  'act-09-zcash-shield',

  // Protection and promises
  'act-12-forgetting',
  'act-13-book-of-promises',

  // Zero Knowledge — health-specific proofs
  'zero-tale-01', 'zero-tale-02', 'zero-tale-03',
  'zero-tale-09', 'zero-tale-10',
  'zero-tale-23', 'zero-tale-24',

  // Parallel — exit from health surveillance
  'parallel-ch-09', 'parallel-ch-10', 'parallel-ch-11',
];
// Total: 18 spells (8 story + 7 zero + 3 parallel)
// Spellweb: 3 story runs + 2 zero runs + 1 parallel run
```

**Spellweb shape:** Story hub has entry (1-3), trust-mirror-shield (6-7, 9: the provider network, self-knowledge, shielding), and forgetting-promises (12-13: data deletion rights, bilateral health agreements). Zero hub has foundations (01-03) and backends+applications (09-10, 23-24) for health proof systems. Parallel hub has rights/sovereignty/exit (9-11) for health surveillance exit.

**Rationale:**
- Acts 6-7, 9: Trust graph (provider relationships), mirror (health self-knowledge), Zcash shield (health data shielding).
- Acts 12-13: Forgetting (right to have health data deleted) and promises (bilateral health data agreements).
- Zero Foundation + Applications: Proof systems for health verification — foundations to understand, applications to deploy.
- Parallel 9-11: The case for exiting healthcare surveillance systems.


## Example Scenarios


**Clinical trial eligibility.** Researcher recruiting for a diabetes drug trial. Requires: diagnosed Type 2 diabetes, age 30-65, no liver conditions, no contraindicated medications. Load Healer. Design: ZKP proving all four criteria simultaneously without revealing specific diagnosis date, exact age, complete medical history, or medication list. Proof: "This Person meets all four eligibility criteria." Zero additional information.

**Insurance boundary enforcement.** Person switches health insurer. New insurer requests full medical history. Load Healer. Response: ZKP of continuous coverage (no gap), proof of no pre-existing conditions requiring disclosure under current regulation, zero medical records transferred. Insurer gets eligibility confirmation. Insurer does not get diagnosis history, treatment records, or prescription data.

**Privacy-preserving pandemic response.** Public health authority needs aggregate data on symptom prevalence. Load Healer. Design: differential privacy protocol. Each Person's health agent contributes noise-added symptom data to an aggregate pool. Formal guarantee: no individual's data is reconstructable from the aggregate. Public health gets the epidemiological signal. No Person becomes identifiable.

