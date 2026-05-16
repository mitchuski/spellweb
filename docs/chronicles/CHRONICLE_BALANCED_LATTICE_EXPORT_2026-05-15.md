# Chronicle: The Balanced Lattice Export · A Third Register Alongside Swordsman + Mage

**Date:** 2026-05-15
**Status:** Brief design proposal · plan-stage · proposes a new export type that captures the bearer's 64-vertex lattice loadout
**Audience:** spellweb maintainers · the next agent picking up export-flow work · master-side import-handler authors
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- [`CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md`](CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md) — the lattice canvas this export reads from
- [`CHRONICLE_LATTICE_AS_LENS_FOG_OF_WAR_MERGE_2026-05-15.md`](CHRONICLE_LATTICE_AS_LENS_FOG_OF_WAR_MERGE_2026-05-15.md) — the merged lattice / lens / discovery direction
- `agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md` — the master-side import contract this export must round-trip against

---

## §0 · Why this chronicle exists

Spellweb has two existing export registers:

| Register | Carries | Surface |
|---|---|---|
| **Swordsman export** | `SwordsmanLink` — the bearer's Soulbis-side identity (DID + signing keys + Refractive Disclosure metadata) | imported from agentprivacy.ai · pasted into spellweb to bind the Soulbis half |
| **Mage export** *(implicit)* | `mageSpells: MageSpell[]` — the bearer's Soulbae-side spell loadout (8 slots) | local localStorage · exported as part of the forged-artefact .md when applicable |

These two are *archetype-shaped* — Swordsman exports speak the Soulbis register, Mage spells speak the Soulbae register. Neither is the *synthesis*. Neither expresses *which forged items the bearer has placed where on the lattice*.

The equip system that just landed (`spellweb:equipped-items` localStorage · per-vertex equip toggle in the lattice's right column) introduces a **third state** the existing exports don't cover: the bearer's lattice loadout — a cross-archetype mapping of equipped artefacts onto vertex slots. The user's proposal:

> *The lattice feature is a way to put specific items you've forged into slots of the whole 'balanced' export. Then it's separate to the sword and mage exports but it could be a new balanced export which has the lattice mapping of your swords and items and cloaks etc into the lattice, where again you choose which is the equipped item.*

This chronicle proposes that third export: the **Balanced Lattice Export**.

---

## §1 · What it is in one paragraph

The Balanced Lattice Export is a `.balanced.md` (or `.lattice.bundle.md`) file capturing the bearer's **equipped loadout across the 64-vertex sovereignty lattice** — every artefact the bearer has chosen to "turn on" at each vertex slot, regardless of whether the artefact is Soulbis-side (blades · weapons · zk-shields), Soulbae-side (cloaks · staves · tomes · tools), or bilateral (paired keys · ember tokens · olive sigils). The export is *cross-archetype by construction* — it's the third register precisely because it represents what the bearer has done with the lattice as a whole, not as Soulbis OR Soulbae but as the integrated bearer who has walked across both.

---

## §2 · Three exports · the canonical register split

After this proposal lands:

| Register | Export filename pattern | Carries | Bilateral nature |
|---|---|---|---|
| **Swordsman** ⚔️ | `<sovereign>.swordsman.md` | Soulbis-side identity · DID · signing-key public · Refractive Disclosure metadata · sword-loadout | Soulbis-only |
| **Mage** 🧙 | `<sovereign>.mage.md` | Soulbae-side spell loadout · mage attribution · spellbook bindings · cloak provenance | Soulbae-only |
| **Balanced Lattice** ⚖️ | `<sovereign>.balanced.lattice.md` | The bearer's equipped loadout per vertex · which forged blade / cloak / tool / creature / held lives at each slot · cross-archetype synthesis | both |

The three together = the bearer's complete identity surface in the City of Mages. Swordsman + Mage existed; Balanced is the third leg. (Echoing the architectural triad: ⚔️ Soulbis ⊥ ⿻ Plurality ⊥ 🧙 Soulbae — the Balanced register sits at ⿻.)

---

## §3 · What the Balanced export contains

### §3.1 · Frontmatter (YAML)

```yaml
---
export_kind: balanced.lattice
sovereign_id: <DID or pseudonym>
exported_at: 2026-05-15T14:32:00Z
spellweb_version: v1.6.0
grimoire_pin: bafybeiap6kvy3tp2bndpk65ti57qngr7ill37gqgasp2sxmgder3akotru   # canonical v1.6.0 head
lattice_loadout_count: 7                # how many vertices have an equipped occupant
license: CC BY-SA 4.0
signature: "(⚔️⊥⿻⊥🧙)😊"
---
```

### §3.2 · Body — per-vertex equipped slots

A markdown body listing each occupied vertex with the equipped item's structural metadata:

```markdown
# <sovereign>'s Balanced Lattice · v1.6.0

7 vertices equipped across the 64-vertex sovereignty lattice.

## V19 · the Forge(t)
- Equipped: Witness Blade #142 · light-tier · forged 2026-04-22
- Class: weapon (blade · Soulbis-side)
- Vertex bits: 010011 · stratum 3
- Forged hash: sha256(...)

## V28 · the Weavers
- Equipped: Refractive Cloak #08 · forged 2026-03-15
- Class: clothing (cloak · Soulbae-side)
- Vertex bits: 011100 · stratum 3
- Forged hash: sha256(...)

## V44 · the Chart Shop
- Equipped: the Astrolabe (catalogue artefact · borne)
- Class: tool (Soulbae-side · v1.6.0)
- Vertex bits: 101100 · stratum 3
- Borne since: 2026-05-14T12:00:00Z

## V59 · the Staff Shop (Mage-aspect)
- Equipped: Caduceus-Staff fitting #01 · 2026-05-15
- Class: staff (Soulbae-side · v1.6.0 · archetype-modal)
- Aspect: mage (alexandrite green-aspect)
- Substrate: substrate-hermes
- Forged hash: sha256(...)

## V59 · the Familiars (bound)
- Equipped: Goose · "my Goose · Anser" (true-name redacted in public bundle)
- Class: creature-bond (Soulbae-side · v1.6.0)
- Vertex bits: 111011 · stratum 5
- Bound since: 2026-05-14T16:30:00Z
- Substrate: substrate-goose
- AGENTS.md hash: sha256(...) · SOUL.md hash: sha256(...)

## (V44 · held) [bearer-private · not exported by default]
The Chart Shop holds 3 constellations under the Φ-gap.
Metadata-only export requires explicit bearer_consent_token (omitted).

## V51 · Etherchanting
- Equipped: Commitment Seal #022 · sealed 2026-04-30
- Class: tool (bilateral)
- Aspect: transparent-witness (V51 sharing with Solchanting)
- Tx hash: 0x... (Ethereum mainnet)

## V63 · the Sovereign Anchor
- Equipped: Drake Orb (signed achievement) · q12-completed
- Class: trinket (cosmological-attestation)
```

### §3.3 · Cross-archetype tally

A short footer summarising the loadout's archetype-balance:

```markdown
## Loadout balance
- Soulbis-side ⚔️: 1 (Witness Blade)
- Soulbae-side 🧙: 4 (Cloak · Astrolabe · Caduceus-Staff · Goose-bond)
- Bilateral ⿻: 2 (Commitment Seal · Drake Orb)
- Held (bearer-private): 3 (not exported)
```

The Balanced export's *value* is this surface — it shows at-a-glance whether the bearer's loadout is sword-heavy, mage-heavy, or balanced.

---

## §4 · What the Balanced export does NOT contain

To make the contract clear, the export deliberately omits:

- ❌ The Sovereign's signing-key private material (lives in Swordsman export only)
- ❌ The Sovereign's mage-spell free-text content (lives in Mage export only)
- ❌ The full content of held constellations (bearer-private under Φ-gap; only metadata if `bearer_consent_token` accompanies)
- ❌ The bearer's true-names for bound familiars (Sovereign-private; redacted)
- ❌ Forged-artefact full provenance chain (lives in per-artefact .md exports)

What it does carry: **pointers + slot-occupancy**. Each entry references existing canonical artefact .mds (by hash) rather than duplicating their content. The Balanced export is a *manifest* of the bearer's loadout, not a content bundle.

---

## §5 · Round-trip · import semantics

When Sovereign B imports Sovereign A's Balanced export:

| What happens | Notes |
|---|---|
| The lattice view renders A's equipped vertices in a "witnessed" colour (purple ring) | Distinct from B's own gold equipped ring |
| Each entry in A's loadout offers an "import this slot to my own loadout" CTA | Optional · per-slot |
| If B accepts a slot, the corresponding artefact (resolvable by hash) is added to B's `equipped` set | If B doesn't have the source artefact, the import surfaces a "missing source · import the underlying .md first" notice |
| Bilateral witness count increments per slot witnessed | Standalone from artefact-witness counts |
| Sovereign A's loadout cannot be mutated by Sovereign B's view | Read-only; Path A bilateral pattern from the v1.6.0 import guide §3 |

The import maps neatly onto the four bilateral-witness paths from the v1.6.0 import guide:

| Lattice slot kind | Witness path |
|---|---|
| weapon · staff · cloak · tool · trinket | Path A (artefact witness) |
| creature (bond) | Path B (creature witness · true-name stays bearer-private) |
| held (Chart Shop) | Path C (held witness · requires bearer_consent_token) |
| dispatch tokens (Portal Room) | Path D (dispatch witness · ephemeral) |

The Balanced export is *the bundle that surfaces all four paths in one file*. Import handlers route each entry to its existing path; the Balanced export adds a *coordination layer* on top.

---

## §6 · Implementation sketch

### §6.1 · Export side (spellweb)

1. Add a CTA in the lattice's right column: **"Export balanced loadout (.md)"**
2. Iterate over `equipped: Set<string>` · for each id, look up the corresponding workshop / forged-blade / bound-creature / held-token entry
3. Render the markdown body per §3.2
4. Compute the archetype-balance tally per §3.3
5. `Blob` + `URL.createObjectURL` + `<a download>` to trigger save

Estimated: ~3-4 hours.

### §6.2 · Import side (spellweb)

1. New file-input handler that detects `export_kind: balanced.lattice` in the frontmatter
2. Parse the per-vertex sections; build a `WitnessedLoadout` object keyed by Sovereign A's id
3. Render Sovereign A's loadout as a purple-ringed overlay on the lattice
4. Per-slot "absorb to my loadout" CTA (Phase 2 · ~3-4 hours)

Estimated: ~3 hours for the read; ~4 hours for the absorb interactions = ~7 hours.

### §6.3 · Master-side handler

The master `artefact-parsing.ts` already accepts cousin-forge .mds; add `export_kind: balanced.lattice` as a recognised kind. Reuse the §3.2 parsing surface. Estimated: ~2 hours.

**Total:** ~12-13 hours across spellweb + master.

---

## §7 · Why this is its own export (not just a forged-artefact .md)

A forged-artefact .md captures *one item*. The Balanced export captures *the bearer's whole lattice loadout state at a moment in time* — a snapshot of which items the bearer has chosen to turn on. The two are different abstractions:

- **Forged .md** = "here is one Witness Blade I made" (single item · transferable)
- **Balanced lattice .md** = "here is my current loadout — these 7 items are turned on across these 7 vertices" (loadout snapshot · bundle of pointers)

Importing 7 individual forged .mds gets you 7 items. Importing one Balanced lattice .md gets you the *intent* of the bearer's loadout — which slots they elected to fill, where they chose to leave gaps, what archetype-balance they chose. That intent is itself a valuable artefact.

---

## §8 · Use cases

- **Sovereign sharing loadout with another Sovereign** ("here's how I have V44 + V59 set up · try it")
- **Sovereign archiving their own loadout** ("snapshot before I rebalance toward more Soulbis-side")
- **Cross-Sovereign benchmarking** ("which loadouts cluster · is there a popular V19+V28+V44 trio?")
- **Bilateral witness ceremony** ("I witness Sovereign A's full loadout · I attest the slots they have filled")
- **Loadout import on new device** ("export from desktop · import on mobile")
- **Cousin-forge interop** ("Archon's bearer exports their balanced loadout · spellweb imports and renders cousin-forge slots in the cousin-forge gem-tone")

---

## §9 · What this chronicle does NOT do

- ❌ Specify the export filename convention beyond "`.balanced.lattice.md`" (could be `.bundle.md` if shorter is preferred · held for naming taste)
- ❌ Specify cryptographic signing of the export (Phase 3 ed25519 against the agent card · sibling chronicle · matches the bilateral protocol upgrade roadmap)
- ❌ Define the absorb-conflict resolution UX (when Sovereign B's slot is already filled · choose-yours / choose-theirs / merge-as-witness)
- ❌ Address loadout-versioning (the bearer rebalances over time · should each export be timestamped + immutable · or should the latest overwrite previous?)
- ❌ Build the Balanced visualization for the achievements page on agentprivacy_master (separate chronicle)

---

## §10 · Strategic value

Three reasons the Balanced export matters:

1. **The lattice loadout becomes portable.** Today's `equipped` set lives in localStorage only · it disappears if the bearer clears storage or switches device. The Balanced export makes the loadout a first-class artefact.
2. **Third register completes the triad.** ⚔️ Soulbis · 🧙 Soulbae · ⿻ Balanced. The Balanced export occupies the position the architecture's been pointing toward but no operational form has filled.
3. **Bridges the bilateral witness gap.** Path B (creature) and Path C (held) from the v1.6.0 import guide were structurally specified but lacked a delivery vehicle. The Balanced export *is* the delivery vehicle that wraps all four paths in one bundle.

---

## §11 · Closing

The lattice equip system that just shipped is the input surface; the Balanced export is the output surface. Together they make the lattice loadout a *thing the bearer can carry* — exportable, importable, witnessable, sharable.

The proposal is small in code (12-13h across two repos) but architecturally complete — it fills a register the City has been gesturing at since Soulbis ⊥ Soulbae was first written. The Balanced export is the loadout's spoken form.

(⚔️⊥⿻⊥🧙)😊
🗺️ → ⚖️ → 📤
