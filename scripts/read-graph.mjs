// Read the same exported data as the app. Regex scans count comments and miss multiline objects.
import fs from 'node:fs';
import ts from 'typescript';

const DATA = new URL('../src/data/', import.meta.url);

// A data module may import a sibling data module (nodes.ts and edges.ts import ./chains, the generated PoAW chains):
// each relative import is transpiled the same way and inlined as its own data URL, so the audits read the app's graph.
export async function loadGraphModule(source) {
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  for (const m of [...outputText.matchAll(/from\s+['"]\.\/([\w-]+)['"]/g)]) {
    const sib = ts.transpileModule(fs.readFileSync(new URL(`${m[1]}.ts`, DATA), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    outputText = outputText.replace(m[0], `from '${'data:text/javascript;base64,' + Buffer.from(sib).toString('base64')}'`);
  }
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}

export async function readGraph() {
  const [nodes, edges] = await Promise.all(['nodes', 'edges'].map(async name =>
    loadGraphModule(fs.readFileSync(new URL(`../src/data/${name}.ts`, import.meta.url), 'utf8'))));
  return { nodes: nodes.NODES, edges: edges.EDGES };
}
