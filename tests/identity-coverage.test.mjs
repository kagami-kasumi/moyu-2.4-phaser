import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registryData} from '../src/content/registry-data.ts';
import {identityCoverage} from '../tools/lib/identity-coverage.mjs';
const read=name=>JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/'+name,'utf8'));
const census=read('object-census.json'),audit=read('reference-audit.json'),defs=registryData.definitions;
// Mutations isolate gate invariants. The CLI obtains its expectation independently from source.
const expected=defs.map(d=>d.id);
test('identity scope retains, but does not falsely close, the persistence anomaly',()=>{
 assert.equal(identityCoverage(defs,census,audit,expected).length,13);
 const changed=structuredClone(audit);changed.anomalies=[];
 assert.throws(()=>identityCoverage(defs,census,changed,expected),/Missing anomaly/);
});
test('missing identities, duplicate identities and substituted census rows fail closed',()=>{
 assert.throws(()=>identityCoverage(defs.slice(1),census,audit,expected),/Missing source identities/);
 assert.throws(()=>identityCoverage([...defs,defs[0]],census,audit,expected),/Duplicate registry/);
 const changed=structuredClone(audit);changed.rows[0]=changed.rows[1];
 assert.throws(()=>identityCoverage(defs,census,changed,expected),/reference anchor/);
});
test('unresolved domains and unrelated targets cannot be waived by a completion label',()=>{
 const changed=structuredClone(audit);changed.status='complete';
 changed.dynamicDomains[0].missing=['unregistered'];
 assert.throws(()=>identityCoverage(defs,census,changed,expected),/dynamic/);
 const wrong=structuredClone(audit);wrong.rows.find(r=>r.classification==='generated-item-name').targets.push('item:not-in-source');
 assert.throws(()=>identityCoverage(defs,census,wrong,expected),/Unknown reference/);
});
