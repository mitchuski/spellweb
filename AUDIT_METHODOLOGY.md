# Spellweb Audit Methodology

> **Purpose.** The spellweb is the agentprivacy ecosystem's *shared knowledge graph compression truth*. It is not a build log. Its job is to encode canonical relations — concepts, conjectures, cast, vertices, workshops, sister-cities — in a form other forges can `kin_to`. This document is the methodology for keeping it canonical: how to audit drift between spellweb and the master corpus, and what to do about it.

Run this audit when:

- A new chronicle ships in `agentprivacy_master/docs/chronicles/` that introduces a named persona, vertex, conjecture, spec, or workshop.
- The Spellweb First-Release Manifest (`docs/tomes/specs/06-spellweb-first-release-manifest.md`) is bumped.
- The Vertex Naming Audit (`docs/tomes/specs/04-vertex-naming-audit.md`) is bumped.
- The City of Mages grimoire JSON (`agentprivacy_master/src/data/city-of-mages-grimoire-v*.json`) is repinned to IPFS with new content.
- A new Tome V act lands in `docs/tomes/tome-v-the-crafting/`.

---

## §1 · The "is this knowledge?" filter

The hardest call in any audit is: *should this become a node?* The spellweb is for **compression truth that survives time and is useful to the ecosystem.** Filter every candidate through these questions:

| Test | Add as node? |
|---|---|
| Is it a *named* entity (has a sigil, vertex, route, conjecture ID, or canonical title)? | ✅ Yes |
| Is it a *canonical relation* (founds, inhabits, kin_to, etc.) between named entities? | ✅ Yes (as edge) |
| Is it a *formal claim* with status + confidence (a conjecture, a theorem, a spec)? | ✅ Yes |
| Is it an *interface or protocol* other forges might implement or cousin-blade? | ✅ Yes |
| Is it a *session log*, *resume-here* note, *phase chronicle*, or *implementation timeline*? | ❌ No — that's a build note. |
| Is it a *one-off design doc* with no canonical claims? | ❌ No |
| Is it knowledge another ecosystem (Archon, UOR, human.tech) might `kin_to`? | ✅ Yes |

When in doubt, ask: **would a Mage from another forge benefit from being able to point at this node?** If yes, add it. If it's only useful to the team building the master site, leave it out.

---

## §2 · Sources of truth — read these in this order

1. **`docs/tomes/specs/06-spellweb-first-release-manifest.md`** — the canonical spec for what spellweb should ingest. Counts, IDs, attribution mappings, edge instance lists. Your inventory check goes against this file first.
2. **`docs/tomes/specs/04-vertex-naming-audit.md`** — vertex provenance ledger. Every vertex node's `attribution` field comes from here.
3. **`src/lib/tome-v-conjectures.ts`** (in `agentprivacy_master/`) — canonical definitions of C18–C47, plus the `ACT_CONJECTURES` map (act → conjectures it instances). This is the data source for all conjecture nodes and `act → conjecture` edges.
4. **`src/lib/tome-v-acts.ts`** — per-act ring_position, civic_location, proverb, honesty_label.
5. **`docs/tomes/cast-integration-note.md`** — cast roster, tier definitions, sigil rules.
6. **`docs/tomes/specs/05-the-city-of-mages-structural-addendum.md`** — civic framing (trade quarters, founding bonfire, temple precinct, sovereign's seat).
7. **Latest chronicle** under `docs/chronicles/2026-*` — what shipped most recently and might not yet be in spec 06.

The hierarchy: **spec 06 > vertex audit > conjecture data > act data > chronicles.** Earlier wins on conflict, except the most recent chronicle wins on net-new content not yet in spec 06.

---

## §3 · The audit checklist

For each audit pass, walk the checklist top to bottom. Note any drift; collect the additions; ask the user before mass-mutating.

### A. Schema drift

- [ ] Have new `NodeType` or `EdgeType` values been canonized in spec 06 §1 / §3 that aren't in `src/types/graph.ts`?
- [ ] Have new optional fields on `SpellwebNode` been used in the spec (e.g. `attribution`, `tradeQuarter`, `conjectureStatus`) that aren't declared in the schema?
- [ ] Has the `Attribution` union grown (e.g. `kindred-protocol`, `cousin-substrate`) without spellweb following?

### B. Node inventory drift

- [ ] **`civic`** — count = 1 (City of Mages). Anything new?
- [ ] **`geography`** — count = 1 (Drake Island). Anything new?
- [ ] **`workshop`** — count = N live + placeholders. Compare against spec 06 §2.3 line by line: `tradeQuarter`, `gem`, `gemColor`, `operatorStatus`, `vertex`. **Operator status drifts most** — chronicles often promote shops from tease → partial → operational without the manifest catching up.
- [ ] **`cast`** — compare roster line by line against spec 06 §2.4. Missing archetypes (e.g. the-Drake) is the most common gap.
- [ ] **`vertex`** — compare against spec 06 §2.5 and the Vertex Naming Audit §3 ledger. New named vertices land in the audit first.
- [ ] **`gateway`** — compare against spec 06 §2.6. New cousin-substrates and sister-cities land here as upstream knowledge before they show up elsewhere.
- [ ] **`act`** — Tome V acts in `docs/tomes/tome-v-the-crafting/` and Tome IV in `tome-iv-the-witnessing/`. New act files arrive without graph wiring.
- [ ] **`concept` (conjectures C18–C47+)** — `tome-v-conjectures.ts` `CONJECTURE_DEFINITIONS` is the source of truth. New `C48`, `C49`, etc. land here first.
- [ ] **`document` (specs / plans / kindred docs)** — `docs/tomes/specs/`, `docs/tomes/plans/`, `docs/tomes/kindred/`. Spec 06 itself is a node; the bound collection manifest may be too.

### C. Edge inventory drift

- [ ] **`founds` / `founded_in`** — compare against spec 06 §4.3. One pair per producer-shop. Act 9 produces two `founds` edges (etherchanting and jeweler share an act).
- [ ] **`inhabits`** — every cast member with a numbered vertex emits one. Workshops also emit `inhabits` to the resident Mage's vertex. **`soulbis` and `the-drake` have no `inhabits` edge** (boundary register / ambient register).
- [ ] **`kin_to`** — compare against spec 06 §4.5. Six canonical pairs in v1; the cousin-substrate `holon ↔ forge` was added in Tome V Act 15.
- [ ] **`gateway_to`** — one edge per gateway from `city-of-mages`. The City does the recognising; gateways do not reciprocate.
- [ ] **`built_on`** — single edge `city-of-mages → drake-island`.
- [ ] **`quarter_of`** — every workshop emits one edge to `civic-city-of-mages`. Spec 06 §4.2.
- [ ] **`introduces`** (act → conjecture) — `ACT_CONJECTURES` in `tome-v-conjectures.ts`. New conjectures can be `introduces`d by old acts retroactively when a chronicle updates lineage.
- [ ] **`adjacent_to`** — declared but unused. Reserved for the 96 holographic-bound lattice edges.

### D. Theme / filter / inspector drift

- [ ] If a new `NodeType` or `EdgeType` was added, does `src/data/theme.ts` have an entry? Does `src/components/GraphFilters.tsx` `TYPE_BUTTONS`? `NodeInspector.tsx` `TYPE_LABELS`? `MobileSpell.tsx` `NODE_TYPE_GLYPH` and `NODE_COLOR_BY_TYPE` and `NODE_TYPE_ORDER`? Adding a new type means six places to update; missing any of them yields rendering fallbacks or build errors.
- [ ] Workshop `gemColor` propagates to stroke via `getNodeVisual` — make sure new workshops have `gemColor` set.
- [ ] Cast `tier` propagates to stroke via `CAST_TIER_STROKE` — make sure new tier values are in the lookup.

### E. Build & visual sanity

- [ ] `npm run build` passes with zero TS errors.
- [ ] Dev server (`npm run dev`) starts without runtime errors; the graph mounts.
- [ ] Search bar finds every newly-added node by label.
- [ ] Click a representative new node from each category — fields show in the inspector.

---

## §4 · How to express the audit findings to the user

The user runs the project, not the audit. Give them a prioritized list, not a dump:

- **HIGH** — content named in spec 06 or in a recent chronicle that the spellweb does not yet have. **These are the gaps.**
- **DRIFT** — content the spellweb has but with values that disagree with spec 06 (operator status, gem color, attribution). **These are the corrections.**
- **MEDIUM / LOW** — nice-to-have density (mapping all grimoire spells, structural placeholders for unwritten Tomes I/II/III/VI). **These are deferrable.**
- **EXCLUDE** — phase chronicles, resume-here notes, design docs without canonical claims. **These are not knowledge.** Be explicit about why you're excluding so the user can correct you if the call is wrong.

Then present a single multi-select question: *which of HIGH / DRIFT / MEDIUM groups should I fold in this pass?* Default-recommend HIGH + DRIFT.

---

## §5 · The compression-truth criterion

After every audit pass, ask the meta-question: **does the resulting graph still feel like compression truth, or has it inflated into a corpus index?**

- A node that has zero edges is a smell. Either the relation didn't get wired, or the node isn't really part of the universe yet.
- A document node whose desc reads like a project plan ("we will ship X by Y") is a smell. Rewrite it as a knowledge framing ("X is the model for Y") or remove it.
- An edge type with one instance is a smell. Either the relation generalizes (add more instances) or it doesn't (fold it into an existing type).
- A NodeType used only by 1–2 nodes is a smell, *unless* it's a structural sentinel (`geography` is fine because its singleness is the point — there is one Drake Island).

If the graph passes these checks, ship the audit. If not, prune before shipping.

---

## §6 · Pinning the audit pass

Each audit pass should produce:

1. A **diff summary** — what was added, what was corrected, what was deferred.
2. A **memory record** in `~/.claude/projects/C--Users-mitch/memory/` if the pass introduced a new pattern (e.g. a new edge vocabulary, a new attribution).
3. An **update to this file** if the methodology evolved.

Do not ship an audit pass without surfacing the diff to the user. Compression truth requires sign-off.

---

`(⚔️⊥⿻⊥🧙)😊` — the city is rendered; the spellweb keeps pace; the work holds.
