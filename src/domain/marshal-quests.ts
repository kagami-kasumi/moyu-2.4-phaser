import {literalItem} from '../content/registry.ts';
import {MERIT_RULES} from '../content/merit-rules.ts';
import type {Inventory} from './inventory.ts';
export type MarshalKind='军衔'|'爵位';
export interface MarshalTask {number:number;isDoing:boolean;isComplete:boolean}
export type MarshalState=[MarshalTask,MarshalTask];
export const initialMarshalQuests=():MarshalState=>[{number:0,isDoing:false,isComplete:false},{number:0,isDoing:false,isComplete:false}];
export const MARSHAL_TASKS=[{name:'军衔',target:'龙怪头目',need:1,prize:'幸运之门'},{name:'爵位',target:'龙怪精英',need:5,prize:'风元素'}] as const;
/** Source branchTask 0/1. UI confirmations belong to the palace session. */
export class MarshalQuests {
 constructor(readonly state:MarshalState,readonly inventory:Inventory,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean){}
 eligible(kind:MarshalKind){return kind==='军衔'?this.inventory.currentMilitaryRank===0:this.inventory.chaw===0;}
 accept(kind:MarshalKind){const n=kind==='军衔'?0:1,q=this.state[n];if(!this.eligible(kind)||q.isDoing)return false;q.isDoing=true;if(n===0)this.inventory.reward.store(literalItem('龙怪头目行踪'),this.position(),this.contains);this.inventory.reward.messages.push('接到支线任务 '+kind+'任务');return true;}
 catchThing(name:string,count:number,level:number){for(let n=1;n>=0;n--){const d=MARSHAL_TASKS[n]!,q=this.state[n]!;if(q.isDoing&&q.number<d.need&&name===d.target&&level>=1&&Number.isFinite(count)&&count>0){q.number+=Math.min(count,d.need-q.number);q.isComplete=q.number===d.need;if(q.isComplete)this.inventory.reward.messages.push('支线任务 '+d.name+'任务完成');return true;}}return false;}
 claim(kind:MarshalKind){const n=kind==='军衔'?0:1,q=this.state[n],i=this.inventory;if(!q.isDoing||!q.isComplete)return false;
  // getPrize walks the source prize array backwards: factory/drop randomness before merit.
  i.reward.store(literalItem(MARSHAL_TASKS[n].prize),this.position(),this.contains);
  if(n===0){if(i.militaryExploit<MERIT_RULES.military.cap){i.militaryExploit=Math.min(MERIT_RULES.military.cap,i.militaryExploit+1000);i.militaryRank=Math.max(i.militaryRank,MERIT_RULES.military.thresholds.filter(t=>i.militaryExploit>=t).length);}}
  else{if(i.exploit<MERIT_RULES.nobility.cap)i.exploit=Math.min(MERIT_RULES.nobility.cap,i.exploit+1000);i.nobilityRank=i.chaw;}
  q.isDoing=false;i.refresh();i.reward.messages.push('已领取'+kind+'奖励：'+MARSHAL_TASKS[n].prize+'、1000'+(n===0?'军功':'功勋'));return true;
 }
}
