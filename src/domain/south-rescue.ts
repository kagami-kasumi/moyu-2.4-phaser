import type {FirstCombatMonster} from './first-combat-spawn.ts';
import type {FirstBossReward} from './first-combat-drops.ts';
import {firstCombatDrops,firstBossDrops} from './first-combat-drops.ts';
import {literalItem} from '../content/registry.ts';
import {palacePrize} from './palace-lottery.ts';
import type {NpcReward} from './npc-reward.ts';
import {consumeRoyalMaterial} from './royal-chests.ts';
import {consumeTradeMaterial} from './outskirts-trade.ts';

export const RESCUE_FIELDS=['southWildOne','southWildTwo','southWildThree','southWildFour'] as const;
export type RescueRegion=typeof RESCUE_FIELDS[number]|'southPrison';
export const isRescueRegion=(map:string):map is RescueRegion=>map==='southPrison'||(RESCUE_FIELDS as readonly string[]).includes(map);
export type PrisonWave=1|2|3;
export interface RescueState {isDoing:boolean;isComplete:boolean;son:number;daughter:number;dukeCmd:number;chestCmd:number|null}
export const initialRescue=():RescueState=>({isDoing:false,isComplete:false,son:0,daughter:0,dukeCmd:9361,chestCmd:4020});
/** 4536 frames 59..62/156 and flashBoss 监狱守卫/监狱长. */
export function spawnRescue(region:RescueRegion,random:(n:number)=>number,wave:PrisonWave=1):FirstCombatMonster[]{
 const prison=region==='southPrison',index=RESCUE_FIELDS.indexOf(region as typeof RESCUE_FIELDS[number]),elite=index===1||index===3,boss=prison&&wave===3;
 const level=prison?(boss?85:80):70+index*5,scale=level+(prison?5:0),species=prison?(wave===1?'守卫魔':'巨猿'):index<2?'恐兽':'炎女';
 const name=prison?(wave===1?'监狱卫兵':wave===2?'监狱守卫':'监狱长'):species+(elite?'精英':'');
 const points=prison?(wave===1?[[220,440],[110,340],[250,260],[340,340],[460,425]]:wave===2?[[110,300],[435,420],[325,310]]:[[110,420]]):elite?[[230,420],[400,200],[220,255],[365,365]]:index===0?[[60,200],[155,280],[320,400],[220,205],[470,320],[495,380]]:[[60,300],[155,380],[320,400],[220,305],[470,320],[295,180]];
 const attack=boss?(.65+.8*1.2+.65*3*1.3)*1.5:.65+.8+.65*(prison?3:2),defense=boss?.6+.75*1.2+.6*3*1.3:.6+.75+.6*(prison?3:2),life=51*scale*(boss?12:prison&&wave===2?3:elite?4:1);
 return points.map(([x,y],n)=>({id:'monster'+(n+1),x:x!,y:y!,alive:true,motion:'idle',effect:'none',stopTime:0,attackStopTime:6,stopRate:boss?150:90,guardLength:boss?400:prison?250:elite?290:200,guardHeight:boss?150:prison?100:elite?145:100,attackLength:(boss?200:prison&&wave===2?180:150)+random(20)-10,attackHeight:(boss?45:30)+random(10)-5,...{facing:random(2)!==1?'right' as const:'left' as const},speedX:boss?8:6,speedY:boss?4:3,minAttack:attack*scale*.8,maxAttack:attack*scale*1.2,defense:defense*scale,ranged:false,attackTypeNum:species==='炎女'?1:2,name,species,textColor:boss?16711680:prison&&wave===2?6737151:elite?6724095:16777215,level,life,maxLife:life,attackFire:level*2+(boss?30:0),burst:5,jook:prison&&wave>1?15:5,reduceDamage:0,wind:0,fire:0,soil:0,water:0,animationFrame:1,attackFrames:species==='恐兽'?8:species==='巨猿'?11:9,skillFrames:species==='巨猿'?9:species==='恐兽'?8:9,runFrames:species==='恐兽'?12:species==='巨猿'?8:species==='守卫魔'?16:10}));
}
export function rescueDrops(name:string,level:number,profession:string,remaining:boolean,active:boolean,random:(n:number)=>number,fraction:()=>number,emit:(e:FirstBossReward)=>void){
 if(name==='监狱长'){
  firstBossDrops(level,profession,random,fraction,emit,name,false,{credit:false,soul:true});
  emit({kind:'catch',name:'公爵儿子',count:1});emit({kind:'catch',name:'公爵女儿',count:1});return;
 }
 // Shared ordinary/elite factories, with this region's distinct extra rolls below.
 firstCombatDrops(level,profession,true,random,emit,name,true);
 if(name.startsWith('监狱')){if(!remaining&&(name==='监狱守卫'||active))emit({kind:'warning',name:name==='监狱卫兵'?'监狱守卫':'监狱长',seconds:5});return;}
 for(const [item,chance]of [['炎女头目行踪',500],['90级PK赛参赛券',75],['百兽岛地图',120],['玫瑰湖地图',50]] as const)if(random(10000)<chance)emit({kind:'create',name:item});
 // Source ordinary fields can summon their independent south head.
 if(!remaining&&random(10000)>9000)emit({kind:'warning',name:'炎女头目',seconds:5});
}
export class SouthRescue {
 open=false;revision=0;stage:'duke'|'accept'|'chest'='duke';feedback='';
 constructor(readonly state:RescueState,readonly reward:NpcReward,private available:(kind:'duke'|'chest')=>boolean,private position:()=>{x:number;y:number},private contains:(x:number,y:number)=>boolean,private elapsed:()=>number,private random:(n:number)=>number=n=>Math.floor(Math.random()*n)){}
 show(kind:'duke'|'chest'){if(!this.available(kind))return false;this.stage=kind;this.open=true;this.feedback='';this.revision++;return true;}
 close(){this.open=false;this.revision++;}
 private valid(rev:number){return this.open&&rev===this.revision&&this.available(this.stage==='chest'?'chest':'duke');}
 offer(rev=this.revision){if(!this.valid(rev)||this.state.isDoing||this.state.isComplete)return false;this.stage='accept';this.revision++;return true;}
 answer(yes:boolean,rev=this.revision){if(!this.valid(rev)||this.stage!=='accept')return false;if(yes){this.state.isDoing=true;this.state.dukeCmd=9365;this.reward.messages.push('接到支线任务 劫狱');}this.close();return true;}
 catchThing(name:string,count:number,level:number){const s=this.state;if(!s.isDoing||s.isComplete||level<1||count!==1)return false;const key=name==='公爵儿子'?'son':name==='公爵女儿'?'daughter':undefined;if(!key||s[key])return false;s[key]=1;s.isComplete=s.son===1&&s.daughter===1;if(s.isComplete)this.reward.messages.push('支线任务 劫狱任务完成');return true;}
 claim(){const s=this.state;if(!s.isDoing||!s.isComplete||!this.available('duke'))return false;for(const name of ['魔力源泉','生命之源',this.reward.profession==='战士'?'金刚':'神圣'])this.reward.store(literalItem(name),this.position(),this.contains);s.isDoing=false;s.dukeCmd=9366;this.revision++;this.feedback='劫狱奖励已领取';return true;}
 exchange(rev=this.revision){if(!this.valid(rev)||this.stage!=='duke'||!this.state.isComplete)return false;this.revision++;if(!consumeTradeMaterial(this.reward.bag,'初级月光宝盒',1)){this.feedback='你没带有初级月光宝盒来呢。';return false;}for(let n=0;n<2;n++)this.reward.store(literalItem('幻魔之心'),this.position(),this.contains);this.feedback='获得 2个幻魔之心';return true;}
 chest(rev=this.revision){if(!this.valid(rev)||this.stage!=='chest'||!this.state.isComplete)return false;this.revision++;if(this.state.chestCmd===4020){for(const name of ['生命之源','魔力源泉'])this.reward.store(literalItem(name),this.position(),this.contains);this.state.chestCmd=4022;this.feedback='获得生命之源和魔力源泉';return true;}if(this.state.chestCmd!==4022){this.feedback='宝箱旧状态无法识别，已保留';return false;}if(this.elapsed()<=300000){this.feedback='刚刚读取游戏，5分钟后才可以抽奖。';return false;}if(!consumeRoyalMaterial(this.reward.bag,'勇士勋章')){this.feedback='你没有勇士勋章';return false;}const v=this.random(10000),pool=['灵魂晶石','幻魔之心','魔魂之心','初级月光宝盒','灵魂礼包','高级战斗力宝石','灵魂王','小元素石','中级月光宝盒'],n=[2500,3500,4500,5500,7500,8500,9000,9500,10000].findIndex(t=>v<t),name=pool[n]!;this.reward.store(palacePrize(name),this.position(),this.contains);this.feedback='获得 '+name;return true;}
}
