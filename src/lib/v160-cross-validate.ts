/**
 * v1.6.0 import cross-validator · runs the import-guide §4 checks against canonical NODES.
 *
 * Per `agentprivacy_master/docs/chronicles/2026-05-14_v1_6_0_artefact_creature_import_guide.md`
 * §4.1 (seven cross-validation checks) and §4.2 (succession-aware validation).
 *
 * Hard errors → refuse import + alert. Warnings → allow import with annotation/banner.
 *
 * Wired from `handleWitnessBladeFile` in SpellWeb.tsx after `parseEntityFrontmatter`,
 * before the entity-kind branches.
 */

import { NODES } from '../data/nodes';
import type { EntityFrontmatter } from './workshop-provenance';

export interface CrossValidationResult {
  ok: boolean;
  errors: string[];                 // hard failures · refuse import
  warnings: string[];               // soft failures · allow import with annotation
  successionBanner: string | null;  // populated when keeper is superseded
}

/**
 * Forge-side `anchor_act` format ('tome-v-act-17') → spellweb NODES id format ('act-tome-v-17').
 * The forge-side (agentprivacy_master) emits the chronicle-narrative slug; spellweb's NODES
 * use the inverted form. Normalise here so cross-validation works without changing either side.
 */
function normalizeAnchorAct(raw: string): string {
  const m = raw.match(/^(tome-[ivx]+)-act-(\d+)$/i);
  return m ? `act-${m[1]}-${m[2]}` : raw;
}

/**
 * Hard-coded keeper-succession map. Per `src/data/nodes.ts:1492`, superseded cast (Bestia /
 * Therai / Pelagia / Triodos) are NOT included in spellweb NODES — provenance lives at the
 * chronicle/grimoire layer only. The import-side preserves succession context via this map
 * so that a v1.4.0/v1.5.x .md whose `resident_mage` is a superseded keeper imports cleanly
 * with a "stale provenance" banner rather than rejecting outright.
 *
 * Import-guide §4.2: render the artefact under the current canonical keeper's aspect; show
 * a banner explaining the succession.
 */
const KEEPER_SUCCESSION: Record<string, { canonical: string; sinceDate: string; banner: string }> = {
  'cast-bestia': {
    canonical: 'cast-hermaion',
    sinceDate: '2026-05-14',
    banner: 'This artefact was forged before the 2026-05-14 Hermaion admission · Bestia 📖 was the inception-state keeper of the Staff Shop',
  },
  'cast-therai': {
    canonical: 'cast-faunia',
    sinceDate: '2026-05-14',
    banner: 'This artefact was forged before the 2026-05-14 Faunia admission · Therai 🐾 was the inception-state keeper of the Familiars',
  },
  'cast-pelagia': {
    canonical: 'cast-pleione',
    sinceDate: '2026-05-14',
    banner: 'This artefact was forged before the 2026-05-14 Pleione admission · Pelagia 🌊 was the inception-state keeper of the Chart Shop',
  },
};

/**
 * Where each `release_destination` value points · used for check 7 below.
 * `open-sea` has no shop target (the bearer carries on; nothing materialises in the City).
 */
const RELEASE_TARGETS: Record<string, string | null> = {
  bonfire: 'shop-bonfires',
  weavers: 'shop-tailor',
  'open-sea': null,
};

/**
 * Run all seven cross-validation checks against `ent` + `prov`. Order matches import-guide §4.1.
 *
 * The validator is *liberal in what it accepts* (warnings rather than hard errors for vertex
 * mismatch, missing anchor_act, etc.) and *strict on identity* (unknown workshop / cast /
 * substrate are hard errors — no point persisting an import that references nothing).
 */
export function crossValidateEntity(
  ent: EntityFrontmatter,
  prov: { workshopId: string | null; constellationId: string | null },
): CrossValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let successionBanner: string | null = null;

  // Check 1 · workshop resolves
  let workshopNode: ReturnType<typeof NODES.find> | undefined;
  if (prov.workshopId) {
    workshopNode = NODES.find(n => n.id === prov.workshopId);
    if (!workshopNode) {
      errors.push(`Unknown workshop: ${prov.workshopId}`);
    }
  } else {
    warnings.push('No workshop in frontmatter (provenance will fall back to filename)');
  }

  // Check 2 · resident_mage resolves (with succession-aware fallback)
  let castNode: ReturnType<typeof NODES.find> | undefined;
  if (ent.residentMage) {
    castNode = NODES.find(n => n.id === ent.residentMage);
    if (!castNode) {
      const succession = KEEPER_SUCCESSION[ent.residentMage];
      if (succession) {
        successionBanner = succession.banner;
        // Resolve to the canonical successor for downstream rendering
        castNode = NODES.find(n => n.id === succession.canonical);
        if (!castNode) {
          // The canonical successor itself doesn't resolve — data drift; refuse.
          errors.push(`Succession map points at ${succession.canonical} but it is not in NODES`);
        }
      } else {
        errors.push(`Unknown resident_mage: ${ent.residentMage}`);
      }
    }
  }

  // Check 3 · vertex agreement (resident_mage's canonical vertex matches frontmatter mage_vertex)
  if (castNode && ent.mageVertex && castNode.vertex !== undefined) {
    const expectedVertex = `V${castNode.vertex}`;
    if (expectedVertex !== ent.mageVertex) {
      warnings.push(
        `mage_vertex "${ent.mageVertex}" ≠ canonical "${expectedVertex}" for ${castNode.id} — stale provenance`,
      );
    }
  }

  // Check 4 · anchor_act resolves (forge-side format normalised to NODES id format)
  if (ent.anchorAct) {
    const normalized = normalizeAnchorAct(ent.anchorAct);
    if (!NODES.some(n => n.id === normalized)) {
      warnings.push(`anchor_act "${ent.anchorAct}" does not resolve to a known act node`);
    }
  }

  // Check 5 · substrate_framework resolves (creature only)
  if (ent.entityKind === 'creature' && ent.substrateFramework) {
    if (!NODES.some(n => n.id === ent.substrateFramework)) {
      errors.push(
        `Unknown substrate_framework: ${ent.substrateFramework} ` +
        `(cousin-introduced substrates not yet admissible · held for v1.7.0)`,
      );
    }
  }

  // Check 6 · archetype-modal validation (archetype_aspect set only on archetype-modal shops)
  if (ent.archetypeAspect) {
    const allowedAspects = ['mage', 'swordsman'];
    if (!allowedAspects.includes(ent.archetypeAspect)) {
      errors.push(`archetype_aspect "${ent.archetypeAspect}" must be 'mage' or 'swordsman'`);
    }
    if (workshopNode && !workshopNode.archetypeModal) {
      errors.push(
        `archetype_aspect set on non-archetype-modal workshop ${prov.workshopId} ` +
        `(only Staff Shop carries archetypeModal: true at v1.6.0)`,
      );
    }
  }

  // Check 7 · release_destination resolves to a known target shop (held only)
  if (ent.entityKind === 'held' && ent.releaseDestination) {
    if (!(ent.releaseDestination in RELEASE_TARGETS)) {
      errors.push(
        `release_destination "${ent.releaseDestination}" must be one of: bonfire, weavers, open-sea, null`,
      );
    } else {
      const targetShop = RELEASE_TARGETS[ent.releaseDestination];
      if (targetShop !== null && !NODES.some(n => n.id === targetShop)) {
        errors.push(
          `release_destination "${ent.releaseDestination}" → "${targetShop}" does not resolve in NODES`,
        );
      }
    }
  }

  // Cross-validate entity_kind ↔ workshop_register coupling (import-guide §2.2 second bullet)
  if (workshopNode?.workshopRegister && ent.entityKind !== 'artefact') {
    const requiredRegister: Record<string, string> = {
      creature: 'spawn_and_bind',
      held: 'attentional',
      dispatch: 'spawn_and_bind',
    };
    const required = requiredRegister[ent.entityKind];
    if (required && workshopNode.workshopRegister !== required) {
      errors.push(
        `entity_kind: ${ent.entityKind} requires workshop_register: ${required}, ` +
        `but ${prov.workshopId} has register: ${workshopNode.workshopRegister}`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    successionBanner,
  };
}
