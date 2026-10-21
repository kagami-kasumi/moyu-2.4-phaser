import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {SouthPetMerchant,SOUTH_PET_CARDS} from '../src/domain/south-pet-merchant.ts';
import {NpcReward} from '../src/domain/npc-reward.ts';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';
import {captureSave} from '../src/application/save-game.ts';import {encodeSave,decodeSave,savedProgress} from '../src/application/save-codec.ts';
const json=p=>JSON.parse(fs.readFileSync(p)),fixture=json('docs/reverse-engineering/south-pet-merchant/source-fixture.json');
test('frozen original menu, price, spend and item factory match every purchase for both careers',()=>{
 for(const file of fixture.provenance)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex'),file.sha256);
 for(const career of ['战士','法师'])for(let index=0;index<5;index++)for(const balance of [0,4999,5000,5999,6000,6499,6500,6999,7000,100000])for(const full of [false,true]){
  const emitted=[],events=[],parent={map:{goods:{throwGoods(x,y,item){emitted.push(JSON.parse(JSON.stringify(item)));}}}};
  parent.backPack={setThing(item){emitted.push(JSON.parse(JSON.stringify(item)));return true;}};parent.createThing=vm.runInNewContext('(function(tThing,isDrop,fX,fY)'+functionRange(fixture.sources.factory,'this.createThing =').text+')').bind(parent);
  const role={myName:'购买',ms:balance,spendMs(cost){events.push(cost);if(this.ms<cost)return false;this.ms-=cost;return true;}};
  const context=vm.createContext({_parent:{role,_parent:parent},myID:{cmd:10300},_global:{sysMsg:{addMsg:message=>events.push(message)}}});
  const execute=vm.runInContext('(function(cmd){switch(cmd){'+fixture.sources.commands+'}})',context);execute(10300);assert.equal(context.answer.length,6);execute(10301+index);
  const r=new NpcReward('购买',()=>0,career,undefined,undefined,false);r.ms=balance;r.bag=Array.from({length:40},()=>full?{type:'英雄令',number:99}:null);
  const service=new SouthPetMerchant(r,()=>true,()=>({x:100,y:200}),()=>false);service.interact();const rev=service.revision,ok=service.buy(index,rev);
  assert.equal(r.ms,role.ms);assert.equal(ok,emitted.length===1);assert.equal(service.buy(index,rev),false);
  if(ok){const actual=full?r.drops[0].item:r.bag[0];for(const [key,value]of Object.entries(actual))assert.equal(value,emitted[0][key]??(key==='number'?0:undefined),key);assert.equal(service.feedback,events[1]);if(full)assert.deepEqual({x:r.drops[0].x,y:r.drops[0].y},{x:100,y:200});}
  else{assert.equal(service.feedback,context.words);assert.equal(service.failed,true);assert.equal(service.buy(index),false);}
 }
});
test('all five purchased cards hatch, full pet roster retries, save/restore invalidates old service and preserves shop2',()=>{
 const actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')},maps=json('public/assets/first-slice/manifest.json');
 for(const career of ['战士','法师']){
  const j=new Journey(maps,new Actor(actors[career]),actors);j.start('购买',career);j.map='southSecond';j.x=300.4;j.y=352.65;j.cityVisit={homeCity:'南城一',mirageGranted:false,gobiPetShopOpenNumber:5};j.reward.ms=32000;j.reward.bag.fill(null);const shop=j.southPetMerchant,oldShop=j.petShop.openNumber;
  shop.interact();for(let index=0;index<5;index++)assert(shop.buy(index));assert.equal(j.reward.ms,1000);
  const original=j.reward.pets[0];j.reward.pets=Array.from({length:40},()=>structuredClone(original));assert.equal(j.inventory.use(0,j.reward.bag[0]),false);assert.equal(j.reward.bag[0].type,SOUTH_PET_CARDS[0].type);j.reward.pets=[];j.petProgression.slots=[null,null,null];
  for(let index=0;index<5;index++)assert(j.inventory.use(index,j.reward.bag[index]));assert.deepEqual(j.reward.pets.map(p=>p.type),['凯恩','莎菲','雪瑞','飞飞','朵朵']);
  const p=savedProgress(decodeSave(encodeSave(captureSave(j.progress()))));j.restore(p);assert.equal(shop.buy(0),false);assert.deepEqual(j.reward.pets,p.reward.pets);assert.equal(j.petShop.openNumber,oldShop);assert.equal(j.cityVisit.gobiPetShopOpenNumber,5);
  const current=j.southPetMerchant;current.interact();j.vitals.life=0;assert.equal(current.buy(0),false);j.vitals.life=10;j.map='city';assert.equal(current.buy(0),false);j.map='southSecond';j.paused=true;assert.equal(current.buy(0),false);
 }
});
