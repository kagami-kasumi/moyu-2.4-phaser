import test from 'node:test';
import assert from 'node:assert/strict';
import {persistentState,editPersistentState,legacyPetSeed} from '../src/content/persistence-schema.ts';
import {restorePreservedValue} from '../src/content/preserved-value.ts';
import {persistenceFields} from '../src/content/persistence-registry-data.ts';
import {registryData} from '../src/content/registry-data.ts';

test('final schema represents every source template and all content, including opaque future records',()=>{
 const samples=[undefined,0,-0,NaN,Infinity,-Infinity,'',false,null];
 for(const field of persistenceFields){
  const key=typeof field.key==='string'?field.key:field.key.expression;
  for(const value of samples){
   const source={[key]:value};
   const state=JSON.parse(JSON.stringify(persistentState(source)));
   assert.deepEqual(restorePreservedValue(state.source),source,field.id);
  }
 }
 const sparse:unknown[]&{future?:unknown}=new Array(5);sparse[1]=undefined;sparse[3]={contentId:'future:未知',quantity:0};sparse.future={next:NaN};
 const extensions={records:registryData.definitions.map(d=>({contentId:d.id,payload:d.data})),sparse,buildings:{'building:住房':{needMainLevels:-29}},future:{v:Infinity}};
 assert.deepEqual(restorePreservedValue(JSON.parse(JSON.stringify(persistentState({},extensions))).extensions),extensions);
});

test('owned edits retain omitted keys, duplicate instances, holes and unknown data; delete is explicit',()=>{
 const input={role_life:5,explicit:undefined,unknown:{nan:NaN},items:[{type:'未实现',number:0},{type:'未实现',number:0}]};
 const initial=persistentState(input,{future:[,undefined,Infinity]});
 const changed=editPersistentState(initial,'source',['role_life'],[{key:'role_life',operation:'set',value:0}]);
 assert.deepEqual(restorePreservedValue(JSON.parse(JSON.stringify(changed)).source),{...input,role_life:0});
 assert.deepEqual(changed.extensions,initial.extensions);assert.deepEqual(restorePreservedValue(initial.source),input);
 assert.throws(()=>editPersistentState(initial,'source',['role_life'],[{key:'unknown',operation:'delete'}]),/Unowned/);
 assert.throws(()=>editPersistentState(initial,'source',['role_life'],[{key:'role_life',operation:'set',value:8},{key:'role_life',operation:'delete'}]),/Duplicate/);
 assert.throws(()=>editPersistentState(initial,'source',['role_life'],[{key:'role_life',operation:'set',value:()=>1}]),/Unsupported/);
 assert.deepEqual(restorePreservedValue(initial.source),input);
 const removed=editPersistentState(initial,'source',['explicit'],[{key:'explicit',operation:'delete'}]);
 assert.equal(Object.hasOwn(restorePreservedValue(removed.source) as object,'explicit'),false);
 const prototype=editPersistentState(initial,'source',['__proto__'],[{key:'__proto__',operation:'set',value:{safe:true}}]);
 assert.equal(Object.getPrototypeOf(restorePreservedValue(prototype.source)),Object.prototype);
});

test('legacy pet repair retains presence and distinct growth fields without changing raw data',()=>{
 const source={allHuanShou0type:'未知幻兽',allHuanShou0nextLvRate:0,allHuanShou0sd:undefined,allHuanShou0qyg:200,allHuanShou0future:Infinity};
 const state=persistentState(source);
 assert.deepEqual(legacyPetSeed(state,0),{type:'未知幻兽',nextLvRate:0,sd:undefined,qyg:200});
 assert.deepEqual(legacyPetSeed(state,1),{});
 assert.deepEqual(restorePreservedValue(state.source),source);
 assert.throws(()=>legacyPetSeed(state,-1),/Invalid/);
});
