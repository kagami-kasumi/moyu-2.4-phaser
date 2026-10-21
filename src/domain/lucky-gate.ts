import {LUCKY_SPECIES,LUCKY_TIMING} from '../content/lucky-gate-data.ts';
import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';
export interface LuckyWave {round:number;roleLevel:number;species:number;fire:number;finished:boolean}
export const initialLuckyWave=():LuckyWave=>({round:0,roleLevel:1,species:0,fire:0,finished:false});
export function rollLuckyWave(round:number,roleLevel:number,random:(n:number)=>number):LuckyWave {const species=random(12);return {round,roleLevel,species,fire:round>30?0:random(round%10===0?round*10:50),finished:round>30};}
export function spawnLuckyWave(w:LuckyWave,random:(n:number)=>number):FirstCombatMonster[]{
 if(w.round===0||w.finished)return [];const boss=w.round%10===0,level=w.roleLevel+w.round,base=boss?w.round:0,scale=level+base,species=LUCKY_SPECIES[w.species]!;
 const points=boss?[[90,400]]:[[90,400],[180,280],[280,180],[350,380],[470,280],[350,220]],life=51*(boss?w.round===10?10:w.round===20?15:20:3)*scale;
 return points.map(([x,y],n)=>({id:'monster'+(n+1),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:boss?150:90,guardLength:580,guardHeight:500,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,...{facing:random(2)!==1?'right' as const:'left' as const},speedX:boss?8:6,speedY:boss?4:3,minAttack:(.65+.8+.65*2)*scale*.8,maxAttack:(.65+.8+.65*2)*scale*1.2,defense:(.6+.75+.6*2)*scale,ranged:false,attackTypeNum:1,name:boss?(w.round===10?'怪怪兽长':w.round===20?'怪怪兽头':'怪怪兽王'):'怪怪兽',textColor:boss?16763955:16777215,species,level,life,maxLife:life,attackFire:Math.floor((boss?2:1)*w.roleLevel+2*level),burst:5,jook:5,reduceDamage:0,wind:0,fire:w.fire,soil:0,water:0,animationFrame:1,attackFrames:LUCKY_TIMING[species].attack,runFrames:LUCKY_TIMING[species].run}));
}
export function luckyDrops(w:LuckyWave,level:number,remaining:boolean,random:(n:number)=>number,fraction:()=>number,emit:(event:FirstBossReward)=>void){
 const boss=w.round%10===0,name=boss?(w.round===10?'怪怪兽长':w.round===20?'怪怪兽头':'怪怪兽王'):'怪怪兽';emit({kind:'catch',name,count:1});emit({kind:'catch',name:'怪物',count:1});
 if(boss)emit({kind:'credit',amount:1});if(random(10000)<(boss?5000:1000))emit({kind:'create',name:boss?'灵魂王':'勇士勋章'});if(random(10000)<(boss?5000:500))emit({kind:'create',name:'灵魂礼包'});
 if(!remaining)emit({kind:'warning',name:w.round===30?'宝箱':'挑战怪物',seconds:boss?10:3});
 if(boss&&random(100)<10){const kind=random(10)+1,min=[0,30,20,100,100,5,10,15,15,2,1],max=[0,300,200,1000,1000,50,100,150,150,20,10],value=Math.ceil((max[kind]!-min[kind]!)*Math.min(300,level)/300*(.9+fraction()*.2));emit({kind:'create-item',item:{type:'宝石',name:'魔之魂',val1:kind,val2:value}});}
}
