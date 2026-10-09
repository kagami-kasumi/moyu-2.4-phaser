import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyParameterItems} from '../tools/lib/parameter-item-evidence.mjs';
test('parameter gems preserve factory routing, zero fallback and nonzero overrides',()=>{
 assert.equal(verifyParameterItems(registryData.definitions).length,5);
 const changed=structuredClone(registryData.definitions);
 changed.find(d=>d.id==='item:高级攻击宝石').data.salePrice++;
 assert.throws(()=>verifyParameterItems(changed),/Parameter factory output/);
});
