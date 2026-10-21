import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';
import {Inventory} from '../src/domain/inventory.ts';import {NpcReward,rewardEquipment,newRing} from '../src/domain/npc-reward.ts';import {initialCharacterVitals} from '../src/domain/hud.ts';import {contentOfKind,literalItem} from '../src/content/registry.ts';import {SKILLS,skillFields} from '../src/domain/character-skills.ts';import {CHARACTERS} from '../src/content/character-entry.ts';import {experienceOracle} from './source-experience-oracle.mjs';
import {Actor} from '../src/domain/actor.ts';import {Journey} from '../src/domain/journey.ts';import {captureSave,savedProgress} from '../src/application/save-game.ts';import {encodeSave,decodeSave} from '../src/application/save-codec.ts';import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
const data=JSON.parse(fs.readFileSync('docs/reverse-engineering/character-skills/source-functions.json'));
const make=(profession='战士')=>new Inventory(new NpcReward('玩家',()=>0,profession),initialCharacterVitals(profession,'玩家'));
function oracle(inv){const base=experienceOracle(inv.vitals,[],inv.equipment,inv.bravery,CHARACTERS[inv.reward.profession].rates,inv.reward.titleLevel),role=base.role;Object.assign(role,inv.consumables);role.vocational=inv.reward.profession;
 const root={map:{role},XPPower:{isUsed:inv.xpEnabled},backPack:{},fastKey:{}},context=vm.createContext({_global:{msg:{open(){}},sysMsg:{addMsg(){}}},isNaN});const fn=(body,args)=>vm.runInContext('(function('+args+')'+body+')',context);
 const skills={allSkills:data.skills.map(s=>({...s,levels:inv.skills[s.name]??0,studied:(inv.skills[s.name]??0)>0})),studiedSkills:Object.values(inv.skills).filter(n=>n>0).length,role,_parent:root,afterAdd(){},effect:fn(data.functions.effect,'skillName,levels'),addSkill:fn(data.functions.addSkill,'skillName,reLv')};root.roleSkills=skills;
 return {role,root,skills,use(item){const target={...item,hitTest(){return true;},setThing(value){this.type=value.type;}};const result=fn(data.functions.useItem,'item').call(root,target);return {result,cleared:target.type==='空格'};}};
}
test('all 21 skills and books match independent frozen source enumeration and hashes',()=>{
 for(const h of data.hashes)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(h.path)).digest('hex'),h.sha256);
 assert.equal(data.skills.length,21);assert.equal(data.books.length,21);assert.equal(new Set(data.books.map(x=>x.name)).size,21);
 assert.deepEqual(contentOfKind('item').filter(x=>x.data.type==='技能书').map(x=>x.data).sort((a,b)=>a.name.localeCompare(b.name)),data.books.sort((a,b)=>a.name.localeCompare(b.name)));
 for(const s of SKILLS){const expected=data.skills.find(x=>x.name===s.name);assert.equal(s.maxLevel,expected.maxLevels);assert.equal(s.description,expected.description);assert.equal(s.active,expected.canUse);}
});
test('every book, both professions, exact level gate, caps, dead role and whole-slot consumption against root+addSkill oracle',()=>{
 for(const profession of ['战士','法师'])for(const book of data.books)for(const count of [0,1,7])for(const boundary of ['below','exact','cap']){
  const inv=make(profession),skill=data.skills.find(s=>s.name===book.name);inv.vitals.level=boundary==='below'?Math.max(0,book.levels-1):book.levels;inv.vitals.life=0;if(boundary==='cap')inv.skills[book.name]=skill.maxLevels;
  const item={...book,number:count};inv.reward.bag[0]=item;const o=oracle(inv),expected=o.use(item),actual=inv.use(0,item);assert.equal(actual,expected.cleared,`${profession}/${book.name}/${boundary}`);assert.equal(inv.skills[book.name]??0,o.skills.allSkills.find(s=>s.name===book.name).levels);assert.equal(inv.xpEnabled,o.root.XPPower.isUsed);assert.equal(inv.vitals.life,0);assert.equal(inv.reward.bag[0]===null,expected.cleared);if(expected.cleared)assert.equal(inv.use(0,item),false);
 }
});
test('all nine passive effects with two professions, equipment/ring/bravery and permanent bonuses match frozen effect and RoleMC',()=>{
 for(const profession of ['战士','法师'])for(const mask of [0,31])for(const level of [1,10]){
  const inv=make(profession);inv.vitals.level=100;inv.vitals.life=1;inv.vitals.mp=1;Object.assign(inv.consumables,{moreExpAttack:8,moreExpDefense:8,moreExpLife:8,moreExpMp:8,moreExpFire:8});if(mask)[...rewardEquipment(profession),newRing(()=>0)].forEach(item=>inv.equipment[item.type]=item);const o=oracle(inv);
  for(const skill of data.skills.filter(s=>!s.canUse)){inv.skills[skill.name]=level;o.skills.effect(skill.name,level);}
  inv.refresh();const fields=skillFields(inv.skills,profession);for(const [key,value]of Object.entries(fields))assert.equal(value,o.role[key],key);for(const key of ['maxLife','maxMp','minAttack','maxAttack','defense'])assert.equal(inv.stats()[key],o.role[key]);assert.equal(inv.stats().roleFire,o.role.attackFire);assert.equal(inv.vitals.life,1);assert.equal(inv.vitals.mp,1);
 }
});
test('XP first learning only enables state, capacity/progress independent; capped book retained',()=>{
 for(const [profession,name]of [['战士','震'],['法师','怒']]){const inv=make(profession);inv.consumables.maxPower=6;inv.consumables.isFull=true;const item=literalItem(name);inv.reward.bag[0]=item;assert(inv.use(0,item));assert(inv.xpEnabled);assert.equal(inv.consumables.maxPower,6);assert.equal(inv.consumables.isFull,true);inv.xpEnabled=false;inv.reward.bag[0]=item;assert.equal(inv.use(0,item),false);assert.equal(inv.xpEnabled,false);assert.equal(inv.reward.bag[0],item);}
});
test('all books repeated through every level to cap retain final rejected book',()=>{
 for(const book of data.books){const inv=make(book.vocational==='法师'?'法师':'战士');inv.vitals.level=100;const o=oracle(inv),cap=data.skills.find(s=>s.name===book.name).maxLevels;for(let n=0;n<=cap;n++){const item={...book,number:3};inv.reward.bag[0]=item;const expected=o.use(item);assert.equal(inv.use(0,item),expected.cleared);assert.equal(inv.skills[book.name]??0,o.skills.allSkills.find(s=>s.name===book.name).levels);}assert(inv.reward.bag[0]);}
});
test('complete skills and source fields survive codec/repeated restore; old sorted source promotes by name without replay',()=>{
 const json=p=>JSON.parse(fs.readFileSync(p)),create=()=>new Journey(json('public/assets/first-slice/manifest.json'),new Actor(json('public/assets/first-actor/manifest.json')));const j=create();j.start('学习');for(const s of data.skills)j.inventory.skills[s.name]=s.maxLevels;j.inventory.xpEnabled=false;j.inventory.consumables.maxPower=6;j.inventory.refresh();j.vitals.life=1;
 j.combatLedger.nowPower=2;j.combatLedger.nowExp=7;let state=captureSave(j.progress()),raw=restorePreservedValue(state.source);raw.XPPower_nowExp=7;raw.XPPower_nowPower=2;raw.futureSkillField={opaque:1};state.source=preserveValue(raw);
 for(let n=0;n<3;n++){const loaded=create();loaded.restore(savedProgress(decodeSave(encodeSave(state))));assert.deepEqual(loaded.progress(),j.progress());state=captureSave(loaded.progress(),state);raw=restorePreservedValue(state.source);assert.equal(raw.XPPower_isUsed,false);assert.equal(raw.XPPower_nowExp,7);assert.equal(raw.role_skillLife,1500);assert.deepEqual(raw.futureSkillField,{opaque:1});}
 const ext=restorePreservedValue(state.extensions);delete ext.game.inventory.skills;delete ext.game.inventory.xpEnabled;state.extensions=preserveValue(ext);const reversed=[...data.skills].reverse();reversed.forEach((s,i)=>{raw['allSkills'+i+'name']=s.name;raw['allSkills'+i+'levels']=s.maxLevels;});state.source=preserveValue(raw);const p=savedProgress(decodeSave(encodeSave(state)));assert.deepEqual(p.inventory.skills,j.inventory.skills);assert.equal(p.inventory.xpEnabled,false);
 const loaded=create();loaded.restore(p);loaded.start('重置');assert.deepEqual(loaded.inventory.skills,{斩魂:1});assert.equal(loaded.inventory.xpEnabled,false);
});
