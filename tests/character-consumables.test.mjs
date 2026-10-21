import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';
import {Inventory} from '../src/domain/inventory.ts';import {NpcReward,rewardEquipment,newRing} from '../src/domain/npc-reward.ts';import {initialWarriorVitals} from '../src/domain/hud.ts';import {literalItem,contentOfKind} from '../src/content/registry.ts';import {applyMedicine,useReserve} from '../src/domain/character-consumables.ts';import {consumablesOracle} from './source-consumables-oracle.mjs';import {grantExperience} from '../src/domain/player-experience.ts';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';import {captureSave,savedProgress} from '../src/application/save-game.ts';import {encodeSave,decodeSave} from '../src/application/save-codec.ts';import {restorePreservedValue,preserveValue} from '../src/content/preserved-value.ts';
const make=()=>new Inventory(new NpcReward('验收',()=>0),initialWarriorVitals());
const types=['生命之源','魔力源泉','超级经验球','能量药水'];
const medicines=contentOfKind('item').filter(d=>d.data.type==='药品');
test('consumables independent factory enumeration and frozen AS/P-code hashes',()=>{
 for(const h of JSON.parse(fs.readFileSync('docs/reverse-engineering/character-consumables/source-functions.json')).hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction.as','utf8');
 const found=[...source.matchAll(/_loc2_ = (\{type:"(?:药品|生命之源|魔力源泉|超级经验球|能量药水)"[^\r\n]+\});/g)].map(m=>vm.runInNewContext('('+m[1]+')'));
 found.push(vm.runInNewContext('('+source.match(/case "能量药水":\s*_loc2_ = (\{[^\r\n]+\});/)[1]+')',{tThing:{type:'能量药水'}}));
 const actual=contentOfKind('item').filter(d=>d.data.type==='药品'||types.includes(d.data.type)).map(d=>d.data);
 assert.equal(found.length,11);assert.equal(actual.length,11);assert.deepEqual(JSON.parse(JSON.stringify(found)).sort((a,b)=>(a.name??a.type).localeCompare(b.name??b.type)),actual.sort((a,b)=>(a.name??a.type).localeCompare(b.name??b.type)));
});
test('all medicines: zero/single/multiple stacks, death/full/damaged, current slot and first matching deduction',()=>{
 for(const d of medicines)for(const count of [undefined,0,1,3])for(const life of [0,1,90]){
  const inv=make();inv.reward.bag=Array(40).fill(null);inv.reward.bag[0]={...d.data,number:count};inv.reward.bag[5]={...d.data,number:2};Object.assign(inv.vitals,{life,mp:1});const o=consumablesOracle(inv);
  for(let n=0;n<2;n++){const item=inv.reward.bag[5];inv.use(5,item);o.use(5);assert.deepEqual(inv.reward.bag,o.bag());assert.equal(inv.vitals.life,o.role.life);assert.equal(inv.vitals.mp,o.role.mp);}
 }
});
test('medicine strict pet precedence, huanShou versus body, death, MP first and ties',()=>{
 for(const mpVal of [0,10])for(const life of [0,1,80,90])for(const gaps of [[0,0,0],[10,10,10],[11,12,13],[90,20,50]]){
  const inv=make();Object.assign(inv.vitals,{life,mp:1});const panels=gaps.map((gap,i)=>({isOpen:true,huanShou:{life:100-gap,maxLife:100},body:{life:i===2?0:20,maxLife:1000}}));const item={type:'药品',name:'超级药',hpVal:7,mpVal};inv.reward.bag[0]=item;const o=consumablesOracle(inv,panels);applyMedicine(inv.vitals,item,panels);o.use(0);assert.equal(inv.vitals.life,o.role.life);assert.equal(inv.vitals.mp,o.role.mp);panels.forEach((p,i)=>assert.equal(p.body.life,o.root['battleHuanShouPanel'+(i+1)].body.life));
 }
});
test('reserve shared ordering, insufficient/exact/overflow, dead/full and no item spent',()=>{
 for(const type of types.slice(0,2))for(const life of [0,1,90,100])for(const amount of [0,5,89,100,500]){
  const inv=make();Object.assign(inv.vitals,{life,mp:1});Object.assign(inv.consumables,{lifeSourse:amount,mpSourse:amount});inv.reward.bag[0]=literalItem(type);
  const panels=[{isOpen:false,huanShou:{life:10,maxLife:30},body:{life:10,maxLife:30}},{isOpen:true,huanShou:{life:0,maxLife:30},body:{life:0,maxLife:30}}];const o=consumablesOracle(inv,panels);useReserve(inv.vitals,inv.consumables,type,panels);o.use(0);
  for(const key of ['life','mp'])assert.equal(inv.vitals[key],o.role[key]);for(const key of ['lifeSourse','mpSourse'])assert.equal(inv.consumables[key],o.role[key]);panels.forEach((p,i)=>assert.equal(p.body.life,o.root['battleHuanShouPanel'+(i+1)].body.life));assert.deepEqual(inv.reward.bag,o.bag());
 }
});
test('super balls source cap still consumes, five bonuses with equipment/bravery, energy 3 to 6 retains at cap',()=>{
 for(const type of types.slice(2))for(const level of [1,17])for(const count of [0,1,4])for(const bravery of [0,50]){
  const inv=make();inv.vitals.level=level;inv.vitals.life=0;inv.bravery=bravery;[...rewardEquipment(),newRing(()=>0)].forEach(item=>inv.equipment[item.type]=item);inv.refresh();inv.reward.bag[0]={...literalItem(type),number:count};const o=consumablesOracle(inv);
  for(let n=0;n<4&&inv.reward.bag[0];n++){const stale=inv.reward.bag[0];inv.use(0,stale);o.use(0);assert.deepEqual(inv.reward.bag,o.bag());for(const key of ['expBallNum','moreExpFire','moreExpLife','moreExpMp','moreExpAttack','moreExpDefense'])assert.equal(inv.consumables[key],o.role[key]);assert.equal(inv.consumables.maxPower,o.xp.maxPower);assert.equal(inv.vitals.life,o.role.life);if(type==='超级经验球'&&o.role.expBallNum)for(const key of ['maxLife','maxMp','minAttack','maxAttack','defense'])assert.equal(inv.stats()[key],o.role[key]);if(!inv.reward.bag[0])assert.equal(inv.use(0,stale),false);}
 }
 const inv=make();inv.consumables.lifeSourse=500;inv.consumables.lifeSourseLevels=3;grantExperience(inv,2000);assert.equal(inv.consumables.lifeSourse,500);assert.equal(inv.stats().maxLife*inv.consumables.lifeSourseLevels,990);
});
test('active fields, opaque XP, legacy promotion, repeated restore and new-game reset',()=>{
 const json=p=>JSON.parse(fs.readFileSync(p)),create=()=>new Journey(json('public/assets/first-slice/manifest.json'),new Actor(json('public/assets/first-actor/manifest.json')));const j=create();j.start('储备');j.inventory.xpEnabled=true;Object.assign(j.inventory.consumables,{expBallNum:1,moreExpFire:2,moreExpLife:2,moreExpMp:2,moreExpAttack:2,moreExpDefense:2,lifeSourseLevels:2,mpSourseLevels:3,lifeSourse:888,mpSourse:77,maxPower:6,isFull:false});j.inventory.refresh();
 j.combatLedger.nowPower=2;j.combatLedger.nowExp=11;let state=captureSave(j.progress()),raw=restorePreservedValue(state.source);Object.assign(raw,{XPPower_isUsed:true,XPPower_nowPower:2,XPPower_nowExp:11,unimplemented:{nested:'keep'}});state.source=preserveValue(raw);
 for(let n=0;n<3;n++){const loaded=create();loaded.restore(savedProgress(decodeSave(encodeSave(state))));assert.deepEqual(loaded.progress(),j.progress());state=captureSave(loaded.progress(),state);raw=restorePreservedValue(state.source);assert.equal(raw.XPPower_isUsed,true);assert.equal(raw.XPPower_nowPower,2);assert.equal(raw.XPPower_nowExp,11);assert.deepEqual(raw.unimplemented,{nested:'keep'});assert.equal(raw.role_maxLifeSourse,j.vitals.maxLife*2);assert.equal(raw.role_expBallNum,1);}
 const ext=restorePreservedValue(state.extensions);delete ext.game.inventory.consumables;state.extensions=preserveValue(ext);const old=savedProgress(decodeSave(encodeSave(state)));assert.deepEqual(old.inventory.consumables,j.inventory.consumables);
 const loaded=create();loaded.restore(old);loaded.start('重置');assert.equal(loaded.inventory.consumables.expBallNum,0);assert.equal(loaded.inventory.consumables.maxPower,3);
});
test('deduction failure preserves healed value and clears current slot as frozen source does',()=>{
 const inv=make();inv.vitals.life=1;inv.reward.bag=Array(40).fill(null);inv.reward.bag[0]={...literalItem('小型生命药'),number:-1};const o=consumablesOracle(inv);inv.use(0,inv.reward.bag[0]);o.use(0);assert.equal(inv.vitals.life,o.role.life);assert.deepEqual(inv.reward.bag,o.bag());assert.equal(inv.reward.bag[0],null);
});
