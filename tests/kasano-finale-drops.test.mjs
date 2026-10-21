import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {firstBossDrops,advanceFirstBoss} from '../src/domain/first-combat-drops.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4536/frame_1/DoAction.as','utf8'),rootSource=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction_2.as','utf8');
const scripts=Object.fromEntries(['monsterDeath','dropItem','dropBossItem','dropBossStone','dropSoul'].map(n=>[n,new vm.Script('(function('+(n==='monsterDeath'||n==='dropItem'?'mName,fX,fY,level':n==='dropSoul'?'rnd,fX,fY,level':'fX,fY,level')+')'+functionRange(source,`this.${n} =`).text+')')]));
const root=Object.fromEntries(['devilSoul','minSoul','maxSoul'].map(k=>[k,JSON.parse(rootSource.match(new RegExp(k+' = (\\[[^;]+);'))[1])]));
test('all three finale boss rewards include ordered successor warnings and original soul formula',()=>{
 for(const name of ['龙怪头目','鹿角护卫','龙王'])for(const profession of ['战士','法师'])for(const level of [1,5,30,50,135,300,301])for(const value of [0,9,10,99,100,499,500,999,1000,1999,2000,5000,5001,9999])for(const fract of [0,.5,.999]){
  const expected=[],actual=[],ec=[],ac=[];const er=n=>{ec.push(n);return value%Math.trunc(n)},ar=n=>{ac.push(n);return value%Math.trunc(n)};
  const o={role:{levels:level,vocational:profession,creditUp:amount=>expected.push({kind:'credit',amount})},bossLevelsUp:()=>expected.push({kind:'boss-level'}),_parent:{warning:{open(callback,n,seconds){expected.push({kind:'warning',name:typeof n==='string'?n:n.type,seconds});}},task:{catchThing(name,count){expected.push({kind:'catch',name,count})}},createThing(item,dropped,x,y){assert.equal(dropped,true);assert.equal(x,10);assert.equal(y,20);expected.push(item.type==='宝石'?{kind:'create-item',item:JSON.parse(JSON.stringify(item))}:{kind:'create',name:item.type});er(17);}},goods:{throwGoods(x,y,item){expected.push({kind:'throw',item:JSON.parse(JSON.stringify(item))});er(17);}}};
  const math=Object.create(Math);math.random=()=>{ec.push('fraction');return fract};
  const context=vm.createContext({random:er,Math:math,role:o.role,_parent:o._parent,_root:root,nowMap:'卡萨诺城野外五'});for(const [n,s]of Object.entries(scripts))o[n]=s.runInContext(context);context.dropSoul=o.dropSoul.bind(o);
  o.monsterDeath(name,10,20,level);firstBossDrops(level,profession,ar,()=>{ac.push('fraction');return fract},e=>{actual.push(e);if(['create','create-item','throw'].includes(e.kind))ar(17)},name,true);
  assert.deepEqual(actual,expected,JSON.stringify({profession,level,value,fract}));assert.deepEqual(ac,ec);
 }
});
