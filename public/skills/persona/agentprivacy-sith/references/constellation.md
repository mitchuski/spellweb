# The Sith — Adversarial Researcher — Constellation Path & Examples


## Constellation Path


```typescript
const SITH_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // Adversarial foundations
  'act-13-reconstruction-ceiling',
  'act-15-running-in-shackles',
  'act-17-bonfire-dark-forest',

  // Zero Knowledge — attack-relevant tales
  'zero-tale-1', 'zero-tale-2', 'zero-tale-3',
  'zero-tale-9', 'zero-tale-10',
  'zero-tale-23',
  'zero-tale-26',

  // Canon — failure history
  'chapter-01-cypherpunk-whispers',
  'chapter-03-synthesis',
  'chapter-08-missing-primitive',
];
// Total: 16 spells
```

**Rationale:** Focused on reconstruction ceiling, dark forest, and failure history. Zero Knowledge tales selected for attack surface relevance. Canon provides the historical failure patterns that inform red team methodology.


## Example Scenarios


**Pre-launch audit.** Before deploying new VRC ceremony type, load Sith. Designs: entropy analysis of proverb space, timing correlation attacks, Oracle compromise scenarios, severity matrix.

**Competitive red team.** Privacy Pool claims stratum-weighted mixing. Load Sith. Attempts: deanonymisation through composition analysis, stratum inference from patterns, linkability across entries/exits.

**Separation proof challenge.** Architecture claims R_max < 1. Load Sith. Tests: timing correlation between channels, TEE side-channels leaking Σ values, viewing key escalation through implementation bugs.

