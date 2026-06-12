// Graph coherence audit: nodes.ts × edges.ts × graph.ts type unions.
// Checks: duplicate ids · duplicate labels (imports resolve by label!) · dangling edge
// endpoints · edge/node types outside their unions · orphan nodes (no edges) ·
// inhabits-edge vs vertex-field agreement · vertex-vN id vs vertex field ·
// shopAnchor → workshop href resolution.
// Run: node scripts/graph-coherence-audit.mjs
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const nodesSrc = read('../src/data/nodes.ts');
const edgesSrc = read('../src/data/edges.ts');
const graphSrc = read('../src/types/graph.ts');

// ── Parse type unions ──
function parseUnion(name) {
  const lines = graphSrc.split('\n');
  const start = lines.findIndex(l => l.includes(`export type ${name} =`));
  if (start === -1) return new Set();
  const members = new Set();
  for (let i = start; i < lines.length; i++) {
    // Strip \r first (CRLF: `.` never matches \r, so `//.*$` would silently no-op), then comments.
    const code = lines[i].replace(/\r$/, '').replace(/\/\/.*/, '');
    for (const m of code.matchAll(/'([\w-]+)'/g)) members.add(m[1]);
    if (code.includes(';')) break;
  }
  return members;
}
const NODE_TYPES = parseUnion('NodeType');
const EDGE_TYPES = parseUnion('EdgeType');

// ── Parse nodes (one object per line in this codebase) ──
const nodes = new Map(); // id → { type, label, vertex, href, shopAnchor, line }
const dupIds = [];
nodesSrc.split('\n').forEach((line, i) => {
  const id = line.match(/\{ id: "([^"]+)"/)?.[1];
  if (!id) return;
  const get = (k) => line.match(new RegExp(`${k}: "([^"]*)"`))?.[1];
  const vertex = line.match(/vertex: (\d+)/)?.[1];
  if (nodes.has(id)) dupIds.push(`${id} (lines ${nodes.get(id).line} + ${i + 1})`);
  nodes.set(id, { type: get('type'), label: get('label'), vertex: vertex !== undefined ? Number(vertex) : undefined, href: get('href'), shopAnchor: get('shopAnchor'), line: i + 1 });
});

// ── Parse edges ──
const edges = [];
for (const m of edgesSrc.matchAll(/\{ source: "([^"]+)",\s*target: "([^"]+)",\s*type: "([^"]+)"/g)) {
  edges.push({ source: m[1], target: m[2], type: m[3] });
}

const issues = { error: [], warn: [] };
const log = (sev, msg) => issues[sev].push(msg);

// 1 · duplicate ids
for (const d of dupIds) log('error', `duplicate node id: ${d}`);

// 2 · duplicate labels (imports resolve waypoints by exact label)
const byLabel = new Map();
for (const [id, n] of nodes) {
  if (!n.label) continue;
  if (byLabel.has(n.label)) log('warn', `duplicate label "${n.label}": ${byLabel.get(n.label)} + ${id}`);
  else byLabel.set(n.label, id);
}

// 3 · dangling edge endpoints + 4 · unknown edge types
const touched = new Set();
for (const e of edges) {
  if (!nodes.has(e.source)) log('error', `edge source missing: ${e.source} --${e.type}--> ${e.target}`);
  if (!nodes.has(e.target)) log('error', `edge target missing: ${e.source} --${e.type}--> ${e.target}`);
  if (!EDGE_TYPES.has(e.type)) log('error', `edge type not in EdgeType union: "${e.type}" (${e.source} → ${e.target})`);
  touched.add(e.source); touched.add(e.target);
}

// 4b · node types
for (const [id, n] of nodes) {
  if (n.type && !NODE_TYPES.has(n.type)) log('error', `node type not in NodeType union: ${id} has "${n.type}"`);
}

// 5 · orphans (no edges at all), grouped by type
const orphans = [...nodes.entries()].filter(([id]) => !touched.has(id));
const orphansByType = {};
for (const [id, n] of orphans) (orphansByType[n.type ?? '?'] ??= []).push(id);

// 6 · inhabits agreement: source.vertex vs target vertex number
for (const e of edges.filter(e => e.type === 'inhabits')) {
  const src = nodes.get(e.source);
  const tv = e.target.match(/^vertex-v(\d+)$/)?.[1];
  if (!src || tv === undefined) continue;
  if (src.vertex !== undefined && src.vertex !== Number(tv)) {
    log('error', `inhabits mismatch: ${e.source} has vertex:${src.vertex} but inhabits ${e.target}`);
  }
  if (src.vertex === undefined) log('warn', `inhabits without vertex field: ${e.source} inhabits ${e.target} (no vertex on node)`);
}

// 7 · vertex node id vs its vertex field
for (const [id, n] of nodes) {
  const m = id.match(/^vertex-v(\d+)$/);
  if (m && n.vertex !== undefined && n.vertex !== Number(m[1])) {
    log('error', `vertex id/field mismatch: ${id} has vertex:${n.vertex}`);
  }
}

// 8 · shopAnchor resolves to a workshop href
const hrefs = new Set([...nodes.values()].filter(n => n.type === 'workshop' && n.href).map(n => n.href));
for (const [id, n] of nodes) {
  if (n.shopAnchor && !hrefs.has(n.shopAnchor)) {
    log('warn', `shopAnchor "${n.shopAnchor}" on ${id} matches no workshop href`);
  }
}

// ── Report ──
console.log(`nodes: ${nodes.size} · edges: ${edges.length} · node types: ${NODE_TYPES.size} · edge types: ${EDGE_TYPES.size}\n`);
console.log(`── ERRORS (${issues.error.length}) ──`);
issues.error.forEach(m => console.log(`  ✗ ${m}`));
console.log(`\n── WARNINGS (${issues.warn.length}) ──`);
issues.warn.forEach(m => console.log(`  ⚠ ${m}`));
console.log(`\n── ORPHANS (${orphans.length} nodes with no edges) ──`);
for (const [type, ids] of Object.entries(orphansByType).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${type} (${ids.length}): ${ids.join(', ')}`);
}
process.exitCode = issues.error.length > 0 ? 1 : 0;
