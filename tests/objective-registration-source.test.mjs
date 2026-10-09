import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyObjectiveRegistrations} from '../tools/lib/objective-registration-evidence.mjs';
test('all objective identities and declarations match independent source literals',()=>{
 assert.equal(verifyObjectiveRegistrations(registryData.definitions).length,39);
});
test('objective omission and altered requirement count are rejected',()=>{
 const definitions=structuredClone(registryData.definitions),record=definitions.find(d=>d.kind==='objective');
 record.data.requirements[0].definition.needNumber++;
 assert.throws(()=>verifyObjectiveRegistrations(definitions),/Objective declarations/);
 assert.throws(()=>verifyObjectiveRegistrations(registryData.definitions.filter(d=>d.id!==record.id)),/Objective identity count/);
});
