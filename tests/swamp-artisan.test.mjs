import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';import {ARTISAN_RECIPES} from '../src/domain/swamp-artisan.ts';
import {rewardEquipment} from '../src/domain/npc-reward.ts';import {literalItem} from '../src/content/registry.ts';import {refreshEquipmentAttributes} from '../src/domain/equipment-attributes.ts';import {pickUp} from '../src/domain/ground-items.ts';
import {captureSave} from '../src/application/save-game.ts';import {encodeSave,decodeSave,savedProgress} from '../src/application/save-codec.ts';
const json=p=>JSON.parse(fs.readFileSync(p)),maps=json('public/assets/first-slice/manifest.json'),actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(career='战士'){const j=new Journey(maps,new Actor(actors[career]),actors);j.start('合成',career);j.firstQuest.king={isDoing:false,isComplete:true,number:1};for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['swampOutskirts','entry2'],['swampCity','entry1']])assert(j.arrive(map,entry,map));j.vitals.level=100;j.reward.bag.fill(null);return j;}
function supply(j,recipe,count){for(const material of [recipe.primary,...recipe.checks])j.reward.bag[j.reward.bag.findIndex(x=>!x)]={...literalItem(material.name),number:count??material.count};j.reward.credit=10;}
test('every genuine artisan output is consumed by equipment systems and survives codec and equip',()=>{
 for(const career of ['战士','法师'])for(const recipe of ARTISAN_RECIPES){const j=make(career),s=j.swampArtisan;supply(j,recipe);s.interact();assert(s.craft(recipe.cmd));const product=j.reward.bag.find(item=>item?.name===recipe.result);assert(product);s.close();
  const seed={...rewardEquipment(career)[0],levels:1,mhdj:0,number:0,grade:recipe.result==='灵魂王'?3:4};refreshEquipmentAttributes(seed);const sockets=j.sockets;sockets.show();sockets.item=seed;const index=j.reward.bag.indexOf(product);assert(sockets.select(index,product));
  if(recipe.result==='魔魂之心'){assert(sockets.forgeMagic());assert.equal(sockets.item.mhdj,1);}
  else if(recipe.result==='幻魔之心'){assert(sockets.forgeLevel());assert.equal(sockets.item.levels,15);}
  else if(recipe.result==='灵魂王'){assert(sockets.forgeReforge());assert.equal(sockets.item.grade,4);}
  else{const before=['wind','fire','water','soil'].map(k=>sockets.item[k]);assert(sockets.forgeElement());const change=['wind','fire','water','soil'].reduce((n,k,i)=>n+Number(sockets.item[k])-Number(before[i]),0);assert.equal(change,recipe.result==='小元素石'?1:4);}
  assert.equal(sockets.stone,null);const expected=structuredClone(sockets.item);assert(sockets.take('item'));sockets.close();const eq=j.reward.bag.find(item=>item?.type===seed.type);assert(j.inventory.use(j.reward.bag.indexOf(eq),eq));
  const saved=savedProgress(decodeSave(encodeSave(captureSave(j.progress()))));j.restore(saved);assert.deepEqual(j.inventory.equipment[seed.type],expected);assert.equal(s.craft(recipe.cmd),false);
 }
});
test('full bags consume stack quantities then drop a recoverable output; failure is atomic and ownership closes',()=>{
 const j=make(),s=j.swampArtisan,r=j.reward;r.bag=Array.from({length:40},()=>literalItem('英雄令'));r.bag[0]={...literalItem('灵魂晶石'),number:99};r.bag[1]={...literalItem('魔魂晶石'),number:99};s.interact();const revision=s.revision;assert(s.craft(10101));assert.equal(s.craft(10101,revision),false);assert.equal(r.bag[0].number,97);assert.equal(r.bag[1].number,94);assert.equal(r.drops[0].item.name,'魔魂之心');assert.equal(pickUp(r,r.drops[0]),false);r.bag[2]=null;assert(pickUp(r,r.drops[0]));
 const snapshot=JSON.stringify(r.bag);r.credit=0;assert.equal(s.craft(10103),false);assert.equal(JSON.stringify(r.bag),snapshot);j.vitals.level=99;assert.equal(s.craft(10104),false);assert.equal(JSON.stringify(r.bag),snapshot);
 j.vitals.level=100;j.paused=true;assert.equal(s.craft(10101),false);j.paused=false;j.vitals.life=0;assert.equal(s.craft(10101),false);j.vitals.life=100;const old=s.revision;s.close();assert.equal(s.craft(10101,old),false);s.interact();j.arrive('swampOutskirts','entry3','swampOutskirts');assert.equal(s.craft(10101),false);j.start('新角色');assert.equal(s.interact(),false);
});
