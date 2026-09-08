// Read the same exported data as the app. Regex scans count comments and miss multiline objects.
import fs from 'node:fs';
import ts from 'typescript';

export async function loadGraphModule(source) {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
}

export async function readGraph() {
  const [nodes, edges] = await Promise.all(['nodes', 'edges'].map(async name =>
    loadGraphModule(fs.readFileSync(new URL(`../src/data/${name}.ts`, import.meta.url), 'utf8'))));
  return { nodes: nodes.NODES, edges: edges.EDGES };
}
