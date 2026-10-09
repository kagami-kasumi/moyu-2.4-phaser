// Fail-closed completion checks. A passing result still requires task-level runtime/visual gates.
import fs from 'node:fs';
import {registryData} from '../src/content/registry-data.ts';
import {contentNamed} from '../src/content/registry.ts';
import {referenceCompletionIssues} from './lib/reference-completion.mjs';
import {persistenceCompletionIssues,acceptedPersistenceAnomaly} from './lib/persistence-completion.mjs';
import {PERSISTENCE_REPAIRS} from '../src/content/persistence-repairs.ts';
import {integratedNumericCoverage} from './lib/registry-integration.mjs';
const dir='docs/reverse-engineering/content-registry/';
const read=name=>JSON.parse(fs.readFileSync(dir+name,'utf8'));
const survey=read('source-survey.json'),audit=read('reference-audit.json'),numeric=read('numeric-rule-index.json'),persistence=read('persistence-survey.json');
const issues=[],ids=new Set();
issues.push(...persistenceCompletionIssues(persistence,PERSISTENCE_REPAIRS));
issues.push(...referenceCompletionIssues(audit,a=>acceptedPersistenceAnomaly(a,persistence,PERSISTENCE_REPAIRS)));
function require(condition,message){if(!condition)issues.push(message);}
for(const d of registryData.definitions){
 require(!ids.has(d.id),'Duplicate identity '+d.id);ids.add(d.id);
 require(d.source.length>0,'Missing source '+d.id);
 for(const alias of new Set([d.name,...d.aliases]))require(contentNamed(d.kind,alias).some(x=>x.id===d.id),'Alias lookup loses '+d.id+' / '+alias);
}
for(const r of audit.rows){
 require(!r.unresolved,'Unresolved object '+JSON.stringify(r.source));
 for(const id of r.targets)require(ids.has(id),'Unknown reference '+id);
}
for(const domain of audit.dynamicDomains)require(domain.missing.length===0,'Incomplete identity domain '+JSON.stringify(domain.source));
for(const grant of registryData.startGrants)require(ids.has(grant.contentId),'Missing start grant '+grant.contentId);
const mapDefinitions=registryData.definitions.filter(d=>d.kind==='map');
require(mapDefinitions.length===survey.maps.length,'Map registry count differs from source inventory');
for(const map of survey.maps)require(mapDefinitions.some(d=>d.name===map.name&&d.data.frame===map.frame),'Missing map/frame '+map.name);
for(const map of mapDefinitions){
 for(const exit of map.data.destinations)require(ids.has('map:'+exit.map),'Unknown map exit '+map.id+' / '+exit.map);
 for(const npc of map.data.npcs)require(ids.has('npc:'+npc),'Unknown map NPC '+map.id+' / '+npc);
 require(map.evidenceScope?.notClaimed.includes('map gameplay'),'Map evidence must distinguish registration from playable behavior: '+map.id);
}
let integrated;
try{integrated=integratedNumericCoverage(numeric,read('role-item-coverage.json'),read('pet-world-coverage.json'),read('persistence-coverage.json'),persistence);}catch(error){issues.push(error.message);}
require(persistence.status==='final-schema-reviewed','Persistence dictionary remains '+persistence.status+'; type evidence alone is insufficient');
const weakDefaults=persistence.fields.filter(f=>['unknown','source-initialization-steps'].includes(f.default.status));
require(weakDefaults.length===0,'Unreviewed persistence defaults: '+weakDefaults.map(f=>f.owner+'.'+f.property).join(', '));
// The audit's historical classification label is retained. Actual identity,
// dynamic-domain and anomaly contracts are checked above and by the source gates.
const unreviewed=registryData.definitions.filter(d=>d.evidence!=='verified');
require(unreviewed.length===0,`Content evidence scope not finalized: ${unreviewed.length} inferred records`);
if(issues.length){console.error('Content registry is NOT complete:\n'+issues.map(x=>' - '+x).join('\n'));process.exitCode=1;}
else {
 const file=dir+'integration-coverage.json',report=JSON.stringify(integrated,null,2)+'\n';
 if(process.argv.includes('--write'))fs.writeFileSync(file,report);
 else if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==report){console.error('Integration coverage drift');process.exitCode=1;}
 else console.log('Content registry identity, reference and semantic integration passed for TASK-DATA-020. Runtime/visual gates remain separate.');
}
