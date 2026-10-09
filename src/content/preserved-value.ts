import type {PreservedValue} from './persistence-types.ts';

/** Data preservation only. Not a game-state schema, storage adapter or executable snapshot. */
export function preserveValue(value:unknown):PreservedValue {
 const ancestors=new Set<object>();
 const encode=(v:unknown):PreservedValue=>{
  if(v===undefined)return {kind:'undefined'};
  if(v===null)return {kind:'null'};
  if(typeof v==='boolean')return {kind:'boolean',value:v};
  if(typeof v==='string')return {kind:'string',value:v};
  if(typeof v==='number'){
   if(Object.is(v,-0))return {kind:'special-number',value:'-0'};
   if(Number.isNaN(v))return {kind:'special-number',value:'NaN'};
   if(!Number.isFinite(v))return {kind:'special-number',value:v>0?'Infinity':'-Infinity'};
   return {kind:'number',value:v};
  }
  if(typeof v!=='object')throw Error('Unsupported preserved value type: '+typeof v);
  if(ancestors.has(v))throw Error('Cyclic data must use explicit content references');
  if(!Array.isArray(v)&&![Object.prototype,null].includes(Object.getPrototypeOf(v)))throw Error('Preserve plain data records, not runtime instances');
  if(Object.getOwnPropertySymbols(v).length)throw Error('Symbol fields are not part of the preservation contract');
  ancestors.add(v);
  const entries:{key:string;value:PreservedValue}[]=[];
  for(const [key,descriptor] of Object.entries(Object.getOwnPropertyDescriptors(v))){
   if(Array.isArray(v)&&key==='length')continue;
   if(!descriptor.enumerable||!('value' in descriptor))throw Error('Preserve enumerable data fields only');
   entries.push({key,value:encode(descriptor.value)});
  }
  ancestors.delete(v);
  if(!Array.isArray(v))return {kind:'object',entries};
  const indexed: {index:number;value:PreservedValue}[]=[],properties:typeof entries=[];
  for(const entry of entries){const n=Number(entry.key);if(Number.isInteger(n)&&n>=0&&n<4294967295&&String(n)===entry.key)indexed.push({index:n,value:entry.value});else properties.push(entry);}
  return {kind:'array',length:v.length,entries:indexed,...(properties.length?{properties}: {})};
 };
 return encode(value);
}

/** Restores the supported data model; outer save-format validation belongs to the save task. */
export function restorePreservedValue(value:PreservedValue):unknown {
 const put=(target:object,key:string,v:PreservedValue)=>Object.defineProperty(target,key,{value:restorePreservedValue(v),writable:true,enumerable:true,configurable:true});
 switch(value.kind){
  case 'undefined':return undefined;
  case 'null':return null;
  case 'boolean':case 'string':case 'number':return value.value;
  case 'special-number':return {NaN:NaN,Infinity:Infinity,'-Infinity':-Infinity,'-0':-0}[value.value];
  case 'object':{const result={};for(const entry of value.entries)put(result,entry.key,entry.value);return result;}
  case 'array':{const result=new Array(value.length);for(const entry of value.entries)put(result,String(entry.index),entry.value);for(const entry of value.properties??[])put(result,entry.key,entry.value);return result;}
 }
}
