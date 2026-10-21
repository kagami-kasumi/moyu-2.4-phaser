import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Journey} from '../src/domain/journey.ts';
import {Actor} from '../src/domain/actor.ts';
import {captureSave,savedProgress} from '../src/application/save-game.ts';
import {validateProgress} from '../src/application/save-codec.ts';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';

const json=path=>JSON.parse(fs.readFileSync(path));
const maps=json('public/assets/first-slice/manifest.json');
const actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(profession='战士'){const journey=new Journey(maps,new Actor(actors[profession]),actors);journey.start('强盗边界',profession);return journey;}
function travel(journey){for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['cityThird','entry1'],['shuxinOutskirts','entry1'],['shuxinRoad','entry1']])assert(journey.arrive(map,entry,map),map);}
function restore(journey){const saved=captureSave(journey.progress()),next=make(journey.profession);next.restore(savedProgress(saved));return next;}

test('unaccepted road never starts combat; accepted five-second warning pauses, saves and cancels on exit',()=>{
 for(const profession of ['战士','法师']){
  let journey=make(profession);travel(journey);journey.advance(10000);assert.equal(journey.map,'shuxinRoad');assert.equal(journey.combat,undefined);assert(journey.entries.find(entry=>entry.name==='entry2').visible);
  journey=make(profession);journey.firstQuest.nextActive=true;travel(journey);assert.equal(journey.banditWarning,75);assert.equal(journey.entries.find(entry=>entry.name==='entry2').visible,false);
  journey.advance(2000);assert.equal(journey.banditWarning,45);journey.paused=true;journey.advance(20000);assert.equal(journey.banditWarning,45);journey.paused=false;
  journey=restore(journey);assert.equal(journey.banditWarning,45);journey.advance(3000);assert.equal(journey.map,'banditField');assert.equal(journey.combat.banditWave,1);assert.equal(journey.combat.monsters.length,3);
  journey=make(profession);journey.firstQuest.nextActive=true;travel(journey);assert(journey.arrive('shuxinOutskirts','entry4','shuxinOutskirts'));journey.advance(10000);assert.equal(journey.map,'shuxinOutskirts');assert.equal(journey.banditWarning,0);
 }
});
test('controlled three-wave deaths, partial saves, full bag reward, next quest and stale session',()=>{
 for(const profession of ['战士','法师']){
  let journey=make(profession);journey.firstQuest.nextActive=true;travel(journey);journey.advance(5000);
  for(const wave of [1,2,3]){
   assert.equal(journey.combat.banditWave,wave);const combat=journey.combat;combat.monsters[0].life-=7;journey=restore(journey);assert.equal(journey.combat.monsters[0].life,combat.monsters[0].life);
   journey.combat.monsters.forEach(monster=>journey.combat.kill(monster));journey=restore(journey);
   if(wave<3){assert.equal(journey.combat.warningTicks,75);journey.paused=true;journey.advance(5000);assert.equal(journey.combat.warningTicks,75);journey.paused=false;journey.advance(5000);}
  }
  assert(journey.bandits.claimable);assert.equal(journey.reward.credit,500);assert.equal(journey.firstQuest.kingActive,true);const combat=journey.combat;
  journey.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));const merit=journey.inventory.exploit,military=journey.inventory.militaryExploit;
  assert(journey.claimBandits());assert.equal(journey.inventory.exploit,merit+500);assert.equal(journey.inventory.militaryExploit,military+500);assert.equal(journey.reward.drops.at(-1).item.type,'英雄令');assert.equal(journey.claimBandits(),false);
  const saved=captureSave(journey.progress()),raw=restorePreservedValue(saved.source);assert.equal(raw.mainTask7isDoing,false);assert.equal(raw.mainTask7isComplete,true);assert.equal(raw.mainTask8isDoing,true);assert.equal(raw.map_nowMap,'树平');
  journey=restore(journey);assert.equal(journey.claimBandits(),false);assert(journey.arrive('shuxinRoad','entry1','shuxinRoad'));assert.equal(journey.banditWarning,0);assert(journey.entries.find(entry=>entry.name==='entry2').visible);
  journey.advance(6000);assert.equal(journey.map,'shuxinRoad');combat.close();assert.equal(combat.spawnBoss(),false);
  assert(journey.arrive('shuxinOutskirts','entry4','shuxinOutskirts'));assert(journey.arrive('cityThird','entry2','cityThird'));journey=restore(journey);assert.equal(journey.map,'cityThird');
 }
});
test('old nextActive and raw completed flags promote without granting rewards; malformed wave rejected',()=>{
 for(const completed of [false,true]){
  const journey=make();journey.firstQuest.nextActive=true;const saved=captureSave(journey.progress()),raw=restorePreservedValue(saved.source);raw.mainTask7isComplete=completed;saved.source=preserveValue(raw);
  const progress=savedProgress(saved);assert.equal(progress.firstQuest.bandits.number,completed?1:0);assert.equal(progress.firstQuest.bandits.isDoing,true);assert.equal(progress.inventory.exploit,0);
 }
 const journey=make();journey.firstQuest.nextActive=true;travel(journey);journey.advance(5000);const progress=journey.progress();
 for(const combat of [{...progress.combat,banditWave:4},{...progress.combat,level:21},{...progress.combat,warningTicks:75,warningTarget:'第二批强盗'},{...progress.combat,monsters:[]}])assert.throws(()=>validateProgress({...progress,combat}));
 assert.throws(()=>validateProgress({...progress,banditWarning:1}));
});
