import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyRingRegistrations} from '../tools/lib/ring-registration-evidence.mjs';
test('ring seed records retain source literals, selector variables and random expressions',()=>{
 assert.equal(verifyRingRegistrations(registryData.definitions).length,2);
 const changed=structuredClone(registryData.definitions);
 changed.find(d=>d.id==='item:新手戒指').data.variants[0].definition.attack++;
 assert.throws(()=>verifyRingRegistrations(changed),/Ring seed differs/);
});
