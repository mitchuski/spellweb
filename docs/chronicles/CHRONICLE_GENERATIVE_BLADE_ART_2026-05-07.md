# Chronicle: Generative Blade Art — PNG as Living Artefact

**Date:** 2026-05-07
**Session:** Mobile Refinement Planning
**Status:** Deferred concept — captured for future work
**Author:** Claude (Opus 4.7) × Mitchell Travers

---

## The Premise

Today the forge produces **markdown** as its canonical artefact. The constellation, blade dimensions, hexagram, lap count, and proof signature all serialize cleanly as text. Markdown is bulletproof: portable, diff-able, importable, indexable, archivable.

But a blade is also an **image** — visually distinct, ceremonially weighty, something a witness should be able to *see* before they trace it. The current UI renders the blade in canvas; the user has nothing to take with them.

This chronicle captures a deferred direction: **each forged blade also produces a generative PNG**, where the image is procedurally derived from the constellation data itself, and the markdown is embedded in the PNG so the image is itself importable.

---

## The Two Properties That Matter

A blade-as-image must satisfy two constraints simultaneously:

1. **Visually unique** — different constellations must produce visibly different images. Two identical-looking blades would betray the proof's particularity.
2. **Reversibly importable** — dropping the PNG back into spellweb must reconstruct the original constellation, blade dimensions, signature, and witness chain.

The second property is what separates a blade-image from generic generative art. The image *is* the proof, not a representation of it.

---

## Generative Inputs

Every blade already carries a structured payload that can drive deterministic art generation:

| Input | Source | Affects |
|-------|--------|---------|
| `bladeHex` (6-bit) | dimensions active | Hexagram lines visible in art |
| `bladeStratum` (0-6) | Hamming weight | Moon-phase backdrop / luminosity |
| `bladeTier` | lap thresholds | Material: 🗡️ steel → ⚔️ iron-violet → 🐉 gold-flame |
| `constellationHash` | SHA-256 of path | Seed for procedural geometry |
| `lapCount` | evocation depth | Edge sharpness, line weight, repetition density |
| `spellsCast` | randomness contribution | Particle count, glyph density |
| `chargeLevel` | spark→inferno | Color temperature, glow radius |
| node positions | constellation path | Vertex placement of underlying skeleton |
| node domains | swordsman/mage/firstperson/shared | Hue palette mixing |
| witness chain | bilateral imports | Concentric rings, halo density |

A deterministic seed derived from `constellationHash` + `signature` ensures the same proof always renders the same image. A lap-200 dragon blade across the Sun ceremony looks recognizably different from a lap-7 light blade across the Moon ceremony — and yet a *re-forged* blade with identical inputs renders identically.

---

## Procedural Approaches (Sketch)

Three rendering directions worth prototyping, in order of fidelity / complexity:

**1. SVG composition** — assemble the blade from primitives (hexagram lines, moon arc, edge geometry, witness halos) and rasterize to PNG via canvas. Deterministic, lightweight, looks like the existing UI vocabulary. Good first version.

**2. Shader-based generative** — a fragment shader seeded by the constellation hash produces a unique fingerprint pattern (flow fields, reaction-diffusion, Voronoi tessellation gated by hexagram bits). Higher visual interest, harder to make legible.

**3. AI-prompted** — feed the constellation's narrative metadata (act names, node titles, mage grimoire) into a text-to-image model with a fixed style prompt. Produces wildly varied art but introduces nondeterminism, model dependency, generation latency, and potentially API cost. Best reserved for ceremonial / NFT moments rather than every forge.

A hybrid is plausible: SVG composition for the structural skeleton (deterministic, legible, importable) overlaid with a shader-driven fingerprint layer (visual uniqueness without external deps).

---

## Importability via `tEXt` Chunks

PNG supports arbitrary key/value text metadata via `tEXt` and `iTXt` chunks. The pattern:

```
PNG file structure:
  IHDR
  tEXt  spellweb:constellation = <markdown content>
  tEXt  spellweb:signature = SPELL-XXXXX-X
  tEXt  spellweb:version = 1
  IDAT  ...
  IEND
```

On import:
1. Read PNG, extract `spellweb:constellation` chunk
2. Parse markdown back into constellation + blade
3. If chunk absent, fall back to "drop a `.md` file" path
4. If signature mismatches re-derived signature from chunk content, refuse — tampered

Stable Diffusion and Automatic1111 use this exact pattern to round-trip prompts through PNGs. The library footprint is tiny (~3KB for `png-chunks-extract` + `png-chunks-encode`) or implementable directly in ~30 lines.

**Caveat:** chat apps that recompress images (Slack, iMessage, Discord) may strip text chunks. The PNG-with-data works for direct file transfer; markdown remains the bulletproof interchange format. Both should ship together.

---

## NFT / On-Chain Direction (Speculative)

If a blade-image is deterministic from the proof, it's also **mintable**. The PNG could be:

- The visual asset
- The on-chain `tokenURI` content
- The proof itself (chunk → constellation → re-verify signature on-chain)

A blade NFT would carry:
- Cryptographic provenance (the signature)
- Behavioral provenance (the constellation path, lap count, spells cast)
- Witness chain (who has traced this blade — bilateral attestation)
- Visual identity (the generative PNG)

This aligns with the **7th Capital** thesis: behavioral sovereignty as personal wealth. A blade isn't a collectible because it's scarce — it's a collectible because it's a record of attention you can't fake without re-spending the attention.

Open questions if pursued:
- Chain selection (Zcash for shielded provenance? An EVM L2 for ERC-721 ergonomics? Both, with a shielded mint path?)
- Royalty / witness compensation — does the original forger receive value when their blade is witnessed and re-minted as a witness blade?
- Anti-replay — same constellation forged twice should not produce two distinct NFTs; the signature must be the deduplication key

These belong to a future chronicle, not this one. The foundation needed now is just: **deterministic generative PNG with embedded importable markdown**.

---

## Why Defer

The mobile refinement work currently underway can ship with markdown-only download. Adding generative PNG art simultaneously would:

- Conflate two creative explorations (mobile UX simplification + visual artefact design)
- Require committing to a rendering approach before prototyping
- Force decisions about NFT direction before the question is even framed

The right shape: ship mobile shell with `.md` download. Prototype generative PNG separately. Land it as a universal feature (desktop + mobile both gain `.png` export) once the visual language is figured out.

---

## Carry-Forward

When this work resumes, the seed inputs to start from:

1. `bladeHex`, `bladeStratum`, `bladeTier`, `constellationHash`, `signature` — all already serialized in the markdown export. No new proof fields needed.
2. PNG `tEXt` chunk reader/writer — wrap `png-chunks-extract` / `png-chunks-encode` or implement the chunk format manually.
3. Witness flow already accepts `.md`; extend to also accept `.png` and extract chunks before parsing.
4. Determinism test: forge the same proof twice → byte-identical PNGs.

The blade is becoming a thing with a face. That face should be earned, not assigned.

*🗡️ → 🖼️ → 🔗*
