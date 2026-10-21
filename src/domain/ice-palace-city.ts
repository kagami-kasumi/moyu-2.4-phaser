import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';
/** 4536/frame91: equipment 1.2, three pet shares, attack times six. */
export function spawnIcePalaceMirage(random:(n:number)=>number):FirstCombatMonster[]{
 return [[60,300],[155,380],[320,400],[245,290]].map(([x,y],n)=>({id:'monster'+(n+1),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:90,guardLength:290,guardHeight:145,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:6,speedY:3,minAttack:(.65+.8*1.2+.65*3)*6*125*.8,maxAttack:(.65+.8*1.2+.65*3)*6*125*1.2,defense:(.6+.75*1.2+.6*3)*125,ranged:false,attackTypeNum:1,name:'幻影死神战将',species:'死神战将',textColor:6724095,level:125,life:127500,maxLife:127500,attackFire:2000,burst:5,jook:5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:10,skillFrames:8,runFrames:12}));
}
export function icePalaceMirageDrops(remaining:boolean,random:(n:number)=>number,emit:(e:FirstBossReward,atRole?:boolean)=>void){
 emit({kind:'catch',name:'幻影死神战将',count:1});emit({kind:'catch',name:'怪物',count:1});emit({kind:'credit',amount:1});
 const branch=random(13);if(branch>=2&&branch!==4)emit({kind:'create',name:['9朵玫瑰','极品玉石','月光宝盒','电浆药水','英雄令','富豪礼包','灵魂礼包','奇异果','幻兽转世丹','超级经验球','神兽药水'][branch-2]!});
 if(!remaining){if(random(100)<20)emit({kind:'create',name:['蝴蝶牛','乖乖虎','嘻哈牛','玲珑虎'][random(4)]!},true);emit({kind:'create',name:'神兽药水'});}
}
