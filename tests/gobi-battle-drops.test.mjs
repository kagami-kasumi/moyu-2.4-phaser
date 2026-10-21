import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {gobiDrops} from '../src/domain/gobi-battle.ts';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';
import {FirstCombat} from '../src/domain/first-combat.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/gobi-battle/source-fixture.json'));
const source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];
const rootSource=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction_2.as','utf8');
const roots=Object.fromEntries(['devilSoul','minSoul','maxSoul'].map(key=>[key,JSON.parse(rootSource.match(new RegExp(key+' = (\\[[^;]+);'))[1])]));
const names=['monsterDeath','dropItem','dropNormalItem','dropStone','dropFlower','dropHSItem','dropMsBag','dropBossItem','dropBossStone','dropSoul'];
const scripts=Object.fromEntries(names.map(name=>[name,new vm.Script('(function('+(name==='monsterDeath'||name==='dropItem'?'mName,fX,fY,level':name==='dropSoul'?'rnd,fX,fY,level':'fX,fY,level')+')'+functionRange(source,`this.${name} =`).text+')')]));
test('gobi soldiers, vice and commander drops match original complete functions and interleaved random calls',()=>{
 for(const name of ['魔军士兵','魔军副将','魔军主将'])for(const profession of ['战士','法师'])for(const level of [30,35])for(const endpoint of [0,9,10,24,25,49,50,99,100,149,150,199,200,499,500,1999,2000,9001,9999])for(const consume of [false,true]){
  const expected=[],actual=[],expectedCalls=[],actualCalls=[];
  let expectedIndex=0,actualIndex=0;
  const draw=(limit,index)=>(endpoint+index*71)%10000%Math.trunc(limit);
  const expectedRandom=limit=>{expectedCalls.push(limit);return draw(limit,expectedIndex++);};
  const actualRandom=limit=>{actualCalls.push(limit);return draw(limit,actualIndex++);};
  const record=event=>{expected.push(event);if(consume&&['create','create-item','throw'].includes(event.kind))expectedRandom(1000);};
  const original={role:{levels:level,vocational:profession,creditUp:amount=>record({kind:'credit',amount})},_parent:{task:{catchThing:(name,count)=>record({kind:'catch',name,count})},createThing(item,dropped,x,y){assert.equal(dropped,true);assert.equal(x,10);assert.equal(y,20);record(item.type==='宝石'?{kind:'create-item',item:JSON.parse(JSON.stringify(item))}:{kind:'create',name:item.type});},warning:{open(callback,name,seconds){record({kind:'warning',name,seconds});}}},goods:{throwGoods(x,y,item){assert.equal(x,10);assert.equal(y,20);record({kind:'throw',item:JSON.parse(JSON.stringify(item))});}},encounter(){}};
  const math=Object.create(Math);math.random=()=>{expectedCalls.push('fraction');return .37;};
  const context=vm.createContext({random:expectedRandom,Math:math,_root:roots,role:original.role,_parent:original._parent,haveMonst:()=>true,nowRegion:'centerRegion'});
  for(const [name,script]of Object.entries(scripts))original[name]=script.runInContext(context);
  context.dropSoul=original.dropSoul.bind(original);
  original.monsterDeath(name,10,20,level);
  gobiDrops(name,level,profession,actualRandom,()=>{actualCalls.push('fraction');return .37;},event=>{actual.push(event);if(consume&&['create','create-item','throw'].includes(event.kind))actualRandom(1000);});
  assert.deepEqual(actual,expected,JSON.stringify({name,profession,level,endpoint,consume}));assert.deepEqual(actualCalls,expectedCalls);
 }
});

test('real root createThing and original generators agree with live inventory drops and coordinate RNG',()=>{
 const maps=JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json')),actors={战士:JSON.parse(fs.readFileSync('public/assets/first-actor/manifest.json')),法师:JSON.parse(fs.readFileSync('public/assets/mage/manifest.json'))};
 const factory=new vm.Script('(function(tThing,isDrop,fX,fY)'+functionRange(fixture.sources['frame_9/DoAction'],'this.createThing =').text+')');
 for(const name of ['魔军士兵','魔军副将','魔军主将'])for(const profession of ['战士','法师'])for(const endpoint of [0,1,9,10,99,100,499,500,1999,9999]){
  const expected=[],expectedCalls=[],actualCalls=[];let expectedIndex=0,actualIndex=0;
  const random=(calls,index)=>limit=>{calls.push(limit);return (endpoint+index()*71)%10000%Math.trunc(limit);};
  const expectedRandom=random(expectedCalls,()=>expectedIndex++),actualRandom=random(actualCalls,()=>actualIndex++);
  const original={role:{levels:35,vocational:profession,creditUp(){}},_parent:{task:{catchThing(){}}},goods:{throwGoods(x,y,item){expected.push({x:x+75-expectedRandom(150),y:y+25-expectedRandom(50),item:JSON.parse(JSON.stringify(item))});}}};
  original._parent.map=original;original._parent.createThing=factory.runInNewContext().bind(original._parent);const math=Object.create(Math);math.random=()=>{expectedCalls.push('fraction');return .37;};
  const context=vm.createContext({random:expectedRandom,Math:math,_root:roots,role:original.role,_parent:original._parent,nowRegion:'centerRegion'});for(const [key,script]of Object.entries(scripts))original[key]=script.runInContext(context);context.dropSoul=original.dropSoul.bind(original);original.monsterDeath(name,300,300,35);
  const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('工厂验证',profession);const combat=new FirstCombat({inventory:journey.inventory,pets:journey.petProgression,position:()=>({x:300,y:300,facing:'left'}),contains:()=>true,notice(){},region:'gobiCenter',gobiActive:()=>false});combat.random=actualRandom;
  gobiDrops(name,35,profession,actualRandom,()=>{actualCalls.push('fraction');return .37;},event=>combat.reward({x:300,y:300},event));assert.deepEqual(actualCalls,expectedCalls);assert.equal(journey.reward.drops.length,expected.length);
  for(const [index,drop]of expected.entries()){const actual=journey.reward.drops[index];assert.equal(actual.x,drop.x);assert.equal(actual.y,drop.y);for(const [key,value]of Object.entries(drop.item))assert.deepEqual(actual.item[key],value,name+' '+key);}
 }
});
