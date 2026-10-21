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
function city(journey){journey.firstQuest.king={number:1,isDoing:false,isComplete:true};for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['swampOutskirts','entry2'],['swampCity','entry1']])assert(journey.arrive(map,entry,map));}

function restore(journey){const saved=decodeSave(encodeSave(captureSave(journey.progress()))),next=make(journey.profession);next.restore(savedProgress(saved));return {journey:next,saved};}
function gate(journey){
 const index=journey.reward.bag.findIndex(item=>item?.type==='沼泽幻境');assert(index>=0);assert(journey.inventory.use(index,journey.reward.bag[index]));assert.equal(journey.map,'swampMirage');
 assert.equal(journey.entries[0].visible,false);assert.equal(journey.combat.spawnBoss(),false);
}

test('two professions city first gift, pharmacy expansion, complete mirage persistence, drops and correct home',()=>{
 for(const profession of ['战士','法师']){
  let journey=make(profession);city(journey);
  assert.equal(journey.cityVisit.homeCity,'沼泽');assert.equal(journey.cityVisit.swampMirageGranted,true);assert.equal(journey.pharmacy.openNumber,7);assert.equal(journey.petShop.openNumber,9);
  assert(journey.openShop('pharmacy'));journey.pharmacy.close();
  const giftCount=journey.reward.bag.filter(item=>item?.type==='沼泽幻境').length;
  assert(journey.arrive('swampOutskirts','entry3','swampOutskirts'));assert(journey.arrive('swampCity','entry1','swampCity'));
  assert.equal(journey.reward.bag.filter(item=>item?.type==='沼泽幻境').length,giftCount);
  gate(journey);journey.combat.random=()=>0;journey.property.owned=true;
  const resources=journey.reward.res;journey.combat.kill(journey.combat.monsters[0]);journey.combat.monsters[1].life-=123;
  journey=restore(journey).journey;assert.equal(journey.combat.monsters[1].life,66177);assert.equal(journey.combat.monsters[0].alive,false);
  assert.equal(journey.arrive('swampCity','backPoint','swampCity'),false);assert.equal(journey.reward.res,resources);
  journey.combat.random=()=>0;for(const monster of journey.combat.monsters)journey.combat.kill(monster);journey.step();
  assert.equal(journey.combatLedger.kills.幻影绿魔精,4);assert.equal(journey.firstQuest.number,0);assert.equal(journey.entries[0].visible,true);
  const potion=journey.reward.drops.find(drop=>drop.item.type==='奇异果');assert(potion);assert(pickUp(journey.reward,potion));
  const checkpoint=restore(journey);journey=checkpoint.journey;const raw=restorePreservedValue(checkpoint.saved.source);
  assert.equal(raw.map_homeCity,'沼泽');assert.equal(raw.map_沼泽获得幻境,true);assert.equal(raw.map_nowMap,'沼泽幻境');
  const old=journey.combat,dropCount=journey.reward.drops.length;for(const monster of old.monsters)old.kill(monster);assert.equal(journey.reward.drops.length,dropCount);
  const exit=journey.entries[0];journey.x=exit.x;journey.y=exit.y;assert(journey.activate('entry6'));assert.equal(journey.map,'swampCity');assert.equal(journey.x,300.4);assert.equal(journey.y,352.65);assert.equal(old.session.active,false);
  assert.equal(restore(journey).journey.cityVisit.homeCity,'沼泽');
 }
});

test('shared random intrusion, read reset, full bag grant and home-dependent lucky exit and death',()=>{
 const journey=make();city(journey);journey.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));journey.cityVisit.swampMirageGranted=false;
 assert(journey.arrive('swampOutskirts','entry3','swampOutskirts'));journey.mirageRandom=()=>0;journey.mirageElapsed=300001;assert(journey.arrive('swampCity','entry1','swampCity'));
 assert.equal(journey.map,'swampMirage');assert.equal(journey.mirageElapsed,0);assert.equal(journey.reward.drops[0].item.type,'沼泽幻境');assert.equal(pickUp(journey.reward,journey.reward.drops[0]),false);
 journey.reward.bag[0]=null;assert(pickUp(journey.reward,journey.reward.drops[0]));const next=restore(journey).journey;
 assert.equal(next.mirageElapsed,0);next.paused=true;next.advance(400000);assert.equal(next.mirageElapsed,0);next.paused=false;next.vitals.life=0;assert(next.reviveCombat());assert.equal(next.map,'swampCity');assert.equal(next.vitals.life,next.vitals.maxLife);
 next.reward.bag[0]=literalItem('幸运之门');assert(next.inventory.use(0,next.reward.bag[0]));assert.equal(next.entries[0].toMap,'swampCity');next.x=next.entries[0].x;next.y=next.entries[0].y;assert(next.activate('entry1'));assert.equal(next.map,'swampCity');
 assert(next.arrive('swampOutskirts','entry3','swampOutskirts'));assert(next.arrive('citySecond','entry2','citySecond'));assert.equal(next.cityVisit.homeCity,'卡萨诺城二');
});

test('malformed new-region saves are rejected atomically and preserved raw grant migrates without gifting',()=>{
 const journey=make();city(journey);gate(journey);const progress=journey.progress();
 for(const mutate of [value=>delete value.combat,value=>value.combat.monsters.pop(),value=>value.combat.monsters[0].life=66301,value=>value.combat.banditWave=1,value=>value.combat.warningTicks=1,value=>value.combat.level=5,value=>value.combat.monsters[0].attackLength=160,value=>value.cityVisit.swampMirageGranted='true']){
  const invalid=structuredClone(progress);mutate(invalid);assert.throws(()=>validateProgress(invalid));
 }
 const saved=captureSave(progress),extension=restorePreservedValue(saved.extensions);delete extension.game.cityVisit.swampMirageGranted;saved.extensions=preserveValue(extension);
 assert.equal(savedProgress(saved).cityVisit.swampMirageGranted,true);
});

test('source unrecognized moon box branch yields no item or factory RNG instead of throwing or inventing a box',()=>{
 const journey=make();city(journey);gate(journey);const calls=[];journey.combat.random=limit=>{calls.push(limit);return limit===10?4:0;};
 const before=journey.reward.drops.length;journey.combat.kill(journey.combat.monsters[0]);
 assert.equal(journey.reward.drops.length,before);assert(!calls.includes(150));assert(!calls.includes(50));assert.equal(journey.combatLedger.kills.幻影绿魔精,1);
});

test('Swamp home survives oldCity battle, lucky gate, pharmacy purchase and detached callbacks',()=>{
 const journey=make();city(journey);const pharmacy=journey.pharmacy,petShop=journey.petShop.openNumber;
 assert.equal(pharmacy.goods.length,7);assert.equal(pharmacy.openNumber,7);
 journey.swampBattle.oldCity='沼泽';journey.cityVisit.homeCity='沼泽战场左';
 const progress=journey.progress();progress.map='swampLeft';progress.x=280;progress.y=300;progress.combat={boss:false,level:1,warningTicks:0,monsters:[]};
 journey.restore(progress);assert(journey.openGobiServices());assert(journey.gobiService('leave'));assert.equal(journey.map,'swampCity');assert.equal(journey.cityVisit.homeCity,'沼泽');assert.equal(journey.petShop.openNumber,petShop);
 assert.equal(pharmacy.interact(),false);
 const copy=restore(journey);assert.equal(restorePreservedValue(copy.saved.source).map_沼泽获得幻境,true);
});

test('bravery purchase and learning uses existing saves, bounded cap, full bag and detached ownership',()=>{
 for(const profession of ['战士','法师']){let j=make(profession);for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['cityThird','entry1'],['shuxinOutskirts','entry1'],['shuxinRoad','entry1'],['shuxinCity','entry1']])assert(j.arrive(map,entry,map));const shop=j.braveryShop;j.reward.bag.fill(null);j.reward.ms=5000;assert(j.openShop('bravery'));assert(shop.show());assert(shop.select(0));assert(shop.buy());assert.equal(j.reward.ms,0);const book=j.reward.bag[0];assert(j.inventory.use(0,book));assert.equal(j.inventory.bravery,1);j.inventory.bravery=50;j.reward.bag[0]=book;assert.equal(j.inventory.use(0,book),false);assert.equal(j.reward.bag[0],book);assert(shop.select(0));assert.equal(shop.buy(),false);j.reward.ms=5000;j.reward.bag=Array(40).fill(book);assert.equal(shop.buy(),false);assert.equal(j.reward.ms,5000);const saved=restore(j);assert.equal(saved.journey.inventory.bravery,50);j.restore(j.progress());assert.equal(shop.interact(),false);const current=j.braveryShop;j.openShop('bravery');current.show();current.select(0);j.arrive('shuxinRoad','entry2','shuxinRoad');assert.equal(current.buy(),false);}
});
