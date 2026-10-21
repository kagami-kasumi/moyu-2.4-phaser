import type {Item,NpcReward} from './npc-reward.ts';
import {supportedBell} from './pet-bells.ts';
export type BellSlot='item1'|'item2';
export interface BellFusionState {item1:Item|null;item2:Item|null;reserved:BellSlot[]}
export function fusionBellSupported(item:Item){return supportedBell(item)&&typeof item.pure==='number'&&Number.isFinite(item.pure)&&item.pure>=0&&Number.isInteger(item.skill)&&Number(item.skill)>=0&&Number(item.skill)<=2;}
export function bellFusionReason(a:Item|null,b:Item|null){
 if(!a||!b)return '请放入两枚同品质铃铛。';
 if(!fusionBellSupported(a)||!fusionBellSupported(b))return '铃铛数据未知或无效，不能融合。';
 if(Number(a.grade)>=4)return '铃铛已经到达极品，不能再提高品质。';
 if(a.grade!==b.grade)return '两枚铃铛品质不同。';
 return '';
}
export function fuseBells(a:Item,b:Item,random:(n:number)=>number):Item|null {
 if(bellFusionReason(a,b))return null;
 const result:Item & {grade:number;pure:number}={...a,grade:Number(a.grade)+1,pure:Number(a.pure)+(a.type===b.type?Number(b.pure):0)};
 if(result.grade===2){const pair=a.type==='凤翼铃铛'?[3,1]:a.type==='翡翠铃铛'?[2,1]:[3,2];result.attributeType2=pair[random(2)]!;}
 else if(result.grade===4)result.attributeType3=a.type==='凤翼铃铛'?(a.attributeType2!==1?1:3):a.type==='翡翠铃铛'?(a.attributeType2!==1?1:2):(a.attributeType2!==2?2:3);
 if(result.grade===4&&result.pure===16&&result.skill===0)result.skill=random(2)+1;
 for(let n=1;n<=3;n++){if(result.grade-n< -1)break;const type=result['attributeType'+n],scale=type===1?5:type===2?3:type===3?4:0;if(scale)result['attributeVal'+n]=(result.grade+2-n)*scale;}
 result.salePrice=(result.grade+1)*100;return result;
}
export class BellFusion implements BellFusionState {
 item1:Item|null=null;item2:Item|null=null;reserved:BellSlot[]=[];open=false;revision=0;feedback='';
 constructor(readonly reward:NpcReward,private available:()=>boolean=()=>true,private random:(n:number)=>number=n=>Math.floor(Math.random()*n)){}
 show(){if(this.available()){this.open=true;this.revision++;}}close(){this.open=false;this.revision++;}
 private valid(revision:number){return this.open&&this.available()&&revision===this.revision;}
 select(slot:BellSlot,index:number,item:Item,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){if(!this.valid(revision)||this.reserved.includes(slot)||this.reward.bag[index]!==item||!fusionBellSupported(item))return false;if(this[slot])this.reward.store(this[slot]!,position,contains);this[slot]={...item};this.reward.bag[index]=null;this.feedback='已放入铃铛';this.revision++;return true;}
 take(slot:BellSlot,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){if(!this.valid(revision)||!this[slot])return false;this.reward.store(this[slot]!,position,contains);this[slot]=null;this.revision++;this.feedback='已取回铃铛';return true;}
 plan(){const reason=bellFusionReason(this.item1,this.item2);return reason||`融合后品质 ${Number(this.item1!.grade)+1} · 纯度 ${Number(this.item1!.pure)+(this.item1!.type===this.item2!.type?Number(this.item2!.pure):0)}；消耗副槽铃铛，无货币费用。新增属性及技能在确认时抽签。`;}
 fuse(revision=this.revision){if(!this.valid(revision))return false;const reason=bellFusionReason(this.item1,this.item2);if(reason){this.feedback=reason;return false;}this.item1=fuseBells(this.item1!,this.item2!,this.random);this.item2=null;this.feedback='装备打造成功';this.reward.messages.push(this.feedback);this.revision++;return true;}
}
