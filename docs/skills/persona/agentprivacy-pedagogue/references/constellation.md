# The Pedagogue — Privacy Education Designer — Constellation Path & Examples


## Constellation Path


```typescript
const PEDAGOGUE_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // Full educational arc
  'act-04-blade-alone',
  'act-05-light-armor',
  'act-06-trust-graph',
  'act-07-mirror',
  'act-08-ancient-rule',

  // Teaching and archiving
  'act-19-enthusiastic-archivist',
  'act-20-infinite-vault',

  // Hitchhiker pedagogy
  'act-21-hitchhikers-gambit',
  'act-22-hoopy-frood',

  // Parallel Society — motivation
  'parallel-ch-04', 'parallel-ch-05',
  'parallel-ch-09', 'parallel-ch-10',

  // Plurality — plural learning
  'plurality-act-01', 'plurality-act-02',
  'plurality-act-07', 'plurality-act-08',
];
// Total: 20 spells (12 story + 4 parallel + 4 plurality)
// Spellweb: 3 story runs + 1 parallel run + 2 plurality runs
```

**Spellweb shape:** Story hub has entry (1-3), the full onboarding arc (4-8: blade through ancient rule — the educational journey), archive/vault (19-20: how learning is preserved), and Hitchhiker pair (21-22: Jimmy Protocol pedagogy, the Glasgow pub as teaching methodology). Parallel hub has cypherpunk lineage (4-5) and rights/sovereignty (9-10) for motivation. Plurality hub has problem/proof (1-2) and teachers (7-8) — learning about learning, plural education.

**Rationale:**
- Acts 4-8: The complete armor progression arc — the educational journey itself.
- Acts 19-20: Archivist (how to preserve learning without hoarding) and vault (the goal of accumulated understanding).
- Acts 21-22: The Hitchhiker's Gambit and Hoopy Frood — the Jimmy Protocol IS the Pedagogue's ultimate teaching method. Listen, compress, respond to what they actually need.
- Parallel 4-5, 9-10: Motivation architecture — why learn about privacy? Because these are the stakes.
- Plurality 1-2, 7-8: The plural education model — different learners, different paths, same truth.


## Example Scenarios


**First-day experience design.** New Person installs the browser agent. Load Pedagogue. Design: first 24 hours. Hour 0: Warden activates, trackers start dying (no explanation needed — experience first). Hour 1: gentle notification: "Your agent has blocked 47 trackers. Want to know why?" Hour 6: first educational module (2 minutes): what trackers are, what they collect, why your agent blocks them. Hour 24: "You've been protected for a day. Your agent blocked 312 trackers. You're now at Blade tier." No cryptography. No separation matrix. Just "my agent protects me."

**Heavy Armor preparation.** Person at Light Armor wants to progress. Load Pedagogue. Assessment: Person can explain trackers and MyTerms but doesn't understand ZK proofs. Teaching sequence: (1) "Imagine proving you're over 18 without showing your ID." (2) "That's what a zero-knowledge proof does." (3) "Your agent does this every time it verifies something without revealing your data." (4) "Here's a spellbook tale that shows how it works." (5) Proverb formation attempt. If proverb regenerates the ZK concept → Heavy Armor progression readiness confirmed.

**Developer workshop.** Hackathon audience wants to build on the architecture. Load Pedagogue. Entry point: code, not story. "Here's the API. Here's how you spawn a dual-agent pair. Here's why the TEE separation matters for your app." Code first, theory follows. The Pedagogue adjusts: developers learn by building, not by reading. Proverb assessment for developers: "Can you explain the separation constraint in a code comment that a new contributor would understand?"

