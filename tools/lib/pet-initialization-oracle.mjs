// Bounded offline constructor oracle. Never imported by the game runtime.
import vm from 'node:vm';
import {functionRange} from './as2-data.mjs';
import {initializationEvidence} from './initialization-evidence.mjs';
export function petInitializationOracle(source,codec,randomValue=0){
 if(![0,1,2].includes(randomValue))throw Error('Expected one of three next-life growth draws');
 const context=vm.createContext({isNaN,random:n=>{if(n!==3)throw Error('Unreviewed constructor random domain');return randomValue;},SecreteCode:{BASE:123456}});
 const compile=(text,marker,args='')=>vm.runInContext('(function('+args+')'+functionRange(text,marker).text.replace(/\bsuper\(\);/,'')+')',context);
 const prototype={};
 for(const m of source.matchAll(/function (get|set) ([\p{L}\p{N}_]+)\(([^)]*)\)/gu)){
  const descriptor=Object.getOwnPropertyDescriptor(prototype,m[2])??{configurable:true,enumerable:true};
  descriptor[m[1]]=compile(source,m[0],m[3]);Object.defineProperty(prototype,m[2],descriptor);
 }
 for(const method of ['initialize','checkUp','moreAttribute','flashAttribute'])prototype[method]=compile(source,'function '+method+'()');
 prototype.getSecreteCode=compile(codec,'function getSecreteCode(val)','val');prototype.setSecreteCode=compile(codec,'function setSecreteCode(val)','val');
 const construct=compile(source,'function HuanShouClass(hs)','hs');
 const seeds=initializationEvidence(source,'__Packages/HuanShouClass.as','HuanShouClass').filter(s=>s.phase==='class-declaration');
 return seed=>{
  const target=Object.create(prototype);target.SECRETECODE=-3;
  for(const field of seeds){
   let value=field.value;
   if(value&&typeof value==='object'&&'expression' in value){
    if(value.expression!=='random(3) * 0.1 + 1.3')throw Error('Unreviewed pet field '+field.property);
    value=vm.runInContext(value.expression,context);
   }
   target[field.property]=structuredClone(value);
  }
  construct.call(target,seed);return target;
 };
}
