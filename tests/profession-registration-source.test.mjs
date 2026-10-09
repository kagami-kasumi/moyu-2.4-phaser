import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyProfessionRegistrations} from '../tools/lib/profession-registration-evidence.mjs';
test('profession information frames and confirm/back events match original SWF and source',()=>{
 assert.deepEqual(verifyProfessionRegistrations(registryData.definitions),['profession:战士','profession:法师']);
 const wrong=structuredClone(registryData.definitions);wrong.find(d=>d.id==='profession:战士').data.informationFrame=6;
 assert.throws(()=>verifyProfessionRegistrations(wrong));
});
