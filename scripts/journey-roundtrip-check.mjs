// Exercise the real TypeScript modules with browser storage in memory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'spellweb-journey-'));
try {
  for (const [source, name] of [['src/types/graph.ts', 'graph'], ['src/lib/proofPackets.ts', 'proofPackets'], ['src/lib/cityKey.ts', 'cityKey']]) {
    const result = ts.transpileModule(fs.readFileSync(path.join(root, source), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
    fs.writeFileSync(path.join(temp, name + '.mjs'), result.outputText.replaceAll("'../types/graph'", "'./graph.mjs'"));
  }
  const storage = new Map();
  globalThis.localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) };
  globalThis.window = { localStorage: globalThis.localStorage, dispatchEvent() {} };
  globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
  const P = await import(pathToFileURL(path.join(temp, 'proofPackets.mjs')));
  const K = await import(pathToFileURL(path.join(temp, 'cityKey.mjs')));
  const G = await import(pathToFileURL(path.join(temp, 'graph.mjs')));
  const original = { v: 1, proof: 'fixture-only', shopHref: '/tailor', payloadMode: 'refractive', publicFacet: 'chosen role', ceremonyTrace: [{ phase: 'weave', kind: 'hash', evidence: 'fixture' }], extension: { unknown: [1, 2] } };
  P.ingestPacketsPayload({ kind: 'spellweb.bearer.packets', packets: [original] });
  assert.deepEqual(P.exportOriginalPackets().packets, [original]);
  original.extension.unknown.push(3);
  assert.deepEqual(P.exportOriginalPackets().packets[0].extension.unknown, [1, 2]);
  assert.equal(P.ingestPacketsPayload({ kind: 'spellweb.bearer.packets', packets: [original] }).added, 0);
  assert.deepEqual(P.exportOriginalPackets().packets[0].extension.unknown, [1, 2]);
  // Older storage cannot be presented as original evidence, but can be restored.
  localStorage.setItem(G.SPELLWEB_STORAGE_KEYS.proofPackets, JSON.stringify([{ proof: 'legacy', shopHref: '/tailor' }]));
  assert.deepEqual(P.exportOriginalPackets().unavailable, ['legacy']);
  const recovered = { ...original, proof: 'legacy' };
  P.ingestPacketsPayload({ kind: 'spellweb.bearer.packets', packets: [recovered] });
  assert.deepEqual(P.exportOriginalPackets().packets, [recovered]);
  assert.deepEqual(P.exportOriginalPackets().unavailable, []);

  const payload = { name: 'journey fixture', version: 1, palette: {}, descriptions: {}, identity: { publicKeyHex: '01'.repeat(32), displayName: 'participant', extra: { retain: true } }, did: 'fixture-did', journey: { version: 1, steps: [] }, walks: [], future: { x: 1 } };
  payload.kappa = await K.kappaLabel(payload);
  const imported = await K.importKeyJSON(JSON.stringify(payload));
  assert.equal(imported.verified, true);
  assert.deepEqual(JSON.parse(K.exportKeyJSON(imported.key)), payload);
  const folded = await K.foldCharge(imported.key, { id: 'fixture-step', label: 'explored a page', source: 'fixture', vertex: 19, weight: 1, foldedAt: '2026-09-07T12:00:00Z' });
  for (const field of ['identity', 'did', 'journey', 'walks', 'future']) assert.deepEqual(folded.payload[field], payload[field]);
  assert.equal(folded.payload.prior, payload.kappa);
  assert.equal(folded.kappa, await K.kappaLabel(folded.payload));
  console.log('PASS original packet retention, legacy recovery, no duplicate overwrite, identity/extension preservation, lineage and re-derived kappa');
} finally {
  // Native Node removal of precisely the directory minted by mkdtemp above.
  fs.rmSync(temp, { recursive: true, force: true });
}
