import type {FirstBossReward} from './first-combat-drops.ts';
/** frame1 dropItemX(0) and SuperHS(20); true selects source undefined-coordinate fallback. */
export function mirageDrops(remaining:boolean,random:(n:number)=>number,emit:(event:FirstBossReward,atRole?:boolean)=>void){
 emit({kind:'catch',name:'幻影龙怪',count:1});emit({kind:'catch',name:'怪物',count:1});emit({kind:'credit',amount:1});
 const item=random(4);if(item>=2)emit({kind:'create',name:item===2?'9朵玫瑰':'极品玉石'});
 if(!remaining&&random(100)<20)emit({kind:'create',name:['蝴蝶牛','乖乖虎','嘻哈牛','玲珑虎'][random(4)]!},true);
}
/** draw must occur even before the timer is eligible, matching && evaluation order. */
export function mirageIntrusion(elapsed:number,chance:number,draw:number){return draw<chance&&elapsed>300000;}
