import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyLiteralPetRegistrations} from '../tools/lib/pet-registration-evidence.mjs';
test('literal pet registrations preserve every item trigger and reject wrong growth seeds',()=>{
 const result=verifyLiteralPetRegistrations(registryData.definitions);
 assert.equal(result.literalVariants,49);assert.equal(result.verified.length,24);assert.ok(!result.verified.includes('pet:奇迹龙'));
 const wrong=structuredClone(registryData.definitions);wrong.find(d=>d.id===result.verified[0]).data.initializations[0].definition.rateLife=-999;
 assert.throws(()=>verifyLiteralPetRegistrations(wrong),/Pet template differs/);
});
