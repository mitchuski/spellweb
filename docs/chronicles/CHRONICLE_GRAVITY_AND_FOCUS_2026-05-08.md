# Chronicle: Gravity Web & Desktop Focus — A Shared Mechanic Across Surfaces

**Date:** 2026-05-08
**Session:** Mobile tuning continued, then desktop synergy pass
**Status:** Both surfaces build clean; visual QA pending
**Author:** Claude (Opus 4.7) × Mitchell Travers

Companion to: `CHRONICLE_MOBILE_SHELL_2026-05-08.md` (earlier same day)

---

## The Ask

After the morning's mobile-shell ship, the question turned from *what does mobile contain* to *what does mobile do that the desktop doesn't, and vice versa*. The hub-row added a fourth button. The fourth button became a new mechanic. The new mechanic asked to be reflected on the desktop.

> "i want to also add a button which is 'focus' that does what happens"
> "i think its a 4th option, so the web button is actually archive and web shows the spellweb nodes on just a single no interface only web screen, allowing you to press to cause gravity or exit thats it — therefore changing the shape of the constellations on the other buttons"
> "i think some of these changes in the buttons should be reflected on the desktop version"
> "the focus could start an orbit of gravity maybe?"

Two halves of one idea: **gravity** as a primitive that reshapes the spellweb. Manual on mobile (you press), ambient on desktop (it orbits).

---

## What Shipped

### Mobile — Web becomes a verb

**Hub-row split into four** (`MobileSpell.tsx:387–402`):

```
🧙 Mage  ·  ⚔️ Sword  ·  ◆ Web  ·  📚 Archive
```

- The **old** "◆ Web" (categorized read-only NODES list, bottom-sheet detail) was renamed **📚 Archive**. Same content; the surface kept its place in the codebase but lost its top billing.
- The **new** "◆ Web" is a chromeless, full-viewport force graph — its only affordances are *press a node* and *swipe down to exit*.

**WebScreen — the immersive surface** (`MobileSpell.tsx:1075–1330`):

- All `NODES` laid out via Fibonacci spiral, then a d3-force simulation (charge −90, collision r=16, gentle center pull) settles them in real time.
- Press within ~50 px of a node → that node is pinned to the finger; everything else is pushed/pulled by the simulation.
- Release leaves the node where you put it. Pinned nodes are also added to a `touchedRef` set — *only touched nodes contribute to the gravity field on exit*. Doing nothing in Web → exit → constellations unchanged. Drag three nodes → those three move on the preset Lissajous.
- Edge-swipe-down from the top 56 px exits and commits the field.
- Render is canvas-backed at devicePixelRatio. Touched nodes draw at r=9 with a halo glow; untouched at r=6.

**Gravity field → preset constellations** (`MobileSpell.tsx:130–172`):

`layoutCircuit(preset, w, h, gravityField?)` — for any preset mark whose `nodeId` is in the field, the Lissajous position is replaced by the warped position (normalized to ±1 from canvas center, then scaled to the ceremony viewport). Untouched marks fall back to the deterministic Lissajous. The constellation traversal you trace during the ceremony is now partly the user's hand-placement.

**Persistence:** none. In-memory `useState<GravityField | null>` on the `MobileSpell` root. Refresh = reset. The picker shows a faint `Web ·` marker when the field is active so the user knows the warp is alive.

### Desktop — Sword by name, Focus by key

**Naming sync** (`SpellWeb.tsx:4968`):

`⚔️ Blades` modal title → `⚔️ Sword`. Mobile and desktop now share the top-level label. Internal section headings (`ALL BLADES`, `WITNESS BLADES`) stayed — they describe inventory contents, not the surface.

**Focus mode — `F` key** (`SpellWeb.tsx:170, 367–375, 383–423, 1735–1749, 2478–2503, 2526, 2677, 4435, 6438–6462`):

- A new top-level boolean `isFocusMode`. While true, five chrome elements are unmounted: `Header`, `GraphFilters`, `Legend`, the left-sidebar Mage + Sword inventories IIFE, and `NodeInspector`. The force graph and its overlay constellation/orbs/effects layers stay.
- A floating pill at the bottom: `◆ focus · gravity orbiting · [F] or [Esc] to exit`.
- `F` toggles. `Esc` always exits (alongside its existing modal-close duties).

**Gravity orbit** (`SpellWeb.tsx:383–423`):

- A `requestAnimationFrame` loop runs *only* while focus mode is on.
- An invisible attractor traces a 3:2 Lissajous around the canvas — the **same Lissajous family** as the mobile preset layout. Period: 16 s. Radii: 28 % of viewport.
- Each frame, every unpinned simulation node receives a `0.45 × dx/dist` nudge toward the attractor's current position. The simulation's `alpha` is held at ≥ 0.08 so it keeps ticking.
- Pinned nodes (user-dragged) are skipped — the user's choices outweigh ambient gravity.

The desktop graph breathes. Slowly. The shape of the spellweb is no longer static while you sit with it.

---

## Architecture Decisions Locked

- **Gravity is the shared primitive across surfaces.** Mobile gravity is intentional and discrete (you place specific nodes). Desktop gravity is ambient and continuous (it travels). Same physics intuition, different agency.
- **In-memory only, on both surfaces.** No `localStorage` for the warp; no persistence for the orbit's state. The mechanic is meditative, not configurational. Refresh resets everything.
- **Naming follows the more evocative noun.** "Sword" carries identity weight that "Blades" doesn't. We renamed desktop to match, not the other way around.
- **No hub-row on desktop.** The left sidebar + M/S/Y/F keyboard shortcuts already are the hub. Adding a row would have been redundant chrome.
- **Archive is *not* gated by Focus.** Archive is a different need (inventory lookup) from Web (immersive warp). Splitting them was the whole point of renaming.
- **Touched-only gravity.** A node only contributes to the field if the user explicitly dragged it. The simulation's natural settling is *not* captured. This keeps "open Web, look around, exit" from silently warping the next ceremony.

---

## Build Status

- Type check: clean (both files)
- Production build: 688 KB → 693 KB → 694 KB across the session
  - +5 KB for mobile WebScreen + d3 force-graph wiring
  - +1 KB for desktop Focus mode + gravity orbit
- The preexisting D3 chunk-size warning is unchanged
- Dev server has been running since the start of the session; HMR carried both branches without a manual restart
- **Visual QA: not done.** Same caveat as the morning chronicle. The orbit cadence, the warp magnitude, and the swipe-down threshold all want eyeballs on a phone and a 27" monitor.

---

## What to Verify Next Session

**Mobile Web**
1. Drag a node — does the rest of the graph respond visibly, or does it just sit there? (Charge −90 may be too gentle.)
2. Swipe-down exit — does the 56 px top zone feel discoverable, or does the user end up dragging nodes near the top accidentally?
3. Bottom hint update — does the "N nodes placed · constellations will warp" feedback land, or is it lost in the periphery?
4. Round-trip — drag two nodes in Web → exit → tap Sun → does the constellation Lissajous *visibly* warp at those two marks, or is the effect invisible because preset marks rarely match the dragged nodeIds?

**Desktop Focus**
5. F key — does focus engage cleanly, or do residual modals (forge, runecraft) survive and look wrong on the chromeless backdrop?
6. Orbit feel — 16 s period and 0.45 pull strength: too fast, too slow, too aggressive, too subtle?
7. Pinned-node interaction — drag a node manually while focus is on. Does it stay where you drop it, or does the orbit yank it?
8. Esc behavior — Esc both closes modals and exits focus. Does the joint behavior feel right, or do users want them separated?

**Cross-surface**
9. The mobile gravity field is in-memory only and doesn't reach desktop. After living with both for a few sessions, decide whether `localStorage` persistence + cross-surface sync is wanted. Currently *deliberately not done*, per the morning's call.

---

## Files Touched

```
MOD   src/components/MobileSpell.tsx     (+~290 lines: WebScreen, gravity field plumbing,
                                           4-button hub, Mode 'archive', NODE_COLOR_BY_TYPE)
MOD   src/components/SpellWeb.tsx        (+~60 lines: isFocusMode state, F-key handler,
                                           gravity-orbit RAF loop, 5 chrome conditional wraps,
                                           focus-exit pill, ⚔️ Blades → ⚔️ Sword title)
NEW   docs/chronicles/CHRONICLE_GRAVITY_AND_FOCUS_2026-05-08.md   (this file)
```

Bundle delta: 688 KB → 694 KB (+6 KB / +0.9 %).

A note on commit state: the morning chronicle said "Shipped to main." `git status` at session start showed otherwise — the mobile-shell work was untracked. This session's edits are also uncommitted. The chronicles claim a state the working tree hasn't yet ratified. Worth a sync pass before the next chronicle.

---

## Carry-Forward — Open Threads

In rough priority:

1. **Warp visibility** — confirm the gravity field actually changes constellation Lissajous in a way the user perceives. If preset marks rarely overlap with dragged nodes, the warp is silent. May need to expand the matching (nearest-by-id, or apply a global skew derived from the field's centroid).
2. **Cast feedback** — still on the morning chronicle's list. Tapping Cast updates a counter and nothing else.
3. **Witness import round-trip** — desktop exports a `.md`, mobile imports, traces, forges. Untested.
4. **Focus orbit tuning** — 16 s and 0.45 are guesses. Probably want a config knob or two.
5. **Pinned-node persistence in Focus** — currently a manually-dragged node stays where you put it during one focus session, but if you exit and re-enter, the simulation has been running — its position has drifted. Consider whether "pinned in focus" should mean "pinned across focus sessions."
6. **Archive search** — when the spell list grows, the categorized list will need filtering. Carried over from the morning chronicle.
7. **Generative blade PNG with embedded markdown** — still deferred, still in the parking lot (`CHRONICLE_GENERATIVE_BLADE_ART_2026-05-07.md`).

---

## The Unifying Frame

The morning's chronicle ended on the line: *"the desktop would look like this if it had been designed phone-first."* This session inverted that. Phone-first introduced gravity; desktop accepted it and made it ambient. The two surfaces now share a primitive that neither had four hours ago.

Mobile gives the user *agency* over the spellweb's shape. Desktop shows the user the spellweb is *already shaped* — by something orbiting, that they can stop watching and exit at any time. Both are correct. They are correct for different reasons.

*⚔️ ⊥ 🧙 | 😊 — Privacy is Value*
*🌌 → ◆ → ✦*
