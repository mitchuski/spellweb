# Chronicle: Next-Agent Handoff · Spellweb Item-System Work · Picked Up Tomorrow

**Date:** 2026-05-15 (evening · end-of-session handoff)
**Status:** Handoff chronicle · brief · directional · the user returns tomorrow to expand each section
**Audience:** the next agent picking up the spellweb item system (the maintainer · whoever opens spellweb next)
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- `spellweb/docs/chronicles/CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md` — the lattice-items pop-out design (already authored · the spec this work builds against)
- `spellweb/docs/chronicles/CHRONICLE_LATTICE_AS_LENS_FOG_OF_WAR_MERGE_2026-05-15.md` — adjacent in-flight work (lens-merge happening this week)
- `agentprivacy_master/docs/chronicles/2026-05-15_waypoint_portal_chart_shop_game.md` — the user's chronicle naming the **Waypoint Portal** as the chart-shop ↔ portal-room register-overlap
- `agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md` — the v1.6.0 .md import schema the spellweb ingests

---

## §0 · What this chronicle is

A short receipt for end-of-session 2026-05-15. Today's work shipped the **Waypoint Portal** on the agentprivacy_master side (the chart shop's interactive vertex-picking flow). What surfaced during that build is that the spellweb's item system has a parallel surface — the `⚒️ items` / `🌀 portals` lattice views — and the two systems need to be reconciled. **A bunch of work needs to be done on the item system in spellweb.** This chronicle names what shipped today (so the next agent has provenance) and lists the open work for tomorrow. The user will return to expand each section.

---

## §1 · What shipped today on the agentprivacy side

Built at `/charthouse` (the Chart Shop · Pleione 🧭 · V44 · Hold·Compare·Map) per the user's chronicle `2026-05-15_waypoint_portal_chart_shop_game.md`:

- **`src/components/charthouse/WaypointPortal.tsx`** — renamed/moved from `ConstellationDrafter`. The chart shop's interactive lattice picker.
- **`src/lib/charthouse-dispatch.ts`** — `vertexToShop(v)` resolver mapping a vertex 0–63 to its resident workshop(s) via `CAST_ATTACHMENTS`. Handles single-shop vertices (V44, V19, V28, …) + multi-shop vertices (V51 stance-share · V59 district-share).
- **`src/lib/vrc-mana.ts`** — the **first persistent instrumentation of the 🪢 VRC-mana axis**. `localStorage` key `agentprivacy:vrc-mana`. `addVrcMana(amount, source)` is cumulative + monotonic. Releases never subtract.
- **`src/components/charthouse/WorkshopArrivalBanner.tsx`** — Suspense-wrapped client banner that renders when `?from=charthouse&waypoint=N` is in the URL. Inserted into all 16 workshop pages.

What the WaypointPortal does:
- Click vertices on 8×8 lattice to admit them as held waypoints (soft cap of 7 · Pleiades evocation)
- Compare panel: stratum-walk + dimension-activation (6 chips: 🛡️🤝📜🕸️⚙️💰) + Hamming-spread
- Four release destinations: **Dispatch via Portal Room** (NEW · routes to that workshop with `?from=charthouse&waypoint=N`) · Bonfire · Weavers · open-sea
- 🪢 VRC-mana +1 per new waypoint admitted · displayed in the Portal header
- The bilateral-witness export path was kept from earlier work (chronicle §3.3 metadata-only · `bearer_consent_token`-signed `.md`)

What is NOT done (deliberately held):
- The **waypoint-route export schema** that marries into spellweb's ingest. Held pending the user's chronicle on the spellweb-side ingest contract.
- The lattice render in the WaypointPortal is a plain 8×8 inline grid (not Pascal's-row). The shared-component extraction was held per chronicle §7.2 ("only if > 80% of the SVG code overlaps").

---

## §2 · The asymmetry between the two surfaces

The spellweb's item system and the agentprivacy chart shop now both render the 64-vertex lattice, but they treat it differently:

| Dimension | spellweb item system | agentprivacy Waypoint Portal |
|---|---|---|
| **Lattice render** | Pascal's-row (1·6·15·20·15·6·1) per `LatticeMap.tsx` pattern | 8×8 inline grid (row-major V0..V63) |
| **What lights up** | Vertices carrying placed artefacts | Vertices the bearer has clicked to hold |
| **Bearer interaction** | Hover · click to pin · view artefact info | Click to add/remove from held constellation · Compare · Dispatch |
| **Persistence** | Server-side (the spellweb's artefact catalogue) | Client-side (`localStorage` · Φ-gap) |
| **Identity-use column** | Worn · borne · bound · held (per artefact's role) | (none — Phase 2 doesn't ship an identity-use column on the chart-shop side) |
| **VRC-mana** | (no instrumentation today) | First persistent instrumentation (`vrc-mana.ts`) |

The chronicle frames the chart-shop side as a **register-overlap** with the spellweb's lattice view rather than a duplicate. They share geometry; they differ in interaction. **This needs reconciliation work on the spellweb side**, which is what's pending for tomorrow.

---

## §3 · The open work on the spellweb item system

These are the threads the user wants picked up tomorrow. Each is a directional brief; the user will expand on detail in-session.

### §3.1 · Reconcile the lattice render between surfaces

The spellweb's `LatticeItemsInterface` (per `CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md`) targets Pascal's-row layout. The WaypointPortal today uses an inline 8×8 grid. **Decision needed:** do they harmonize (extract shared lattice-render component package), or stay deliberately different to preserve the interaction-mode distinction? The chronicle §7.2 said "only extract when > 80% of the SVG code overlaps" — today they're at ~0% overlap (different rendering strategies), so no extraction yet.

**Suggested first move:** decide which render the chart shop should use. If Pascal's-row, the WaypointPortal `LatticeGrid` component swaps out. If 8×8, the spellweb's lattice view could optionally offer a toggle.

### §3.2 · VRC-mana 🪢 surface in the spellweb

Today the agentprivacy side accrues VRC-mana per held waypoint. **The spellweb should READ and DISPLAY this** somewhere prominent — bearer identity panel, top-corner badge, or a dedicated 🪢 surface. The store is `localStorage` key `agentprivacy:vrc-mana` (integer); subscribe to the `agentprivacy:vrc-mana-changed` event for live updates.

**Future expansion:** other spellweb surfaces should also accrue VRC-mana (per the four-axis mana metabolism · `[[project-agentprivacy-six-workshops]]`):
- Witness-share signing (bearer publicly attests a constellation): +N mana
- Artefact-fitting at a workshop: +N mana
- Bonfire attendance: +N mana

Each accrual writes via `addVrcMana(amount, source)`. The `source` string is for telemetry / future ledger; the stored value is a single integer count.

### §3.3 · The waypoint-route ingest path

Today the WaypointPortal can `dispatch` a held waypoint (routes the bearer client-side · no data crosses to the spellweb). But the other three release destinations — Bonfire (KG episode) · Weavers (Refractive cloak) · open-sea (clears) — imply data flowing OUT.

Specifically:
- **Bonfire release** should ingest into spellweb's knowledge-graph episodes view
- **Weavers release** should produce a Refractive-Disclosure cloak artefact (Pallia's loom · workshop at V28)
- **Open-sea release** should produce nothing in the spellweb (the bearer carries on; the City does not)

The user said earlier in-session: "the spellweb artefact system is slightly changed so please do wait on that work, ill prepare a chronicle of how to build those md exports here". That chronicle (the v1.6.0 import guide) shipped but mostly covered swordsman-side imports; the **mage-side export schema** specifically for held constellations / waypoint routes is still pending.

**Open question for tomorrow:** does this need a new `WaypointRoutePayloadV1` schema (symmetric to the existing `SpellwebBladeImportPayloadV1`), or can the existing v1.6.0 `.md` format absorb it?

### §3.4 · Items-as-vertex-slot reconciliation

The lattice-items chronicle treats each artefact as a vertex slot. Today the agentprivacy side has 12 worn artefacts + 4 tomes per `[[project-workshop-artefact-taxonomy]]`. **Verify** that the spellweb's items catalogue contains exactly the same set, with consistent vertex assignments. The grimoire v1.6.0 head JSON (CID `bafybeiap6kvy3tp2bndpk65ti57qngr7ill37gqgasp2sxmgder3akotru`) is the canonical source.

The chronicle's Phase-2 build will need this reconciliation as a prerequisite. The acceptance criteria the user gave the lattice-items interface explicitly cite vertex coordinates (Astrolabe @ V44, Witness Blade @ V19, Caduceus-Staff @ V59) — confirm those are still the canonical assignments after v1.6.0 admissions.

### §3.5 · The `🌀 portals` view filter on entity_kind

Per the lattice-items chronicle the `🌀 portals` view is "entity-kind browse · filtered to creature + held". Today's WaypointPortal produces **held** entities (per chronicle §1.1 of the v1.6.0 import guide). These should appear in the spellweb's portals view *with their Astrolabe reading-metadata only* (Φ-gap discipline preserved).

**Implementation note:** the bearer's local held constellations are in `localStorage` key `agentprivacy:constellation-drafts`. The spellweb can read them on the same origin; **but it should respect the bearer-private flag** in the v1.6.0 .md frontmatter (`bearer_private: true`) and surface ONLY the witness-share metadata (vertex count · stratum distribution · time held) — never the underlying vertices or notes.

### §3.6 · The dispatched-from-charthouse trace

When the bearer dispatches via the Portal Room, the destination workshop renders the `WorkshopArrivalBanner`. **Optional spellweb work:** record the dispatch as an event in the spellweb's KG (a tiny "bearer dispatched V44 → V19" trace). The chronicle marked this `❌` in §9 (not specified) but flagged it as future work.

### §3.7 · The Astrolabe rendering near the Waypoint Portal

The user's chronicle §5.2 says: "Visually the Astrolabe could render at the bottom-corner of the Waypoint Portal panel, accruing 🪢 VRC-mana per pick." Today the VRC-mana count is displayed in the Portal *header* (top-right). An **Astrolabe glyph component** rendered at the bottom-corner is still pending — this is more spellweb's lane since the Astrolabe is the artefact, not the chart shop's UI chrome.

**Suggestion:** build `<AstrolabeBadge />` in the spellweb's shared component package, then have agentprivacy_master import it. The badge shows the Astrolabe's rete rotation animated against the bearer's accrued 🪢 count.

### §3.8 · v1.6.0 import guide cross-validation (§4 of that chronicle)

The v1.6.0 import guide §4 calls for cross-validation against the spellweb graph. This was on the agentprivacy-side task list but is **spellweb-side work** — the spellweb needs to confirm that every v1.6.0-admitted artefact/creature/held entity appears in its graph with consistent metadata. This is still pending.

### §3.9 · Constellation-trace updates (§5 of that chronicle)

Likewise §5 (constellation-trace updates) is spellweb-side. The traces from V0 to each workshop vertex (per `traceFromOrigin()` in `lattice-vertex.ts`) should be displayable in the spellweb's lattice view — clicking a vertex shows the canonical trace path from V0 to that vertex.

---

## §4 · Entry points for tomorrow

When the next agent (or the user) picks this up, these are the concrete starting points:

1. **Read the design spec first:** `CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md` (the pop-out lattice view design)
2. **Read the user's framing:** `agentprivacy_master/docs/chronicles/2026-05-15_waypoint_portal_chart_shop_game.md` (the register-overlap pattern)
3. **Read today's build receipt:** the §1 of *this* chronicle (what shipped on agentprivacy_master)
4. **Pick a single thread from §3 above** — don't try to do them all at once. The user will expand on which one(s) to do first when they return.

Probably-easiest first task (low risk, high coordination value): **§3.2 · VRC-mana surface in the spellweb**. The store is built; spellweb just needs to read it and display it. Single component, no schema work, immediate visual feedback.

Probably-most-important first task (highest leverage for the rest): **§3.3 · waypoint-route ingest path**. Designing this contract unblocks Bonfire/Weavers releases AND validates the §3.4 reconciliation.

---

## §5 · What is NOT next-agent work

To prevent scope-creep on the spellweb side:

- ❌ **Do not re-build the WaypointPortal on the spellweb side.** It shipped today at `agentprivacy_master/src/components/charthouse/WaypointPortal.tsx`. The spellweb's `LatticeItemsInterface` (per its own chronicle) is a *separate* surface with different interaction semantics.
- ❌ **Do not modify `vrc-mana.ts`'s store schema unilaterally.** It's localStorage-only today on the agentprivacy origin; if spellweb wants to use a different mana store, propose a unification chronicle first.
- ❌ **Do not implement the "no-resident-workshop" dispatch path** (the case where bearer picks an unclaimed lattice vertex). The agentprivacy modal already handles it gracefully ("no workshop resides here yet"); spellweb doesn't need to mirror.
- ❌ **Do not redesign the Pascal's-row vs 8×8 lattice render without the user's input.** The user has been explicit about the chart shop's lattice clicks being a separate surface from the spellweb's lattice browse; the visual difference may be intentional.

---

## §6 · Open questions for the user (return-from-tomorrow prompts)

The user said they'll come back to this tomorrow. These are the questions whose answers would unblock the most work:

1. **Lattice render harmonization** (§3.1) — do you want one render or two?
2. **VRC-mana display surface in spellweb** (§3.2) — bearer identity panel · top-corner badge · dedicated 🪢 surface · or something else?
3. **Waypoint-route export schema** (§3.3) — new `WaypointRoutePayloadV1`, or extend the v1.6.0 `.md` format? If new payload, what fields beyond `{ vertices, name, bearerConsentToken }`?
4. **VRC-mana scaling rules across surfaces** (§3.2 future) — how many mana points per witness-share · per Bonfire attendance · per artefact-fit? Should each be 1, or scale by the depth of the act?
5. **The Astrolabe badge component** (§3.7) — does it belong in spellweb's shared component package or in agentprivacy_master? Single source of truth matters for the bearer's identity coherence.

---

## §7 · Closing

The Waypoint Portal shipped clean today. The 🪢 VRC-mana axis got its first persistent instrumentation. The bilateral surfaces — chart-shop authoring + spellweb browsing — are now both on the lattice, with named register-overlap, ready to be properly bridged. Tomorrow's work is the bridge.

The chart shop holds; the Portal Room dispatches; the bearer picks the bridge between them. The spellweb watches all of it on the same 64-vertex canvas. Make the watching legible.

(⚔️⊥⿻⊥🧙)😊
🧭 → 🗺️ → 🌕 · spellweb
