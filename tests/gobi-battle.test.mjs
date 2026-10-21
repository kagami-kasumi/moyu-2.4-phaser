import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';
import {captureSave,savedProgress} from '../src/application/save-game.ts';
import {encodeSave,decodeSave,validateProgress} from '../src/application/save-codec.ts';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
import {literalItem} from '../src/content/registry.ts';
import {GOBI_REGIONS,gobiFlag} from '../src/domain/gobi-battle.ts';

const json=path=>JSON.parse(fs.readFileSync(path)),maps=json('public/assets/first-slice/manifest.json');
const actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(profession='战士'){const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('戈壁旅程',profession);return journey;}
function reach(journey){for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['cityThird','entry1'],['shuxinOutskirts','entry1'],['shuxinRoad','entry1'],['shuxinCity','entry1']])assert(journey.arrive(map,entry,map));journey.firstQuest.kingActive=true;assert(journey.arrive('gobiOutskirts','entry1','gobiOutskirts'));}
function battle(journey){reach(journey);for(let index=0;index<75;index++)journey.step();assert.equal(journey.map,'gobiLeft');assert.equal(journey.combat.monsters.length,0);}
function roundtrip(journey){const state=decodeSave(encodeSave(captureSave(journey.progress())));journey.restore(savedProgress(state));return {journey,raw:restorePreservedValue(state.source)};}
function arrive(journey,map,entry){assert(journey.arrive(map,entry,map));}

test('both professions complete five-field travel, boss flags, partial restore, quest rewards and correct home',()=>{
 for(const profession of ['战士','法师']){
  let journey=make(profession);battle(journey);assert.equal(journey.cityVisit.homeCity,'戈壁战场左');assert.equal(journey.gobiBattle.oldCity,'树心城');
  assert(journey.openGobiServices());assert(journey.gobiService('medicine'));assert.equal(journey.pharmacy.openNumber,4);journey.pharmacy.close();
  journey.vitals.life=1;journey.vitals.mp=0;assert(journey.openGobiServices());assert(journey.gobiService('revive'));assert.equal(journey.vitals.life,journey.vitals.maxLife);
  arrive(journey,'gobiUp','entry1');assert.equal(journey.combat.monsters.length,4);journey.combat.random=limit=>limit-1;journey.combat.monsters[1].life-=123;journey.combat.kill(journey.combat.monsters[0]);assert.equal(journey.gobiBattle.upRegion,false);
  journey=roundtrip(journey).journey;assert.equal(journey.combat.monsters[1].life,5232);assert.equal(journey.combat.monsters[0].alive,false);
  arrive(journey,'gobiLeft','entry1');arrive(journey,'gobiUp','entry1');assert.equal(journey.combat.monsters.length,0);
  arrive(journey,'gobiCenter','entry2');assert.equal(journey.combat.monsters[0].name,'魔军副将');arrive(journey,'gobiDown','entry2');assert.equal(journey.combat.monsters.length,4);arrive(journey,'gobiRight','entry3');assert.equal(journey.combat.monsters[0].name,'魔军主将');
  const old=journey.combat,oldQuest=journey.king;journey.combat.random=limit=>limit-1;journey.combat.kill(journey.combat.monsters[0]);assert(journey.king.claimable);assert(journey.firstQuest.swampActive);for(const region of GOBI_REGIONS)assert.equal(journey.gobiBattle[gobiFlag(region)],false);assert.equal(journey.combat.monsters.filter(monster=>monster.alive).length,3);
  const restore=roundtrip(journey);journey=restore.journey;assert.equal(restore.raw.mainTask8isComplete,true);assert.equal(restore.raw.mainTask9isDoing,true);assert.equal(restore.raw.map_oldCity,'树心城');assert.equal(restore.raw.map_nowMap,'戈壁战场右');assert.equal(journey.combat.monsters.filter(monster=>monster.alive).length,3);
  journey.reward.res=0;const merit=journey.inventory.exploit;assert(journey.claimKing());assert.equal(journey.reward.res,100000);assert.equal(journey.inventory.exploit,merit+1000);assert.equal(journey.claimKing(),false);assert(journey.answerHonor(true));assert.equal(journey.firstQuest.honor.number,0);journey.combat.random=limit=>limit-1;for(const monster of journey.combat.monsters)journey.combat.kill(monster);assert.equal(journey.firstQuest.honor.number,3);
  const ball=journey.reward.bag.findIndex(item=>item?.type==='超级经验球');assert(ball>=0);assert(journey.inventory.use(ball,journey.reward.bag[ball]));assert.equal(journey.inventory.consumables.expBallNum,1);
  const kills=journey.combatLedger.kills.怪物;old.kill(old.monsters[1]);assert.equal(journey.combatLedger.kills.怪物,kills);
  arrive(journey,'gobiCenter','entry4');assert.equal(journey.combat.monsters.length,0);arrive(journey,'gobiLeft','entry2');assert(journey.openGobiServices());assert(journey.gobiService('leave'));assert.equal(journey.map,'shuxinCity');assert.equal(journey.cityVisit.homeCity,'树心城');
  journey=roundtrip(journey).journey;assert.equal(journey.firstQuest.honor.number,3);arrive(journey,'gobiOutskirts','entry1');assert.equal(journey.gobiBattle.warningTicks,0);assert(journey.entries.find(entry=>entry.name==='entry3').visible);
  assert.equal(oldQuest.claim({x:0,y:0},()=>true),false);
 }
});

test('warning pauses, survives saving, cancels on leave; death and lucky return use field home',()=>{
 let journey=make();reach(journey);journey.paused=true;for(let index=0;index<90;index++)journey.step();assert.equal(journey.gobiBattle.warningTicks,75);journey.paused=false;journey.step();journey=roundtrip(journey).journey;assert.equal(journey.gobiBattle.warningTicks,74);arrive(journey,'shuxinCity','entry3');assert.equal(journey.gobiBattle.warningTicks,0);arrive(journey,'gobiOutskirts','entry1');for(let index=0;index<75;index++)journey.step();
 arrive(journey,'gobiCenter','entry1');journey.vitals.life=0;assert(journey.reviveCombat());assert.equal(journey.map,'gobiLeft');assert.equal(journey.x,390);assert.equal(journey.y,256);
 journey.reward.bag[0]=literalItem('幸运之门');assert(journey.inventory.use(0,journey.reward.bag[0]));assert.equal(journey.map,'luckyGate');journey=roundtrip(journey).journey;assert.equal(journey.entries[0].toMap,'gobiLeft');const unsupported=journey.progress();unsupported.cityVisit.homeCity='未知城';journey.restore(unsupported);assert.equal(journey.entries[0].toMap,undefined);assert.equal(journey.arrive('citySecond','backPoint','citySecond'),false);unsupported.cityVisit.homeCity='戈壁战场左';journey.restore(unsupported);arrive(journey,'gobiLeft','backPoint');
 journey.gobiBattle.oldCity='未知城';assert(journey.openGobiServices());assert.equal(journey.gobiService('leave'),false);assert.equal(journey.map,'gobiLeft');
});

test('full bag claims retain drops, honor decline and malformed states / legacy migration remain explicit',()=>{
 let journey=make();battle(journey);arrive(journey,'gobiCenter','entry1');arrive(journey,'gobiRight','entry2');journey.combat.random=limit=>limit-1;journey.combat.kill(journey.combat.monsters[0]);journey.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));assert(journey.claimKing());assert(journey.reward.drops.some(drop=>drop.item.type==='超级经验球'));assert(journey.answerHonor(false));assert.equal(journey.firstQuest.honor.isDoing,false);assert.equal(journey.answerHonor(true),false);
 const progress=journey.progress();for(const change of [p=>p.gobiBattle.rightRegion=1,p=>p.gobiBattle.warningTicks=1,p=>p.combat.monsters[1].life=4591,p=>p.combat.monsters.pop(),p=>p.combat.monsters[0].attackHeight=30,p=>p.combat.monsters[0].life=1,p=>p.combat.warningTarget='龙怪头目',p=>p.firstQuest.king.number=0,p=>p.firstQuest.honor.number=101]){const bad=structuredClone(progress);change(bad);assert.throws(()=>validateProgress(bad));}
 const old=make(),state=captureSave(old.progress()),extension=restorePreservedValue(state.extensions),raw=restorePreservedValue(state.source);delete extension.game.gobiBattle;delete extension.game.firstQuest.king;delete extension.game.firstQuest.honor;delete extension.game.firstQuest.swampActive;raw.map_oldCity='树心城';raw.mainTask8isDoing=true;raw.mainTask8isComplete=true;raw.mainTask9isDoing=true;raw.dailyTask11isDoing=true;raw.dailyTask11isComplete=false;raw.dailyTask11need_number=72;delete extension.game.firstQuest.kingActive;state.extensions=preserveValue(extension);state.source=preserveValue(raw);const promoted=savedProgress(decodeSave(encodeSave(state)));assert.equal(promoted.gobiBattle.oldCity,'树心城');assert.equal(promoted.firstQuest.king.isComplete,true);assert.equal(promoted.firstQuest.honor.number,72);assert.equal(promoted.firstQuest.swampActive,true);
});
