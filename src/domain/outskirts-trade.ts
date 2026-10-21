import {literalItem} from '../content/registry.ts';
import type {Item,NpcReward} from './npc-reward.ts';
const sales:Record<number,readonly [number,number]>={3104:[1000,8],3105:[10000,85],3106:[100000,850],3107:[500000,4250]};
/** AS2 backPack.useThing: unnamed cells also match; consume in ascending slot order. */
export function consumeTradeMaterial(bag:(Item|null)[],name:string,cost:number){
 const matches=(i:Item|null):i is Item=>i?.type==='宝石'&&(i.name===name||i.name===undefined);
 if(bag.reduce((n,i)=>n+(matches(i)?(!i.number||Number.isNaN(i.number)?1:i.number):0),0)<cost)return false;
 for(let n=0;n<bag.length&&cost>0;n++){const i=bag[n];if(!matches(i??null))continue;if(!i!.number){bag[n]=null;cost--;}else if(i!.number!>cost){i!.number!-=cost;cost=0;}else{cost-=i!.number!;bag[n]=null;}}
 return true;
}
export class OutskirtsTrade {
 open=false;revision=0;page:'main'|'sales'|'missing'='main';words='';feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean){}
 interact(){if(!this.available())return false;this.reward.close();this.open=true;this.page='main';this.words='';this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.revision++;}
 get choices(){return this.page==='sales'?[3104,3105,3106,3107,3011]:this.page==='missing'?[3011]:[3103,3108,3109,13111];}
 choose(cmd:number,revision=this.revision){
  if(!this.open||revision!==this.revision||!this.available()||!this.choices.includes(cmd))return false;
  this.revision++;this.feedback='';const r=this.reward,msg=(s:string)=>{r.messages.push(s);this.feedback=s;};
  if(cmd===3011){this.page='main';this.words='';return true;}if(cmd===3103){this.page='sales';return true;}
  const sale=sales[cmd];if(sale){const [cost,gain]=sale;if(r.res<cost)msg('你的资源不够,出售失败');else{r.res-=cost;msg(`成功出售${cost.toLocaleString('en-US')}资源,获得${gain.toLocaleString('en-US')}魔石`);r.ms+=gain;}return true;}
  let item:string;
  if(cmd===13111){if(r.credit<5){msg('你的声望不够');return true;}if(r.ms<888){msg('你的魔石不够');return true;}r.credit-=5;r.ms-=888;item='50级PK赛参赛券';}
  else {const name=cmd===3108?'灵魂晶石':'魔魂之心';if(!consumeTradeMaterial(r.bag,name,cmd===3108?5:1)){this.page='missing';this.words=cmd===3108?'你没有足够的灵魂晶石。':'你没有魔魂之心。';return true;}item=cmd===3108?'亚维特岛地图':'蜘蛛谷地图';}
  r.store(literalItem(item),this.position(),this.contains);msg('获得物品 '+item);this.close();return true;
 }
}
