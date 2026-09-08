// Audit: list every node id with zero edges incident to it.
// Run: node scripts/audit-orphans.mjs
import { readGraph } from './read-graph.mjs';

const { nodes, edges } = await readGraph();

// Extract node ids (every `{ id: "..."` declaration)
const nodeIds = new Set(nodes.map(n => n.id));

// Extract every id used as source or target
const connected = new Set();
for (const edge of edges) { connected.add(edge.source); connected.add(edge.target); }

// Orphans = nodes with no edge incident
const orphans = [...nodeIds].filter(id => !connected.has(id)).sort();

// Edge endpoints that don't match any node (broken edges · would cause "node not found" crashes)
const missingNodes = [...connected].filter(id => !nodeIds.has(id)).sort();

console.log('=== Node count:', nodeIds.size);
console.log('=== Connected count:', [...connected].filter(id => nodeIds.has(id)).length);
console.log('=== Orphan nodes (zero edges):', orphans.length);
for (const id of orphans) console.log('   ', id);
console.log('=== Broken edge endpoints (referenced but undefined):', missingNodes.length);
for (const id of missingNodes) console.log('   ', id);
process.exitCode = missingNodes.length ? 1 : 0;
