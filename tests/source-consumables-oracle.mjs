import fs from 'node:fs';import vm from 'node:vm';
import {experienceOracle} from './source-experience-oracle.mjs';
const f=JSON.parse(fs.readFileSync('docs/reverse-engineering/character-consumables/source-functions.json','utf8')).functions;
const b=JSON.parse(fs.readFileSync('docs/reverse-engineering/veteran-exchange/source-functions.json','utf8')).functions;
export function consumablesOracle(inv,panels=[]){
 const base=experienceOracle(inv.vitals,[],inv.equipment,inv.bravery,undefined,inv.reward.titleLevel),role=base.role;
 Object.assign(role,structuredClone(inv.consumables));
 const context=vm.createContext({_global:{sysMsg:{addMsg(){}},playSound(){}},_root:{XPPower:{maxPower:inv.consumables.maxPower,maxTopPower:6,isFull:inv.consumables.isFull}},trace(){}});
 const fn=(body,args='')=>vm.runInContext('(function('+args+')'+body+')',context);
 for(const prop of ['life','mp']){const value=role[prop];Object.defineProperty(role,prop,{get:fn(f['get_'+prop]),set:fn(f['set_'+prop],'val'),configurable:true});role.changeHpMp=()=>{};role[prop]=value;if(prop==='life')role.不要作弊444=value;}
 const slots=inv.reward.bag.map(item=>({...structuredClone(item??{type:'空格'}),hitTest(){return true;},setThing(value){for(const key of Object.keys(this))if(!['setThing','hitTest'].includes(key))delete this[key];Object.assign(this,value);}}));
 const bp={number:40,accountThing:fn(b.accountThing,'tThing'),useThing:fn(b.useThing,'tThing,tNumber')};slots.forEach((item,i)=>bp['包格'+(i+1)]=item);
 const panel={role,setThing:fn(f.setThing,'target')};context.rolePanel=panel;
 const root={map:{role},rolePanel:panel,backPack:bp,fastKey:{}};
 for(let i=0;i<3;i++)root['battleHuanShouPanel'+(i+1)]={...(structuredClone(panels[i])??{isOpen:false,huanShou:{life:0,maxLife:0},body:{life:0,maxLife:0}}),role,setThing:fn(f.petSetThing,'target')};
 return {role,root,xp:context._root.XPPower,use:index=>fn(f.useItem,'item').call(root,slots[index]),bag:()=>slots.map(x=>x.type==='空格'?null:Object.fromEntries(Object.entries(x).filter(([k])=>!['hitTest','setThing'].includes(k))))};
}
