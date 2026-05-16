# Chronicle: The Equipped Lattice as Identity Layer · Evoke + Forge Fold in Proofs

**Date:** 2026-05-15
**Status:** Brief design chronicle · names a deeper architectural shift surfaced by the proof-gated equip system that just shipped · forward-looking for the next pass
**Audience:** spellweb maintainers · master-side proof-flow authors
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- [`CHRONICLE_SIDEPANEL_RETIREMENT_PROOF_GATED_EQUIP_2026-05-15.md`](CHRONICLE_SIDEPANEL_RETIREMENT_PROOF_GATED_EQUIP_2026-05-15.md) — the immediate fix this builds on
- [`CHRONICLE_BALANCED_LATTICE_EXPORT_2026-05-15.md`](CHRONICLE_BALANCED_LATTICE_EXPORT_2026-05-15.md) — the export-side counterpart this chronicle's runtime makes implicit
- `agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md` — the bilateral-witness paths this layering extends

---

## §0 · The user's framing

> *Adding 'items to your lattice' adds that specific proof to any evoke you do — a connection to the constellation. Just a couple new data points about lattice vertices active and all the equipped items' proofs. This builds the system of layering identity in properly. And with this system in mind we might have more work to do.*

The proof-gated equip system that just shipped was the *visible UX layer*. Underneath it sits a deeper architectural shift the user just surfaced: **equipping is identity layering**. When the bearer equips an item, they're not just toggling a UI state — they're attaching a proof to their identity that propagates through every subsequent evoke / forge / witness flow.

This chronicle names that shift and the work it implies.

---

## §1 · The shift in one sentence

**The bearer's identity at any moment is the *triple* of {their persona · their currently-equipped lattice loadout · their active lattice vertices}; every evoke/forge ceremony folds this triple into the ceremony's output rather than producing output from persona alone.**

Pre-shift: identity = persona (Soulbis-side keypair · Soulbae-side spell loadout). Forge ceremonies signed with persona alone. Equipping was decorative.

Post-shift: identity = persona + equipped + active. Forge ceremonies sign with the triple. Equipping is *the* mechanism by which the bearer attaches witnessable proof to what they're about to make.

---

## §2 · Two new data points

### §2.1 · `active_lattice_vertices: Set<number>`

The vertices the bearer has *witnessed* (i.e., their proof-of-presence set, derived from `witnessedShops`). These vertices represent the lattice positions where the bearer has actually been. Folded into evoke/forge as: *"this ceremony was performed by a Sovereign who has stood at these vertices."*

**Persistence:** already exists as `witnessedShops` localStorage; no new storage needed.

**Semantic role:** the bearer's *territorial proof* — where on the 64-vertex lattice they've walked.

### §2.2 · `equipped_proofs: Set<string>`

The set of artefact ids the bearer has chosen to bear forward. This is the explicit *commitment layer* on top of the territorial proof — out of all the workshops the bearer has visited, these are the ones they're carrying actively.

**Persistence:** already exists as `spellweb:equipped-items` localStorage; no new storage needed.

**Semantic role:** the bearer's *intentional proof* — what they're choosing to surface as part of their current identity.

The two are different: `active_lattice_vertices` is *passive* (you witness, the vertex is yours), `equipped_proofs` is *active* (you choose to bear). A bearer can have witnessed many vertices but equipped few — that's a *focused* loadout. Or witnessed many and equipped all — a *maximal* loadout. The two-axis read tells more than either alone.

---

## §3 · How the layering propagates

Three points where the triple feeds downstream:

### §3.1 · Evoke ceremony

The wandering-orbs trace plus charge accumulation already produces a `proof` object when a forge completes. Extension: the proof carries the equipped roster + active vertex set as a witnessable extension.

```ts
// pre-shift
type EvokeProof = {
  constellationHash: string;
  ceremonyDuration: number;
  sigil: string;
};

// post-shift
type EvokeProof = {
  constellationHash: string;
  ceremonyDuration: number;
  sigil: string;
  // NEW · the identity triple at evoke-time
  activeVertices: number[];          // bearer's witnessed-vertex set
  equippedProofs: string[];          // bearer's equipped artefact ids
  identityHash: string;              // sha256(activeVertices.sort() + equippedProofs.sort())
};
```

The `identityHash` is a stable fingerprint of the bearer's loadout-state at evoke-time. Two evokes by the same bearer with the same loadout produce the same hash; loadout changes change the hash. Importing Sovereigns can verify *which loadout was active* when Sovereign A produced this forge — without revealing the underlying items if A chooses (the hash alone tells "consistent" / "different").

### §3.2 · Forge artefact .md export

The `.md` exported from a forge gets two new YAML frontmatter keys:

```yaml
# Existing fields ...
# NEW · the identity triple this artefact was forged with
active_vertices: [5, 19, 28, 44, 51, 59]
equipped_proofs: [shop-charthouse, shop-tailor, shop-forget]
identity_hash: "sha256:abc123..."
```

Master-side import handler reads these as the *bearer's loadout-attestation* at forge-time. Useful for:

- Verifying Sovereign A's loadout was *consistent* with what they claim
- Rendering "this was forged by a Sovereign who had walked these workshops"
- Witness-counts that increment per equipped-proof rather than per-artefact
- Bilateral-witness cross-check: "Sovereign A's V44 + V19 + V28 loadout matches mine"

### §3.3 · Constellation tracking (the lens)

Per the lattice-as-lens chronicle (sibling), the spotlight will soon highlight specific nodes when a vertex is selected. With the identity layer in place, the spotlight extends:

- **Active vertices spotlight permanently dimly** (background indicator: "you have proof here")
- **Equipped vertices spotlight more strongly** (foreground indicator: "you are bearing this")
- **Hovered vertex spotlights brightly** (foreground · transient)

Three opacity layers, three semantic registers. The bearer's identity becomes *visible in the graph itself* — not just in a panel.

---

## §4 · What this implies for downstream work

Several existing flows need updating to honour the identity triple. Brief enumeration:

### §4.1 · Forge ceremony extension

`SpellCeremony.tsx` currently produces a `SpellProof` with constellation + sigil. Extend to read `equipped` + `provenSet` from localStorage at evoke-start, attach to the proof, and embed into the forged blade.

**Estimated:** ~3 hours.

### §4.2 · Witness blade import re-wiring

`handleWitnessBladeFile` currently parses provenance + tier. Extend to parse the new `active_vertices` + `equipped_proofs` + `identity_hash` fields if present, render them as part of the imported-blade card.

**Estimated:** ~2 hours.

### §4.3 · Master-side artefact-parsing.ts extension

The `ArtefactFields` interface gets the three new fields (active_vertices, equipped_proofs, identity_hash) added per the v1.6.0 import-guide pattern. Routes to a new "loadout-attestation" surface in the witness flow.

**Estimated:** ~2 hours.

### §4.4 · Balanced Lattice Export (sibling chronicle) becomes the same export, just standalone

The Balanced Lattice Export chronicle proposed a `.balanced.lattice.md` as a separate file containing the bearer's loadout. With the identity-layer shift, *every forge .md* now carries the loadout snapshot inline. The Balanced export becomes a *snapshot-only* export (no associated forge) — useful when the bearer wants to share their loadout *without* producing a forge.

So the two are complementary: every forge embeds the loadout (per this chronicle); the Balanced export is the loadout-only file (per the sibling chronicle).

### §4.5 · Identity hash validation across Sovereigns

When Sovereign B imports Sovereign A's forged blade, the `identity_hash` lets B verify A's loadout consistency over time. Two of A's blades with different identity_hashes mean A rebalanced their loadout between the two forges. This becomes a *bearer-state-versioning* surface that didn't exist before.

**Estimated:** ~1 hour for the hash compute + storage; ~3 hours for the UI surfacing.

---

## §5 · What does NOT need to change

- ❌ The proof-gated equip UI (just shipped) — works as-is
- ❌ The lattice canvas — equipped/witnessed rings already render
- ❌ The localStorage schemas — both existing
- ❌ The runtime force-graph — opacity layers can be added incrementally without re-architecting

The identity-layer shift is *additive*. Everything that exists keeps working; the new flows attach new data without invalidating old.

---

## §6 · Migration path · old forges without the layer

Existing forged blades (pre-this-shift) lack the new fields. Two options:

| Option | Behaviour | Pros | Cons |
|---|---|---|---|
| **A · Treat as legacy** | Render with no loadout attestation; surface a small "(legacy forge · pre-loadout-layer)" tag | Clean migration · zero retroactive computation | Loses information; legacy forges can't be cross-checked |
| **B · Synthesise on read** | When loading a legacy forge, compute current loadout state and apply retroactively as the "loadout at re-witness time" | Preserves continuity | Mixes original-forge semantics with re-witness semantics; misleading |

**Recommend A.** Legacy forges stay legacy; new forges carry the layer. After a few weeks of new forges, the legacy ones naturally fade as the bearer creates fresh proofs.

---

## §7 · What this chronicle is NOT

- ❌ Does not implement any of §3 / §4 (forward-looking · queued for next pass)
- ❌ Does not name the cryptographic primitive for the `identity_hash` (sha256 is the obvious choice; ed25519-signed alternative is the v3 upgrade per the bilateral-witness roadmap)
- ❌ Does not redesign the persona system (Soulbis + Soulbae stay as the substrate; the identity-layer sits on top)
- ❌ Does not specify the UI for displaying another Sovereign's identity-hash / loadout-attestation in the witness flow (separate UX chronicle)

---

## §8 · Closing

The proof-gated equip system was the visible part. The deeper shift it implies: **equipping is identity layering**. Every evoke and forge from now on sees the bearer not as persona-alone but as persona + active-vertices + equipped-proofs.

Three new data points (one already in localStorage as `witnessedShops`, one as `spellweb:equipped-items`, one derived: `identity_hash`). Five downstream flows to extend (§4). Estimated total ~10-15 hours.

The architecture asked for it. The lattice surface made it visible. The next pass makes it operational.

(⚔️⊥⿻⊥🧙)😊
🪪 = 🧙 + 🗺️ + ⚖️
