import test from 'node:test';
import assert from 'node:assert/strict';
import {registryData} from '../src/content/registry-data.ts';
import {verifyLuckyCharms} from '../tools/lib/lucky-charm-evidence.mjs';
test('lucky charm seeds retain distinct lover/name sources and absent original price',()=>{
 assert.equal(verifyLuckyCharms(registryData.definitions).length,2);
 const changed=structuredClone(registryData.definitions);
 changed.find(d=>d.id==='item:永恒幸运符').data.variants[2].definition.salePrice=100;
 assert.throws(()=>verifyLuckyCharms(changed),/Charm seed differs/);
});
