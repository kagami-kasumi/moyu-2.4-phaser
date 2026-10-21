import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';
import {firstBossDrops,firstCombatDrops,advanceFirstBoss} from './first-combat-drops.ts';
export const ABYSS_FIELDS=['abyssWildOne','abyssWildTwo','abyssWildThree'] as const;
export type AbyssFieldRegion=typeof ABYSS_FIELDS[number];
export function spawnAbyssField(region:AbyssFieldRegion,random:(n:number)=>number,level=130):FirstCombatMonster[]{
 const hidden=region==='abyssWildThree',elite=region!=='abyssWildOne';level=hidden?level:elite?135:130;
 const points=elite?[[230,345],[380,290],[160,430],[380,390]]:[[60,300],[155,380],[320,400],[220,305],[470,320],[495,250]];
 return points.map(([x,y],i)=>({id:'monster'+(i+(hidden?2:1)),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:90,guardLength:elite&&!hidden?290:200,guardHeight:elite&&!hidden?145:100,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:6,speedY:3,minAttack:(.65+.8*(hidden?1:1.2)+.65*3)*level*.8,maxAttack:(.65+.8*(hidden?1:1.2)+.65*3)*level*1.2,defense:(.6+.75*(hidden?1:1.2)+.6*3)*level,ranged:false,attackTypeNum:2,name:hidden?'暗黑格拉斯精英':elite?'巨杰士精英':'巨杰士',species:hidden?'暗黑格拉斯':'巨杰士',textColor:elite?6724095:16777215,level,life:51*level*(elite?4:1),maxLife:51*level*(elite?4:1),attackFire:level*2,burst:5,jook:5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:9,skillFrames:hidden?10:9,runFrames:12}));
}
export function abyssFieldDrops(name:string,level:number,profession:string,remaining:boolean,random:(n:number)=>number,emit:(event:FirstBossReward)=>void){
 firstCombatDrops(level,profession,true,random,emit,name,true);
 for(const [item,chance]of [['暗黑格拉斯头目行踪',500],['130级PK赛参赛券',75],['雷兽谷地图',150]] as const)if(random(10000)<chance)emit({kind:'create',name:item});
 if(!remaining&&random(10000)>9000)emit({kind:'warning',name:'暗黑格拉斯头目',seconds:5});
}
export interface AbyssFieldState {level:number;moreFire:number}
export type AbyssFieldBossKind='initial'|'random'|'guard'|'king';
export const initialAbyssField=():AbyssFieldState=>({level:130,moreFire:0});
export const isAbyssField=(map:string):map is AbyssFieldRegion=>(ABYSS_FIELDS as readonly string[]).includes(map);
export function advanceAbyssField(state:AbyssFieldState){const next=advanceFirstBoss(state.level,state.moreFire);state.level=next.level;state.moreFire=next.moreFire;}
/** frame98 is deliberately separate from flashBoss's random head formula. */
export function spawnAbyssFieldBoss(kind:AbyssFieldBossKind,level:number,moreFire:number,random:(n:number)=>number):FirstCombatMonster[]{
 const initial=kind==='initial',guard=kind==='guard',scale=level+5;
 const attack=initial?.65+.8*1.5+.65*3*1.5:(.65+.8*1.2+.65*3*1.2)*1.5;
 const defense=.6+.75*1.2+.6*3*1.2,life=51*15*scale;
 return [{id:'monster1',x:420,y:340,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:150,guardLength:400,guardHeight:150,attackLength:150+random(20)-10,attackHeight:30+random(10)-5,facing:random(2)!==1?'right':'left',speedX:8,speedY:4,minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:defense*scale,ranged:false,attackTypeNum:2,name:guard?'巨杰士护卫':kind==='king'?'暗黑之王':'暗黑格拉斯头目',species:guard?'巨杰士':'暗黑格拉斯',textColor:kind==='king'?16763955:16711680,level,life,maxLife:life,attackFire:Math.floor(moreFire+level*2+(guard?10:kind==='king'?20:0)),burst:5,jook:initial?5:15,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:9,skillFrames:guard?9:10,runFrames:12}];
}
export function abyssFieldBossDrops(name:string,level:number,profession:string,finale:boolean,random:(n:number)=>number,fraction:()=>number,emit:(event:FirstBossReward)=>void){firstBossDrops(level,profession,random,fraction,emit,name,finale);}

