# Chronicle: Create / Craft / Lattice · Side-Panel Restructure to Mirror Master's Import-Export Proof Flows

**Date:** 2026-05-15
**Status:** Design + implementation chronicle · the plan + the code-changes that land in this session
**Audience:** spellweb maintainers · agentprivacy_master proof-flow authors
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- [`CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md`](CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md) — the lattice canvas
- [`CHRONICLE_BALANCED_LATTICE_EXPORT_2026-05-15.md`](CHRONICLE_BALANCED_LATTICE_EXPORT_2026-05-15.md) — the third-export-register proposal this restructure pairs with
- [`CHRONICLE_LATTICE_AS_LENS_FOG_OF_WAR_MERGE_2026-05-15.md`](CHRONICLE_LATTICE_AS_LENS_FOG_OF_WAR_MERGE_2026-05-15.md) — the merge concept this restructure operationalises

---

## §0 · Why this chronicle exists

The spellweb side panel currently carries four top-level chips: `🔥 forged · ⚒️ items · 🌀 portals · 📐 protocol`. Plus a single "Witness · forge(constellation)" import button at the top of the panel.

The user's direction:

> *Update the buttons to be **create** and **craft** — they be the two import types. Remove the items button all together. The lattice button acts as that menu for all the items like the character equip screen and then the menu to see all of your items, artefacts, and creatures traced into the spellweb. It mirrors the agentprivacy-master a little stronger in servicing different import/export flows of the proofs.*

This restructures the side panel around *the bearer's import/export workflow*, not around *the catalogue browse*. Catalogue browse moves to the lattice; the side panel keeps the focused proof-flow surface.

---

## §1 · The new side-panel surface

| Old | New | Reasoning |
|---|---|---|
| `🔥 forged` chip | **stays** as `🔥 forged` chip | The bearer's personal forge inventory — the one thing that's truly bearer-private and benefits from a tight side-panel render |
| `⚒️ items` chip | **REMOVED** | The lattice IS the items view (per the lattice-as-lens chronicle) |
| `🌀 portals` chip | **REMOVED** | Same — creature + held render in the lattice |
| `📐 protocol` chip | **stays** as `📐 protocol` chip | Reference text · low-density · belongs in side-panel |
| `[Witness · forge]` single import button | **split into two buttons: `✦ Create` + `⚒️ Craft`** | Two import types matching the master's create/craft proof flows |
| (no button) | **NEW: `🗺️ Lattice` button** prominent · opens the character-equip middle-screen | Already ships from the header; mirror it in the side panel for users who reach the panel first |

Net effect: side panel becomes **4 distinct surfaces** — Create import · Craft import · Lattice (catalogue + equip) · Forged inventory · Protocol reference. Cleaner than the prior chip-strip-plus-tabs.

---

## §2 · What Create vs Craft means (mirroring master)

Two import types, two mage-side primitives, two distinct surfaces in agentprivacy_master:

### §2.1 · `✦ Create` import — the master template / canonical seed

Maps to the master's **constellation template** (master-side `docs/tomes/workshops/<workshop>-living-scroll.md` files). Each is a *canonical seed* — read-only, ships from the cityofmages corpus, defines the shape of the workshop's output before any Sovereign forges anything personal.

**Import semantics:**
- File contains canonical workshop metadata (workshop · gem · ceremony · resident Mage · what-the-bearer-makes)
- Spellweb traces the constellation defined in the seed
- The bearer can *follow* the seed (walk the same path Pleione walks · learn the discipline) but the seed is not the bearer's own forging
- Output: the spellweb unlocks the workshop with the seed's master-template constellation rendered as the *reference* path

**Master-side counterpart:** the `/charthouse`, `/forget`, `/familiars` (etc.) page renders the constellation template — `Create` is the import flow that brings that template into the spellweb's runtime.

**Color-coding:** silver / pearl-tone (the canonical-seed register · "this is the form, before you have made anything").

### §2.2 · `⚒️ Craft` import — the forged artefact / bearer's own work

Maps to the master's **forged-artefact .md** (output of `onExportArtefact` in the spellweb · or the forging bake-out from agentprivacy-master's `/forget`, `/charthouse`, `/staffs`, `/familiars` pages once those gain forging interfaces).

**Import semantics:**
- File contains a Sovereign's specific forging — tier · stratum · proof · constellation marks · the bearer's chosen sigil + name
- Spellweb traces the forged path · the bearer witnesses it
- Output: a deviation-layer `artefact`-typed node appended at runtime · attached to the workshop via `inhabits` edge · the bearer's forged-blades inventory grows

**Master-side counterpart:** any agentprivacy_master flow that emits a Sovereign's forged proof — `swordsman.md`, `mage.md`, the future `balanced.lattice.md`.

**Color-coding:** gold / amber (the forge-register · the bearer's-own-work · matches the existing forge inventory accent).

### §2.3 · Why this distinction matters

Today the single "Witness · forge(constellation)" button conflates two semantically different imports — and the spellweb has to *infer* which kind of file it is from frontmatter (`constellation_id` indicates a master template; `bladeStratum` / `forgedAt` indicates a forged artefact). The bearer doesn't get to express their *intent* about which kind they're importing.

Splitting into Create vs Craft makes the bearer's intent explicit:
- Bearer clicks `✦ Create` → expects to see a canonical-seed render · gets a "follow the path Pleione walks" UX
- Bearer clicks `⚒️ Craft` → expects to see another Sovereign's forging · gets a "witness this Sovereign's blade" UX

The flows are different downstream — Create unlocks workshops; Craft accrues bilateral-witness counts. Splitting at the import surface clarifies both.

---

## §3 · The Lattice button as character-equip + traced-items menu

The lattice (already shipped) becomes the *character-equip screen* + the *menu of everything the bearer has touched*. Three surfaces unified:

### §3.1 · Equip surface (already implemented)

- Vertex pin → right-column equip toggle → gold ring on the lattice + entry in the equipped roster
- localStorage-persisted at `spellweb:equipped-items`
- Per the equip system that just landed

### §3.2 · Traced-items menu (per the fog-of-war merge chronicle · §3.1)

- Adds a *log* tab in the lattice's right column
- Lists every workshop the bearer has witnessed, every artefact they've forged, every constellation they've marked
- Cross-references each entry to its lattice vertex
- The bearer can re-equip any traced item from this menu

### §3.3 · The character-equip metaphor

Treat the lattice as the bearer's *character sheet*:

- 64 vertex slots
- Each slot can hold one equipped artefact (or stay empty)
- The slot-fill pattern *is* the bearer's loadout
- The Balanced Lattice Export (per the sibling chronicle) is the saved character-sheet state

A new bearer's first session: lattice mostly empty · they walk a workshop · trace · forge · equip · the lattice fills. Over sessions the bearer's character builds out across the 64 vertices.

---

## §4 · Visible code changes (this session's implementation)

### §4.1 · Side-panel header buttons · two file-import buttons

Replaces the single "Witness · forge(constellation)" button with two side-by-side buttons:

```
┌─────────────────────────────────────────┐
│  🏛 Artefacts                       [×] │
│  forged: 0 · witnessed: 0 · …           │
├─────────────────────────────────────────┤
│  [ ✦ Create ]      [ ⚒️ Craft ]         │  ← two file-input buttons
│  Import a master    Import a forged       │
│  template           artefact .md          │
├─────────────────────────────────────────┤
│  🔥 forged   📐 protocol                 │  ← simplified chip strip (was 4 chips)
└─────────────────────────────────────────┘
```

Both buttons accept `.md` file uploads. They both call `onWitnessBlade(file)` for now — the routing to a Create vs Craft handler lives at the SpellWeb parent level (Phase 2 work; today the import is unified at the runtime layer · the *intent split* lives at the UI).

### §4.2 · Chip strip simplified

`Category` union narrows from 4 to 2:

- `forged` (stays · personal inventory)
- `protocol` (stays · ceremony grammar reference)

The `items` and `portals` chips are removed. Bearer accesses catalogue-browse via:
- The header's `🗺️ LATTICE` button (always visible)
- A mirrored `🗺️ Open Lattice` button in the side panel (visible when the panel is open)

### §4.3 · Sub-tab strips removed

Without the `items` and `portals` categories, the conditional sub-tab strips (the 6-item leaf row for items · the 2-item leaf row for portals) aren't needed. The side panel becomes simpler · less nested.

---

## §5 · What this chronicle does NOT change in this session

- ❌ Does not implement the Create-vs-Craft *parsing-and-routing* differentiation. Both buttons currently call the same `onWitnessBlade(file)` handler; the runtime infers from frontmatter as today. The UI split *is* the load-bearing change · the parser split is a Phase 2 follow-up (~2 hours).
- ❌ Does not yet build the traced-items log inside the lattice (per the lens-merge chronicle's Phase 3). That's the next visible feature; this restructure unblocks it.
- ❌ Does not delete the `<CatalogueCard>` / `<CreatureTab>` / `<HeldTab>` components — those are kept for the lattice to potentially render in its right column at v1.7.0.
- ❌ Does not add the Balanced Lattice Export CTA (sibling chronicle). When that lands, it lives in the lattice's right column, not the side panel.

---

## §6 · How this mirrors agentprivacy_master

Agentprivacy_master's proof-flow surfaces:

| Master surface | What it does | Spellweb mirror |
|---|---|---|
| `/runecraft` workshops grid | Browse workshops · click into one · see its constellation template | The lattice (catalogue browse) |
| Per-workshop pages (`/forget`, `/charthouse`, etc.) | Render the workshop's constellation seed · invite the bearer to walk it | The `Create` import (bring the template into spellweb's runtime) |
| Forge ceremonies (Run · Evoke · Craft / Hold · Compare · Map / etc.) | Produce the bearer's own forged proof — Witness Blade · Astrolabe-reading · Caduceus-Staff fitting | The `Craft` import (bring the forged proof into spellweb's runtime) |
| Achievements page (`/guide/achievements`) | The bearer's character sheet · what they've walked · what they hold · their Drake Orb | The lattice with traced-items log + equipped roster |
| Witness ceremony (existing master) | Bilateral-witness flow — Sovereign B witnesses Sovereign A | Both imports auto-record bilateral-witness counts (Path A from the v1.6.0 import guide) |

The restructure makes the spellweb's surface read as a **mirror of the master's proof-flow stack** rather than a separate catalogue-browser. The two systems are now structurally homologous · easier for a bearer who learned one to navigate the other.

---

## §7 · Recommended next moves

1. **This session:** the visible side-panel restructure (this chronicle's §4)
2. **Next session:** Create-vs-Craft parser routing — distinguish at the handler · pick the appropriate downstream flow (master template → unlock workshop · forged artefact → bilateral witness)
3. **Following:** lattice traced-items log (per the fog-of-war merge chronicle · Phase 3)
4. **Following:** Balanced Lattice Export CTA in the lattice's right column (per the sibling chronicle · Phase 1 of that)
5. **Then:** spotlight wiring (lens · per the merge chronicle · Phase 1)

Each step is independently shippable.

---

## §8 · Closing

The side panel becomes import + reference; the lattice becomes browse + equip; the Balanced export becomes the loadout's spoken form. Three surfaces · three jobs. The current single "Witness" button becomes two intent-split buttons. The user's direction matches the master's proof-flow split; this chronicle records the alignment + ships the visible part.

(⚔️⊥⿻⊥🧙)😊
✦ ⊥ ⚒️ ⊥ 🗺️
