import type {PersistentState} from '../content/persistence-schema.ts';
import type {PreservedValue} from '../content/persistence-types.ts';
import {restorePreservedValue} from '../content/preserved-value.ts';
import {contentById,contentNamed,itemContentId} from '../content/registry.ts';
import {EQUIPMENT_SLOTS} from '../domain/inventory.ts';
import {CHARACTERS} from '../content/character-entry.ts';
import type {GameProgress} from './save-types.ts';

export const MAX_SAVE_SIZE=4_000_000;
export function record(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('存档对象结构无效');return v as Record<string,unknown>;}
function insist(ok:unknown,message='存档数据无效'):asserts ok {if(!ok)throw Error(message);}
function finite(v:unknown,min=0,max=Number.MAX_SAFE_INTEGER):asserts v is number{insist(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max);}
function integer(v:unknown,min=0,max=Number.MAX_SAFE_INTEGER){finite(v,min,max);insist(Number.isSafeInteger(v));}
function string(v:unknown){insist(typeof v==='string'&&v.length<=10000);}

/** Parse JSON with duplicate-key rejection before JSON.parse can discard ambiguous data. */
function parseJson(text:string):unknown {
 insist(text.length<=MAX_SAVE_SIZE,'存档超过容量限制');
 let at=0;
 const ws=()=>{while(/\s/.test(text[at]??'')&&at<text.length)at++;};
 const tokenString=()=>{const begin=at++;while(at<text.length){const c=text[at++];if(c==='\\')at++;else if(c==='"')return JSON.parse(text.slice(begin,at)) as string;}throw Error('存档字符串未结束');};
 const value=(depth:number):void=>{insist(depth<100,'存档嵌套过深');ws();const c=text[at];
  if(c==='{'||c==='['){at++;ws();const end=c==='{'?'}':']',keys=new Set<string>();if(text[at]===end){at++;return;}
   while(at<text.length){if(c==='{'){ws();insist(text[at]==='"');const key=tokenString();insist(!keys.has(key),'存档含重复字段');keys.add(key);ws();insist(text[at++]===':');}value(depth+1);ws();if(text[at]===end){at++;return;}insist(text[at++]===',');}throw Error('存档未结束');
  }if(c==='"'){tokenString();return;}const m=text.slice(at).match(/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/);insist(m);at+=m[0].length;
 };value(0);ws();insist(at===text.length);return JSON.parse(text);
}

export function validatePreserved(value:unknown):asserts value is PreservedValue {
 let nodes=0;
 const visit=(v:unknown,depth:number)=>{insist(++nodes<200000&&depth<40,'存档数据超出限制');const r=record(v);
  const allowed=r.kind==='object'?['kind','entries']:r.kind==='array'?['kind','length','entries','properties']:r.kind==='undefined'||r.kind==='null'?['kind']:['kind','value'];
  insist(Object.keys(r).every(k=>allowed.includes(k)),'存档值含未知格式字段');
  switch(r.kind){
   case 'undefined':case 'null':return;
   case 'boolean':insist(typeof r.value==='boolean');return;
   case 'string':string(r.value);return;
   case 'number':finite(r.value,-Number.MAX_VALUE,Number.MAX_VALUE);return;
   case 'special-number':insist(['NaN','Infinity','-Infinity','-0'].includes(String(r.value)));return;
   case 'object':case 'array':{
    const isArray=r.kind==='array';if(isArray)integer(r.length,0,100000);
    insist(Array.isArray(r.entries));const keys=new Set<string>();
    for(const e of r.entries){const entry=record(e);let key:string;
     if(isArray){integer(entry.index,0,Number(r.length)-1);key=String(entry.index);}else{string(entry.key);key=entry.key as string;}
     insist(!keys.has(key),'存档含重复字段');keys.add(key);visit(entry.value,depth+1);
    }
    if(isArray&&r.properties!==undefined){insist(Array.isArray(r.properties));for(const e of r.properties){const entry=record(e);string(entry.key);const key=entry.key as string,n=Number(key);insist(key!=='length'&&!(Number.isInteger(n)&&n>=0&&n<4294967295&&String(n)===key)&&!keys.has(key));keys.add(key);visit(entry.value,depth+1);}}
    return;
   }
   default:throw Error('未知存档值类型');
  }
 };visit(value,0);
}

function validateItem(value:unknown){
 if(value===null)return;const item=record(value);string(item.type);insist((item.type as string).length>0);
 if(item.name!==undefined)string(item.name);if(item.vocational!==undefined)string(item.vocational);
 for(const [key,v]of Object.entries(item)){
  if(v!==undefined)insist(typeof v==='string'||typeof v==='number','物品字段无效');
  if(typeof v==='number')finite(v,-Number.MAX_SAFE_INTEGER);
  if(key==='contentId')insist(typeof v==='string'&&contentById(v),'无效内容引用');
 }
 // Unknown objects remain in the opaque source/extensions layer, never become executable items.
 insist(itemContentId(item as {type:string;name?:string;vocational?:string}),'无效物品引用');
 if(EQUIPMENT_SLOTS.includes(item.type as typeof EQUIPMENT_SLOTS[number])){
  integer(item.grade,0,4);integer(item.mhdj,0,99);if(item.type!=='戒指'){integer(item.levels,1,10000);if(item.holes!==undefined)integer(item.holes,0,3);}
 }
 if(item.number!==undefined)integer(item.number,0,999999);
}
function validateVitals(value:unknown){const v=record(value);for(const key of ['level','life','maxLife','mp','maxMp','exp','maxExp'])finite(v[key]);integer(v.level,1,10000);}

export function validateProgress(value:unknown):asserts value is GameProgress {
 const p=record(value);insist(typeof p.name==='string'&&p.name.length>0&&p.name.length<=10,'角色名无效');
 insist(p.profession==='战士'||p.profession==='法师','无效职业引用');insist(p.map==='city'||p.map==='outskirts','地图尚不可恢复');
 finite(p.x,-10000,10000);finite(p.y,-10000,10000);insist(typeof p.complete==='boolean');integer(p.transitions);insist(p.facing==='left'||p.facing==='right');
 validateVitals(p.vitals);validateVitals(p.petVitals);
 const initial=record(p.initialState);insist(initial.name===p.name&&initial.profession===p.profession&&initial.sex===CHARACTERS[p.profession].sex);
 insist(Array.isArray(initial.skills));for(const s of initial.skills){const skill=record(s);insist(typeof skill.name==='string'&&contentNamed('skill',skill.name).length===1,'无效技能引用');integer(skill.level,0,10000);}
 const fast=record(initial.fastKeys);for(const name of Object.values(fast))insist(typeof name==='string'&&contentNamed('skill',name).length===1,'无效快捷技能引用');
 const quest=record(initial.mainTask);integer(quest.index,0,1);insist(typeof quest.isDoing==='boolean'&&typeof quest.isComplete==='boolean');
 for(const k of ['credit','titleLevel','intoV','daoshiLv','useRecord','demonGeneralRebirth','usedTimer','readTimes'])finite(initial[k]);
 const r=record(p.reward);insist(Array.isArray(r.bag)&&r.bag.length===40);r.bag.forEach(validateItem);
 insist(Array.isArray(r.pets)&&r.pets.length<=40);for(const pet of r.pets){const v=record(pet);insist(typeof v.type==='string'&&contentNamed('pet',v.type).length===1,'无效幻兽引用');for(const k of ['levels','zs','maxZs','element','titleNum','rateLife','rateMinAttack','rateMaxAttack','rateDefense'])finite(v[k]);insist(typeof v.battle==='boolean');}
 insist(Array.isArray(r.drops)&&r.drops.length<=10000);for(const drop of r.drops){const d=record(drop);insist(d.item!==null);validateItem(d.item);finite(d.x,-10000,10000);finite(d.y,-10000,10000);}
 finite(r.ms,-Number.MAX_SAFE_INTEGER,100000000);finite(r.res,-Number.MAX_SAFE_INTEGER,100000000);finite(r.credit);finite(r.titleLevel,0,10000);
 insist(r.cmd===1||r.cmd===6);insist(r.nextCmd===r.cmd);insist(r.claimedPack===null||typeof r.claimedPack==='number'&&[1,2,3].includes(r.claimedPack));insist((r.cmd===1)===(r.claimedPack===null),'领取标记不一致');
 const i=record(p.inventory);integer(i.bravery,0,Number(contentNamed('skill','英勇')[0]!.data.maxLevels));finite(i.exploit);finite(i.militaryExploit);const equipment=record(i.equipment);
 for(const slot of EQUIPMENT_SLOTS){validateItem(equipment[slot]);insist(equipment[slot]===null||record(equipment[slot]).type===slot,'装备槽引用无效');}
 const craft=record(p.crafting);validateItem(craft.item);validateItem(craft.stone);insist(craft.item===null||['武器','衣服','头盔','鞋'].includes(String(record(craft.item).type)));insist(craft.stone===null||record(craft.stone).type==='宝石');
}

export function decodeSave(text:string):PersistentState {
 const state=record(parseJson(text));insist(state.schema==='moyu-state','不是魔域存档');insist(state.schemaVersion===1,'存档版本不支持');
 validatePreserved(state.source);validatePreserved(state.extensions);insist(state.source.kind==='object'&&state.extensions.kind==='object');
 const extensions=record(restorePreservedValue(state.extensions));validateProgress(extensions.game);
 return state as unknown as PersistentState;
}
export function encodeSave(state:PersistentState):string {const text=JSON.stringify(state);decodeSave(text);return text;}
export function savedProgress(state:PersistentState):GameProgress {const p=record(restorePreservedValue(state.extensions)).game;validateProgress(p);return p;}
