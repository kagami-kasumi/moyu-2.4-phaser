import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {Inventory} from '../src/domain/inventory.ts';
import {NpcReward,rewardEquipment,newRing} from '../src/domain/npc-reward.ts';
import {initialWarriorVitals} from '../src/domain/hud.ts';
import {ITEM_PETS} from '../src/content/item-pets.ts';
import {installRoleCurrency} from './source-role-currency-oracle.mjs';
const source=JSON.parse(fs.readFileSync('docs/reverse-engineering/inventory/source-functions.json','utf8'));
const make=()=>new Inventory(new NpcReward('玩家',()=>0),initialWarriorVitals());
const fn=(name:string,args:string,scope:object={})=>vm.runInNewContext(`(function(${args})${source.functions[name]})`,{Math,isNaN,...scope});
test('frozen inventory AS and P-code remain identical to read-only extraction',()=>{for(const h of source.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);});
test('equipment and ring stats match independent frozen source calculation for all subsets',()=>{
 const items=[...rewardEquipment(),newRing(()=>0)];
 for(const holes of [0,1,2,3])for(let mask=0;mask<32;mask++){
  const inv=make(),eq:any={init:fn('equipmentInit',''),role:{flashAttribute(){}},flashPic(){}};
  for(const slot of ['头盔','衣服','武器','鞋','戒指','幸运符'])eq[slot]={type:'空格'};
  for(let i=0;i<items.length;i++)if(mask&(1<<i)){const item={...items[i]!,...(i<4?{holes}:{})};inv.reward.bag[i]=item;assert.ok(inv.use(i,item));eq[item.type]=item;}
  eq.allItem=['头盔','衣服','武器','鞋'].map(k=>eq[k]);fn('equipmentStats','').call(eq);
  const role:any={levels:1,rateLife:15,rateMp:5,rateMinAttack:.2,rateMaxAttack:1.8,rateDefense:.3,skillLife:0,skillMp:0,init(){for(const k of ['burst','jook','moreMinAttack','moreMaxAttack','moreDefense','reduceDamage','moreExp','moreLife','moreMp','wind','soil','fire','water','renew','attackFire'])this[k]=0;},get maxLife(){return this.xxx_maxLife;},_parent:{_parent:{equipment:{...eq,flashView(){}},roleAtrribute:{flashView(){}},fireDetail:{flashView(){}},battleHuanShouPanel1:{},battleHuanShouPanel2:{},battleHuanShouPanel3:{}}}};
  // Bounded formula ends before source display callbacks / world effects.
  const formula=source.functions.roleStats.slice(0,source.functions.roleStats.indexOf('      var _loc3_;'))+'}';vm.runInNewContext('(function()'+formula+')',{Math}).call(role);
  const actual=inv.stats();for(const k of ['minAttack','maxAttack','defense','maxLife','maxMp'])assert.equal(actual[k as keyof typeof actual],role[k],`${mask}: ${k}`);assert.equal(actual.equipmentFire,eq.attackFire);
 }
});
test('equipment restrictions, replacement source order, full bag unload and stale action',()=>{
 const inv=make(),old=rewardEquipment()[0]!,fresh={...old,name:'替换武器'};
 inv.reward.bag[0]=old;assert.ok(inv.use(0,old));assert.equal(inv.use(0,old),false);
 inv.reward.bag.fill({type:'英雄令',number:99});inv.reward.bag[3]=fresh;
 assert.ok(inv.use(3,fresh));assert.equal(inv.reward.drops[0]!.item.name,old.name);assert.equal(inv.reward.bag[3],null);assert.match(inv.reward.messages.at(-1)!,/旧装备掉落/);
 inv.reward.bag[3]={type:'英雄令',number:99};assert.ok(inv.unequip('武器',inv.equipment.武器));assert.equal(inv.reward.drops.length,2);assert.equal(inv.stats().maxAttack,11);
 for(const bad of [{...old,levels:2},{...old,vocational:'法师'}]){inv.reward.bag[0]=bad;assert.equal(inv.use(0,bad),false);assert.equal(inv.reward.bag[0],bad);}
});
test('currency and all material packs match frozen useItem output and consume after rewards',()=>{
 for(const type of ['富豪礼包','灵魂礼包','幻魔礼包','魔魂礼包']){
  const inv=make();inv.reward.bag.fill({type:'英雄令',number:99});const item={type,number:2,salePrice:20000};inv.reward.bag[0]=item;
  const grants:any[]=[],original:any={...item,hitTest:()=>true,setThing(v:object){Object.assign(this,v);}};const role=installRoleCurrency({});role.xxx_ms=inv.reward.ms;
  const root:any={map:{role},createThing:(x:any)=>grants.push(x),backPack:{},fastKey:{}};
  fn('useItem','item',{_global:{sysMsg:{addMsg(){}},numberToString:String}}).call(root,original);
  inv.use(0,item);assert.equal(inv.reward.ms,root.map.role.xxx_ms);assert.equal(item.number,original.number);
  assert.equal(inv.reward.drops.length,grants.length);if(grants.length){assert.equal(grants.length,10);for(const d of inv.reward.drops)assert.equal(d.item.name,grants[0].type);}
 }
});
test('all supported pet eggs match frozen literal records, capacity failure preserves egg',()=>{
 assert.equal(Object.keys(ITEM_PETS).length,49);
 assert.equal(ITEM_PETS['奇迹龙'],undefined,'randomized initialization is generated, not a fixed seed');
 for(const [type,record]of Object.entries(ITEM_PETS)){
  const inv=make(),item={type,number:1};inv.reward.bag[0]=item;let observed:any;
  fn('useItem','item').call({backPack:{},fastKey:{},huanShou:{addHuanShou(p:object){observed=p;return true;}}},{...item,hitTest:()=>true,setThing(){}});
  assert.deepEqual(JSON.parse(JSON.stringify(observed)),record);assert.ok(inv.use(0,item));for(const [key,value]of Object.entries(record))assert.equal((inv.reward.pets.at(-1) as any)[key],value);assert.equal(inv.reward.pets.at(-1)!.battle,false);assert.equal(inv.reward.bag[0],null);
 }
 const inv=make(),egg={type:'莎菲',number:2};inv.reward.bag[0]=egg;while(inv.reward.pets.length<40)inv.reward.pets.push({...inv.reward.pets[0]!});assert.equal(inv.use(0,egg),false);assert.equal(egg.number,2);
});
test('bravery repeated learning up to source max and conditions; unsupported items stay intact',()=>{
 const inv=make(),skill={name:'英勇',levels:0,maxLevels:50};const oracle:any={allSkills:[skill],studiedSkills:0,effect(){},afterAdd(){}};
 for(let i=0;i<51;i++){const book={type:'技能书',name:'英勇',vocational:'公共',levels:1};inv.reward.bag[0]=book;assert.equal(inv.use(0,book),fn('addSkill','skillName,reLv').call(oracle,'英勇'));assert.equal(inv.bravery,skill.levels);}
 for(const item of [{type:'经验球',number:999},{type:'技能书',name:'英勇',vocational:'法师',levels:1},{type:'技能书',name:'英勇',vocational:'公共',levels:2}]){inv.reward.bag[0]=item;assert.equal(inv.use(0,item),false);assert.equal(inv.reward.bag[0],item);}
 assert.equal(inv.stats().roleFire,271);
});
test('medal counters follow frozen source caps for repeated use',()=>{
 const inv=make(),role:any={exploit:0,militaryExploit:0,chaw:0,militaryRank:0};
 for(let i=0;i<400;i++){const medal={type:'勇士勋章',number:1};inv.reward.bag[0]=medal;inv.use(0,medal);for(const f of ['exploit','military'])fn(f,'val',{_global:{sysMsg:{addMsg(){}}}}).call(role,100);assert.equal(inv.exploit,role.exploit);assert.equal(inv.militaryExploit,role.militaryExploit);}
 assert.equal(inv.stats().roleFire,36);
});
