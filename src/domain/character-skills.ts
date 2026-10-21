import {contentOfKind} from '../content/registry.ts';
import {CHARACTERS,type Profession} from '../content/character-entry.ts';
import {PASSIVE_SKILL_RULES,passiveSkillValue} from '../content/role-skill-rules.ts';
import type {Item} from './npc-reward.ts';

export const SKILLS=contentOfKind('skill').map(d=>({name:d.name,maxLevel:Number(d.data.maxLevels),condition:Number(d.data.condition),active:d.data.canUse===true,description:String(d.data.description)}));
export const SKILL_BOOKS=contentOfKind('item').filter(d=>d.data.type==='技能书');
export const initialSkills=(profession:Profession):Record<string,number>=>({[CHARACTERS[profession].skill]:1});
export function skillFields(levels:Record<string,number>,profession:Profession){
 const fields:Record<string,number>={};for(const name of Object.keys(PASSIVE_SKILL_RULES) as (keyof typeof PASSIVE_SKILL_RULES)[]){const effect=passiveSkillValue(name,levels[name]??0,CHARACTERS[profession].rates);fields[effect.field]=effect.value;}return fields;
}
export function learnSkill(levels:Record<string,number>,item:Item,profession:Profession,level:number){
 if(item.vocational!=='公共'&&item.vocational!==profession)return {success:false,message:'职业不符合。',activateXp:false};
 if(Number(item.levels)>level)return {success:false,message:'等级不够，无法学习技能。',activateXp:false};
 const skill=SKILLS.find(s=>s.name===item.name);if(!skill)return {success:false,message:'未知技能，未消耗技能书',activateXp:false};
 const old=levels[skill.name]??0;if(old+1>skill.maxLevel)return {success:false,message:skill.name+'已经达到最高等级',activateXp:false};
 levels[skill.name]=old+1;return {success:true,message:skill.name+'提升至 '+(old+1)+' 级',activateXp:old===0&&(skill.name==='震'||skill.name==='怒')};
}
