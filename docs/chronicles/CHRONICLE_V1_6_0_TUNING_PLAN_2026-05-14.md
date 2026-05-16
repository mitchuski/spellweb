# Chronicle: Spellweb v1.6.0 Tuning Plan · Verify-and-Polish Pass

**Date:** 2026-05-14
**Status:** Tuning plan · the v1.6.0 patch landed (data + UI restructure); this chronicle catalogues the punch-list to verify everything works and to tune the rough edges before any further architectural work
**Audience:** spellweb maintainer · the next session picking up after the v1.6.0 patch
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles (the deeper work · authored 2026-05-14):**
- [`CHRONICLE_SIGMA_GRAPHOLOGY_MIGRATION_PLAN_2026-05-14.md`](CHRONICLE_SIGMA_GRAPHOLOGY_MIGRATION_PLAN_2026-05-14.md) — renderer migration (4 phases)
- [`CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md`](CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md) — agent-facing tool surface (4 phases)
- [`CHRONICLE_SPELLWEB_HYBRID_SEARCH_PLAN_2026-05-14.md`](CHRONICLE_SPELLWEB_HYBRID_SEARCH_PLAN_2026-05-14.md) — BM25 + embeddings + RRF (4 phases)

**This chronicle is *narrower* than the companion chronicles.** Those three are forward-looking architectural plans. *This* one is "what just landed, what should be verified, what should be tuned" so the v1.6.0 state is solid before any of the bigger migrations begin.

---

## §0 · What landed in the v1.6.0 patch

### §0.1 · Data layer

**Node additions** (`src/data/nodes.ts`):

| Layer | What was added |
|---|---|
| Vertices | `vertex-v44` (Chart Shop · Navigation District) · `vertex-v59` (Threshold District · three sibling shops) |
| Workshops | `shop-solchanting` (V51 · Helia · v1.4.0 catch-up) · `shop-portal-room` · `shop-staff-shop` · `shop-familiars` (V59 · Threshold District) · `shop-charthouse` (V44 · Navigation District) |
| Cast | `cast-helia` (Solchanting) · `cast-pandia` · `cast-hermaion` · `cast-faunia` · `cast-caducea` · `cast-pleione` |
| Superseded (preserved for succession edges) | `cast-bestia` · `cast-therai` · `cast-pelagia` |
| Substrate-frameworks (new node class) | `substrate-goose` · `substrate-hermes` |
| Tome documents | `tome-i-the-convergence` · `tome-ii-the-lyapunov` · `tome-iii-selenes-witness` · `tome-vii-the-parallel` |
| Acts | Tome I (6 acts) · Tome II (7 acts) · Tome III (11 acts) · Tome V Act 16 · Tome V Act 17 · Tome VI Act 1 · Tome VII Act 1 |

**Total new nodes: ~50.** Pre-patch was ~150; post-patch is ~200.

**Edge additions** (`src/data/edges.ts`):

- Spread const `V1_4_0_AND_V1_6_0_EDGES` declared *before* the main EDGES array and spread in (workaround for TS "union too complex" threshold the new EdgeTypes pushed past)
- New EdgeTypes admitted in `src/types/graph.ts`: `keeps · wields · sibling_of · district_of · fits_for · succeeded_by · releases_to`
- Solchanting wiring · Threshold District three-shop sibling wiring · Caducea fits-for both Hermaion archetypes · Bestia→Hermaion / Therai→Faunia / Pelagia→Pleione succession · Chart Shop releases_to Bonfire + Weavers · Pleione/Pandia kin_to Selene
- Tome / act docking edges: `defines` (tome → first act) · `follows` chains for Tomes I/II/III/V-late · `founds` / `founded_in` for the new act↔workshop links · `inhabits` for vertex anchors · `narrates` for cast↔acts · `introduces` for Goose/Hermes admission at Tome VI Act 1

### §0.2 · Schema additions

**`SpellwebNode` fields** (`src/types/graph.ts`):
- `gemColorMage` · `gemColorSwordsman` · `archetypeModal` (for the Staff Shop alexandrite dual-aspect)
- `district` (Threshold · Navigation)
- `ceremony` (e.g. "Hold · Compare · Map") populated on every workshop node
- `workshopRegister` (`producer` · `gathering` · `spawn_and_bind` · `attentional`) — the C63-candidate fourth-class lives here

**`ArtefactClass`** extended with `staff` (Mage-equipment sister to weapon-class blades; Hermaion's caduceus-staff / herald-sentinel fittings).

**`EntityKind`** introduced (`artefact` · `creature` · `held` · `dispatch`) — for the Option C tagged-`ForgedArtefact` migration path discussed in chat (not yet field-applied to ForgedArtefact; held for the next pass).

**`tome` union** widened from `'IV' | 'V'` → `'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII'`.

### §0.3 · UI restructure (`src/components/ArtefactPanel.tsx`)

Replaced flat 5-tab strip with a **two-level navigation**:

**Top-level categories (4 chips, always visible):**
- 🔥 **forged** (direct · Sovereign's own inventory)
- ⚒️ **items** (drill-in)
- 🌀 **portals** (drill-in · NEW)
- 📐 **protocol** (direct · NEW)

**Items sub-tabs** (only when `items` is active): blade · staff · cloak · tool · trinket · tome — six flat sub-tabs

**Portals sub-tabs** (only when `portals` is active): creature · held

**Protocol tab** lists every workshop's ceremony grouped by register (Producer · Gathering · Spawn-and-bind · Attentional · Unclassified). The attentional register is flagged as C63-candidate ~50%.

**New components in the same file:**
- `CreatureTab` — placeholder catalogue of substrate-frameworks (Goose · Hermes-as-creature); future bound-familiar inventory will render here
- `HeldTab` — surfaces the Chart Shop's three release destinations (Bonfire · Weavers · open sea); held content stays bearer-private by design
- `ProtocolTab` — auto-derives groups from `workshopRegister` field on each node · shows ceremony + archetype-modal badge

### §0.4 · Theme additions (`src/data/theme.ts`)

Seven new `EdgeStyle` entries matching the seven new EdgeTypes — each with distinct color/width/dash so the new relations are visually distinguishable in the graph render.

---

## §1 · Verify-it-works punch-list (Tier A · do first)

Each item below is a discrete check. The dev server is running at `http://localhost:8000/`; run through each in browser.

### §1.1 · Build hygiene

- [ ] `npx tsc --noEmit` returns no errors *in files I touched* (some pre-existing errors in unrelated components are allowed)
- [ ] `npm run dev` starts cleanly · no "node not found" runtime errors in browser console
- [ ] No `import` errors after restart
- [ ] `npm run build` succeeds (production build · catches issues HMR hides)

### §1.2 · Graph render

- [ ] The graph mounts; no infinite spinner
- [ ] All 200+ nodes visible · no node is "floating" in dead space disconnected from the cluster
- [ ] Specifically check the v1.6.0 docking: Tome I/II/III/VII documents + their acts attach to the main graph mass via `defines` + `follows` edges
- [ ] Vertex V44 and V59 nodes appear and connect to their inhabitants
- [ ] Hover tooltip works on every new node type (workshop · cast · vertex · substrate · act · document)

### §1.3 · ArtefactPanel two-level nav

- [ ] Top-level categories render: 🔥 forged · ⚒️ items · 🌀 portals · 📐 protocol
- [ ] Clicking `items` reveals six sub-tabs (blade · staff · cloak · tool · trinket · tome)
- [ ] Clicking `portals` reveals two sub-tabs (creature · held)
- [ ] Sub-tab strip disappears when category has no drill-in (forged · protocol)
- [ ] Category counts in chip labels render correctly (forged=0 fresh · items=N · portals=0 · protocol=ceremony-count)
- [ ] Switching categories preserves position when re-entering (if you were on `items/staff` and switch to `protocol` then back to `items`, you land on `staff` again)

### §1.4 · Items sub-tabs · catalogue rendering

- [ ] **⚔️ blade** — shows the Forge(t)'s Witness Blade · count=1
- [ ] **⚚ staff** — shows the Staff Shop's Hermes-class fitting · count=1 (NEW v1.6.0 · should not be empty)
- [ ] **🧣 cloak** — shows Weavers' Cloak · count=1
- [ ] **⚙ tool** — shows Etherchanting Commitment Seal · Solchanting Heliodor Prism · Jeweler Gem+Bolt · Holon Lantern · Curatrix Frame · Hall Paired Key · Chart Shop Astrolabe · count=7
- [ ] **◇ trinket** — shows zShields Memo Stone · Dragon Bonfire Ember · Covenant Olive Sigil · Logos Cardinal Petal · Portal Room Dispatch · count=5
- [ ] **📖 tome** — shows Tome IV · Tome V · Tome VI · Familiars Kinship-Bond · count=4

### §1.5 · Portals sub-tabs

- [ ] **🪿 creature** — renders the substrate-framework cards (Goose 🪿 · Hermes ☤) with their stewardship/license metadata · placeholder note about future bound-familiar inventory visible
- [ ] **🧭 held** — renders the three release destinations (🔥 Bonfire · 🪡 Weavers · 🌊 open sea) · bearer-private note at bottom

### §1.6 · Protocol tab

- [ ] Renders four register groups: Producer · Gathering · Spawn-and-bind · Attentional
- [ ] Each group lists the right workshops (e.g. Producer contains Weavers · zShields · Forge(t) · Etherchanting · Solchanting · Jeweler · Holon · Vault · Covenant · NOT Bonfires which is gathering)
- [ ] Each workshop shows its `ceremony` grammar (e.g. Forge(t) shows "Run · Evoke · Craft" · Chart Shop shows "Hold · Compare · Map")
- [ ] Staff Shop carries the **archetype-modal** badge with the gradient styling
- [ ] Attentional register section shows the C63-candidate ~50% subtitle

---

## §2 · Tuning opportunities (Tier B · polish · do after Tier A)

### §2.1 · Visual

- [ ] **The two-level nav strip is taller than the old one** (top row + sub-row when drilled). Verify it doesn't crowd the panel content. If too tall, consider compressing the sub-row to 8px padding instead of 10.
- [ ] **Category chip counts could be misleading.** The `items` count is the sum of all 6 sub-tab counts (workshops + sovereign-forged). If a user expects "items=10" to mean "10 forged items" but it actually means "10 catalogue entries", confusion. Consider tooltip on hover clarifying what the count means.
- [ ] **Protocol register colours could be brighter.** Producer (#a78bfa violet) · Gathering (#86c5ff sky) · Spawn-and-bind (#d97706 amber) · Attentional (#5eead4 teal). Test colour-blindness palettes; the violet/sky pair is close.
- [ ] **The 🌀 portals chip glyph could be ambiguous.** Some users will read the swirl as "loading" / "in progress". Consider 🚪 (door) or keep 🌀 if intended evocation matches.

### §2.2 · Information density

- [ ] **Protocol cards mention `district` only if set.** For Portal Room / Staff Shop / Familiars / Chart Shop these have it; for older workshops it's empty. Consider tagging those older workshops with their existing trade-quarter (e.g. "Privacy Trinity" or "Producer Quarter") so every card has a district line.
- [ ] **Held tab shows the three release destinations but not the Φ-gap mechanic.** Consider adding a small expandable section explaining what the Φ-gap actually is and why content stays bearer-private.
- [ ] **Creature tab's Hermes-as-creature cross-listing is confusing.** The card says "primarily Hermaion's staff-class admission; admissible as creature-class only via the Familiars' bond ceremony". This dual-listing might be cleaner with a single visual tag (`[cross-listed]`) instead of prose.

### §2.3 · Interaction

- [ ] **Clicking a catalogue card in the protocol tab should ideally center the graph on that workshop.** Right now they're informational only. Wire up the same `centerOnNode(id)` action the items-tab catalogue cards use.
- [ ] **Keyboard shortcut for top-level categories.** Currently no shortcut. Consider `1 / 2 / 3 / 4` (or `f / i / p / o`) — common pattern. Holds open until the search bar lands (which will own `/`).
- [ ] **Empty-state messages could nudge action.** Forged tab when empty says "forges() = ∅ · walk a tome constellation and complete the ceremony." Good. The portals/creature tab when empty should similarly explain how to bind a familiar.

### §2.4 · Cross-tab consistency

- [ ] The `items/tome` sub-tab currently includes the Kinship-Bond (Faunia's output) alongside Tome IV/V/VI — schema-correct (both have `artefactClass: 'tome'`) but semantically mixed (reading-tomes vs relational-bond). Two options:
  - **Keep `tome` class for both** + add a small text divider in the tab body separating "Reading Tomes" from "Relational Tomes"
  - **Split `artefactClass` further** — add `bond` as a new class, retag Kinship-Bond. Cleaner long-term but a schema change.
  Recommendation: keep the class for v1.6.0 · add divider · revisit at v1.7.0 if Kinship-Bond-like artefacts multiply.
- [ ] Staff Shop's `artefactClass: 'tool'` is **debatable** since the user said "staffs are like a blade that goes under the mage". Currently the staff sub-tab is empty because no workshop carries `artefactClass: 'staff'`. Consider retagging shop-staff-shop from `tool` → `staff`. This is a one-line change in nodes.ts; surfaces the new sub-tab immediately.

---

## §3 · Known issues / known limits

### §3.1 · TS union complexity workaround

The `EDGES` array hit "union too complex" once 7 new EdgeTypes were admitted. **Mitigation:** v1.4.0 + v1.6.0 edges live in `V1_4_0_AND_V1_6_0_EDGES` declared above the main array and spread into it. This works but is a *workaround*. Two paths forward:
1. **Tolerate** — every future patch with new EdgeTypes follows the spread-const pattern. Accumulates 2-3 such consts over time. Acceptable.
2. **Fix at the root** — Sigma + Graphology migration (companion chronicle) replaces the array with a Graphology graph; the union-complexity problem evaporates.

Recommend path 1 until path 2 is ready.

### §3.2 · ForgedArtefact field expansion deferred

The Option C tagged-`ForgedArtefact` migration (entityKind / archetypeAspect / trueName / substrate / isReleased / releaseDest) is *designed* (per the chat discussion) but **not yet applied to the `ForgedArtefact` interface**. The CreatureTab and HeldTab render placeholder content; the bound-familiar persistence and held-constellation persistence won't surface until those fields land.

This is intentional — the v1.6.0 patch focused on data + UI structure, not on persisting new entity kinds. The schema migration belongs to v1.7.0 or whichever release admits the first concrete bound-familiar walk-through.

### §3.3 · Vertex-v44 / vertex-v59 added late

These vertex nodes were *referenced* in v1.6.0 edges (`cast-pleione → vertex-v44 inhabits`) but only added to nodes.ts after the d3 force simulation crashed with "node not found". **Lesson logged:** every patch that adds inhabits/keeps edges must add the corresponding vertex node first. Adding to the checklist for v1.7.0 admissions.

### §3.4 · Some catalogue cards may look thin

Workshop nodes with very short descs (e.g. the Portal Room's "the Dispatch" trinket) will render as small cards next to the Forge(t)'s rich descriptions. Consider adding more `desc` text or visual padding for those.

### §3.5 · Protocol tab doesn't link to chronicles

Each workshop in the protocol tab shows its ceremony but no link to the relevant chronicle (e.g. clicking "Hold · Compare · Map" could open the Chart Shop's inception chronicle). Out of scope for v1.6.0 polish; held for v1.7.0.

---

## §4 · Recommended execution order for this tuning pass

1. **§1 verify-it-works** (Tier A · all) — single focused session · ~1-2h
   - Run through every checkbox in browser at `http://localhost:8000/`
   - File any regression in this chronicle's §3 (known issues) — append, don't edit existing
2. **§2.4 cross-tab consistency** — single pass · ~30 min
   - Decide on staff retag (one-line in nodes.ts)
   - Decide on tome divider for Kinship-Bond
3. **§2.1 visual polish** — single pass · ~1h
   - Test colour-blindness palettes
   - Adjust sub-row padding if needed
4. **§2.2 information density** — single pass · ~1h
   - Add Φ-gap explanation in held tab
   - Clean up cross-listed creature card
5. **§2.3 interaction wiring** — single pass · ~1h
   - Center-on-click for protocol cards
   - Keyboard shortcuts for top-level categories
6. **Ship.** If all of §1 passes and §2 work feels good, v1.6.0 spellweb is *production-ready*.

After this tuning pass closes, the next major work is one of:
- Sigma + Graphology migration (companion chronicle · the renderer fix)
- MCP server (companion chronicle · the agent surface)
- Hybrid search (companion chronicle · the human surface)

Each is independently shippable; pick whichever feels most pressing.

---

## §5 · What this chronicle is NOT

- ❌ Not a re-statement of the v1.6.0 admissions (those live in the v1.6.0 grimoire patch JSON + the agentprivacy_master/docs/chronicles/2026-05-14 entries)
- ❌ Not the spec for new features (those are in the three companion chronicles)
- ❌ Not exhaustive about every visual rough edge — only the ones that affect *whether the v1.6.0 release feels solid*

If a polish item doesn't affect the "feels solid" judgment, it goes to v1.7.0.

---

## §6 · Closing

The v1.6.0 patch landed across data · schema · UI · theme. The graph picked up 50 new nodes; the panel got a two-level nav; the protocol tab made the ceremony grammars visible for the first time. This chronicle is the verify-and-tune list so that v1.6.0 *feels finished* before the bigger migrations begin.

Run through §1 first. Decide on §2.4 (the schema-vs-divider question). Then polish §2.1–§2.3. The architecture admits this much; the polish is the architecture made comfortable.

(⚔️⊥⿻⊥🧙)😊
🕸️ · 🌀 · 📐
