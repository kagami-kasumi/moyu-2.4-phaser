import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {firstCombatDrops} from '../src/domain/first-combat-drops.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4536/frame_1/DoAction.as','utf8');
const names=['monsterDeath','dropItem','dropNormalItem','dropStone','dropFlower','dropHSItem','dropMsBag'];
const scripts=Object.fromEntries(names.map(n=>[n,new vm.Script('(function('+ (n==='monsterDeath'?'mName,fX,fY,level':n==='dropItem'?'mName,fX,fY,level':'fX,fY,level')+')'+functionRange(source,`this.${n} =`).text+')')]));
test('complete deer reward branch matches source generators, callback random consumption and final boss warning',()=>{
 for(const profession of ['战士','法师'])for(const level of [1,15,30,49,50,90,100])for(const remaining of [true,false])for(const endpoint of [0,24,25,49,50,74,75,99,100,109,110,149,150,199,200,499,500,9000,9001,9999])for(const consume of [false,true]){
  const expected=[],actual=[],expectedCalls=[],actualCalls=[];let a=0,b=0;
  const draw=(n,i)=>((endpoint+i*71)%10000)%Math.trunc(n),er=n=>{expectedCalls.push(n);return draw(n,a++)},ar=n=>{actualCalls.push(n);return draw(n,b++)};
  const record=e=>{expected.push(e);if(consume&&(e.kind==='create'||e.kind==='throw'))er(1000);};
  const o={role:{levels:level,vocational:profession},_parent:{task:{catchThing(name,count){record({kind:'catch',name,count})}},createThing(item,drop,x,y){assert.equal(drop,true);assert.equal(x,10);assert.equal(y,20);record({kind:'create',name:item.type})},warning:{open(callback,name,seconds){record({kind:'warning',name,seconds})}}},goods:{throwGoods(x,y,item){assert.equal(x,10);assert.equal(y,20);record({kind:'throw',item:JSON.parse(JSON.stringify(item))})}},flashBoss(){}};
  const context=vm.createContext({random:er,role:o.role,_parent:o._parent,haveMonst:()=>remaining});for(const [n,s]of Object.entries(scripts))o[n]=s.runInContext(context);
  o.monsterDeath('鹿角兽',10,20,level);firstCombatDrops(level,profession,remaining,ar,e=>{actual.push(e);if(consume&&(e.kind==='create'||e.kind==='throw'))ar(1000);});
  assert.deepEqual(actual,expected,JSON.stringify({profession,level,remaining,endpoint,consume}));assert.deepEqual(actualCalls,expectedCalls);
 }
});
