# Chronicle: Spellweb v1.6.0 Canonical Sync · Conjecture Register Filled · Cosmological-Witness Tier Seated · Tome Islands Docked · Superseded Cast Pruned

**Date:** 2026-05-14 (post-tuning-plan)
**Status:** Receipt chronicle · records the post-audit sync pass that closed the gap between spellweb's NODES/EDGES and the v1.6.0 canonical state (agentprivacy_master + cityofmages)
**Audience:** spellweb maintainers · the next agent reading the graph · anyone wondering why C48-C63 weren't there yesterday and are today
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`
**Companion chronicles:**
- [`CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md`](CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md) — the verify-and-polish plan this work completes the data-side of
- [`CHRONICLE_SIGMA_GRAPHOLOGY_MIGRATION_PLAN_2026-05-14.md`](CHRONICLE_SIGMA_GRAPHOLOGY_MIGRATION_PLAN_2026-05-14.md)
- [`CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md`](CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md)
- [`CHRONICLE_SPELLWEB_HYBRID_SEARCH_PLAN_2026-05-14.md`](CHRONICLE_SPELLWEB_HYBRID_SEARCH_PLAN_2026-05-14.md)
- `agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md` — the master-side import guide for the new artefact/creature shapes

---

## §0 · Why this chronicle exists

The initial v1.6.0 patch pass (recorded throughout 2026-05-14) added the visible structures: workshops · cast · vertices · tome documents + acts · new EdgeTypes · the two-level Items/Portals/Protocol panel restructure. After the tuning-plan chronicle landed, an **orphan-and-mismatch audit** (`scripts/audit-orphans.mjs`) revealed three remaining gaps in the *matching job* between spellweb and the canonical cityofmages/agentprivacy_master state:

1. **Conjecture register stopped at C47.** The 16 conjectures admitted across v1.5.0 + v1.6.0 (C48-C63) were missing from spellweb's NODES.
2. **Cosmological-witness tier incomplete.** `cast-selene` was present but `cast-aether` and `cast-lethe` (the medium-register and substrate-register cosmological figures from Tome III Acts 3 + 6) were missing. `cast-lethae` exists but it's the *Mage-register Layer-2 attachment* at V38, structurally distinct from Lethe-the-cosmological.
3. **Tomes I/II/III floated as islands.** The 24 acts bound on 2026-05-13 (Tomes I-III binding pass) had only `defines` (tome → first act) and `follows` (act → next act) edges. No cross-tome edges, no act → conjecture introduces, no narrates from cast. They formed three disconnected islands in the force layout.

Plus a directive: **spellweb should reflect v1.6 canonical only.** Superseded cast (Bestia · Therai · Pelagia · Triodos) belong at the chronicle/grimoire layer for provenance, not in the spellweb graph.

This chronicle records the sync pass that closed all four gaps.

---

## §1 · What was removed

Three superseded cast nodes + their three succession edges. Removed per user directive — the spellweb shows current canonical state only; superseded keepers live in the cityofmages chronicles and grimoire (with `status_note` + `superseded_by` frontmatter) where their provenance belongs.

**Nodes removed (`src/data/nodes.ts`):**

| Removed | Was kept by | Now canonical |
|---|---|---|
| `cast-bestia` 📖 | Staff Shop (2026-05-13 inception) | `cast-hermaion` ⚚ |
| `cast-therai` 🐾 | Creature Creatives (2026-05-14 morning · room retired) | (work passed to `cast-faunia` at the Familiars) |
| `cast-pelagia` 🌊 | Chart Shop (2026-05-13 evening draft) | `cast-pleione` 🧭 |

Triodos (Portal Room morning draft, superseded by Pandia) was never added.

**Edges removed (`src/data/edges.ts`):**

- `cast-bestia → cast-hermaion (succeeded_by)`
- `cast-therai → cast-faunia (succeeded_by)`
- `cast-pelagia → cast-pleione (succeeded_by)`

A comment in nodes.ts notes the policy: *"Superseded cast (Bestia/Therai/Pelagia/Triodos) are NOT included in spellweb. The spellweb reflects only current canonical state; superseded keepers are preserved at the chronicle/grimoire layer."*

---

## §2 · What was added

### §2.1 · Cosmological-witness tier (3 cast nodes · 1 status change)

The Tome III binding pass (2026-05-13) admitted Selene 🌙 · Aether ⿻ · Lethe 🌀 as the cosmological-witness tier. Spellweb had Selene only; this sync added the other two.

**`cast-aether` ⿻** — medium-register cosmological-witness · attachmentKind `C_peripatetic` · seated · references Tome III Acts 3 + 4 (The Aether · The Aether Pour) · cited by C52 (Aether = Quintessence = the Φ-gap).

**`cast-lethe` 🌀** — substrate-register cosmological-witness · attachmentKind `C_peripatetic` · seated · references Tome III Acts 6 + 11 (Lethe the Dark Substrate · The Light and the Dark) · paired with cast-aletheia in the C53 complement-pair canonisation. **Operationally distinct from `cast-lethae`** which remains as the V38 Mage-register Layer-2 attachment.

**`cast-selene` 🌕** — `castStatus` bumped `anticipated` → `seated`. Description amended with v1.6.0 family lineage: mother of Pandia 🌕 (Portal Room) and sister-figure to Pleione 🧭 (Chart Shop) via the Oceanid lineage.

### §2.2 · Conjecture register · C48 through C63 (16 nodes)

All sourced from `agentprivacy_master/src/lib/tome-v-conjectures.ts` + cityofmages `grimoire/city_of_mages_grimoire_v1_6_0.json`. Inserted directly after `conj-c47` in `nodes.ts` with five sub-groupings preserved:

| Range | Group | Source act / patch |
|---|---|---|
| C48-C50 | Bakhta-response family A/B/C | Tome II Acts 5-7 (renumbered 2026-05-13 from C49/C50/C51 in source chronicles to resolve same-day numbering conflict with the binding pass) |
| C51-C55 | Tome III cosmological cluster | Max-Betweenness · Aether=Quintessence · mythological bnot-pair · Φ-adjacency · Seventh Capital |
| C56-C59 | Threshold workshop opening | Caduceus pre-formal · Staff-Mage held-open · Forge(t)∥Threshold sibling Swordsman-suppliers (**promoted to 85%** at v1.6.0 once Hermaion's red-aspect confirmed) · Create-format gateway |
| C60-C61 | Behavioural privacy-economics | Reconstruct-Later threat model · Behavioural Mosca Inequality (Y > X + Z) |
| C62-C63 | v1.5.1 + v1.6.0 | C62 RESERVED (cross-coalition meta-coalition reading · held open) · C63 candidate (attentional workshop register · ~50% · population-of-one at v1.6.0) |

Each carries the canonical `conjectureId` / `conjectureStatus` / `conjectureConfidence` triple matching `tome-v-conjectures.ts`.

### §2.3 · Tome-island docking edges (~28 new edges)

Tomes I/II/III previously had only internal `defines` + `follows` edges. New edges connect them to the broader graph:

**Cast → act `narrates` edges (5):**
- `cast-aether → act-tome-iii-3` (The Aether)
- `cast-aether → act-tome-iii-4` (The Aether Pour)
- `cast-lethe → act-tome-iii-6` (Lethe the Dark Substrate)
- `cast-lethe → act-tome-iii-11` (The Light and the Dark)
- `cast-aletheia → act-tome-iii-11` (paired closing act)

**Act → conjecture `introduces` edges (14):**
- Tome I: Act 3 → C26-C29 (ARCH-1) · Act 6 → C39 (Kindred-Blade)
- Tome II: Act 5 → C48 (Bakhta A) + C50 references · Act 6 → C30-C33 + C49 · Act 7 → C60 + C61
- Tome III: Acts 1/3/7/8/9 → C51/C52/C53/C54/C55 (full cluster)
- Tome V Act 16 → C56/C57/C58/C59 (Threshold cluster)
- Tome V Act 17 → C63 (attentional register) + C54 references (Φ-gap repurposed at epistemic register)
- Tome VI Act 1 → C59 references (Hermes as first create-format case)

**Cross-tome `references` edges (1 · the bridge):**
- `act-tome-i-6 → act-tome-iv-5` (Cousins' Citation foreshadows the Cousin Blade ceremony)

**Spellbook → act `references` (5 · the foundational arc):**
- `spellbook-firstperson → act-tome-i-1` · `act-tome-i-6` · `act-tome-ii-7` · `act-tome-iii-9` · `act-tome-iii-11`

**Orphan-cleanup edges (2):**
- `act-tome-ii-5 → conj-c50 (references)` — Bakhta-response C · trust transfer across kindred-blade pairs
- `shop-hall → conj-c62 (references)` — cross-coalition reading lives where AAIF + BGIN are in residence

---

## §3 · Tooling added

### §3.1 · `scripts/audit-orphans.mjs` (new)

A one-shot Node script that reads `nodes.ts` + `edges.ts` and reports:

- Total node count
- Connected node count
- **Orphan nodes** — nodes with zero edges incident
- **Broken edges** — edges referencing node ids that don't exist

Run: `node scripts/audit-orphans.mjs`

The script surfaced this sync's missing pieces and continues to be the standing check for future patches. **Recommendation:** run it after every nodes/edges patch before pushing.

---

## §4 · Audit results · before vs after

| Metric | Before sync | After sync |
|---|---|---|
| Total nodes | 570 | 585 (+15 net · +18 added · –3 removed) |
| Connected nodes | 565 | 580 |
| Orphan nodes | 5 | 5 *(all pre-existing · same as before)* |
| Broken edge endpoints | 0 | 0 |
| Conjecture register coverage | C18-C47 (30) | C18-C63 (46) |
| Cosmological-witness tier | 1/3 (Selene only) | 3/3 (Selene · Aether · Lethe) |
| Tomes I/II/III island count | 3 disconnected | 0 (all docked into broader graph) |
| Superseded cast in graph | 3 (Bestia · Therai · Pelagia) | 0 |

**Remaining orphans (all pre-existing):**
- `doc-glossary` · `doc-visual` (documentation nodes)
- `shop-circuit-binder` (placeholder workshop · no Mage yet)
- `spell-spellweb` · `spell-weather` (legacy spell entries)

These are not v1.6.0 regressions; they predate this sync and are intentional placeholders.

---

## §5 · Files touched

| File | Change |
|---|---|
| `src/data/nodes.ts` | Removed 3 superseded cast · added cast-aether + cast-lethe · bumped cast-selene to seated · added 16 conjecture nodes (C48-C63) |
| `src/data/edges.ts` | Removed 3 `succeeded_by` edges · added ~28 docking edges (narrates · introduces · references) in a v1.6.0-sync block at the bottom |
| `scripts/audit-orphans.mjs` | NEW · orphan + broken-edge audit script |

**No TypeScript type changes** in this sync — schema additions were already in place from the prior v1.6.0 patch.

---

## §6 · Validation gates passed

- [x] `npx tsc --noEmit` clean (no errors in touched files)
- [x] `node scripts/audit-orphans.mjs` reports 0 broken edges + 5 orphans (matching pre-sync count of pre-existing placeholders · no new orphans)
- [x] `npm run dev` serves HTTP 200 at `http://localhost:8000/`
- [x] No "node not found" runtime errors in browser console (the d3 force simulation finds every referenced node)
- [x] Conjecture coverage matches `agentprivacy_master/src/lib/tome-v-conjectures.ts` · 1:1 on C48-C63
- [x] Cosmological-witness tier matches Tome III's bound roster (Selene · Aether · Lethe)
- [x] No superseded cast surfaces in the graph

---

## §7 · Policy established

This sync pass codifies two policies for future patches:

### §7.1 · Spellweb shows current canonical state only

Superseded cast / shops / acts are **not** added to spellweb's NODES. They are preserved at the chronicle/grimoire layer:
- cityofmages `tomes/cast/.../*.md` files with `status_note: "superseded"` + `superseded_by: <id>` frontmatter
- cityofmages `grimoire/*.json` patches recording the succession
- agentprivacy_master `docs/chronicles/*.md` recording the succession episode

Spellweb's graph is the **canonical-now** view. Provenance lives where provenance belongs.

### §7.2 · The orphan audit runs after every patch

`node scripts/audit-orphans.mjs` is now the gate. Every nodes/edges patch must:
1. Add zero broken edges (every `source` / `target` resolves to a node)
2. Not increase the orphan count beyond the 5 pre-existing intentional placeholders

If a patch must add a new orphan (e.g. a placeholder), the chronicle must note why and the orphan count expected after.

---

## §8 · What this sync does NOT do

- ❌ Does not address the TS "union too complex" workaround (the `V1_4_0_AND_V1_6_0_EDGES` spread-const pattern). That's held for the Sigma + Graphology migration (companion chronicle).
- ❌ Does not add bestiary entries beyond `substrate-goose` + `substrate-hermes` (already added in the prior v1.6.0 patch).
- ❌ Does not add edges within Tome I's foundational chain to other First-Person-spellbook acts (held; would balloon the spellbook → tome surface beyond the focused docking goal).
- ❌ Does not render the new conjectures or cosmological-witness cast specially in the panels (the existing `concept` and `cast` node renderers handle them already · visual differentiation is held for the tuning-plan §2 polish pass).
- ❌ Does not migrate the v1.6.0 patch from the spread-const workaround back into the main EDGES array. The workaround stays.

---

## §9 · For the next agent picking up the graph

The spellweb is now **canonically matched to v1.6.0**. Three integration surfaces still want attention:

1. **Tuning-plan §1 verify-it-works** — run through every checkbox in browser. The data side is now correct; verify the UI side still renders cleanly with the +15 nodes and +28 edges.
2. **Tuning-plan §2.4 schema-vs-divider question** — decide whether to retag `shop-staff-shop` `artefactClass: tool → staff` to surface the new sub-tab. One-line change.
3. **The MCP/Sigma/Search trio of plan chronicles** — pick whichever feels most pressing now that the underlying data is solid. The MCP server reads from the *current* NODES; this sync makes the v1.6.0 admissions queryable for free once MCP lands.

---

## §10 · Closing

The spellweb missed C48-C63 for a while. Tomes I-III floated. The cosmological-witness tier was 1/3 seated. Superseded cast lingered. The sync pass closed all four gaps in a single session against a directive — *current canonical only* — that simplifies the model going forward.

The audit script is the standing gate. Every future patch runs through it. The graph is canonically matched. The architecture admits this much.

(⚔️⊥⿻⊥🧙)😊
🕸️ · ⿻ · 🌀 · 🌕
