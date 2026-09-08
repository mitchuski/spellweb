// Validate an evidence-backed graph batch against the actual exported graph.
// Optional --source-root <suite> also checks the pinned source bytes and anchors.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readGraph } from './read-graph.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const sourceFlag = args.indexOf('--source-root');
if (sourceFlag !== -1 && !args[sourceFlag + 1]) throw new Error('--source-root requires a directory');
const sourceRoot = sourceFlag < 0 ? null : path.resolve(args[sourceFlag + 1]);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/corpus/2026-09-08-ecosystem-foundations.json'), 'utf8'));
const { nodes, edges } = await readGraph();
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const edgeKey = e => `${e.source}|${e.type}|${e.target}`;
const canonical = value => value === null || typeof value !== 'object' ? JSON.stringify(value)
  : Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']'
  : '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
const ids = new Set(nodes.map(n => n.id));
check(ids.size === nodes.length, 'Duplicate graph node ID');
for (const edge of edges) check(ids.has(edge.source) && ids.has(edge.target), `Missing endpoint: ${edgeKey(edge)}`);
const safeReference = ref => typeof ref === 'string' && !path.isAbsolute(ref) && !/^[A-Za-z]:|\\|(^|\/)\.\.(\/|$)/.test(ref);
for (const [id, source] of Object.entries(manifest.sources)) {
  check(safeReference(source.path), `Unsafe source reference: ${id}`);
  check(/^[a-f0-9]{64}$/.test(source.sha256), `Missing source digest: ${id}`);
  check(typeof source.anchor === 'string' && source.anchor.length > 0, `Missing source anchor: ${id}`);
  if (sourceRoot && safeReference(source.path)) {
    try {
      const bytes = fs.readFileSync(path.join(sourceRoot, source.path));
      check(createHash('sha256').update(bytes).digest('hex') === source.sha256, `Source changed since census: ${id}`);
      check(bytes.toString('utf8').includes(source.anchor), `Source anchor missing: ${id}`);
    } catch (error) { errors.push(`Source unavailable: ${id}: ${error.code ?? error.message}`); }
  }
}
for (const node of manifest.nodes) {
  const actual = nodes.filter(n => n.id === node.id);
  check(actual.length === 1 && canonical(actual[0]) === canonical(node), `Node differs from evidence manifest: ${node.id}`);
  check(nodes.filter(n => n.label === node.label).length === 1, `Ambiguous batch label: ${node.label}`);
  check(edges.some(e => e.source === node.id || e.target === node.id), `Isolated batch node: ${node.id}`);
  check(node.evidence?.sources?.length > 0 && node.evidence.sources.every(safeReference), `Missing/unsafe evidence: ${node.id}`);
  const claim = manifest.assertions.find(a => a.node === node.id);
  check(claim && claim.coordinate.status === 'unassigned' && node.vertex === undefined, `Unjustified coordinate: ${node.id}`);
}
for (const edge of manifest.edges) {
  check(edges.filter(e => edgeKey(e) === edgeKey(edge)).length === 1, `Missing/duplicate batch edge: ${edgeKey(edge)}`);
  check(manifest.assertions.some(a => a.edge && edgeKey(a.edge) === edgeKey(edge) && a.rationale), `Missing edge rationale: ${edgeKey(edge)}`);
}
for (const assertion of manifest.assertions) check(assertion.sources?.length > 0 && assertion.sources.every(s => manifest.sources[s]), 'Assertion has missing source');
console.log(JSON.stringify({ graph: { nodes: nodes.length, edges: edges.length }, batch: { nodes: manifest.nodes.length, edges: manifest.edges.length, sources: Object.keys(manifest.sources).length }, sourceBytesChecked: !!sourceRoot, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
