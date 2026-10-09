import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyMissingFactoryItems} from '../tools/lib/missing-factory-evidence.mjs';
test('three source calls reference rejected factory names without producing inventory items',()=>{
 assert.equal(verifyMissingFactoryItems(registryData.definitions).length,3);
 const changed=structuredClone(registryData.definitions);
 changed.find(d=>d.id==='item:月光礼包').data.instances[0].salePrice=100;
 assert.throws(()=>verifyMissingFactoryItems(changed));
});
