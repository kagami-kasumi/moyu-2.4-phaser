import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {roleAttributes,ROLE_PLAIN_NUMERIC_FIELDS,roleNumericWrite,ROLE_NUMERIC_ALIASES} from '../src/content/role-attribute-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
const source=fs.readFileSync(root+'__Packages/RoleMC.as','utf8');
const codec=fs.readFileSync(root+'__Packages/SecreteCodeMC.as','utf8');
const compile=(text,marker,args='')=>vm.runInNewContext('(function('+args+')'+functionRange(text,marker).text+')',{SecreteCodeMC:{BASE:123456},trace(){}});
test('all plain role accessors preserve negative/fractional values and reject NaN independently of codec',()=>{
 const x={SECRETECODE:-7,getSecreteCode:compile(codec,'function getSecreteCode(val)','val'),setSecreteCode:compile(codec,'function setSecreteCode(val)','val')};
 for(const field of ROLE_PLAIN_NUMERIC_FIELDS){
  Object.defineProperty(x,field,{get:compile(source,`function get ${field}()`),set:compile(source,`function set ${field}(val)`,'val')});
  let current=0;for(const next of [-100,0,3.25,999,NaN]){x[field]=next;current=roleNumericWrite(current,next);assert.equal(x[field]+0,current,field);}
 }
 for(const [alias,underlying] of Object.entries(ROLE_NUMERIC_ALIASES)){
  const getter=compile(source,`function get ${alias}()`);if(!Object.hasOwn(x,underlying))x[underlying]=17;
  assert.equal(getter.call(x),x[underlying]);
 }
});
test('derived stats match original init and flashAttribute, including panels, omitted jobFire and rounding order',()=>{
 const refresh=compile(source,'function flashAttribute()'),init=compile(source,'function init()');
 const fields=['maxLife','maxMp','minAttack','maxAttack','defense','burst','jook','moreMinAttack','moreMaxAttack','moreDefense','reduceDamage','moreExp','moreLife','moreMp','wind','soil','fire','water','renew','attackFire'];
 for(const level of [1,14,15,119,120,150])for(const useEquipment of [false,true])for(const mask of [0,1,3,7]){
  const role={levels:level,skillAttack:6,moreExpAttack:9,skillDefense:8,moreExpDefense:7,moreExpLife:11,moreExpMp:13,skillBurst:5,baseBurst:3,skillJook:5,baseJook:2,godFire:NaN,titleLevel:4,militaryRankFire:7,chawFire:9,jobFire:9999,moreExpFire:3,skillAddFire:10,skillLife:130,skillMp:50,rateLife:6.3,rateMp:2.1,rateMinAttack:1.1,rateMaxAttack:3.3,rateDefense:2.7,lifeSourseLevels:2,mpSourseLevels:3};
  const equipment=Object.fromEntries(fields.map((f,i)=>[f,i+1]));
  const panels=Array.from({length:3},(_,i)=>({isOpen:!!(mask&(1<<i)),inOne:i!==1,minAttack:7,maxAttack:13,defense:17,attackFire:19}));
  const view={flashView(){}};const parent={equipment:useEquipment?{...equipment,...view}:undefined,roleAtrribute:view,fireDetail:view,rolePanel:view};
  panels.forEach((p,i)=>parent['battleHuanShouPanel'+(i+1)]={...p,huanShou:{inOne:p.inOne}});
  const x={...role,init,_parent:{_parent:parent}};
  for(const [alias,field]of [['xxx_burst','burst'],['xxx_jook','jook'],['xxx_maxLife','maxLife']])Object.defineProperty(x,alias,{get(){return this[field]},set(v){this[field]=v}});
  // AS2 missing MovieClip method calls are no-ops; JS requires a view stub.
  if(!useEquipment){Object.defineProperty(parent,'equipment',{get(){return readCount++<1?undefined:view}});var readCount=0;}
  refresh.call(x);const actual=roleAttributes(role,useEquipment?equipment:undefined,panels);
  for(const field of fields)assert.equal(actual[field],x[field],`${level}/${useEquipment}/${mask}/${field}`);
  assert.equal(actual.maxLifeSourse,x.maxLife*2);assert.equal(actual.maxMpSourse,x.maxMp*3);
 }
});
