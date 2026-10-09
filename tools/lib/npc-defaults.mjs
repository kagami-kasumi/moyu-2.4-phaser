import vm from 'node:vm';
import {functionRange} from './as2-data.mjs';
import {initializationEvidence} from './initialization-evidence.mjs';

/** Offline execution of the bounded data-only FriendClass constructor, never shipped. */
export function npcDefaults(source,codec,records){
 const fields=initializationEvidence(source,'__Packages/FriendClass.as','FriendClass').filter(s=>s.phase==='class-declaration');
 const context=vm.createContext({isNaN,SecreteCode:{BASE:123456}});
 const compile=(text,marker,args)=>vm.runInContext('(function('+args+')'+functionRange(text,marker).text.replace(/\bsuper\(\);/,'')+')',context);
 const construct=compile(source,'function FriendClass(target)','target');
 const get=compile(codec,'function getSecreteCode(val)','val'),set=compile(codec,'function setSecreteCode(val)','val');
 const result=[];
 for(const row of records){
  if(Object.values(row.data).some(v=>v&&typeof v==='object'))throw Error('Dynamic NPC seed needs separate review');
  const target={SECRETECODE:-3,getSecreteCode:get,setSecreteCode:set};
  for(const field of fields){if(typeof field.value==='object')throw Error('Unreviewed NPC declaration');target[field.property]=field.value;}
  for(const property of ['relation','maxRelation'])Object.defineProperty(target,property,{enumerable:true,get:compile(source,`function get ${property}()` ,''),set:compile(source,`function set ${property}(val)`,'val')});
  construct.call(target,row.data);
  const values=Object.fromEntries(['nTitle','cmd','oldCmd','name','sex','address','isLover','jobLevels','jobMaxLevels','levels','relationName','rejectTimes','isFriend','isIntimate','relation','maxRelation','isTask','isBest'].map(p=>[p,target[p]===undefined?{state:'undefined'}:target[p]]));
  result.push({contentId:'npc:'+row.data.nTitle,source:row.source,values});
 }
 return result;
}
