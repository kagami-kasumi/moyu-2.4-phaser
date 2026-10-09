import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyBellRegistrations} from '../tools/lib/bell-registration-evidence.mjs';
test('nine bell seeds agree with all ten original random outcomes',()=>{
 assert.equal(verifyBellRegistrations(registryData.definitions).length,3);
 const changed=structuredClone(registryData.definitions);
 changed.find(d=>d.id==='item:庇护铃铛').data.variants[0].definition.attributeVal1++;
 assert.throws(()=>verifyBellRegistrations(changed),/Bell seed differs/);
});
