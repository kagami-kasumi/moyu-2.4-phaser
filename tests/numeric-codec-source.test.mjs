import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {NUMERIC_CODEC_RULES as rules} from '../src/content/numeric-codec-rules.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+rules.source,'utf8');
test('MovieClip codec has equivalent arithmetic but an independent class base',()=>{
 const mc=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/SecreteCodeMC.as','utf8');
 for(const name of ['setSecreteCode','getSecreteCode'])assert.equal(functionRange(mc,`function ${name}(val)`).text.replaceAll('SecreteCodeMC.BASE','SecreteCode.BASE'),functionRange(source,`function ${name}(val)`).text);
 const scope={isNaN,SecreteCode:{BASE:123456},SecreteCodeMC:{BASE:623455}};
 const encode=vm.runInNewContext('(function(val)'+functionRange(mc,'function setSecreteCode(val)').text+')',scope);
 const decode=vm.runInNewContext('(function(val)'+functionRange(mc,'function getSecreteCode(val)').text+')',scope);
 const receiver={SECRETECODE:-3};assert.equal(encode.call(receiver,10),623425);assert.equal(decode.call(receiver,623425),10);
 for(const name of ['RoleMC','ThingMC'])assert.ok(fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/'+name+'.as','utf8').startsWith('class '+name+' extends SecreteCodeMC'));
});
test('numeric codec covers every multiplier and shared-base endpoints including absent storage',()=>{
 for(let draw=0;draw<4;draw++)for(const baseDraw of [0,499999]){
  const context={isNaN,random:n=>n===4?draw:baseDraw,SecreteCode:{}};
  const multiplier=vm.runInNewContext(source.match(/var SECRETECODE = ([^;]+);/)[1],context);
  context.SecreteCode.BASE=vm.runInNewContext(source.match(/static var BASE = ([^;]+);/)[1],context);
  assert.equal(multiplier,-2-draw);assert.equal(context.SecreteCode.BASE,123456+baseDraw);
  const encode=vm.runInNewContext('(function(val)'+functionRange(source,'function setSecreteCode(val)').text+')',context);
  const decode=vm.runInNewContext('(function(val)'+functionRange(source,'function getSecreteCode(val)').text+')',context);
  const receiver={SECRETECODE:multiplier};
  for(const value of [-100000,-1,0,1,123456,100000000])assert.equal(decode.call(receiver,encode.call(receiver,value)),value===0?-0:value);
  for(const value of [.1,1.3,1.4,1.5,12.3456])assert.ok(Math.abs(decode.call(receiver,encode.call(receiver,value))-value)<1e-9);
  for(const value of [undefined,NaN])assert.equal(decode.call(receiver,value),0);
 }
});
