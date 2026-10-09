import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyLiteralItemRegistrations} from '../tools/lib/item-registration-evidence.mjs';
test('literal registration promotion rejects changed defaults and bad aliases',()=>{
 const ids=verifyLiteralItemRegistrations(registryData.definitions);assert.ok(ids.length>170);
 const wrong=structuredClone(registryData.definitions);wrong.find(d=>d.id===ids[0]).data.salePrice=-999;
 assert.throws(()=>verifyLiteralItemRegistrations(wrong),/Literal item differs/);
 const alias=structuredClone(registryData.definitions);alias.find(d=>d.id===ids[0]).aliases.push('not-a-source-item');
 assert.throws(()=>verifyLiteralItemRegistrations(alias),/Factory rejects alias/);
});
