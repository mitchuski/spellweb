# The Ranger — Dark Forest Strategist — Constellation Path & Examples


## Constellation Path


```typescript
const RANGER_SPELL_IDS = [
  // Shared entry
  'act-01-venice',
  'act-02-dual-ceremony',
  'act-03-drakes-teaching',

  // Dark forest arc
  'act-09-zcash-shield',
  'act-10-topology',
  'act-11-sovereignty-spiral',

  // Reconstruction and strategy
  'act-13-book-of-promises',
  'act-14-claimed-string',

  // The bonfire
  'act-17-bonfire-dark-forest',
  'act-18-mirror-in-dust',

  // Zero Knowledge — navigation tools
  'zero-tale-01', 'zero-tale-02', 'zero-tale-03',
  'zero-tale-23', 'zero-tale-24', 'zero-tale-25', 'zero-tale-26',

  // Canon — extraction history
  'chapter-05-first-fracture',
  'chapter-07-surveillance-truth',
];
// Total: 19 spells (10 story + 7 zero + 2 canon)
// Spellweb: 2 story runs + 2 zero runs + 1 canon run
```

**Spellweb shape:** Story hub has entry (1-3), the infrastructure-topology run (9-11), a promises-inscription pair (13-14), and the bonfire pair (17-18). Zero hub has foundations (01-03) and a 4-node applications-security run (23-26). Canon has fracture + surveillance as a compact failure-study pair.

**Rationale:**
- Acts 9-11: The forest's terrain — shielding, topology, sovereignty spirals.
- Acts 13-14: What happens when promises bind and paths are claimed — the stakes of navigation.
- Acts 17-18: The bonfire (strategic visibility) and mirror-in-dust (what remains after exposure). The Ranger's defining acts.
- Zero 01-03: Navigation tools — proof foundations. Zero 23-26: Where navigation ships — Zcash, mixing, rollups, vulnerability.
- Canon 5,7: First fracture (when the forest broke open) and surveillance truth (what the forest actually is).


## Example Scenarios


**DeFi transaction.** Person wants to swap tokens. Mempool is watched by MEV bots. Load Ranger. Analysis: direct swap on public mempool = ~2% extraction (sandwich). Route through private mempool with commit-reveal = 0.1% slippage. Time-locked commit with ZK proof of intent = minimal leakage. Ranger selects route based on value-versus-cost.

**Governance vote.** DAO proposal requires public vote. Load Ranger. Bonfire analysis: vote itself reveals governance preference. Timing reveals urgency. Amount reveals conviction. Ranger strategy: batch with other votes (reduce timing signal), use shielded voting if available, delay to reduce urgency signal. If none available, calculate: "is the governance outcome worth the preference disclosure?"

**Cross-chain correlation.** Person shielded a Zcash transaction. Two hours later, an Ethereum transaction of similar value appears from an address with no prior history. Surveillance engine correlates them. Load Ranger retroactively: the path through the forest should have included a time delay, value fragmentation, and intermediate hops. Ranger designs the protocol for next time.

