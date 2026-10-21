import type {Item,NpcReward} from './npc-reward.ts';
import {refreshEquipmentAttributes} from './equipment-attributes.ts';
export const GEM_TYPES:Record<string,number>={'中级战斗力宝石':1,'高级战斗力宝石':1,'中级攻击宝石':2,'高级攻击宝石':2,'中级减伤害宝石':3,'高级减伤害宝石':3,'中级经验宝石':4,'高级经验宝石':4,'战斗攻击圣石':5,'战斗减伤害圣石':6,'战斗经验圣石':7};
const armor=(item:Item|null):item is Item=>!!item&&['武器','鞋','衣服','头盔'].includes(item.type);
export function gemPlan(item:Item|null,stone:Item|null){
 const type=stone?.type==='宝石'?GEM_TYPES[stone.name??'']:undefined;
 const no=(reason:string)=>({ok:false,type:0,hole:0,reason});
 if(!armor(item)||!type)return no('请选择装备和镶嵌宝石。');
 if(!Number.isInteger(item.holes)||Number(item.holes)<1||Number(item.holes)>3)return no('装备还没有可用孔。');
 if([2,5].includes(type)&&!['武器','鞋'].includes(item.type)||[3,6].includes(type)&&!['衣服','头盔'].includes(item.type))return no('宝石与装备类别不符。');
 if(!Number.isFinite(stone!.val1)||(type>=5&&!Number.isFinite(stone!.val2)))return no('宝石参数无效。');
 for(let hole=1;hole<=Number(item.holes);hole++)if(item['hole'+hole]===0)return {ok:true,type,hole,reason:`镶入第${hole}孔，消耗1个${stone!.name}。`};
 return no('装备孔已满。');
}
export function gemBonuses(items:readonly (Item|null)[]){
 const result={stoneFire:0,moreAttack:0,reduceDamage:0,moreExp:0};
 for(const item of items)if(item)for(let n=1;n<=Number(item.holes??0);n++){
  const type=Number(item['hole'+n]),a=Number(item['gem'+n]??0),b=Number(item['gem'+(10+n)]??0);
  if([1,5,6,7].includes(type))result.stoneFire+=a;
  if(type===2||type===5)result.moreAttack+=type===2?a:b;
  if(type===3||type===6)result.reduceDamage+=type===3?a:b;
  if(type===4||type===7)result.moreExp+=type===4?a:b;
 }
 return result;
}
function recoveredGem(item:Item,n:number):Item|null{
 const type=Number(item['hole'+n]),val1=Number(item['gem'+n]),val2=Number(item['gem'+(10+n)]);
 if(type>=1&&type<=4){const names=['战斗力','攻击','减伤害','经验'],mid=val1===[3,10,5,15][type-1];return {type:'宝石',name:(mid?'中级':'高级')+names[type-1]+'宝石',val1,salePrice:(mid?[100,50,50,30]:[2000,1000,1000,500])[type-1]};}
 if(type>=5&&type<=7)return {type:'宝石',name:['战斗攻击圣石','战斗减伤害圣石','战斗经验圣石'][type-5],val1,val2,salePrice:3000};
 return null;
}
export type SplitSlot='item'|'stone1'|'stone2'|'stone3';
export class EquipmentGemRemoval {
 item:Item|null=null;stone1:Item|null=null;stone2:Item|null=null;stone3:Item|null=null;
 open=false;revision=0;feedback='';
 constructor(readonly reward:NpcReward){}
 show(){this.open=true;this.revision++;}
 close(){this.open=false;this.revision++;}
 select(index:number,expected:Item,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  if(!this.open||revision!==this.revision||this.reward.bag[index]!==expected||!armor(expected))return false;
  this.reward.bag[index]=null;if(this.item)this.reward.store(this.item,position,contains);this.item={...expected};this.revision++;this.feedback='';return true;
 }
 take(slot:SplitSlot,revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  const item=this[slot];if(!this.open||revision!==this.revision||!item)return false;
  const drops=this.reward.drops.length;this.reward.store(item,position,contains);this[slot]=null;this.revision++;this.feedback=this.reward.drops.length>drops?'背包已满，物品掉落在地上。':'已取回'+(item.name??item.type);return true;
 }
 price(){let value=0;for(let n=1;n<=3;n++)if(Number(this.item?.holes)>=n&&Number(this.item?.['hole'+n])>0)value+=[10,100,1000][n-1]!;return value;}
 split(revision=this.revision,position={x:0,y:0},contains:((x:number,y:number)=>boolean)=()=>true){
  if(!this.open||revision!==this.revision)return false;this.revision++;
  const item=this.item,price=this.price();
  if(!armor(item)||!price){this.feedback='请选择已经镶嵌宝石的装备。';return false;}
  if(this.reward.ms<price){this.feedback='你没有足够的魔石';return false;}
  this.reward.ms-=price;
  for(let n=1;n<=3;n++){const slot=('stone'+n) as Exclude<SplitSlot,'item'>;if(this[slot])this.reward.store(this[slot]!,position,contains);this[slot]=null;if(Number(item.holes)>=n&&Number(item['hole'+n])>0){this[slot]=recoveredGem(item,n);item['hole'+n]=0;}}
  refreshEquipmentAttributes(item);this.feedback=`摘取宝石成功，消耗${price}魔石。`;this.reward.messages.push('摘取宝石成功');return true;
 }
 snapshot(){return {item:structuredClone(this.item),stone1:structuredClone(this.stone1),stone2:structuredClone(this.stone2),stone3:structuredClone(this.stone3),open:this.open,revision:this.revision,feedback:this.feedback,price:this.price()};}
}
