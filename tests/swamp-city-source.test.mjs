import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnSwampMirage,swampMirageDrops} from '../src/domain/swamp-city.ts';
import {CombatSession} from '../src/domain/combat-session.ts';
import {NPCS} from '../src/content/journey-content.ts';
import {mirageIntrusion} from '../src/domain/kasano-mirage.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/swamp-city/source-fixture.json'));
const source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];

test('four mirage guards match original frame54 and initMonster with all numeric fields and RNG order',()=>{
 for(const draw of [0,1,9,19,49,999]){
  const expectedCalls=[],actualCalls=[],random=calls=>limit=>{calls.push(limit);return draw%Math.trunc(limit);};
  const original={role:{attackFire:50},entry6:{},allowJumpMap(){},dangerous(){}};
  for(let index=1;index<=4;index++)original['monster'+index]={monsterName:{},monsterFire:{}};
  const context=vm.createContext({...original,random:random(expectedCalls)});
  const initialization=fixture.sources['DefineSprite_4536/frame_2/DoAction'];
  vm.runInContext(initialization.slice(initialization.indexOf('var bLife =')),context);
  original.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(context);
  context.initMonster=original.initMonster.bind(original);
  new vm.Script('(function(){'+fixture.sources['DefineSprite_4536/frame_54/DoAction']+'})').runInContext(context).call(original);
  const actual=spawnSwampMirage(random(actualCalls));assert.deepEqual(actualCalls,expectedCalls);assert.equal(actual.length,4);
  actual.forEach((monster,index)=>{
   const expected=original['monster'+(index+1)];
   for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum'])assert.equal(monster[key],expected[key],key);
   assert.equal(monster.name,expected.myName);assert.equal(monster.species,expected.type);assert.equal(monster.x,expected._x);assert.equal(monster.y,expected._y);
  });
  assert.equal(original.entry6.toMap,'沼泽');assert.equal(original.entry6.toEntry,'backPoint');assert.equal(original.entry6._visible,false);
 }
});

test('all ten ordinary reward branches and SuperHS thresholds preserve original death and factory RNG order',()=>{
 for(const remaining of [true,false])for(let branch=0;branch<10;branch++)for(const chance of [0,19,20,99])for(let egg=0;egg<4;egg++){
  const expected=[],actual=[],expectedCalls=[],actualCalls=[];
  const random=calls=>limit=>{calls.push(limit);return limit===10?branch:limit===100?chance:limit===4?egg:0;};
  const expectedRandom=random(expectedCalls),actualRandom=random(actualCalls);
  const parent={task:{catchThing:(name,count)=>expected.push({kind:'catch',name,count})},map:{goods:{throwGoods(x,y,item){
   expected.push({kind:'create',name:item.name??item.type,atRole:x===undefined&&y===undefined});expectedRandom(150);expectedRandom(50);
  }}}};
  parent.createThing=new vm.Script('(function(tThing,isDrop,fX,fY)'+functionRange(fixture.sources['frame_9/DoAction'],'this.createThing =').text+')').runInNewContext().bind(parent);
  const context=vm.createContext({_parent:parent,role:{creditUp:amount=>expected.push({kind:'credit',amount})},random:expectedRandom,maxArr:[4,6,8,10,11,12,13],fX:undefined,fY:undefined,haveMonst:()=>remaining,entry1:{}});
  for(const [name,args]of [['dropItemX','prizeLevel,fX,fY'],['SuperHS','rand']])context[name]=new vm.Script('(function('+args+')'+functionRange(source,'function '+name).text+')').runInContext(context);
  new vm.Script('(function(mName,fX,fY,level)'+functionRange(source,'this.monsterDeath =').text+')').runInContext(context).call({_parent:parent},'幻影绿魔精',100,200,45);
  swampMirageDrops(remaining,actualRandom,(event,atRole=false)=>{actual.push(event.kind==='create'?{...event,atRole}:event);if(event.kind==='create'){actualRandom(150);actualRandom(50);}});
  assert.deepEqual(actual,expected);assert.deepEqual(actualCalls,expectedCalls);assert.equal(context.entry1._visible,remaining?undefined:true);
 }
});

test('city source raises pharmacy floor, grants once and uses shared strict intrusion timer',()=>{
 const frame=fixture.sources['DefineSprite_4536/frame_53/DoAction'];
 for(const elapsed of [0,300000,300001,1e7])for(const chance of [.05,.5])for(const draw of [0,.049999,.05,.499999,.5,.999])for(const granted of [false,true])for(const openNumber of [2,4,7]){
  let jumped=false,draws=0;const gifts=[];
  const context={nowMap:'沼泽',沼泽获得幻境:granted,Math:{random:()=>{draws++;return draw;}},getTimer:()=>elapsed,_root:{intoV:chance,intoTime:0,intoWait:300000},_parent:{huanShouShop2:{},drugShop:{openNumber},createThing:item=>gifts.push(item.type)},_global:{playBackSound(){}},allowJumpMap(){},dangerous(){},getNpc:title=>title,gotoAndStop(){jumped=true;}};
  for(let index=1;index<=5;index++){context['entry'+index]={};context['npc0'+index]={appear(){}};}
  vm.runInNewContext(frame,context);assert.equal(jumped,mirageIntrusion(elapsed,chance,draw));assert.equal(draws,1);assert.equal(context._root.intoTime,jumped?elapsed:0);
  assert.equal(context.homeCity,'沼泽');assert.equal(context._parent.drugShop.openNumber,Math.max(7,openNumber));assert.deepEqual(gifts,granted?[]:['沼泽幻境']);assert.equal(context.沼泽获得幻境,true);
 }
 assert(!fixture.maps['54'].some(layer=>layer.name==='entry1'));assert(fixture.maps['54'].some(layer=>layer.name==='entry6'));
 assert(fixture.maps['53'].some(layer=>layer.name==='backPoint'&&layer.depth===16));
});

test('all four NPC positions and selector pictures match source frame53',()=>{
 const appeared=[],context={nowMap:'沼泽',沼泽获得幻境:true,Math:{random:()=>1},getTimer:()=>0,_root:{intoV:0,intoTime:0,intoWait:300000},_parent:{huanShouShop2:{},drugShop:{openNumber:2}},_global:{playBackSound(){}},allowJumpMap(){},dangerous(){},getNpc:title=>title};
 for(let index=1;index<=5;index++){context['entry'+index]={};context['npc0'+index]={appear:(...args)=>appeared.push(args)};}
 vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_53/DoAction'],context);
 assert.deepEqual(appeared,NPCS.swampCity.map(npc=>[npc.title,npc.x,npc.y]));
 const selector=fixture.timelines['4308'];
 for(const npc of NPCS.swampCity){const frame=Number(Object.entries(selector.labels).find(([,label])=>label===npc.title)[0]);assert.equal(npc.shape,Number(selector.frames[frame-1][0].characterId));}
});

test('eight selectors, run twelve frames, attack nine and skill eight frames; pause and terminal hit',()=>{
 assert.equal(fixture.timelines['3380'].frames.length,8);assert.equal(fixture.timelines['3361'].frames.length,12);
 for(const [id,length] of [[3370,9],[3379,8]]){const actor={};vm.runInNewContext(fixture.sources['DefineSprite_'+id+'/frame_'+length+'/DoAction'],{_parent:{_parent:actor}});assert.equal(actor.motion,'使用技能结束');}
 for(const facing of ['left','right'])for(const effect of ['attack','skill']){
  const length=effect==='skill'?8:9,monster=spawnSwampMirage(()=>0)[0];Object.assign(monster,{effect,facing,motion:'acting',target:'role'});
  const role={id:'role',x:monster.x+10,y:monster.y,alive:true,motion:'idle',animationFrame:1},hits=[];
  const session=new CombatSession([monster],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(enemy,hit)=>hits.push(hit),random:()=>0});
  session.paused=true;session.advance(10000);assert.equal(monster.animationFrame,1);session.paused=false;
  for(let frame=2;frame<=length;frame++){session.step();assert.equal(monster.animationFrame,frame);assert.equal(hits.length,0);}
  assert.equal(monster.motion,'finished');session.step();assert.equal(hits.length,1);assert.equal(monster.effect,'none');session.close();session.advance(10000);assert.equal(hits.length,1);
 }
});

test('necessary bravery training uses original bookShop price, factory book and passive progression',async()=>{
 const text=fixture.sources['frame_9/DoAction_2'],line=text.match(/this\.bookShop\.saleThings = (.*);/)[1],context={};vm.runInNewContext('books='+line,context);assert.equal(context.books.length,14);assert.equal(context.books[12].name,'英勇');assert.equal(context.books[12].salePrice,5000);
 const {OrdinaryShop,shopItem}=await import('../src/domain/ordinary-shop.ts'),{NpcReward}=await import('../src/domain/npc-reward.ts'),shop=new OrdinaryShop(new NpcReward('test'),()=>true,()=>({x:0,y:0}),()=>true,'bravery');assert.deepEqual(shop.goods[0],JSON.parse(JSON.stringify(context.books[12])));const item=shopItem(shop.goods[0]);assert.equal(item.type,'技能书');assert.equal(item.name,'英勇');assert.equal(item.vocational,'公共');assert.equal(item.levels,1);
 assert.match(fixture.sources['DefineSprite_4312/frame_1/DoAction'],/case 9062:[\s\S]*?bookShop.open\(\)/);
});
