# Spellweb Sync Audit & Path — 2026-06-11

**Status:** AUDIT + EXECUTABLE CHECKLIST. No graph edits made yet. This file is the
plan-of-record for syncing the spellweb knowledge graph back up to the work done across
`star`, `cityofmages` (grimoire v1.8.0), `agentprivacy-docs` (V6), `agentprivacy-skills`,
and `shor_mage`.

**Authority for conjecture numbering:** `agentprivacy-docs/research/CONJECTURE_REGISTER_V6.md`
(AUTHORITATIVE, Gate G1 signed 2026-06-10, register head **C89**, next free **C90**).
When this plan and the register disagree, the register wins.

**Repo conventions that bind every edit below:** verb-form snake_case EdgeTypes; forged
items render as `artefact`-typed deviation nodes; canonical universe stays fully visible
(no fog-of-war on cast); typecheck clean before "done."

---

## 0. Baseline — what is ALREADY synced (do NOT redo)

Verified in `src/data/nodes.ts` / `src/types/graph.ts` on 2026-06-11:

- ✅ **Persona reseats (v1.8.0 MODEL lock) already applied:** Aletheia V38 · Lethe/Lethae V25 ·
  Memora V41 · Mnemosyne V8 · Iris V4 · Pythia V2. (The MODEL-coherence pass landed 2026-06-09/10.)
  → **Action: spot-verify only**, do not re-seat.
- ✅ `gateway-soulbis-star` and `gateway-soulbis-lattice` nodes exist.
- ✅ `key-city-key` node exists; `key` NodeType + `keys_to` / `synced_with` EdgeTypes exist.
- ✅ `tome` union already includes `'VIII'`. Tome VIII Acts 1–3 present.
- ✅ Conjecture concept-nodes present through **C63 + C65** (as ranges C18–C21 … C34–C37, then
  individual C38–C63, C65).

**Therefore the real gaps are: C64 + C66 + C67→C89, the Horizon wave, the star key/sigil wave,
and three new gateway/skill/doc nodes.** Everything else is additive.

---

## 1. Conjecture register coherence (the spine of this sync)

The register assigns every conjecture a **lineage**: `core` (PVM, authority agentprivacy-docs) ·
`city` (Tomes, authority cityofmages) · `shared`. Spellweb currently stores none of this.

### 1a. Schema suggestion (enables the rest of §1)
Add to `SpellwebNode` conjecture metadata in `graph.ts`:
```ts
conjectureRegister?: 'core' | 'city' | 'shared';   // lineage per CONJECTURE_REGISTER_V6
conjectureAliasOf?: string;                         // e.g. 'C85' for CM-C47, 'C32' for C46
```
And extend `ConjectureStatus` with `'alias' | 'occupied' | 'convergent' | 'challenged' | 'reserved'`
(currently only `canonical | provisional | observation | resonant`).

### 1b. New conjecture nodes to ADD (concept nodes, with register + confidence)
Numbers and homes are verbatim from the register — do not improvise.

- [ ] **C64** — Listener-discipline as the City's seventh tier · ~50% · `city` (was missing)
- [ ] **C66** — The City Key is a reading, not an authority · ~55% · `city` (revised Run 5)
- [ ] **C67–C71** (Horizon District, `city`, PINNED in grimoire v1.8.0 — these KEEP their numbers):
  - C67 Cryptographic Mosca for the substrate · C68 Resource-estimate as durability signal ·
    C69 Held-out gate rejects the tuned claim (nonce-island) · C70 Crypto-agility as migration
    readiness · C71 The Horizon Vertex V35
- [ ] **C72–C76** (ARCH-1R/T, `core`; renumbered from a provisional C67–C71 per G1 disposition 4):
  - C72 Traversal ρ = activation ρ at two scopes · C73 Terminal-obstruction primitive (Amnesia its
    canonical instance) · C74 Latency ternary-0 algebraic signature · C75 Dependency closure / hard-vs-soft ·
    C76 UOR-relational instantiation more expressive
- [ ] **C77–C80** (Bakhta integrity-gap convergence, `core`; renumbered from provisional C70–C73):
  - C77 Integrity gap ≡ scales-vs-hides · C78 Spec-intent gap ≡ irreducible promise ·
    C79 Recursive proof composition (shared frontier) · C80 Bilateral co-signed assumption sets
- [ ] **C81** — Existence-Leak · ~70% · `core` (PROMOTED Run 3; Schrottenloher instance)
- [ ] **C82–C89** (registered during V6 runs, `core`):
  - C82 The Moving Ceiling R(t) · C83 Compositional Leakage Amplification · C84 Existence-Leak
    Discount · C85 Triadic-Constraint Homology (the ARCH-1 bridge) · C86 Obstruction-Theoretic
    Amnesia · C87 The Key Accumulates (IVC) · C88 The Parity Cube · C89 The Octahedral Gap

### 1c. Alias / occupancy bookkeeping (set on EXISTING nodes)
- [ ] `conj-c47` → keeps C47; add note "City's Triadic-Constraint Homology is **CM-C47**, now `aliasOf: C85`."
- [ ] Add **CM-C47** alias node (or alias field) pointing to C85.
- [ ] `conj-c46` → `status: alias`, `aliasOf: C32`.
- [ ] `conj-c60` → `aliasOf: C48` · `conj-c61` → `aliasOf: C49` (the v1.5.0 renumbering eddy).
- [ ] `conj-c40` → annotate "KEEPS C40 (G1 disposition 1); Existence-Leak registered at C81 instead."
- [ ] `conj-c51`…`conj-c55` → `status: occupied` (never reassign).

### 1d. New edges among conjectures (the register names them explicitly)
- [ ] C7 → C83 → C17 (leakage amplification chain) · `relates_to`
- [ ] C81 → C84 → C49, and C84 → C82 · `relates_to`
- [ ] C73 ↔ C86 (taxonomy placement vs cohomological content) · `relates_to`
- [ ] C85 ↔ CM-C47 · `compresses_to` (promotion)

---

## 2. Schema changes (`src/types/graph.ts`)

- [ ] **A1 · EdgeTypes** — add: `carries`, `derives_identity_from`, `supersedes`, `boots_over`
  (star key/sigil vocabulary; verb-form snake_case; add matching `EdgeStyle` entries in the theme).
- [ ] **A3 · key fields** — add `kappa?: string` (the `sha256:…` label) + optional v2 figures block
  (`measuredOverlap?`, `visibilityRatios?: number[]`, `zkpActivity?: {made:number; verified:number}`).
- [ ] **A4 · tome union** — extend with `'IX'`.
- [ ] **A5 · dormant workshops** — add `workshopStatus?: 'active' | 'dormant'` + `activationGate?: string`
  (Salvage Yard is the first dormant annex).
- [ ] **A6 · conjecture lineage** — §1a fields.
- [ ] **A2 · Sigil artefact** — **HELD pending the §6 decision.** Do not touch `ArtefactClass` until chosen.

---

## 3. cityofmages wave (grimoire v1.8.0 — largest, most canonical)

- [ ] **Acts:** `act-tome-viii-4` *The Gap Is β* · `act-tome-viii-5` *The Key That Is a Reading*.
- [ ] **New tome:** `tome-ix-the-horizon` (open-by-design, gold accent) + acts:
  `act-tome-ix-1` *The Measuring of the Dawn* · `-2` *The Tide-Line* · `-3` *The Orchard Wound* ·
  `-4` *The Proof That Whispered*.
- [ ] **Horizon District** at **V35** (`011…` Protection∧Computation∧Value), three keepers sharing the
  vertex (Threshold-pattern):
  - `cast-eos` 🌅 Horizon-witness · gem Sunstone · ceremony *Measure · Estimate · Date*
  - `cast-dokime` 🪨 Assay-witness · gem Lydite · ceremony *Probe · Assay · Attest* (the 9024-witness gate)
  - `cast-poros` 🛤️ Migration-witness · gem Labradorite · ceremony *Inventory · Cross · Re-key*
- [ ] **Workshops:** `workshop-horizon` (V35, district "the eastern watch") · `workshop-salvage-yard`
  (`workshopStatus: dormant`, `activationGate: "Horizon District operational"`).
- [ ] **Edges:** keepers `keeps` workshop-horizon · acts `founds` workshop-horizon ·
  workshop-salvage-yard `sibling_of` workshop-horizon · cast `inhabits` V35 · conjectures C67–C71 anchor here.
- [ ] Verify the v1.8.0 reseats (§0) are reflected; no change expected.

## 4. agentprivacy-docs / V6 wave (conjectures already in §1; external references here)

- [ ] **External gateway/document nodes** (cite-only; `references` edges to the conjectures they bracket):
  - `gateway-compiled-ai-2026` (→ C7, C17, C3) · `gateway-bakhta-safety-2026` (→ C77, C78, C79) ·
    `gateway-archon-anchor-ii` (→ C34–C37, C39) · `doc-schrottenloher-ecdlp-2026` (→ C81, C84) ·
    enhance existing UOR/Archon gateways for `gateway-odrzywolek-eml` (→ C26, C28).
- [ ] **Geometry concepts** (fold into `concept`, do NOT add a node type yet):
  `concept-stella-octangula` (→ C88), `concept-octahedral-gap` (→ C89), `concept-parity-cube` (→ C88).

## 5. star + shor_mage + skills wave

**star (the projection ladder & keys):**
- [ ] `gateway-swordsmans-key` (the `github.com/mitchuski/star` holospace surface) ·
  `gateway-holospaces` (kindred-substrate, UOR) · edge `gateway-swordsmans-key --boots_over--> gateway-holospaces`.
- [ ] `concept-projection-ladder` (/sigil · /lattice · /star · /skye) · `concept-kappa-derivation` ·
  `concept-sovereign-lattice` (ℒ=ℤ/64ℤ, 96 boundary edges).
- [ ] Edges: `key-city-key --carries--> <sigil render>` · `key-city-key --derives_identity_from--> concept-kappa-derivation`.
  (Sigil representation itself = §6 decision.)

**shor_mage:**
- [ ] `gateway-shor_mage` (V6 framework applied to ecdsa.fail) · `gateway-ecdsa-fail` (the arena) ·
  `concept-agentprivacy-edge` (the falsifiable prediction; `concept`, status provisional/active).
- [ ] Edges: `gateway-shor_mage --kin_to--> gateway-archon` · `concept-agentprivacy-edge --relates_to-->`
  C82, C83, C87 · Horizon keepers `kin_to` the shor_mage agent-roles (Eos/Dokimé/Poros are the same personas
  in operational dress).

**agentprivacy-skills:**
- [ ] `skill-dual-agent-harness` (built v1.0, 2026-06-10; category meta) ·
  `doc-overlap-key-forging-v6` (the conjecture-by-conjecture bridge; `references` C82/C83/C85/C87/C88/C89/C44/C81/C84/C9).
- [ ] **Hold:** `skill-key-forging` is PLANNED, not built — do not add until its SKILL.md exists.
- [ ] Refresh skill nodes touched by the V6 mechanical pass: `dragon`, `academic`, `mana-economy`,
  `threat-adversarial` (version + conjecture-ref bumps).

---

## 6. DECISION — how the Sigil lives in spellweb (needs the First Person)

The κ-sigil is the 64-vertex constellation rendered from a key's SHA-256 (`sha256:…` → 64 hex
glyphs, one per vertex). The open question: **the sigil is part of the Swordsman's Key, not a
workshop-forged item — so should it really be a forged `ArtefactClass` sibling to Blade/Cloak?**
Four options, from lightest to heaviest:

**Option A — Render-mode only (no node, no class).**
The sigil is to a key what moon-phase notation is to a blade: a *way of drawing* the κ. Add `kappa`
to `key` nodes (§A3) and a `renderSigil()` view; no `ArtefactClass` change, no taxonomy ripple.
*Truest to "it's a projection of the key." Lightest. Cost: the sigil never appears as an inventory item.*

**Option B — Key-bound interaction that adds weight (your instinct).**
No new artefact class. The **Swordsman's Key is the inventory item**; "Render/Stamp Sigil" is a new
*interaction* in `ItemLatticeView` that derives the κ-constellation and **accumulates onto the key**
(charge/weight), modeled by **C87 "The Key Accumulates."** Edges: `swordsmans-key --carries--> city-key-sigil`,
`--derives_identity_from--> concept-kappa-derivation`. Weight tracked as a key field, not a separate artefact.
*Matches the system flow exactly; keeps taxonomy at 12+4; gives the inventory something to do. Recommended.*

**Option C — New `ArtefactClass: 'sigil'` (the original plan).**
A forged-class sibling, content-addressed by κ, joins the Swordsman.md bundle export.
*Cleanest schema; but semantically off (it isn't forged in a ceremony) and ripples taxonomy to cityofmages — ask-first.*

**Option D — Hybrid: render-mode (A) for any key + the weight interaction (B) for the Swordsman's Key.**
Sigil is always a render of κ; *stamping* it onto the Swordsman's Key is the C87 accumulation event.
*Most expressive; slightly more surface to build.*

**Recommendation: Option B (or D if you want the render-mode everywhere too).** It honors "the sigil is
part of the Swordsman's Key," keeps the 12+4 artefact taxonomy untouched, and lets C87 do real work in
the UI. A2 stays HELD unless you pick C.

> **DECIDED 2026-06-11 — Option B.** A2 (Sigil ArtefactClass) stays HELD/retired. Foundation built:
> - `graph.ts`: EdgeTypes `carries`/`derives_identity_from`/`supersedes`/`boots_over` · `kappa` field on
>   `key` nodes · `SwordsmanCityKey` + `CityKeyCharge` interfaces · `swordsmanCityKey` storage key.
> - `theme.ts`: 4 matching EdgeStyle entries.
> - **`src/lib/cityKey.ts`** (NEW): byte-identical `canonicalJSON`/`kappaLabel` (port of star /sigil) ·
>   `glyphAt` (the 64-glyph sigil reader) · holonic accumulator `emptyKey`/`buildPayload`/`foldCharge`/
>   `reseal`/`makeCharge`/`stamp` · localStorage persistence (`loadKey`/`saveKey` + change event) ·
>   `exportKeyJSON` (star-compatible round-trip) + `serializeKeyMarkdown` (Swordsman.md section).
> - Typecheck clean.
> **Remaining (the UI surface + serialization hook) — see §6b.**

## 6b. Option B surface — BUILT 2026-06-11 (manual panel · "every fold is a deliberate act")

- ✅ **`SwordsmanCityKeyPanel`** in `ItemLatticeView.tsx` right column (under `ForgedInventory`): κ readout,
  `supersedes` prior-chain line, weight · charge count, a **Strike** button (folds the *pinned* artefact —
  weight = vertex stratum — or a plain sigil-stamp when nothing is pinned), a `SigilPreview` (κ drawn as
  64 glyphs on the Pascal lattice), and the recent-charges tape. Self-contained state via `loadKey`/`saveKey`
  + `CITY_KEY_EVENT`.
- ✅ **`keyIdentity` prop** wired from `SpellWeb.tsx` (bearerName/swordsmanId from `swordsmanLink`, mageId
  from `getMageIdentity()`).
- ✅ **Serialization:** `serializeKeyMarkdown(key)` injected into `handleExportSwordsman` before the footer;
  new **🗝️ City Key.json** button (`exportKeyJSON`, κ stamped) beside Swordsman.md.
- ✅ `tsc --noEmit` exit 0 · `vite build` exit 0.
- **Deferred (data wave, not blocking):** `gateway-swordsmans-key --boots_over--> gateway-holospaces`;
  `key-city-key --derives_identity_from--> concept-kappa-derivation`; `--carries-->` the sigil render.
  These are graph-NODE additions (nodes.ts), part of §5's star wave — do them with the rest of the sync.

---

## 7. Suggested sequencing

1. Schema A1/A3/A4/A5/A6 (A2 awaits §6). Typecheck.
2. §1 conjecture wave (C64, C66, C67–C89 + aliases/edges) — the spine; everything references it.
3. §3 cityofmages v1.8.0 wave (Tome IX + Horizon District). Biggest canon payload.
4. §4 external reference gateways + geometry concepts.
5. §5 star / shor_mage / skills nodes + the chosen §6 sigil path.
6. Cross-validate (`src/lib/v160-cross-validate.ts` style), typecheck, chronicle the executed pass
   in this file's successor.

*The graph has been current in its bones (personas, keys, Tome VIII) — what it's missing is the last
month's growth: a register of 25 conjectures, a new district at the eastern watch, and the verbs of
content-addressed identity.* `(⚔️⊥⿻⊥🧙)😊`
