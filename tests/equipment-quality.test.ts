import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {EquipmentSockets,SOCKET_BOXES} from '../src/domain/equipment-sockets.ts';
import {NpcReward,rewardEquipment,newRing,type Item} from '../src/domain/npc-reward.ts';
import {qualityName} from '../src/domain/equipment-quality.ts';
import {Inventory} from '../src/domain/inventory.ts';
import {initialWarriorVitals} from '../src/domain/hud.ts';
import {pickUp} from '../src/domain/ground-items.ts';
import {qualitySource as source,qualityOracle as oracle} from './source-quality-oracle.mjs';
const clean=(v:any)=>JSON.parse(JSON.stringify(v));
const gem=(number=1,name='灵魂晶石'):Item=>({type:'宝石',name,number,salePrice:100});
test('quality frozen AS/P-code and grade table are tied to original extraction',()=>{
 for(const h of source.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
 assert.deepEqual(source.gradeSuccess,[2,4,8,16,32,64,128,256]);const names=vm.runInNewContext('['+source.gradeNames+']');for(let i=1;i<=6;i++)assert.equal(qualityName(i),names[i]);assert.equal(qualityName(0),'普通');
});
test('720 source cases: four kinds, qualities 0–4, six material boundaries and all elements with full-field comparison',()=>{
 let cases=0;
 for(const gear of rewardEquipment())for(const grade of [0,1,2,3,4])for(const number of [0,1,source.gradeSuccess[grade]-1,source.gradeSuccess[grade],source.gradeSuccess[grade]+1,99])for(const element of [0,1,2,3,4,5]){
  const item={...gear,grade,element,wind:999,holes:3,hole1:'高级攻击宝石',gem1:7,gem11:3,hole2:'高级减伤害宝石',gem2:4,additional:2,spirit:1,spiritLevels:3,spiritVal:9,spiritExp:80},stone=gem(number),o=oracle(item,stone);o.normalize(item);Object.assign(o.forge.item,item);
  const r=new NpcReward('玩家'),s=new EquipmentSockets(r);s.item={...item};s.stone={...stone};s.show();o.yes();const success=o.item().grade!==grade;
  assert.equal(s.forgeQuality(),success);assert.deepEqual(s.item,o.item());assert.deepEqual(s.stone,o.stone());assert.deepEqual(r.messages,o.r.messages);
  assert.deepEqual(o.events,success?(o.stone()?['update','info']:['update','sound','装备打造成功','info']):(number>0&&grade<4?['宝石数量不足！','info']:['info']));cases++;
 }
 assert.equal(cases,720);
});
test('quality rejects out-of-scope gear, unsupported materials, stale and closed operations without consuming',()=>{
 for(const item of [newRing(()=>0),{type:'幸运符',grade:0},{type:'英雄令'},null]){const s=new EquipmentSockets(new NpcReward('玩家'));s.item=item;s.stone=gem(99);s.show();const before=clean([s.item,s.stone]);assert.equal(s.forgeQuality(),false);assert.deepEqual([s.item,s.stone],before);}
 const s=new EquipmentSockets(new NpcReward('玩家'));s.item=rewardEquipment()[0]!;s.show();for(const stone of [null,gem(99,'魔魂之心'),gem(99,'灵魂王'),{...gem(99),type:'英雄令'}]){s.stone=stone;const before=clean([s.item,s.stone]);assert.equal(s.forgeQuality(),false);assert.deepEqual([s.item,s.stone],before);}
 s.stone=gem(99);const rev=s.revision;assert.ok(s.forgeQuality(rev));const after=s.snapshot();assert.equal(s.forgeQuality(rev),false);assert.deepEqual(s.snapshot(),after);s.close();const closed=s.snapshot();assert.equal(s.forgeQuality(),false);assert.equal(s.take('item'),false);assert.deepEqual(s.snapshot(),closed);s.show();assert.ok(s.forgeQuality());assert.equal(s.item.grade,4);assert.equal(s.stone.number,75);
});
test('quality selection replacement, stale takes and full bag recovery transfer each item once',()=>{
 const r=new NpcReward('玩家'),s=new EquipmentSockets(r);r.bag=Array(40).fill(null);r.bag[0]=rewardEquipment()[0]!;r.bag[1]=gem(30);s.show();s.select(0,r.bag[0]!);s.select(1,r.bag[1]!);assert.ok(s.forgeQuality());const grade3=clean(s.item);r.bag[2]=gem(99);s.select(2,r.bag[2]!);assert.equal(r.bag.find(i=>i?.name==='灵魂晶石')?.number,22);assert.ok(s.forgeQuality());assert.equal(s.item!.grade,4);
 r.bag[2]=rewardEquipment()[1]!;const rev=s.revision;assert.ok(s.select(2,r.bag[2]!));assert.equal(s.select(2,r.bag[2]!,rev),false);assert.equal(r.bag.find(i=>i?.name==='长军刀')!.grade,4);assert.equal(s.item!.name,'锁环甲');
 s.item={...grade3};s.stone=gem(16);assert.ok(s.forgeQuality());const held=clean(s.item);r.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));const takeRev=s.revision;assert.ok(s.take('item',takeRev,{x:200,y:300},()=>false));assert.equal(s.take('item',takeRev),false);assert.equal(r.drops.length,1);r.bag[8]=null;assert.ok(pickUp(r,r.drops[0]!));assert.deepEqual(r.bag[8],{...held,number:0});
});
test('upgraded armor remains compatible with all socket tiers and magic, then matches source player aggregation',()=>{
 const r=new NpcReward('玩家'),s=new EquipmentSockets(r),inv=new Inventory(r,initialWarriorVitals());r.bag=Array(40).fill(null);s.show();
 for(const gear of rewardEquipment()){
  s.item={...gear};s.stone=gem(99);const o=oracle(gear,gem(99));while(Number(s.item.grade)<4){assert.ok(s.forgeQuality());o.yes();}assert.deepEqual(s.item,o.item());
  for(const name of SOCKET_BOXES){s.stone=gem(1,name);o.forge.stone.setThing(gem(1,name));assert.ok(s.forge());o.yes();assert.deepEqual(s.item,o.item());}
  s.stone=gem(1,'魔魂之心');o.forge.stone.setThing(gem(1,'魔魂之心'));assert.ok(s.forgeMagic());o.yes();assert.deepEqual(s.item,o.item());s.take('item');assert.ok(inv.use(0,r.bag[0]!));
 }
 const src=JSON.parse(fs.readFileSync('docs/reverse-engineering/inventory/source-functions.json','utf8')),fn=(name:string)=>vm.runInNewContext('(function()'+src.functions[name]+')',{Math});
 const eq:any={init:fn('equipmentInit'),role:{flashAttribute(){}},flashPic(){}};for(const type of ['武器','衣服','头盔','鞋','戒指','幸运符'])eq[type]=inv.equipment[type as keyof typeof inv.equipment]??{type:'空格'};eq.allItem=['头盔','衣服','武器','鞋'].map(k=>eq[k]);fn('equipmentStats').call(eq);assert.equal(inv.stats().equipmentFire,eq.attackFire);assert.equal(inv.stats().equipmentFire,36);
 const role:any={levels:1,rateLife:15,rateMp:5,rateMinAttack:.2,rateMaxAttack:1.8,rateDefense:.3,skillLife:0,skillMp:0,init(){for(const k of ['burst','jook','moreMinAttack','moreMaxAttack','moreDefense','reduceDamage','moreExp','moreLife','moreMp','wind','soil','fire','water','renew','attackFire'])this[k]=0;},get maxLife(){return this.xxx_maxLife;},_parent:{_parent:{equipment:{...eq,flashView(){}},roleAtrribute:{flashView(){}},fireDetail:{flashView(){}},battleHuanShouPanel1:{},battleHuanShouPanel2:{},battleHuanShouPanel3:{}}}};
 const formula=src.functions.roleStats.slice(0,src.functions.roleStats.indexOf('      var _loc3_;'))+'}';vm.runInNewContext('(function()'+formula+')',{Math}).call(role);for(const key of ['minAttack','maxAttack','defense','maxLife','maxMp']as const)assert.equal(inv.stats()[key],role[key]);
});
