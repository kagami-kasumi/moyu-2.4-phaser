import type {Item,NpcReward} from './npc-reward.ts';
export const FUSION_NAMES=['高级战斗力宝石','高级攻击宝石','高级减伤害宝石','高级经验宝石'] as const;
export type FusionSlot='stone1'|'stone2';
export function fusionPlan(a:Item|null,b:Item|null,credit:number){
 const fail=(reason:string)=>({ok:false,reason,fee:0,result:null as Item|null});
 if(a?.type!=='宝石'||b?.type!=='宝石')return fail('请放入两件宝石。');
 const ai=FUSION_NAMES.indexOf(a.name as typeof FUSION_NAMES[number]),bi=FUSION_NAMES.indexOf(b.name as typeof FUSION_NAMES[number]);
 if(ai<0||bi<0)return fail('只有四类高级宝石可以融合。');
 const av=Number(a.val1),bv=Number(b.val1);if(!Number.isFinite(av)||!Number.isFinite(bv))return fail('宝石参数无效。');
 if(ai===bi){const limits=[15,25,13,35],steps=[1,2,1,2];if(av>=limits[ai]!)return fail('主宝石的属性已经最高，不能再融合了');const fee=ai===0&&av>=8?av-6:0;if(credit<fee)return {...fail(`需要${fee}点声望。`),fee};return {ok:true,reason:`主属性 ${av} → ${av+steps[ai]!}，消耗副槽整格材料${fee?'及'+fee+'声望':''}。`,fee,result:{type:'宝石',name:a.name,val1:av+steps[ai]!,salePrice:ai===0?2000:1000,number:0}};}
 if(ai!==0&&bi!==0)return fail('不同类型需要其中一件为高级战斗力宝石。');
 const other=ai===0?bi:ai;return {ok:true,reason:'融合为圣石，消耗副槽整格材料。',fee:0,result:{type:'宝石',name:['','战斗攻击圣石','战斗减伤害圣石','战斗经验圣石'][other],val1:ai===0?av:bv,val2:ai===0?bv:av,salePrice:3000,number:0}};
}
export class GemFusion {
 stone1:Item|null=null;stone2:Item|null=null;open=false;revision=0;feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean=()=>true){}
 show(){if(!this.available())return;this.open=true;this.revision++;}close(){this.open=false;this.revision++;}
 private valid(revision:number){return this.open&&this.available()&&revision===this.revision;}
 select(slot:FusionSlot,index:number,item:Item,revision=this.revision){if(!this.valid(revision)||this[slot]||this.reward.bag[index]!==item||item.type!=='宝石'||slot==='stone2'&&!this.stone1)return false;this[slot]={...item};this.reward.bag[index]=null;this.feedback='';this.revision++;return true;}
 take(slot:FusionSlot,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){if(!this.valid(revision)||!this[slot])return false;this.reward.store(this[slot]!,position,contains);this[slot]=null;this.revision++;this.feedback='已取回宝石';return true;}
 plan(){return fusionPlan(this.stone1,this.stone2,this.reward.credit);}
 fuse(revision=this.revision){if(!this.valid(revision))return false;const p=this.plan();if(!p.ok){this.feedback=p.reason;return false;}if(p.fee){this.reward.credit-=p.fee;this.reward.messages.push('声望 -'+p.fee);}this.stone1=p.result;this.stone2=null;this.reward.messages.push('宝石融合成功');this.feedback='宝石融合成功';this.revision++;return true;}
}
