import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'spellweb-star-test-'));
const modules={graph:'src/types/graph.ts',cityKey:'src/lib/cityKey.ts',proofPackets:'src/lib/proofPackets.ts','journey-store':'src/lib/journey-store.ts',starLoadout:'src/lib/starLoadout.ts',nodes:'src/data/nodes.ts',chains:'src/data/chains.ts'};  // 2026-11-17: starLoadout reads NODES (../data/nodes → ./chains)
for(const [name,file] of Object.entries(modules)) {
 let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
 for(const n of [...Object.keys(modules),'journey-core'])code=code.replaceAll(`'./${n}'`,`'./${n}.mjs'`);
 code=code.replaceAll("'../types/graph'","'./graph.mjs'").replaceAll("'../data/nodes'","'./nodes.mjs'").replaceAll("'react'",JSON.stringify(pathToFileURL(path.resolve('node_modules/react/index.js')).href));
 fs.writeFileSync(path.join(tmp,name+'.mjs'),code);
}
fs.copyFileSync('src/lib/journey-core.js',path.join(tmp,'journey-core.mjs'));
const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
globalThis.window={localStorage,dispatchEvent(){}};globalThis.CustomEvent=class{constructor(type){this.type=type;}};
const K=await import(pathToFileURL(path.join(tmp,'cityKey.mjs')));
const S=await import(pathToFileURL(path.join(tmp,'starLoadout.mjs')));
const input={version:1,name:'test',identity:{did:'test-only'},palette:{mage:'#123456'},future:{untouched:true}};
input.kappa=await K.kappaLabel(input);K.saveKey((await K.importKeyJSON(JSON.stringify(input))).key);
localStorage.setItem('spellweb:equipped-items',JSON.stringify(['shop-tailor','shop-tailor']));
await S.syncStarLoadout();const first=K.loadKey();
assert.deepEqual(first.payload.identity,input.identity);assert.deepEqual(first.payload.future,input.future);
// 2026-11-17: since c396597 a vertex-seated loadout item is folded in as a charge first, so the lineage is
// input → (charge fold, prior = input) → synced (prior = the folded head). Check both hops.
assert.ok(first.charges.some(c=>c.source==='loadout:equipped:shop-tailor'),'the equipped item became a charge');
assert.equal(first.payload.prior,first.priorKappa);
{ const fresh=(await K.importKeyJSON(JSON.stringify(input))).key; const folded=await K.foldCharge(fresh,{...first.charges.find(c=>c.source==='loadout:equipped:shop-tailor'),kappaAfter:undefined});
  assert.equal(folded.payload.prior,input.kappa,'the charge fold points back to the imported key');
  assert.equal(folded.kappa,first.payload.prior,'the synced key points back to that fold'); }assert.deepEqual(first.payload.spellwebLoadout.equipped,['shop-tailor']);
assert.equal(first.kappa,await K.kappaLabel(first.payload));
await S.syncStarLoadout();assert.equal(K.loadKey().kappa,first.kappa);
localStorage.setItem('spellweb:equipped-items','[]');await S.syncStarLoadout();
assert.deepEqual(K.loadKey().payload.spellwebLoadout.equipped,[]);assert.equal(K.loadKey().payload.prior,first.kappa);
localStorage.setItem('spellweb-forged-blades','{}');const before=K.loadKey().kappa;
await assert.rejects(S.syncStarLoadout(),/Invalid local inventory/);assert.equal(K.loadKey().kappa,before);
console.log('PASS Star sync lineage, identity preservation, repeated-sync idempotence, unequip snapshot and malformed-inventory rejection');
