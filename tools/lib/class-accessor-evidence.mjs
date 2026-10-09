import {functionRange} from './as2-data.mjs';

/** A numeric getter proves serialized read type, not final constructor value or setter effects. */
export function classAccessorEvidence(source,file,codec,codecFile){
 const decoder=functionRange(codec,'function getSecreteCode(val)');
 if(!/^\{if\(isNaN\(val\)\)\{return0;\}return\(val-SecreteCode(?:MC)?\.BASE\)\/this\.SECRETECODE;\}$/.test(decoder.text.replace(/\s+/g,'')))throw Error('Unreviewed decoder '+codecFile);
 const getters=new Map();
 for(const match of source.matchAll(/function get (\w+)\(\)/g)){
  const property=match[1],getter=functionRange(source,match[0]);
  const encoded=getter.text.match(/^\{\s*return this\.getSecreteCode\(this\.([\p{L}\p{N}_]+)\);\s*\}$/u)?.[1];
  const alias=getter.text.match(/^\{\s*return this\.(\w+);\s*\}$/)?.[1];
  getters.set(property,{property,encoded,alias,getter});
 }
 const result=[];
 for(const entry of getters.values()){
  let terminal=entry;const chain=[entry.property];
  while(!terminal.encoded&&terminal.alias&&getters.has(terminal.alias)){
   if(chain.includes(terminal.alias))throw Error('Accessor alias cycle');
   chain.push(terminal.alias);terminal=getters.get(terminal.alias);
  }
  if(!terminal.encoded)continue;
  const setterMarker=`function set ${entry.property}(val)`;
  const setter=source.includes(setterMarker)?functionRange(source,setterMarker):null;
  result.push({property:entry.property,type:'number',evidence:'verified-getter-type',getter:{source:{file,line:entry.getter.line},body:entry.getter.text},aliasChain:chain,backingField:terminal.encoded,decoder:{source:{file:codecFile,line:decoder.line},body:decoder.text},setter:setter?{source:{file,line:setter.line},body:setter.text,status:'retain-whole-body; side effects require contextual review'}:null,defaultScope:'uninitialized codec reads zero; constructor and downstream initialization determine actual state'});
 }
 return result;
}
