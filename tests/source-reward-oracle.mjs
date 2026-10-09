// Offline AS2 snippets in bounded display-object substitutes, never shipped.
import fs from 'node:fs';
import vm from 'node:vm';
import {installRoleCurrency} from './source-role-currency-oracle.mjs';
const initial=JSON.parse(fs.readFileSync('docs/reverse-engineering/npc-reward/initial-source.json','utf8'));
const {functions:f}=JSON.parse(fs.readFileSync('docs/reverse-engineering/npc-reward/behavior-source.json','utf8'));
export function rewardOracle(random=n=>0,exchange,options={}){
 const messages=[],drops=[],pets=[],scope={Math,random,ringMainValue:{moreAttack:[5],moreDefense:[15],moreLife:[5],moreMp:[10]},_global:{战士weaponName:['长军刀'],战士clotheName:['锁环甲'],战士helmetName:['蓝色深邃'],战士shoesName:['野蛮行径'],sysMsg:{addMsg:m=>messages.push(m)}}};
 Object.assign(scope._global,{法师weaponName:['蛇杖'],法师clotheName:['旅者装'],法师helmetName:['紫色占卜'],法师shoesName:['虚幻圆舞']});
 const context=vm.createContext(scope),fn=(args,body)=>vm.runInContext(`(function(${args})${body})`,context);
 vm.runInContext(initial.tables+'\n'+initial.ring,context);
 const initialSkills=[];const root={backPack:{number:40},huanShou:{allHuanShou:pets},roleSkills:{addSkill(name){initialSkills.push(name);this.技能格1.skill={name};},技能格1:{skill:{name:'斩魂'}}},fastKey:{包格5:{setThing(item){this.item=item;}}},task:{nextMainTask(){this.index=options.profession==='法师'?1:0;}}};
 const map={_parent:root,role:{vocational:options.profession??'战士',myName:options.name??'玩家',levels:1,xxx_credit:0,_x:277.8,_y:421.6},ground:{hitTest:()=>true}};
 installRoleCurrency(map.role);
 const goods={_parent:map,allGoods:drops,getNextHighestDepth:()=>drops.length,attachMovie(link,name,depth,position){this[name]={x:position._x,y:position._y};}};map.goods=goods;root.map=map;scope._root=root;
 root.delivery=(item,d)=>d.item=JSON.parse(JSON.stringify({...item,number:item.number??0}));const throwSource=fn('toX,toY,target',f.throwGoods);scope._parent=map;
 goods.throwGoods=(x,y,item)=>throwSource.call(goods,x,y,{...item,setThing(){}});
 const bag=root.backPack;bag._parent=root;bag.setThing=fn('target',f.setThing);
 if(exchange){bag.accountThing=fn('tThing',exchange.accountThing);bag.useThing=fn('tThing,tNumber',exchange.useThing);}
 for(let i=1;i<=40;i++){const slot={type:'空格',number:0,maxNum:99,setThing(target){for(const k of Object.keys(this))if(!['setThing','addNumber','maxNum','room'].includes(k))delete this[k];Object.assign(this,target);this.number=target.number??0;},get room(){return this.number>0?99-this.number:0;}};slot.addNumber=fn('val',f.addNumber);bag['包格'+i]=slot;}
 root.upDataWeapon=fn('target',f.upDataWeapon);root.createThing=fn('tThing,isDrop,fX,fY',f.createThing);
 root.useItem=()=>pets.push({...JSON.parse(JSON.stringify(vm.runInContext('('+initial.pet.match(/addHuanShou\((\{[^}]+\})\)/)[1]+')',context))),battle:false});root.huanShou.battle=p=>p.battle=true;
 scope._parent=root;scope.wudi=()=>fn('',JSON.parse(fs.readFileSync('docs/reverse-engineering/original-ui/behavior-source.json','utf8'))['DefineSprite_4536/frame_2/DoAction.as'].as.split('function wudi()')[1].split('function setMonistLv')[0]).call(map);fn('',f.initNewGame).call(map);
 if(options.debug){const text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/DefineSprite_4536/frame_2/DoAction.as','utf8');fn('',text.slice(text.indexOf('{'),text.indexOf('function wudi()'))).call(map);}
 const npc={_parent:map,myID:{cmd:1},nextCmd:1,words:'',answer:[],clearAnswer(){scope.answer=[];},openDialog(){scope.open=true;},closeDialog(){scope.open=false;}};
 Object.assign(scope,{_parent:map,myID:npc.myID,nextCmd:1,words:'',answer:[],open:false,closeDialog:npc.closeDialog});npc.command=fn('',exchange?.command??f.command);scope.command=()=>npc.command.call(npc);npc.setCommand=fn('cmd',f.setCommand);
 return {root,map,initialSkills,npc,scope,messages,drops,pets,interact(){npc.command.call(npc);},choose(cmd){npc.setCommand.call(npc,cmd);},close(){scope.open=false;},bag(){return Array.from({length:40},(_,i)=>{const s=bag['包格'+(i+1)];if(s.type==='空格')return null;return JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(s).filter(([k,v])=>!['maxNum','room'].includes(k)&&typeof v!=='function'))));});}};
}
