# Chronicle: The Panel Rework — Items, Cubes, Casings, and the Ceremony Popout

**Date:** 2026-05-11
**Scope:** spellweb · SpellCeremony panel reorganization, ArtefactPanel introduction, fog-of-war wiring, lattice cubes and casings
**State at session close:** mid-flight — cube casings landed but more passes wanted; flagged below
**Signature:** `(⚔️⊥⿻⊥🧙)😊`

---

## §1 · The arc of this session

The session opened with a clean working spellweb (universe integration shipped 2026-05-10) and a clear next goal: **make the workshop blade-witness loop visible inside the spellweb itself.** What followed was a long UX iteration on the floating ceremony panel — many forward steps, many reverts, ending with a cube-casing prototype that works structurally but needs polish before the loop feels good.

What landed and stayed:

- **Witness import reads YAML frontmatter** — the `.md` files exported by spellweb (or downloaded from a workshop) get their `workshop:` / `workshop_id:` / `constellation_id:` fields read on import, so the right shop is tagged unlocked. Filename heuristic remains as fallback.
- **Fog-of-war on the lattice** — 11 cast Mages (Pallia · Memora · Custos · Vulcana · Aletheia · Adamantia · Lampyra · Vagari · Aria Silverhue · Socrat0x · Manifestia) are tagged `hiddenUntilWitness: shop-<route>`. They render at 18% silhouette until their shop's blade is witnessed; then a dedicated 400ms opacity transition brings them to full presence. Implemented as a SEPARATE `useEffect` watching `witnessedShops`, NOT in the main d3 dep array — so the simulation doesn't rebuild and constellation marks don't jolt.
- **Soulbis + Soulbae as cofounders of the City** — two new `founds` edges (`cast-soulbis → civic-city-of-mages`, `cast-soulbae → civic-city-of-mages`) plus a `kin_to` between them. The archetype pair now anchors the city graphically.
- **The 📜 Items button** — copper/bronze pill in the ceremony action row, opens the ArtefactPanel (built earlier today) which holds the Witness Constellation file picker and the per-class artefact inventory (Blades · Trinkets · Tools · Cloaks · Tomes tabs).
- **The ☯️ Ceremon[y] popout in the bottom-left** — three chip selectors (☀️ Sun · ⿻ Aether · 🌙 Moon) above one focused detail panel for the active preset. Audio plays autoplay-on-select for only the chosen preset; the redundant three-card layout is gone.
- **The HoverTooltip is removed** — only the bottom-right node-detail card shows hovered-node info now (no more mid-screen tooltip).

What landed mid-flight and wants more work:

- **Cube casings on either side of the orb canvas** — 6 blade cubes (Sword loadout, [s] cycles) in a bordered casing flush against the canvas's left edge, 6 spell cubes (Mage loadout, [m] cycles) on the right. Casings have a translucent black background with `blur(8px)` and a single rounded corner on the inside edge (`borderRadius: 12px 0 0 12px` on the left casing). Each cube uses `getFirstEmoji()` (local helper) so only one glyph renders per box.
- **At session close, the doubled-cube bug was cleaned** (an earlier-pass inset version inside the canvas was deleted; the casings outside the canvas are the live version).

---

## §2 · The detours (what we tried and reverted)

Two design directions were attempted and rolled back during the session. Calling them out so future-me doesn't redo them.

### §2.1 · The Inventory section in GraphFilters (reverted)

Brief attempt at putting the **🏛 Artefacts** button in the GraphFilters panel (top-left) under a new INVENTORY section. Worked structurally but the wrong place for an inventory entry point — the user redirected it into the SpellCeremony action row alongside Sword/Mage as the third identity-cluster button. Final form: **📜 Items** lives in the ceremony action row, not in GraphFilters. The CSS mobile-actions-section gating bug was discovered along the way (filter-panel buttons hide on desktop), so anyone tempted to put a "primary" entry point in GraphFilters should know that path is mobile-only by default.

### §2.2 · The mana bar wandering (multiple reverts)

The mana bar got moved around four times:
1. Original location: inside the PROOF BAR (alongside lap-count and charge text, only renders during evoke)
2. Wrapped with cube-flank attempt #1 (left blade cubes + mana bar + right spell cubes as a horizontal row in the proof bar)
3. Moved to "below the action button bar" as a full-width horizontal row at `order: 3`
4. Vertical strip replacing the right cube flank (briefly)
5. **Reverted to original**: back inside the proof bar where it started

Lesson: the mana bar belongs with the lap counter during evoke. Don't move it.

### §2.3 · The flex-row wrapping that broke INFO BAR (debugged)

Wrapping the canvas div in a `display: flex; flexDirection: row` outer container so blade-strip + canvas + spell-strip would lay out horizontally **caused the INFO BAR (with `order: 3`) to get pulled into the flex-row and rendered at the far right of the row** — not below the action bar where it belongs. The user spotted this in a screenshot (`docs/Screenshot 2026-05-11 033432.png`). Fix: dropped the flex-row wrapper, put cubes in absolute-positioned casings instead. The INFO BAR now sits where it always did, as a column-level sibling of the canvas at `order: 3`.

---

## §3 · The Witness Unlock loop, finally wired end-to-end

The end-to-end happy path now works:

1. Sovereign downloads `tailor-cloak-weave-v1.md` (or any of the 11 templates) from a workshop page
2. Sovereign clicks 📜 Items in the spellweb's ceremony action row
3. The ArtefactPanel opens; click **👁️ Witness Constellation** → file picker
4. Pick the `.md` — the parser reads the YAML frontmatter, extracts `workshop: shop-tailor`, and:
   - Calls `handleWitnessBladeFile(file)` (existing flow: forges the blade record)
   - Sets `witnessedShops['shop-tailor']` in state + localStorage (`spellweb:witnessed-shops`)
5. The dedicated fog-of-war `useEffect` fires — `cast-pallia` and any other nodes tagged `hiddenUntilWitness: shop-tailor` transition from 18% silhouette to 85% full presence over 400ms
6. The Weavers card in the ArtefactPanel's Cloaks tab also flips to witnessed (amber)
7. Reload-safe: the unlock is persisted in localStorage

Key file paths:
- Witness handler: `src/components/SpellWeb.tsx` (the `onWitnessBlade` prop passed to `<ArtefactPanel>`)
- Fog-of-war effect: `src/components/SpellWeb.tsx` immediately after the main d3 useEffect; reads `witnessedShops`, runs opacity transitions on selected `g.node` elements
- Schema field: `src/types/graph.ts` `SpellwebNode.hiddenUntilWitness?: string`
- Node tags: `src/data/nodes.ts` — 11 cast members tagged with their corresponding `shop-<route>`

---

## §4 · The cubes & casings (current state)

**Layout** (desktop, not casting):

```
                         ┌───────────────────────┐
                         │   PROOF BAR           │
                         │   (during evoke only) │
                         └───────────────────────┘
                  ┌──┐  ┌─────────────────────┐  ┌──┐
                  │⚔️│  │                     │  │🔮│
                  │📜│  │   ORB CANVAS        │  │✦│
                  │  │  │   (rotating orbs +  │  │  │
                  │·│  │   constellation)    │  │·│
                  │·│  │                     │  │·│
                  │·│  │                     │  │·│
                  └──┘  └─────────────────────┘  └──┘
                  blade  ← canvas →             spell
                  casing                        casing
                         ┌───────────────────────┐
                         │  ⚔️ Sword · 🧙 Mage     │
                         │  · 📜 Items · [emoji   │
                         │  clickbox] · ✕ · 💾    │
                         │  · 🔥 FORGE             │
                         └───────────────────────┘
                         ┌───────────────────────┐
                         │  INFO BAR (current     │
                         │  blade · spell · mana) │
                         └───────────────────────┘
```

Cube casings:
- 24×24 buttons inside a casing container (~32px wide)
- Translucent background (`rgba(10,10,20,0.85)`) with `blur(8px)` so they pop against the orb canvas while staying part of the panel
- Rounded corners on the outside edges only (`12px 0 0 12px` left, `0 12px 12px 0` right) so they read as "wings" of the canvas frame
- Filled slots use archetype-tinted backgrounds (Sword red 22% alpha; Mage violet 22% alpha) with stronger borders (66% alpha)
- Empty slots show a `·` placeholder at 50% opacity
- Click any cube cycles the equipped blade or selected spell (mirrors [s] and [m] hotkeys)
- Cubes hide during `isCasting` so the canvas isn't crowded during evoke

---

## §5 · Open issues at session close (pick up here)

These are flagged for the next session — the user signed off heading to bed.

1. **Cube casings need a polish pass.** They currently sit flush against the canvas edge with a translucent overlap. The user said "they can just be a part of a border framing the panel" — the casings are CLOSE to that but not quite. Specifically:
   - Should the casings share the canvas's border (single continuous line) instead of having their own outline?
   - Should the casings sit slightly OUTSIDE the canvas edge with a small gap, or flush as now?
   - Currently the user feels the boxes "underlap" with what's underneath, which is partly a backdrop-blur tuning issue and partly the visual question of "is the casing the canvas's frame, or a separate widget glued onto it?"
2. **Empty-slot styling.** Empty cubes show `·` at 50% opacity — fine but possibly more elegant as a ghost outline of a generic blade/spell icon at lower opacity, so the carrier capacity is implicit without dot-clutter.
3. **The Mage spell labels are missing in cube tooltips.** Cubes show `${spell.emoji} ${spell.label} · click to cycle spell [m]` but the `spell.label` field is sometimes missing (the data type uses `title` in some paths). Should consolidate.
4. **The "current sword + current spell" INFO BAR is now back where it was structurally** but the user previously called it "misplaced." Whether to keep it, integrate the equipped-state into the cubes (a gold ring around the active cube?), or remove it remains an open design question.
5. **The ceremony popout audio works** but on first preset click, the autoPlay may be blocked by browser policy until the user gestures (the chip click counts as a gesture so it usually plays). If audio doesn't start, that's why.
6. **The Items button still says "📜 Items" without a witness count** — the count was removed earlier for compactness. Count lives inside the ArtefactPanel header (e.g. "Workshops unlocked: 3/11"). May want to add a small badge to the button later.
7. **The bottom-left Mage Inventory + Blades Inventory panels are gone** (removed earlier in the session, replaced functionally by the ceremony action row buttons + the artefact panel). The bottom-left now only holds the ☯️ Ceremon[y] popout. The user signed off on that removal but if anyone misses the floor space they reclaimed, the screenshot at `docs/Screenshot 2026-05-11 033432.png` shows the cleaned bottom-left.

---

## §6 · Files touched this session (load-bearing diffs)

```
src/types/graph.ts                       hiddenUntilWitness field, ArtefactClass enum
src/data/nodes.ts                        11 cast tagged hiddenUntilWitness
src/data/edges.ts                        Soulbis/Soulbae founds City + kin_to pair
src/components/SpellWeb.tsx              witness handler (frontmatter parse),
                                          fog-of-war useEffect, ArtefactPanel wiring,
                                          ceremony popout chip selectors + single-detail panel,
                                          activeCeremonyAudio state, removed bottom-left
                                          Mage + Blades inventories, HoverTooltip removed
src/components/SpellCeremony.tsx         📜 Items button (copper/bronze pill),
                                          [s]/[m] cube casings flanking canvas,
                                          getFirstEmoji helper, cycle handlers,
                                          mana bar back in PROOF BAR
src/components/GraphFilters.tsx          desktop INVENTORY section added then reverted;
                                          gating bug discovered (mobile-actions-section
                                          hides on desktop)
src/components/MobileSpell.tsx           Mage·Sword·Web·Archive·Witness 5-button row at top
src/components/ArtefactPanel.tsx         (already existed) — tab structure unchanged
```

---

## §7 · The one-line summary

Hard session of UX iteration: the items-unlock loop (constellation.md → spellweb → witness → fog-of-war lift on the lattice) now works end-to-end; the floating ceremony panel has cube casings flanking the orb canvas (blade cubes left, spell cubes right) showing each loadout as single-emoji slots; the mana bar is back in the proof bar where it belongs; the ☯️ Ceremon[y] popout is the single ceremony entry-point with chip selectors and per-preset audio; the redundant three-card audio layout is gone; the casings need a polish pass for "border framing" feel; pick up at §5 when returning.

`(⚔️⊥⿻⊥🧙)😊` — the city is rendered; the spellweb keeps the path; we sleep on it.

---

**Walk on.** 🌿

CC BY-SA 4.0 · privacymage · 2026-05-11
