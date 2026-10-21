import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';

export function spawnShuxinMirage(random:(limit:number)=>number):FirstCombatMonster[]{
 return [[60,300],[155,380],[320,400],[245,290]].map(([x,y],index)=>({
  id:'monster'+(index+1),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,
  attackStopTime:6,stopRate:90,guardLength:290,guardHeight:145,
  attackLength:150+random(20)-10,attackHeight:30+random(10)-5,
  facing:random(2)!==1?'right':'left',speedX:4,speedY:2,
  minAttack:(.65+.8+.65*3)*25*.8,maxAttack:(.65+.8+.65*3)*25*1.2,
  defense:(.6+.75+.6*2)*25,ranged:false,attackTypeNum:1,
  name:'幻影冰妖剑士',textColor:6724095,species:'冰妖剑士',level:25,
  life:25500,maxLife:25500,attackFire:150,burst:5,jook:5,
  reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:8,runFrames:1,
 }));
}
export function shuxinMirageDrops(remaining:boolean,random:(limit:number)=>number,emit:(event:FirstBossReward,atRole?:boolean)=>void){
 emit({kind:'catch',name:'幻影冰妖剑士',count:1});emit({kind:'catch',name:'怪物',count:1});emit({kind:'credit',amount:1});
 const branch=random(6);
 if(branch>=2&&branch!==4)emit({kind:'create',name:['9朵玫瑰','极品玉石','月光宝盒','电浆药水'][branch-2]!});
 if(!remaining){
  if(random(100)<20)emit({kind:'create',name:['蝴蝶牛','乖乖虎','嘻哈牛','玲珑虎'][random(4)]!},true);
  emit({kind:'create',name:'电浆药水'});
 }
}
