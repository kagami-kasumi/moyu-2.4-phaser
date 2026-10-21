import fs from 'node:fs';
import vm from 'node:vm';
const data=JSON.parse(fs.readFileSync('docs/reverse-engineering/player-experience/source-functions.json','utf8'));
const equipment=JSON.parse(fs.readFileSync('docs/reverse-engineering/inventory/source-functions.json','utf8')).functions;
const bagFunctions=JSON.parse(fs.readFileSync('docs/reverse-engineering/veteran-exchange/source-functions.json','utf8')).functions;
export function experienceOracle(vitals,bag=[],items={},bravery=0,rates={rateLife:15,rateMp:5,rateMinAttack:.2,rateMaxAttack:1.8,rateDefense:.3},titleLevel=0){
 const messages=[],panel={_global:{playSound(){},sysMsg:{addMsg:m=>messages.push(m)}},trace(){}};
 const context=vm.createContext(panel),fn=(body,args='')=>vm.runInContext('(function('+args+')'+body+')',context);
 const view={flashView(){}},eq={init:fn(equipment.equipmentInit),flashPic(){},role:{flashAttribute(){}},...view};
 for(const slot of ['头盔','衣服','武器','鞋','戒指','幸运符'])eq[slot]=items[slot]??{type:'空格'};
 eq.allItem=['头盔','衣服','武器','鞋'].map(k=>eq[k]);fn(equipment.equipmentStats).call(eq);
 const root={equipment:eq,roleAtrribute:view,fireDetail:view,rolePanel:view,friend:{levelsUp(){}},battleHuanShouPanel1:{},battleHuanShouPanel2:{},battleHuanShouPanel3:{}};
 const role={...rates,roleGod:false,life:vitals.life,mp:vitals.mp,maxLife:vitals.maxLife,maxMp:vitals.maxMp,maxExp:vitals.maxExp,xxx_nowExp:vitals.exp,setSecreteCode:v=>v,getSecreteCode:v=>v,changeDepth(){},升级光环:{gotoAndPlay(){}},_parent:{_parent:root},skillAttack:0,moreExpAttack:0,skillDefense:0,moreExpDefense:0,moreExpLife:0,moreExpMp:0,skillBurst:0,baseBurst:0,skillJook:0,baseJook:0,godFire:0,titleLevel,militaryRankFire:0,chawFire:0,moreExpFire:0,skillAddFire:0,skillLife:0,skillMp:0,lifeSourseLevels:0,mpSourseLevels:0};
 for(const [key,get,set]of [['levels','levelsGet','levelsSet'],['xxx_maxLevels','capGet','capSet'],['maxLevels','maxGet','maxSet']])Object.defineProperty(role,key,{get:fn(data.functions[get]),set:fn(data.functions[set],'val')});
 role.xxx_maxLevels=150;role.levels=vitals.level;
 for(const [alias,field]of [['xxx_burst','burst'],['xxx_jook','jook'],['xxx_maxLife','maxLife']])Object.defineProperty(role,alias,{get(){return this[field]},set(v){this[field]=v}});
 role.init=fn(data.functions.roleInit);role.flashAttribute=fn(data.functions.roleStats);role.expUp=fn(data.functions.expUp,'val');
 fn(equipment.skillEffect,'skillName,levels').call({role},'英勇',bravery);
 role.maxLife=vitals.maxLife;role.maxMp=vitals.maxMp;
 const bp={number:40};for(let i=0;i<40;i++)bp['包格'+(i+1)]={...(bag[i]??{type:'空格'}),setThing(item){for(const key of Object.keys(this))if(key!=='setThing')delete this[key];Object.assign(this,item);}};
 bp.accountThing=fn(bagFunctions.accountThing,'tThing');bp.useThing=fn(bagFunctions.useThing,'tThing,tNumber');
 const target={role,useExpball:fn(data.functions.use,'exp'),setThing:fn(data.functions.setThing,'target')};
 Object.assign(panel,{_parent:{backPack:bp,rolePanel:target},roleUse:{nowState:false},mainHuanShouView:{},openPanel(){this.opened=true;},setMainHuanShou(target){return fn(data.functions.target,'target').call(this,target??{});}});
 fn(data.functions.open).call(panel);
 return {role,messages,panel,grant:amount=>role.expUp(amount),confirm:()=>fn(data.functions.confirm).call(panel),bag:()=>Array.from({length:40},(_,i)=>{const item=bp['包格'+(i+1)];return item.type==='空格'?null:Object.fromEntries(Object.entries(item).filter(([k])=>k!=='setThing'));}),vitals:()=>({level:role.levels,exp:role.xxx_nowExp,maxExp:role.maxExp,life:role.life,mp:role.mp,maxLife:role.maxLife,maxMp:role.maxMp})};
}
