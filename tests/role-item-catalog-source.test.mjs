import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {tokens} from '../tools/lib/as2-data.mjs';import {buildRoleItemCoverage,ownership,sourceRoot} from '../tools/lib/role-item-coverage.mjs';
import {roleItemRuleCatalog} from '../src/content/role-item-rule-data.ts';
const dir='docs/reverse-engineering/content-registry/';const index=JSON.parse(fs.readFileSync(dir+'numeric-rule-index.json'));const report=JSON.parse(fs.readFileSync(dir+'role-item-coverage.json'));
const sourceCache=new Map();const lineAt=({file,line})=>{if(!sourceCache.has(file))sourceCache.set(file,fs.readFileSync(sourceRoot+file,'utf8').split(/\r?\n/));return sourceCache.get(file)[line-1]};
const expression=v=>v&&typeof v==='object'?Array.isArray(v)?'['+v.map(expression).join(',')+']':Object.keys(v).length===1&&'expression'in v?v.expression:'{'+Object.entries(v).map(([k,v])=>JSON.stringify(k)+':'+expression(v)).join(',')+'}':JSON.stringify(v);
const canonical=s=>{const ts=tokens(s);return ts.map((t,i)=>t.kind==='string'&&ts[i+1]?.value===':'?['key',t.value]:t.kind==='identifier'&&ts[i+1]?.value===':'?['key',t.value]:[t.kind,t.value]);};
function verifyValues(catalog){
 for(const r of catalog.records){const line=lineAt(r.source).trim();let rhs;
  if(r.operator==='return')rhs=line.replace(/^return\b\s*/,'').replace(/;\s*$/,'');
  else {const targetPosition=line.indexOf(r.target);assert.ok(targetPosition>=0,r.id);const position=line.indexOf(r.operator,targetPosition+r.target.length);assert.ok(position>=0,r.id);rhs=line.slice(position+r.operator.length).replace(/;\s*$/,'');}
  assert.deepEqual(canonical(expression(r.value)),canonical(rhs),'source value differs: '+r.id);
 }
 for(const r of catalog.supplements)assert.equal(r.expression,lineAt(r.source).trim());
}
test('every declared runtime value matches original RHS tokens; constants cannot hide dynamic expressions',()=>{verifyValues(roleItemRuleCatalog)});
test('ownership is exact, nonoverlapping, includes all RoleMC/ThingMC and preserves deferred pet/save work',()=>{
 assert.equal(report.records.length,2461);assert.equal(report.records.filter(r=>r.source.file==='__Packages/RoleMC.as').length,720);assert.equal(report.records.filter(r=>r.source.file==='__Packages/ThingMC.as').length,153);
 assert.ok(report.records.some(r=>r.target==='role.rateLife'));assert.ok(!report.records.some(r=>r.target==='bLife'));
 assert.equal(report.records.length+report.deferred.length,index.rules.length);assert.equal(new Set([...report.records,...report.deferred].map(r=>r.id)).size,index.rules.length);
 for(const r of index.rules)assert.equal(report.records.find(v=>v.id===r.id)?.group??null,ownership(r));
 assert.ok(report.supplements.some(r=>r.scope.includes('dropFlower')));assert.ok(report.supplements.some(r=>r.scope.includes('dropStone')));
 assert.ok(report.deferred.some(r=>r.owner==='TASK-DATA-019'));assert.ok(report.deferred.some(r=>r.id.startsWith('__Packages/HuanShouClass.as')));
 assert.deepEqual(buildRoleItemCoverage(index),report);
});
test('negative checks reject changed literal/expression, missing row, and duplicate numeric identity',()=>{
 const changed=structuredClone(roleItemRuleCatalog);changed.records.find(r=>typeof r.value==='number').value++;assert.throws(()=>verifyValues(changed),/source value differs/);
 const duplicate=structuredClone(index);duplicate.rules.push(duplicate.rules[0]);assert.throws(()=>buildRoleItemCoverage(duplicate),/Duplicate/);
 const missing=structuredClone(index);missing.rules=missing.rules.filter(r=>r.source.file!=='__Packages/ThingMC.as');assert.notDeepEqual(buildRoleItemCoverage(missing),report);
});
