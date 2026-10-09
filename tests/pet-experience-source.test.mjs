import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {PET_EXPERIENCE_RULES as rules} from '../src/content/pet-experience-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source.file,'utf8');
function run(pet,val,roleLevel=150){
 const events=[];const fn=vm.runInNewContext('(function(val)'+functionRange(source,'function expUp(val)').text+')',{Math,_global:{sysMsg:{addMsg(){}},playSound(){}},_root:{flashHuanShouView:()=>events.push('view'),flashHuanShouHpMp:()=>events.push('hp')}});
 pet.flashAttribute=()=>{pet.maxLife=100;};fn.call({huanShou:pet,_parent:{role:{levels:roleLevel}},升级光环:{gotoAndPlay(){}}},val);return events;
}
const seed=levels=>({battle:true,life:1,levels,nowExp:0,maxExp:9,oldLevels:0});
test('pet threshold table covers each transition including levels at least 150',()=>{
 for(const level of [2,29,30,59,60,89,90,99,100,109,110,119,120,129,130,139,140,149,150]){
  const pet=seed(level-1);run(pet,9);const band=rules.thresholds.find(b=>level<b.below);
  assert.equal(pet.levels,level);assert.equal(pet.maxExp,band.fixed??Math.floor(level*band.multiplier));assert.equal(pet.life,100);
 }
});
test('pet lead cap discards overflow while insight can restore beyond that cap',()=>{
 const capped=seed(10);run(capped,10000,1);assert.equal(capped.levels,11);assert.equal(capped.nowExp,98);
 const insight={...seed(29),oldLevels:100,oldNowExp:123,oldMaxExp:30000};run(insight,9,20);
 assert.equal(insight.levels,100);assert.equal(insight.nowExp,123);assert.equal(insight.maxExp,30000);
 for(const change of [{battle:false},{life:0},{levels:30}]){
  const pet={...seed(1),...change};assert.deepEqual(run(pet,99,20),[]);assert.equal(pet.nowExp,0);
 }
});
