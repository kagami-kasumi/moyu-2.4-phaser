import {literalItem} from '../content/registry.ts';
import {MERIT_RULES} from '../content/merit-rules.ts';
import type {Inventory} from './inventory.ts';
import type {FirstQuestState} from './first-combat-quest.ts';

export class AbyssQuest {
 constructor(readonly state:FirstQuestState,readonly inventory:Inventory,private available:()=>boolean=()=>true){}
 get task(){const task=this.state.blackAbyss??={number:0,isDoing:this.state.blackAbyssActive??false,isComplete:false};if(this.state.blackAbyssActive&&!task.isComplete)task.isDoing=true;return task;}
 get encounter(){return this.task.isDoing&&!this.task.isComplete;}
 get claimable(){return this.task.isDoing&&this.task.isComplete;}
 catchThing(name:string,count:number,level:number){
  if(!this.available()||level<1||!Number.isSafeInteger(count)||count<=0)return false;

  const task=this.task;if(name!=='魔军主将'||!task.isDoing||task.isComplete)return false;
  task.number=1;task.isComplete=true;this.state.firstLegionActive=true;this.state.firstLegionRebirth=(this.state.firstLegionRebirth??0)+1;this.inventory.reward.messages.push('主线任务 进入黑渊完成，可领取奖励。');return true;
 }
 claim(position:{x:number;y:number},contains:(x:number,y:number)=>boolean){
  if(!this.available()||!this.claimable)return false;const inventory=this.inventory;
  inventory.reward.store(literalItem('超级经验球'),position,contains);
  if(inventory.exploit<MERIT_RULES.nobility.cap)inventory.exploit=Math.min(MERIT_RULES.nobility.cap,inventory.exploit+2000);inventory.nobilityRank=inventory.chaw;
  if(inventory.militaryExploit<MERIT_RULES.military.cap){inventory.militaryExploit=Math.min(MERIT_RULES.military.cap,inventory.militaryExploit+2000);inventory.militaryRank=Math.max(inventory.militaryRank,MERIT_RULES.military.thresholds.filter(threshold=>inventory.militaryExploit>=threshold).length);}
  inventory.reward.res+=250000;this.task.isDoing=false;this.state.blackAbyssActive=false;inventory.refresh();inventory.reward.messages.push('已领取进入黑渊奖励：超级经验球、2000功勋、2000军功、250000资源。');return true;
 }
}
