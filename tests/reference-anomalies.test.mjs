import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {referenceAnomalies} from '../tools/lib/reference-anomalies.mjs';
test('malformed pet restore remains an explicit unresolved anomaly with three preserved inputs',()=>{
 const {unparsed}=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/object-census.json','utf8'));
 const rows=referenceAnomalies(unparsed);assert.equal(rows.length,1);
 assert.deepEqual(rows[0].storedInputs,['nextLvRate','sd','qyg']);assert.equal(rows[0].blocksFinalPersistenceReview,true);
 const unknown=structuredClone(unparsed);unknown[0].source.file='unknown.as';
 assert.throws(()=>referenceAnomalies(unknown),/Unreviewed malformed declaration/);
});
