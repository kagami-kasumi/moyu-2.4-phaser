import {registryData} from './registry-data.ts';
import type {ContentDefinition,ContentKind} from './registry-types.ts';

const byId=new Map<string,ContentDefinition>();
const byAlias=new Map<string,ContentDefinition[]>();
for(const definition of registryData.definitions){
 if(byId.has(definition.id))throw Error('Duplicate content ID: '+definition.id);
 byId.set(definition.id,definition);
 for(const alias of new Set([definition.name,...definition.aliases])){
  const key=definition.kind+':'+alias,entries=byAlias.get(key)??[];entries.push(definition);byAlias.set(key,entries);
 }
}
/** Returns copies: callers cannot mutate shared catalog data through this API. */
export function contentById(id:string):ContentDefinition|undefined {const entry=byId.get(id);return entry?structuredClone(entry):undefined;}
export function contentNamed(kind:ContentKind,name:string):ContentDefinition[]{return structuredClone(byAlias.get(kind+':'+name)??[]);}
export function contentOfKind(kind:ContentKind):ContentDefinition[]{return registryData.definitions.filter(d=>d.kind===kind).map(d=>structuredClone(d));}
export function requireContent(id:string):ContentDefinition {const definition=contentById(id);if(!definition)throw Error('Unknown content ID: '+id);return definition;}
/** Original serialized type/name pairs are retained; IDs add identity without rewriting saves. */
export function itemContentId(item:{type:string;name?:string;vocational?:string}):string|undefined {
 if(['武器','衣服','鞋','头盔'].includes(item.type)){
  if(!item.name||!item.vocational)return undefined;
  const id='equipment:'+item.vocational+':'+item.name;return byId.has(id)?id:undefined;
 }
 const name=['药品','技能书','宝石','戒指','幸运符'].includes(item.type)?item.name:item.type;
 if(!name)return undefined;const candidates=byAlias.get('item:'+name)??[];
 return candidates.length===1?candidates[0].id:undefined;
}
/** Only literal source factory templates can be instantiated here. Dynamic generators stay explicit. */
export function literalItem(name:string):{type:string;name?:string;[key:string]:string|number|undefined} {
 const entries=contentNamed('item',name);if(entries.length!==1)throw Error('Unknown or ambiguous item: '+name);
 const data=entries[0].data;
 if(typeof data.type!=='string'||Object.values(data).some(v=>typeof v!=='string'&&typeof v!=='number'))throw Error('Item requires a source generator: '+name);
 return {...data} as {type:string;name?:string;[key:string]:string|number|undefined};
}
