// Audit: list every node id with zero edges incident to it.
// Run: node scripts/audit-orphans.mjs
import { readFileSync } from 'fs';

const nodesText = readFileSync('src/data/nodes.ts', 'utf8');
const edgesText = readFileSync('src/data/edges.ts', 'utf8');

// Extract node ids (every `{ id: "..."` declaration)
const nodeIds = new Set();
for (const m of nodesText.matchAll(/\{\s*id:\s*"([^"]+)"/g)) nodeIds.add(m[1]);

// Extract every id used as source or target
const connected = new Set();
for (const m of edgesText.matchAll(/source:\s*"([^"]+)"/g)) connected.add(m[1]);
for (const m of edgesText.matchAll(/target:\s*"([^"]+)"/g)) connected.add(m[1]);

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
