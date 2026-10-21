import {dispatchWorldDrops} from '../content/world-drop-rules.ts';
import {generateEquipmentNumbers} from '../content/equipment-generation-rules.ts';
import type {Item} from './npc-reward.ts';
export type FirstCombatReward={kind:'catch';name:string;count:1}|{kind:'create';name:string}|{kind:'throw';item:Item}|{kind:'warning';name:'第二批强盗'|'强盗首领'|'挑战怪物'|'龙怪头目'|'鹿角护卫'|'龙王'|'宝箱'|'监狱守卫'|'监狱长'|'炎女头目'|'恐兽护卫'|'妖王'|'刺虫人头目'|'提风护卫'|'剌虫王';seconds:3|5|10};
export type FirstBossReward=FirstCombatReward|{kind:'credit';amount:1}|{kind:'boss-level'}|{kind:'south-boss-level'}|{kind:'border-boss-level'}|{kind:'create-item';item:Item};
/** Only the dragon boss branch while in wild one. Wild-five successor guards
 * belong to that region, not to this entry point. */
export function firstBossDrops(level:number,profession:string,random:(n:number)=>number,fraction:()=>number,emit:(event:FirstBossReward)=>void,name='龙怪头目',finale=false,policy={credit:true,soul:true}){
 emit({kind:'catch',name,count:1});emit({kind:'catch',name:'怪物',count:1});if(policy.credit)emit({kind:'credit',amount:1});if(name==='龙怪头目'||name==='炎女头目'||name==='刺虫人头目'){emit({kind:'create',name:'勇士勋章'});emit({kind:name==='刺虫人头目'?'border-boss-level':name==='炎女头目'?'south-boss-level':'boss-level'});}
 dispatchWorldDrops('头目',level,{levels:level,vocational:profession},random,r=>{
  if(r.kind==='item'){emit({kind:'create',name:r.name});return;}
  if(r.kind!=='generator')throw Error('Unexpected boss drop');
  if(r.name==='dropBossItem')emit({kind:'throw',item:generateEquipmentNumbers('boss',level,profession,random)});
  else if(r.name==='dropBossStone')for(const [name,limit]of [['魔魂晶石',500],['幻魔晶石',500],['灵魂晶石',2000],['灵魂晶石',2000],['高级经验宝石',100],['高级攻击宝石',100],['高级减伤害宝石',100],['高级战斗力宝石',100],['初级月光宝盒',600],['小元素石',1000]] as const){if(random(10000)<limit)emit({kind:'create',name});}
  else throw Error('Unexpected boss generator '+r.name);
 });
 if(finale)emit({kind:'warning',name:name==='刺虫人头目'?'提风护卫':name==='提风护卫'?'剌虫王':name==='炎女头目'?'恐兽护卫':name==='恐兽护卫'?'妖王':name==='龙怪头目'?'鹿角护卫':name==='鹿角护卫'?'龙王':'宝箱',seconds:10});
 if(!policy.soul||random(100)>=10)return;
 const kind=random(10)+1,min=[0,30,20,100,100,5,10,15,15,2,1],max=[0,300,200,1000,1000,50,100,150,150,20,10];
 const value=Math.ceil((max[kind]!-min[kind]!)*Math.min(300,level)/300*(.9+fraction()*.2));
 emit({kind:'create-item',item:{type:'宝石',name:'魔之魂',val1:kind,val2:value}});
}
export function advanceFirstBoss(level:number,moreFire:number){return level===1?{level:5,moreFire}:level<135?{level:level+5,moreFire}:moreFire<270?{level,moreFire:moreFire+5}:{level,moreFire};}
/** Full deer monsterDeath branch. emit is synchronous because item creation and
 * ground placement can consume random numbers before the next drop roll. */
export function firstCombatDrops(level:number,profession:string,remaining:boolean,random:(n:number)=>number,emit:(event:FirstCombatReward)=>void,name:string='鹿角兽',suppressExtras=false){
 emit({kind:'catch',name,count:1});emit({kind:'catch',name:'怪物',count:1});
 const create=(name:string)=>emit({kind:'create',name}),chance=(limit:number,run:()=>void)=>{if(random(10000)<limit)run();};
 dispatchWorldDrops(name.endsWith('精英')?'精英怪':'普通怪',level,{levels:level,vocational:profession},random,r=>{
  if(r.kind==='item'){create(r.name);return;}
  if(r.kind!=='generator')throw Error('Unexpected ordinary drop request');
  switch(r.name){
   case 'dropNormalItem':emit({kind:'throw',item:generateEquipmentNumbers('normal',level,profession,random)});break;
   case 'dropStone':for(const [name,limit]of [['魔魂晶石',200],['幻魔晶石',150],['灵魂晶石',50],['中级经验宝石',25],['中级攻击宝石',25],['中级减伤害宝石',25],['中级战斗力宝石',25]] as const)chance(limit,()=>create(name));break;
   case 'dropFlower':for(const [name,limit]of [['1朵玫瑰',600-level*3],['3朵玫瑰',300+level*2],['9朵玫瑰',200+level],['普通玉石',600-level*3],['精品玉石',300+level*2],['极品玉石',200+level]] as const)chance(limit,()=>create(name));break;
   case 'dropHSItem':for(const [name,attributeType1,attributeVal1]of [['庇护铃铛',1,5],['凤翼铃铛',2,3],['翡翠铃铛',3,4]] as const)chance(100,()=>emit({kind:'throw',item:{grade:random(10)>=5?1:0,name,type:name,attributeType1,attributeVal1,pure:1,skill:0,salePrice:200}}));break;
   case 'dropMsBag':create(level<50?'小魔石袋子':level<100?'中魔石袋子':'大魔石袋子');break;
   default:throw Error('Unsupported ordinary generator '+r.name);
  }
 });
 if(suppressExtras||name==='强盗'||name==='魔军士兵')return;
 for(const [name,limit]of [['龙怪头目行踪',500],['50级PK赛参赛券',75],['蜘蛛谷地图',110],['亚维特岛地图',50]] as const)chance(limit,()=>create(name));
 if(!remaining&&random(10000)>9000)emit({kind:'warning',name:'龙怪头目',seconds:5});
}
