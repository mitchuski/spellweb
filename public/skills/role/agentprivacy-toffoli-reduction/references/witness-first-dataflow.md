# Witness-first dataflow: a gate cut at fixed width

Distilled from the analysis of a public submission on a reversible elliptic-curve point-addition
benchmark. It kept a low-width dynamic-width inversion route at exactly the same peak and cut
average executed Toffoli by about a quarter (and emitted ops by about a sixth) with an
elliptic-curve **dataflow rewrite**, not new arithmetic. Codebase knob names are omitted.

## The detour it removed

The earlier route computed the affine output `new_y` early, then converted it back into a
numerator so an alternate inversion could cancel the slope `λ`:

```text
tx := x1               (restore)
tx := new_x
tx := dx_diff = x1 − new_x
ty := new_y = dy + λ·dx_diff − y2
tx := new_x            (again)
ty := new_dy = new_y + y2
tx := new_dx = x2 − new_x
```

Reversible and low-width, but gate-expensive: build `dx_diff`, multiply by `λ`, add/subtract
constants, then uncompute `dx_diff`; each a full modular add/multiply/cleanup phase.

## The observation

The cancellation does not need `new_y` yet. It only needs the ratio

```text
λ = new_dy / new_dx
```

and by the curve's own slope relation

```text
new_dy = λ · new_dx
```

## The rewrite

1. Keep `λ` and `dx` live.
2. **Erase `dy`** using the identity the first inversion already guarantees: `dy = λ·dx`
   (an undo of a modular multiply-accumulate).
3. **Reuse the now-zero `dy` register as full-width scratch.**
4. Compute `new_x`.
5. Compute `new_dx = x2 − new_x`.
6. Compute `new_dy = λ·new_dx` directly into the scratch register.
7. Cancel `λ` via `new_dy / new_dx`.
8. Only after cancellation, materialise the output: `new_y = new_dy − y2`.

It does not lower the peak (the inversion's bit-length micro-steps still bind), but it deletes a
large reversible detour in the non-peak curve arithmetic without adding any long-lived register.

## A second, smaller win: zeroed passenger as constant-load scratch

Where the zeroed register has headroom, load a classical constant into it, use the ordinary
quantum-quantum modular add/sub machinery, then unload the constant. This replaced per-bit
classical-constant arithmetic paths in places, at no width cost.

## Ablation ladder (relative emitted ops)

| route | Δ emitted ops vs earlier route |
|---|---|
| earlier route | 0 |
| minor schedule/default differences only | about −0.6% |
| + defer `new_y` materialisation | about −5% |
| + erase-`dy` / build-`new_dy` rewrite (final) | about −17% |

The peak phase did not move: a pure gate reduction at fixed width. Section-level counts showed
the old `new_y` / `dx_diff` build-and-clean phases (each millions of ops) collapsing to sections
two orders of magnitude smaller.

## Why it is algebraically correct

```text
λ     = dy / dx
new_x = λ² − x1 − x2
new_y = λ·(x1 − new_x) − y1
```

Cancelling `λ` needs any numerator/denominator pair with the same slope; the pair
`(new_dx, new_dy) = (x2 − new_x, λ·(x2 − new_x))` is exactly that, so `new_y` can wait until after
the cancellation. Erasing `dy` via `dy = λ·dx` is exact because the first inversion produced `λ`
from that very pair.

## Exact vs support-gated

- The erase-and-rebuild rewrite and deferred output materialisation are **algebraic and
  reusable**.
- The route's caps, thin width schedules and seed-chosen tails remain **support-gated**, so the
  whole route is a clean challenge entry, not a theorem for all inputs.

## Takeaways

1. Do not materialise outputs until they are needed *as outputs*; cancellation usually needs a
   witness ratio, not the final coordinate.
2. A computed quotient works both ways: it builds `λ`, and it can also *erase* `dy` later because
   `dy = λ·dx`.
3. A zeroed full-width passenger is valuable temporary scratch when it replaces per-bit constant
   arithmetic without raising the peak.
4. Future gate cuts can keep mining dataflow identities around inversion boundaries; future width
   cuts must attack the inversion's own micro-steps.
