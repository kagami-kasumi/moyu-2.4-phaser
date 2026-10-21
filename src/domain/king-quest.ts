import {literalItem} from '../content/registry.ts';
import {MERIT_RULES} from '../content/merit-rules.ts';
import type {Inventory} from './inventory.ts';
import type {FirstQuestState} from './first-combat-quest.ts';

export class KingQuest {
 constructor(readonly state:FirstQuestState,readonly inventory:Inventory,private available:()=>boolean=()=>true){}
 get task(){const task=this.state.king??={number:0,isDoing:this.state.kingActive??false,isComplete:false};if(this.state.kingActive&&!task.isComplete)task.isDoing=true;return task;}
 get encounter(){return this.task.isDoing&&!this.task.isComplete;}
 get claimable(){return this.task.isDoing&&this.task.isComplete;}
 catchThing(name:string,count:number,level:number){
  if(!this.available()||level<1||!Number.isSafeInteger(count)||count<=0)return false;
  if(name==='怪物'){const honor=this.state.honor;if(!honor?.isDoing||honor.isComplete)return false;honor.number=Math.min(100,honor.number+count);honor.isComplete=honor.number===100;return true;}
  const task=this.task;if(name!=='魔军主将'||!task.isDoing||task.isComplete)return false;
  task.number=1;task.isComplete=true;this.state.swampActive=true;this.inventory.reward.messages.push('主线任务 接应国王完成，可领取奖励。');return true;
 }
 claim(position:{x:number;y:number},contains:(x:number,y:number)=>boolean){
  if(!this.available()||!this.claimable)return false;const inventory=this.inventory;
  inventory.reward.store(literalItem('超级经验球'),position,contains);this.state.honorPrompt=true;
  if(inventory.exploit<MERIT_RULES.nobility.cap)inventory.exploit=Math.min(MERIT_RULES.nobility.cap,inventory.exploit+1000);inventory.nobilityRank=inventory.chaw;
  if(inventory.militaryExploit<MERIT_RULES.military.cap){inventory.militaryExploit=Math.min(MERIT_RULES.military.cap,inventory.militaryExploit+1000);inventory.militaryRank=Math.max(inventory.militaryRank,MERIT_RULES.military.thresholds.filter(threshold=>inventory.militaryExploit>=threshold).length);}
  inventory.reward.res+=100000;this.task.isDoing=false;this.state.kingActive=false;inventory.refresh();inventory.reward.messages.push('已领取接应国王奖励：超级经验球、1000功勋、1000军功、100000资源。');return true;
 }
 answerHonor(accept:boolean){
  if(!this.available()||!this.state.honorPrompt)return false;this.state.honorPrompt=false;
  const task=this.state.honor??={number:0,isDoing:false,isComplete:false};if(!accept){task.isDoing=false;return true;}if(task.isDoing)return false;
  Object.assign(task,{number:0,isDoing:true,isComplete:false});this.inventory.reward.messages.push('接受日常任务 荣誉任务；消灭100怪后到皇宫国王处领奖。');return true;
 }
}
