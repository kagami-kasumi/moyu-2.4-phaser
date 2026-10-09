import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {npcExperienceBalls,npcDonationMerit,npcDismantleItems,lifeSourcePetScore} from '../src/content/npc-exchange-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4312/frame_1/DoAction_2.as','utf8');
const build=(marker,extra={})=>vm.runInNewContext('(function(target)'+functionRange(source,marker).text+')',{_global:{msg:{open(){}},sysMsg:{addMsg(){}}},...extra});
test('NPC exchange quantities and donation consume semantics match source callbacks',()=>{
 for(const type of ['头盔','衣服','武器','鞋','庇护铃铛','翡翠铃铛','凤翼铃铛','other'])for(const grade of [-1,0,1,2,3,4,5,9])for(const holes of [-1,0,1,2,3,4]){
  let replacement,merit;const item={type,grade,holes,setThing(v){replacement={...v}}};
  assert.equal(build('this.weaponToExp =').call({},item),false);const count=npcExperienceBalls(item);
  assert.deepEqual(replacement,count===undefined?undefined:{type:'经验球',number:count,salePrice:50});replacement=undefined;
  assert.equal(build('this.weaponDonate =',{_parent:{role:{militaryExploitUp(v){merit=v}}}}).call({},item),false);
  assert.equal(npcDonationMerit(item),merit);assert.deepEqual(replacement,merit===undefined?undefined:{type:'空格'});
 }
});
test('dismantle independent grade/socket/magic/element awards preserve source 7-heart cap',()=>{
 for(const type of ['武器','凤翼铃铛'])for(const grade of [-1,0,1,2,3,4,5,6])for(const holes of [0,1,2,3,4])for(const mhdj of [0,5,6,12,36,42,48,NaN])for(const levels of [59,60]){
  const element=(grade+7)%7,item={type,grade,holes,mhdj,levels,element},out=[];
  const ok=build('this.testToBreakUp =',{_parent:{_parent:{createThing(v){out.push(v.type)}}}}).call({},item);
  assert.deepEqual(npcDismantleItems(item),ok?out:undefined);
 }
});
test('life-source sacrifice checks old level threshold and deletes before increment',()=>{
 for(const lifeSourseLevels of [0,4,5,9,10,14,15,99])for(const score of [999,1000,1999,2000,2999,3000,3999,4000]){
  const events=[],role={lifeSourseLevels};const target={type:'圣天使雷斯',allFen:score};
  build('this.getHuanShou =',{_parent:{role,_parent:{huanShou:{delHuanShou(){events.push(role.lifeSourseLevels)}},giveHuanShou:{closePanel(){}}}}}).call({},target);
  const accept=score>=lifeSourcePetScore(lifeSourseLevels);assert.equal(role.lifeSourseLevels,lifeSourseLevels+Number(accept));assert.deepEqual(events,accept?[lifeSourseLevels]:[]);
 }
});
