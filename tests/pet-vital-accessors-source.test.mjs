import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/HuanShouClass.as','utf8');
const fields=['life','maxLife','burst','jook','wind','soil','fire','water','reduceDamage','minAttack','maxAttack','defense'];
function pet(){
 const p={setSecreteCode:v=>v,getSecreteCode:v=>v};
 for(const field of fields)Object.defineProperty(p,field,{get:vm.runInNewContext('(function()'+functionRange(text,`function get ${field}()`).text+')',{isNaN}),set:vm.runInNewContext('(function(val)'+functionRange(text,`function set ${field}(val)`).text+')',{isNaN})});
 return p;
}
test('pet life clamps only when written; reducing maximum alone does not clamp existing life',()=>{
 const p=pet();p.maxLife=100;p.life=200;assert.equal(p.life,100);p.life=-1;assert.equal(p.life,0);
 p.life=80;p.maxLife=20;assert.equal(p.life,80);p.life=NaN;assert.equal(p.life,80);
 p.life=p.life;assert.equal(p.life,20);
 p.maxLife=-5;p.life=1;assert.equal(p.life,-5,'upper comparison runs before lower comparison');
 p.life=-10;assert.equal(p.life,0);
});
test('other pet vital and combat accessors retain fractional and negative values, ignoring NaN',()=>{
 const p=pet();for(const field of fields.filter(f=>f!=='life')){
  p[field]=-1.25;assert.equal(p[field],-1.25);p[field]=NaN;assert.equal(p[field],-1.25);
  p[field]=123.5;assert.equal(p[field],123.5);
 }
});
