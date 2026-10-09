import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {integratedNumericCoverage} from '../tools/lib/registry-integration.mjs';
const read=n=>JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/'+n+'.json'));
const inputs=['numeric-rule-index','role-item-coverage','pet-world-coverage','persistence-coverage','persistence-survey'].map(read);
test('integration joins all numeric IDs and exact persistent handoffs',()=>{
 assert.deepEqual(integratedNumericCoverage(...inputs).counts,{numeric:9611,roleItem:2461,petWorld:7150,persistence:927,fields:653});
});
for(const [name,mutate] of [
 ['missing ownership',a=>a[1].records.shift()],
 ['duplicate ownership',a=>a[2].records.push(a[1].records[0])],
 ['unknown ID',a=>a[1].records[0].id='invented'],
 ['value drift',a=>a[1].records[0].value='changed'],
 ['missing persistence',a=>a[3].records.pop()],
 ['duplicate persistence',a=>a[3].records.push(a[3].records[0])],
 ['unreviewed persistence',a=>a[3].records[0].disposition='unknown'],
 ['missing field',a=>a[3].records.find(r=>r.fields.length).fields.push('invented')],
 ['unreviewed numeric',a=>a[1].records[0].review='pending'],
])test('integration rejects '+name,()=>{const a=structuredClone(inputs);mutate(a);assert.throws(()=>integratedNumericCoverage(...a));});
