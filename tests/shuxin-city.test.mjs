import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';
import {captureSave,savedProgress} from '../src/application/save-game.ts';
import {encodeSave,decodeSave,validateProgress} from '../src/application/save-codec.ts';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
import {literalItem} from '../src/content/registry.ts';
import {pickUp} from '../src/domain/ground-items.ts';

const json=path=>JSON.parse(fs.readFileSync(path)),maps=json('public/assets/first-slice/manifest.json');
const actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(profession='战士',random=()=>.999){const journey=new Journey(maps,new Actor(actors[profession]),actors,random);journey.start('树心旅程',profession);return journey;}
function city(journey){
 for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['cityThird','entry1'],['shuxinOutskirts','entry1'],['shuxinRoad','entry1'],['shuxinCity','entry1']])assert(journey.arrive(map,entry,map));
}
function restore(journey){const saved=decodeSave(encodeSave(captureSave(journey.progress()))),next=make(journey.profession);next.restore(savedProgress(saved));return {journey:next,saved};}
function gate(journey){
 const index=journey.reward.bag.findIndex(item=>item?.type==='树心幻境');assert(index>=0);assert(journey.inventory.use(index,journey.reward.bag[index]));assert.equal(journey.map,'shuxinMirage');
 assert.equal(journey.entries[0].visible,false);assert.equal(journey.combat.spawnBoss(),false);
}

test('two professions city first gift, pharmacy expansion, complete mirage persistence, drops and correct home',()=>{
 for(const profession of ['战士','法师']){
  let journey=make(profession);city(journey);
  assert.equal(journey.cityVisit.homeCity,'树心城');assert.equal(journey.cityVisit.shuxinMirageGranted,true);assert.equal(journey.pharmacy.openNumber,4);
  assert(journey.openShop('pharmacy'));journey.pharmacy.close();
  const giftCount=journey.reward.bag.filter(item=>item?.type==='树心幻境').length;
  assert(journey.arrive('shuxinRoad','entry2','shuxinRoad'));assert(journey.arrive('shuxinCity','entry1','shuxinCity'));
  assert.equal(journey.reward.bag.filter(item=>item?.type==='树心幻境').length,giftCount);
  gate(journey);journey.combat.random=()=>0;journey.property.owned=true;
  const resources=journey.reward.res;journey.combat.kill(journey.combat.monsters[0]);journey.combat.monsters[1].life-=123;
  journey=restore(journey).journey;assert.equal(journey.combat.monsters[1].life,25377);assert.equal(journey.combat.monsters[0].alive,false);
  assert.equal(journey.arrive('shuxinCity','backPoint','shuxinCity'),false);assert.equal(journey.reward.res,resources);
  journey.combat.random=()=>0;for(const monster of journey.combat.monsters)journey.combat.kill(monster);journey.step();
  assert.equal(journey.combatLedger.kills.幻影冰妖剑士,4);assert.equal(journey.firstQuest.number,0);assert.equal(journey.entries[0].visible,true);
  const potion=journey.reward.drops.find(drop=>drop.item.type==='电浆药水');assert(potion);assert(pickUp(journey.reward,potion));
  const checkpoint=restore(journey);journey=checkpoint.journey;const raw=restorePreservedValue(checkpoint.saved.source);
  assert.equal(raw.map_homeCity,'树心城');assert.equal(raw.map_树心城获得幻境,true);assert.equal(raw.map_nowMap,'树心幻境');
  const old=journey.combat,dropCount=journey.reward.drops.length;for(const monster of old.monsters)old.kill(monster);assert.equal(journey.reward.drops.length,dropCount);
  const exit=journey.entries[0];journey.x=exit.x;journey.y=exit.y;assert(journey.activate('entry6'));assert.equal(journey.map,'shuxinCity');assert.equal(journey.x,300.4);assert.equal(journey.y,352.65);assert.equal(old.session.active,false);
  assert.equal(restore(journey).journey.cityVisit.homeCity,'树心城');
 }
});

test('shared random intrusion, read reset, full bag grant and home-dependent lucky exit and death',()=>{
 const journey=make();city(journey);journey.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));journey.cityVisit.shuxinMirageGranted=false;
 assert(journey.arrive('shuxinRoad','entry2','shuxinRoad'));journey.mirageRandom=()=>0;journey.mirageElapsed=300001;assert(journey.arrive('shuxinCity','entry1','shuxinCity'));
 assert.equal(journey.map,'shuxinMirage');assert.equal(journey.mirageElapsed,0);assert.equal(journey.reward.drops[0].item.type,'树心幻境');assert.equal(pickUp(journey.reward,journey.reward.drops[0]),false);
 journey.reward.bag[0]=null;assert(pickUp(journey.reward,journey.reward.drops[0]));const next=restore(journey).journey;
 assert.equal(next.mirageElapsed,0);next.paused=true;next.advance(400000);assert.equal(next.mirageElapsed,0);next.paused=false;next.vitals.life=0;assert(next.reviveCombat());assert.equal(next.map,'shuxinCity');assert.equal(next.vitals.life,next.vitals.maxLife);
 next.reward.bag[0]=literalItem('幸运之门');assert(next.inventory.use(0,next.reward.bag[0]));assert.equal(next.entries[0].toMap,'shuxinCity');next.x=next.entries[0].x;next.y=next.entries[0].y;assert(next.activate('entry1'));assert.equal(next.map,'shuxinCity');
 assert(next.arrive('shuxinRoad','entry2','shuxinRoad'));assert(next.arrive('shuxinOutskirts','entry4','shuxinOutskirts'));assert(next.arrive('cityThird','entry2','cityThird'));assert.equal(next.cityVisit.homeCity,'卡萨诺城二');
});

test('malformed new-region saves are rejected atomically and preserved raw grant migrates without gifting',()=>{
 const journey=make();city(journey);gate(journey);const progress=journey.progress();
 for(const mutate of [value=>delete value.combat,value=>value.combat.monsters.pop(),value=>value.combat.monsters[0].life=25501,value=>value.combat.banditWave=1,value=>value.combat.warningTicks=1,value=>value.combat.level=5,value=>value.combat.monsters[0].attackLength=160,value=>value.cityVisit.shuxinMirageGranted='true']){
  const invalid=structuredClone(progress);mutate(invalid);assert.throws(()=>validateProgress(invalid));
 }
 const saved=captureSave(progress),extension=restorePreservedValue(saved.extensions);delete extension.game.cityVisit.shuxinMirageGranted;saved.extensions=preserveValue(extension);
 assert.equal(savedProgress(saved).cityVisit.shuxinMirageGranted,true);
});

test('source unrecognized moon box branch yields no item or factory RNG instead of throwing or inventing a box',()=>{
 const journey=make();city(journey);gate(journey);const calls=[];journey.combat.random=limit=>{calls.push(limit);return limit===6?4:0;};
 const before=journey.reward.drops.length;journey.combat.kill(journey.combat.monsters[0]);
 assert.equal(journey.reward.drops.length,before);assert(!calls.includes(150));assert(!calls.includes(50));assert.equal(journey.combatLedger.kills.幻影冰妖剑士,1);
});
