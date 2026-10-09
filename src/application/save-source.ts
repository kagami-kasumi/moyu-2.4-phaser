import {SAVE_FIELDS,SAVE_NPCS} from '../content/save-field-data.ts';
import {contentOfKind} from '../content/registry.ts';
import {CHARACTERS} from '../content/character-entry.ts';
import type {GameProgress} from './save-types.ts';

export const SOURCE_EQUIPMENT=['头盔','衣服','武器','鞋','幸运符','戒指'] as const;
/** Reviewed expressions contain string literals, i and n only; never execute source text. */
export function concreteKey(expression:string,i=0,n=0){return expression.split(' + ').map(t=>t==='i'?String(i):t==='n'?String(n):/^"[^"]*"$/.test(t)?JSON.parse(t) as string:(()=>{throw Error('未支持的源键表达式');})()).join('');}
const unwrap=(v:unknown):unknown=>v&&typeof v==='object'&&'state'in v&&(v as {state:string}).state==='undefined'?undefined:v;
const quests=contentOfKind('quest'),skills=contentOfKind('skill'),buildings=contentOfKind('building'),bosses=contentOfKind('boss-growth');
export function sourceFieldInstances(f:typeof SAVE_FIELDS[number],p:GameProgress):{i:number;n?:number;value?:unknown}[]{
 if(!f.dynamic)return [{i:0}];
 const size=f.owner==='backPack'?40:f.owner==='fastKey'?7:f.owner==='wareHouse'?54:f.owner==='equipment'?6:f.owner==='huanShouItem.bell'?3:f.owner==='mainCastle.building'?buildings.length:f.owner==='map.npcState'?SAVE_NPCS.length:f.owner==='roleSkills'?skills.length:f.owner==='map'?bosses.length:f.owner==='allTitle'?contentOfKind('pet').length:f.owner==='huanShou.allHuanShou'?p.reward.pets.length:f.owner==='friend'?0:-1;
 if(size>=0)return Array.from({length:size},(_,i)=>({i:i+(['backPack','fastKey','wareHouse','huanShouItem.bell'].includes(f.owner)?1:0)}));
 if(f.owner.startsWith('task.'))return quests.filter(q=>q.data.sourceGroup===f.owner.slice(5)).flatMap(q=>{
  const i=Number(q.data.sourceIndex),data=q.data,needs=Array.isArray(data.need)?data.need:[];
  if(f.key.includes(' + n + '))return needs.map((need,n)=>({i,n,value:unwrap((need as Record<string,unknown>)[f.property])}));
  return [{i,value:f.key.endsWith('"need_number"')?unwrap((needs[0] as Record<string,unknown>|undefined)?.number):f.key.endsWith('"need_length"')?needs.length:unwrap(data[f.property])}];
 });
 throw Error('未映射持久字段域 '+f.owner);
}

/** New-game initialization only. Unimplemented generated values are explicitly deferred,
 * never guessed or executed. Loaded raw keys bypass all seed/default logic. */
export function initialSource(p:GameProgress){
 const source:Record<string,unknown>={},deferred:string[]=[];
 for(const f of SAVE_FIELDS)for(const instance of sourceFieldInstances(f,p)){
  const {i,n}=instance,key=f.dynamic?concreteKey(f.key,i,n):f.key;
  let value:unknown='value'in f?unwrap(f.value):undefined;
  if('values'in f)value=unwrap(f.values?.[i]?.value);
  if(f.owner==='map.npcState'&&f.dynamic)value=unwrap((SAVE_NPCS[i]!.values as Record<string,unknown>)[f.property]);
  if(f.owner.startsWith('task.')&&'value'in instance)value=instance.value;
  if(f.owner==='roleSkills')value=f.property==='name'?skills[i]!.name:skills[i]!.name===CHARACTERS[p.profession].skill?1:0;
  if(value===undefined&&!['backPack','fastKey','wareHouse','equipment','huanShouItem.bell','make','makeBell','splitStone','castleStone'].includes(f.owner)&&!['content-template-or-generator','no-initial-reference'].includes(f.seedStatus))deferred.push(key);
  source[key]=value;
 }
 Object.assign(source,{playID:Math.floor(Math.random()*100000)+1,role_lifeSourseLevels:1,role_mpSourseLevels:1,role_lifeSourse:0,role_mpSourse:0,role_maxLifeSourse:p.vitals.maxLife,role_maxMpSourse:p.vitals.maxMp});
 return {source,deferred,buildings:Object.fromEntries(buildings.map(b=>[b.id,{needMainLevels:b.data.needMainLevels}]))};
}

/** Write only fields represented by live domain owners; opaque source keys remain untouched. */
export function updateSource(raw:Record<string,unknown>,p:GameProgress):Record<string,unknown>{
 const s=structuredClone(raw),r=p.reward,v=p.vitals,i=p.inventory;
 Object.assign(s,{saved:true,versions:1.8,saveTime:new Date().toISOString(),role_myName:p.name,role_vocational:p.profession,role_levels:v.level,role_life:v.life,role_maxLife:v.maxLife,role_mp:v.mp,role_maxMp:v.maxMp,role_nowExp:v.exp,role_maxExp:v.maxExp,role_ms:r.ms,role_res:r.res,role_credit:r.credit,role_titleLevel:r.titleLevel,role_exploit:i.exploit,role_militaryExploit:i.militaryExploit,role_x:p.x,role_y:p.y,map_nowMap:p.map==='city'?'卡萨诺城一':'卡萨诺城郊区',allHuanShou_length:r.pets.length});
 for(const f of SAVE_FIELDS){
  if(f.owner==='backPack'&&f.dynamic)for(let n=0;n<40;n++)s[concreteKey(f.key,n+1)]=r.bag[n]?.[f.property];
  if(f.owner==='equipment')SOURCE_EQUIPMENT.forEach((slot,n)=>{if(slot!=='幸运符')s[concreteKey(f.key,n)]=i.equipment[slot]?.[f.property];});
  if(f.owner==='make'){const slot=f.key.startsWith('make_item_')?'item':'stone';s[f.key]=p.crafting[slot]?.[f.key.slice(('make_'+slot+'_').length)];}
  if(f.owner==='huanShou.allHuanShou'&&f.dynamic)r.pets.forEach((pet,n)=>{if(f.property in pet)s[concreteKey(f.key,n)]=(pet as unknown as Record<string,unknown>)[f.property];});
 }
 const elder=SAVE_NPCS.findIndex(n=>n.id==='npc:老兵');s[`npcState${elder}cmd`]=r.cmd;
 for(const [slot,name]of Object.entries(p.initialState.fastKeys)){s[`fastKey${slot}type`]='技能图标';s[`fastKey${slot}name`]=name;}
 s[`mainTask${p.initialState.mainTask.index}isDoing`]=p.initialState.mainTask.isDoing;s[`mainTask${p.initialState.mainTask.index}isComplete`]=p.initialState.mainTask.isComplete;
 skills.forEach((skill,n)=>{const live=p.initialState.skills.find(v=>v.name===skill.name);if(live||skill.name==='英勇'){s[`allSkills${n}name`]=skill.name;s[`allSkills${n}levels`]=skill.name==='英勇'?i.bravery:live!.level;}});
 return s;
}
