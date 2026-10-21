import {rewardEquipment} from '../src/domain/npc-reward.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {iceDrops} from '../src/domain/ice-battle.ts';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';
import {FirstCombat} from '../src/domain/first-combat.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/ice-battle/source-fixture.json'));
const source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];
const rootSource=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction_2.as','utf8');
const roots=Object.fromEntries(['devilSoul','minSoul','maxSoul'].map(key=>[key,JSON.parse(rootSource.match(new RegExp(key+' = (\\[[^;]+);'))[1])]));
const names=['monsterDeath','dropItem','dropNormalItem','dropStone','dropFlower','dropHSItem','dropMsBag','dropBossItem','dropBossStone','dropSoul'];
const scripts=Object.fromEntries(names.map(name=>[name,new vm.Script('(function('+(name==='monsterDeath'||name==='dropItem'?'mName,fX,fY,level':name==='dropSoul'?'rnd,fX,fY,level':'fX,fY,level')+')'+functionRange(source,`this.${name} =`).text+')')]));
test('ice soldiers, vice and commander drops match original complete functions and interleaved random calls',()=>{
 for(const name of ['魔军士兵','魔军副将','魔军主将'])for(const profession of ['战士','法师'])for(const level of [70,72,75])for(const endpoint of [0,9,10,24,25,49,50,99,100,149,150,199,200,499,500,1999,2000,9001,9999])for(const consume of [false,true]){
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
  iceDrops(name,level,profession,actualRandom,()=>{actualCalls.push('fraction');return .37;},event=>{actual.push(event);if(consume&&['create','create-item','throw'].includes(event.kind))actualRandom(1000);});
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
  const original={role:{levels:65,vocational:profession,creditUp(){}},_parent:{task:{catchThing(){}}},goods:{throwGoods(x,y,item){expected.push({x:x+75-expectedRandom(150),y:y+25-expectedRandom(50),item:JSON.parse(JSON.stringify(item))});}}};
  original._parent.map=original;original._parent.createThing=factory.runInNewContext().bind(original._parent);const math=Object.create(Math);math.random=()=>{expectedCalls.push('fraction');return .37;};
  const context=vm.createContext({random:expectedRandom,Math:math,_root:roots,role:original.role,_parent:original._parent,nowRegion:'centerRegion'});for(const [key,script]of Object.entries(scripts))original[key]=script.runInContext(context);context.dropSoul=original.dropSoul.bind(original);original.monsterDeath(name,300,300,65);
  const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('工厂验证',profession);const combat=new FirstCombat({inventory:journey.inventory,pets:journey.petProgression,position:()=>({x:300,y:300,facing:'left'}),contains:()=>true,notice(){},region:'iceCenter',gobiActive:()=>false});combat.random=actualRandom;
  iceDrops(name,65,profession,actualRandom,()=>{actualCalls.push('fraction');return .37;},event=>combat.reward({x:300,y:300},event));assert.deepEqual(actualCalls,expectedCalls);assert.equal(journey.reward.drops.length,expected.length);
  for(const [index,drop]of expected.entries()){const actual=journey.reward.drops[index];assert.equal(actual.x,drop.x);assert.equal(actual.y,drop.y);for(const [key,value]of Object.entries(drop.item))assert.deepEqual(actual.item[key],value,name+' '+key);}
 }
});

test('every emitted drop has a concrete consumption path: merchant sale or soul attachment',()=>{
 for(const profession of ['战士','法师']){
 const j=new Journey(JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json')),new Actor(JSON.parse(fs.readFileSync('public/assets/first-actor/manifest.json'))));j.start('掉落消费');j.reward.profession=profession;j.arrive('city','entry1','city');const collected=new Map();
 const combat=new FirstCombat({inventory:j.inventory,pets:j.petProgression,position:()=>({x:300,y:300,facing:'left'}),contains:()=>true,notice(){},region:'iceCenter',gobiActive:()=>false});
 for(const name of ['魔军士兵','魔军副将','魔军主将'])for(let seed=0;seed<200;seed++){
 j.reward.drops=[];let index=0;const random=limit=>(seed===0?0:seed===199?limit-1:(seed*73+index++*37)%limit);combat.random=random;
 iceDrops(name,name==='魔军士兵'?60:name==='魔军副将'?62:65,profession,random,()=>.5,event=>combat.reward({x:300,y:300},event));
 for(const drop of j.reward.drops)collected.set(drop.item.name??drop.item.type,drop.item);
 }
 for(const name of ['中魔石袋子','极品玉石','9朵玫瑰','魔之魂','小元素石','高级经验宝石','庇护铃铛','凤翼铃铛','翡翠铃铛'])assert(collected.has(name),name);
 for(const [name,item]of collected){j.reward.bag.fill(null);if(name==='魔之魂'){j.sockets.show();j.sockets.item=rewardEquipment(profession)[0];j.sockets.stone={...item};assert(j.sockets.forgeSoul());assert.equal(j.sockets.item.val1,item.val1);assert.equal(j.sockets.item.val2,item.val2);assert.equal(j.sockets.stone,null);j.sockets.close();}else{j.reward.bag[0]={...item};j.shop.interact();j.shop.show();assert(j.shop.sell(0,j.reward.bag[0]),name);assert.equal(j.reward.bag[0],null);j.shop.close();}}
 }
});

