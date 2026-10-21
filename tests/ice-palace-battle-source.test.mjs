import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnFrostBattle,FROST_REGIONS,frostFlag,frostDefeated,initialFrostBattle} from '../src/domain/ice-palace-battle.ts';
import {CombatSession} from '../src/domain/combat-session.ts';
import {MAP_LINKS} from '../src/content/map-layout.ts';
import {NPCS} from '../src/content/journey-content.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/ice-palace-battle/source-fixture.json')),source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];
test('five original field spawns overwrite monster1, preserve 15 random calls and all numeric fields',()=>{
 for(const [region,frame]of [['frostLeft',139],['frostUp',133],['frostCenter',135],['frostDown',137],['frostRight',141]])for(const draw of [0,1,9,19,99]){
  const expectedCalls=[],actualCalls=[],random=calls=>limit=>{calls.push(limit);return draw%Math.trunc(limit);};
  const original={role:{attackFire:151},allowJumpMap(){},dangerous(){},npc01:{appear(){}},getNpc:title=>title};
  for(let index=1;index<=4;index++){original['entry'+index]={};original['monster'+index]={monsterName:{},monsterFire:{}};}
  const context=vm.createContext({...original,random:random(expectedCalls),nowMap:'战场',homeCity:'树心城',[frostFlag(region)]:true});
  const init=fixture.sources['DefineSprite_4536/frame_2/DoAction'];vm.runInContext(init.slice(init.indexOf('var bLife =')),context);
  original.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(context);context.initMonster=original.initMonster.bind(original);
  new vm.Script('(function(){'+fixture.sources[`DefineSprite_4536/frame_${frame}/DoAction`]+'})').runInContext(context).call(original);
  const actual=spawnFrostBattle(region,random(actualCalls));assert.deepEqual(actualCalls,expectedCalls);assert.equal(actual.length,4);assert.equal(actualCalls.length,15);
  actual.forEach((monster,index)=>{const expected=original['monster'+(index+1)];for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum','stopTime'])assert.equal(monster[key],expected[key],region+' '+key);assert.equal(monster.level,expected.levels);assert.equal(monster.textColor,expected.monsterName.textColor);assert.equal(monster.name,expected.myName);assert.equal(monster.species,expected.type);assert.equal(monster.x,expected._x);assert.equal(monster.y,expected._y);});
 }
});
test('source vice clears only current region, commander clears all, soldier clears none',()=>{
 for(const region of FROST_REGIONS)for(const name of ['魔军士兵','魔军副将','魔军主将']){
  const actual=initialFrostBattle();for(const area of FROST_REGIONS)actual[frostFlag(area)]=true;
  const context=vm.createContext({...actual,nowRegion:frostFlag(region),role:{creditUp(){}},dropSoul(){},_parent:{task:{catchThing(){}}}}),owner={...actual,_parent:context._parent,dropItem(){}};
  new vm.Script('(function(mName,fX,fY,level)'+functionRange(source,'this.monsterDeath =').text+')').runInContext(context).call(owner,name,0,0,35);
  frostDefeated(actual,region,name);for(const area of FROST_REGIONS)assert.equal(actual[frostFlag(area)],name==='魔军副将'?owner[frostFlag(area)]:context[frostFlag(area)]);
 }
});

test('all 20 selectors and 7 animated timelines retain original completion and facing',()=>{
 for(const [region,index,selector,animations]of [['frostCenter',1,3860,[3841,3850,3859]],['frostCenter',0,3886,[3876,3885]],['frostRight',0,3912,[3902,3911]]]){
  const sourceFrames=fixture.timelines[selector].frames;assert.equal(sourceFrames.length,index===1?8:6);
  assert.equal(fixture.timelines[animations[0]].frames.length,12);
  for(const facing of ['left','right'])for(const effect of index===1?['attack','skill']:['attack']){
   const monster=spawnFrostBattle(region,()=>0)[index],animation=animations[effect==='skill'?2:1],length=fixture.timelines[animation].frames.length,actor={};
   vm.runInNewContext(fixture.sources[`DefineSprite_${animation}/frame_${length}/DoAction`],{_parent:{_parent:actor}});assert.equal(actor.motion,'使用技能结束');
   Object.assign(monster,{effect,facing,motion:'acting',target:'role'});const hits=[],role={id:'role',x:monster.x+10,y:monster.y,alive:true,motion:'idle',animationFrame:1};
   const session=new CombatSession([monster],{role,pets:()=>[],roleActivity(){},hitMonster(){},hitParty:(enemy,hit)=>hits.push(hit),random:()=>0});session.paused=true;session.advance(10000);assert.equal(monster.animationFrame,1);session.paused=false;
   for(let frame=2;frame<=length;frame++){session.step();assert.equal(monster.animationFrame,frame);assert.equal(hits.length,0);}assert.equal(monster.motion,'finished');session.step();assert.equal(hits.length,1);
  }
 }
});



test('five graph links, quartermaster placement and home reassignment match original map scripts',()=>{
 const names={frostLeft:'冰宫战场左',frostUp:'冰宫战场上',frostCenter:'冰宫战场中',frostDown:'冰宫战场下',frostRight:'冰宫战场右'};
 for(const [region,frame]of [['frostLeft',139],['frostUp',133],['frostCenter',135],['frostDown',137],['frostRight',141]]){
  const appeared=[],context={nowMap:names[region],homeCity:'树心城',oldCity:'卡萨诺城二',getNpc:title=>title,allowJumpMap(){},dangerous(){},npc01:{appear:(...args)=>appeared.push(args)},[frostFlag(region)]:false};for(let index=1;index<=4;index++)context['entry'+index]={};vm.runInNewContext(fixture.sources[`DefineSprite_4536/frame_${frame}/DoAction`],context);
  for(const [entry,link]of Object.entries(MAP_LINKS[region])){assert.equal(names[link.toMap],context[entry].toMap);assert.equal(link.toEntry,context[entry].toEntry);}
  assert.equal(context.nowRegion,frostFlag(region));if(region==='frostLeft'){assert.equal(context.homeCity,names[region]);assert.equal(context.oldCity,'树心城');assert.deepEqual(appeared,NPCS.frostLeft.map(npc=>[npc.title,npc.x,npc.y]));assert.equal(NPCS.frostLeft[0].shape,Number(fixture.timelines[4308].frames[7][0].characterId));}
 }
 for(const doing of [false,true])for(const complete of [false,true]){
  const warnings=[],context={nowMap:'冰宫郊区',getTimer:()=>0,_root:{tempTaskTime:0,tempTaskWait:9999},_parent:{huanShouShop2:{},task:{getTask:()=>({isDoing:doing,isComplete:complete})}},allowJumpMap(){},getNpc:title=>title,npc01:{appear(){}},npc02:{appear(){}},冰柱:{},dangerous(){},entry1:{},entry2:{},entry3:{}};context._parent.warning={open:(callback,place,seconds)=>warnings.push([place,seconds])};vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_84/DoAction'],context);assert.deepEqual(warnings,doing&&!complete?[['冰宫郊区',5]]:[]);assert.equal(context.entry3._visible,doing&&!complete?false:undefined);assert.equal(context._parent.huanShouShop2.openNumber,15);assert.equal(context.冰柱._visible,true);
 }
});


test('original ice encounter commits map before flags; left starts empty on natural entry',()=>{
 const events=[],context=vm.createContext({leftRegion:true,upRegion:false,centerRegion:false,downRegion:false,rightRegion:false});
 context.gotoAndStop=map=>events.push([map,context.leftRegion,context.upRegion]);const owner={_parent:{}};
 new vm.Script('(function(place)'+functionRange(source,'this.encounter =').text+')').runInContext(context).call(owner,'冰宫郊区');
 assert.equal(context.nextMap,'冰宫战场左');assert.equal(context.nextEntry,'entry2');assert.equal(context.leftRegion,false);for(const flag of ['upRegion','centerRegion','downRegion','rightRegion'])assert.equal(context[flag],true);
 assert.deepEqual(events,[['冰宫战场左',true,false]]);
});


test('outskirts NPC appearance, source labels, pillar visibility and stock are independently evidenced',()=>{const calls=[],owner={allowJumpMap(){},dangerous(){},entry1:{},entry2:{},entry3:{},npc01:{appear:(...a)=>calls.push(a)},npc02:{appear:(...a)=>calls.push(a)},冰柱:{},_parent:{huanShouShop2:{},task:{getTask:()=>({isDoing:false,isComplete:true})}}};vm.runInNewContext(fixture.sources['DefineSprite_4536/frame_84/DoAction'],{...owner,getNpc:n=>n,getTimer:()=>0,_root:{tempTaskTime:0,tempTaskWait:1}});assert.deepEqual(calls,NPCS.frostOutskirts.map(n=>[n.title,n.x,n.y]));assert.equal(owner._parent.huanShouShop2.openNumber,15);assert.equal(owner.冰柱._visible,true);const pillar=fixture.maps[84].find(x=>x.name==='冰柱');assert.equal(Number(pillar.characterId),4315);assert.equal(Number(pillar.matrix.translateX)/20,247.95);assert.equal(Number(fixture.timelines[4315].frames[0][0].characterId),4314);assert(source.includes('if(nowMap != "冰宫郊区")'));});
