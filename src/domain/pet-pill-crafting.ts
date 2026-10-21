import {literalItem} from '../content/registry.ts';
import type {Item,NpcReward} from './npc-reward.ts';
export const PILL_RECIPES=[{type:'宝石',name:'灵魂晶石',count:10,output:1,cmd:118},{type:'灵魂礼包',name:undefined,count:1,output:1,cmd:119},{type:'宝石',name:'灵魂王',count:1,output:2,cmd:120}] as const;
function consume(bag:(Item|null)[],recipe:typeof PILL_RECIPES[number]){
 const matches=(v:Item|null):v is Item=>v?.type===recipe.type&&(v.name===recipe.name||v.name===undefined),items=bag.filter(matches);
 if(items.some(v=>!Number.isInteger(v.number??0)||Number(v.number??0)<0)||items.reduce((n,v)=>n+(v.number||1),0)<recipe.count)return false;
 let remaining:number=recipe.count;for(let n=0;n<bag.length&&remaining>0;n++){const v=bag[n];if(!matches(v??null))continue;const count=v!.number||1;if(count>remaining){v!.number=count-remaining;remaining=0;}else{remaining-=count;bag[n]=null;}}return true;
}
export class PetPillCrafting {
 open=false;revision=0;selected:number|null=null;feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean){}
 interact(){if(!this.available())return false;this.reward.close();this.open=true;this.selected=null;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.selected=null;this.revision++;}
 private valid(revision:number){return this.open&&this.available()&&revision===this.revision;}
 select(index:number,revision=this.revision){if(!this.valid(revision)||!Number.isInteger(index)||!PILL_RECIPES[index])return false;this.selected=index;this.feedback='';this.revision++;return true;}
 cancel(revision=this.revision){if(!this.valid(revision))return false;this.selected=null;this.feedback='已取消，材料保留';this.revision++;return true;}
 confirm(revision=this.revision){if(!this.valid(revision)||this.selected===null)return false;const index=this.selected,recipe=PILL_RECIPES[index]!,r=this.reward;this.revision++;this.selected=null;if(r.ms<=1000||!consume(r.bag,recipe)){this.feedback=index===0?'你的魔石不够或没有足够的灵魂晶石了。':index===1?'你的魔石不够或没有足够的灵魂礼包了。':'你的魔石不够或没有灵魂王了。';return false;}for(let n=0;n<recipe.output;n++)r.store(literalItem('幻兽转世丹'),this.position(),this.contains);r.ms-=1000;this.feedback='获得 幻兽转世丹'+(recipe.output===2?' 2个':'');r.messages.push(this.feedback);return true;}
}
