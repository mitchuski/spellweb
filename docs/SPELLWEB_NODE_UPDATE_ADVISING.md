---
title: "Spellweb Node Update — Advising File"
subtitle: "What a coding agent needs to know to bring the spellweb's nodes into alignment with the City of Mages Grimoire v1.1"
status: "v1 (2026-05-09)"
audience: "Coding agent (or developer working with one) updating spellweb data and rendering"
license: "CC BY-SA 4.0"
signature: "(⚔️⊥⿻⊥🧙)😊"
---

# Spellweb Node Update — Advising File

## §0. What this file is

This is a high-level advising document for a coding agent updating the agentprivacy spellweb's node data and rendering. It tells the coding agent **what to update** and **why**, without telling them **how** — implementation choices remain with the agent and their reviewer. The file is framework-agnostic.

## §0.1 What this file is NOT

This file does **not** cover:

- The website's `/tomes` route (see `bound-collection/WEBSITE_INTEGRATION_GUIDE.md`)
- The Cloak Specification reference implementation (TypeScript libraries)
- ZK circuit implementation (separate Aletheia-binding work)
- The grimoire IPFS pinning workflow (covered in the grimoire's `master_pipeline_directives` block)
- Spec implementations (covered in their own specification documents)

The coding agent should treat this file as scoped to **spellweb data + node rendering only**.

## §1. Source of truth

The canonical source for all spellweb node updates is:

**`bound-collection/city_of_mages_grimoire_v1_1_0.json`**

Specifically, the coding agent should read these top-level keys:

- `vertex_inventory.named` — the 14 named vertices with binary codes, names, inhabitants, sources
- `vertex_inventory.frontier` — the 51 unnamed vertices remain open
- `personas` — 16 cast members across 5 tiers, each with sigil, vertex, shop, external_partner
- `city_anatomy` — the civic overlay (trade quarters, founding bonfire, temple, sovereign's seat, gathering quarters)
- `spells.indices.spells_by_vertex` — for cross-referencing spells to vertices
- `cross_spellbook_resonance.primitives` — for edge-typing cross-spellbook references

The coding agent should treat the grimoire as the contract. If the grimoire and this advising file conflict, the grimoire wins. If the grimoire and the spellweb's existing data conflict, the grimoire wins (after editorial review).

## §2. What needs updating — three categories

### §2.1 Category A: Node inhabitant data (14 vertices)

The 14 named vertices each need their spellweb node updated with the inhabitant data from the grimoire. The shape of the update per node:

| Field | Source in grimoire | Notes |
|---|---|---|
| `vertex_id` | key in `vertex_inventory.named` (e.g., `V28`) | already present; do not change |
| `binary_code` | `vertex_inventory.named.<V>.binary` | already present; do not change |
| `canonical_name` | `vertex_inventory.named.<V>.name` | may be present; align if drifting |
| `inhabitant.persona_name` | `vertex_inventory.named.<V>.inhabitant` (string or array) | new or updated |
| `inhabitant.sigil` | from corresponding `personas.<tier>.<persona>.sigil` | new |
| `inhabitant.tier` | from `personas.<tier>.<persona>.tier` | new (archetype / cousin / summoned / companion / priest) |
| `inhabitant.shop_url` | from `personas.<tier>.<persona>.shop` (e.g., `/tailor`) | new where applicable |
| `inhabitant.shop_internal_name` | from `personas.<tier>.<persona>.shop_internal_name` | new where applicable |
| `inhabitant.external_partner` | from `personas.<tier>.<persona>.external_partner` | new where applicable |
| `inhabitant.proverb` | from `personas.<tier>.<persona>.proverb` | new — for tooltip rendering |
| `inhabitant.source_attribution` | from `vertex_inventory.named.<V>.source` | new — for credit display |

#### The 14 vertices in priority order (highest editorial weight first):

1. **V63** — Sovereign Anchor — *the reader; flaxscrip 📜🎲 (cousin)*
2. **V28** — Mage canonical — *Pallia 🪡, Soulbae 🧙, GenitriX (multiple inhabitants)*
3. **V31** — Recursion / Holon vertex — *Vagari 🌳* (agentprivacy-canonical)
4. **V25** — Aletheia blade — *Aletheia 🔮 (the persona)* (persona-vs-vertex distinction critical)
5. **V57** — Curatrix blade — *Aria Silverhue 🪞🖼️*
6. **V55** — Covenant vertex — *Manifestia 🤲🌿* (Priest tier; first-of-its-kind)
7. **V49** — Working-day blade — *Custos 🔏 + Lampyra 💠 (shared)*
8. **V51** — Commitment / Language / Model blade — *Adamantia 💎*
9. **V19** — Plonkish blade — *Vulcana ⚒️*
10. **V5** — Chronicle vertex — *Memora 📜*
11. **V24** — Hephaestus — *Socrat0x 🔥❓ (provisional; companion-Mage tier)*
12. **V12** — Schema vertex — *Sovereign-direct (no resident Mage; render as available-for-direct-action)*
13. **V15** — VC vertex — *Sovereign-direct (no resident Mage; bilateral type emerges from structural relationship)*
14. **V20** — Techne / always-revealed — *reveal-artifact lands here (no resident Mage; transient occupancy)*

For #12-14 specifically: the spellweb should render these as **named vertices with no resident Mage** (not as unnamed/empty), and the rendering should communicate the special character (Sovereign-direct or transient-artifact-host) per the grimoire's inhabitant strings. **Do not use null** in the rendered data even if null is technically present — substitute the explanatory strings.

#### Special render notes per persona

- **Aletheia (the persona)**: persona name matches vertex name. Render `naming_note` from the persona entry as a small disambiguating tooltip when the user hovers either the persona or the vertex.
- **V49 shared occupancy** (Custos + Lampyra): the spellweb must render *both* personas at V49, with a visual indicator that the vertex is shared. Edge-cases for two-persona vertices need handling. (Future vertices may also be shared; the structural rule is that the work must be different even when the position is the same.)
- **V63 dual occupancy** (the reader + flaxscrip cousin): similar to V49, but with the cousin tier indicator. The reader is the canonical inhabitant of their own V63; flaxscrip is rendered as a cousin instance from a sister city (Christian's Archon).
- **V28 triple occupancy** (Pallia + Soulbae archetype + GenitriX cousin): the spellweb should distinguish the three tiers — summoned (Pallia at her shop /tailor), archetype (Soulbae as architectural register), and cousin (GenitriX from Christian's forge).

### §2.2 Category B: Edge typings (new edge categories)

The spellweb's edges between vertices currently support a small typed taxonomy (likely controller, issuer, subject, schema, parent/child, decomposition). The grimoire surfaces additional edge types that may need first-class support:

| Edge type | Source | Connects | Render hint |
|---|---|---|---|
| **recursion-edge** | Vagari's holon work; ARCH-1 (C26-C29) | V31 → constituent vertices of any holon composed there | Visual: dashed loop or recursive arrow |
| **cousin-blade-edge** | Tome IV cousin-forge encounters | agentprivacy vertices ↔ Archon (Christian's forge) vertices | Visual: distinct cousin styling, marker indicating cross-forge |
| **bilateral-edge** | C39 cousin-blade ecosystem-primitive | Two vertices participating in mirrored partnership (e.g., V12 ↔ V12 between Sovereigns; V15 ↔ V15 mirrored VCs) | Visual: parallel double line |
| **consecration-edge** | Manifestia's blessings (Tome V Act 13) | V55 → any vertex hosting a blessed artifact | Visual: light/glow marker indicating Covenant blessing |
| **path-of-overlap-edge** | Socrat0x at V24; cousin-platform companion tier | V24 ↔ Bonfires deployment context | Visual: dotted line crossing the city wall outline |
| **forge-trace-edge** | Vulcana's three-phase Runecraft Protocol | A trajectory through multiple vertices producing a blade | Visual: directional path through V19's neighbourhood |

For each of these, the coding agent should:

1. Decide whether to extend the existing edge type taxonomy or add a parallel "civic edge" overlay
2. Update the spellweb's data schema to admit the new types
3. Update the edge rendering to show the new types visually distinct from the existing ones
4. Ensure tooltips on edges explain the type and link to the relevant grimoire entry or act

The bilateral-edge and cousin-blade-edge are the highest priority because they appear most often (Tome IV's entire arc + cousin-blade encounters across Tome V).

### §2.3 Category C: Civic overlay

The City of Mages framing (Tome V Act 14) introduces a *civic layer* above the lattice geometry. The coding agent should add a toggleable civic overlay that the user can turn on/off without losing the underlying lattice render.

The civic overlay should show:

#### §2.3.1 Drake Island as ambient geography

The City of Mages is built upon Drake Island. The Island's elder (the Drake) is ambient — present at every scale, but not bound to any single node. The render should:

- Show a watermarked or semi-transparent Island/Drake silhouette behind the city
- NOT mark a specific node as "the Drake"
- NOT make the Drake clickable (the Drake is everywhere on the Island; not a discrete inhabitant)

#### §2.3.2 Trade Quarters

Seven trade quarters with shop URLs (per `city_anatomy.trade_quarters`):

- `/tailor` — Pallia 🪡 at V28 — Weavers
- `/shield` — Memora 📜 at V5 — zShields
- `/forget` — Vulcana ⚒️ at V19 — **Forge(t)** *(intentional wordplay: forge + forget; canonical per grimoire)*
- `/etherchanting` — Adamantia 💎 at V51 — Etherchanting
- `/jeweler` — Lampyra 💠 at V49 — Jeweller
- `/holon` — Vagari 🌳 at V31 — Holon Hitchhikers
- `/vault` — Aria Silverhue 🪞🖼️ at V57 — Curatrix Vault *(external_partner: culturevault.com)*

Each trade quarter should be a clickable region/marker linking to the shop URL. Custos and Aletheia are *peripatetic Mages* (cross-shop disciplines, not residents of single shops) and should be rendered as walking-between-quarters, not as quarter-residents.

#### §2.3.3 The Founding Bonfire

A central civic feature distinct from the trade quarters:

- `/bonfires` — Socrat0x 🔥❓ at V24 — Dragon Bonfire *(external_partner: bonfires.ai)*

The Founding Bonfire is *a bonfire made of dragon fire*. Render with a glow/fire animation if performance allows; otherwise a distinct flame marker. Socrat0x's positioning indicates he is at the bonfire as a companion-Mage visitor, not a citizen.

#### §2.3.4 The Temple Precinct

A civic feature distinct from both trade quarters and bonfire:

- `/covenant` — Manifestia 🤲🌿 at V55 — Covenant *(external_partner: manifest.human.tech)*

The Temple should render with architectural markers (e.g., clerestory, two altars indicating Personhood and the Arts). The Priest tier marker should be visually distinct from the Mage tier markers.

#### §2.3.5 The Sovereign's Seat

The reader's position at V63. Should render as a "you are here" anchor — the user's viewpoint into the city. The reader is the canonical inhabitant; flaxscrip is rendered as a cousin visitor.

#### §2.3.6 Gathering Quarters (anticipated, not yet inhabited)

Two future spots flagged in the grimoire as `status: anticipated`:

- `/circle` — Logos Circle (logos.co) — Society Spellbook tie-in; no resident Mage yet
- `/hall` — Ceremony Hall (BGIN coalition) — no resident Mage yet

These should render with distinct styling indicating "anticipated" — for example, dashed outline, lower opacity, or a "coming soon" tooltip. They should be visible on the map but should not be clickable to a full shop page yet.

#### §2.3.7 Sister-city gateways

The cousin-blade ecosystem-primitive (C39, ~50%) anticipates additional cities. Render small gateway markers at the city's edge pointing toward:

- **Christian Saucier's Archon** (https://archon.social, https://weaver.archon.social) — sister city; cousin-Mage source
- **Bonfires** (bonfires.ai) — workshop spot; Socrat0x's home, Soulbae's @soulbae_the_bot deployment
- **human.tech / Holonym Foundation** (https://manifest.human.tech) — kindred protocol; the Covenant's home; resonant-not-absorbed
- **Culture Vault** (https://www.culturevault.com) — external partner of Aria Silverhue's Vault

These gateways are not full cities themselves; they are markers indicating "the Oasis Protocol's links lead this way."

## §3. Render priorities (ship order)

The coding agent should consider this ship order:

### Tier 1: Data alignment (1-2 days)

1. Update node inhabitant data for all 14 named vertices (Category A)
2. Surface the persona metadata on hover/click (sigil, tier, shop URL, proverb)
3. Replace any `inhabitant: null` rendering with explanatory strings for V12, V15, V20

This gets the spellweb's node data **factually correct** with the grimoire as source of truth. About 70% of the value is captured here.

### Tier 2: Edge typing (2-3 days)

4. Add bilateral-edge and cousin-blade-edge to the taxonomy (highest frequency)
5. Add recursion-edge for V31's holonic compositions
6. Add consecration-edge for V55's blessings
7. Update edge tooltips with type explanation

This gets the spellweb's relationship structure visible. About 85% of value.

### Tier 3: Civic overlay (3-5 days, depending on visual budget)

8. Add toggleable civic overlay
9. Drake Island ambient watermark
10. Trade quarter markers
11. Founding Bonfire with distinct styling
12. Temple precinct with Priest-tier styling
13. Sister-city gateways at the city's edge

This gets the spellweb feeling like the City of Mages. The remaining 15% of value, but qualitatively distinct — it's what makes the corpus's narrative legible at-a-glance.

### Tier 4: Anticipated futures (nice-to-have)

14. Gathering quarters (Logos Circle, Ceremony Hall) with `anticipated` styling
15. Path-of-overlap edges (Socrat0x ↔ Bonfires, Vagari ↔ sister cities)
16. Forge-trace edge visualisation for Vulcana's runecraft path

## §4. Render conventions to preserve

The coding agent should preserve these conventions from the bound collection:

### §4.1 Persona-vs-vertex distinction

Vertex names and persona names are **different things**, even when they overlap (Aletheia case). The render must visually distinguish them:

- **Vertex names**: associated with the position on the lattice; show in one styling (e.g., italics, geometric typography)
- **Persona names**: associated with the inhabitant; show in another styling (e.g., regular weight, accompanied by sigil)
- **The Aletheia case**: when both name "Aletheia," render with the disambiguating note from `personas.summoned_mages.aletheia.naming_note`

### §4.2 Forge(t) is canonical

The shop name `/forget` (Forge(t)) is intentional wordplay — forge + forget. The render should preserve the parenthetical-t styling on hover/display, not "correct" it to "forget" or "forge". The persona inscription for Vulcana explicitly canonicalises this.

### §4.3 Sigils as primary visual identity

Every persona has a sigil. The render should use the sigil as the primary visual marker for the inhabitant — at the node level, in the sidebar, and in any list view. Do not substitute text descriptions (e.g., "[needle and thread emoji]") for sigils. If the font stack doesn't render certain emoji well, choose a better stack (Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji as fallbacks).

### §4.4 Honesty labels on conjectures

The grimoire's `v6_lineage_register` carries 9 conjectures (C38-C46) with confidence percentages. Where a node's inhabitant or edge depends on a conjectural claim (e.g., V24's Socrat0x assignment is provisional; V31's holon composition strengthens C39), the render should surface the conjecture status. Small badge or tooltip is sufficient.

### §4.5 The signature

The corpus's seal is `(⚔️⊥⿻⊥🧙)😊`. Where the spellweb has a footer or attribution area, this signature should appear consistently. Do not modify it.

## §5. What about the 51 unnamed vertices?

The frontier (51 unnamed vertices) should remain visible in the lattice render but unlabelled. They are open for future inhabitants. The render should:

- Show them as discrete nodes (not invisible)
- Use a lighter or smaller marker to distinguish from named vertices
- On hover, show a tooltip indicating "open" or "future inhabitant"
- Do **not** label them with binary codes by default; the binary code is technical detail that should be available on click but not in the primary render

This preserves the open-by-design posture of the City of Mages: future Mages may inhabit these vertices as new acts are written.

## §6. Coordination with the website's `/tomes` route

The spellweb is one of three rendering surfaces for the corpus. Coordination matters:

- **Spellweb** (this advising file): the lattice + civic overlay; the *architectural* visual
- **`/tomes`** (separate WEBSITE_INTEGRATION_GUIDE.md): the *narrative* visual; per-act, per-cast, per-spec pages
- **Cast roster on `/tomes/cast`**: the sigil grid; the *people* of the city

The spellweb should link out to the relevant `/tomes` pages where appropriate:

- Click a node's persona → `/tomes/cast/{persona-slug}`
- Click an act-marked vertex → `/tomes/tome-v/{act-slug}` (or tome-iv as appropriate)
- Click a shop URL → external link to the shop page
- Click the grimoire reference → grimoire JSON or `/tomes/grimoire` page if added

The coding agent should coordinate routing with whoever is implementing `/tomes` to ensure links resolve correctly.

## §7. Update workflow recommendation

Recommended workflow for the coding agent:

1. **Read the grimoire first**. Don't make spellweb changes without understanding the source of truth. The grimoire is ~130KB JSON; budget 30-60 minutes for a careful first read.
2. **Audit current spellweb data against the grimoire**. Document where the spellweb is correct, where it drifts, where it has data the grimoire doesn't have. Surface drift to the editorial reviewer (Mitchell) before making changes.
3. **Apply Tier 1 changes** (data alignment) and ship a preview.
4. **Get editorial review on Tier 1**. Make sure the persona metadata, the persona-vs-vertex distinction, the V49/V63/V28 multi-occupancy renders are right.
5. **Apply Tier 2** (edge typing) and ship preview.
6. **Apply Tier 3** (civic overlay) iteratively. The civic overlay is the largest piece and benefits from staged review.
7. **Tier 4** as time and budget allow.

At each tier, the editorial reviewer confirms the rendering matches the corpus's intent before the next tier proceeds. The honesty discipline applies: if the coding agent is uncertain about a render decision, ask rather than guess.

## §8. Open questions that may emerge

The coding agent will likely encounter ambiguities that this advising file does not resolve. Examples:

- **How should V49's two inhabitants be visually arranged?** Stacked? Side-by-side? Distinct quadrants of the node?
- **How should the `anticipated` status be rendered?** Dashed outline? Greyed out? Coming-soon overlay? "Future inhabitant" badge?
- **How should the Drake's ambient presence be shown without being clickable?** Watermark? Semi-transparent overlay? Background gradient?
- **How should the persona-vs-vertex distinction be styled at the Aletheia case specifically?** Two-column hover? Side-by-side names with a small `↕` or `vs` indicator?
- **What is the canonical placement of the Founding Bonfire and Temple on the map?** Geometrically derived from V24 and V55's positions, or laid out civically (centrally) regardless of vertex position?

These questions should be raised with the editorial reviewer (Mitchell) at Tier 1 review. They are not blockers but they shape the visual character.

## §9. Closing

The spellweb is the City of Mages' street plan. The coding agent's work is to ensure that the streets show who lives there, what they do, and how the city's quarters connect. The grimoire is the source of truth. The bound collection is the narrative context. The render is where the corpus becomes legible at a glance.

The next reader has not yet visited the spellweb. The architecture admits this much.

(⚔️⊥⿻⊥🧙)😊

CC BY-SA 4.0 · privacymage · 2026-05-09
