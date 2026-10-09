import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {miracleDragonSeed} from '../src/content/miracle-dragon-rules.ts';
import {petInitializationOracle} from '../tools/lib/pet-initialization-oracle.mjs';
import {verifyMiracleRegistration} from '../tools/lib/miracle-registration-evidence.mjs';
import {registryData} from '../src/content/registry-data.ts';
test('miracle registry links the original seed fields and bounded generator',()=>{
 assert.deepEqual(verifyMiracleRegistration(registryData.definitions),['pet:奇迹龙']);
 const changed=structuredClone(registryData.definitions);
 changed.find(d=>d.id==='pet:奇迹龙').data.initializations[0].definition.rateLife.expression='_loc12_';
 assert.throws(()=>verifyMiracleRegistration(changed),/Miracle seed fields differ/);
});
const root='local-resources/moyu/source-index/as/scripts/';
const source=fs.readFileSync(root+'frame_9/DoAction.as','utf8');
const body=functionRange(source,'this.useItem =').text;
function original(branch,draws,accept=true){
 let cursor=0,observed;const math=Object.create(Math);math.random=()=>{assert.ok(cursor<4);return draws[cursor++];};
 const context=vm.createContext({Math:math,random:n=>{assert.equal(n,4);return branch;}});
 const use=vm.runInContext('(function(item)'+body+')',context);
 const item={type:'奇迹龙',number:2,hitTest:()=>true,setThing(v){Object.assign(this,v);}};
 use.call({backPack:{},fastKey:{},huanShou:{addHuanShou(seed){observed=JSON.parse(JSON.stringify(seed));return accept;}}},item);
 assert.equal(cursor,4);return {seed:observed,item};
}
test('all random branches and endpoint combinations match original useItem and real pet initialization',()=>{
 const create=petInitializationOracle(fs.readFileSync(root+'__Packages/HuanShouClass.as','utf8'),fs.readFileSync(root+'__Packages/SecreteCode.as','utf8'));
 for(let branch=0;branch<4;branch++)for(let mask=0;mask<16;mask++){
  const draws=Array.from({length:4},(_,i)=>mask&(1<<i)?1-Number.EPSILON:0);
  const expected=original(branch,draws),seed=miracleDragonSeed(branch,draws);
  assert.deepEqual(seed,expected.seed);assert.equal(expected.item.number,1);
  const pet=create(seed);assert.ok(Number.isFinite(pet.allFen));assert.equal(pet.life,pet.maxLife);assert.equal(pet.rareFen,seed.rareFen);
 }
});
test('quantization boundaries, attack coupling and failed pet insertion preserve source behavior',()=>{
 for(let branch=0;branch<4;branch++)for(const v of [0.0000049,0.000005,0.0000051,0.333333333,0.5,0.999999]){
  const draws=[v,1-v,v,0.5],seed=miracleDragonSeed(branch,draws),expected=original(branch,draws,false);
  assert.deepEqual(seed,expected.seed);assert.equal(expected.item.number,2);assert.ok(seed.rateMaxAttack>=seed.rateMinAttack);
 }
 assert.throws(()=>miracleDragonSeed(4,[0,0,0,0]));assert.throws(()=>miracleDragonSeed(0,[1,0,0,0]));
});
