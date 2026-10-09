import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {finalizePersistenceFields,restorationMatrix,persistenceHandoffCoverage} from '../tools/lib/persistence-schema-review.mjs';
import {persistenceCompletionIssues,acceptedPersistenceAnomaly} from '../tools/lib/persistence-completion.mjs';
import {referenceCompletionIssues} from '../tools/lib/reference-completion.mjs';
import {PERSISTENCE_REPAIRS} from '../src/content/persistence-repairs.ts';
import {persistentState,legacyPetSeed,LEGACY_PET_FIELDS} from '../src/content/persistence-schema.ts';
import {persistenceFields} from '../src/content/persistence-registry-data.ts';
import {petInitializationOracle} from '../tools/lib/pet-initialization-oracle.mjs';
import {ITEM_PETS} from '../src/content/item-pets.ts';
const dir='docs/reverse-engineering/content-registry/';
const root='local-resources/moyu/source-index/as/scripts/';
const read=file=>fs.readFileSync(root+file,'utf8');
const schema=JSON.parse(fs.readFileSync(dir+'persistence-survey.json','utf8'));
const matrix=JSON.parse(fs.readFileSync(dir+'restore-matrix.json','utf8'));
const source=read('frame_9/DoAction_2.as');

test('927 handoff IDs have field-level mapping or explicit transient/derived disposition',()=>{
 const handoff=JSON.parse(fs.readFileSync(dir+'pet-world-coverage.json','utf8')).records;
 const coverage=JSON.parse(fs.readFileSync(dir+'persistence-coverage.json','utf8'));
 assert.deepEqual(persistenceHandoffCoverage(schema.fields,handoff),coverage);
 assert.equal(coverage.records.length,927);
 assert.equal(coverage.records.filter(r=>r.disposition==='field-semantics').length,840);
 const missing=handoff.filter(r=>r.id!==coverage.records[0].id);
 assert.throws(()=>persistenceHandoffCoverage(schema.fields,missing),/set changed/);
 const wrong=structuredClone(handoff);const r=wrong.find(r=>r.group==='persistence-handoff'&&r.target==='i');r.target='newUnreviewedState';
 assert.throws(()=>persistenceHandoffCoverage(schema.fields,wrong),/Unreviewed/);
});

test('formal restore statements and phase assignments match source independently; drift is rejected',()=>{
 assert.deepEqual(finalizePersistenceFields(structuredClone(schema.fields)),schema.fields);
 assert.deepEqual(restorationMatrix(schema.fields),matrix);
 assert.equal(matrix.sourceRestoreBody,functionRange(source,'readGame = function()').text);
 const phases={root:'metadata',timedate:'metadata','map.role':'role','huanShou.allHuanShou':'pets',backPack:'items',fastKey:'items',wareHouse:'items',equipment:'items','huanShouItem.bell':'items',makeBell:'items',make:'items',splitStone:'items',castleStone:'items','mainCastle.building':'buildings-shops',huanShouShop:'buildings-shops',shop:'buildings-shops',drugShop:'buildings-shops',bookShop:'buildings-shops',castleHuanShouShop:'buildings-shops','map.npcState':'npcs','task.mainTask':'quests','task.branchTask':'quests','task.dareTask':'quests','task.dailyTask':'quests',roleSkills:'skills',friend:'friends',map:'world',XPPower:'xp-title-pk',allTitle:'xp-title-pk',huanShou:'role',_root:'metadata'};
 for(const field of persistenceFields){
  const original=schema.fields.find(f=>JSON.stringify(f.key)===JSON.stringify(field.key));
  assert.deepEqual(field.restorePlan,original.restorePlan);assert.deepEqual(field.finalInitialization,original.finalInitialization);
  assert.deepEqual(field.postRestoreEffects,original.postRestoreEffects);assert.deepEqual(field.savePlan,original.save);
  for(const step of field.restorePlan){
   let phase=phases[field.owner];
   if(field.property==='_x'||field.property==='_y')phase='world';
   if(typeof field.key==='string'&&field.key.startsWith('winpk'))phase='xp-title-pk';
   if(field.key==='versions')phase=step.source.line>2100?'legacy-migration':'metadata';
   assert.equal(step.phase,phase,field.id+' at '+step.source.line);
   assert.ok(source.split(/\r?\n/)[step.source.line-1].includes('moyu_so'),'source access missing');
  }
 }
 assert.deepEqual(matrix.nonRestored.map(r=>r.key),['saved','saveTime','backPack_number','fastKey_number','wareHouse_number','npcState_length']);
});

test('source pet write set feeds repaired constructor without reproducing duplicate-key evaluation',()=>{
 const save=functionRange(source,'saveGame = function(fileName)').text;
 const properties=[...save.matchAll(/moyu_so\.data\["allHuanShou" \+ i \+ "([^"]+)"\] =/g)].map(m=>m[1]);
 assert.deepEqual([...LEGACY_PET_FIELDS],properties);
 const restore=functionRange(source,'readGame = function()').text;
 assert.equal([...restore.matchAll(/nextLvRate\s*:/g)].length,3);
 const create=petInitializationOracle(read('__Packages/HuanShouClass.as'),read('__Packages/SecreteCode.as'),2);
 for(const supplied of [{nextLvRate:0,sd:2,qyg:200},{nextLvRate:1.4,sd:0,qyg:0}]){
  const seed={...Object.values(ITEM_PETS)[0],...supplied,rareFen:9999};
  const flat=Object.fromEntries(Object.entries(seed).map(([k,v])=>['allHuanShou0'+k,v]));
  const actual=create(legacyPetSeed(persistentState(flat),0));
  assert.equal(actual.nextLvRate,supplied.nextLvRate);assert.equal(actual.sd,supplied.sd);assert.equal(actual.qyg,supplied.qyg);
  assert.equal(actual.rareFen,9999);assert.equal(actual.life,actual.maxLife);
 }
});

test('source restore final equipment recalculation overwrites saved maxima but not current life',()=>{
 const roleSource=read('__Packages/RoleMC.as'),codec=read('__Packages/SecreteCodeMC.as');
 const c=vm.createContext({isNaN,trace(){},SecreteCodeMC:{BASE:123456}});
 const compile=(s,m,args='')=>vm.runInContext('(function('+args+')'+functionRange(s,m).text+')',c);
 const x={SECRETECODE:-3,changeHpMp(){}};
 x.getSecreteCode=compile(codec,'function getSecreteCode(val)','val');x.setSecreteCode=compile(codec,'function setSecreteCode(val)','val');
 for(const p of ['life','xxx_maxLife','maxLife','lifeSourseLevels','maxLifeSourse','lifeSourse'])Object.defineProperty(x,p,{get:compile(roleSource,`function get ${p}()`),set:compile(roleSource,`function set ${p}(val)`,'val')});
 const lines=functionRange(source,'readGame = function()').text.split(/\r?\n/).filter(l=>/^\s*this\.map\.role\.(lifeSourseLevels|maxLifeSourse|lifeSourse|xxx_maxLife|life) =/.test(l));
 const saved={role_lifeSourseLevels:2,role_maxLifeSourse:999,role_lifeSourse:500,role_maxLife:100,role_life:90};
 vm.runInNewContext('(function(){'+lines.join('\n')+'}).call(target)',{target:{map:{role:x}},moyu_so:{data:saved}});
 assert.deepEqual([x.maxLife,x.life,x.maxLifeSourse,x.lifeSourse],[100,90,200,500]);
 const equipmentSource=read('frame_9/DoAction.as');
 assert.match(functionRange(equipmentSource,'this.equipment.flashAttribute = function()').text,/this\.role\.flashAttribute\(\)/);
 const final=functionRange(source,'readGame = function()').text;
 assert.ok(final.lastIndexOf('this.equipment.flashAttribute();')>final.lastIndexOf('moyu_so.data.role_life'));
 // Execute the actual maximum setter called by flashAttribute; stored current values stay unchanged.
 x.xxx_maxLife=80;
 assert.deepEqual([x.maxLife,x.life,x.maxLifeSourse,x.lifeSourse],[80,90,160,500]);
});

test('source daily active conditions, coordinate fallback and initialization tail remain explicit',()=>{
 const body=functionRange(source,'readGame = function()').text;
 const coord=body.slice(body.indexOf('if(moyu_so.data.role_x'),body.indexOf('this.map.tempTaskPlace'));
 for(const [data,expected] of [[{role_x:0,role_y:0},{_x:0,_y:0,nextEntry:undefined}],[{role_x:0},{_x:9,_y:8,nextEntry:'entry1'}]]){
  const map={role:{_x:9,_y:8},nextEntry:'old'};vm.runInNewContext('(function(){'+coord+'}).call(target)',{target:{map},moyu_so:{data}});
  assert.deepEqual({...map.role,nextEntry:map.nextEntry},expected);
 }
 const daily=body.slice(body.indexOf('i = 0;',body.indexOf('this.task.dareTask[i].isDoing')),body.indexOf('i = 0;',body.indexOf('this.roleSkills.allSkills')));
 assert.ok(daily.includes('this.task.dailyTask[i].isDoing == true'));
 const runDaily=body.slice(body.lastIndexOf('i = 0;',body.indexOf('while(i < this.task.dailyTask.length')),body.indexOf('i = 0;',body.indexOf('this.task.dailyTask[i].explain')));
 const task={dailyTask:[{name:'美丽的紫水晶',need:[{name:'keep',number:1}]},{name:'好友委托',need:[{name:'old'}]},{name:'inactive',need:[{name:'unchanged'}]}]};
 const data={dailyTask0isDoing:true,dailyTask0need_number:0,dailyTask1isDoing:true,dailyTask1need_length:1,dailyTask1need0name:'未知目标',dailyTask1need0number:0,dailyTask1need0needNumber:5,dailyTask1explain:'委托',dailyTask2isDoing:false};
 vm.runInNewContext('(function(){'+runDaily+'}).call(target)',{target:{task},moyu_so:{data}});
 assert.equal(task.dailyTask[0].need[0].name,'keep');assert.equal(task.dailyTask[0].need[0].number,0);
 assert.equal(task.dailyTask[1].need[0].name,'未知目标');assert.equal(task.dailyTask[1].explain,'委托');assert.equal(task.dailyTask[2].need[0].name,'unchanged');
 const start=read('DefineSprite_4536/frame_2/DoAction.as');
 assert.ok(start.indexOf('_parent.initData();')<start.indexOf('_parent.readGame();'));
 assert.ok(start.indexOf('debug();')>start.indexOf('this.gotoAndStop(this.nextMap);'));
});

test('anomaly acceptance requires complete semantics and distinct raw inputs; labels cannot bypass it',()=>{
 assert.deepEqual(persistenceCompletionIssues(schema,PERSISTENCE_REPAIRS),[]);
 const audit=JSON.parse(fs.readFileSync(dir+'reference-audit.json','utf8'));
 assert.deepEqual(referenceCompletionIssues(audit,a=>acceptedPersistenceAnomaly(a,schema,PERSISTENCE_REPAIRS)),[]);
 const wrong=structuredClone(PERSISTENCE_REPAIRS);wrong.petConstructor.mapping.sd='nextLvRate';
 assert.ok(persistenceCompletionIssues(schema,wrong).length);
 assert.ok(referenceCompletionIssues(audit,a=>acceptedPersistenceAnomaly(a,schema,wrong)).length);
 const incomplete=structuredClone(schema);delete incomplete.fields[0].finalInitialization;
 assert.ok(persistenceCompletionIssues(incomplete,PERSISTENCE_REPAIRS).length);
 const missing=structuredClone(schema);missing.fields.pop();assert.ok(persistenceCompletionIssues(missing,PERSISTENCE_REPAIRS).length);
 const unknown=structuredClone(audit.anomalies[0]);unknown.source.line++;
 assert.equal(acceptedPersistenceAnomaly(unknown,schema,PERSISTENCE_REPAIRS),false);
});

test('actual addSkill restore side effects distinguish explicit zero, missing level and later XP overwrite',()=>{
 const text=read('frame_9/DoAction.as');
 const context=vm.createContext({isNaN});
 const compile=(marker,args)=>vm.runInContext('(function('+args+')'+functionRange(text,marker).text+')',context);
 const role={rateLife:15,skillLife:999,flashAttribute(){this.refreshes=(this.refreshes??0)+1;}};
 const skills={allSkills:[{name:'强健之术',levels:0,maxLevels:10},{name:'怒',levels:0,maxLevels:1}],studiedSkills:0,role,_parent:{XPPower:{isUsed:false}},afterAdd(){this.sorted=(this.sorted??0)+1;}};
 skills.addSkill=compile('this.roleSkills.addSkill = function(skillName, reLv)','skillName,reLv');
 skills.effect=compile('this.roleSkills.effect = function(skillName, levels)','skillName,levels');
 assert.equal(skills.addSkill('强健之术',0),true);assert.equal(role.skillLife,0);assert.equal(skills.allSkills[0].studied,true);assert.equal(role.refreshes,1);
 assert.equal(skills.addSkill('强健之术',undefined),true);assert.equal(role.skillLife,150);
 assert.equal(skills.addSkill('怒',1),true);assert.equal(skills._parent.XPPower.isUsed,true);
 assert.equal(skills.addSkill('怒',0),false);assert.equal(skills.allSkills[1].levels,1);
 assert.equal(skills.addSkill('未实现技能',9),false);
 const body=functionRange(source,'readGame = function()').text;
 assert.ok(body.indexOf('this.XPPower.isUsed =')>body.indexOf('this.roleSkills.addSkill('));
});

test('actual friend reconstruction rejects duplicate/capacity and applies zero-increment relation callback',()=>{
 const text=read('DefineSprite_2381_朋友/frame_1/DoAction.as');
 const context=vm.createContext({_global:{sysMsg:{addMsg(){}}}});
 const compile=(marker,args)=>vm.runInContext('(function('+args+')'+functionRange(text,marker).text+')',context);
 const friends={allFriends:[],friendNumber:0,maxFriendNumber:1,relationLevel:[0,10,200,500,1000,2000],page:{setPage(){}},upData(){},setRelationName:compile('this.setRelationName = function(npc)','npc')};
 friends.addRelation=compile('this.addRelation = function(npc, val)','npc,val');
 context.setRelationName=friends.setRelationName;
 friends.showFriends=()=>{};
 friends.addFriend=compile('this.addFriend = function(NPC)','NPC');
 const npc={levels:0,relation:0,maxRelation:0};
 assert.equal(friends.addFriend(npc),true);assert.equal(npc.levels,1);assert.equal(npc.relationName,'认识');
 assert.equal(friends.addFriend(npc),false);assert.equal(friends.addFriend({levels:0,relation:0}),false);
 assert.equal(friends.allFriends.length,1);
});
