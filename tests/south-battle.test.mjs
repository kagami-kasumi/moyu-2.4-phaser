import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';
import {captureSave,savedProgress} from '../src/application/save-game.ts';
import {encodeSave,decodeSave,validateProgress} from '../src/application/save-codec.ts';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
import {literalItem} from '../src/content/registry.ts';
import {SOUTH_REGIONS,southFlag} from '../src/domain/south-battle.ts';

const json=path=>JSON.parse(fs.readFileSync(path)),maps=json('public/assets/first-slice/manifest.json');
const actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(profession='战士'){const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('南城旅程',profession);return journey;}
function reach(journey){for(const [map,entry]of [['city','entry1'],['citySecond','entry1']])assert(journey.arrive(map,entry,map));journey.firstQuest.king={number:1,isDoing:false,isComplete:true};assert(journey.arrive('swampOutskirts','entry2','swampOutskirts'));assert(journey.arrive('swampCity','entry1','swampCity'));journey.firstQuest.southActive=true;assert(journey.arrive('southOutskirts','entry2','southOutskirts'));}
function battle(journey){reach(journey);for(let index=0;index<75;index++)journey.step();assert.equal(journey.map,'southLeft');assert.equal(journey.combat.monsters.length,0);}
function roundtrip(journey){const state=decodeSave(encodeSave(captureSave(journey.progress())));journey.restore(savedProgress(state));return {journey,raw:restorePreservedValue(state.source)};}
function arrive(journey,map,entry){assert(journey.arrive(map,entry,map));}

test('both professions complete five-field travel, boss flags, partial restore, quest rewards and correct home',()=>{
 for(const profession of ['战士','法师']){
  let journey=make(profession);battle(journey);assert.equal(journey.cityVisit.homeCity,'南城战场左');assert.equal(journey.southBattle.oldCity,'沼泽');
  assert(journey.openGobiServices());assert(journey.gobiService('medicine'));assert.equal(journey.pharmacy.openNumber,7);journey.pharmacy.close();
  journey.vitals.life=1;journey.vitals.mp=0;assert(journey.openGobiServices());assert(journey.gobiService('revive'));assert.equal(journey.vitals.life,journey.vitals.maxLife);
  arrive(journey,'southUp','entry1');assert.equal(journey.combat.monsters.length,4);journey.combat.random=limit=>limit-1;journey.combat.monsters[1].life-=123;journey.combat.kill(journey.combat.monsters[0]);assert.equal(journey.southBattle.upRegion,false);
  journey=roundtrip(journey).journey;assert.equal(journey.combat.monsters[1].life,9057);assert.equal(journey.combat.monsters[0].alive,false);
  arrive(journey,'southLeft','entry1');arrive(journey,'southUp','entry1');assert.equal(journey.combat.monsters.length,0);
  arrive(journey,'southCenter','entry2');assert.equal(journey.combat.monsters[0].name,'魔军副将');arrive(journey,'southDown','entry2');assert.equal(journey.combat.monsters.length,4);arrive(journey,'southRight','entry3');assert.equal(journey.combat.monsters[0].name,'魔军主将');
  const old=journey.combat,oldQuest=journey.south;journey.combat.random=limit=>limit-1;journey.combat.kill(journey.combat.monsters[0]);assert(journey.south.claimable);assert(journey.firstQuest.counterattackActive);for(const region of SOUTH_REGIONS)assert.equal(journey.southBattle[southFlag(region)],false);assert.equal(journey.combat.monsters.filter(monster=>monster.alive).length,3);
  const restore=roundtrip(journey);journey=restore.journey;assert.equal(restore.raw.mainTask10isComplete,true);assert.equal(restore.raw.mainTask11isDoing,true);assert.equal(restore.raw.map_oldCity,'沼泽');assert.equal(restore.raw.map_nowMap,'南城战场右');assert.equal(journey.combat.monsters.filter(monster=>monster.alive).length,3);
  journey.reward.res=0;const merit=journey.inventory.exploit;assert(journey.claimSouth());assert.equal(journey.reward.res,200000);assert.equal(journey.inventory.exploit,merit+1000);assert.equal(journey.claimSouth(),false);journey.firstQuest.honor={number:0,isDoing:true,isComplete:false};journey.combat.random=limit=>limit-1;for(const monster of journey.combat.monsters)journey.combat.kill(monster);assert.equal(journey.firstQuest.honor.number,3);
  const ball=journey.reward.bag.findIndex(item=>item?.type==='超级经验球');assert(ball>=0);assert(journey.inventory.use(ball,journey.reward.bag[ball]));assert.equal(journey.inventory.consumables.expBallNum,1);
  const kills=journey.combatLedger.kills.怪物;old.kill(old.monsters[1]);assert.equal(journey.combatLedger.kills.怪物,kills);
  arrive(journey,'southCenter','entry4');assert.equal(journey.combat.monsters.length,0);arrive(journey,'southLeft','entry2');assert(journey.openGobiServices());assert(journey.gobiService('leave'));assert.equal(journey.map,'swampCity');assert.equal(journey.cityVisit.homeCity,'沼泽');
  const returned=roundtrip(journey);journey=returned.journey;assert.equal(returned.raw.map_oldCity,'沼泽');assert.equal(journey.firstQuest.honor.number,3);arrive(journey,'southOutskirts','entry2');assert.equal(journey.southBattle.warningTicks,0);assert(journey.entries.find(entry=>entry.name==='entry3').visible);
  assert.equal(oldQuest.claim({x:0,y:0},()=>true),false);
 }
});

test('warning pauses, survives saving, cancels on leave; death and lucky return use field home',()=>{
 let journey=make();reach(journey);journey.paused=true;for(let index=0;index<90;index++)journey.step();assert.equal(journey.southBattle.warningTicks,75);journey.paused=false;journey.step();journey=roundtrip(journey).journey;assert.equal(journey.southBattle.warningTicks,74);arrive(journey,'swampCity','entry2');assert.equal(journey.southBattle.warningTicks,0);arrive(journey,'southOutskirts','entry2');for(let index=0;index<75;index++)journey.step();
 arrive(journey,'southCenter','entry1');journey.vitals.life=0;assert(journey.reviveCombat());assert.equal(journey.map,'southLeft');assert.equal(journey.x,396.4);assert.equal(journey.y,256);
 journey.reward.bag[0]=literalItem('幸运之门');assert(journey.inventory.use(0,journey.reward.bag[0]));assert.equal(journey.map,'luckyGate');journey=roundtrip(journey).journey;assert.equal(journey.entries[0].toMap,'southLeft');const unsupported=journey.progress();unsupported.cityVisit.homeCity='未知城';journey.restore(unsupported);assert.equal(journey.entries[0].toMap,undefined);assert.equal(journey.arrive('citySecond','backPoint','citySecond'),false);unsupported.cityVisit.homeCity='南城战场左';journey.restore(unsupported);arrive(journey,'southLeft','backPoint');
 journey.southBattle.oldCity='未知城';assert(journey.openGobiServices());assert.equal(journey.gobiService('leave'),false);assert.equal(journey.map,'southLeft');
});

test('full bag claims retain drops and malformed states are rejected',()=>{
 let journey=make();battle(journey);arrive(journey,'southCenter','entry1');arrive(journey,'southRight','entry2');journey.combat.random=limit=>limit-1;journey.combat.kill(journey.combat.monsters[0]);journey.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));assert(journey.claimSouth());assert(journey.reward.drops.some(drop=>drop.item.type==='超级经验球'));
 const progress=journey.progress();for(const change of [p=>p.southBattle.rightRegion=1,p=>p.southBattle.warningTicks=1,p=>p.combat.monsters[1].life=9181,p=>p.combat.monsters.pop(),p=>p.combat.monsters[0].attackHeight=30,p=>p.combat.monsters[0].life=1,p=>p.combat.warningTarget='龙怪头目',p=>p.firstQuest.south.number=0]){const bad=structuredClone(progress);change(bad);assert.throws(()=>validateProgress(bad));}
});


test('king order gate, legacy mainTask10/11 promotion and opaque source preservation',()=>{
 const j=make();arrive(j,'city','entry1');arrive(j,'citySecond','entry1');const before=j.progress();assert.equal(j.arrive('swampOutskirts','entry2','swampOutskirts'),false);assert.equal(j.map,before.map);assert.equal(j.x,before.x);
 const state=captureSave(j.progress()),extension=restorePreservedValue(state.extensions),raw=restorePreservedValue(state.source);delete extension.game.southBattle;delete extension.game.firstQuest.south;delete extension.game.firstQuest.southActive;delete extension.game.firstQuest.counterattackActive;
 Object.assign(raw,{map_oldCity:'戈壁',mainTask10isDoing:true,mainTask10isComplete:true,mainTask11isDoing:true,futureSouth:{untouched:19}});state.extensions=preserveValue(extension);state.source=preserveValue(raw);
 const decoded=decodeSave(encodeSave(state)),promoted=savedProgress(decoded);assert.equal(promoted.southBattle.oldCity,'戈壁');assert.deepEqual(promoted.firstQuest.south,{number:1,isDoing:true,isComplete:true});assert.equal(promoted.firstQuest.counterattackActive,true);j.restore(promoted);const again=captureSave(j.progress(),decoded);assert.deepEqual(restorePreservedValue(again.source).futureSouth,{untouched:19});
});



test('all three legions share oldCity through transitions, raw save and restore',()=>{
 const j=make();battle(j);
 for(const [field,home]of [['southLeft','沼泽'],['swampLeft','树心城'],['gobiLeft','卡萨诺城二']]){
  // Controlled cross-legion transition isolates the shared source home assignment.
  j.cityVisit.homeCity=home;j.transition(field,'backPoint');
  for(const state of [j.southBattle,j.swampBattle,j.gobiBattle])assert.equal(state.oldCity,home);
  assert.equal(roundtrip(j).raw.map_oldCity,home);
  assert(j.openGobiServices());assert(j.gobiService('leave'));assert.equal(j.cityVisit.homeCity,home);
 }
});

test('controlled left region spawn is preserved; repeated death, paused claim and stale session do not duplicate',()=>{
 const j=make();battle(j);j.southBattle.leftRegion=true;
 arrive(j,'southCenter','entry1');arrive(j,'southLeft','entry2');assert.equal(j.combat.monsters.length,4);
 j.combat.random=n=>n-1;const old=j.combat;j.combat.kill(j.combat.monsters[0]);const kills=j.combatLedger.kills.怪物;j.combat.kill(j.combat.monsters[0]);assert.equal(j.combatLedger.kills.怪物,kills);
 j.vitals.life=0;assert(j.reviveCombat());assert.equal(j.reviveCombat(),false);old.kill(old.monsters[1]);assert.equal(j.combatLedger.kills.怪物,kills);
 j.firstQuest.south={number:1,isDoing:true,isComplete:true};j.paused=true;assert.equal(j.claimSouth(),false);j.paused=false;assert(j.claimSouth());assert.equal(j.claimSouth(),false);
});
