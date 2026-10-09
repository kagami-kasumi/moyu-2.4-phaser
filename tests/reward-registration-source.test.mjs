import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyRewardRegistrations} from '../tools/lib/reward-registration-evidence.mjs';
test('seven special reward registrations match original declarations and friend-level formula',()=>{
 assert.equal(verifyRewardRegistrations(registryData.definitions).length,7);
 const changed=structuredClone(registryData.definitions);
 changed.find(d=>d.id==='reward:魔石').data.records[0].definition.val=999;
 assert.throws(()=>verifyRewardRegistrations(changed),/Reward value/);
});
