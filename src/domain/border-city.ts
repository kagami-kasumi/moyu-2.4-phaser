import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';
/** 4536/frame77: three pet base shares, attack times five, no base level offset. */
export function spawnBorderMirage(random:(n:number)=>number):FirstCombatMonster[]{
 return [[60,300],[155,380],[320,400],[245,290]].map(([x,y],n)=>({id:'monster'+(n+1),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:90,guardLength:290,guardHeight:145,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:6,speedY:3,minAttack:(.65+.8+.65*3)*5*105*.8,maxAttack:(.65+.8+.65*3)*5*105*1.2,defense:(.6+.75+.6*3)*105,ranged:false,attackTypeNum:1,name:'幻影刺虫人',species:'刺虫人',textColor:6724095,level:105,life:107100,maxLife:107100,attackFire:1400,burst:5,jook:5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:9,runFrames:12}));
}
export function borderMirageDrops(remaining:boolean,random:(n:number)=>number,emit:(e:FirstBossReward,atRole?:boolean)=>void){
 emit({kind:'catch',name:'幻影刺虫人',count:1});emit({kind:'catch',name:'怪物',count:1});emit({kind:'credit',amount:1});
 const branch=random(12);if(branch>=2&&branch!==4)emit({kind:'create',name:['9朵玫瑰','极品玉石','月光宝盒','电浆药水','英雄令','富豪礼包','灵魂礼包','奇异果','幻兽转世丹','超级经验球'][branch-2]!});
 if(!remaining){if(random(100)<20)emit({kind:'create',name:['蝴蝶牛','乖乖虎','嘻哈牛','玲珑虎'][random(4)]!},true);emit({kind:'create',name:'超级经验球'});}
}
