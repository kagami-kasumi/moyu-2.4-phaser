import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from './lib/as2-data.mjs';
import {itemFieldSemantics} from './lib/item-field-semantics.mjs';
import {classAccessorEvidence} from './lib/class-accessor-evidence.mjs';
test('item stack setters update label and capacity without clamping direct quantity writes',()=>{
 const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/ThingMC.as','utf8');
 const context={isNaN,ThingMC:{MAXNUM:99}},slot={setSecreteCode:v=>v,getSecreteCode:v=>v};
 const fn=(marker,args)=>vm.runInNewContext('(function('+args+')'+functionRange(source,marker).text+')',context);
 Object.defineProperty(slot,'number',{get:fn('function get number()',''),set:fn('function set number(val)','val')});
 Object.defineProperty(slot,'room',{get:fn('function get room()','')});
 slot.number=100;assert.equal(slot.number,100);assert.equal(slot.room,-1);assert.equal(slot.num,100);assert.equal(slot.maxNum,99);
 slot.number=0;assert.equal(slot.room,0);assert.equal(slot.num,'');
 slot.number=98;const add=fn('function addNumber(val)','val');assert.equal(add.call(slot,4),3);assert.equal(slot.number,99);
 assert.equal(add.call(slot,-2),0);assert.equal(slot.number,97);
 slot.number=NaN;assert.equal(slot.number,0);assert.equal(slot.num,'');
});

test('item numeric dictionary matches original getter/setter behavior on fresh and reused slots',()=>{
 const root='local-resources/moyu/source-index/as/scripts/__Packages/';
 const thing=fs.readFileSync(root+'ThingMC.as','utf8'),codec=fs.readFileSync(root+'SecreteCodeMC.as','utf8');
 const fields=itemFieldSemantics(thing,codec);assert.equal(fields.length,46);
 const context=vm.createContext({isNaN,SecreteCodeMC:{BASE:123456},ThingMC:{MAXNUM:99}});
 const compile=(text,marker,args)=>vm.runInContext('(function('+args+')'+functionRange(text,marker).text+')',context);
 const encode=compile(codec,'function setSecreteCode(val)','val'),decode=compile(codec,'function getSecreteCode(val)','val');
 for(const field of fields){
  const get=compile(thing,`function get ${field.property}()` ,''),set=compile(thing,`function set ${field.property}(val)`,'val');
  const slot={SECRETECODE:-3,setSecreteCode:encode,getSecreteCode:decode};
  assert.equal(get.call(slot),field.freshInstanceRead,field.property);
  // The negative source multiplier produces -0 after an explicit zero write.
  for(const input of [13,0,-5,1.25,'17']){set.call(slot,input);assert.ok(get.call(slot)===Number(input),field.property);}
  for(const absent of [undefined,NaN]){set.call(slot,11);set.call(slot,absent);assert.ok(get.call(slot)===(field.missingOrNaNWrite==='write-zero'?0:11),field.property);}
 }
 assert.throws(()=>itemFieldSemantics(thing,codec.replace('return 0;','return 1;')),/Unreviewed/);
 assert.throws(()=>itemFieldSemantics(thing.replace('this.不要作弊445 = this.setSecreteCode(val);','this.hiddenEffect = 1; this.不要作弊445 = this.setSecreteCode(val);'),codec),/Unreviewed item setter side effect/);
});

test('role and pet numeric read classifications execute the original getter and alias chains',()=>{
 const root='local-resources/moyu/source-index/as/scripts/__Packages/';
 for(const [name,base] of [['RoleMC','SecreteCodeMC'],['HuanShouClass','SecreteCode']]){
  const source=fs.readFileSync(root+name+'.as','utf8'),codec=fs.readFileSync(root+base+'.as','utf8');
  const entries=classAccessorEvidence(source,name+'.as',codec,base+'.as');assert.ok(entries.length>30,name);
  const context=vm.createContext({isNaN,[base]:{BASE:123456}});
  const slot={SECRETECODE:-3,getSecreteCode:vm.runInContext('(function(val)'+functionRange(codec,'function getSecreteCode(val)').text+')',context)};
  for(const entry of entries)Object.defineProperty(slot,entry.property,{get:vm.runInContext('(function()'+entry.getter.body+')',context)});
  for(const entry of entries){
   for(const sample of [0,11,-7,123.25]){
    slot[entry.backingField]=123456-3*sample;
    assert.ok(slot[entry.property]===sample,`${name}.${entry.property}`);
   }
  }
 }
});
