import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {installRoleCurrency} from './source-role-currency-oracle.mjs';
import {NpcReward,newRing} from '../src/domain/npc-reward.ts';
import {contentNamed,contentOfKind,contentById,itemContentId,literalItem} from '../src/content/registry.ts';
import {refreshEquipmentAttributes} from '../src/domain/equipment-attributes.ts';
import type {Item} from '../src/domain/npc-reward.ts';
import {Inventory} from '../src/domain/inventory.ts';
import {initialWarriorVitals} from '../src/domain/hud.ts';
import {WARRIOR_RATES} from '../src/content/implemented-gameplay-rules.ts';

test('migrated startup, all reward branches and pack outputs retain registered identities and isolate instances',()=>{
 for(const choice of [3,4,5]){
  const game=new NpcReward('注册验收',()=>0),inventory=new Inventory(game,initialWarriorVitals());
  game.interact();game.choose(2);game.choose(choice);
  for(const pack of ['灵魂礼包','幻魔礼包','魔魂礼包']){
   const index=game.bag.findIndex(i=>i?.type===pack);
   assert.ok(index>=0);assert.equal(inventory.use(index,game.bag[index]),true);
  }
  for(const item of [...game.bag.filter((i):i is Item=>!!i),...game.drops.map(d=>d.item)])assert.ok(itemContentId(item),JSON.stringify(item));
  for(const pet of game.pets)assert.equal(contentNamed('pet',pet.type).length,1);
  game.pets[0].rateLife=0;
  assert.equal(new NpcReward('新建',()=>0).pets[0].rateLife,16.5);
 }
});

test('bounded warrior projection uses original profession rates',()=>{
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4536/frame_1/DoAction.as','utf8');
 const start=source.indexOf('role.rateLife = 15;');assert.ok(start>=0);
 const scope=vm.createContext({role:{}});vm.runInContext(source.slice(start).split(/\r?\n/).slice(0,5).join('\n'),scope);
 assert.deepEqual(WARRIOR_RATES,JSON.parse(JSON.stringify(scope.role)));
});

test('currency caps and ignored NaN writes match original RoleMC accessors, including startup',()=>{
 const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/role-currency-source.json','utf8'));
 for(const file of frozen.files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file.file)).digest('hex'),file.sha256);
 const original=installRoleCurrency({}),modern=new NpcReward('测试',()=>0);
 original.xxx_ms=1_000_000_000;original.xxx_res=1_000_000_000;
 assert.equal(modern.ms,original.xxx_ms);assert.equal(modern.res,original.xxx_res);
 for(const input of [-1,0,1,99_999_999,100_000_000,100_000_001,1_000_000_000,NaN,Infinity,-Infinity,42,NaN]){
  original.xxx_ms=input;original.xxx_res=input;modern.ms=input;modern.res=input;
  assert.ok(modern.ms===original.xxx_ms,String(input));assert.ok(modern.res===original.xxx_res,String(input));
 }
 original.xxx_ms=99_999_999;modern.ms=99_999_999;original.xxx_ms+=20_000;modern.ms+=20_000;
 assert.equal(modern.ms,original.xxx_ms);
});

test('literal item defaults match independently frozen original factory, including aliases',()=>{
 const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/inventory/source-functions.json','utf8'));
 const factory=vm.runInNewContext('(function(tThing,isDrop,fX,fY)'+frozen.functions.createThing+')',{Math});
 let checked=0;
 for(const definition of contentOfKind('item')){
  if(Object.values(definition.data).some(v=>typeof v!=='string'&&typeof v!=='number'))continue;
  for(const alias of definition.aliases){
   let result:unknown;const receiver={backPack:{setThing(value:unknown){result=value;}}};
   assert.equal(factory.call(receiver,{type:alias}),true,alias);
   assert.deepEqual(literalItem(alias),JSON.parse(JSON.stringify(result)),alias);checked++;
  }
 }
 assert.ok(checked>170,'must cover the entire literal factory rather than only implemented items');
});
test('duplicate quest titles retain source branches; runtime lookups cannot mutate catalog',()=>{
 const variants=contentNamed('quest','新手训练一');assert.equal(variants.length,2);assert.notEqual(variants[0].id,variants[1].id);
 assert.notDeepEqual(variants[0].data.prize,variants[1].data.prize);
 const map=contentNamed('map','卡萨诺城郊区')[0];assert.equal(map.data.frame,8);map.data.frame=99;
 assert.equal(contentById(map.id)?.data.frame,8);
 assert.equal(contentNamed('profession','战士')[0].data.informationFrame,5);
 assert.equal(contentNamed('profession','法师')[0].data.informationFrame,6);
});
test('item identities preserve legacy type/name pairs and decline unknown generators',()=>{
 assert.equal(itemContentId({type:'宝石',name:'初级月光宝盒'}),'item:初级月光宝盒');
 assert.equal(itemContentId({type:'武器',name:'长军刀',vocational:'战士'}),'equipment:战士:长军刀');
 assert.equal(itemContentId({type:'技能书',name:'英勇'}),'item:英勇');
 assert.equal(itemContentId({type:'unregistered'}),undefined);
 assert.throws(()=>literalItem('高级攻击宝石'),/generator/);
 assert.throws(()=>literalItem('月光礼包'),/generator/);
});
test('registered equipment tiers and numeric rules match frozen source across both professions',()=>{
 const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/equipment-quality/source-functions.json','utf8'));
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/frame_9/DoAction_2.as','utf8');
 const declarations=source.split(/\r?\n/).filter(line=>/^_global\.(战士|法师)(weapon|clothe|helmet|shoes)Name =/.test(line)).join('\n');
 const scope=vm.createContext({_global:{},Math,isNaN});vm.runInContext(declarations,scope);
 const normalize=vm.runInContext('(function(target)'+frozen.functions.upDataWeapon+')',scope);
 const levels=[1,14,15,29,30,44,45,59,60,74,75,89,90,104,105,119,120,149,150];let count=0;
 for(const vocational of ['战士','法师'])for(const type of ['武器','衣服','头盔','鞋'])for(const level of levels)for(const grade of [0,1,2,3,4,5,6])for(const element of [0,1,2,3,4,5]){
  const item:Item={type,vocational,levels:level,grade,mhdj:grade*5,element,holes:grade%4,wind:3,fire:0,soil:0,water:0};const expected={...item};normalize(expected);refreshEquipmentAttributes(item);
  for(const key of ['name','minAttack','maxAttack','mMinAttack','mMaxAttack','defense','mDefense','wind','fire','soil','water','salePrice'])assert.equal(item[key]??0,expected[key]??0,`${vocational}/${type}/${level}/${grade}/${element}/${key}`);
  assert.ok(itemContentId(item));count++;
 }
 assert.equal(count,6384);
});

test('starter ring finite generator covers every source draw tuple without duplicate selectors',()=>{
 const initial=JSON.parse(fs.readFileSync('docs/reverse-engineering/npc-reward/initial-source.json','utf8'));
 const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/npc-reward/behavior-source.json','utf8')).functions;
 let draws:number[]=[],cursor=0,expected:Item|undefined;
 const random=(n:number)=>{const value=draws[cursor++]!;assert.ok(value>=0&&value<n);return value;};
 const root:any={createThing(){},useItem(){},huanShou:{allHuanShou:[{}],battle(){}},roleSkills:{addSkill(){},技能格1:{skill:{name:'斩魂'}}},fastKey:{包格5:{setThing(){}}},task:{nextMainTask(){}},backPack:{setThing(item:Item){expected={...item};}}};
 const scope=vm.createContext({Math,random,_root:root,_parent:root,wudi(){}});
 vm.runInContext(initial.ring,scope);
 root.upDataWeapon=vm.runInContext('(function(target)'+frozen.upDataWeapon+')',scope);
 const initialize=vm.runInContext('(function()'+frozen.initNewGame+')',scope);
 const map={_parent:root,role:{vocational:'战士'}};let count=0;
 for(let a=0;a<4;a++)for(let b=0;b<3;b++)for(let c=0;c<8;c++)for(let d=0;d<7;d++)for(let e=0;e<6;e++)for(let f=0;f<5;f++){
  draws=[a,b,c,d,e,f];cursor=0;initialize.call(map);assert.equal(cursor,6);
  cursor=0;const actual=newRing(random);assert.equal(cursor,6);assert.deepEqual(actual,expected);
  assert.equal(new Set([actual.mainType1,actual.mainType2]).size,2);
  assert.equal(new Set([actual.pairType1,actual.pairType2,actual.pairType3,actual.pairType4]).size,4);count++;
 }
 assert.equal(count,20160);
});

test('registered wedding ring partner selectors and random attribute bounds match source endpoints',()=>{
 const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/content-registry/generator-source.json','utf8'));
 for(const file of frozen.files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file.file)).digest('hex'),file.sha256);
 const rule=contentNamed('item','结婚戒指')[0].data.generationRules as any;
 const variant=rule.variants.find((v:any)=>v.source.file==='DefineSprite_4312/frame_1/DoAction.as');
 const partners=variant.mainSelection.byPartner;assert.deepEqual(partners.map((p:any)=>p.partner),['约克','奈奈安','薇薇安','麦克','露西亚','恩多','娜尔莎','兰斯','海伦娜','艾尔','迪特','爱丽娜','贝塔','卡迪娜']);
 const scope:any={random:(n:number)=>0,_root:{upDataWeapon(){}}};
 const generate=vm.runInNewContext('(function(who)'+frozen.functions.getWeddingRing.body+')',scope);
 let count=0;
 for(const partner of partners)for(const upper of [false,true]){
  scope.random=(n:number)=>upper?n-1:0;
  const ring=generate(partner.partner);
  assert.deepEqual([ring.mainType1,ring.mainType2],partner.mainTypes);
  assert.equal(new Set([ring.pairType1,ring.pairType2,ring.pairType3,ring.pairType4]).size,4);
  for(const [key,bound] of Object.entries(variant.randomBounds) as [string,any][])assert.equal(ring[key],upper?bound.maximum:bound.minimum,key);
  count++;
 }
 assert.equal(count,28);
 const duplicate=partners.filter((p:any)=>p.mainTypes[0]===p.mainTypes[1]);assert.equal(duplicate.length,4,'source permits repeated wedding main selectors');
});
