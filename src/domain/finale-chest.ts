import type {Item} from './npc-reward.ts';
import {palacePrize} from './palace-lottery.ts';
/** 4312/frame1 luckyBoss, synchronous creation preserves ground-placement draws. */
export function finaleChestDrops(random:(n:number)=>number,emit:(item:Item)=>void){
 const create=(name:string)=>emit(palacePrize(name));
 create(['灵魂晶石','魔魂之心','幻魔之心'][random(3)]!);
 create(['9朵玫瑰','极品玉石'][random(2)]!);
 if(random(1000)<250){const name=['高级攻击宝石','高级经验宝石','高级战斗力宝石','高级减伤害宝石','初级月光宝盒'][random(5)]!;const item=palacePrize(name);if(name==='高级减伤害宝石')item.val1=5;emit(item);}
 if(random(1000)<250)create(['守护者','鼠来福','鼠来运','眺望者','雪瑞'][random(5)]!);
 if(random(1000)<50)create(['灵魂王','中级月光宝盒','电浆药水','吉祥噜噜','如意嘟嘟'][random(5)]!);
}
