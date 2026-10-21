import type {Item,NpcReward} from './npc-reward.ts';import {literalItem} from '../content/registry.ts';
export const RECYCLE_ARMOR=['武器','衣服','头盔','鞋'];
export const RECYCLE_TYPES=[...RECYCLE_ARMOR,'庇护铃铛','翡翠铃铛','凤翼铃铛'];
export type RecycleMode='experience'|'dismantle';
export interface RecyclePlan {ok:boolean;reason:string;items:Item[]}
export function recyclePlan(item:Item|null,mode:RecycleMode):RecyclePlan {
 const fail=(reason:string)=>({ok:false,reason,items:[]});if(!item||!RECYCLE_TYPES.includes(item.type))return fail('请选择可回收装备');
 const grade=Number(item.grade),holes=Number(item.holes??0);if(!Number.isInteger(grade)||grade<0||grade>6||!Number.isInteger(holes)||holes<0||holes>3)return fail('装备品质或孔数尚不可回收');
 if(mode==='experience'){const count=grade+1+[0,1,3,6][holes]!;return {ok:true,reason:`兑换为${count}个经验球`,items:[{type:'经验球',number:count,salePrice:50}]};}
 if(!RECYCLE_ARMOR.includes(item.type))return fail('这个东西不能分解');if(Number(item.number??0)>0)return fail('正数量装备暂不支持分解，请取回；避免重复生成材料');
 const items:Item[]=[],add=(name:string,n=1)=>{for(let i=0;i<n;i++)items.push(literalItem(name));};
 const base=['魔魂晶石','幻魔晶石','灵魂晶石','灵魂晶石','小元素石','大元素石'][grade];if(base)add(base,grade===3?2:1);
 if(holes===1)add('初级月光宝盒');if(holes===2)add('初级月光宝盒',3);if(holes===3)add('中级月光宝盒',2);
 if(Number(item.levels)>=60)add('幻魔之心');add('魔魂之心',Math.min(7,Math.max(0,Math.floor(Number(item.mhdj??0)/6))));const element=['','风元素','火元素','水元素','地元素','雷元素'][Number(item.element??0)];if(element)add(element);
 return {ok:true,reason:items.length?'分解后获得下列材料':'此装备按原规则分解没有产物，确认后仍会消耗装备',items};
}
export class EquipmentRecycle {
 item:Item|null=null;open=false;revision=0;pending:RecycleMode|null=null;feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean){}
 show(){if(!this.available())return false;this.open=true;this.pending=null;this.revision++;return true;}
 close(){this.open=false;this.pending=null;this.revision++;}
 private valid(rev:number){return this.open&&this.available()&&rev===this.revision;}
 select(index:number,expected:Item,rev=this.revision){if(!this.valid(rev)||this.reward.bag[index]!==expected||!RECYCLE_TYPES.includes(expected.type))return false;this.reward.bag[index]=null;if(this.item)this.reward.store(this.item,this.position(),this.contains);this.item={...expected};this.pending=null;this.feedback='已放入 '+(expected.name??expected.type);this.revision++;return true;}
 take(rev=this.revision){if(!this.valid(rev)||!this.item)return false;const count=this.reward.drops.length;this.reward.store(this.item,this.position(),this.contains);this.item=null;this.pending=null;this.revision++;this.feedback=this.reward.drops.length>count?'背包已满，取回物品掉落在地上':'已取回物品';return true;}
 request(mode:RecycleMode,rev=this.revision){if(!this.valid(rev)||!['experience','dismantle'].includes(mode))return false;const plan=recyclePlan(this.item,mode);this.revision++;this.feedback=plan.reason;this.pending=plan.ok?mode:null;return plan.ok;}
 cancel(rev=this.revision){if(!this.valid(rev))return false;this.pending=null;this.revision++;this.feedback='已取消，装备保留';return true;}
 confirm(rev=this.revision){if(!this.valid(rev)||!this.pending)return false;const mode=this.pending,plan=recyclePlan(this.item,mode);this.pending=null;this.revision++;if(!plan.ok){this.feedback=plan.reason;return false;}if(mode==='experience'){this.item={...plan.items[0]!};this.feedback=plan.reason+'，请取回';}else{for(const item of plan.items)this.reward.store(item,this.position(),this.contains);this.item=null;const counts=new Map<string,number>();for(const item of plan.items){const name=item.name??item.type;counts.set(name,(counts.get(name)??0)+1);}this.feedback=counts.size?'分解获得 '+[...counts].map(([name,n])=>name+'×'+n).join('、'):'已分解，无材料产物';}return true;}
}
