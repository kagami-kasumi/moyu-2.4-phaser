import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {petInitializationOracle} from '../tools/lib/pet-initialization-oracle.mjs';
import {ITEM_PETS} from '../src/content/item-pets.ts';
const root='local-resources/moyu/source-index/as/scripts/__Packages/';
const source=fs.readFileSync(root+'HuanShouClass.as','utf8'),codec=fs.readFileSync(root+'SecreteCode.as','utf8');
test('all 49 literal pet variants traverse real constructor, species initialization and derived attributes',()=>{
 assert.equal(Object.keys(ITEM_PETS).length,49);
 for(const draw of [0,1,2]){
  const create=petInitializationOracle(source,codec,draw);
  for(const seed of Object.values(ITEM_PETS)){
   const p=create(seed);
   for(const key of Object.keys(seed)){
    if(typeof seed[key]==='number')assert.ok(Math.abs(p[key]-seed[key])<1e-9,seed.type+'.'+key+' (source codec roundoff)');
    else assert.equal(p[key],seed[key],seed.type+'.'+key);
   }
   assert.equal(p.nextLvRate,1.3+draw*0.1);assert.equal(p.nowExp+0,0);assert.equal(p.maxExp,Math.floor(seed.levels*9));
   assert.equal(p.oldLevels,1);assert.equal(p.oldNowExp+0,0);assert.equal(p.oldMaxExp,Math.floor(seed.levels*9));
   assert.equal(p.life,p.maxLife);assert.equal(p.battle,false);assert.equal(p.sd,0);assert.equal(p.qyg,0);
   assert.ok(Number.isFinite(p.allFen));assert.ok(Number.isFinite(p.maxLife));
  }
 }
});
test('restore constructor keeps explicit zero values, applies rare-score floor, and refills derived life',()=>{
 const create=petInitializationOracle(source,codec,2),seed=Object.values(ITEM_PETS)[0],base=create(seed);
 const p=create({...seed,nowExp:0,maxExp:0,oldLevels:0,oldNowExp:0,oldMaxExp:0,nextLvRate:0,nowLifeLv:0,sd:2,qyg:200,rareFen:base.rareFen+100,life:1});
 for(const key of ['nowExp','maxExp','oldLevels','oldNowExp','oldMaxExp','nextLvRate','nowLifeLv'])assert.equal(p[key]+0,0,key);
 assert.equal(p.sd,2);assert.equal(p.qyg,200);assert.equal(p.rareFen,base.rareFen+100);assert.equal(p.life,p.maxLife);
 assert.equal(create({...seed,rareFen:-1}).rareFen,base.rareFen);
});
