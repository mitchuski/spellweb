// Workshop / constellation identity parsed out of a artefact.md or constellation.md.
// Master constellation templates and forged blades both carry this in YAML frontmatter
// so the round-trip from master → spellweb → artefact.md → spellweb tags the same shop.

export interface WorkshopProvenance {
  workshopId: string | null;          // shop-<route>
  constellationId: string | null;     // e.g. tailor-cloak-weave-v1
  constellationVersion: number | null;
}

// v1.6.0 entity discriminator + held/creature/dispatch-specific fields. Parsed
// alongside provenance via parseEntityFrontmatter; null when the .md predates v1.6.0
// (back-compat default: treat as 'artefact').
//
// Per chronicle docs/chronicles/CHRONICLE_V1_6_0_TUNING_PLAN_2026-05-14.md and the
// agentprivacy_master forge-side guide 2026-05-14_v1_6_0_artefact_creature_import_guide.md.
export type ParsedEntityKind = 'artefact' | 'creature' | 'held' | 'dispatch';

export interface EntityFrontmatter {
  entityKind: ParsedEntityKind;       // defaults to 'artefact' when absent
  workshopDistrict: string | null;    // 'Threshold' | 'Navigation' | null
  workshopRegister: string | null;    // 'producer' | 'gathering' | 'spawn_and_bind' | 'attentional' | null
  releaseDestination: string | null;  // held-only · 'bonfire' | 'weavers' | 'open-sea' | null (still held)
  bearerConsentToken: string | null;  // held-only · required for any non-bearer-private export
  residentMage: string | null;        // 'cast-pleione' etc.
  mageVertex: string | null;          // 'V44' etc.
  artefactClass: string | null;       // 'tool' | 'staff' | etc.
  artefactName: string | null;
  ceremonyShape: string | null;       // 'hold-e-compare-e-map' etc.
  witnessedAt: string | null;         // held-only · ISO timestamp from a witness export
  bearerPrivate: boolean;             // explicit bearer_private: true marker (DO NOT INGEST signal)
  // v1.6.0 extended fields (per import-guide §1.1)
  archetypeAspect: string | null;     // staff-only · 'mage' | 'swordsman' (alexandrite dual-aspect)
  substrateFramework: string | null;  // creature-only · 'substrate-goose' | 'substrate-hermes' | cousin-introduced
  trueName: string | null;            // creature-only · BEARER-PRIVATE · NEVER display without explicit consent
  walksAccumulated: number | null;    // creature-only · advisory (cannot be verified without trust in A's signature)
  dispatchTargetShop: string | null;  // dispatch-only · target shop id the routing receipt points at
  dispatchArchetype: string | null;   // dispatch-only · 'mage' | 'swordsman' (the bearer's archetype at dispatch time)
  anchorAct: string | null;           // act node id this entity anchors to (e.g. 'tome-v-act-17' forge-side format)
}

// Parse master-template / forged-blade YAML frontmatter for workshop provenance.
// Falls back to filename prefix (e.g. "tailor-foo-v1.md" → shop-tailor) when no
// frontmatter is found.
export function parseWorkshopProvenance(text: string, filename?: string): WorkshopProvenance {
  let workshopId: string | null = null;
  let constellationId: string | null = null;
  let constellationVersion: number | null = null;

  const fm = text.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (fm) {
    const body = fm[1];
    const ws = body.match(/^\s*workshop:\s*([^\s#]+)\s*$/m);
    if (ws) workshopId = ws[1].trim();
    if (!workshopId) {
      const alt = body.match(/^\s*workshop_id:\s*([^\s#]+)\s*$/m);
      if (alt) workshopId = alt[1].trim();
    }
    const cid = body.match(/^\s*constellation_id:\s*([^\s#]+)\s*$/m);
    if (cid) constellationId = cid[1].trim();
    const cver = body.match(/^\s*constellation_version:\s*(\d+)\s*$/m);
    if (cver) constellationVersion = parseInt(cver[1], 10);
    if (!workshopId && constellationId) {
      const root = constellationId.match(/^([a-z]+)-/);
      if (root) workshopId = `shop-${root[1]}`;
    }
  }

  if (!workshopId && filename) {
    const m = filename.match(/^([a-z]+)-/);
    if (m) workshopId = `shop-${m[1]}`;
  }

  return { workshopId, constellationId, constellationVersion };
}

// Parse v1.6.0 entity-discriminator frontmatter. Default `entityKind` is 'artefact'
// for back-compat with v1.4.0 .mds (and chronicle §1.2 mandate).
//
// Returns null if no frontmatter block is present at all (caller should treat as
// pre-v1.4.0 / non-cityofmages export).
export function parseEntityFrontmatter(text: string): EntityFrontmatter | null {
  const fm = text.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!fm) return null;
  const body = fm[1];

  // Generic single-line YAML extractor · matches `key: value` (unquoted, quoted, or YAML-null).
  // Returns null when key absent OR value is the literal `null` / `~` (YAML null forms).
  const get = (key: string): string | null => {
    const re = new RegExp(`^\\s*${key}:\\s*(.+?)\\s*$`, 'm');
    const m = body.match(re);
    if (!m) return null;
    let v = m[1].trim();
    // Strip wrapping quotes if any
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    // Strip trailing inline comment (e.g. `release_destination: null    # still held`)
    const hashIdx = v.indexOf('#');
    if (hashIdx >= 0) v = v.slice(0, hashIdx).trim();
    if (v === 'null' || v === '~' || v === '') return null;
    return v;
  };

  const rawKind = get('entity_kind');
  const allowed: ParsedEntityKind[] = ['artefact', 'creature', 'held', 'dispatch'];
  const entityKind: ParsedEntityKind =
    rawKind && (allowed as string[]).includes(rawKind) ? (rawKind as ParsedEntityKind) : 'artefact';

  // bearer_private: true is the explicit "do NOT ingest publicly" marker the forge-side
  // emits on a bearer's full record export. The importer should refuse these for graph ingest.
  const bpRaw = get('bearer_private');
  const bearerPrivate = bpRaw !== null && bpRaw.toLowerCase() === 'true';

  const walksRaw = get('walks_accumulated');
  const walksAccumulated = walksRaw && /^\d+$/.test(walksRaw) ? parseInt(walksRaw, 10) : null;

  return {
    entityKind,
    workshopDistrict: get('workshop_district'),
    workshopRegister: get('workshop_register'),
    releaseDestination: get('release_destination'),
    bearerConsentToken: get('bearer_consent_token'),
    residentMage: get('resident_mage'),
    mageVertex: get('mage_vertex'),
    artefactClass: get('artefact_class'),
    artefactName: get('artefact_name'),
    ceremonyShape: get('ceremony_shape'),
    witnessedAt: get('witnessed_at'),
    bearerPrivate,
    archetypeAspect: get('archetype_aspect'),
    substrateFramework: get('substrate_framework'),
    trueName: get('true_name'),
    walksAccumulated,
    dispatchTargetShop: get('dispatch_target_shop'),
    dispatchArchetype: get('dispatch_archetype'),
    anchorAct: get('anchor_act'),
  };
}
