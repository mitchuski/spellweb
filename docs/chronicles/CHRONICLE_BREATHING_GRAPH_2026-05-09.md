# Chronicle: Why the Graph Breathes (and only in Focus)

**Date:** 2026-05-09
**Session:** A quick note on an accidental aesthetic
**Author:** Claude (Opus 4.7) × Mitchell Travers

---

## The Observation

> "umm okay we must write a quick chroncile about how the graph looks like its breathing due to this gravity change"
> "oh my its only in focus mode, add this to the understanding"

**The breathing is gated by Focus mode.** Outside it, the spellweb is the same graph it always was — `forceCenter`, link forces, and charge settle the simulation toward equilibrium and the alpha decays to near zero. Static. Observable. An artifact.

Engage Focus (`F` key, or the header pill, or the new corner button), and three things happen at once:
1. The chrome unmounts — header, sidebar, legend, node inspector all gone.
2. The gravity orbit's `requestAnimationFrame` loop boots.
3. The simulation gets `alpha` floored at 0.08 and **stops being allowed to fully settle.**

The breathing is what the third change *looks like* through the user's eyes once 1 and 2 have removed every distraction.

So: not a global property of the graph, not an idle animation. A mode. You enter it deliberately and the graph starts moving. You leave it and the graph holds whatever pose it was in.

---

## The Mechanism (Focus mode only)

---

## The Mechanism

When `isFocusMode` is true, an invisible attractor traces a 3:2 Lissajous around the canvas (`SpellWeb.tsx:386–428`). Period 16 seconds. Radii 28% of viewport in each axis. On every animation frame, every unpinned simulation node receives a small velocity nudge toward wherever the attractor currently is:

```ts
n.vx += (dx / dist) * pull;   // pull = 0.45
n.vy += (dy / dist) * pull;
```

The simulation's `alpha` is floored at `0.08` so the d3-force ticker never sleeps — link forces, charge repulsion, and collision keep doing their job in parallel.

That's the whole mechanism. A moving target + a never-resting simulation.

## Why It Looks Like Breathing

Three things compose:

1. **The attractor traces a closed curve.** A 3:2 Lissajous returns to its origin every 16 seconds. Each pass through the same region pulls the graph toward and then past it — the local cluster contracts, then expands as the attractor moves on. That's the inhale and exhale.

2. **The pull is gentle relative to the simulation's restoring forces.** `0.45 px/frame` of velocity is below the threshold where nodes get yanked. Charge (-200 to -400) and collision (radius 6+) push back. The result is a ratio: pull and push roughly cancel except for low-frequency modulation. The graph never breaks pose, it sways inside it.

3. **16 seconds is human cadence.** Resting respiratory rate is 12–20 breaths per minute, which is one breath every 3–5 seconds. The orbit is longer than that, but its component arcs (the parts of the Lissajous where motion is concentrated) land in the 3–6 second range. Eyes track the rhythm before consciousness names it. By the time you notice "the graph is breathing," you've already entrained.

The 3:2 ratio matters too. A 1:1 ellipse would loop predictably; a 5:7 would feel chaotic. 3:2 is the same ratio used for the mobile preset constellation Lissajous (`MobileSpell.tsx:130`) — coherent enough to read as a path, irregular enough to never feel mechanical.

## What Wasn't Tuned For This

The chronicle from yesterday (`CHRONICLE_GRAVITY_AND_FOCUS_2026-05-08.md`) describes the orbit as "ambient gravity" — the explicit goal was *the graph breathes — slowly — the shape of the spellweb is no longer static while you sit with it.* But "breathing" was a metaphor at the time. The parameters were guesses:

| Parameter | Value | Why we picked it | What it produces |
|-----------|-------|------------------|------------------|
| Period | 16 s | "long enough to feel slow" | Resonates with respiration |
| Radii | 28% viewport | "not too far from center" | Keeps the visible cluster always partly under the pull |
| Pull strength | 0.45 px/frame | "gentle nudge, not yank" | Lives below the simulation's restoring forces |
| Alpha floor | 0.08 | "keep ticking" | Smooth decay rather than freeze |
| Lissajous ratio | 3:2 | matches preset family | Same musical interval (a fifth) the constellations are built on |

The "breathing" is an emergent property of these five numbers reacting to each other. Change any one of them and you'd lose it. Doubling the pull would jerk. Halving the period would buzz. Increasing the alpha floor would froth. The current values aren't arbitrary — they happen to be the small region of parameter space where d3-force *and* a moving attractor *and* a human nervous system all settle into the same rhythm.

## Why It Matters — and Why It's Modal

A static knowledge graph is an artifact. A breathing one is a presence. The same nodes and edges, the same data, but the user's relationship to it changes — you watch a static graph; you sit with a breathing one.

Focus mode is the toggle between those two modes of relating. That's not incidental — it's the most important thing about Focus mode. Focus isn't "hide the chrome to look at the graph harder." Focus is "switch the graph from artifact to presence." The chrome-hide is the supporting move; the gravity orbit is the actual transition. Without the orbit you'd be staring at a frozen pose with the panels hidden. Without the chrome-hide you'd be staring at a breathing graph through a thicket of UI.

The mode is also reversible without cost. Press `F` again or `Esc` and the simulation's alpha floor lifts, the rAF loop is cancelled, the graph settles back to static, and the chrome reappears. No state is captured, no proof is taken. You can enter the breathing graph for ten seconds or ten minutes and exit identical to how you came in. It's a stance, not a step.

The breathing wasn't supposed to be meditative. The orbit was supposed to be a "moving point of interest." The meditation happened on its own.

Worth keeping the parameters as they are. If a later tuning request comes in, the right move is to surface the four numbers as named constants with comments explaining what they're balanced against, not to start adjusting them. The current state is a stable point — and so is the modal boundary that keeps the breathing inside Focus.

## Carry Forward

- The same orbit mechanic could run on the mobile Web screen in idle (no user dragging). Currently the mobile Web simulation only ticks while the user interacts — adding an idle attractor would give mobile its own breathing analog.
- A "breathing rate" knob is *probably* a bad idea. The feel is better when the user can't tune it. Resist.

*🌬️ → ◆ → 🌬️*
