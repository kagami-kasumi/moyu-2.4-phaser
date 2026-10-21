import {literalItem} from '../content/registry.ts';
import {MERIT_RULES} from '../content/merit-rules.ts';
import type {Inventory} from './inventory.ts';
import type {FirstQuestState} from './first-combat-quest.ts';

export class FrostQuest {
 constructor(readonly state:FirstQuestState,readonly inventory:Inventory,private available:()=>boolean=()=>true){}
 get task(){const task=this.state.icePalace??={number:0,isDoing:this.state.icePalaceActive??false,isComplete:false};if(this.state.icePalaceActive&&!task.isComplete)task.isDoing=true;return task;}
 get encounter(){return this.task.isDoing&&!this.task.isComplete;}
 get claimable(){return this.task.isDoing&&this.task.isComplete;}
 catchThing(name:string,count:number,level:number){
  if(!this.available()||level<1||!Number.isSafeInteger(count)||count<=0)return false;

  const task=this.task;if(name!=='魔军主将'||!task.isDoing||task.isComplete)return false;
  task.number=1;task.isComplete=true;this.state.blackAbyssActive=true;this.inventory.reward.messages.push('主线任务 进入冰宫完成，可领取奖励。');return true;
 }
 claim(position:{x:number;y:number},contains:(x:number,y:number)=>boolean){
  if(!this.available()||!this.claimable)return false;const inventory=this.inventory;
  inventory.reward.store(literalItem('超级经验球'),position,contains);
  if(inventory.exploit<MERIT_RULES.nobility.cap)inventory.exploit=Math.min(MERIT_RULES.nobility.cap,inventory.exploit+2000);inventory.nobilityRank=inventory.chaw;
  if(inventory.militaryExploit<MERIT_RULES.military.cap){inventory.militaryExploit=Math.min(MERIT_RULES.military.cap,inventory.militaryExploit+2000);inventory.militaryRank=Math.max(inventory.militaryRank,MERIT_RULES.military.thresholds.filter(threshold=>inventory.militaryExploit>=threshold).length);}
  inventory.reward.res+=200000;this.task.isDoing=false;this.state.icePalaceActive=false;inventory.refresh();inventory.reward.messages.push('已领取进入冰宫奖励：超级经验球、2000功勋、2000军功、200000资源。');return true;
 }
}
