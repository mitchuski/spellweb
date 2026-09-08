import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGraphModule } from './read-graph.mjs';

test('graph census includes multiline/spread data, excludes comments, preserves duplicates for audits', async () => {
  const { NODES, EDGES } = await loadGraphModule(`
    import type { SpellwebNode } from '../types/graph';
    // { id: "comment-only", type: "concept" }
    const extra = [{ id: 'multiline',
      label: 'A, quoted: "name"', vertex: 0 }];
    export const NODES: SpellwebNode[] = [...extra, { id: 'duplicate' }, { id: 'duplicate' }];
    /* { source: "fake", target: "missing", type: "requires" } */
    export const EDGES = [{ source: 'multiline',
      target: 'duplicate', type: 'references' }];
  `);
  assert.deepEqual(NODES.map(n => n.id), ['multiline', 'duplicate', 'duplicate']);
  assert.equal(NODES[0].vertex, 0);
  assert.equal(NODES[0].label, 'A, quoted: "name"');
  assert.deepEqual(EDGES, [{ source: 'multiline', target: 'duplicate', type: 'references' }]);
});
