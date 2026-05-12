// Workshop / constellation identity parsed out of a artefact.md or constellation.md.
// Master constellation templates and forged blades both carry this in YAML frontmatter
// so the round-trip from master → spellweb → artefact.md → spellweb tags the same shop.

export interface WorkshopProvenance {
  workshopId: string | null;          // shop-<route>
  constellationId: string | null;     // e.g. tailor-cloak-weave-v1
  constellationVersion: number | null;
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
