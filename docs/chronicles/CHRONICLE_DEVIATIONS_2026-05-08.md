# Chronicle: The Connect Button Becomes a Surface — Deviations as Personal Notes Bound to the Proof

**Date:** 2026-05-08
**Session:** A late evening pass that turned a single-purpose action button into a managed-state surface, then bound that state to the cryptographic proof
**Status:** Build clean (704 KB); cryptographic backwards compatibility preserved; constellation interoperability untouched
**Author:** Claude (Opus 4.7) × Mitchell Travers

Companion to:
- `CHRONICLE_MOBILE_SHELL_2026-05-08.md` (morning ship)
- `CHRONICLE_GRAVITY_AND_FOCUS_2026-05-08.md` (afternoon synergy)
- `CHRONICLE_ORBS_AND_POLISH_2026-05-08.md` (evening tuning)

---

## The Ask

The user stopped a proposed commit mid-stream and pivoted to a feature observation:

> "the connect feature needs to have an information popup when you click it which is a list of all of your connections locally made to the graph youve done, and the option to cut (single blade emoji) those connections or connect (chain) emoji them. that gives that button more use and the list of your specific new connections to the graph in this instance attached to this mage key should also be included in the metadata export of the proofs i think, like the 'deviation; from the root spellweb."

Then, when the cryptographic question surfaced:

> "yea i think 1 is a good option ensure that it wont change the interoperability of the same constellation, only add information discovered behind a hash that this person has a more unique spellweb personal notes style you can dig into deeper later."

Two halves of one idea:
- **A surface for the user-edges they've already drawn.** Currently they exist (saved to localStorage as `userEdges`), get rendered into the d3 graph, and that's it. No way to see them as a list, no way to remove one without redrawing the whole thing, no way to mark which ones matter most.
- **A cryptographic binding for the ones that matter.** Mark some as canonical (🔗 chain), and *that* set — not the whole user-edge list — becomes part of the proof. Deviations as a personal-annotation layer that lives behind the bladeHash, openable but not necessary for verification.

---

## What Shipped

### Connect button is now contextual

`SpellWeb.tsx:4333–4351`. The same button gets two meanings depending on selection state:

- **Node selected** → existing source-then-target create flow (unchanged behavior)
- **No node selected** → opens "Your Deviations" list popup

`canConnect` simplified to `!connectionMode.active` — the button is always available outside an in-progress create, with the mode determined by context. No new button, no separate keybinding.

### "Your Deviations" popup

`SpellWeb.tsx:3434–3614`. A modal listing every entry in `userEdges`:

```
🔗 (canonical) → gold-tinted row + ★
              | <emoji> Source ──type──▸ <emoji> Target | 🔗 toggle | 🗡️ cut |
```

- Each row shows source / target node labels with their emoji, plus the edge type (`narrates`, `proves`, etc.).
- 🔗 toggles canonical status — gold accent when active.
- 🗡️ cuts: removes from `userEdges`, drops the canonical mark, scrubs from `constellationConnections` so the active ceremony path doesn't reference a deleted edge.
- Footer: `N deviations · M canonical`.
- Empty state: "select a node in the graph and tap Connect to add one."

### Canonical edge state — a parallel Set

`SpellWeb.tsx:134–147, 1316–1357`.

- `canonicalEdgeKeys: Set<string>` keyed by order-independent `${a}::${b}::${type}` (where `[a, b]` are sorted endpoints).
- Persisted to a new `SPELLWEB_STORAGE_KEYS.canonicalEdges` localStorage entry.
- `edgeKey(edge)` helper handles both string ids and resolved node objects on `source` / `target` (since d3-force replaces strings with node references after init).
- Two new handlers: `handleChainUserEdge` (toggle membership) and `handleCutUserEdge` (drop from both `userEdges` and the canonical set).

### Visual emphasis in the live graph

`SpellWeb.tsx:1009–1027`. Inside the userEdges → d3 sync:

- Canonical edges render with `stroke: #ffd700` (gold), `stroke-width: 2.2× type-default`, `stroke-opacity: 0.85`, no dash.
- Non-canonical edges keep their original type-color, width, dash, and 0.35 opacity.
- `canonicalEdgeKeys` added to the effect's dependency array so chaining/un-chaining a row in the popup restyles the live graph immediately.

### Cryptographic binding — Option 1

The user's choice from three options: **canonical-only**, included in `bladeHash`, with backwards-compat preserved.

**`forge.ts:25–37`** — new helper:

```ts
export async function hashCanonicalDeviations(canonicalKeys: string[]): Promise<string> {
  if (canonicalKeys.length === 0) return '';
  const sorted = [...canonicalKeys].sort();
  const data = new TextEncoder().encode(sorted.join('|'));
  // SHA-256 → 12 hex chars (matches constellationHash truncation)
}
```

Returns `''` when empty so callers can pass it through unconditionally.

**`forge.ts:51–84`** — `computeBladeHash` gains `deviationHash?: string`:

```ts
const canonical = JSON.stringify({
  constellation: constellationHash,
  laps,
  duration,
  hex: bladeHex,
  stratum: bladeStratum,
  previous: previousBladeHash,
  timestamp,
  ...(deviationHash ? { deviation: deviationHash } : {}),
});
```

Empty/undefined → no `deviation` key in the JSON → output identical to pre-change builds. This is what preserves backwards compatibility for:
- Existing forged blades in localStorage (their stored bladeHash matches a recompute)
- Mobile forges (no Connect concept on mobile → no deviations → bladeHash unchanged)
- Desktop forges where the user hasn't chained anything

**`SpellCeremony.tsx`** —
- `SpellProof.deviationHash?: string` (optional)
- New prop `canonicalDeviationHash?: string`
- Threaded into the existing `computeBladeHash` call inside the forge handler
- Stored on the proof as `deviationHash: canonicalDeviationHash || undefined`

**`SpellWeb.tsx:332–340`** — reactive computation:

```ts
const [canonicalDeviationHash, setCanonicalDeviationHash] = useState<string>('');
useEffect(() => {
  let cancelled = false;
  hashCanonicalDeviations(Array.from(canonicalEdgeKeys)).then(h => {
    if (!cancelled) setCanonicalDeviationHash(h);
  });
  return () => { cancelled = true; };
}, [canonicalEdgeKeys]);
```

Hash recomputes whenever the set changes. Passed to `SpellCeremony` as a prop; the ceremony reads the latest value at forge time.

### Markdown export — both views of the deviations

`SpellWeb.tsx:1669–1689` (table) and `SpellWeb.tsx:1614` (hash):

1. **Visible table — `## Deviations from Root Spellweb`:**

```markdown
## Deviations from Root Spellweb
*N user-drawn edges attached to this mage key · M marked canonical (🔗)*

| | Source | Type | Target |
|---|--------|------|--------|
| 🔗 | ◆ Concept A | narrates | ✦ Spell B |
|  · | ◇ Act C | proves | △ Theorem D |
```

2. **Inside the cryptographic block:**

```
Signature: SPELL-XXXXXX-Y
Hash: <constellationHash>
Hex: <bladeHex>
Blade Hash: <bladeHash>
Chain: #N (prev: ...)
Deviation Hash: <12 chars>     ← only present when deviations exist
```

The 12-char hash is the cryptographic commitment. The table is the readable disclosure. Both travel with the `.md`. The witness importing the file sees the table as readable text and the hash as proof, but doesn't need to replicate either to mirror the blade — `constellationHash` is what the witness chain keys off.

---

## Architecture Decisions Locked

- **Cut and chain are gestures with cryptographic semantics, not just UI affordances.** 🗡️ removes without trace. 🔗 binds to the proof. The visual emphasis (gold stroke in graph, ★ in popup) is the user-facing signal of that binding.
- **Constellation interoperability is sacred.** `constellationHash` and `signature` were never touched. Only `bladeHash` absorbs the deviation hash. Two mages walking the same path produce the same constellationHash regardless of their personal annotation states.
- **Backwards compat through optionality.** The `deviation` key only appears in the canonical JSON when non-empty. Empty string is the off-state. This means every blade ever forged before today still verifies against a recomputed hash, and mobile (which has no Connect concept) keeps producing the same bladeHashes it always did.
- **Canonical-only binding, not "all user-edges."** Chained edges are the user's intentional structural claims. Unchained user-edges are scratch — they shouldn't make the proof brittle to small graph edits.
- **The hash is opaque without its disclosure.** The 12-char digest in the cryptographic block reveals nothing about which edges were chained. The table — same `.md`, separate section — is the readable disclosure layer. A future verifier can recompute the hash from the table and confirm they match. A user who only cares about the constellation ignores both.
- **The Connect button doesn't gain a second purpose; it gains contextual purposes.** Selected = create. Unselected = manage. One button, two needs, no new chrome.

---

## On Witness Compatibility

Specifically validated against the witness flow before shipping:

1. **`hashConstellation`** — unchanged. Hashes only `nodes.map(n => n.id).join(':')`.
2. **`generateSignature`** — unchanged. Derives from constellationHash + laps + timestamp.
3. **`computeBladeHash`** — only changes when the caller passes a non-empty deviationHash.
4. **`handleWitnessBladeFile` parser** — uses narrow regex on numbered constellation lines and labelled fields like `Hash:`, `Signature:`, `Charge Level:`. The new `## Deviations from Root Spellweb` section uses pipe-delimited rows that don't match `^\d+\.` and are silently passed over. The new `Deviation Hash:` line inside the code block is preserved if regex were extended to read it; ignored otherwise.

A witness who imports a desktop-forged `.md` with deviations:
- Sees the constellation path as before
- Sees the original creator's deviations table as readable text
- Forges their own witness blade based on *their* ceremony — their `bladeHash` includes *their* `deviationHash` (or no deviation key at all if they haven't chained anything)
- The two blades are linked at the `constellationHash` level (witness chain integrity) but diverge at the `bladeHash` level (each forger's annotation state)

This is exactly what the user described: information discovered behind a hash, opening up to richer detail when you dig in, but never blocking the simpler ceremony.

---

## Build Status

- Type check: clean
- Production build: 698 KB (start of round) → 704 KB (end). Net delta this round: +6 KB
  - Connect popup + cut/chain UI: ~+4 KB
  - Canonical state plumbing + d3 styling: ~+1 KB
  - hashCanonicalDeviations helper + bladeHash extension + export wiring: ~+1 KB
- The preexisting D3 chunk-size warning is unchanged.
- HMR: clean across the session.
- **Visual QA: confirmed by user** as "okay this is good" on the prior round; this round's UI (popup + canonical styling) is built but not yet driven manually.

---

## Files Touched

```
MOD   src/lib/forge.ts                    (+~25 lines: hashCanonicalDeviations
                                            helper; computeBladeHash gains
                                            optional deviationHash param)
MOD   src/components/SpellCeremony.tsx    (+~10 lines: SpellProof.deviationHash,
                                            canonicalDeviationHash prop, plumbed
                                            into forge handler + proof object)
MOD   src/components/SpellWeb.tsx         (+~310 lines: canonicalEdgeKeys state,
                                            edgeKey/cut/chain handlers,
                                            "Your Deviations" popup, contextual
                                            Connect, d3 canonical styling,
                                            export table + hash line, reactive
                                            hash recomputation)
MOD   src/types/graph.ts                  (+1 line: SPELLWEB_STORAGE_KEYS gains
                                            canonicalEdges entry)
NEW   docs/chronicles/CHRONICLE_DEVIATIONS_2026-05-08.md   (this file)
```

Cumulative across the day: 665 KB → 704 KB (+39 KB / +5.9%). Across:
- Mobile shell from scratch (~28 KB)
- Gravity Web + desktop Focus mode + gravity orbit (~5 KB)
- Tuning pass with cast feedback + forge animation + WanderingOrbs fix (~3 KB)
- Connect popup + canonical deviations + cryptographic binding (~6 KB)

---

## Carry-Forward — Open Threads

In rough priority:

1. **Witness deviation chain.** Currently each witness forges their own deviationHash from their own canonical set. Worth exploring: should the witness blade explicitly *reference* the original blade's deviationHash, creating a "deviation lineage" alongside the blade hash chain? Could be metadata-only or could be cryptographic.
2. **Bulk operations on deviations.** "Cut all non-canonical" is the obvious one. Useful when the user wants to reset their personal-notes layer without losing the ones they care about.
3. **Re-derivation verifier.** A separate utility that takes a `.md` and recomputes constellationHash, signature, bladeHash, and deviationHash from its content, comparing to the embedded values. Today this is implicit trust; making it explicit closes the loop on the proof system.
4. **Carry-forward chronicles to mobile.** Mobile has no Connect surface today. Adding one would mean designing a touch-friendly way to draw user-edges, which is non-trivial. Defer until there's a real need.
5. **Refactor inline preset-loading into `loadCeremonyPreset`.** Still on the list from earlier in the day. The pattern was extracted and removed when the compressed-ceremony bar was rejected; the underlying duplication remains.
6. **Generative blade PNG with embedded markdown.** Still parked from `CHRONICLE_GENERATIVE_BLADE_ART_2026-05-07.md`. The deviation hash is exactly the kind of metadata that benefits from `tEXt`-chunk roundtripping.

---

## The Frame

The Connect button used to do one thing: draw an edge. Now it does three:

1. Draw an edge (when a node is selected)
2. Show you the edges you've drawn (when nothing is selected)
3. Let you decide which of those edges become part of your proof

Each of those is the same gesture — *click Connect* — at three different layers of abstraction. Drawing is the first-order use. Reviewing is the second-order awareness. Chaining is the third-order commitment.

The deviationHash sitting inside bladeHash is the same idea translated to the proof system. The ceremony of walking a constellation produces a verifiable signature. The user's deeper engagement with the graph — the connections they think are real, beyond the canonical edges someone else gave them — produces a parallel signature that lives next to the first, opaque until inspected, optional but binding once made.

Two layers, one gesture. The graph remains shared; the personal annotation becomes part of the chain.

*⚔️ ⊥ 🧙 | 😊 — Privacy is Value*
*🔗 → ★ → 🗡️*
