# Chronicle: Lattice-as-Lens · Fog-of-War Retrospective · Merging Discovery + Items + Spotlight Into One Concept

**Date:** 2026-05-15
**Status:** Brief design note · plan-stage · captures (1) where the fog-of-war concept landed and (2) the next direction to merge fog-of-war's "discovery" register with the new lattice-items view, turning the lattice into a *lens* over the spellweb graph
**Audience:** spellweb maintainers · the next agent picking up the lattice-spotlight integration
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- [`CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md`](CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md) — the lattice-items design that just shipped (Phases 1–5)
- [`CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md`](CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md) — the verify-and-polish punch list this expansion sits adjacent to
- Memory: `project_spellweb_artefact_layer.md` — the 2026-05-11/12 fog-of-war retirement note

---

## §0 · Why this chronicle exists

The lattice-items overlay shipped (top-level header trigger + 64-vertex Pascal's-row render + hover info + identity-slots + equip toggle + persisted loadout). The user's next direction is twofold:

1. **Items menu and lattice are meant to be one.** The two-level Items/Portals tabs in the side panel currently *trigger* the lattice but the side panel still carries duplicate render code. They should merge — the lattice IS the items menu.
2. **The lattice can act as a *lens* over the main spellweb graph.** Selecting a vertex / artefact / class on the lattice should highlight the corresponding nodes back in the force-graph view (drawing edges, orb pulses, spotlight halo). This is the *spotlight* register.

Item (2) overlaps with an earlier-retired concept: **fog-of-war**. This chronicle captures where fog-of-war landed, why it was retired, and how its *discovery* register can resurface — not as visibility gating, but as a **traced-items menu** that records what the bearer has walked through and lets them assign / spotlight any of those items back onto the graph.

---

## §1 · Fog-of-war · where we got

### §1.1 · What it was

A 2026-04 / 2026-05 spellweb feature. Each `SpellwebNode` could carry a `hiddenUntilWitness?: string` field naming a workshop id (e.g. `"shop-tailor"`). Nodes carrying that field rendered at ~18% opacity ("fogged silhouette") until the bearer's `witnessedShops[<id>]` was set — i.e. until the bearer had walked the corresponding workshop's constellation ceremony. After witnessing, the node became fully opaque.

The mechanic gated *cast members* and some *secret lore* nodes behind workshop-walks. The intent: discovery should feel earned; the universe should reveal itself as the bearer participated.

### §1.2 · Why it was retired

Per the 2026-05-11/12 architectural shift recorded in memory at `project_spellweb_artefact_layer.md`:

> *Canonical NODES list never mutates ... The fog-of-war on cast members is **retired** — the universe stays fully visible.*

The reasoning:

- **Discoverability cost.** Fogged silhouettes confused new bearers — they couldn't tell whether a faint node was "still loading" or "intentionally hidden." Hidden-until-action mechanics rely on the player understanding the contract; a knowledge-graph viewer doesn't communicate that contract well.
- **Canon-first principle.** The City of Mages canon should be visible canonically — a Sovereign reading the graph for the first time should see the full architecture, not a partial one. Withholding the cast from the architecture was at odds with the *visibility, not gatekeeping* discipline the corpus prefers (cf. Hermaion ⚚'s Registry-Keeper register: *"the bestiary is constitutionally open · admission is visibility, not gatekeeping"*).
- **Narrative substitute.** The deviation-layer pattern (forged artefacts appended at runtime as `artefact`-typed nodes) gave bearers a *personal* layer they could grow without needing the canonical layer to hide. Discovery happens in *what the bearer adds*, not in *what the canon withholds*.

### §1.3 · What survived

- **The `hiddenUntilWitness` field** is still in `SpellwebNode` (`src/types/graph.ts` line ~271) — preserved as an opt-in for future *optional secret-lore* nodes that genuinely should hide (e.g. an Easter-egg cast member from a future tome). No current node uses it.
- **The runtime fog-check** lives in `SpellWeb.tsx` (lines 909, 928, 1104) — kept for back-compat with the field. Ready to render fogged silhouettes if a future node sets `hiddenUntilWitness`.
- **The `witnessedShops` localStorage state** is still tracked — it powers the achievements page, the runecraft footer, and would still gate any future fogged node.

The infrastructure is dormant, not removed. A future feature can use it; the current canon does not.

---

## §2 · The merged concept · the lattice as a lens + the traced-items menu

The user's directive:

> *Items are mapped into the lattice and you then get a menu of all of the blades forged and items and creatures in a list you have traced, and may assign them drawing a highlighted edge shape with orbs around the nodes.*

This unifies four threads into one concept:

| Thread | Status pre-merge | After merge |
|---|---|---|
| Items menu (side panel) | Two-level nav with `forged · items · portals · protocol` chips | Items menu is the lattice (the side panel keeps `🔥 forged · 📐 protocol` only) |
| Lattice items view | Middle-screen 64-vertex catalogue · equip/unequip per artefact | Same · plus *traced-items log* + *spotlight back to spellweb* |
| Fog-of-war (retired) | `hiddenUntilWitness` infrastructure dormant | Re-purpose the *traced* register: not visibility-gating, but a *log of what the bearer has walked* surfaced as an active loadout |
| Spellweb force-graph render | Constellation marks · evocation orbs | Lattice-vertex selection sends a *spotlight* event: the corresponding nodes highlight, edges glow, orbs orbit |

The merged concept in one sentence: **"The lattice is the loadout; selecting a slot on the lattice spotlights its corresponding nodes back in the force-graph; the bearer traces things to add them to a personal log; the log is the loadout the lattice displays."**

---

## §3 · Three operational pieces

### §3.1 · The traced-items log (where fog-of-war's spirit returns)

Replaces fog-of-war's *visibility gating* with a *bearer-log* that runs in parallel to the always-visible canon.

- **`tracedItems: Set<nodeId>`** — every node the bearer has interacted with in a load-bearing way (witnessed a shop · forged an artefact at it · marked it in a constellation · imported a master template · unlocked via the achievements path)
- **Persistence:** localStorage at `spellweb:traced-items` (mirrors `spellweb:witnessed-shops` shape · per-node not per-shop)
- **Surface:** the lattice's left column gains a small "you have traced N items here" line per vertex; the right column adds a "log" tab listing every traced item chronologically

This is the *menu of all blades forged and items and creatures you have traced* the user named. It's additive (canonical universe stays visible · the log is the bearer's overlay).

### §3.2 · The lens / spotlight · vertex selection drives spellweb highlight

Selecting a vertex (or pinning an artefact) in the lattice should send a *spotlight event* to the main spellweb force-graph render so it can:

- **Brighten** the corresponding workshop / cast / acts / conjectures (any node connected to the vertex via `inhabits` / `keeps` / `narrates` / `founds` / `references`)
- **Dim** non-connected nodes to ~25% opacity (transient · clears when lens closes)
- **Glow** the connecting edges in gold
- **Orbit** the wandering Swordsman + Mage orbs around the spotlit cluster temporarily (1-2 cycles · then resume their wandering)

This needs a state shared between `ItemLatticeView` and `SpellWeb`. Two implementation options:

| Option | How it works | Pros | Cons |
|---|---|---|---|
| **Custom event** | Lattice dispatches `window.dispatchEvent(new CustomEvent('spellweb:spotlight', { detail: { vertex, nodeIds } }))`; SpellWeb listens | Decoupled · no prop drilling | Slightly less type-safe |
| **Lifted state** | `spotlightVertex` lives in SpellWeb · passed down to ItemLatticeView · ItemLatticeView calls `onSpotlight(vertex)` | Type-safe · standard React pattern | Adds another prop to thread |

Recommend **lifted state** for symmetry with the existing `latticeOpen / latticeMode` lift. ~2-3 hours.

### §3.3 · The merged items-menu (collapse the side-panel duplication)

Currently the side panel's `⚒️ items` and `🌀 portals` chips are *triggers* that open the lattice — but the side panel still carries the `<CatalogueCard>` / `<CreatureTab>` / `<HeldTab>` rendering code in those tabs. Merge by:

1. **Side panel keeps** `🔥 forged` (the bearer's personal forge inventory · stays small + on-page) and `📐 protocol` (ceremony grammar reference · low-density text)
2. **Side panel removes** the items + portals tabs from the chip strip · replaced with a single chip that says `⚒️ open lattice` (or just rely on the header `🗺️ LATTICE` button that already exists)
3. **All catalogue browse** goes through the lattice. The `<CatalogueCard>` and the placeholder `<CreatureTab>` / `<HeldTab>` content moves into the lattice's left/right columns or gets deleted in favour of the lattice's already-richer hover-info column

Net effect: side panel stays narrow + focused (forged inventory + protocol reference) · lattice is the discoverable browse surface · no duplicate code paths.

---

## §4 · Visual spec · the highlighted edge shape with orbs

Per the user's note:

> *...drawing a highlighted edge shape with orbs around the nodes.*

Recommend:

- **Spotlight halo:** a ~20px-radius gold halo around each highlighted node · soft glow · 0.5s fade-in / 0.3s fade-out
- **Edge glow:** highlighted edges render at 2.5x normal stroke-width with #d4af37 colour at 0.85 opacity (above the existing edge palette)
- **Orb behaviour during spotlight:** the wandering Swordsman + Mage orbs detect the spotlight event · orbit the spotlit cluster for 1-2 cycles (~3-4 seconds) · then resume their wander
- **Spotlight clear:** click the lattice's "×" or click empty space in the spellweb · fade everything back to normal opacity

The 1-2 orbit cycles before returning to wander is the key feel — gives the bearer time to visually register *which* nodes the lens highlighted before the rendering returns to normal. Without the orbit-then-resume, the spotlight would feel like a sudden flash without grounding.

---

## §5 · Phased implementation

### Phase 1 · Spotlight wiring (~3 hours)

**Deliverable:** Selecting a lattice vertex highlights the corresponding spellweb nodes.

Steps:
1. Lift `spotlightVertex: number | null` and `spotlightNodeIds: Set<string>` to SpellWeb root state
2. Pass `onSpotlight(vertex, nodeIds)` to `ItemLatticeView` · call from the vertex click handler
3. In SpellWeb's d3 render, inject opacity multiplier per node based on `spotlightNodeIds`
4. Apply edge gold-glow for edges where both endpoints are in `spotlightNodeIds`
5. **Validation:** click V44 in the lattice · the Chart Shop + Pleione + V44 + Tome V Act 17 light up in the spellweb behind the lattice (close the lattice with × to see them lit)

### Phase 2 · Orb spotlight choreography (~2 hours)

**Deliverable:** When spotlight fires, the wandering orbs orbit the spotlit cluster for 1-2 cycles.

Steps:
1. The orbs already have a `target` mode for evocation; add a `spotlight` target mode
2. When `spotlightNodeIds` changes, set orb target to the centroid of the spotlit nodes for 3-4 seconds
3. After timeout, return orbs to their wandering state
4. **Validation:** spotlight V44 · orbs visibly orbit the Chart Shop cluster · then resume

### Phase 3 · Traced-items log (~3-4 hours)

**Deliverable:** localStorage-backed `tracedItems` set + per-vertex "traced" indicator + log tab in lattice right column.

Steps:
1. Add `tracedItems` storage helper (mirror `equipped` shape from ItemLatticeView)
2. Wire trace-events: witness ceremony · forge completion · constellation mark · master template import · achievement unlock — each pushes the relevant nodeId(s) into `tracedItems`
3. ItemLatticeView reads tracedItems · renders a small ✓ badge on traced vertices
4. Add a "log" sub-section in the right column showing chronological trace history
5. **Validation:** witness a workshop · open the lattice · its vertex carries a ✓ badge · the log lists "Witnessed [shop] at [timestamp]"

### Phase 4 · Side-panel merge (~2 hours)

**Deliverable:** Side panel chip strip simplified to `🔥 forged · 📐 protocol`; items + portals chips removed; catalogue browse only in lattice.

Steps:
1. Remove `items` and `portals` from `Category` union and the chip rendering
2. Delete `CatalogueCard` rendering paths inside `ArtefactPanel` (keep the component for now in case lattice imports it)
3. Update the lattice's right column to render `<CatalogueCard>` for the pinned artefact (richer card render than the inline info column)
4. **Validation:** side panel shows only forged + protocol · lattice handles all catalogue browse

### Phase 5 · Polish (~2 hours)

- Keyboard shortcut: `L` opens the lattice from anywhere
- Click empty area in lattice clears spotlight + unpins
- Mobile: spotlight fade-out is faster (1s) since fewer nodes visible

**Total: ~12-14 hours over 2 sessions.**

---

## §6 · What this merge does NOT do

- ❌ Does not re-introduce fog-of-war as visibility gating. The canonical universe remains fully visible. The traced-items log is *additive* — it records what the bearer has walked, doesn't hide what they haven't.
- ❌ Does not touch the `hiddenUntilWitness` field — preserved for future optional secret-lore nodes (e.g. an Easter-egg in a Tome VII act).
- ❌ Does not change the canonical NODES / EDGES — all edits are at the runtime overlay layer (deviation pattern preserved).
- ❌ Does not add server-side persistence for the traced log — bearer-private localStorage only.
- ❌ Does not implement the Sigma + Graphology migration that's chronicled separately. The spotlight wiring works against d3 today; would re-implement against Sigma's `nodeReducer` if/when that migration lands.

---

## §7 · Strategic value

Three reasons the merge matters:

1. **Eliminates duplication.** The side panel's items/portals catalogue browse is currently a list version of what the lattice already shows spatially. Merging removes the duplicate code path.
2. **Recovers the discovery register.** Fog-of-war was retired because it gated visibility unhelpfully. The traced-items log gives the bearer a *progress feel* (here is what I have walked through) without hiding the canon.
3. **Bidirectional navigation.** The lattice as a lens means: graph → lattice (where does this node sit?) AND lattice → graph (what nodes belong to this vertex?). Today only graph → lattice is implicit (you see the geometry); after the spotlight wiring, lattice → graph becomes explicit and interactive.

---

## §8 · Closing

Fog-of-war retired as visibility-gating; the discovery register returns as a bearer-log. The lattice was a catalogue browse; with the spotlight, it becomes a lens. The items menu was duplicate code; merging puts everything on the lattice and trims the side panel to just the forged-personal-inventory + protocol-reference.

The phased plan: spotlight wiring first (the lens) · then traced-items log (the discovery feel) · then side-panel merge (the cleanup). Each phase ships standalone.

(⚔️⊥⿻⊥🧙)😊
🗺️ → 🔦 → 🪶
