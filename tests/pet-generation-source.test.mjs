import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {PET_GENERATION_RULES as rules} from '../src/content/pet-generation-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
const compile=name=>vm.runInNewContext('(function()'+functionRange(source,'function '+name+'()').text+')',{Math,_global:{sysMsg:{addMsg(){}}}});
test('generation and god labels reflect stored fields without changing them',()=>{
 const generation=compile('get lifeLv'),god=compile('get GodName');
 for(const [nowLifeLv,expected] of [[undefined,''],[-1,''],[0,''],[1,'二代'],[2,'三代'],[3,'N代'],[99,'N代']])assert.equal(generation.call({nowLifeLv}),expected);
 for(const [isGod,expected] of [[false,''],[true,'神使'],[undefined,'']])assert.equal(god.call({isGod}),expected);
});
test('turning keeps the highest old level snapshot and increments only below the existing cap',()=>{
 for(const oldLevels of [20,50,80]){
  const pet={zs:10,maxZs:10,levels:50,nowExp:123,maxExp:750,oldLevels,oldNowExp:7,oldMaxExp:8};compile('turned').call(pet);
  assert.equal(pet.zs,10);assert.equal(pet.oldLevels,Math.max(oldLevels,50));assert.equal(pet.oldNowExp,oldLevels<50?123:7);
  assert.equal(pet.levels,1);assert.equal(pet.nowExp,0);assert.equal(pet.maxExp,9);
 }
});
test('generation branches scale main and secondary attributes; turn occurs before cap increase',()=>{
 for(let mask=0;mask<16;mask++){
  const pet={mainFen:mask===0?0:6000,type:mask===0?'奇迹龙':'fixture',nowLifeLv:0,nextLvMain:1.5,nextLvRate:1.3,zs:10,maxZs:10,rareFen:200,levels:50,nowExp:12,maxExp:750,oldLevels:1,turned:compile('turned')};
  const axes=['Life','MinAttack','MaxAttack','Defense'];
  for(const [i,axis] of axes.entries()){pet['max'+axis+'Fen']=mask&(1<<i)?1:0;pet['maxRate'+axis]=20;pet['rate'+axis]=10;}
  assert.equal(compile('lifeLvUp').call(pet),true);
  for(const [i,axis] of axes.entries()){const main=!!(mask&(1<<i));assert.equal(pet['rate'+axis],main?15:13);assert.equal(pet['maxRate'+axis],main?30:20);assert.equal(pet['max'+axis+'Fen'],main?1001:0);}
  assert.equal(pet.zs,10);assert.equal(pet.maxZs,60);assert.equal(pet.rareFen,700);assert.equal(pet.nowLifeLv,1);
 }
 for(const [type,score,generation,expected] of [['fixture',5999,0,false],['奇迹龙',0,2,false]]){
  assert.equal(compile('lifeLvUp').call({type,mainFen:score,nowLifeLv:generation}),expected);
 }
});
