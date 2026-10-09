import test from 'node:test';
import assert from 'node:assert/strict';
import {preserveValue,restorePreservedValue} from '../src/content/preserved-value.ts';
import {registryData} from '../src/content/registry-data.ts';
test('preserved values survive JSON without collapsing missing, undefined, special numbers or sparse array properties',()=>{
 const sparse:unknown[]&{label?:string}=new Array(4);sparse[1]=undefined;sparse[3]=-0;sparse.label='原始数组属性';
 const input={explicit:undefined,sparse,nan:NaN,positive:Infinity,negative:-Infinity,nested:{text:'',flag:false,value:0}};
 const restored=restorePreservedValue(JSON.parse(JSON.stringify(preserveValue(input))));assert.deepEqual(restored,input);
 assert.equal(Object.hasOwn((restored as typeof input).sparse,0),false);assert.equal(Object.hasOwn((restored as typeof input).sparse,1),true);
});
test('every registered content payload is representable without filtering unimplemented content',()=>{
 for(const d of registryData.definitions)assert.deepEqual(restorePreservedValue(JSON.parse(JSON.stringify(preserveValue(d.data)))),d.data,d.id);
 const input=JSON.parse('{"__proto__":{"polluted":true},"constructor":"source-data"}');
 const output=restorePreservedValue(preserveValue(input));assert.deepEqual(output,input);assert.equal(Object.getPrototypeOf(output),Object.prototype);
});
test('runtime objects and cycles fail explicitly rather than silently dropping fields',()=>{
 const cycle:{self?:unknown}={};cycle.self=cycle;assert.throws(()=>preserveValue(cycle),/Cyclic/);
 assert.throws(()=>preserveValue(new Date()),/runtime instances/);
 assert.throws(()=>preserveValue({fn(){}}),/Unsupported/);
 let reads=0;assert.throws(()=>preserveValue({get field(){reads++;return 1;}}),/data fields/);assert.equal(reads,0);
});
