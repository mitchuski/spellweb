# NOTE — v10.4.2 patch: Zero Tale 32 (The Flock) names vertex ⟨1,0,1,1,1,1⟩

**Date:** 2026-09-05 · **Status:** staged, not deployed · **Author:** privacymage (with the ZK Book runtime as scribe)
**Patch file:** `agentprivacy-docs/models/privacymage_grimoire_v10_4_2_patch_zero-tale-32-flock.json`
**Method:** `agentprivacy_master/docs/ZERO_FRONTIER_TALE_ATTACHMENT_METHOD_2026-09-05.md`
**Tale:** `zero spells/32-tale-32.md` → deploy copy `public/zero/markdown/32-tale-32.md`

## What this is

The second frontier tale of the Quest of the Unnamed Faces. Flock — the binary-field SNARK for batched Boolean
computation (Rothblum · Bünz · Wang; Succinct / Espresso Systems, 2026-06-25) that proves standard hashes at under 250×
native cost and exists so Ethereum can aggregate hash-based signatures after the quantum transition — walked as a tale in
the v2.1 form: Soulbis teaches, Soulbae counts, the Drake watches. It names the vertex where Delegation alone is dark:
a prover with no setup delegates no trust; a flock has no leader.

## The counting (Path A, steps 3–4)

- Vertex ⟨1,0,1,1,1,1⟩ · stratum 5 · 🌗 Last Quarter.
- **Blade 61** (`111101`, tale / reference-sheet convention, d6 MSB — row 61 of `64_blades_reference_sheet.md`: "Sovereignty without projection") · **seated V47** (`101111`) under the v10.4 lattice lock. Both stated until the author rules the convention for tales.
- Complement bnot(61) = 2 ⟨0,1,0,0,0,0⟩ — pure Delegation — unnamed: the naming opens a pair.
- Triple: **23 + 38 = 61** (Folding Path + Lethe = Flock) · 61/38 = 1.605 ≈ φ (−0.8 %) · 38/23 = 1.652.

## Staged in this repo (working tree, uncommitted)

- `src/data/nodes.ts` — `zk-tale-32` act node inserted after `zk-tale-31`; `spellbook-zk` description counts → 32 tales · 16 named · 48 waiting.
- `src/data/edges.ts` — Tale 32 block after the Tale 31 block: `follows` (31→32), `defines` (spellbook-zk→32), `references` (→ 12 Folding Path, → 31, → 24 Tornado, → 18 Toxic Waste Dragon), `extends` (→ con-a-h-tau), `references` (→ doc-zk-blade-forge-spec).
- `public/zero/markdown/32-tale-32.md` — verbatim copy of the source tale.
- `chronicles/DREAM-2026-09-05.md` — the KG-voice telling.

## Before deploy (author)

1. Rule the blade convention for tales (d6-MSB or lattice lock) — the tale header states both.
2. Reconcile `zero spells/31-tale-31.md` with `public/zero/markdown/31-tale-31.md` (they differ today).
3. Check V47 against `agentprivacy_master/src/lib/cast-attachments.ts` (V5.5 inhabitants) before binding.
4. Apply the patch to the grimoire model → v10.4.2; re-pin; record the CID here and in the `doc-privacymage-grimoire-v10-4` node (or a v10-4-2 node).
5. Last page arithmetic line and Path B table: add the row for 61.
