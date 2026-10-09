import assert from 'node:assert/strict';
/** Exact ownership joins. Historical reviewed-module flags are not evidence of completion. */
export function integratedNumericCoverage(index,role,world,persistence,schema){
 const expected=new Map(index.rules.map(r=>[r.id,r]));
 assert.equal(expected.size,index.rules.length,'Duplicate numeric source ID');
 const owned=new Map();
 for(const [task,report] of [['TASK-DATA-017',role],['TASK-DATA-018',world]])for(const r of report.records){
  assert.ok(expected.has(r.id),'Unknown numeric ID '+r.id);
  assert.ok(!owned.has(r.id),'Duplicate ownership '+r.id);
  assert.deepEqual(r.source,expected.get(r.id).source,'Source drift '+r.id);
  assert.deepEqual(r.value,expected.get(r.id).value,'Value drift '+r.id);
  assert.equal(r.review,r.representation==='persistence-handoff'?'ownership-only-for-019':'declarative-source-contract','Unreviewed '+r.id);
  assert.ok(report.groups[r.group],'Unknown group '+r.id);
  owned.set(r.id,{id:r.id,task,group:r.group,representation:r.representation});
 }
 assert.deepEqual([...owned.keys()].sort(),[...expected.keys()].sort(),'Missing numeric ownership');
 const handoff=world.records.filter(r=>r.representation==='persistence-handoff').map(r=>r.id);
 assert.equal(new Set(persistence.records.map(r=>r.id)).size,persistence.records.length,'Duplicate persistence disposition');
 assert.deepEqual(persistence.records.map(r=>r.id).sort(),handoff.sort(),'Persistence handoff mismatch');
 const fields=new Set(schema.fields.map(f=>typeof f.key==='string'?f.key:f.key.expression));
 const dispositions=new Set(['transient-slot-ui','field-semantics','transient-preload','transient-control','derived-restore-container','derived-entry-routing','legacy-version-adjustment']);
 for(const r of persistence.records){
  assert.ok(dispositions.has(r.disposition)&&r.reason?.length>0,'Missing persistence disposition '+r.id);
  if(r.disposition==='field-semantics')assert.ok(r.fields.length,'Empty field mapping '+r.id);
  for(const f of r.fields)assert.ok(fields.has(f),'Unknown persistent field '+f);
  owned.get(r.id).persistence={task:'TASK-DATA-019',disposition:r.disposition,fields:r.fields};
 }
 return {task:'TASK-DATA-020',scope:'Source declaration registration, explicit exclusions and persistence dispositions; not full gameplay',counts:{numeric:expected.size,roleItem:role.records.length,petWorld:world.records.length,persistence:handoff.length,fields:fields.size},records:[...owned.values()]};
}
