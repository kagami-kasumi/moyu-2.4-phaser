import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {basePlayerStrike} from '../src/domain/base-player-strike.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/RoleMC.as','utf8');
const scripts=Object.fromEntries(['斩魂效果','火球术效果','重击','辅助技能'].map(n=>[n,new vm.Script('(function()'+functionRange(source,`function ${n}(`).text+')')]));
const lock=new vm.Script('(function(横向范围,纵向范围)'+functionRange(source,'function lockTarget(').text+')');
test('base attacks source oracle: selected owner, scalar, passives, callback order, random counts and angry life cost',()=>{
 for(const profession of ['战士','法师'])for(const anger of [false,true])for(const fly of [false,true])for(const life of [250,251,1000])for(const heavyHit of [0,100])for(const roll of [0,49,99])for(const dx of [-149,0,149,399,401]){
  const p={profession,anger,fly,life,maxLife:1000,heavyHit,frost:50,heavyDamage:50,nonDefense:50,x:250,y:300,facing:'right',level:3,minAttack:10.4,maxAttack:30.6},units=[{id:'e',x:250+dx,y:300,alive:true}],expected=[],actual=[],calls=[],actualCalls=[];
  const rand=n=>{calls.push(n);return roll%Math.trunc(n)},context=vm.createContext({random:rand});
  const target={_x:units[0].x,_y:300,isAlive:true,frostMC:{run:duration=>expected.push(['frost',duration])},heavyDamageMC:{run:(a,b,attack,duration)=>expected.push(['heavy',attack,duration])},nonDefenseMC:{run:duration=>expected.push(['nonDefense',duration])},byAttack(a,b,attack,isMax){expected.push(['hit',attack,isMax]);rand(17);return 7;}};
  const o={...p,_x:p.x,_y:p.y,faceTo:'右',levels:p.level,angerState:anger,flyState:fly,_parent:{monstUnit:[target]}};
  Object.defineProperty(o,'renewLife',{set:value=>{expected.push(['renew',value]);rand(100)}});o.lockTarget=lock.runInContext(context);for(const [n,s]of Object.entries(scripts))o[n]=s.runInContext(context);
  const result=o[profession==='战士'?'斩魂效果':'火球术效果'](),a=structuredClone(p),ar=n=>{actualCalls.push(n);return roll%Math.trunc(n)};
  const success=basePlayerStrike(a,units,ar,(id,event)=>{assert.equal(id,'e');actual.push(event.type==='heavy'?['heavy',event.attack,event.duration]:[event.type,event.duration]);},(id,attack,isMax)=>{assert.equal(id,'e');actual.push(['hit',attack,isMax]);ar(17);return 7;},value=>{actual.push(['renew',value]);ar(100)});
  assert.equal(success,result);assert.equal(a.life,o.life);assert.deepEqual(actual,expected);assert.deepEqual(actualCalls,calls);
 }
});
