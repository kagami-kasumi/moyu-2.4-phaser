import test from 'node:test';
import assert from 'node:assert/strict';
import {tokens,matching,value,functionRange,controlScopes} from './lib/as2-data.mjs';
import {initializationEvidence} from './lib/initialization-evidence.mjs';
test('reads nested data without treating delimiters in text or comments as syntax',()=>{
 const s='{name:"同名}任务",need:[{number:6}], formula: level * (2 + 3), ok:true, missing:undefined, note:"a\\\"b" /* } */}';const t=tokens(s);
 assert.equal(matching(t,0),t.length-1);assert.deepEqual(value(s,t,0,t.length),{name:'同名}任务',need:[{number:6}],formula:{expression:'level * (2 + 3)'},ok:true,missing:{expression:'undefined'},note:'a"b'});
});
test('retains nested loop and conditional guards including else-if and final else',()=>{
 const s='while(i < n) { if(kind === "a") { x=1; } else if(kind === "b") { x=2; } else { x=3; } }';
 const scopes=controlScopes(s);assert.deepEqual(scopes.map(x=>x.header),['while(i < n)','if(kind === "a")','else if(kind === "b")','else']);
 const last=s.indexOf('x=3');assert.deepEqual(scopes.filter(x=>x.start<last&&x.end>last).map(x=>x.header),['while(i < n)','else']);
});
test('rejects malformed source and preserves formulas instead of evaluating them',()=>{
 assert.throws(()=>tokens('"unfinished'));assert.throws(()=>matching(tokens('{]'),0));
 const s='{x:dangerous(),y:-2}';assert.deepEqual(value(s,tokens(s),0,tokens(s).length),{x:{expression:'dangerous()'},y:-2});
 const range=functionRange('f = function(){x="}"; /* } */ y={a:1};}; next();','f =');assert.equal(range.text,'{x="}"; /* } */ y={a:1};}');
});
test('constructor evidence preserves defaults, overrides and branch conditions without folding setters',()=>{
 const text='class Sample { var enabled=false; var rate=random(3); function Sample(input){this.enabled=input.enabled;if(input.rate!=undefined){this.rate=input.rate;}else{this.rate=2;}this.initialize();} function later(){this.rate=9;} }';
 const steps=initializationEvidence(text,'sample.as','Sample');assert.equal(steps.length,5);
 assert.deepEqual(steps.map(s=>s.value),[false,{expression:'random(3)'},{expression:'input.enabled'},{expression:'input.rate'},2]);
 assert.equal(steps.at(-1).conditions[0].header,'else');assert.equal(steps.some(s=>s.value===9),false);
});
test('switch domains retain grouped case labels and nested conditions',()=>{
 const s='switch(kind){case "a":case "b": x=2;break;case "c":if(ok){x=3;}break;default:x=0;}';
 const scopes=controlScopes(s),at=s.indexOf('x=2');assert.deepEqual(scopes.filter(x=>x.start<at&&x.end>at).map(x=>x.header),['switch(kind)','case "a": case "b":']);
 const nested=s.indexOf('x=3');assert.deepEqual(scopes.filter(x=>x.start<nested&&x.end>nested).map(x=>x.header),['switch(kind)','case "c":','if(ok)']);
});
