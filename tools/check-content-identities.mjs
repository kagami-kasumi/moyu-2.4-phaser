// TASK-DATA-015: source identities and references, not the later all-numeric/save gate.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {functionRange} from './lib/as2-data.mjs';
import {source,timeline} from './lib/first-slice.mjs';
import {identityCoverage} from './lib/identity-coverage.mjs';
import {verifyStaticDeclarations} from './lib/static-registration-evidence.mjs';
import {verifyEnemyRegistrations} from './lib/enemy-registration-evidence.mjs';
import {verifyObjectiveRegistrations} from './lib/objective-registration-evidence.mjs';
import {verifyRewardRegistrations} from './lib/reward-registration-evidence.mjs';
import {verifyProfessionRegistrations} from './lib/profession-registration-evidence.mjs';
import {verifyMapRegistrations} from './lib/map-registration-evidence.mjs';
import {verifyLiteralPetRegistrations} from './lib/pet-registration-evidence.mjs';
import {verifyLiteralItemRegistrations} from './lib/item-registration-evidence.mjs';
import {verifyParameterItems} from './lib/parameter-item-evidence.mjs';
import {verifyMissingFactoryItems} from './lib/missing-factory-evidence.mjs';
import {verifyBellRegistrations} from './lib/bell-registration-evidence.mjs';
import {verifyLuckyCharms} from './lib/lucky-charm-evidence.mjs';
import {verifyMiracleRegistration} from './lib/miracle-registration-evidence.mjs';
import {verifyRingRegistrations} from './lib/ring-registration-evidence.mjs';
const dir='docs/reverse-engineering/content-registry/';
const read=name=>JSON.parse(fs.readFileSync(dir+name,'utf8'));
const census=read('object-census.json'),audit=read('reference-audit.json'),defs=registryData.definitions;
const expected=[...verifyStaticDeclarations(defs),...verifyEnemyRegistrations(defs),...verifyObjectiveRegistrations(defs),...verifyRewardRegistrations(defs),...verifyProfessionRegistrations(defs)];
// Original SWF labels provide expected map identities, independently of AS survey output.
expected.push(...timeline(source(),4536).filter(f=>f.label).map(f=>'map:'+f.label));
verifyMapRegistrations(defs.filter(d=>d.kind==='map').map(d=>({name:d.name,source:d.source[0],...d.data})));
// Enumerate factory cases from original text, then execute each source factory branch offline.
// This catches a factory item missing from BOTH generated catalog and reference report.
const root='local-resources/moyu/source-index/as/scripts/';
const text=fs.readFileSync(root+'frame_9/DoAction.as','utf8');
const body=functionRange(text,'this.createThing =').text;
const cases=[...body.slice(body.indexOf('switch(_loc6_)')).matchAll(/case "([^"]+)":/g)].map(m=>m[1]);
const factory=vm.runInNewContext('(function(tThing,isDrop,fX,fY)'+body+')',{Math});
const factoryIds=new Set();
for(const alias of cases){
 let output,count=0;
 assert.equal(factory.call({backPack:{setThing(v){output=v;count++;}}},{type:alias}),true,'Source factory branch '+alias);
 assert.equal(count,1);
 const id='item:'+(output.name??output.type),record=defs.find(d=>d.id===id);
 assert.ok(record,'Missing factory identity '+id);
 assert.ok(record.aliases.includes(alias),'Missing factory alias '+alias);
 factoryIds.add(id);
}
expected.push(...factoryIds);
// Non-factory item constructors have separate, source-based evidence checks.
expected.push(...verifyRingRegistrations(defs),...verifyBellRegistrations(defs),...verifyLuckyCharms(defs),...verifyMissingFactoryItems(defs));
verifyLiteralItemRegistrations(defs);verifyParameterItems(defs);
// Independent flat-object scan of every original script for species declarations.
const petNames=new Set();let petSeeds=0;
for(const record of census.sources){
 if(record.file.includes('测试专用'))continue;
 const sourceText=fs.readFileSync(root+record.file,'utf8');
 for(const match of sourceText.matchAll(/\{[^{}]*\}/g)){
  if(!/\brateLife\s*:/.test(match[0])||!/\bmaxZs\s*:/.test(match[0]))continue;
  const name=match[0].match(/\btype\s*:\s*"([^"]+)"/)?.[1];
  if(!name){
   const line=sourceText.slice(0,match.index).split('\n').length;
   assert.ok(audit.anomalies.some(a=>a.source.file===record.file&&a.source.line===line&&a.classification==='malformed-pet-restore-reference'),'Unreviewed pet identity');
   continue; // Stored species reference, retained explicitly in the anomaly report below.
  }
  petNames.add(name);petSeeds++;
 }
}
expected.push(...[...petNames].map(n=>'pet:'+n));
const pets=verifyLiteralPetRegistrations(defs);verifyMiracleRegistration(defs);
assert.equal(petSeeds,defs.filter(d=>d.kind==='pet').reduce((n,d)=>n+d.data.initializations.length,0),'Pet seed completeness');
const categories=identityCoverage(defs,census,audit,expected);
const ids=new Set(defs.map(d=>d.id));
for(const map of defs.filter(d=>d.kind==='map')){
 for(const exit of map.data.destinations)assert.ok(ids.has('map:'+exit.map),'Missing map exit');
 for(const npc of map.data.npcs)assert.ok(ids.has('npc:'+npc),'Missing NPC reference');
}
for(const grant of registryData.startGrants)assert.ok(ids.has(grant.contentId),'Missing start grant');
const exclusions=audit.rows.filter(r=>!r.targets.length).map(r=>({source:r.source,classification:r.classification,reason:r.reason}));
const report={scope:'TASK-DATA-015 identity and reference coverage only',sourceSha256:registryData.sourceSha256,scripts:census.sources.length,candidateObjects:census.objects.length,categories,factoryAliases:cases.length,factoryIdentities:factoryIds.size,petSeeds,literalPetSeeds:pets.literalVariants,dynamicDomains:audit.dynamicDomains.length,exclusions,anomalies:audit.anomalies.map(a=>({...a,followUp:'TASK-DATA-019; does not define a new species'})),notClaimed:['complete numeric semantics (017/018)','persistence collision/default/restore semantics (019)','runtime migration and aggregate completion gate (020)','gameplay availability']};
const output=dir+'identity-coverage.json';
if(process.argv.includes('--write'))fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
else assert.deepEqual(read('identity-coverage.json'),report,'Identity report drift; inspect changes before --write');
console.log(JSON.stringify({result:'passed',identities:defs.length,categories,factoryAliases:cases.length,petSeeds,excludedReferences:exclusions.length,dynamicDomains:audit.dynamicDomains.length,persistenceAnomaliesDeferred:report.anomalies.length},null,2));
