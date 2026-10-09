import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {effectCounter,effectDuration,buffTimerStep,militaryShare,petElementEvolution,HEAVY_DAMAGE_SOURCE_ANOMALY} from '../src/content/world-effect-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
test('three effect timeline counters preserve decrement, final active tick and stop behavior',()=>{
 for(const [kind,id]of [['frost',2874],['nonDefense',2878],['heavyDamage',2881]]){
  const source=fs.readFileSync(root+`DefineSprite_${id}/frame_1/DoAction.as`,'utf8');
  for(const times of [-1,0,0.5,1,2,15,NaN]){
   let hits=0,stopped=false;const x={times,_visible:true,_parent:{byAttack(){hits++}},stop(){stopped=true}};
   vm.runInNewContext(source,x);const actual=effectCounter(kind,times);assert.equal(actual.times,x.times);assert.equal(actual.visible,x._visible);assert.equal(actual.stop,stopped);assert.equal(actual.hit,hits>0);assert.equal(actual.stopTime,x._parent.stopTime);
  }
  if(kind!=='heavyDamage')for(const value of [-1,0,1,1.5,NaN]){const x={};const globals={gotoAndPlay(){}};const result=vm.runInNewContext('(function(val)'+functionRange(source,'this.run =').text+')',globals).call({...x,gotoAndPlay(){},set times(n){x.times=n}},value);assert.equal(effectDuration(kind,value),x.times);assert.equal(result===false,Number.isNaN(value));}
 }
 const pcode=fs.readFileSync('local-resources/moyu/source-index/pcode/scripts/DefineSprite_2881/frame_1/DoAction.pcode','utf8');
 assert.match(pcode,/Push register1, "attTarget", "form"\s+GetVariable\s+SetMember/);assert.equal(HEAVY_DAMAGE_SOURCE_ANOMALY.readVariable,'form');
 assert.equal(fs.readFileSync(root+HEAVY_DAMAGE_SOURCE_ANOMALY.file,'utf8').split(/\r?\n/)[HEAVY_DAMAGE_SOURCE_ANOMALY.line-1].trim(),'this.attTarget = form;');
});
test('50ms buff timer and military sharing match source, with no inferred frame-rate conversion',()=>{
 const timer=fs.readFileSync(root+'DefineSprite_4578/frame_1/DoAction.as','utf8');
 for(const nowTime of [0,50,999,1000])for(const times of [0,999,1000]){let frame,end=false;const scope={FRAMES:400,nowTime,times,gotoAndStop(n){frame=n},end(){end=true}};vm.runInNewContext('(function()'+functionRange(timer,'this.goFrame =').text+').call(this)',scope);assert.deepEqual(buffTimerStep(nowTime,times),{frame,nowTime:scope.nowTime,end});}
 const legion=fs.readFileSync(root+'DefineSprite_2093_军团信息/frame_1/DoAction.as','utf8');
 for(const jobFire of [-60,0,50,100])for(const militaryRank of [0,1,9,10,11]){const role={jobFire,militaryRank,militaryRankFire:NaN,flashAttribute(){}};const scope={baseFire:50,_parent:{map:{role}},info:{}};vm.runInNewContext('(function()'+functionRange(legion,'this.flashView =').text+').call(this)',scope);assert.equal(militaryShare(jobFire,militaryRank),role.militaryRankFire);}
});
test('element evolution runs even after failed payment and uses two ordered rolls',()=>{
 const source=fs.readFileSync(root+'DefineSprite_2335_幻化进化/frame_1/DoAction.as','utf8');
 for(const allFen of [2999,3000])for(const element of [0,1,5])for(const rolls of [[0,99],[3,100]])for(const paid of [false,true]){let payment=0,calls=0,actualCalls=0;const p={allFen,element,checkUp(){}};const scope={_parent:{map:{role:{spendMs(n){payment+=n;return paid}}}},_global:{msg:{open(){}},sysMsg:{addMsg(){}}},random:n=>{assert.equal(n,calls===0?4:10000);return rolls[calls++]}};const panel={mainHuanShou:p,_parent:{flashHuanShouView(){}}};panel.GoEvolve=vm.runInNewContext('(function()'+functionRange(source,'this.GoEvolve =').text+')',scope);vm.runInNewContext('(function()'+functionRange(source,'this.beginEvolve =').text+')',scope).call(panel);
  const actual=petElementEvolution({allFen,element},n=>{assert.equal(n,actualCalls===0?4:10000);return rolls[actualCalls++]});assert.equal(calls,actualCalls);if(actual.accepted){assert.equal(actual.element,p.element);assert.equal(actual.paymentAttempt,payment)}else assert.equal(payment,0);
 }
});
