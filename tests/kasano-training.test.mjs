import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';import {FirstCombatQuest} from '../src/domain/first-combat-quest.ts';import {contentById} from '../src/content/registry.ts';import {refreshEquipmentAttributes} from '../src/domain/equipment-attributes.ts';import {captureSave,savedProgress} from '../src/application/save-game.ts';import {validateProgress} from '../src/application/save-codec.ts';import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';import {functionRange} from '../tools/lib/as2-data.mjs';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8')),map=json('public/assets/first-slice/manifest.json'),actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(profession='战士'){const j=new Journey(map,new Actor(actors[profession]),actors);j.start('后续训练',profession);j.arrive('wildOne','entry2','wildOne');return j;}
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_2210_任务系统/frame_1/DoAction.as','utf8');
test('three-stage source completion, unclaimed predecessor, reverse prize order, both professions and fourth flag',()=>{
 for(const profession of ['战士','法师'])for(const claimEarly of [false,true]){
  const j=make(profession),mainTask=Array.from({length:8},(_,n)=>structuredClone(contentById('quest:mainTask:'+n).data)),base=j.initialState.mainTask.index;mainTask[base].isDoing=true;
  const expected=[],actual=[],role={vocational:profession,levels:1,xxx_ms:0},parent={map:{role},upDataWeapon(item){refreshEquipmentAttributes(item)},backPack:{setThing(item){expected.push(JSON.parse(JSON.stringify(item)))}}};
  const ctx=vm.createContext({mainTask,allTask:[mainTask],_parent:parent,_global:{sysMsg:{addMsg(){}},numberToString:n=>n},showTask(){},taskDetail(){},nowTask:undefined,nowTaskType:0,isNaN});
  for(const [name,args]of [['taskComplete','task'],['nextMainTask',''],['catchThing','thing,num'],['getPrize','']])ctx[name]=vm.runInContext('(function('+args+')'+functionRange(source,'this.'+name+' =').text+')',ctx);
  j.reward.ms=0;j.reward.store=item=>actual.push(structuredClone(item));const q=j.training;
  const claim=stage=>{ctx.nowTask=mainTask[base+stage*2];ctx.getPrize();assert(q.claim({x:0,y:0},()=>true));assert.equal(j.reward.ms,role.xxx_ms);assert.deepEqual(actual,expected);};
  for(const [stage,name,count]of [[0,'鹿角兽',6],[1,'鹿角兽精英',4],[2,'龙怪',6]]){
   for(const event of ['怪物',...Array(count+1).fill(name)]){assert.equal(q.catchThing(event,1,1),Boolean(ctx.catchThing(event,1)));const modern=stage===0?{...j.initialState.mainTask,number:j.firstQuest.number}:q.later[stage-1],old=mainTask[base+stage*2];assert.equal(modern.number,old.need[0].number);assert.equal(modern.isComplete,old.isComplete);assert.equal(modern.isDoing,old.isDoing);}
   if(claimEarly)claim(stage);
  }
  assert.equal(j.firstQuest.fourthActive,mainTask[6].isDoing);assert(j.firstQuest.fourthActive);
  if(!claimEarly)for(let stage=0;stage<3;stage++)claim(stage);
  assert.equal(q.claim({x:0,y:0},()=>true),false);assert.equal(j.reward.ms,600);
 }
});
test('live regional owner: correct dragon rewards, dangerous travel, invalidated hits, pause and boss restore',()=>{
 for(const profession of ['战士','法师']){const j=make(profession);j.training.catchThing('鹿角兽',6,1);j.arrive('wildTwo','entry2','wildTwo');assert.equal(j.combat.monsters.length,4);j.vitals.life=1;const old=j.combat;
  j.arrive('wildThree','entry2','wildThree');assert.equal(j.vitals.life,1);assert.equal(j.combat.monsters.length,6);assert(!j.combat.snapshot().boss);assert.equal(old.attack(),false);assert.equal(old.spawnBoss(),false);
  j.combat.kill(j.combat.monsters[0]);assert.equal(j.combatLedger.kills.龙怪,1);assert.equal(j.combatLedger.kills.龙怪头目,undefined);assert.equal(j.combatLedger.bossLevel,1);
  const p=j.progress(),loaded=make(profession);validateProgress(p);loaded.restore(savedProgress(captureSave(p)));assert.equal(loaded.combat.monsters[0].life,0);assert.equal(loaded.combat.monsters[1].maxLife,255);
  for(const m of loaded.combat.monsters)Object.assign(m,{life:0,alive:false});loaded.combat.warningTicks=75;loaded.paused=true;loaded.advance(10000);assert.equal(loaded.combat.warningTicks,75);loaded.paused=false;assert(loaded.combat.spawnBoss());assert.equal(loaded.combat.monsters[0].name,'龙怪头目');assert(loaded.combat.snapshot().boss);validateProgress(loaded.progress());
  assert(loaded.arrive('wildFour','entry2','wildFour'));loaded.x=42;loaded.y=411.6;assert.equal(loaded.activate('entry1'),false);assert.match(loaded.notice,/龙怪头目行踪/);loaded.vitals.life=0;assert(loaded.reviveCombat());assert.equal(loaded.map,'citySecond');assert(loaded.vitals.life>0);
 }
});
test('regional codecs, 064 legacy partial flag migration, all stage raw flags and strict malformed rejection',()=>{
 const j=make();j.training.catchThing('鹿角兽',6,1);j.arrive('wildTwo','entry2','wildTwo');j.training.catchThing('鹿角兽精英',2,1);let state=captureSave(j.progress());assert.equal(savedProgress(state).firstQuest.later[0].number,2);j.training.catchThing('鹿角兽精英',2,1);j.training.catchThing('龙怪',6,1);while(j.training.claimable>=0)j.claimFirstQuest();state=captureSave(j.progress(),state);const raw=restorePreservedValue(state.source);assert.equal(raw.mainTask2isComplete,true);assert.equal(raw.mainTask2isDoing,false);assert.equal(raw.mainTask4isComplete,true);assert.equal(raw.mainTask6isDoing,true);
 const p=j.progress();for(const alter of [p=>p.combat.monsters.push(p.combat.monsters[0]),p=>p.combat.level=5,p=>p.combat.monsters[0].life=613,p=>p.firstQuest.later[0].number=3,p=>p.firstQuest.secondActive=true]){const bad=structuredClone(p);alter(bad);assert.throws(()=>validateProgress(bad));}
 const legacy=make();legacy.training.catchThing('鹿角兽',6,1);const old=captureSave(legacy.progress()),e=restorePreservedValue(old.extensions);delete e.game.firstQuest.later;delete e.game.firstQuest.fourthActive;old.extensions=preserveValue(e);const migrated=savedProgress(old);assert.equal(migrated.firstQuest.later[0].number,0);assert.equal(migrated.firstQuest.later[0].isDoing,true);const badRaw=restorePreservedValue(old.source);badRaw.mainTask4isDoing='unknown';old.source=preserveValue(badRaw);assert.throws(()=>savedProgress(old));
});
