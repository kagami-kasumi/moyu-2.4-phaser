import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {stepPet} from '../src/domain/pet-combat-behavior.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/HuanShouMC.as','utf8');
const motions={idle:'站立',left:'向左跑',right:'向右跑',up:'向上跑',down:'向下跑',acting:'使用技能中',finished:'使用技能结束'},effects={none:'无',attack:'攻击',skill:'技能'};
const scripts=Object.fromEntries(['Activities','站立','向左跑','向右跑','向上跑','向下跑','changeDepth','攻击'].map(n=>[n,new vm.Script('(function()'+functionRange(source,`function ${n}(`).text.replaceAll('undefined == this.myTarget','this.myTarget === absent').replaceAll('undefined != this.myTarget','this.myTarget !== absent')+')')]));
const seed=()=>({id:'pet',x:250,y:300,alive:true,visible:true,facing:'left',motion:'idle',effect:'none',stopTime:0,attackStopTime:8,followLength:60,followHeight:60,attackLength:150,attackHeight:30,speedX:10,speedY:5,minAttack:20,maxAttack:30});
function compare(p,role,enemies){
 const absent={},hits=[],calls=[],units=enemies.map(u=>({...u,_x:u.x,_y:u.y,isAlive:u.alive,byAttack(a,b,attack,isMax){hits.push({target:u.id,attack,isMax});}}));let target=units.find(u=>u.id===p.target)??(p.target?{id:p.target}:undefined);
 const r={_x:role.x,_y:role.y,myTarget:units.find(u=>u.id===role.target)},hs={...p,faceTo:p.facing==='left'?'左':'右',motion:motions[p.motion],skillEffect:effects[p.effect]},x={_x:p.x,_y:p.y,_visible:p.visible,_isAlive:p.alive,followLength:p.followLength,followHeight:p.followHeight,huanShou:hs,_parent:{role:r,attachMovie(){},getNextHighestDepth(){return 1}},playAction:{gotoAndStop(){},幻兽种类:{gotoAndStop(){}}}};
 Object.defineProperty(x,'myTarget',{get:()=>target??absent,set:v=>{target=v;}});
 const context=vm.createContext({absent,random:n=>{calls.push(n);return 3},_global:{playSound(){}}});for(const [n,s]of Object.entries(scripts))x[n]=s.runInContext(context);x.Activities();
 const expected={...p,x:x._x,y:x._y,facing:hs.faceTo==='左'?'left':'right',motion:Object.keys(motions).find(k=>motions[k]===hs.motion),effect:Object.keys(effects).find(k=>effects[k]===hs.skillEffect),stopTime:hs.stopTime,target:target?.id};
 const actual=structuredClone(p),actualRole=structuredClone(role),actualCalls=[],actualHits=stepPet(actual,actualRole,enemies,n=>{actualCalls.push(n);return 3});
 if(expected.target===undefined)delete expected.target;if(actual.target===undefined)delete actual.target;
 assert.deepEqual(actual,expected,JSON.stringify({p,role,enemies}));assert.equal(actualRole.target,r.myTarget===absent?undefined:r.myTarget?.id);assert.deepEqual(actualHits,hits);assert.deepEqual(actualCalls,calls);
}
test('pet source behavior: owner target exchange, dead following, merged visibility and immediate normal attack completion',()=>{
 for(const dx of [-151,-150,-120,-61,0,61,120,150,151])for(const dy of [-61,-31,-30,0,30,31,61])for(const alive of [false,true])for(const target of [undefined,'enemy'])for(const roleTarget of [undefined,'enemy']){
  compare({...seed(),alive,target},{id:'role',x:250-dx,y:300-dy,alive:true,target:roleTarget},[{id:'enemy',x:250-dx,y:300-dy,alive:true}]);
 }
 for(const visible of [false,true])for(const motion of ['idle','acting','finished'])for(const stopTime of [0,1,8])for(const alive of [false,true])compare({...seed(),visible,motion,stopTime,target:'enemy',effect:'attack'},{id:'role',x:100,y:100,alive:true},[{id:'enemy',x:240,y:300,alive}]);
});
