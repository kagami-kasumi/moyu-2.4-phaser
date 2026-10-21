import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnAbyssBattle,ABYSS_REGIONS,abyssFlag,abyssDefeated,initialAbyssBattle} from '../src/domain/black-abyss-battle.ts';
import {CombatSession} from '../src/domain/combat-session.ts';
import {MAP_LINKS} from '../src/content/map-layout.ts';
import {NPCS} from '../src/content/journey-content.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/black-abyss-battle/source-fixture.json')),source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];
test('five original field spawns overwrite monster1, preserve 15 random calls and all numeric fields',()=>{
 for(const [region,frame]of [['abyssLeft',148],['abyssUp',142],['abyssCenter',144],['abyssDown',146],['abyssRight',150]])for(const draw of [0,1,9,19,99]){
  const expectedCalls=[],actualCalls=[],random=calls=>limit=>{calls.push(limit);return draw%Math.trunc(limit);};
  const original={role:{attackFire:151},allowJumpMap(){},dangerous(){},npc01:{appear(){}},getNpc:title=>title};
  for(let index=1;index<=4;index++){original['entry'+index]={};original['monster'+index]={monsterName:{},monsterFire:{}};}
  const context=vm.createContext({...original,random:random(expectedCalls),nowMap:'战场',homeCity:'树心城',[abyssFlag(region)]:true});
  const init=fixture.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),context);
  original.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(context);context.initMonster=original.initMonster.bind(original);
  new vm.Script('(function(){'+fixture.sources[`DefineSprite_4536/frame_${frame}/DoAction`]+'})').runInContext(context).call(original);
  const actual=spawnAbyssBattle(region,random(actualCalls));assert.deepEqual(actualCalls,expectedCalls);assert.equal(actual.length,4);assert.equal(actualCalls.length,15);
  actual.forEach((monster,index)=>{const expected=original['monster'+(index+1)];for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(monster[key],expected[key],region+' '+key);assert.equal(monster.level,expected.levels);assert.equal(monster.textColor,expected.monsterName.textColor);assert.equal(monster.name,expected.myName);assert.equal(monster.species,expected.type);assert.equal(monster.x,expected._x);assert.equal(monster.y,expected._y);});
 }
});
test('source vice clears only current region, commander clears all, soldier clears none',()=>{
 for(const region of ABYSS_REGIONS)for(const name of ['魔军士兵','魔军副将','魔军主将']){
  const actual=initialAbyssBattle();for(const area of ABYSS_REGIONS)actual[abyssFlag(area)]=true;
  const context=vm.createContext({...actual,nowRegion:abyssFlag(region),role:{creditUp(){}},dropSoul(){},_parent:{task:{catchThing(){}}}}),owner={...actual,_parent:context._parent,dropItem(){}};
  new vm.Script('(function(mName,fX,fY,level)'+functionRange(source,'this.monsterDeath =').text+')').runInContext(context).call(owner,name,0,0,35);
  abyssDefeated(actual,region,name);for(const area of ABYSS_REGIONS)assert.equal(actual[abyssFlag(area)],name==='魔军副将'?owner[abyssFlag(area)]:context[abyssFlag(area)]);
 }
});

test('all 20 selectors and 7 animated timelines retain original completion and facing',()=>{
 for(const [region,index,selector,animations]of [['abyssCenter',1,3860,[3841,3850,3859]],['abyssCenter',0,3886,[3876,3885]],['abyssRight',0,3912,[3902,3911]]]){
  const sourceFrames=fixture.timelines[selector].frames;assert.equal(sourceFrames.length,index===1?8:6);
  assert.equal(fixture.timelines[animations[0]].frames.length,12);
  for(const facing of ['left','right'])for(const effect of index===1?['attack','skill']:['attack']){
   const monster=spawnAbyssBattle(region,()=>0)[index],animation=animations[effect==='skill'?2:1],length=fixture.timelines[animation].frames.length,actor={};
   vm.runInNewContext(fixture.sources[`DefineSprite_${animation}/frame_${length}/DoAction`],{_parent:{_parent:actor}});assert.equal(actor.motion,'使用技能结束');
   Object.assign(monster,{effect,facing,motion:'acting',target:'role'});const hits=[],role={id:'role',x:monster.x+10,y:monster.y,alive:true,motion:'idle',animationFrame:1};
   const session=new CombatSession([monster],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(enemy,hit)=>hits.push(hit),random:()=>0});session.paused=true;session.advance(10000);assert.equal(monster.animationFrame,1);session.paused=false;
   for(let frame=2;frame<=length;frame++){session.step();assert.equal(monster.animationFrame,frame);assert.equal(hits.length,0);}assert.equal(monster.motion,'finished');session.step();assert.equal(hits.length,1);
  }
 }
});



test('five graph links, quartermaster placement and home reassignment match original map scripts',()=>{
 const names={abyssLeft:'黑渊战场左',abyssUp:'黑渊战场上',abyssCenter:'黑渊战场中',abyssDown:'黑渊战场下',abyssRight:'黑渊战场右'};
 for(const [region,frame]of [['abyssLeft',148],['abyssUp',142],['abyssCenter',144],['abyssDown',146],['abyssRight',150]]){
  const appeared=[],context={nowMap:names[region],homeCity:'树心城',oldCity:'卡萨诺城二',getNpc:title=>title,allowJumpMap(){},dangerous(){},npc01:{appear:(...args)=>appeared.push(args)},[abyssFlag(region)]:false};for(let index=1;index<=4;index++)context['entry'+index]={};vm.runInNewContext(fixture.sources[`DefineSprite_4536/frame_${frame}/DoAction`],context);
  for(const [entry,link]of Object.entries(MAP_LINKS[region])){assert.equal(names[link.toMap],context[entry].toMap);assert.equal(link.toEntry,context[entry].toEntry);}
  assert.equal(context.nowRegion,abyssFlag(region));if(region==='abyssLeft'){assert.equal(context.homeCity,names[region]);assert.equal(context.oldCity,'树心城');assert.deepEqual(appeared,NPCS.abyssLeft.map(npc=>[npc.title,npc.x,npc.y]));assert.equal(NPCS.abyssLeft[0].shape,Number(fixture.timelines[4308].frames[7][0].characterId));}
 }
 for(const doing of [false,true])for(const complete of [false,true]){
  const warnings=[],context={tempTaskPlace:'黑渊入口',random:()=>999,nowMap:'黑渊入口',getTimer:()=>0,_root:{tempTaskTime:0,tempTaskWait:9999},_parent:{huanShouShop2:{},task:{getTask:()=>({isDoing:doing,isComplete:complete})}},allowJumpMap(){},getNpc:title=>title,npc01:{appear(){}},npc02:{appear(){}},冰柱:{},dangerous(){},entry1:{},entry2:{},entry3:{}};context._parent.warning={open:(callback,place,seconds)=>warnings.push([place,seconds])};vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_95/DoAction'],context);assert.deepEqual(warnings,doing&&!complete?[['黑渊入口',5]]:[]);assert.equal(context.entry3._visible,true);assert.equal(context.entry1.toMap,'冰宫');assert.equal(context.entry2.toMap,'黑渊一');assert.equal(context.entry3.toMap,'失落高地一');
 }
});


test('original ice encounter commits map before flags; left starts empty on natural entry',()=>{
 const events=[],context=vm.createContext({leftRegion:true,upRegion:false,centerRegion:false,downRegion:false,rightRegion:false});
 context.gotoAndStop=map=>events.push([map,context.leftRegion,context.upRegion]);const owner={_parent:{}};
 new vm.Script('(function(place)'+functionRange(source,'this.encounter =').text+')').runInContext(context).call(owner,'黑渊入口');
 assert.equal(context.nextMap,'黑渊战场左');assert.equal(context.nextEntry,'entry2');assert.equal(context.leftRegion,false);for(const flag of ['upRegion','centerRegion','downRegion','rightRegion'])assert.equal(context[flag],true);
 assert.deepEqual(events,[['黑渊战场左',true,false]]);
});


