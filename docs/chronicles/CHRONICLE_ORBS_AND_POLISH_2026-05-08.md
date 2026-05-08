# Chronicle: Orbs Land, Cast Lands, Focus Lands — A Tuning Pass

**Date:** 2026-05-08
**Session:** Iterative polish on top of the morning's mobile shell + afternoon's gravity/focus pair
**Status:** Both surfaces build clean (697 KB); visual QA validated by user as "okay this is good"
**Author:** Claude (Opus 4.7) × Mitchell Travers

Companion to:
- `CHRONICLE_MOBILE_SHELL_2026-05-08.md` (the morning ship)
- `CHRONICLE_GRAVITY_AND_FOCUS_2026-05-08.md` (the afternoon synergy pass)

---

## The Ask

After the gravity/focus pair landed, the user opened the running build and hit a sequence of friction points — each one obvious in retrospect, none obvious from the code alone:

> "the edges arnt loaded so the web just doesnt work on mobile"
> "i think the focus button isnt works?"
> "the [f] focus should also be a button on the panel"
> "the cast interaction on mobile doesnt show the emoji"
> "the forge flow needs to have that step that does the blade tracing animation"
> "the orbs need to follow the same split and mirror around the pattern as on the desktop version"
> "the gravity orbiting popup is overlapping with the ceremony panel"

Most of these traced to a single root cause that nobody saw until the orbs symptom surfaced: `WanderingOrbs` was rendering at the wrong position on mobile.

---

## The Quiet Bug

`WanderingOrbs.tsx` had been written for the desktop layout, where the SpellWeb root is a `100vw × 100vh` `position: relative` div and the orbs canvas covers the full viewport via `position: fixed; top: 0; left: 0`. Mobile inherited the component but mounted it inside a smaller, nested `position: relative` container — meaning:

- The constellation marks were laid out at coordinates (e.g. `x: 280, y: 140`) **relative to the local orbs container**.
- The canvas drew them at coordinates **relative to the viewport**.
- Result on mobile: the orbs traced an invisible pattern at the top of the viewport, behind the page header. The split / mirror was happening — it just wasn't where the user could see it.

The same bug masked the cast emoji sprites, because the canvas (z-index 50) was painting itself over them with the wrong content, and the sprites had no explicit z-index to push past it.

The fix was one line:

```diff
- position: 'fixed',
- top: 0,
- left: 0,
+ position: 'absolute',
+ inset: 0,
```

`absolute` anchors to the nearest positioned ancestor — which is the SpellWeb root on desktop (still full-viewport behavior) and the local orbs container on mobile (now correct). Bumping cast-sprite z-index to 60 then made the sprites appear above the now-correctly-placed orbs canvas.

The orbs *had* been mirroring all along (`WanderingOrbs.tsx:273–277`). The tracing logic was correct. We were just looking at the wrong patch of pixels.

---

## What Shipped

### Mobile Web — actually a graph

`WebScreen` now renders edges, not just nodes (`MobileSpell.tsx`):

- Imported `EDGES`, added `WebSimEdge` type, filtered edges to ones whose endpoints both exist in `NODES`.
- d3 simulation gained `forceLink` (distance 60, strength 0.4); `forceManyBody` charge bumped −90 → −110 to give the link force room to act.
- `draw()` strokes edges in `rgba(200,200,216,0.18)` at 0.6 px width *before* the nodes so they sit underneath.
- `<WanderingOrbs>` overlaid in a `position: absolute, inset: 0, pointerEvents: none` wrapper so the soul orbs drift across the graph without intercepting drag.

### Mobile cast — emoji sprites

Each tap of Cast picks the next mark in the constellation circuit and projects its emoji at that node's position (`MobileSpell.tsx:614–623, 643–664`):

- `castSeqRef` cycles `circuit[castSeqRef.current % circuit.length]` — so consecutive taps walk the path.
- Sprite emoji = mark.emoji ?? preset.emoji ?? `'✨'`.
- Animated via a `mobileCastSprite` keyframe (1.5 s ease-out): fade in, scale to 1.15, drift up `−100%`, fade out. Removed from state via `setTimeout`.
- z-index 60 (above the orbs canvas at 50) — without this, the sprites would have been painted over.

### Mobile forge — a deliberate trace

`handleForge` now enforces a minimum visible trace duration (`MobileSpell.tsx:741–753`):

- Proof computation runs first (the cryptographic work).
- If the elapsed time is under `MIN_TRACE_MS = 2600`, an `await setTimeout` holds the screen so the orbs visibly trace before the forge screen appears.
- Two overlays bloom inside the orbs container during `forging`:
  - Radial gold-glow gradient (`mobileForgeGlow`, 2.6 s ease-in-out, 0 → 1 → 0.4)
  - "forging…" small-caps label at the bottom, letter-spacing widens as it pulses (`mobileForgeLabel`)
- The orbs themselves keep tracing the constellation throughout — the trace *is* the blade animation; the overlays just frame it.

### Desktop Focus — moved into the header

The F-key handler had been correct from yesterday. The "Focus doesn't work" complaint was actually about discoverability: there was no visible button.

- New props on `Header`: `isFocusMode`, `onToggleFocus` (`Header.tsx:13–25`).
- New button next to `SHARE` in the desktop header bar — same pill styling, gold accent when active, label flips between `◆ FOCUS [F]` and `◆ EXIT FOCUS` (`Header.tsx:355–390`).
- The floating bottom-right `[F] focus` button I'd added in the previous session was removed — header placement is the canonical home.
- F key still works, Esc still works, the button is now the third entry point.

### Desktop focus widget — three drafts in one round

The focus-mode bottom-center widget went through three revisions in this session:

1. **Standalone gravity-orbiting pill.** Had been at `bottom: 16`. Overlapped the `SpellCeremony` minimized button which lives at `bottom: 30` with ~38 px height.
2. **Unified pill + compressed ceremony bar.** I extracted a `loadCeremonyPreset(index)` callback and built a slim horizontal row of `☯️ ☀️ 🌙 ⿻` buttons under the focus pill, with a `focusPanelDrop` keyframe animation. The intent was right ("the ceremony panel drops down and compresses, and then above it the popup is showing") — the implementation was redundant. `SpellCeremony` already provides the same ceremony controls in its minimized state.
3. **Slim pill above the SpellCeremony button.** The chosen final form. Pill at `bottom: 80` (above SpellCeremony's button top edge ≈ bottom 68), simplified copy `◆ focus · [F] or [Esc] to exit`. The `loadCeremonyPreset` callback was removed — unused once the bar was deleted.

Final desktop layout when focus engages:

```
        ◆ focus · [F] or [Esc] to exit          ← bottom: 80
   ┌────────────────────────────────┐
   │  ⚔️  Ceremony  ✦  ▲           │            ← SpellCeremony (already lived here)
   └────────────────────────────────┘
```

---

## Architecture Decisions Locked

- **`position: absolute, inset: 0` is the canonical pattern for orb canvases.** Anchors to the nearest positioned ancestor, works for both surfaces. The `position: fixed` pattern is reserved for components that explicitly want viewport positioning regardless of where they're mounted.
- **The cast emoji sequence walks the constellation circuit, not the user's tap location.** Each cast = next mark. This makes Cast feel like progressing through the ceremony rather than a generic "fire spell" button.
- **Forge animation is enforced by a min-duration on the existing tracing path, not a new animation pipeline.** The orbs were already drawing the cut lines; we just hold the visual long enough for the user to see it.
- **The header is the canonical home for surface-toggle controls.** Floating pills are reserved for in-mode hints (the focus exit indicator) and discoverability fallbacks (now removed).
- **`SpellCeremony` is the source of truth for ceremony controls on desktop, in any mode.** No parallel ceremony surfaces. The focus widget is purely an indicator + exit affordance, not a control panel.

---

## What Didn't Ship (And Why)

- **Compressed ceremony bar in focus mode.** Built and removed in the same session. Functionally redundant with the existing `SpellCeremony` minimized button. The `loadCeremonyPreset(index)` `useCallback` extraction was deleted along with it. The extraction itself is still a good idea (the inline preset-loading code is duplicated 3× in the sidebar IIFE and 3× more in the `SpellCeremony` parent props) — but should be a separate refactor with no UI side effect, not bundled with a rejected widget.
- **Persisting gravity field across surfaces.** Mobile's gravity field is still in-memory only, per the original call. Desktop's gravity orbit doesn't write anywhere. Keeping these isolated until there's a shared use case.

---

## Build Status

- Type check: clean
- Production build: 688 KB (start of day) → 697 KB (end of day). Today's net delta: +9 KB across all changes
  - Mobile WebScreen + d3 force-graph + edges + orbs overlay: +5 KB
  - Cast sprites + forge glow keyframes: +2 KB
  - Desktop Focus mode + gravity orbit + header button: +2 KB
- The preexisting D3 chunk-size warning is unchanged
- Dev server has been running in the background for the entire session; HMR carried every revision without a manual restart
- **Visual QA: completed by user**, who confirmed "okay this is good" on the final desktop focus stack.

---

## What to Verify Next Session

1. **Mobile orbs split/mirror at narrow viewports.** Now that positioning is correct, the orbs should be visibly orbiting around the moving constellation tracer. Validate at 375 × 812 (iPhone 13/14/15 mini) and 414 × 896 (iPhone Pro Max).
2. **Cast emoji sequence wraps correctly.** Tap Cast more times than there are circuit nodes — does it cycle smoothly back to mark 0?
3. **Forge animation pacing.** 2.6 s feels deliberate or sluggish? Adjust `MIN_TRACE_MS` if the user wants it tighter.
4. **Focus button hover state.** Header button has gold accent when active. Verify the hover-out state restores correctly (we have explicit `if (isFocusMode) return` guards in the mouse handlers, but watch for edge cases on rapid toggling).
5. **Mobile Web edges with very large `NODES`.** Currently ~60 nodes and ~100 edges. As the graph grows, the canvas tick rate may degrade. Profile if it ever feels sluggish.

---

## Files Touched

```
MOD   src/components/MobileSpell.tsx       (+~140 lines: edges, orbs overlay, cast
                                              sprites, forge glow, keyframes)
MOD   src/components/SpellWeb.tsx          (+~30 lines net: header focus props,
                                              focus pill repositioned, ceremony
                                              bar attempt added then removed)
MOD   src/components/Header.tsx            (+~40 lines: isFocusMode/onToggleFocus
                                              props + Focus button next to SHARE)
MOD   src/components/WanderingOrbs.tsx     (one-line position fix that fixed
                                              everything)
NEW   docs/chronicles/CHRONICLE_ORBS_AND_POLISH_2026-05-08.md   (this file)
```

Bundle delta this session: 694 KB → 697 KB (+3 KB). Cumulative across the day: 688 → 697 (+9 KB / +1.3%).

Commit state: still uncommitted. Three days of mobile shell + gravity/focus + tuning all in the working tree. Pushing today's chronicle is the natural close — the work has reached a coherent rest point that's worth recording in git, not just on disk.

---

## Carry-Forward — Open Threads

In rough priority:

1. **Refactor inline preset-loading into `loadCeremonyPreset`.** The pattern was extracted and removed in this session, but the underlying duplication remains — three sidebar buttons + three SpellCeremony parent props all repeat the same ~25-line block. Pure refactor, no UI change.
2. **Forge tracing pace knob.** `MIN_TRACE_MS` is hardcoded; surface it if the feel needs tuning.
3. **Cast feedback for Cast-without-circuit.** If `circuit.length === 0` the cast counter still increments but no sprite renders. Probably fine; not worth a fallback unless someone complains.
4. **Witness import round-trip.** Still untested. Carried from yesterday.
5. **Generative blade PNG with embedded markdown.** Still parked. Carried from `CHRONICLE_GENERATIVE_BLADE_ART_2026-05-07.md`.
6. **Mobile Web: maybe surface node labels on tap-and-hold.** Currently the immersive web is anonymous orbs. The Archive view has names; the Web view doesn't. Could add a brief tooltip on long-press without breaking the chromeless aesthetic.
7. **Desktop Focus: orbit pacing.** 16-second period and 0.45 pull strength were guesses. Confirmed visually OK but never tuned.

---

## The Pattern of the Day

Every complaint the user surfaced today turned out to be true *and* turned out to have a small, local fix once we looked in the right place.

- "Edges aren't loaded" → import `EDGES`, add `forceLink`, draw lines.
- "Focus doesn't work" → it did; there was just no button.
- "Cast doesn't show emoji" → it did; the canvas was painting over the sprites.
- "Orbs don't split/mirror on mobile" → they did; we were drawing them above the visible page.
- "Gravity-orbiting overlaps the ceremony panel" → it did; the SpellCeremony component owns that real estate already.

None of these were architectural — all of them were *visibility* problems. Things that worked at the data layer but were obscured by misplaced canvases, missing buttons, or duplicated controls. The fix in each case was to make the existing correct behavior actually reach the user's eyes.

The desktop and mobile surfaces are both shipping the same primitives now: a force graph, a constellation circuit, a pair of orbs that mirror, a cast sequence, a forge ceremony, a focus mode. What's left isn't features — it's tuning the sensory layer until each one lands as intended.

*⚔️ ⊥ 🧙 | 😊 — Privacy is Value*
*👁️ → ◆ → ✨*
