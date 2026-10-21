import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {tokens,matching} from '../tools/lib/as2-data.mjs';
import {rewardOracle} from './source-reward-oracle.mjs';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';import {validateManifest} from '../src/content/manifest.ts';
import {CHARACTERS} from '../src/content/character-entry.ts';import {NpcReward,rewardEquipment} from '../src/domain/npc-reward.ts';
const json=p=>JSON.parse(fs.readFileSync(p)),read=p=>fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+p,'utf8');
const manifests={战士:validateManifest(json('public/assets/first-actor/manifest.json')),法师:validateManifest(json('public/assets/mage/manifest.json'))};
const make=()=>new Journey(json('public/assets/first-slice/manifest.json'),new Actor(manifests.战士),manifests);
const body=(s,marker)=>{const start=s.indexOf(marker);assert(start>=0);const t=tokens(s),i=t.findIndex(t=>t.start>=start&&t.value==='{');return s.slice(t[i].start,t[matching(t,i)].end);};
const rng=seed=>n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
test('both source role branches and names initialize the selected character, skills, quick key and first quest',()=>{
 const source=read('DefineSprite_4536/frame_1/DoAction.as'),snippet=source.slice(source.indexOf('role.myName ='),source.indexOf('role.attackStopTime ='));
 const task=body(read('DefineSprite_2210_任务系统/frame_1/DoAction.as'),'this.nextMainTask =');
 for(const profession of ['战士','法师'])for(const name of ['玩家','角色名称一二三四五六','DeBuG']){
  const j=make();assert(j.start(name,profession));const role={};vm.runInNewContext(snippet,{role,_parent:{beginName:name,begingVocational:profession}});
  const c=CHARACTERS[profession];for(const k of Object.keys(c.rates))assert.equal(c.rates[k],role[k]);assert.equal(c.sex,role.sex);assert.equal(c.baseBurst,role.baseBurst);assert.equal(c.baseJook,role.baseJook);
  const mainTask=Array.from({length:30},()=>({isDoing:false,isComplete:false}));vm.runInNewContext('(function()'+task+')',{mainTask,_parent:{map:{role}},showTask(){},nowTaskType:'mainTask'} )();assert.equal(mainTask.findIndex(t=>t.isDoing),j.initialState.mainTask.index);
  const oracle=rewardOracle(()=>0,undefined,{profession,name,debug:true});assert.deepEqual(j.initialState.skills.map(s=>s.name),oracle.initialSkills);assert.equal(j.initialState.fastKeys[5],oracle.root.fastKey.包格5.item.name);assert.equal(j.vitals.level,oracle.map.role.levels);assert.equal(j.reward.ms,oracle.map.role.xxx_ms);assert.equal(j.reward.res,oracle.map.role.xxx_res);assert.equal(j.initialState.credit,oracle.map.role.xxx_credit);
  assert.equal(j.vitals.maxLife,role.rateLife*6);assert.equal(j.vitals.maxMp,role.rateMp*6);assert.equal(j.actor.manifest,manifests[profession]);
 }
});
test('wudi then case-insensitive debug matches independent original backpack, random calls, cap and overflow for both professions',()=>{
 for(const profession of ['战士','法师'])for(const name of ['玩家','debug','DEBUG'])for(const seed of [1,23,999]){
  const oracle=rewardOracle(rng(seed),undefined,{profession,name,debug:true});const r=new NpcReward(name,rng(seed),profession,{x:277.8,y:421.6});
  assert.deepEqual(r.bag,oracle.bag(),`${profession}/${name}/${seed}`);assert.deepEqual(r.drops,JSON.parse(JSON.stringify(oracle.drops)));assert.equal(r.ms,oracle.map.role.xxx_ms);assert.equal(r.res,oracle.map.role.xxx_res);assert.deepEqual(r.pets,oracle.pets);
 }
});
test('mage reward keeps unrefreshed source robe; each profession equips its own gear and rejects the other',()=>{
 for(const profession of ['战士','法师']){
  const oracle=rewardOracle(()=>0,undefined,{profession});for(let i=1;i<=40;i++)oracle.root.backPack['包格'+i].setThing({type:'空格',number:0});oracle.interact();oracle.choose(2);oracle.choose(3);
  const j=make();j.start('玩家',profession);j.reward.bag.fill(null);j.reward.interact();j.reward.choose(2);j.reward.choose(3);assert.deepEqual(j.reward.bag,oracle.bag());
  for(let i=1;i<=4;i++)assert(j.inventory.use(i,j.reward.bag[i]));assert.equal(j.inventory.stats().maxLife,CHARACTERS[profession].rates.rateLife*6);
  const wrong=rewardEquipment(profession==='战士'?'法师':'战士')[0];j.reward.bag[0]=wrong;assert.equal(j.inventory.use(0,wrong),false);
 }
 assert.deepEqual(rewardEquipment('法师')[1],{type:'衣服',grade:1,name:'旅者装',mhdj:3,vocational:'法师',levels:1,defense:2,mDefense:1});
});
test('invalid submissions are atomic; fresh starts do not retain old profession, inventory or movement',()=>{
 const j=make();assert.equal(j.start(''),false);assert.equal(j.started,false);assert(j.start('1234567890','法师'));const before=j.snapshot();for(const name of ['', '12345678901']){assert.equal(j.start(name,'战士'),false);assert.deepEqual(j.snapshot(),before);}
 j.reward.bag[0]=null;j.input.right=true;j.step();assert(j.start('新战士','战士'));assert.equal(j.actor.action,'idle');assert.equal(j.reward.bag[0].type,'富豪礼包');assert.equal(j.input.right,false);assert.equal(j.vitals.maxLife,90);
});
test('mage movement clocks at source ticks across render schedules, mirrors without resetting, and exposes the verified eleven-frame cast',()=>{
 for(const hz of [15,30,60,144]){const a=new Actor(manifests.法师);a.select('run');for(let i=0;i<hz*2;i++)a.advance(1000/hz);assert.equal(a.tick,30);assert.equal(a.frame,1);a.advance(3*1000/15);a.select('run','right');assert.equal(a.frame,4);a.paused=true;a.advance(10000);assert.equal(a.frame,4);a.paused=false;a.advance(1000/15);assert.equal(a.frame,5);a.select('idle');assert.equal(a.frame,1);assert.deepEqual(a.events,[]);assert.equal(a.select('attack'),true);a.advance(11*1000/15);assert.equal(a.events.at(-1).type,'effect-requested');}
 const bad=structuredClone(manifests.法师);bad.actions.attack=manifests.战士.actions.attack;assert.throws(()=>validateManifest(bad));
});
test('source credit setter raises title to ten; source role init contributes twenty title fire on attribute refresh',()=>{
 const s=read('__Packages/RoleMC.as'),role={titleLevel:0,maxRredit:500,setSecreteCode:v=>v,getSecreteCode:v=>v};
 Object.defineProperty(role,'xxx_credit',{get:vm.runInNewContext('(function()'+body(s,'function get xxx_credit()')+')')});
 const setter=vm.runInNewContext('(function(val)'+body(s,'function set xxx_credit(val)')+')',{isNaN,Math});
 setter.call(role,500);assert.equal(role.titleLevel,10);assert.equal(role.xxx_credit,500);
 for(const k of ['skillAttack','moreExpAttack','skillDefense','moreExpDefense','moreExpLife','moreExpMp','skillBurst','baseBurst','skillJook','baseJook','godFire','militaryRankFire','chawFire','moreExpFire','skillAddFire'])role[k]=0;
 vm.runInNewContext('(function()'+body(s,'function init()')+')',{isNaN,Math}).call(role);
 const j=make();j.start('玩家');assert.equal(j.reward.titleLevel,role.titleLevel);assert.equal(j.inventory.stats().roleFire,role.attackFire+1);

});
