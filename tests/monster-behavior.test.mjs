import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {stepMonster,lockMonsterTarget} from '../src/domain/monster-behavior.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/MonsterMC.as','utf8');
const motions={idle:'站立',left:'向左跑',right:'向右跑',up:'向上跑',down:'向下跑',acting:'使用技能中',finished:'使用技能结束'};
const effects={none:'无',attack:'攻击',skill:'技能',ranged:'远程攻击'};
const seed=()=>({id:'m',x:250,y:300,alive:true,facing:'left',motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:90,guardLength:150,guardHeight:70,attackLength:150,attackHeight:30,speedX:4,speedY:2,minAttack:20.8,maxAttack:31.2,attackTypeNum:2,ranged:false});
function oracle(m,units,rolls,lockOnly=false){
 let index=0;const calls=[],hits=[];
 const random=n=>{calls.push(n);return Math.min(Math.max(0,Math.trunc(n)-1),rolls[index++%rolls.length]);};
 // AVM1 permits property reads on undefined. An inert sentinel models that only
 // for myTarget; it is not an eligible member of roleUnit.
 const absent={};const us=units.map(u=>({id:u.id,_x:u.x,_y:u.y,isAlive:u.alive,byAttack(a,b,attack,isMax){hits.push({target:u.id,attack,isMax});}}));
 let target=us.find(u=>u.id===m.target)??(m.target?{id:m.target}:undefined);
 const x={...m,_x:m.x,_y:m.y,isAlive:m.alive,faceTo:m.facing==='left'?'左':'右',motion:motions[m.motion],skillEffect:effects[m.effect],attackType:m.ranged?'石块':undefined,_parent:{roleUnit:us,attachMovie(){},getNextHighestDepth(){return 1}},playAction:{gotoAndStop(){}},type:'鹿角兽'};
 Object.defineProperty(x,'myTarget',{get:()=>target??absent,set:v=>{target=v;}});
 const context={random,Math,_global:{playSound(){}}};
 for(const name of ['Activities','lockTarget','站立','向左跑','向右跑','向上跑','向下跑','changeDepth','攻击','技能','远程攻击']){
  let body=functionRange(source,`function ${name}(`).text;
  // The sentinel has AS undefined properties but must compare equal to undefined.
  body=body.replaceAll('undefined == this.myTarget','this.myTarget === absent').replaceAll('this.myTarget == undefined','this.myTarget === absent').replaceAll('undefined != this.myTarget','this.myTarget !== absent');
  x[name]=vm.runInNewContext('(function()'+body+')',{...context,absent});
 }
 x[lockOnly?'lockTarget':'Activities']();
 const actual={...m,x:x._x,y:x._y,facing:x.faceTo==='左'?'left':'right',motion:Object.keys(motions).find(k=>motions[k]===x.motion),effect:Object.keys(effects).find(k=>effects[k]===x.skillEffect),stopTime:x.stopTime};
 if(target)actual.target=target.id;else delete actual.target;
 return {state:actual,calls,hits};
}
function compare(m,units,rolls,lockOnly=false){const expected=oracle(m,units,rolls,lockOnly),actual=structuredClone(m),calls=[];let i=0;
 const hits=lockOnly?(lockMonsterTarget(actual,units),[]):stepMonster(actual,units,n=>{calls.push(n);return Math.min(Math.max(0,Math.trunc(n)-1),rolls[i++%rolls.length]);});
 if(actual.target===undefined)delete actual.target;
 assert.deepEqual({state:actual,calls,hits},expected,JSON.stringify({m,units,rolls}));
}
test('monster AI source oracle: quadrants, inclusive range, stale targets, random ordering and animation gates',()=>{
 for(const dx of [-301,-151,-150,-120,0,120,150,151,301])for(const dy of [-71,-31,-30,-24,0,24,30,31,71])for(const motion of ['idle','acting','finished'])for(const rolls of [[0],[14],[15],[99]]){
  const units=[{id:'role',x:250-dx,y:300-dy,alive:true},{id:'pet1',x:240,y:295,alive:true},{id:'pet2',x:240,y:295,alive:false}];
  compare({...seed(),motion,effect:motion==='finished'?'attack':'none'},units,rolls);
 }
 for(const alive of [true,false])for(const stopTime of [0,1,6])for(const target of [undefined,'role','missing'])for(const ranged of [true,false])for(const effect of ['none','attack','skill','ranged'])compare({...seed(),alive,stopTime,target,ranged,effect},[{id:'role',x:240,y:300,alive:false}],[99]);
});
test('target selection preserves sqrt product, reversed iteration ties and retained target',()=>{
 for(const x of [100,249,250,251,400])for(const y of [230,299,300,301,370])for(const target of [undefined,'old'])compare({...seed(),target},[{id:'role',x,y,alive:true},{id:'pet1',x,y,alive:true},{id:'pet2',x,y,alive:true},{id:'pet3',x,y,alive:true}],[99],true);
});
