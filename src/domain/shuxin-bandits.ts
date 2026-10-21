import type {FirstCombatMonster} from './first-combat-spawn.ts';
import {firstCombatDrops,firstBossDrops,type FirstBossReward} from './first-combat-drops.ts';

export type BanditWave=1|2|3;
export function banditDrops(wave:BanditWave,profession:string,remaining:boolean,random:(limit:number)=>number,fraction:()=>number,emit:(event:FirstBossReward)=>void){
 if(wave===3){firstBossDrops(20,profession,random,fraction,emit,'强盗首领');return;}
 firstCombatDrops(20,profession,remaining,random,emit,'强盗');
 if(!remaining)emit({kind:'warning',name:wave===1?'第二批强盗':'强盗首领',seconds:5});
}
export function spawnBandits(wave:BanditWave,random:(limit:number)=>number):FirstCombatMonster[]{
 const boss=wave===3,scale=boss?25:20;
 const points=wave===1?[[60,300],[155,380],[320,400]]:wave===2?[[220,305],[470,320],[495,250]]:[[420,340]];
 const life=51*(boss?8:2)*scale;
 return points.map(([x,y],index)=>({
  id:'monster'+(index+1),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,
  attackStopTime:6,stopRate:boss?150:90,guardLength:boss?600:580,guardHeight:500,
  attackLength:150+random(20)-10,attackHeight:30+random(10)-5,
  facing:random(2)!==1?'right':'left',speedX:boss?8:4,speedY:boss?4:2,
  minAttack:(.65+.8+.65*2)*scale*.8,maxAttack:(.65+.8+.65*2)*scale*1.2,
  defense:(boss?.6+.75*1.2+.6*2*1.2:.6+.75+.6*2)*scale,
  ranged:false,attackTypeNum:2,name:boss?'强盗首领':'强盗',textColor:boss?16763955:16777215,
  species:'强盗',level:20,life,maxLife:life,attackFire:40,burst:5,jook:wave===1?5:15,
  reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:9,runFrames:12,
 }));
}
