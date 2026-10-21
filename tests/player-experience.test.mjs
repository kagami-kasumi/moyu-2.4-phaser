import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {Inventory} from '../src/domain/inventory.ts';import {NpcReward,rewardEquipment,newRing} from '../src/domain/npc-reward.ts';import {PlayerExperience,grantExperience} from '../src/domain/player-experience.ts';import {initialWarriorVitals} from '../src/domain/hud.ts';import {experienceOracle} from './source-experience-oracle.mjs';
import {Actor} from '../src/domain/actor.ts';import {Journey} from '../src/domain/journey.ts';import {captureSave,savedProgress} from '../src/application/save-game.ts';import {encodeSave,decodeSave} from '../src/application/save-codec.ts';import {restorePreservedValue} from '../src/content/preserved-value.ts';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const make=()=>{const inv=new Inventory(new NpcReward('玩家',()=>0),initialWarriorVitals());return {inv,s:new PlayerExperience(inv)};};
test('growth frozen AS/P-code provenance and source level accessors',()=>{for(const h of json('docs/reverse-engineering/player-experience/source-functions.json').hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);const o=experienceOracle(initialWarriorVitals());assert.equal(o.panel.opened,true);assert.equal(o.panel.roleUse.nowState,true);assert.equal(o.panel.mainHuanShou,undefined);o.role.xxx_maxLevels=999;assert.equal(o.role.maxLevels,150);o.role.maxLevels=10;assert.equal(o.role.maxLevels,150);o.role.levels=151;assert.equal(o.role.levels,1);});
test('initial threshold, all band boundaries, multi-level and cap overflow match frozen setter + loop',()=>{
 for(const level of [1,14,15,29,30,59,60,89,90,99,100,109,110,119,120,129,130,139,140,149,150])for(const amount of [0,1,2000,150007]){
  const {inv}=make();Object.assign(inv.vitals,{level,maxExp:level===1?9:level<15?level*10:level<30?level*20:level<60?level*60:level<90?level*100:level<100?level*150:level<110?20000:level<120?25000:level<130?30000:level<140?35000:50000,life:7,mp:2});
  inv.vitals.exp=inv.vitals.maxExp-1;const o=experienceOracle(inv.vitals,[],{},0,undefined,inv.reward.titleLevel);grantExperience(inv,amount);o.grant(amount);assert.deepEqual(inv.vitals,o.vitals(),`${level}/${amount}`);
 }
 const {inv}=make();grantExperience(inv,2000);assert.deepEqual([inv.vitals.level,inv.vitals.exp,inv.vitals.maxExp],[17,331,340]);
});
test('complete source panel chain: no ball, zero singleton, multi stacks, named mismatch, death, cap, repeat and stale',()=>{
 for(const counts of [[],[undefined],[0],[1],[3],[0,2,3]])for(const life of [0,3])for(const level of [1,149,150]){
  const {inv,s}=make();inv.reward.bag=Array(40).fill(null);counts.forEach((number,i)=>inv.reward.bag[i*3]={type:'经验球',number});inv.reward.bag[1]={type:'经验球',name:'不匹配',number:99};Object.assign(inv.vitals,{life,level});
  const o=experienceOracle(inv.vitals,structuredClone(inv.reward.bag),{},0,undefined,inv.reward.titleLevel);s.show();
  for(let i=0;i<4;i++){const revision=s.revision;s.confirm(revision);o.confirm();assert.deepEqual(inv.vitals,o.vitals());assert.deepEqual(inv.reward.bag,o.bag());const snapshot=JSON.stringify([inv.vitals,inv.reward.bag]);assert.equal(s.confirm(revision),false);assert.equal(JSON.stringify([inv.vitals,inv.reward.bag]),snapshot);}
  const snapshot=JSON.stringify(inv.reward.bag);const revision=s.revision;s.close();assert.equal(s.confirm(revision),false);s.show();assert.equal(JSON.stringify(inv.reward.bag),snapshot);
 }
});
test('upgrade recalculates worn equipment, rings and bravery with source formulas; no-upgrade preserves damage and owners',()=>{
 for(const mask of [0,1,15,31])for(const bravery of [0,7,50]){
  const {inv,s}=make();[...rewardEquipment(),newRing(()=>0)].forEach((item,i)=>{if(mask&(1<<i))inv.equipment[item.type]=item;});inv.bravery=bravery;inv.refresh();inv.vitals.life=3;inv.vitals.mp=2;
  const o=experienceOracle(inv.vitals,structuredClone(inv.reward.bag),inv.equipment,bravery,undefined,inv.reward.titleLevel),owners=structuredClone(inv.equipment);s.show();assert(s.confirm(s.revision));o.confirm();assert.deepEqual(inv.vitals,o.vitals());for(const k of ['minAttack','maxAttack','defense','roleFire'])assert.equal(inv.stats()[k],o.role[k==='roleFire'?'attackFire':k]);assert.deepEqual(inv.equipment,owners);assert.deepEqual(inv.reward.bag,o.bag());
  Object.assign(inv.vitals,{level:100,maxExp:20000,exp:0,life:3,mp:2});s.confirm(s.revision);assert.equal(inv.vitals.life,3);assert.equal(inv.vitals.mp,2);
 }
});
test('growth source fields, full save codec, map lifecycle and fresh start',()=>{
 const create=()=>new Journey(json('public/assets/first-slice/manifest.json'),new Actor(json('public/assets/first-actor/manifest.json')));const j=create();j.start('成长');j.experience.show();j.experience.confirm(j.experience.revision);j.sockets.item=rewardEquipment()[0];const stale=j.experience.revision;
 j.arrive('city','entry1','city');assert.equal(j.experience.open,false);assert.equal(j.experience.confirm(stale),false);
 const progress=j.progress(),state=captureSave(progress),raw=restorePreservedValue(state.source);for(const [key,val]of [['role_levels',j.vitals.level],['role_nowExp',j.vitals.exp],['role_maxExp',j.vitals.maxExp],['role_life',j.vitals.life]])assert.equal(raw[key],val);
 const restored=create();restored.restore(savedProgress(decodeSave(encodeSave(state))));assert.deepEqual(restored.progress(),progress);assert.equal(restored.experience.open,false);restored.start('重置');assert.equal(restored.vitals.level,1);assert.equal(restored.experience.count(),999);
});

test('invalid imported threshold is rejected without spending; large finite cap overflow terminates',()=>{const {inv,s}=make();s.show();const before=structuredClone(inv.reward.bag);inv.vitals.maxExp=0;assert.equal(s.confirm(s.revision),false);assert.deepEqual(inv.reward.bag,before);Object.assign(inv.vitals,{level:149,maxExp:50000,exp:1e100});assert(s.confirm(s.revision));assert.equal(inv.vitals.level,150);assert(inv.vitals.exp>=0&&inv.vitals.exp<50000);});
