import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {refreshItemNumbers,advanceItemSpirit,ITEM_REFINEMENT_RULES} from '../src/content/item-numeric-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';const source=fs.readFileSync(root+'frame_9/DoAction.as','utf8');
const tables={};for(const p of ['战士','法师'])for(const f of ['weaponName','shoesName','clotheName','helmetName'])tables[p+f]=Array.from({length:9},(_,i)=>String(i));
const ringStart=source.indexOf('var ringMainValue');
const ringLine=source.slice(ringStart,source.indexOf('this.upDataWeapon =',ringStart));
const ctx=vm.createContext({_global:tables});vm.runInContext(ringLine,ctx);
const original=vm.runInContext('(function(target)'+functionRange(source,'this.upDataWeapon =').text+')',ctx);
test('equipment numbers and defaults match original for every family, profession, grade and element boundary',()=>{
 for(const type of ['头盔','衣服','武器','鞋'])for(const vocational of ['战士','法师'])for(const levels of [1,14,15,119,120,150])for(const grade of [0,1,2,3,4,5,6,7])for(const element of [0,1,2,3,4,5]){
  const input={type,vocational,levels,grade,element,mhdj:grade*8,holes:grade%4,wind:999};const expected={...input},actual={...input};original(expected);refreshItemNumbers(actual);delete expected.name;assert.deepEqual(actual,expected);
 }
 for(const input of [{type:'武器',vocational:'战士'},{type:'衣服',vocational:'法师',mhdj:NaN,wind:NaN}]){const expected={...input},actual={...input};original(expected);refreshItemNumbers(actual);delete expected.name;assert.deepEqual(actual,expected);}
});
test('ring, charm and bell recomputation respects inactive attributes and grade endpoints',()=>{
 for(const grade of [-1,0,1,2,3,4,5]){
  for(const type of ['凤翼铃铛','翡翠铃铛','庇护铃铛','幸运符','戒指'])for(const name of ['新手戒指','骑士戒指']){
   const input={type,name,grade,luckLevels:3,isFirstLove:1,mainType1:'moreAttack',mainType2:'moreDefense',attributeType1:1,attributeType2:2,attributeType3:3,attributeVal3:99};const expected={...input},actual={...input};original(expected);refreshItemNumbers(actual);assert.deepEqual(actual,expected);
  }
 }
});
test('spirit thresholds advance once, discard overflow, and use final level replacement',()=>{
 const text=fs.readFileSync(root+'DefineSprite_2049_物品栏物品/frame_1/DoAction.as','utf8');const grow=vm.runInNewContext('(function(val)'+functionRange(text,'this.spiritUp =').text+')');
 for(const spirit of [0,1,2,3,4,5])for(const spiritLevels of [1,6,7,8])for(const gain of [undefined,0,19,20,79,80,999,NaN]){
  const input={type:'武器',spirit,spiritLevels,spiritExp:0,spiritVal:3};const expected={...input,_parent:{flashAttribute(){}}},actual={...input};assert.equal(advanceItemSpirit(actual,gain),grow.call(expected,gain));delete expected._parent;assert.deepEqual(actual,expected);
 }
});
test('refinement material counts, level overshoot and pre-consumption failure are preserved source facts',()=>{
 const count=source.match(/this.make.gradeSuccess = new Array\(([^)]+)\)/)[1].split(',').map(Number);assert.deepEqual([...ITEM_REFINEMENT_RULES.gradeMaterials],count);
 let paid=[];const globals={_global:{sysMsg:{addMsg(){}}},_root:{map:{role:{xxx_credit:100}}},random:()=>0};
 const make=vm.runInNewContext('(function()'+functionRange(source,'this.make.makeItem =').text+')',globals);
 const x={item:{type:'武器',levels:119},stone:{type:'宝石',name:'幻魔之心'},_parent:{map:{role:{maxLevels:120}}},useGem(n){paid.push(n);return false}};
 assert.equal(make.call(x),true);assert.equal(x.item.levels,134);assert.equal(paid.length,1);
 x.item={type:'武器',spirit:0,additional:0};x.stone.name='陨铁矿';x.useGem=()=>{paid.push(1);return true};assert.equal(make.call(x),false);assert.equal(paid.length,2);
 for(const [name,[field,amount]]of Object.entries(ITEM_REFINEMENT_RULES.ringMagic)){x.item={type:'戒指',mhdj:9,[field]:0};x.stone.name=name;assert.equal(make.call(x),true);assert.equal(x.item[field],amount);assert.equal(x.item.mhdj,10);assert.equal(make.call(x),false);}
});
