// One-off coherence scan: agentprivacy_master tome templates vs spellweb canonical NODES.
// Checks every waypoint label, connection label, frontmatter workshop / resident_mage /
// mage_vertex against src/data/nodes.ts. Run: node scripts/template-coherence-scan.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const nodesSrc = readFileSync(new URL('../src/data/nodes.ts', import.meta.url), 'utf8');

// Extract node objects coarsely: id, label, vertex
const nodeRe = /\{ id: "([^"]+)",[^\n]*?label: "([^"]+)"/g;
const labels = new Set();
const byId = new Map();
let m;
while ((m = nodeRe.exec(nodesSrc)) !== null) {
  labels.add(m[2]);
  const vm = m[0].match(/vertex: (\d+)/);
  byId.set(m[1], { label: m[2], vertex: vm ? Number(vm[1]) : undefined });
}
// vertex may appear after label in the full line; rescan per-line for vertex on shop/cast lines
for (const line of nodesSrc.split('\n')) {
  const idm = line.match(/\{ id: "([^"]+)"/);
  if (!idm) continue;
  const vm = line.match(/vertex: (\d+)/);
  if (vm && byId.has(idm[1])) byId.get(idm[1]).vertex = Number(vm[1]);
}

const dir = 'C:/Users/mitch/agentprivacy_master/public/tomes/workshops';
const files = readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'CEREMONY_EVOLUTION.md');

let totalIssues = 0;
for (const f of files) {
  const content = readFileSync(join(dir, f), 'utf8');
  const issues = [];

  // frontmatter
  const fm = (key) => content.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^"|"$/g, '');
  const workshop = fm('workshop');
  const mage = fm('resident_mage');
  const mv = fm('mage_vertex');
  if (workshop && !byId.has(workshop)) issues.push(`frontmatter workshop "${workshop}" not in NODES`);
  if (mage && !byId.has(mage)) issues.push(`frontmatter resident_mage "${mage}" not in NODES`);
  if (mage && mv && byId.has(mage)) {
    const canonical = byId.get(mage).vertex;
    if (canonical !== undefined && `V${canonical}` !== mv) {
      issues.push(`frontmatter mage_vertex ${mv} ≠ canonical V${canonical} for ${mage}`);
    }
  }
  if (workshop && byId.has(workshop)) {
    const wv = byId.get(workshop).vertex;
    if (wv !== undefined && mv && `V${wv}` !== mv && mage && byId.get(mage)?.vertex === wv) {
      // fine — mage and workshop agree
    }
  }

  // waypoints: `N. emoji **label**`
  for (const wm of content.matchAll(/^\d+\.\s+(.+?)\s+\*\*(.+?)\*\*/gm)) {
    const label = wm[2].trim();
    if (!labels.has(label)) issues.push(`waypoint label not in NODES: "${label}"`);
  }
  // connection lines: `- a → b` (labels without ** wrap, emoji-prefixed)
  for (const cm of content.matchAll(/^- (.+?) → (.+)$/gm)) {
    for (const side of [cm[1], cm[2]]) {
      const stripped = side.trim().replace(/^[^\w·]*\s*/u, '').trim();
      // connection lines repeat the label after an emoji/glyph prefix; try suffix match against labels
      const hit = [...labels].some(L => side.includes(L));
      if (!hit) issues.push(`connection label unresolved: "${side.trim()}" (stripped: "${stripped}")`);
    }
  }

  if (issues.length) {
    totalIssues += issues.length;
    console.log(`\n── ${f}`);
    for (const i of issues) console.log(`   ✗ ${i}`);
  } else {
    console.log(`\n── ${f}\n   ✓ coherent`);
  }
}
console.log(`\n${totalIssues} issue(s) across ${files.length} templates`);
