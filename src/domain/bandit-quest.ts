import {literalItem} from '../content/registry.ts';
import {MERIT_RULES} from '../content/merit-rules.ts';
import type {Inventory} from './inventory.ts';
import type {FirstQuestState} from './first-combat-quest.ts';

export class BanditQuest {
 constructor(readonly state:FirstQuestState,readonly inventory:Inventory){}
 get task(){
  const task=this.state.bandits??={number:0,isDoing:this.state.nextActive??false,isComplete:false};
  if(this.state.nextActive&&!task.isComplete)task.isDoing=true;
  return task;
 }
 get encounter(){return this.task.isDoing&&!this.task.isComplete;}
 get claimable(){return this.task.isDoing&&this.task.isComplete;}
 catchThing(name:string,count:number,level:number){
  const task=this.task;
  if(name!=='强盗首领'||!task.isDoing||task.isComplete||level<1||!Number.isFinite(count)||count<=0)return false;
  task.number=Math.min(1,task.number+count);task.isComplete=task.number===1;
  if(task.isComplete){this.state.kingActive=true;if(this.state.king)this.state.king.isDoing=true;this.inventory.reward.messages.push('主线任务 消灭强盗完成，可领取奖励。');}
  return true;
 }
 claim(position:{x:number;y:number},contains:(x:number,y:number)=>boolean){
  if(!this.claimable)return false;
  const inventory=this.inventory;
  if(inventory.exploit<MERIT_RULES.nobility.cap)inventory.exploit=Math.min(MERIT_RULES.nobility.cap,inventory.exploit+500);
  inventory.nobilityRank=inventory.chaw;
  if(inventory.militaryExploit<MERIT_RULES.military.cap){
   inventory.militaryExploit=Math.min(MERIT_RULES.military.cap,inventory.militaryExploit+500);
   inventory.militaryRank=Math.max(inventory.militaryRank,MERIT_RULES.military.thresholds.filter(threshold=>inventory.militaryExploit>=threshold).length);
  }
  inventory.reward.store(literalItem('英雄令'),position,contains);
  this.task.isDoing=false;this.state.nextActive=false;inventory.refresh();
  inventory.reward.messages.push('已领取消灭强盗奖励：500功勋、500军功、英雄令。');return true;
 }
}
