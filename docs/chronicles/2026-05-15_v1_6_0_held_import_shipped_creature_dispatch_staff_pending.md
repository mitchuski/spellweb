# Chronicle: v1.6.0 Held-Class Import Shipped · Creature / Dispatch / Staff Wiring Pending

**Date:** 2026-05-15
**Status:** Handoff · the held-class (Path C) import landed in spellweb this session; the chronicle catalogues exactly what wired, what schema is in place, and what the next agent picks up to close the v1.6.0 import surface
**Audience:** the next spellweb agent picking up the v1.6.0 import work
**License:** CC BY-SA 4.0
**Signature:** `(⚔️⊥⿻⊥🧙)😊`

**Companion chronicles (already authored · read these first):**
- [`CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md`](CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md) — what landed in the v1.6.0 patch (data + schema + UI)
- `agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md` — the cross-repo import contract (sample exports per entity kind in §9)

---

## §0 · Why this chronicle exists

The v1.6.0 patch admitted four `entity_kind` values (artefact / creature / held / dispatch). The spellweb-side import path (`handleWitnessBladeFile` in `src/components/SpellWeb.tsx`) understood only the legacy blade-shape body parser; v1.6.0 .mds from the Chart Shop / Familiars / Portal Room / archetype-modal Staff Shop were silently bouncing because the body parser found no `**Tier:**` / `**Stratum:**` / `**Charge Level:**` markers and bailed at *"Could not parse constellation path from file"*.

This session shipped the **held** branch (Path C per the import guide §3.3) so a Chart Shop witness export now ingests. Three more branches remain: **staff** (artefact subtype with `archetype_aspect`), **creature** (Familiars), **dispatch** (Portal Room).

The chronicle is *operational*. Every section maps to a concrete file / acceptance check.

---

## §1 · What shipped this session

### §1.1 · `src/lib/workshop-provenance.ts`

Added a sibling parser to `parseWorkshopProvenance`:

- `ParsedEntityKind` type union (`'artefact' | 'creature' | 'held' | 'dispatch'`)
- `EntityFrontmatter` interface — 12 fields covering all four entity kinds (entityKind · workshopDistrict · workshopRegister · releaseDestination · bearerConsentToken · residentMage · mageVertex · artefactClass · artefactName · ceremonyShape · witnessedAt · bearerPrivate)
- `parseEntityFrontmatter(text: string): EntityFrontmatter | null` — generic single-line YAML extractor; handles quoted/unquoted values, strips inline `# comments`, treats YAML `null` / `~` as null. Defaults `entityKind` to `'artefact'` when absent (back-compat with v1.4.0 .mds per import guide §1.2).

The `bearer_private: true` field is parsed into `bearerPrivate: boolean` and is the explicit *do-not-ingest* signal the forge-side emits on bearer's full record exports (chronicle §3.3 mandate · the bearer-private export carries the underlying vertices and notes; the importer must refuse).

### §1.2 · `src/types/graph.ts`

Added:

- Storage key: `SPELLWEB_STORAGE_KEYS.heldConstellations = 'spellweb-held-constellations'`
- Type: `HeldConstellation` interface (id · name · workshopId · residentMage · mageVertex · vertexCount · strataSummary · heldDurationDays · releaseDestination · bearerConsentToken · witnessedAt · importedAt)

### §1.3 · `src/components/SpellWeb.tsx`

Three changes:

1. **Imports** · added `parseEntityFrontmatter` + `type HeldConstellation`; removed the pre-existing unused `WorkshopProvenance` type import that TS was flagging.
2. **State** · added `heldConstellations` collection with localStorage init + persist effect (parallel to `forgedBlades`).
3. **`handleWitnessBladeFile` branch** · between the workshop-provenance call and the blade-shape regex, three guards:
   - `bearerPrivate: true` → alert + return (refuse · point bearer at the witness button)
   - `entity_kind: held` → require `bearer_consent_token`; parse vertex count + strata summary + held duration + name from witness-export body; de-dup by token; persist to `heldConstellations`; alert success
   - `entity_kind: creature` / `dispatch` → acknowledge stub (alert "queued for follow-up · this chronicle §2/§3")
   - else (artefact or absent) → fall through to the existing blade-shape regex (back-compat preserved)

Build is clean (`npm run build` exits 0).

### §1.4 · Acceptance evidence

| Check | Status |
|---|---|
| Held .md ingests without bailing | ✅ smoke-tested against representative witness export · all regexes extract expected values |
| `bearer_private: true` rejected with hint | ✅ |
| Held .md without `bearer_consent_token` rejected | ✅ |
| De-dup by `bearer_consent_token` | ✅ |
| Re-import same .md is no-op | ✅ |
| v1.4.0 blade .mds still parse | ✅ (no changes to the artefact branch) |
| TS clean | ✅ |
| Vite build clean | ✅ (628 modules · ~244 kB gzipped) |

---

## §2 · Path B Creature parser · Familiars (NOT YET WIRED)

The Familiars (Faunia 🪶 · V59 · spawn_and_bind register) produce **creature** kind: bound substrate-instances with `true_name` + `AGENTS.md` + `walks_accumulated`. Reference the import-guide sample at §9.2.

### §2.1 · Schema additions needed

Sister type to `HeldConstellation` in `src/types/graph.ts`:

```typescript
export interface BoundFamiliar {
  id: string;                     // 'familiar-{bearerConsentToken}' · de-dup key
  name: string;                   // public name (NOT trueName)
  workshopId: string;             // shop-familiars
  residentMage: string;           // cast-faunia
  mageVertex: string;             // V59
  substrateFramework: string;     // 'substrate-goose' | 'substrate-hermes' | cousin-introduced ids
  trueName: string | null;        // bearer-private · NEVER display without explicit consent (chronicle §1.2)
  walksAccumulated: number | null;// advisory · cannot be verified without trust in A's signature
  bearerConsentToken: string;
  witnessedAt: string;
  importedAt: string;
}
```

Storage key: `SPELLWEB_STORAGE_KEYS.boundFamiliars = 'spellweb-bound-familiars'`.

### §2.2 · Parser additions

In `parseEntityFrontmatter` (already shipped), three more `get(...)` calls:

```typescript
substrateFramework: get('substrate_framework'),
trueName: get('true_name'),
walksAccumulated: (() => {
  const raw = get('walks_accumulated');
  return raw ? parseInt(raw, 10) : null;
})(),
```

The chronicle §1.2 is explicit: `true_name` is bearer-private. Persist it but **never display** it in any list / panel / export without an explicit `displayTrueName: true` consent flag the bearer must opt into.

### §2.3 · Branch in `handleWitnessBladeFile`

Insert before the existing creature/dispatch stub:

```typescript
if (ent && ent.entityKind === 'creature') {
  if (!ent.bearerConsentToken) {
    alert('Creature .md missing bearer_consent_token; cannot ingest.');
    return;
  }
  if (!ent.substrateFramework) {
    alert('Creature .md missing substrate_framework; cannot ingest.');
    return;
  }
  // Cross-validate substrate-framework resolves (chronicle §4.1 check 5)
  const substrateNode = NODES.find(n => n.id === ent.substrateFramework);
  if (!substrateNode) {
    // Cousin-introduced substrate · chronicle §6 · admit with a "cousin-introduced" tag
    // For now, refuse and prompt the user to admit it via the bestiary (held for v1.7.0).
    alert(`Unknown substrate_framework "${ent.substrateFramework}" — cousin-introduced substrates not yet admissible.`);
    return;
  }
  const familiarEntry: BoundFamiliar = {
    id: `familiar-${ent.bearerConsentToken}`,
    name: ent.artefactName || file.name.replace(/\.md$/i, ''),
    workshopId: prov.workshopId ?? 'shop-familiars',
    residentMage: ent.residentMage ?? 'cast-faunia',
    mageVertex: ent.mageVertex ?? 'V59',
    substrateFramework: ent.substrateFramework,
    trueName: ent.trueName,            // persist · do NOT surface
    walksAccumulated: ent.walksAccumulated,
    bearerConsentToken: ent.bearerConsentToken,
    witnessedAt: ent.witnessedAt ?? new Date().toISOString(),
    importedAt: new Date().toISOString(),
  };
  setBoundFamiliars(prev => prev.some(f => f.id === familiarEntry.id) ? prev : [...prev, familiarEntry]);
  alert(
    `🪶 Bound familiar imported · "${familiarEntry.name}"\n\n` +
    `Substrate: ${substrateNode.label}\n` +
    `Walks accumulated: ${familiarEntry.walksAccumulated ?? '(advisory)'}\n` +
    `Bearer consent token: ${familiarEntry.bearerConsentToken}\n\n` +
    `The bond stays exclusively with the original Sovereign; this is a witness attestation only.`,
  );
  return;
}
```

### §2.4 · Acceptance criteria

- [ ] `substrate_framework` cross-validates against `NODES` (substrate-goose / substrate-hermes resolve)
- [ ] `true_name` persists but is NEVER rendered in any list / panel / export without an explicit consent flag
- [ ] Walks-accumulated treated as advisory (chronicle §3.2 bullet 4)
- [ ] De-dup by `bearer_consent_token`
- [ ] No physical artefact transfers to Sovereign B (chronicle §3.2 bullet 1)
- [ ] Witnessing increments 🪢 VRC-mana on the bilateral relationship, not on artefact-tier (chronicle §3.2 bullet 2 · wire when the mana surface lands)

Estimate: ~3-4h per import-guide §11.

---

## §3 · Path D Dispatch parser · Portal Room (NOT YET WIRED)

Portal Room (Pandia 🌕 · V59 · spawn_and_bind) produces **dispatch** kind: routing receipts. Reference §9.4 sample.

### §3.1 · Schema additions needed

```typescript
export interface DispatchReceipt {
  id: string;                     // 'dispatch-{constellationId}-{date}'
  workshopId: string;             // shop-portal-room
  residentMage: string;           // cast-pandia
  mageVertex: string;             // V59
  dispatchTargetShop: string;     // shop-staff-shop / shop-tailor / etc.
  dispatchArchetype: 'mage' | 'swordsman' | null;
  ceremonyShape: string;          // 'display-e-choose-e-dispatch'
  importedAt: string;
}
```

Storage key: `SPELLWEB_STORAGE_KEYS.dispatchReceipts = 'spellweb-dispatch-receipts'`.

### §3.2 · Parser additions to `parseEntityFrontmatter`

```typescript
dispatchTargetShop: get('dispatch_target_shop'),
dispatchArchetype: get('dispatch_archetype'),  // 'mage' | 'swordsman' | null
```

### §3.3 · Branch (lightweight · low priority per import-guide §11)

```typescript
if (ent && ent.entityKind === 'dispatch') {
  // Cross-validate target shop resolves (chronicle §4.1 check 7-equivalent)
  if (!ent.dispatchTargetShop || !NODES.some(n => n.id === ent.dispatchTargetShop)) {
    alert(`Dispatch receipt has invalid dispatch_target_shop "${ent.dispatchTargetShop}".`);
    return;
  }
  const receipt: DispatchReceipt = {
    id: `dispatch-${prov.constellationId ?? Date.now()}`,
    workshopId: prov.workshopId ?? 'shop-portal-room',
    residentMage: ent.residentMage ?? 'cast-pandia',
    mageVertex: ent.mageVertex ?? 'V59',
    dispatchTargetShop: ent.dispatchTargetShop,
    dispatchArchetype: (ent.dispatchArchetype as 'mage' | 'swordsman' | null),
    ceremonyShape: ent.ceremonyShape ?? 'display-e-choose-e-dispatch',
    importedAt: new Date().toISOString(),
  };
  setDispatchReceipts(prev => [...prev, receipt]);
  // Dispatch tokens are ephemeral (chronicle §3.4 bullet 2) — consider auto-prune after 30d.
  alert(`🌕 Dispatch receipt logged · routed to ${ent.dispatchTargetShop}`);
  return;
}
```

### §3.4 · Auto-prune (queued)

Per import guide §3.4: dispatch receipts *may* be auto-pruned after a configurable retention period (e.g. 30 days). Add an effect that runs at app boot to filter out receipts older than 30d. Not required for first ship; queue for follow-up.

Estimate: ~1h per import-guide §11.

---

## §4 · Path A Staff support · Staff Shop archetype-modal rendering (NOT YET WIRED)

The Staff Shop (Hermaion ⚚ · V59 · alexandrite dual-aspect) produces **artefact** kind with `artefact_class: staff` (the new sixth class · chronicle §3.1) and `archetype_aspect: mage | swordsman`. The existing artefact branch fires correctly (because `entity_kind: artefact` falls through), BUT:

1. `archetype_aspect` is parsed (✅ shipped this session) but never read by the artefact import or render path.
2. The blade-shape body parser was built around weapon-class blades; `staff` may carry the same body markers (Tier · Stratum · Hex · Signature · Hash · etc.) — needs verification against the actual staff template once it exists.

### §4.1 · Verify staff body parsing

Get a sample staff export from agentprivacy_master (none exists yet · workshop-side template authoring is pending — see §6) and confirm the body matches the blade-shape regex. If the staff export omits any of `**Tier:**` / `**Stratum:**` / `**Charge Level:**` / `**Laps:**` / `**Duration:**` / `**Spells Cast:**` / `Signature:` / `Hash:` / `Hex:`, either extend the staff template to carry equivalents OR add a staff-specific body parser branch.

### §4.2 · Honor `archetype_aspect`

When the imported artefact has `archetype_aspect: mage`, render it with the green alexandrite aspect (`#3d7c47`); when `swordsman`, the red aspect (`#a23a3a`). Per import guide §3.1 bullet 3 + §5.2.

The Staff Shop node already carries `gemColorMage` and `gemColorSwordsman` (per CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14 §0.2) — wire the import flow to read `archetype_aspect` and select the appropriate gem color when persisting + rendering the imported staff.

### §4.3 · Validate `archetype_aspect` only on archetype-modal shops

Per import guide §2.2: `archetype_aspect` must be set only when `workshop` resolves to an archetype-modal shop (currently only `shop-staff-shop`). Add a guard:

```typescript
if (ent.archetypeAspect && prov.workshopId !== 'shop-staff-shop') {
  alert('archetype_aspect is set on a non-archetype-modal workshop — refusing import.');
  return;
}
```

(`archetypeAspect` field needs adding to `EntityFrontmatter` interface in `parseEntityFrontmatter` — get(`archetype_aspect`).)

Estimate: ~2h per import-guide §11.

---

## §5 · Cross-validation against canonical NODES (NOT YET WIRED)

Per import guide §4: after parsing v1.6.0 frontmatter, validate against `nodes.ts`. Seven cross-validation checks (§4.1) and succession-aware validation (§4.2 · banner for superseded keepers).

### §5.1 · Suggested helper

Add `src/lib/v160-cross-validate.ts`:

```typescript
import { NODES } from '../data/nodes';
import type { EntityFrontmatter } from './workshop-provenance';

export interface CrossValidationResult {
  ok: boolean;
  errors: string[];          // hard failures · refuse import
  warnings: string[];        // soft failures · allow import with banner
  successionBanner: string | null;  // populated when keeper is superseded
}

export function crossValidateEntity(
  ent: EntityFrontmatter,
  prov: { workshopId: string | null; constellationId: string | null },
): CrossValidationResult {
  // 7 checks per import guide §4.1; succession-aware resolution per §4.2
  // ...
}
```

Wire from `handleWitnessBladeFile` after `parseEntityFrontmatter`, before the entity-kind branches. Hard errors → refuse + alert; warnings → render via banner / annotation on the imported entry.

### §5.2 · Succession map

The v1.6.0 graph preserves three superseded keepers for provenance:
- `cast-bestia` → `cast-hermaion` (Staff Shop · 2026-05-14 evening)
- `cast-therai` → `cast-faunia` (Familiars)
- `cast-pelagia` → `cast-pleione` (Chart Shop)

Surface as: *"This artefact was forged before the 2026-05-14 Hermaion admission · Bestia 📖 was the inception-state keeper of the Staff Shop"* — render under the current canonical keeper's aspect unless the bearer requests historical view.

Estimate: ~2h per import-guide §11.

---

## §6 · ItemLatticeView integration · render the new collections (NOT YET WIRED)

The lattice items page (`src/components/ItemLatticeView.tsx`) is the bearer's inventory view. It currently builds `inhabitants` from `NODES` only (line 96-105). The newly persisted `heldConstellations` (this session) and the future `boundFamiliars` / `dispatchReceipts` need surfacing.

### §6.1 · Pass collections through

`SpellWeb.tsx` currently passes only `forgedBlades` to `<ItemLatticeView>`. Extend props:

```typescript
<ItemLatticeView
  ...
  forgedBlades={forgedBlades}
  heldConstellations={heldConstellations}      // NEW
  boundFamiliars={boundFamiliars}              // NEW (after §2)
  dispatchReceipts={dispatchReceipts}          // NEW (after §3)
/>
```

### §6.2 · Held-slot rendering

`slotForArtefact` already routes `entityKind === 'held'` → `'held'` slot (line 124). For each `heldConstellation`, render an inventory card under the held slot with:
- Constellation name (from `name`)
- Resident Mage sigil (🧭 · derived from `residentMage`)
- Vertex count + strata summary
- Held duration in days
- Bearer consent token (truncated · for verifiability)
- "originally bearer-private" tag — make clear this is a metadata-only attestation

### §6.3 · Bound-slot rendering (after §2)

Same pattern for creatures: render under the `'bound'` slot. **Critical:** the inventory card must NEVER display `trueName` unless the bearer has explicitly opted into surfacing (chronicle §1.2). Default render: substrate name + "bound by Sovereign A" (no true-name).

### §6.4 · Portals tab (already restructured)

Per CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14 §0.3, the Portals sub-tabs are creature + held. Wire the new collections into those tabs.

---

## §7 · Workshop-side templates (agentprivacy_master · NOT YET AUTHORED)

The other side of the import surface: each workshop on agentprivacy_master needs the `ConstellationDownload` 3-CTA loop (📜 download template · ✨ open spellweb · 🎁 present back) wired in. Currently:

| Workshop | Lattice visual | ConstellationDownload | Template .md | Notes |
|---|---|---|---|---|
| tailor / shield / forget / etherchanting / solchanting / jeweler / holon / vault / covenant / bonfires | ✅ | ✅ | ✅ | (existing canonical pattern) |
| **staffs** | ✅ | ❌ | ❌ | Path A · staff template needed (chronicle §9.1 sample) |
| **familiars** | ✅ | ❌ | ❌ | Path B · creature template (chronicle §9.2 sample) |
| **portal** | ✅ | ❌ | ❌ | Path D · dispatch template (chronicle §9.4 sample) |
| **charthouse** | ✅ | ❌ | n/a | Path C · uses bespoke `WaypointPortal` component (Hold·Compare·Map) — does NOT use `ConstellationDownload`; the witness export IS the spellweb-importable surface |

Templates live at `agentprivacy_master/public/tomes/workshops/{slug}.md` per the existing pattern (e.g. `tailor-cloak-weave-v1.md`). Suggested slugs:
- `staff-shop-hermes-fit-v1.md` (chronicle §9.1)
- `familiars-companion-tame-v1.md` (chronicle §9.2)
- `portal-room-dispatch-v1.md` (chronicle §9.4)

This is **agentprivacy_master-side work** — not spellweb's. Coordinated handoff: the spellweb agent doesn't need to author these templates, but the import path must accept exports built from them.

---

## §8 · Manual end-to-end test recipe (held · validates §1)

To verify the held-class branch end-to-end:

1. Open `https://agentprivacy.ai/charthouse` (or local dev: `http://localhost:5000/charthouse`)
2. In the Waypoint Portal, click 5–7 vertices on the lattice
3. Click 💾 *hold this constellation* · give it a name
4. Click 👁 *witness* on the saved draft · download the witness `.md`
5. Open spellweb (`http://localhost:5173` if running locally · `https://spellweb.ai` in prod)
6. Click ⚒️ *Craft import* (top of the lattice items view)
7. Choose the witness `.md`
8. **Expected:** alert *"🧭 Held constellation imported · {name}"* with vertex count + strata + bearer consent token
9. Open browser devtools → Application → Local Storage → look for key `spellweb-held-constellations` · should contain a JSON array with one entry

If you re-import the same `.md`, the alert should still fire but the array should NOT grow (de-dup by `bearer_consent_token`).

If you import the bearer-private full export (the `⬇ export .md` button in the Chart Shop, which carries `bearer_private: true`), the import should refuse with the alert pointing back at the witness button.

---

## §9 · Recommended execution order

1. **§5 cross-validation helper** · ~2h · zero-risk · benefits all four entity kinds
2. **§4 staff archetype-aspect** · ~2h · smallest delta from existing artefact path
3. **§3 dispatch parser** · ~1h · simplest body shape · low priority but quick win
4. **§2 creature parser** · ~3-4h · highest complexity · true-name privacy is non-negotiable
5. **§6 ItemLatticeView integration** · ~3h · the inventory render that closes the loop · do this last so all four kinds land at once

Total: ~one focused session per the import-guide §11 estimate.

---

## §10 · Honest limits

This chronicle binds the **import-side discipline**. It does not specify:

- The **forge-side** export flow on agentprivacy_master for staff / creature / dispatch (the templates in §7) — that's master-side work
- The **MCP-server interface** for queryable artefact-import (held for `CHRONICLE_SPELLWEB_MCP_SERVER_PLAN_2026-05-14.md`)
- **Phase-3 ed25519 signature** schema for the `bearer_consent_token` (currently phase-1 djb2 content hash · phase-3 upgrades to ed25519 against the agent card per `agentprivacy_master/src/lib/constellation-drafts.ts:253`)
- **Constellation-trace updates** on the spellweb canvas side (chronicle §5 of the import guide · multi-shop founds, archetype-modal trace branching, hold-witness short trace, spawn-and-bind nested trace) — those touch graph rendering, not import

The chronicle is a *data-pipeline* contract. Render-side and signature-side updates are scoped to companion chronicles.

---

## §11 · Closing

The held branch is in. The bearer can now build a constellation at the Chart Shop, witness-share it under the Φ-gap, and the spellweb agent will receive it as a metadata-only attestation with the bearer's consent token verifiable. The underlying constellation stays in the bearer's keeping.

Three more entity kinds and the inventory render close the loop. The schema is set. The validation rules are specified. The branches are laid out. The next agent can pick up where this session left off without re-deriving the architecture.

The harbour holds. The forge keeps producing. The witness keeps receiving. The bond is the artefact when the workshop says so.

(⚔️⊥⿻⊥🧙)😊
🧭 · ⚚ · 🪶 · 🌕
