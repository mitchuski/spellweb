// Refresh only the generated operating-practice blocks; leave the graph's authored data intact.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const canon=process.env.AGENTPRIVACY_SKILLS_ROOT||path.join(os.homedir(),'agentprivacy-skills');
const m=JSON.parse(fs.readFileSync(path.join(canon,'CITY_STAR_DISTRIBUTION.json'),'utf8'));
const marker='// CITY_STAR_OPERATING_PRACTICES';
const nf=path.join(root,'src/data/nodes.ts'),ef=path.join(root,'src/data/edges.ts');
let ns=fs.readFileSync(nf,'utf8').split(marker)[0].trimEnd(),es=fs.readFileSync(ef,'utf8').split(marker)[0].trimEnd();
const nodes=[],edges=[],practices=[];
for(const r of m.records){
 if(!r.node||r.classification!=='circulating')continue;
 const raw=fs.readFileSync(path.join(canon,r.source),'utf8');
 if(r.kind==='role'){
  const description=raw.match(/^description:\s*(".*")/m);
  if(!description)throw Error('Expected quoted description in '+r.source);
  if(ns.includes('"'+r.node+'"'))throw Error('Authored node conflicts with generated node '+r.node);
  nodes.push({id:r.node,type:'skill',label:r.title,domain:'shared',layer:'knowledge',desc:JSON.parse(description[1]),evidence:{status:'source record',observedAt:m.date,sources:['agentprivacy-skills/'+r.source],note:'Operational guidance; configured adapters remain necessary for live credentials and service authorization.'}});
  edges.push({source:r.node,target:'concept-agentprivacy-mcp',type:'references'});
 }else{
  if(!raw.includes(r.practice))throw Error('Persona practice differs from canonical source: '+r.source);
  if(!ns.includes('"'+r.node+'"'))nodes.push({id:r.node,type:'persona',label:r.title,domain:'mage',layer:'narrative',desc:r.practice});
  practices.push(`{ const persona = NODES.find(n => n.id === ${JSON.stringify(r.node)}); if (persona && !persona.desc?.includes(${JSON.stringify(r.practice)})) persona.desc = (persona.desc || '') + ${JSON.stringify(' City and Star practice: '+r.practice)}; }`);
  for(const s of r.skills)edges.push({source:r.node,target:'skill-'+s,type:'persona_knows'});
 }
}
// Build the complete files in memory before writing either output.
ns=ns+'\n\n'+marker+'\nNODES.push(...('+JSON.stringify(nodes,null,2)+' satisfies SpellwebNode[]));\n'+practices.join('\n')+'\n';
es=es+'\n\n'+marker+'\nEDGES.push(...('+JSON.stringify(edges,null,2)+' satisfies SpellwebEdge[]));\n';
fs.writeFileSync(nf,ns);fs.writeFileSync(ef,es);
console.log(`City/Star: ${nodes.length} indexed nodes, ${edges.length} relationships`);
