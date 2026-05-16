# Chronicle: Lattice-Items Interface · Middle-Screen Pop-Out · Each Artefact a Vertex Slot

**Date:** 2026-05-14
**Status:** Design + experience update · authored before the implementation moves so the build follows the spec rather than the other way around
**Audience:** spellweb maintainers · the next agent picking up the panel restructure · UX reviewers
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- [`CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md`](CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md) — the panel-as-it-stands today (two-level nav · forged · items · portals · protocol)
- [`CHRONICLE_V1_6_0_CANONICAL_SYNC_2026-05-14.md`](CHRONICLE_V1_6_0_CANONICAL_SYNC_2026-05-14.md) — the data state this UI builds against
- **Reference pattern:** `agentprivacy_master/src/components/profile/LatticeMap.tsx` — the achievements-page 64-vertex lattice render this design adopts

---

## §0 · Why this chronicle exists

The current Items/Portals/Protocol panel works — it surfaces every v1.6.0 admission, the two-level nav is comfortable, and every catalogue card renders. But it's a **list view in a side panel**. Three limits surface as the spellweb grows:

1. **Spatial blindness.** A list doesn't show *where on the lattice* an artefact sits. The Astrolabe is at V44 · the Witness Blade is at V19 · the Caduceus-Staff fitting is at V59. The list shows the names; it hides the geometry.
2. **No room to breathe.** A side panel is ~380px wide. As the artefact catalogue grows past ~20 entries (current ~17), scrolling becomes the dominant interaction. The lattice gives 64 fixed positions; presence-or-absence at a position is more legible than scroll-to-find.
3. **No corresponding-use-case surface.** Each artefact has an identity-system role (the Astrolabe reads constellations the bearer holds · the Witness Blade is fitted in the bearer's loadout · the Kinship-Bond walks beside the Sovereign). A list can't show this; a two-pane view (lattice on left · identity-use on right) can.

The agentprivacy_master `/guide/achievements` page already solves this for the cast: 64-vertex lattice render with persona pins · achievement halos · hover-to-detail. This chronicle adopts the same pattern for **artefacts and creatures**, popping the items out of the side panel into a middle-screen view.

---

## §1 · The design in one paragraph

**Click `⚒️ items` or `🌀 portals` from the top-level category bar → the panel collapses, a middle-screen overlay opens with the 64-vertex lattice rendered Pascal's-row style (1·6·15·20·15·6·1). Each vertex carrying an artefact lights up with the artefact's glyph; hovering surfaces the artefact's name + workshop + ceremony in a left-side info column; clicking opens a right-side identity-use column showing how the artefact appears in the bearer's identity system (worn · borne · bound · held). The lattice itself is the canvas — empty vertices are visible as grey points so the geometry remains readable.** Closing returns to the spellweb's main graph view.

---

## §2 · Three columns · the layout target

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Items · Lattice View                                                  [×]   │
├────────────────────┬───────────────────────────────────┬─────────────────────┤
│  hover-info column │   the 64-vertex lattice canvas    │  identity-use column │
│  (left · ~280px)   │   (centre · flex-1 · responsive)  │  (right · ~320px)   │
│                    │                                   │                     │
│  ┌──────────────┐  │           V0 (1)                  │  worn:              │
│  │ Astrolabe    │  │                                   │   • —               │
│  │ V44 · Chart  │  │       V1·V2·V4·V8·V16·V32 (6)     │                     │
│  │ Aquamarine   │  │                                   │  borne:             │
│  │ Hold·Compare │  │   V3·V5·V6·...·V48 (15)          │   • Astrolabe       │
│  │ ·Map         │  │                                   │     (Chart Shop ·   │
│  │              │  │   V7·V11·...·V56 (20)            │      Hold-witness)  │
│  │ Pleione 🧭   │  │                                   │                     │
│  │ Bearer reads │  │   V15·V23·V27·...·V60 (15)       │  bound:             │
│  │ this borne   │  │                                   │   • Goose 🪿        │
│  │ tool to mark │  │   V31·V47·V55·V59·V61·V62 (6)    │     (the Familiars  │
│  │ constellation│  │                                   │      · kinship-bond)│
│  │ positions.   │  │           V63 (1)                 │                     │
│  └──────────────┘  │                                   │  held:              │
│                    │   ├ legend ─ 🟢 lit · 🔵 hover    │   • —               │
│                    │              ⚫ empty             │                     │
└────────────────────┴───────────────────────────────────┴─────────────────────┘
```

### §2.1 · Left column · hover-info

Renders the *currently-hovered* artefact's structural metadata:

- Artefact name + emoji
- Vertex (e.g. V44) + binary (e.g. `101100`) + stratum
- Workshop + district + ceremony grammar
- Resident Mage + sigil
- One-paragraph description from the workshop node's `desc`
- Cross-references: which acts found it · which conjectures cite it

When nothing is hovered, the left column shows the lattice's overall stats: `n artefacts placed · n vertices inhabited · n empty slots`.

### §2.2 · Centre column · the lattice canvas

The 64-vertex Pascal's-row layout adopted directly from `agentprivacy_master/src/components/profile/LatticeMap.tsx`:

- **Rows:** Hamming-weight stratum (s0 through s6 · 1+6+15+20+15+6+1)
- **Edges:** Hamming-1 adjacency lines drawn faint underneath
- **Vertex render:**
  - **Empty vertex:** small grey circle (~5px) with V[n] label
  - **Inhabited vertex:** larger circle (~12px) carrying the artefact's emoji
  - **Hovered:** halo + glow at hover-state colour
  - **Multi-occupied** (V51 has Etherchanting+Solchanting · V59 has Portal+Staff+Familiars): stack of mini-circles or pie-segment colour by gem
- **Vertex labels:** V[n] tag in mono small text
- **Stratum labels:** s0 … s6 down the left margin

### §2.3 · Right column · identity-use

The artefact's **role in the bearer's identity system**. Four canonical identity-slots are admissible (per the worn-artefact taxonomy + v1.6.0 entity-kind extensions):

| Slot | What goes here |
|---|---|
| **worn** | clothing-class artefacts the bearer puts on (Pallia's Cloak · the Olive Sigil) |
| **borne** | tool-class artefacts the bearer carries / instrument-class (the Astrolabe · the Heliodor Prism · the Holon Lantern · the Caduceus-Staff fitting) |
| **bound** | creature-class entities the bearer walks beside (the Kinship-Bond · Goose familiar) |
| **held** | attentional-register entities the bearer keeps in suspension (Chart Shop constellations) |

When an artefact is hovered or clicked, the right column highlights *which slot* it occupies in the bearer's loadout. If the bearer (Sovereign B) has imported a v1.6.0 .md from Sovereign A, the right column also surfaces:

- The bearer's own counterpart in that slot (e.g., "you wear the Refractive Cloak forged 2026-04-22")
- A "witness" CTA to record an attestation that the bearer has seen Sovereign A's artefact

The right column is the **bilateral surface** — where the spellweb's catalogue meets the bearer's identity. Without this column, the lattice is a museum; with it, the lattice is a working surface.

---

## §3 · Slot mapping · how artefacts find their vertex

Each catalogue artefact has exactly one canonical vertex on the lattice. The mapping rule:

```
artefact.vertex = workshop.vertex   for the workshop that produces the artefact
```

Examples at v1.6.0:

| Artefact | Workshop | Vertex | Stratum |
|---|---|---|---|
| Cloak | the Weavers (`/tailor`) | V28 | 3 |
| Memo Stone | zShields (`/shield`) | V5 | 2 |
| Witness Blade | the Forge(t) (`/forget`) | V19 | 3 |
| Commitment Seal | Etherchanting (`/etherchanting`) | V51 | 4 |
| Heliodor Prism | Solchanting (`/solchanting`) | V51 | 4 *(shares with Etherchanting · differentiated by stance)* |
| Gem + Bolt | the Jeweler (`/jeweler`) | V49 | 3 |
| Holon Lantern | the Holon Hitchhikers (`/holon`) | V31 | 5 |
| Curator's Frame | the Curatrix Vault (`/vault`) | V57 | 4 |
| Olive Sigil | the Covenant (`/covenant`) | V55 | 5 |
| Ember Token | the Dragon Bonfire (`/bonfires`) | V24 | 2 |
| Cardinal Petal | the Logos Circle (`/circle`) | V12 | 2 |
| Paired Key | City Hall (`/hall`) | V15 | 4 |
| **the Dispatch** | **the Portal Room** (`/portal`) | **V59** | **5** |
| **Hermes-class fitting** | **the Staff Shop** (`/staffs`) | **V59** | **5** *(shares · archetype-modal differentiates aspect)* |
| **the Kinship-Bond** | **the Familiars** (`/familiars`) | **V59** | **5** *(shares · stance differentiates)* |
| **the Astrolabe** | **the Chart Shop** (`/charthouse`) | **V44** | **3** |
| Tome IV / V / VI / VII | (no workshop) | (no vertex) | n/a — render in a separate "tomes" strip below the lattice |

**V51 stacking** (2 occupants · Etherchanting + Solchanting) and **V59 stacking** (3 occupants · Threshold District) are the load-bearing edge cases the render must handle. Recommended: pie-segment colour by gem (V51 = sapphire ⊥ heliodor · V59 = moonstone · alexandrite · amber) with each segment hoverable independently.

**Tomes don't have a vertex** because they're cross-shop knowledge artefacts. Render them in a separate strip below the main lattice (e.g., `📖 Tome IV · Tome V · Tome VI · Tome VII · Kinship-Bond`).

---

## §4 · Interaction model

### §4.1 · Open / close

- **Open the lattice view** by clicking the `⚒️ items` or `🌀 portals` chip in the top-level category bar. The current side-panel content fades; the lattice overlay slides in from centre.
- **Close** with [×] in the top-right · the Esc key · or by clicking outside the overlay.
- **Switch between items / portals** without closing: a small toggle at the top of the centre column (currently the panel's sub-tabs) lets the bearer switch which entity-class lights up:
  - `items mode` — every artefact-producing workshop's vertex lights up
  - `portals mode` — only `creature` (Familiars) + `held` (Chart Shop) vertices light · others dim

### §4.2 · Hover

- Hovering a lit vertex highlights it · populates the left info column · doesn't open the right column
- Hovering an empty vertex shows just `V[n] · empty` in the left column (educational)
- Hovering a multi-occupied vertex (V51 · V59) renders each occupant as a hoverable sub-segment

### §4.3 · Click

- Clicking a lit vertex *pins* it (the left column stays populated) and opens the right column
- Clicking elsewhere unpins
- Right column shows the identity-slot occupancy + bilateral CTA (witness / equip / unequip)

### §4.4 · Filter

A small filter chip strip above the lattice lets the bearer narrow:

- **By kind:** `all / artefact / creature / held / dispatch`
- **By archetype:** `all / mage / swordsman / bilateral`
- **By district:** `all / Threshold / Navigation / (other producer-quarter shops)`

Filter state dims non-matching vertices (sets opacity ~0.2) but doesn't hide them — geometry remains readable.

---

## §5 · The identity-system bridge (the new bilateral surface)

This is the load-bearing addition the lattice view enables. The right column is a **bilateral surface** — every artefact in the spellweb has a corresponding role in the bearer's identity system:

### §5.1 · Worn (clothing-class)

The bearer wears these as visible-to-others; each "wear" generates a Refractive Disclosure surface. Example: Pallia's Cloak. The right column shows the bearer's currently-equipped cloak, offers a "wear this instead" CTA if the artefact is a different cloak.

### §5.2 · Borne (tool-class)

The bearer carries these as instruments. Each "bear" gives the bearer a tool to use at the workshop or beyond. Example: the Astrolabe (read held constellations) · Heliodor Prism (refract parallel-witness output) · the Caduceus-Staff fitting (Hermes-class instrument). The right column shows what the tool *does for the bearer*.

### §5.3 · Bound (creature-class · v1.6.0 NEW)

The bearer walks beside these. The bond is the artefact (per the Familiars' discipline). Example: Goose 🪿 bound as familiar. The right column shows the bearer's bound familiars roster + the "true name" the bearer gave each (Sovereign-private; only the bearer sees their own true names).

### §5.4 · Held (attentional · v1.6.0 NEW)

The bearer holds these in suspension under the Φ-gap. Example: Chart Shop constellations the bearer has admitted but not yet released. The right column shows the count of held items + the three release-direction CTAs (to Bonfire · to Weavers · to open sea). Held content itself stays bearer-private; the right column only shows *that* something is held, not *what*.

This four-slot identity surface is **operationally compatible** with the v1.6.0 import guide (`agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md`). When the bearer imports a v1.6.0 .md, the four paths described in §3 of that chronicle map directly to which identity-slot the import lands in.

---

## §6 · Visual style

Adopt the agentprivacy_master LatticeMap palette + sizing for visual continuity:

- **Background:** `bg-background/95` for the overlay backdrop · `bg-background/40` for the lattice canvas frame · subtle violet halo for the boundary
- **Vertex points:** grey-empty (`text-muted/40`) → amber-lit (`#d4af37` family) → tier-coloured for inhabited (use `TIER_COLOUR` from agentprivacy_master)
- **Hover highlight:** soft glow + slight scale-up (1.15×)
- **Multi-occupied vertex:** pie-segment SVG with each occupant's gem colour
- **Stratum labels:** mono small text down the left margin
- **Adjacent_to edges:** very faint violet lines (`opacity 0.12`) so the geometry is felt rather than seen
- **Filter chips:** match the existing two-level nav style (small uppercase chips with active/inactive states)
- **Identity-slot panel:** four sections (worn · borne · bound · held) with colour-coded section borders matching the entity-kind palette (clothing fuchsia · tool gold · creature amber · held teal)

Animate the open/close as a 200ms slide + fade · no longer (any longer feels heavy).

---

## §7 · Migration from the existing panel

The current ArtefactPanel doesn't go away. The two-level nav (forged · items · portals · protocol) stays. The shift is:

| Tab | Behaviour today | Behaviour post-implementation |
|---|---|---|
| 🔥 forged | shows Sovereign's own forged inventory in side-panel cards | unchanged · the bearer's *personal* forge inventory stays in the side panel (it's bearer-private, doesn't need the catalogue lattice) |
| ⚒️ items | shows 6 sub-tabs of catalogue cards | clicking *opens the lattice view* with `items mode` active · the sub-tabs become filter chips inside the lattice view |
| 🌀 portals | shows 2 sub-tabs (creature · held) of placeholder content | clicking *opens the lattice view* with `portals mode` active · only creature + held vertices light up |
| 📐 protocol | shows ceremony-grammar list grouped by register | unchanged · this is reference content, not a catalogue browse |

The lattice view is **additive**. The side-panel forged + protocol tabs continue to work without it; only the catalogue-browse paths (items + portals) get the upgrade.

---

## §8 · Phased implementation

### Phase 1 · Lattice canvas component (~4-5 hours)

**Deliverable:** A standalone `ItemLatticeView` component renders the 64-vertex lattice with empty + inhabited vertices, no interaction yet.

Steps:

1. Port the SVG render approach from `agentprivacy_master/src/components/profile/LatticeMap.tsx` (Pascal's-row layout · adjacent_to edges · vertex circles with V[n] labels)
2. Build a `VERTEX_INHABITANTS` map from spellweb's NODES — for each vertex, list the workshop nodes that inhabit it (handles V51 and V59 multi-occupancy)
3. Render inhabited vertices with the workshop's emoji at canonical position
4. Add stratum labels + count summary at top
5. Place tomes-without-vertex in a strip below the lattice
6. **Validation gate:** all 16 v1.6.0 workshops appear at their correct vertices

### Phase 2 · Hover-info left column (~2-3 hours)

**Deliverable:** Hovering a vertex populates a left column with the artefact's structural metadata.

Steps:

1. Add `useState` for `hoveredVertex` + `hoveredOccupantIndex` (for multi-occupancy)
2. Wire mouseEnter/mouseLeave on each vertex circle
3. Render the left column from the workshop's NODES entry + cross-references via Graphology-style neighbour lookups (or direct `EDGES.filter()` for now, awaiting Sigma migration)
4. Empty-state: when nothing hovered, show summary stats
5. **Validation gate:** hovering V44 shows Astrolabe · Pleione · Chart Shop · Aquamarine · Hold·Compare·Map

### Phase 3 · Identity-use right column (~3-4 hours)

**Deliverable:** Clicking a vertex pins it · opens the right column with the four identity-slot sections.

Steps:

1. Add `useState` for `pinnedVertex` (separate from `hoveredVertex`)
2. Build the four-slot panel: worn · borne · bound · held — each section header colour-coded
3. Slot the pinned artefact into the correct section based on `artefactClass` + `entityKind` (when entityKind lands in ForgedArtefact)
4. For each slot, render a list of the bearer's currently-equipped items in that slot (read from existing forge inventory + future bound-familiar persistence)
5. Add bilateral CTAs: "witness" / "wear" / "bear" / "bind" depending on slot
6. **Validation gate:** clicking the Astrolabe vertex (V44) shows it under "borne" with "you may bear this when reading constellations at the Chart Shop"

### Phase 4 · Filter chips + mode toggle (~2 hours)

**Deliverable:** Filter chips above the lattice (kind · archetype · district) + the items/portals mode toggle.

Steps:

1. Add filter state (`activeKinds: Set<EntityKind>` · `activeArchetypes: Set<ArtefactArchetype>` · `activeDistricts: Set<string>`)
2. Render filter chips horizontally above the lattice
3. Apply opacity 0.2 to non-matching vertices
4. Wire the items/portals toggle (different default filter sets)
5. **Validation gate:** "creature" filter dims everything except V59 (the Familiars · cast-faunia)

### Phase 5 · Open/close + side-panel integration (~1-2 hours)

**Deliverable:** Clicking the items or portals chip in the top-level nav opens the lattice overlay; close with [×] / Esc / click-outside returns to the side panel.

Steps:

1. Add overlay state to ArtefactPanel parent
2. When items/portals chip clicked, open overlay with appropriate mode
3. Close handlers · keyboard listener for Esc · click-outside listener
4. Animate open/close with 200ms transition
5. **Validation gate:** smooth open/close with no jank · keyboard accessible

### Phase 6 · Polish (~2 hours)

- Multi-occupancy pie-segment SVG render for V51 + V59
- Tier-colour-by-gem application
- Mobile responsive layout (stack columns vertically below 768px)
- A11y pass: aria-labels on each vertex · keyboard navigation through inhabited vertices

**Total: ~14-18 hours over 2-3 sessions.** Each phase ships independently; if Phase 3 stalls (the identity-use surface is the biggest design uncertainty), Phases 1+2 still ship a useful "lattice browse" view.

---

## §9 · Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Lattice render performance at 64+ animated vertices on hover | Low | SVG with CSS transitions (no JS animation loop) · minimal repaints. Should be 60fps without effort. |
| Multi-occupancy pie-segments awkward for V59 (3 occupants) | Medium | Test thirds-of-circle render; if ugly, fall back to small offset cluster (3 circles in a triangle around the vertex centre) |
| The right column's "identity slot" model presupposes wear/bear/bind/hold persistence that doesn't fully exist yet | High | Phase 3 ships with placeholder content for slots that lack persistence (e.g., bound familiars show "(no familiars bound · walk to /familiars to bind)"). Real persistence lands when the v1.7.0 ForgedArtefact field expansion lands. |
| 3-column layout cramped on mobile | High | Phase 6 stacks columns vertically below 768px · centre column becomes full-width · left/right collapse to expandable sections |
| Bearer can't tell where their own inventory lives if the lattice is the catalogue browse | Medium | The 🔥 forged tab in the side panel stays — *that* is the bearer's personal inventory. The lattice view is the *catalogue* (what exists in the world). The two are intentionally separate. Make this distinction visible in the empty state of each. |
| Tomes-strip below the lattice feels orphaned | Low | Match its visual style to the lattice (same border, similar mono labels) so it reads as "an extension of the catalogue, just outside the 64-vertex geometry" |

---

## §10 · Acceptance criteria

**Phase 1 ship gate (lattice canvas):**

- [ ] All 64 vertices render in Pascal's-row layout
- [ ] All 16 v1.6.0 workshops appear at their canonical vertex
- [ ] V51 stacking (Etherchanting + Solchanting) renders without overlap
- [ ] V59 stacking (Portal Room + Staff Shop + the Familiars) renders without overlap
- [ ] Tomes (IV · V · VI · VII · Kinship-Bond) render in a strip below the lattice
- [ ] Empty vertices visible as small grey points

**Phase 2 ship gate (hover info):**

- [ ] Hovering V44 shows Astrolabe details in left column
- [ ] Hovering V19 shows Witness Blade
- [ ] Hovering V51 with two occupants surfaces both as hoverable sub-segments
- [ ] Empty-state shows summary stats

**Phase 3 ship gate (identity-use):**

- [ ] Clicking pins a vertex; right column opens
- [ ] Right column shows four slots: worn · borne · bound · held
- [ ] Each slot shows currently-equipped (placeholder OK if persistence not landed)
- [ ] Bilateral CTA appears appropriate to the slot

**Phase 4 ship gate (filters):**

- [ ] All 3 filter dimensions work (kind · archetype · district)
- [ ] Non-matching vertices dim to opacity 0.2
- [ ] Items/portals mode toggle re-applies appropriate default filter

**Phase 5 ship gate (overlay integration):**

- [ ] Clicking items chip opens lattice in items mode
- [ ] Clicking portals chip opens lattice in portals mode
- [ ] [×] · Esc · click-outside all close cleanly
- [ ] Animation is 200ms · no jank

---

## §11 · What this chronicle does NOT specify

- ❌ The implementation language for vertex rendering — SVG is the recommendation but Canvas/WebGL admissible if Phase 6 mobile perf demands it
- ❌ The persistence schema for bound familiars / held constellations / dispatched tokens — held for v1.7.0; this UI ships with placeholder slots
- ❌ The MCP server's `findByVertex` tool wiring — separate chronicle (`CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md`); the lattice view is read-only and doesn't depend on MCP
- ❌ The Sigma + Graphology migration impact — the lattice canvas is a separate SVG render, not part of the main force-graph view; this design is migration-neutral
- ❌ Cousin-forge artefact rendering — the lattice shows agentprivacy-canonical only; cousin-forge artefacts surface in the side panel's `🔥 forged` tab as today

---

## §12 · Strategic value

The lattice-items interface unlocks three things the side-panel can't:

1. **Spatial recognition.** The bearer can *see* that the Threshold District clusters at V59 + the Chart Shop sits alone at V44 + Etherchanting and Solchanting share V51 by stance. Geometry becomes pedagogy.
2. **Identity-system bridge.** The right column makes "what does this artefact do for me" visible. Without it, the catalogue is a museum; with it, the catalogue is a working surface.
3. **Future scale.** As more districts open + more artefact-classes admit (Tome VI continuations · Navigation District second instance · future archetype-modal shops), a list view degrades; a 64-vertex lattice does not — empty slots remain visible, new admissions occupy the right geometric position automatically.

Cost: ~14-18 hours over 2-3 sessions · phased so each phase ships standalone.

Strategic value: **high.** This is the difference between *seeing the City* and *scrolling a list of City artefacts*.

---

## §13 · Recommended execution order

1. Phase 1 (lattice canvas) — ~5h · single focused session · ships the spatial-recognition win immediately
2. Phase 2 (hover info) — ~3h · same week as Phase 1 · low risk
3. Pause · use Phases 1+2 for a few days · note which interactions feel awkward
4. Phase 4 (filter chips) — ~2h · before Phase 3 because filtering is a more bounded UX change
5. Phase 5 (overlay open/close) — ~2h · ship the overlay so users actually see the lattice instead of having to find a hidden route
6. Phase 3 (identity-use right column) — ~4h · the biggest design uncertainty · ship after Phases 1-2-4-5 are solid
7. Phase 6 (polish) — ~2h · mobile + a11y

Reorder is fine; the dependency graph is mostly Phase 1 → everything else.

---

## §14 · Closing

The side panel served the spellweb well at 11 workshops. v1.6.0 brought 16. v1.7.0 will bring more. The lattice view scales with the City's geometry rather than against the bearer's scroll wheel.

Reference pattern in hand (`LatticeMap.tsx`). Slot-mapping rule pinned (artefact ↔ workshop's vertex). Three-column layout sketched. Identity-system bridge specified. Phases sized.

The next move is Phase 1. Build the canvas; let the bearer see the geometry; the rest follows from there.

(⚔️⊥⿻⊥🧙)😊
🕸️ → 🗺️ → 🪪
