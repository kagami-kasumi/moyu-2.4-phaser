import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {tokens,functionRange} from '../tools/lib/as2-data.mjs';
import {buildPetWorldCoverage,worldOwnership,sourceRoot} from '../tools/lib/pet-world-coverage.mjs';
import {petWorldRuleCatalog} from '../src/content/pet-world-rule-data.ts';
const dir='docs/reverse-engineering/content-registry/';
const index=JSON.parse(fs.readFileSync(dir+'numeric-rule-index.json')),report=JSON.parse(fs.readFileSync(dir+'pet-world-coverage.json')),role=JSON.parse(fs.readFileSync(dir+'role-item-coverage.json'));
const texts=new Map();function lines(file){if(!texts.has(file))texts.set(file,fs.readFileSync(sourceRoot+file,'utf8').split(/\r?\n/));return texts.get(file)}
const expr=v=>v&&typeof v==='object'?Array.isArray(v)?'['+v.map(expr).join(',')+']':Object.keys(v).length===1&&'expression'in v?v.expression:'{'+Object.entries(v).map(([k,v])=>JSON.stringify(k)+':'+expr(v)).join(',')+'}':JSON.stringify(v);
const canonical=s=>{const ts=tokens(s);return ts.map((t,i)=>(t.kind==='string'||t.kind==='identifier')&&ts[i+1]?.value===':'?['key',t.value]:[t.kind,t.value]);};
function verifyValues(catalog){
 for(const r of catalog.records){const line=lines(r.source.file)[r.source.line-1].trim();let rhs;
  if(r.operator==='return')rhs=line.replace(/^return\b\s*/,'').replace(/;\s*$/,'');
  else{const pos=line.indexOf(r.target);assert.ok(pos>=0,r.id);const at=line.indexOf(r.operator,pos+r.target.length);assert.ok(at>=0,r.id);rhs=line.slice(at+r.operator.length).replace(/;\s*$/,'');}
  assert.deepEqual(canonical(expr(r.value)),canonical(rhs),'source value differs: '+r.id);
 }
 for(const s of catalog.supplements){assert.equal(s.expression,lines(s.source.file)[s.source.line-1].trim());for(const c of s.conditions)assert.ok(c.header.startsWith(lines(s.source.file)[c.line-1].trim()),s.source.file+':'+c.line);}
}
function verifyPartition(records){const ids=[...role.records,...records].map(r=>r.id);assert.equal(ids.length,index.rules.length);assert.equal(new Set(ids).size,index.rules.length);assert.deepEqual([...ids].sort(),index.rules.map(r=>r.id).sort());}
test('full numeric index is partitioned without duplication and persistence is explicitly handed off, never certified by 018',()=>{
 verifyPartition(report.records);assert.equal(report.records.length,7150);assert.equal(report.records.filter(r=>r.group==='persistence-handoff').length,927);
 for(const r of report.records)assert.equal(r.group,worldOwnership(r));
 for(const r of report.records.filter(r=>['persistence-handoff','presentation-or-control'].includes(r.representation)))assert.ok(r.exclusionReason?.length>20,r.id);
 for(const g of Object.values(report.groups))for(const module of g.runtime)assert.ok(fs.existsSync('src/content/'+module+'.ts'),module);
 assert.ok(!petWorldRuleCatalog.records.some(r=>['persistence-handoff','presentation-or-control'].includes(r.representation)));
 assert.deepEqual(buildPetWorldCoverage(index),report);
 assert.equal(petWorldRuleCatalog.records.length,report.records.filter(r=>!['persistence-handoff','presentation-or-control'].includes(r.representation)).length);
});
test('every pet/world RHS and ordered supplement agrees with independent original source tokens',()=>verifyValues(petWorldRuleCatalog));
test('assignment-free drop chances, calls, and all NPC command guards survive numeric catalog projection',()=>{
 const map='DefineSprite_4536/frame_1/DoAction.as',npc='DefineSprite_4312/frame_1/DoAction.as';
 const drop=functionRange(fs.readFileSync(sourceRoot+map,'utf8'),'this.dropItem =');
 for(const file of [map,npc])for(const [i,line]of lines(file).entries()){
  if(file===map&&(i+1<635||i+1>=drop.line+drop.text.split('\n').length))continue;
  if(!/^\s*(?:if\(random\(|case\s|this\._parent\.createThing\(|this\.drop\w+\()/.test(line))continue;
  // Source-only method declarations and empty formatting do not count.
  assert.ok(report.supplements.some(s=>s.source.file===file&&s.source.line===i+1),'missing control/call '+file+':'+(i+1));
 }
 assert.ok(report.supplements.some(s=>s.expression==='if(random(10000) > 5000)'));
 assert.ok(report.supplements.some(s=>s.scope==='this.dropItem = function(mName, fX, fY, level)'&&s.conditions.some(c=>c.header.includes('case "头目"'))));
});
test('negative checks expose mutations, missing ownership, duplicate IDs and unclassified files',()=>{
 const changed=structuredClone(petWorldRuleCatalog);changed.records.find(r=>typeof r.value==='number').value++;assert.throws(()=>verifyValues(changed),/source value differs/);
 assert.throws(()=>verifyPartition(report.records.slice(1)));assert.throws(()=>verifyPartition([...report.records,report.records[0]]));
 const dup=structuredClone(index);dup.rules.push(dup.rules[0]);assert.throws(()=>buildPetWorldCoverage(dup),/Duplicate/);
 assert.throws(()=>worldOwnership({...report.records[0],source:{file:'new-world-module.as',line:1}}),/Unclassified/);
});
