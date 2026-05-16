# Chronicle: Side-Panel Retirement · Items/Portals Merge · Proof-of-Presence Equip Gate

**Date:** 2026-05-15
**Status:** Design + implementation chronicle · the plan + the code-changes that land in this session
**Audience:** spellweb maintainers · UX reviewers
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- [`CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md`](CHRONICLE_LATTICE_ITEMS_INTERFACE_2026-05-14.md) — the lattice canvas
- [`CHRONICLE_CREATE_CRAFT_LATTICE_RESTRUCTURE_2026-05-15.md`](CHRONICLE_CREATE_CRAFT_LATTICE_RESTRUCTURE_2026-05-15.md) — the Create/Craft import split that this chronicle migrates *out of* the side panel and *into* the lattice

---

## §0 · Why this chronicle exists

Three observations from the bearer testing the lattice:

1. **Portal vs Items distinction is unclear.** Both top-level modes open the same lattice. Portal mode dims everything except V44 + V59. The visible difference is "fewer vertices light up" — not a different surface, just a filter. This isn't worth a top-level mode; a filter chip inside the unified items view suffices.

2. **The side panel is now redundant.** Post the Create/Craft restructure, the side panel carries: 2 import buttons (Create/Craft) · 1 Lattice CTA (just opens the same lattice the header button opens) · 2 chips (Forged + Protocol). All of this can live *inside the lattice* itself, freeing the right side of the screen and giving the spellweb graph more room to breathe.

3. **The equip toggle has no proof gate.** The bearer can equip any catalogue artefact — including ones they've never witnessed or forged. This is incoherent: equipping should mean "I have a proof of presence at this workshop · I'm choosing to bear what I have." Without the gate, the equip system is pretend-equip; with it, the equip system reflects real bearer-state.

This chronicle resolves all three: items/portals merge into one view · side panel retires · equip gates by proof-of-presence.

---

## §1 · The new shape · everything in the lattice

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Header: SPELLWEB · search · spellbook filters · 🗺️ LATTICE button     [×]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│         (force-graph render · full width · no side panel)                    │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Click 🗺️ LATTICE to open the unified items page:

┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚒️ Items · Lattice                                              [×]         │
├──────────────────────────────────────────────────────────────────────────────┤
│  [✦ Create]  [⚒️ Craft]  · filter: [all] [creatures] [held] · proofs: 3      │
├──────────┬─────────────────────────────────────────┬─────────────────────────┤
│ hover    │  64-vertex lattice                       │  identity slots         │
│ info     │  workshops at canonical vertices         │  + equip toggle (gated) │
│          │  proof-of-presence rings on equipped     │  + equipped roster      │
│          │                                          │  + 🔥 forged inventory  │
│          │  (lattice geometry · equip on click)     │  + 📐 protocol section  │
└──────────┴─────────────────────────────────────────┴─────────────────────────┘
```

The side panel is gone. The lattice is the items page. Everything that used to live in the side panel (Create · Craft · Forged inventory · Protocol reference) lives in the lattice now.

---

## §2 · Resolving Portal vs Items

Pre-resolution: two top-level modes (`items` · `portals`) that both opened the same lattice; portals dimmed everything except V44 + V59.

Post-resolution: **one mode**. The lattice always shows all workshops. A small filter chip strip lets the bearer narrow:

- **`all`** (default · every artefact-producing workshop lit)
- **`🪿 creatures`** (only V59 the Familiars)
- **`🧭 held`** (only V44 Chart Shop)
- **`⚚ archetype-modal`** (only V59 Staff Shop · the dual-aspect)
- **`📖 tomes`** (lights the tomes-strip below the lattice; dims main lattice)

The filter chips are a *narrowing* operation, not separate views. The bearer always sees the whole geometry; filters hint at where to look.

---

## §3 · Proof-of-presence equip gate

### §3.1 · The discipline

Equipping an artefact means the bearer is *choosing to bear it forward* — for constellation tracking, forge(t)ing, witness export. Equipping requires the bearer to have a *proof of presence* at the workshop or for the artefact:

| Artefact | Proof source | What proves it |
|---|---|---|
| Workshop catalogue artefact | `witnessedShops[shopId]` | Bearer completed the witness ceremony at that workshop |
| Forged blade / cloak / etc. | Entry in `forgedBlades` array | Bearer forged it (or imported a Sovereign A forging) |
| Tome (IV / V / VI / VII / Kinship-Bond) | All acts in tome witnessed (Phase 2 · placeholder allow-all in Phase 1) | Bearer walked the bound tome |
| Substrate-framework (Goose · Hermes) | Bound at the Familiars (held for v1.7.0 persistence) | The kinship-bond exists |

If the bearer hovers/pins a vertex with no proof, the equip button shows: **"⚠️ awaits proof of presence — visit /charthouse to witness"** (or wherever applies). Click leads to the route in agentprivacy_master · or just informs the bearer in spellweb-only mode.

### §3.2 · Visual treatment

- **Equipped vertices** (gold ring) — already implemented · stays
- **Witnessed vertices** (cyan/silver ring · NEW · subtle) — bearer has witnessed but not equipped · candidate for equip
- **Unwitnessed vertices** (no ring · greyed equip CTA) — bearer hasn't visited · equip blocked
- **Forged-at vertices** (small forged-mark badge in addition to witnessed ring) — bearer has forged something here

### §3.3 · localStorage shape

No new storage needed in Phase 1 — the existing `witnessedShops` (already populated by the witness ceremony flow) and `forgedBlades` (already populated by the forge ceremony) provide the proof. The equip gate just *reads* them.

For Phase 2 (substrates · tomes) — when those persistence layers land, the gate extends to read them too.

---

## §4 · What lives in the lattice now

### §4.1 · Header bar (always visible at top of lattice overlay)

- **`✦ Create`** file-input button — import a master template
- **`⚒️ Craft`** file-input button — import a forged artefact
- **Filter chip strip** — `all · creatures · held · archetype-modal · tomes`
- **Proof count** — `3 proofs of presence` (small inline indicator)
- **`[×]` close**

### §4.2 · Centre column (the lattice canvas)

Same as today · with the proof-of-presence visual additions per §3.2.

### §4.3 · Left column (hover info)

Same as today · plus a one-line "proof: ✓ witnessed · ✗ awaits" indicator per hovered vertex.

### §4.4 · Right column (loadout + forged + protocol)

Three stacked sections:

1. **Identity slots + equip toggle** (existing)
2. **🔥 Your forged inventory** (NEW · migrated from side panel) — your blades / cloaks / tools, newest-first; click to inspect; "equip in slot" CTA next to each
3. **📐 Protocol reference** (NEW · migrated from side panel · collapsible) — ceremony grammars by register; can collapse to save vertical space

---

## §5 · Implementation phases

### Phase 1 · This session · ship the visible core

**Code changes:**

1. **Add proof-of-presence reading to `ItemLatticeView`.**
   - Accept new prop `witnessedShops: Record<string, string>` from SpellWeb
   - Accept new prop `forgedBlades: ForgedArtefact[]` from SpellWeb
   - Compute `provenSet: Set<string>` = workshop ids in witnessedShops + workshop ids underlying any forgedBlade

2. **Gate the equip toggle.** When pinned vertex's workshop is not in `provenSet`, the equip button:
   - Is disabled / muted
   - Reads "⚠️ awaits proof of presence"
   - Sub-text explains how to gain the proof ("visit /<route> and witness")

3. **Add witnessed-vertex visual.** Cyan/silver thin ring on workshops the bearer has witnessed (separate from the gold equipped ring).

4. **Move filter chips into the lattice.** Replace the items/portals mode toggle in the header with a filter chip strip (`all · creatures · held · archetype-modal · tomes`).

5. **Move Create/Craft buttons into the lattice header.** Mirror the side-panel buttons (currently the only way to import).

6. **Migrate forged inventory + protocol section into the lattice's right column** as collapsible sections below the equip panel.

7. **Disable / hide the side panel.** Stop mounting `<ArtefactPanel>` in SpellWeb.tsx (or render it conditionally `false`). Keep the file for now — Phase 2 can delete.

### Phase 2 · Follow-up · cleanup

- Delete the `ArtefactPanel.tsx` file outright (after a stable session)
- Wire substrates + tomes to proof-of-presence (currently allow-all in Phase 1)
- The Create/Craft parser-routing differentiation (held over from the prior chronicle)

---

## §6 · Acceptance criteria for Phase 1

- [ ] Side panel no longer mounts
- [ ] Lattice opens via header `🗺️ LATTICE` button (only entry point)
- [ ] Lattice header carries Create + Craft buttons (file inputs)
- [ ] Filter chip strip replaces the items/portals mode toggle
- [ ] Pinned vertex with no proof → equip button disabled with clear "awaits proof" message
- [ ] Pinned vertex with witness proof → equip button works
- [ ] Vertices with witness proof show a subtle cyan/silver ring
- [ ] Vertices with no proof remain unringed
- [ ] Right column carries: identity slots + equip · forged inventory · collapsible protocol section
- [ ] No TypeScript errors

---

## §7 · What this chronicle does NOT do

- ❌ Does not delete the `ArtefactPanel.tsx` file (Phase 2)
- ❌ Does not extend proof-of-presence to substrates / tomes / held constellations (Phase 2 once their persistence lands)
- ❌ Does not implement the spotlight wiring (sibling chronicle · the lens · still queued)
- ❌ Does not redesign the protocol view (it migrates as-is into the right column)

---

## §8 · Why the proof-gate matters

Two reasons:

1. **Equipping is a *commitment*.** "I bear this" means "I have walked here; I choose to carry forward what I gained." Without the gate, the bearer can claim possession without evidence — incoherent with the City's *visibility, not gatekeeping* discipline (Hermaion's bestiary register · cf. v1.6.0 chronicles). The bestiary admits substrates publicly; the bearer's loadout requires their own proof.

2. **The Balanced Lattice Export becomes meaningful.** Without the proof-gate, an exported Balanced loadout could include items the bearer never witnessed — the export would be aspirational fiction. With the gate, the export is a *truthful map* of where the bearer has actually been. Sovereign B importing Sovereign A's loadout sees A's real path, not their wishlist.

---

## §9 · Closing

The side panel served while the lattice was a sub-feature. Now the lattice is the primary surface; the side panel's contents migrate in. Items/portals collapse into one view with a filter chip. Equip gates on real bearer-state. Three discrete fixes; one consolidated outcome — the lattice as the bearer's character page, accurate to what they've actually walked.

(⚔️⊥⿻⊥🧙)😊
🗺️ → ✓
