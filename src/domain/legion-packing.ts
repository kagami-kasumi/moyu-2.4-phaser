import {literalItem} from '../content/registry.ts';
import {consumeTradeMaterial} from './outskirts-trade.ts';
import type {NpcReward} from './npc-reward.ts';
export const PACKING=[{material:'灵魂晶石',pack:'灵魂礼包',cmd:156},{material:'幻魔之心',pack:'幻魔礼包',cmd:158},{material:'魔魂之心',pack:'魔魂礼包',cmd:160}] as const;
export class LegionPacking {
 open=false;revision=0;selected:number|null=null;feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean){}
 interact(){if(!this.available())return false;this.reward.close();this.open=true;this.selected=null;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.selected=null;this.revision++;}
 private valid(revision:number){return this.open&&this.available()&&revision===this.revision;}
 select(index:number,revision=this.revision){if(!this.valid(revision)||!Number.isInteger(index)||!PACKING[index])return false;this.selected=index;this.feedback='';this.revision++;return true;}
 cancel(revision=this.revision){if(!this.valid(revision))return false;this.selected=null;this.feedback='';this.revision++;return true;}
 confirm(revision=this.revision){if(!this.valid(revision)||this.selected===null)return false;const choice=PACKING[this.selected]!;this.revision++;if(!consumeTradeMaterial(this.reward.bag,choice.material,10)){this.feedback=`需要带足10个${choice.material}放在物品栏里我才能帮你打包。`;this.selected=null;return false;}this.reward.store(literalItem(choice.pack),this.position(),this.contains);this.feedback='获得 '+choice.pack;this.reward.messages.push(this.feedback);this.close();return true;}
}
