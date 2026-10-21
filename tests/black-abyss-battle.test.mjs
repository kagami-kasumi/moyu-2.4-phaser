import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';
import {captureSave,savedProgress} from '../src/application/save-game.ts';
import {encodeSave,decodeSave,validateProgress} from '../src/application/save-codec.ts';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
import {literalItem} from '../src/content/registry.ts';
import {ABYSS_REGIONS,abyssFlag} from '../src/domain/black-abyss-battle.ts';

const json=path=>JSON.parse(fs.readFileSync(path)),maps=json('public/assets/first-slice/manifest.json');
const actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(profession='战士'){const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('冰域旅程',profession);return journey;}
function reach(journey){journey.vitals.level=90;journey.inventory.refresh();journey.firstQuest.blackAbyssActive=true;journey.transition('icePalaceCity','entry1');journey.cityVisit.homeCity='冰宫';assert(journey.arrive('abyssEntrance','entry1','abyssEntrance'));}
function battle(journey){reach(journey);for(let index=0;index<75;index++)journey.step();assert.equal(journey.map,'abyssLeft');assert.equal(journey.combat.monsters.length,0);}
function roundtrip(journey){const state=decodeSave(encodeSave(captureSave(journey.progress())));journey.restore(savedProgress(state));return {journey,raw:restorePreservedValue(state.source)};}
function arrive(journey,map,entry){assert(journey.arrive(map,entry,map));}

test('both professions complete five-field travel, boss flags, partial restore, quest rewards and correct home',()=>{
 for(const profession of ['战士','法师']){
  let journey=make(profession);battle(journey);assert.equal(journey.cityVisit.homeCity,'黑渊战场左');assert.equal(journey.abyssBattle.oldCity,'冰宫');
  assert(journey.openGobiServices());assert(journey.gobiService('medicine'));assert.equal(journey.pharmacy.openNumber,2);journey.pharmacy.close();
  journey.vitals.life=1;journey.vitals.mp=0;assert(journey.openGobiServices());assert(journey.gobiService('revive'));assert.equal(journey.vitals.life,journey.vitals.maxLife);
  arrive(journey,'abyssUp','entry1');assert.equal(journey.combat.monsters.length,4);journey.combat.random=limit=>limit-1;journey.combat.monsters[1].life-=123;journey.combat.kill(journey.combat.monsters[0]);assert.equal(journey.abyssBattle.upRegion,false);
  journey=roundtrip(journey).journey;assert.equal(journey.combat.monsters[1].life,13647);assert.equal(journey.combat.monsters[0].alive,false);
  arrive(journey,'abyssLeft','entry1');arrive(journey,'abyssUp','entry1');assert.equal(journey.combat.monsters.length,0);
  arrive(journey,'abyssCenter','entry2');assert.equal(journey.combat.monsters[0].name,'魔军副将');arrive(journey,'abyssDown','entry2');assert.equal(journey.combat.monsters.length,4);arrive(journey,'abyssRight','entry3');assert.equal(journey.combat.monsters[0].name,'魔军主将');
  const old=journey.combat,oldQuest=journey.abyss;journey.combat.random=limit=>limit-1;journey.combat.kill(journey.combat.monsters[0]);assert(journey.abyss.claimable);assert(journey.firstQuest.firstLegionActive);for(const region of ABYSS_REGIONS)assert.equal(journey.abyssBattle[abyssFlag(region)],false);assert.equal(journey.combat.monsters.filter(monster=>monster.alive).length,3);
  const restore=roundtrip(journey);journey=restore.journey;assert.equal(restore.raw.mainTask13isComplete,true);assert.equal(restore.raw.mainTask14isDoing,true);assert.equal(restore.raw.map_oldCity,'冰宫');assert.equal(restore.raw.map_nowMap,'黑渊战场右');assert.equal(journey.combat.monsters.filter(monster=>monster.alive).length,3);
  journey.reward.res=0;const merit=journey.inventory.exploit;assert(journey.claimAbyss());assert.equal(journey.reward.res,250000);assert.equal(journey.inventory.exploit,merit+2000);assert.equal(journey.claimAbyss(),false);journey.firstQuest.honor={number:0,isDoing:true,isComplete:false};journey.combat.random=limit=>limit-1;for(const monster of journey.combat.monsters)journey.combat.kill(monster);assert.equal(journey.firstQuest.honor.number,3);
  const ball=journey.reward.bag.findIndex(item=>item?.type==='超级经验球');assert(ball>=0);assert(journey.inventory.use(ball,journey.reward.bag[ball]));assert.equal(journey.inventory.consumables.expBallNum,1);
  const kills=journey.combatLedger.kills.怪物;old.kill(old.monsters[1]);assert.equal(journey.combatLedger.kills.怪物,kills);
  arrive(journey,'abyssCenter','entry4');assert.equal(journey.combat.monsters.length,0);arrive(journey,'abyssLeft','entry2');assert(journey.openGobiServices());assert(journey.gobiService('leave'));assert.equal(journey.map,'icePalaceCity');assert.equal(journey.cityVisit.homeCity,'冰宫');
  const returned=roundtrip(journey);journey=returned.journey;assert.equal(returned.raw.map_oldCity,'冰宫');assert.equal(journey.firstQuest.honor.number,3);arrive(journey,'abyssEntrance','entry1');assert.equal(journey.abyssBattle.warningTicks,0);assert(journey.entries.find(entry=>entry.name==='entry3').visible);
  assert.equal(oldQuest.claim({x:0,y:0},()=>true),false);
 }
});

test('warning pauses, survives saving, cancels on leave; death and lucky return use field home',()=>{
 let journey=make();reach(journey);journey.paused=true;for(let index=0;index<90;index++)journey.step();assert.equal(journey.abyssBattle.warningTicks,75);journey.paused=false;journey.step();journey=roundtrip(journey).journey;assert.equal(journey.abyssBattle.warningTicks,74);arrive(journey,'icePalaceCity','entry3');assert.equal(journey.abyssBattle.warningTicks,0);arrive(journey,'abyssEntrance','entry1');for(let index=0;index<75;index++)journey.step();
 arrive(journey,'abyssCenter','entry1');journey.vitals.life=0;assert(journey.reviveCombat());assert.equal(journey.map,'abyssLeft');assert.equal(journey.x,maps.maps.abyssLeft.layers.find(p=>p.name==='backPoint').matrix[4]);assert.equal(journey.y,maps.maps.abyssLeft.layers.find(p=>p.name==='backPoint').matrix[5]);
 journey.reward.bag[0]=literalItem('幸运之门');assert(journey.inventory.use(0,journey.reward.bag[0]));assert.equal(journey.map,'luckyGate');journey=roundtrip(journey).journey;assert.equal(journey.entries[0].toMap,'abyssLeft');const unsupported=journey.progress();unsupported.cityVisit.homeCity='未知城';journey.restore(unsupported);assert.equal(journey.entries[0].toMap,undefined);assert.equal(journey.arrive('citySecond','backPoint','citySecond'),false);unsupported.cityVisit.homeCity='黑渊战场左';journey.restore(unsupported);arrive(journey,'abyssLeft','backPoint');
 journey.abyssBattle.oldCity='未知城';assert(journey.openGobiServices());assert.equal(journey.gobiService('leave'),false);assert.equal(journey.map,'abyssLeft');
});

test('full bag claims retain drops and malformed states are rejected',()=>{
 let journey=make();battle(journey);arrive(journey,'abyssCenter','entry1');arrive(journey,'abyssRight','entry2');journey.combat.random=limit=>limit-1;journey.combat.kill(journey.combat.monsters[0]);journey.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));assert(journey.claimAbyss());assert(journey.reward.drops.some(drop=>drop.item.type==='超级经验球'));
 const progress=journey.progress();for(const change of [p=>p.abyssBattle.rightRegion=1,p=>p.abyssBattle.warningTicks=1,p=>p.combat.monsters[1].life=13771,p=>p.combat.monsters.pop(),p=>p.combat.monsters[0].attackHeight=35,p=>p.combat.monsters[0].life=1,p=>p.combat.warningTarget='龙怪头目',p=>p.firstQuest.blackAbyss.number=0]){const bad=structuredClone(progress);change(bad);assert.throws(()=>validateProgress(bad));}
});


test('king order gate, legacy mainTask13/13 promotion and opaque source preservation',()=>{
 const j=make();arrive(j,'city','entry1');arrive(j,'citySecond','entry1');const before=j.progress();assert.equal(j.arrive('swampOutskirts','entry2','swampOutskirts'),false);assert.equal(j.map,before.map);assert.equal(j.x,before.x);
 const state=captureSave(j.progress()),extension=restorePreservedValue(state.extensions),raw=restorePreservedValue(state.source);delete extension.game.abyssBattle;delete extension.game.firstQuest.blackAbyss;delete extension.game.firstQuest.blackAbyssActive;delete extension.game.firstQuest.firstLegionActive;
 Object.assign(raw,{map_oldCity:'戈壁',mainTask13isDoing:true,mainTask13isComplete:true,mainTask14isDoing:true,mainBossLv:1,futureAbyss:{untouched:19}});state.extensions=preserveValue(extension);state.source=preserveValue(raw);
 const decoded=decodeSave(encodeSave(state)),promoted=savedProgress(decoded);assert.equal(promoted.abyssBattle.oldCity,'戈壁');assert.deepEqual(promoted.firstQuest.blackAbyss,{number:1,isDoing:true,isComplete:true});assert.equal(promoted.firstQuest.firstLegionActive,true);assert.equal(promoted.firstQuest.firstLegionRebirth,1);j.restore(promoted);const again=captureSave(j.progress(),decoded);assert.deepEqual(restorePreservedValue(again.source).futureAbyss,{untouched:19});
});



test('all six legions share oldCity through transitions, raw save and restore',()=>{
 const j=make();battle(j);
 for(const [field,home]of [['abyssLeft','冰宫'],['frostLeft','戈壁'],['iceLeft','南城一'],['southLeft','冰宫'],['abyssLeft','沼泽'],['swampLeft','树心城'],['gobiLeft','卡萨诺城二']]){
  // Controlled cross-legion transition isolates the shared source home assignment.
  j.cityVisit.homeCity=home;j.transition(field,'backPoint');
  for(const state of [j.frostBattle,j.iceBattle,j.abyssBattle,j.southBattle,j.swampBattle,j.gobiBattle])assert.equal(state.oldCity,home);
  assert.equal(roundtrip(j).raw.map_oldCity,home);
  assert(j.openGobiServices());assert(j.gobiService('leave'));assert.equal(j.cityVisit.homeCity,home);
 }
});

test('controlled left region spawn is preserved; repeated death, paused claim and stale session do not duplicate',()=>{
 const j=make();battle(j);j.abyssBattle.leftRegion=true;
 arrive(j,'abyssCenter','entry1');arrive(j,'abyssLeft','entry2');assert.equal(j.combat.monsters.length,4);
 j.combat.random=n=>n-1;const old=j.combat;j.combat.kill(j.combat.monsters[0]);const kills=j.combatLedger.kills.怪物;j.combat.kill(j.combat.monsters[0]);assert.equal(j.combatLedger.kills.怪物,kills);
 j.vitals.life=0;assert(j.reviveCombat());assert.equal(j.reviveCombat(),false);old.kill(old.monsters[1]);assert.equal(j.combatLedger.kills.怪物,kills);
 j.firstQuest.blackAbyss={number:1,isDoing:true,isComplete:true};j.paused=true;assert.equal(j.claimAbyss(),false);j.paused=false;assert(j.claimAbyss());assert.equal(j.claimAbyss(),false);
});

