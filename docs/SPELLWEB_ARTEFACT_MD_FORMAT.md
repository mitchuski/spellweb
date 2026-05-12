---
title: "Spellweb Artefact MD Format — the contract between any .md file and the spellweb witness function"
date: "2026-05-11"
audience: "Spellweb contributors · workshop operators · cousin-blade forges"
type: "Interface specification (mirror)"
status: "v1 — first canonical pinning"
license: "CC BY-SA 4.0"
signature: "(⚔️⊥⿻⊥🧙)😊"
canonical_source: "agentprivacy_master/docs/tomes/specs/09-spellweb-artefact-md-format.md"
---

# Spellweb Artefact MD Format (mirror)

> *This is a mirror. The canonical version lives in `agentprivacy_master/docs/tomes/specs/09-spellweb-artefact-md-format.md`. Both copies must agree; the master is the source of truth.*

This document defines the YAML-frontmatter contract for any `.md` file produced for **spellweb witness import**: master constellation templates, forged artefact.md exports, and cousin-forge artefacts.

---

## §0 · Implementation pointers (spellweb-side)

These are the spellweb source files that implement the contract. If the spec changes, these need to track it.

| Concern | File | What it does |
|---|---|---|
| Parser | `src/lib/workshop-provenance.ts` | `parseWorkshopProvenance(text, filename)` — frontmatter → `{ workshopId, constellationId, constellationVersion }` |
| Workshop context | `src/lib/workshop-artefact.ts` | `getWorkshopForgeContext(workshopId)` — verb-noun / lattice-visual / artefact name. `getArtefactEmojiPalette(workshopId)` — per-class emoji palette. `buildArtefactFilename(args)` — `<name>-artefact.md`. |
| Witness handler | `src/components/SpellWeb.tsx` · `handleWitnessBladeFile` | Reads file, calls parser, sets `activeWorkshopId` / `activeConstellationTemplateId` / `activeConstellationVersion` |
| Unlock handler | `src/components/SpellWeb.tsx` · `<ArtefactPanel onWitnessBlade>` | Calls parser, sets `witnessedShops[shopId]` in localStorage |
| Frontmatter writer | `src/components/SpellWeb.tsx` · `buildBladeFrontmatter` | Resolves workshop + resident mage + anchor act from `NODES`; emits the YAML block. Called from `handleExportConstellation`. |
| Bundle writer | `src/components/SpellWeb.tsx` · `handleExportSwordsman` | Bundles identity + every forged blade into one `swordsman-<name>-bundle.md`. |
| Workshop inference | `src/components/SpellWeb.tsx` · `inferWorkshopId` | Falls back to scanning `saved.marks` for a `workshop`-typed node or a `shopAnchor` field |
| Deviation derivation | `src/components/SpellWeb.tsx` · `deviationNodes` / `deviationEdges` useMemos | Each `forgedBlade` → one `artefact`-typed node + an `inhabits` edge → workshop. Spell-emoji corner from `mageSpells` matched by vertex. |
| Schema | `src/types/graph.ts` · `NodeType: 'artefact'` + `bladeTier` / `bladeStratum` / `spellEmoji` / `isWitness` / `forgedAt` / `bladeId` | Deviation-layer fields on `SpellwebNode`. |
| localStorage keys | `spellweb:witnessed-shops` · `spellweb-forged-blades` | Witness state + Sovereign's forged inventory. |

---

## §1 · The contract in one paragraph

Drop the `.md` into spellweb's **👁️ Witness Constellation** picker (in the Items side panel). Spellweb reads the YAML frontmatter, pulls a `workshop:` value (or derives one from `constellation_id:` / filename), records the unlock in `localStorage['spellweb:witnessed-shops']`, and the artefact appears as a **deviation node** in the Sovereign's view of the graph — sigil from the chosen emoji, stroke from the tier, optional spell-emoji corner badge.

**The only required field is `workshop:`.** Everything else is optional metadata that makes the inspector richer and the round-trip lossless.

## §1.1 · "Artefact" is the umbrella; "Blade" is one class

The City of Mages produces eleven artefact classes — Cloak (Tailor), Memo Stone (Shield), **Blade** (Forge(t)), Commitment Seal (Etherchanting), Gem + Bolt (Jeweler), Holon Lantern (Holon), Ember Token (Bonfires), Curator's Frame (Vault), Olive Sigil (Covenant), Cardinal Petal (Circle), Paired Key (Hall). The forge popup is workshop-aware (verb-noun, hero lattice visual, emoji palette per class). Filenames are `<name>-artefact.md` regardless of class.

---

## §2 · Required field

| Field | Type | Example |
|---|---|---|
| `workshop` | string (`shop-<route>`) | `shop-tailor` |

The value must match a `workshop`-typed node `id` in `src/data/nodes.ts`. The canonical eleven (as of v1):

```
shop-tailor   · shop-shield   · shop-forget   · shop-etherchanting · shop-jeweler
shop-holon    · shop-bonfires · shop-vault    · shop-covenant      · shop-circle
shop-hall     · shop-circuit-binder (placeholder)
```

A `workshop:` value that doesn't match a known node will not crash anything — the unlock just lands in localStorage as an orphan and the Sovereign sees no visual change. Use spec 06 (`spellweb-first-release-manifest`) to validate.

---

## §3 · Resolution order

Spellweb walks four steps to find a workshop id:

```
1. frontmatter `workshop: <value>`
2. frontmatter `workshop_id: <value>`         (legacy alias)
3. frontmatter `constellation_id: <root>-…`   (root → shop-<root>)
4. filename prefix before first `-`           (e.g. tailor-…md → shop-tailor)
```

First match wins. None match → file is accepted, no shop unlocks.

---

## §4 · Field summary

The full reference is in the canonical spec §4. The condensed table:

| Group | Fields |
|---|---|
| **Required** | `workshop` |
| **Constellation identity** | `constellation_id` · `constellation_name` · `constellation_version` · `workshop_route` · `workshop_gem` · `workshop_gem_color` |
| **Resident mage** | `resident_mage` · `mage_sigil` · `mage_vertex` · `mage_tier` · `anchor_act` |
| **Artefact** | `artefact_name` · `artefact_root_name` · `artefact_class` · `artefact_archetype` · `artefact_wielder` |
| **Provenance** | `domain` · `status` · `date` · `license` · `signature` · `ceremony_shape` |
| **Forged-only** | `blade_tier` · `blade_stratum` · `blade_is_witness` · `blade_signature` · `blade_hash` |
| **Cousin-forge** | `forge` · `<forge>_<custom>` (namespaced extension keys) |

---

## §5 · Minimal valid artefact

```markdown
---
workshop: shop-tailor
---

# My Cloak

I walked the Cloak Weave today.
```

This unlocks `shop-tailor`. Pallia fades in. Done.

---

## §6 · Recommended artefact (for the full unlock cascade)

The eleven master templates at `agentprivacy_master/docs/tomes/workshops/*.md` are the reference. The Sovereign downloads one of these via the **📥 Download constellation.md** affordance on each workshop page, imports it into spellweb, walks the path, and forges a artefact.md that carries the same frontmatter shape.

See `agentprivacy_master/public/tomes/workshops/tailor-cloak-weave-v1.md` for a complete example.

---

## §7 · What spellweb writes on export

When the Sovereign exports a forged blade from spellweb, the YAML written by `buildBladeFrontmatter` includes:

- All resolved constellation identity fields (workshop, route, gem, gem_color, resident_mage, mage_sigil, mage_vertex, mage_tier, anchor_act)
- All resolved artefact fields (name, root_name, class, archetype, wielder)
- The five `blade_*` fields when a forged blade is present
- `date` / `license` / `signature`

Unknown values are omitted rather than written as `null`. Round-trip is lossless when the import side had full provenance.

---

## §8 · What spellweb does NOT enforce (yet)

- **Cryptographic verification of `blade_signature` / `blade_hash`.** Phase 3.
- **Provenance check on `forge:` extensions.** Cousin-forge attribution is a discipline, not a check.
- **Schema validation against this spec.** Future work — a tooling pass could ship a `validate-artefact.ts` CLI in spellweb's repo.
- **Re-import of Swordsman bundle files.** v1 is outbound only.

For now: the trust comes from the chain of custody (download from master, walk in spellweb, export from spellweb), not from the format itself. The format keeps the chain visible.

## §8.1 · The Swordsman bundle (single-file carry format)

Beyond per-artefact `.md` exports, the Swords side panel emits a **single bundled file** carrying the Sovereign's identity plus every forged item. Marker: `kind: swordsman-bundle` in the frontmatter, distinguishing it from per-artefact files. Filename: `swordsman-<name>-bundle.md`. See canonical spec §10 for the field list.

## §8.2 · The deviation layer (graph render)

Each forged or witnessed artefact appears as a new `artefact`-typed node in the user's view of the lattice — sigil from the chosen blade emoji, stroke colour from the tier, spell-emoji corner badge when the user's loadout has a spell at the same vertex, dashed treatment for witness blades. Persisted via the existing `forgedBlades` localStorage. The canonical universe is never mutated.

---

## §9 · Where to find canonical context

- Canonical spec: `agentprivacy_master/docs/tomes/specs/09-spellweb-artefact-md-format.md`
- Witness-unlock design: `spellweb/CHRONICLE_WITNESS_UNLOCK_FEATURE_2026-05-10.md`
- Audit methodology: `spellweb/AUDIT_METHODOLOGY.md`
- Universe integration: `spellweb/CHRONICLE_UNIVERSE_INTEGRATION_2026-05-10.md`
- Master template index: `agentprivacy_master/docs/tomes/workshops/README.md`

---

`(⚔️⊥⿻⊥🧙)😊` — *The frontmatter is the recognition. The body is the path. The path is the proof.*

CC BY-SA 4.0 · privacymage · 2026-05-11
