import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';
import {firstBossDrops,firstCombatDrops,advanceFirstBoss} from './first-combat-drops.ts';
export const BORDER_FIELDS=['borderWildOne','borderWildTwo','borderWildThree','borderWildFour','borderWildFive'] as const;
export type BorderRegion=typeof BORDER_FIELDS[number];
export function spawnBorderField(region:BorderRegion,random:(n:number)=>number):FirstCombatMonster[]{
 const index=BORDER_FIELDS.indexOf(region),elite=index===1||index===3,level=90+index*5,species=index<2?'提风':'刺虫人';
 if(index<0||index>3)throw Error('常规边关野外范围无效');
 const points=index===1?[[455,265],[245,290],[125,385],[375,355]]:index===3?[[125,385],[375,355],[455,265],[245,290]]:[[60,300],[155,380],[320,400],[220,305],[470,320],[495,250]];
 return points.map(([x,y],i)=>({id:'monster'+(i+1),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:90,guardLength:elite?290:200,guardHeight:elite?145:100,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:6,speedY:3,minAttack:(.65+.8+.65*3)*level*.8,maxAttack:(.65+.8+.65*3)*level*1.2,defense:(.6+.75+.6*3)*level,ranged:false,attackTypeNum:index<2?2:1,name:species+(elite?'精英':''),species,textColor:elite?6724095:16777215,level,life:51*level*(elite?4:1),maxLife:51*level*(elite?4:1),attackFire:level*2,burst:5,jook:5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:9,skillFrames:9,runFrames:12}));
}
export function borderFieldDrops(name:string,level:number,profession:string,remaining:boolean,random:(n:number)=>number,emit:(event:FirstBossReward)=>void){
 firstCombatDrops(level,profession,true,random,emit,name,true);
 for(const [item,chance]of [['剌虫人头目行踪',500],['100级PK赛参赛券',75],['玫瑰湖地图',120],['蜘蛛谷地图',50]] as const)if(random(10000)<chance)emit({kind:'create',name:item});
 if(!remaining&&random(10000)>9000)emit({kind:'warning',name:'刺虫人头目',seconds:5});
}
export interface BorderFieldState {level:number;moreFire:number}
export type BorderBossKind='initial'|'random'|'guard'|'king';
export const initialBorderField=():BorderFieldState=>({level:90,moreFire:0});
export const isBorderField=(map:string):map is BorderRegion=>(BORDER_FIELDS as readonly string[]).includes(map);
export function advanceBorderField(state:BorderFieldState){const next=advanceFirstBoss(state.level,state.moreFire);state.level=next.level;state.moreFire=next.moreFire;}
/** frame73 is deliberately separate from flashBoss's random head formula. */
export function spawnBorderBoss(kind:BorderBossKind,level:number,moreFire:number,random:(n:number)=>number):FirstCombatMonster[]{
 const initial=kind==='initial',guard=kind==='guard',scale=level+5;
 const attack=initial?.65+.8*1.5+.65*3*1.5:(.65+.8*1.2+.65*3*1.2)*1.5;
 const defense=.6+.75*1.2+.6*3*1.2,life=51*12*scale;
 return [{id:'monster1',x:95,y:325,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:150,guardLength:400,guardHeight:150,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:8,speedY:4,minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:defense*scale,ranged:false,attackTypeNum:guard?2:1,name:guard?'提风护卫':kind==='king'?'剌虫王':'刺虫人头目',species:guard?'提风':'刺虫人',textColor:kind==='king'?16763955:16711680,level,life,maxLife:life,attackFire:Math.floor(moreFire+level*2+(guard?10:kind==='king'?20:0)),burst:5,jook:initial?5:15,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:9,skillFrames:9,runFrames:12}];
}
export function borderBossDrops(name:string,level:number,profession:string,finale:boolean,random:(n:number)=>number,fraction:()=>number,emit:(event:FirstBossReward)=>void){firstBossDrops(level,profession,random,fraction,emit,name,finale);}

