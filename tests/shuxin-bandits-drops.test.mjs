import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {banditDrops} from '../src/domain/shuxin-bandits.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/shuxin-bandits/source-fixture.json'));
const source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];
const rootSource=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction_2.as','utf8');
const roots=Object.fromEntries(['devilSoul','minSoul','maxSoul'].map(key=>[key,JSON.parse(rootSource.match(new RegExp(key+' = (\\[[^;]+);'))[1])]));
const names=['monsterDeath','dropItem','dropNormalItem','dropStone','dropFlower','dropHSItem','dropMsBag','dropBossItem','dropBossStone','dropSoul'];
const scripts=Object.fromEntries(names.map(name=>[name,new vm.Script('(function('+(name==='monsterDeath'||name==='dropItem'?'mName,fX,fY,level':name==='dropSoul'?'rnd,fX,fY,level':'fX,fY,level')+')'+functionRange(source,`this.${name} =`).text+')')]));
test('bandit ordinary and boss drops match original complete functions and interleaved random calls',()=>{
 for(const wave of [1,2,3])for(const profession of ['战士','法师'])for(const remaining of [false,true])for(const endpoint of [0,9,10,24,25,49,50,99,100,149,150,199,200,499,500,1999,2000,9001,9999])for(const consume of [false,true]){
  const expected=[],actual=[],expectedCalls=[],actualCalls=[];
  let expectedIndex=0,actualIndex=0;
  const draw=(limit,index)=>(endpoint+index*71)%10000%Math.trunc(limit);
  const expectedRandom=limit=>{expectedCalls.push(limit);return draw(limit,expectedIndex++);};
  const actualRandom=limit=>{actualCalls.push(limit);return draw(limit,actualIndex++);};
  const record=event=>{expected.push(event);if(consume&&['create','create-item','throw'].includes(event.kind))expectedRandom(1000);};
  const original={role:{levels:20,vocational:profession,creditUp:amount=>record({kind:'credit',amount})},_parent:{task:{catchThing:(name,count)=>record({kind:'catch',name,count})},createThing(item,dropped,x,y){assert.equal(dropped,true);assert.equal(x,10);assert.equal(y,20);record(item.type==='宝石'?{kind:'create-item',item:JSON.parse(JSON.stringify(item))}:{kind:'create',name:item.type});},warning:{open(callback,name,seconds){record({kind:'warning',name,seconds});}}},goods:{throwGoods(x,y,item){assert.equal(x,10);assert.equal(y,20);record({kind:'throw',item:JSON.parse(JSON.stringify(item))});}},encounter(){}};
  const math=Object.create(Math);math.random=()=>{expectedCalls.push('fraction');return .37;};
  const context=vm.createContext({random:expectedRandom,Math:math,_root:roots,role:original.role,_parent:original._parent,haveMonst:()=>remaining,encounterNext:wave===1?'第二批强盗':'强盗首领'});
  for(const [name,script]of Object.entries(scripts))original[name]=script.runInContext(context);
  context.dropSoul=original.dropSoul.bind(original);
  original.monsterDeath(wave===3?'强盗首领':'强盗',10,20,20);
  banditDrops(wave,profession,remaining,actualRandom,()=>{actualCalls.push('fraction');return .37;},event=>{actual.push(event);if(consume&&['create','create-item','throw'].includes(event.kind))actualRandom(1000);});
  assert.deepEqual(actual,expected,JSON.stringify({wave,profession,remaining,endpoint,consume}));assert.deepEqual(actualCalls,expectedCalls);
 }
});
