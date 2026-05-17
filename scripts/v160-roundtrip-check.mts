// v1.6.0 interop round-trip · feeds served workshop .mds from agentprivacy_master
// through spellweb's parseEntityFrontmatter + crossValidateEntity. Standing gate
// alongside audit-orphans.mjs — run before any release that touches the import path.
//
// Usage:  node --experimental-strip-types scripts/v160-roundtrip-check.mts

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseEntityFrontmatter, parseWorkshopProvenance } from '../src/lib/workshop-provenance.ts';
import { crossValidateEntity } from '../src/lib/v160-cross-validate.ts';

const __filename = fileURLToPath(import.meta.url);
const here = dirname(__filename);
const repoRoot = resolve(here, '..');
const masterWorkshops = resolve(repoRoot, '..', 'agentprivacy_master', 'public', 'tomes', 'workshops');

const fixtures = [
  'staff-shop-hermes-fit-v1.md',
  'familiars-companion-tame-v1.md',
  'portal-room-dispatch-v1.md',
  'tailor-cloak-weave-v1.md',
  'forget-commissioned-blade-v1.md',
  'vault-placed-reflection-v1.md',
  'shield-shielded-memo-v1.md',
  'etherchanting-commitment-cut-v1.md',
  'jeweler-gem-set-v1.md',
  'holon-hitchhikers-composition-v1.md',
  'covenant-personhood-inscribed-v1.md',
  'circle-four-cardinal-garden-v1.md',
  'hall-bilateral-witness-v1.md',
  'bonfires-dragon-fire-v1.md',
  'solchanting-parallel-refraction-v1.md',
];

let totalErrors = 0;
let totalWarnings = 0;
let totalMissing = 0;

for (const file of fixtures) {
  const path = resolve(masterWorkshops, file);
  if (!existsSync(path)) {
    console.log(`MISSING  ${file}`);
    totalMissing++;
    continue;
  }
  const text = readFileSync(path, 'utf-8');
  const ent = parseEntityFrontmatter(text);
  const prov = parseWorkshopProvenance(text, file);
  if (!ent) {
    console.log(`NO-FM    ${file}`);
    totalMissing++;
    continue;
  }
  const cv = crossValidateEntity(ent, prov);
  totalErrors += cv.errors.length;
  totalWarnings += cv.warnings.length;
  const tag = cv.ok ? 'OK  ' : 'FAIL';
  console.log(
    `${tag}     ${file}  ` +
    `(kind=${ent.entityKind}, workshop=${prov.workshopId}, mage=${ent.residentMage}, ` +
    `errors=${cv.errors.length}, warnings=${cv.warnings.length})`,
  );
  if (cv.errors.length) for (const e of cv.errors) console.log(`         ERROR: ${e}`);
  if (cv.warnings.length) for (const w of cv.warnings) console.log(`         warn:  ${w}`);
  if (cv.successionBanner) console.log(`         banner: ${cv.successionBanner}`);
}

console.log(`\n=== Total: errors=${totalErrors}, warnings=${totalWarnings}, missing=${totalMissing}`);
process.exit(totalErrors === 0 ? 0 : 1);
