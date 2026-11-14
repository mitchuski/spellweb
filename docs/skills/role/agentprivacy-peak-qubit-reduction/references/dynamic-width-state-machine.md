# Dynamic-width state machines: a low-width inversion pattern

Distilled from the analysis of a public low-qubit submission on a reversible elliptic-curve
point-addition benchmark. That route reached a far lower peak width than the score frontier of the
day while spending more than an order of magnitude more gates: a poor *score* but a valuable **width-floor reference**. What
follows is the reusable pattern, without the codebase's knob names.

## The question it asks

Not "how do I make the arithmetic cheaper?" but:

```text
Which pieces of information are actually coherent and live at this instant?
```

A naive modular inverse carries several full-width registers through the whole extended-GCD
process: the two Euclidean values, coefficient registers, quotient state, input passengers and
arithmetic scratch. But Euclidean state *naturally shrinks*: high bits become known zero,
terminal values become known constants, and some values can be reconstructed instead of carried.

## Four live-set tricks

1. **Dynamic-width registers.** If a register's high bits are provably zero at step *i*, those
   qubits no longer hold quantum information. Free them; reallocate only if a later step needs the
   width again. Implementation shape: a per-step `reg_widths(i)` schedule and a
   `resize(state, widths)` call before each `step(state)`, replacing "allocate the worst case
   forever".
2. **Passenger ghosting.** Values that can be reconstructed from still-live data (e.g. a slope
   numerator once the slope and the denominator are both live) are measured out with a
   phase-safe receipt instead of being carried across the peak, then rebuilt and the receipt
   resolved. Carry a reversible *obligation*, not a full register.
3. **Known-constant teardown.** At convergence several registers hold classically known values
   (e.g. `A = 0`, `B = 1`, `ca = p`, `q = 0`). Known constants need not occupy coherent storage
   across an unrelated arithmetic peak: tear them down before the next big multiply, recreate them
   for the reverse pass.
4. **Support-gated narrowing.** Per-step widths, quotient caps and small metadata counters tuned
   against the **finite input support** the circuit will actually see, with a seed chosen so the
   whole graded set validates.

## In-place layout

The point-add kept only the two working coordinates as quantum registers (the other point
classical) and **reused each register for several meanings** over time (`dy → new_y`, `dx → new_x
→ dx_diff → new_x`), cancelling the slope via an alternate witness `λ = (new_y + y2)/(x2 − new_x)`
instead of carrying a separate quotient passenger through the inversion peak.

## Ablation ladder (relative)

| route | Δ peak vs source-level baseline |
|---|---|
| source-level dynamic-width state machine, universal schedule | 0 (baseline) |
| + thin support-tuned width schedule | about −37 |
| + narrowed counter / rotation metadata | about −7 more (combined variants) |
| + quotient cap + re-chosen tail seed | about −3 more |

Lesson: the structural move gets into the region; the support-tuned schedule is the biggest single
step; metadata trims and caps are the last few qubits.

## Where the peak went

After the cut, the binders were not curve-output registers at all but **bit-length / compare / add
micro-steps inside the forward inversion and the alternate-cancellation inversion**. Future width
cuts attack those (dirty-borrowing bit-length scratch is a candidate) rather than the point-add
algebra.

## Exact vs support-gated: label every piece

Reusable for exact designs once their invariants are proven:

- the source-level dynamic-width state machine
- in-place coordinate/dataflow reuse
- terminal constant teardown/recreation
- ghosting where reconstruction is algebraically exact
- direct classical-register arithmetic for known constants

Support-gated or risky, never to be treated as a universal proof:

- thin width schedules with zero margin, validated by finite sample-and-repair
- quotient caps and seed-selected tails
- measurement-cleaned approximate arithmetic, unless its phase obligations are traced for the
  specific route

"Clean on every graded shot" is strong challenge evidence. It is not a universal reversible
arithmetic theorem; keep the two claims apart in notes and evidence.

## How it helps later work

1. Use a source-level dynamic-width route as an *analysable* width-floor scaffold: it exposes peak
   owners, schedules and algebraic structure that an opaque op stream hides.
2. Separate "low width" from "good score": the open question is whether exact low-gate
   compaction passes can be applied on top.
3. Make thin schedules provable: replace sampled widths with a compact exact bound or reversible
   metadata proof, and the technique becomes reusable everywhere.
