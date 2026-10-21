import type {Item,NpcReward} from './npc-reward.ts';
import {ITEM_STACK_RULES} from '../content/item-stack-rules.ts';
export interface WarehouseState {items:(Item|null)[];reserved:number[]}
export class Warehouse {
 readonly capacity=54;items:(Item|null)[]=Array.from({length:54},()=>null);reserved:number[]=[];open=false;revision=0;feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean=()=>true){}
 show(){if(!this.available())return;this.open=true;this.revision++;}close(){this.open=false;this.revision++;}
 private valid(revision:number){return this.open&&this.available()&&revision===this.revision;}
 deposit(index:number,item:Item,revision=this.revision){
  if(!this.valid(revision)||this.reward.bag[index]!==item)return false;const remaining={...item};let moved=false;
  if((remaining.number??0)>0){for(let n=0;n<this.capacity;n++){const slot=this.items[n];if(this.reserved.includes(n)||!slot||slot.type!==remaining.type||slot.name!==undefined&&slot.name!==remaining.name||(slot.number??0)<=0||slot.number!>=ITEM_STACK_RULES.maxQuantity)continue;const amount=Math.min(remaining.number!,ITEM_STACK_RULES.maxQuantity-slot.number!);slot.number!+=amount;remaining.number!-=amount;moved=true;if(remaining.number!<=0){this.reward.bag[index]=null;this.revision++;this.feedback='已存入 '+(item.name??item.type);return true;}}}
  const free=this.items.findIndex((v,n)=>!v&&!this.reserved.includes(n));if(free>=0){this.items[free]={...remaining,number:remaining.number??0};this.reward.bag[index]=null;this.revision++;this.feedback='已存入 '+(item.name??item.type);return true;}
  if(moved){this.reward.bag[index]=remaining;this.revision++;this.feedback=`仓库已满，剩余 ${remaining.number} 件保留在背包。`;}else this.feedback='仓库已满，物品保留在背包。';return false;
 }
 withdraw(index:number,item:Item,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){if(!this.valid(revision)||this.reserved.includes(index)||this.items[index]!==item)return false;const before=this.reward.drops.length;this.reward.store(item,position,contains);this.items[index]=null;this.revision++;this.feedback=this.reward.drops.length>before?'背包已满，取回物品掉落在地上。':'已取回 '+(item.name??item.type);return true;}
}
