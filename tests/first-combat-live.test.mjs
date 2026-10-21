import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';
import {FirstCombat} from '../src/domain/first-combat.ts';import {partyIncomingHit} from '../src/domain/party-incoming-hit.ts';
import {captureSave,savedProgress} from '../src/application/save-game.ts';import {validateProgress} from '../src/application/save-codec.ts';
import {pickUp} from '../src/domain/ground-items.ts';
import {FirstCombatQuest} from '../src/domain/first-combat-quest.ts';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
import vm from 'node:vm';import {functionRange} from '../tools/lib/as2-data.mjs';import {contentById} from '../src/content/registry.ts';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8')),map=json('public/assets/first-slice/manifest.json'),actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(profession='战士'){const j=new Journey(map,new Actor(actors[profession]),actors);j.start('首战',profession);assert(j.arrive('wildOne','entry2','wildOne'));return j;}
test('both professions deliver one hit after source marker, award once, save resolved deaths and reopen fresh map',()=>{
 for(const profession of ['战士','法师']){
  const j=make(profession);j.x=430;j.y=320;j.actor.facing='right';
  // Deterministic draw: no dodge, no pause, no ordinary drops except final boss.
  j.combat.close();j.combat=new FirstCombat({inventory:j.inventory,pets:j.petProgression,position:()=>({x:j.x,y:j.y,facing:j.actor.facing}),contains:(x,y)=>j.groundContains(x,y),notice:t=>j.notice=t},j.combatLedger,n=>Math.max(0,Math.trunc(n)-1));
  for(const p of [...j.petProgression.slots])if(p)j.petProgression.toggle(p);
  const target=j.combat.monsters[4];target.life=1;target.x=470;target.y=320;for(const m of j.combat.monsters)m.stopTime=1000;
  assert(j.attack(target.id));for(let n=0;n<10;n++)j.step();assert(target.alive);assert.equal(target.life,1);j.step();assert.equal(target.alive,false);assert.equal(j.combatLedger.kills.鹿角兽,1);
  const exp=j.vitals.exp;j.step();assert.equal(j.vitals.exp,exp);const save=captureSave(j.progress());const restored=new Journey(map,new Actor(actors[profession]),actors);restored.restore(savedProgress(save));assert.equal(restored.combat.monsters[4].alive,false);assert.equal(restored.combatLedger.kills.鹿角兽,1);assert.equal(restored.actor.action,'idle');
  assert(restored.arrive('outskirts','entry1','outskirts'));assert.equal(restored.combat,undefined);const safe=captureSave(restored.progress(),save);assert.equal(savedProgress(safe).combat,undefined);assert(restored.arrive('wildOne','entry2','wildOne'));assert.equal(restored.combat.monsters.filter(m=>m.alive).length,6);
 }
});
test('live reflection observes synchronous level healing before elemental damage and new max life',()=>{
 let life=20,maxLife=20;const order=[],stats={attackFire:0,defense:0,jook:0,burst:0,reduceDamage:0,wind:0,fire:0,water:0,soil:0};
 const hit=partyIncomingHit({alive:true,attack:10,role:stats,from:{...stats,wind:3,fire:4},life:99,maxLife:99,fly:false,nonDefense:false,slots:[{id:'pet1',life,maxLife,open:true,merged:true,bellSkill:1}]},()=>0,{readLife:()=>life,writeLife:v=>{life=Math.max(0,Math.min(maxLife,v));order.push(life);},effect:()=>{maxLife=100;life=100;order.push('level-up');}});
 assert.deepEqual(order,[10,'level-up',97,93]);assert.equal(hit.life,93);
});
test('save rejects inconsistent wave and reward ledgers; cancel pending action on restore',()=>{
 const j=make();j.attack();const p=j.progress();assert.equal(p.combat.monsters.length,6);validateProgress(p);const restored=make();restored.restore(p);assert.equal(restored.combat.role.motion,'idle');
 for(const alter of [p=>p.combat.monsters.pop(),p=>p.combat.monsters[0].life=52,p=>p.combat.warningTicks=3,p=>p.combatLedger.nowExp=18,p=>p.map='city']){const bad=structuredClone(p);alter(bad);assert.throws(()=>validateProgress(bad));}
});
test('six kills, full bag, complete ground factory branch, warning, boss and stale callbacks',()=>{
 const j=make();j.x=300;j.y=300;j.actor.facing='left';for(const p of [...j.petProgression.slots])if(p)j.petProgression.toggle(p);
 let c;const random=n=>n===100?99:n===10000?(c?.monsters.every(m=>!m.alive)?9999:0):Math.max(0,Math.trunc(n)-1);
 j.combat.close();j.combat=c=new FirstCombat({inventory:j.inventory,pets:j.petProgression,position:()=>({x:j.x,y:j.y,facing:j.actor.facing}),contains:()=>true,notice:t=>j.notice=t},j.combatLedger,random,()=>0);
 for(const m of c.monsters){m.x=250;m.y=300;m.life=1;m.stopTime=10000;}
 j.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));
 for(let n=0;n<6;n++){assert(j.attack());for(let f=0;f<11;f++)j.step();}
 assert.equal(c.monsters.filter(m=>m.alive).length,0);assert.equal(j.combatLedger.kills.鹿角兽,6);assert(j.reward.drops.length>0);const first=j.reward.drops[0];assert.equal(pickUp(j.reward,first),false);assert(j.reward.drops.includes(first));j.reward.bag[0]=null;assert(pickUp(j.reward,first));assert(!j.reward.drops.includes(first));
 assert(c.warningTicks>0);const restored=make();restored.restore(savedProgress(captureSave(j.progress())));assert.equal(restored.combat.warningTicks,c.warningTicks);assert(restored.combat.spawnBoss());assert.equal(restored.combat.monsters[0].species,'龙怪');
 assert(c.spawnBoss());c.monsters[0].x=250;c.monsters[0].y=300;c.monsters[0].life=1;c.monsters[0].stopTime=10000;const credit=j.reward.credit;assert(j.attack());for(let f=0;f<11;f++)j.step();assert.equal(j.combatLedger.kills.龙怪头目,1);assert.equal(j.reward.credit,credit+1);assert.equal(j.combatLedger.bossLevel,5);assert(j.reward.drops.some(d=>d.item.type==='勇士勋章'));
 assert(j.arrive('outskirts','entry1','outskirts'));const before=j.progress();c.step();c.spawnBoss();assert.deepEqual(j.progress(),before);
});
test('merged receiver takes all damage, role death saves, pause freezes and revival uses city backPoint',()=>{
 const j=make();j.x=300;j.y=300;j.reward.titleLevel=0;j.vitals.life=1;const p=j.petProgression.slots[0];p.life=1;p.inOne=true;
 j.combat.close();j.combat=new FirstCombat({inventory:j.inventory,pets:j.petProgression,position:()=>({x:j.x,y:j.y,facing:j.actor.facing}),contains:()=>true,notice:t=>j.notice=t},j.combatLedger,n=>Math.max(0,Math.trunc(n)-1));
 const m=j.combat.monsters[0];Object.assign(m,{x:300,y:300,target:'role',motion:'finished',effect:'attack',minAttack:10000,maxAttack:10000});j.combat.monsters.slice(1).forEach(m=>m.stopTime=10000);j.step();assert.equal(p.life,0);assert.equal(p.inOne,false);assert.equal(j.vitals.life,1);
 Object.assign(m,{target:'role',motion:'finished',effect:'attack'});j.step();assert.equal(j.vitals.life,0);assert.equal(j.reward.credit,499);assert.equal(j.activate(),false);
 const dead=j.progress(),restored=make();restored.restore(savedProgress(captureSave(dead)));assert(restored.combat.dead);restored.paused=true;const tick=restored.tick;restored.advance(5000);assert.equal(restored.tick,tick);restored.paused=false;assert(restored.reviveCombat());assert.equal(restored.map,'citySecond');assert.equal(restored.x,300.4);assert.equal(restored.y,352.65);assert.equal(restored.vitals.life,restored.vitals.maxLife);assert.equal(restored.combat,undefined);assert.equal(restored.cityVisit.mirageGranted,true);
});
test('initial quest counts six only, unlocks second and rewards once in source reverse order through full bag',()=>{
 for(const profession of ['战士','法师']){const j=make(profession),quest=new FirstCombatQuest(j.firstQuest,j.initialState.mainTask,j.reward);assert.equal(quest.catchThing('怪物',1,1),false);for(let n=0;n<5;n++)assert(quest.catchThing('鹿角兽',1,1));assert.equal(j.claimFirstQuest(),false);assert(quest.catchThing('鹿角兽',1,1));assert.equal(quest.catchThing('鹿角兽',1,1),false);assert(j.firstQuest.secondActive);assert(j.initialState.mainTask.isComplete);
  j.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));j.reward.ms=0;const ms=j.reward.ms;assert(j.claimFirstQuest());assert.equal(j.reward.ms,ms+100);assert.deepEqual(j.reward.drops.map(d=>d.item.type),['衣服','武器']);assert(j.reward.drops.every(d=>d.item.vocational===profession));assert.equal(j.claimFirstQuest(),false);
  const loaded=make(profession);loaded.restore(savedProgress(captureSave(j.progress())));assert.equal(loaded.claimFirstQuest(),false);assert.equal(loaded.firstQuest.number,6);
 }
});
test('legacy combat progress is promoted without resetting boss or XP energy; first quest partial count is a design extension',()=>{
 const j=make();j.arrive('outskirts','entry1','outskirts');const state=captureSave(j.progress()),raw=restorePreservedValue(state.source),extensions=restorePreservedValue(state.extensions);delete extensions.game.combatLedger;delete extensions.game.firstQuest;
 Object.assign(raw,{bossLevels0levels:25,bossLevels0moreFire:5,role_overflowExp:123,XPPower_nowPower:2,XPPower_nowExp:11});state.source=preserveValue(raw);state.extensions=preserveValue(extensions);
 const p=savedProgress(state);assert.deepEqual(p.combatLedger,{bossLevel:25,bossMoreFire:5,overflowExp:123,nowPower:2,nowExp:11,kills:{}});assert.deepEqual(p.firstQuest,{number:0,secondActive:false});
});
test('first quest consumer matches original catchThing, taskComplete and nextMainTask for both professions',()=>{
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_2210_任务系统/frame_1/DoAction.as','utf8');
 for(const profession of ['战士','法师']){const j=make(profession),mainTask=Array.from({length:6},(_,n)=>structuredClone(contentById('quest:mainTask:'+n).data));mainTask[j.initialState.mainTask.index].isDoing=true;
  const ctx=vm.createContext({mainTask,allTask:[mainTask],_parent:{map:{role:{vocational:profession,levels:1}}},_global:{sysMsg:{addMsg(){}}},showTask(){},taskDetail(){},nowTask:undefined,nowTaskType:0,isNaN});
  for(const [name,args]of [['taskComplete','task'],['nextMainTask',''],['catchThing','thing,num']])ctx[name]=vm.runInContext('(function('+args+')'+functionRange(source,'this.'+name+' =').text+')',ctx);
  const modern=new FirstCombatQuest(j.firstQuest,j.initialState.mainTask,j.reward);
  for(const name of ['怪物',...Array(8).fill('鹿角兽')]){assert.equal(modern.catchThing(name,1,1),Boolean(ctx.catchThing(name,1)));const q=mainTask[j.initialState.mainTask.index];assert.equal(j.firstQuest.number,q.need[0].number);assert.equal(j.initialState.mainTask.isComplete,q.isComplete);assert.equal(j.firstQuest.secondActive,mainTask[j.initialState.mainTask.index+2].isDoing);}
 }
});
test('owned outskirts property grants source twenty resources per XP; equipment spirit refresh precedes experience',()=>{
 const j=make();j.property.owned=true;j.reward.res=0;j.x=430;j.y=320;j.actor.facing='right';for(const p of [...j.petProgression.slots])if(p)j.petProgression.toggle(p);
 j.inventory.equipment.衣服={type:'衣服',name:'旅者装',vocational:'法师',levels:1,grade:1,mhdj:3,defense:2,mDefense:1};
 j.inventory.equipment.武器={type:'武器',name:'长军刀',vocational:'战士',levels:1,grade:1,mhdj:0,minAttack:100,maxAttack:100,spirit:1,spiritVal:1,spiritLevels:0,spiritExp:9};j.inventory.refresh();
 j.combat.random=n=>Math.max(0,Math.trunc(n)-1);const m=j.combat.monsters[4];m.life=1;for(const e of j.combat.monsters)e.stopTime=1000;
 assert(j.attack(m.id));for(let n=0;n<11;n++)j.step();assert.equal(m.alive,false);assert.equal(j.reward.res,360);assert.equal(j.inventory.equipment.武器.spiritLevels,1);assert.equal(j.inventory.equipment.武器.spiritExp,0);assert.equal(j.firstQuest.number,1);assert.equal(j.inventory.equipment.衣服.spiritExp,undefined);validateProgress(j.progress());
});
