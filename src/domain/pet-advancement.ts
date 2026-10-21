import type {Item,PetRecord} from './npc-reward.ts';
import type {PetProgression} from './pet-progression.ts';
import {petLife} from './pet-progression.ts';
import {petDetails} from './pet-details.ts';
export const PET_ADVANCEMENT_TYPES=['电浆药水','幻兽转世水晶','幻兽转世丹','神兽药水','奇异果','风神兽内丹','火神兽内丹','水神兽内丹','地神兽内丹','雷神兽内丹'];
const axes=['Life','MinAttack','MaxAttack','Defense'] as const;
export function advancementReason(p:PetRecord,type:string){
 const d=petDetails(p);if(!d||!PET_ADVANCEMENT_TYPES.includes(type)||![p.maxZs,p.zs,p.sd??0,p.qyg??0,petLife(p)].every(v=>Number.isFinite(v)&&v>=0))return '幻兽进阶数据无效，未消耗';
 if(type==='电浆药水'){if(petLife(p)<=0)return '使用对像已经死亡，使用无效';if(d.allFen<3000)return '极品30星以上的幻兽才使用';if(p.element===5)return '该幻兽已经拥有雷元素了，使用无效';}
 if(type==='幻兽转世丹'&&p.maxZs<=p.zs)return '主幻兽的转世次数已经达到极限，不能再进行幻化了。';
 if(type==='神兽药水'&&(p.sd??0)>=[1,2,3][p.nowLifeLv??0]!)return `幻兽${p.type}已经使用了${p.sd}个神兽药水，不能再使用。`;
 if(type==='奇异果'&&(p.qyg??0)>=[50,100,200][p.nowLifeLv??0]!)return `幻兽${p.type}已经使用了${p.qyg}个奇异果，不能再使用。`;
 const axis=['水神兽内丹','风神兽内丹','火神兽内丹','地神兽内丹'].indexOf(type);
 if(axis>=0){if(p.isGod)return `幻兽${p.type}已经是神使幻兽，不能再使用神兽内丹了。`;if(d.attributes[axis]!.main)return `该幻兽的${['生命','最小攻击','最大攻击','防御'][axis]}成长率是主属性，不能使用${type}。`;}
 if(type==='雷神兽内丹'){if(d.mainFen<6000&&p.type!=='奇迹龙')return '该幻兽没不符合要求条件。';if((p.nowLifeLv??0)>=2)return '该幻兽已经进化到第三代了，无法继续进化了！！！';if(typeof p.nextLvRate!=='number'||!Number.isFinite(p.nextLvRate)||p.nextLvRate<=0)return '进化倍率未知，原记录保留';}
 return '';
}
export function advancePet(p:PetRecord,type:string,random:()=>number=Math.random,bell?:Item|null){
 const reason=advancementReason(p,type);if(reason)return {ok:false,message:reason};
 if(!petDetails(p,bell))return {ok:false,message:'铃铛属性无效，未消耗'};
 const next={...p},d=petDetails(p)!,oldLife=petLife(p);let message='';
 switch(type){
 case '电浆药水':next.element=5;next.life=Math.min(oldLife,petDetails(p,bell)!.maxLife);message=`幻兽${p.type}使用了电浆药水，获得了雷元素属性`;break;
 case '幻兽转世水晶':next.maxZs++;message=`幻兽${p.type}最大转世次数增加1次，最大转世次数${next.maxZs}次`;break;
 case '幻兽转世丹':{const n=Math.min(10,p.maxZs-p.zs);next.zs+=n;message=`幻兽${p.type}转世次数增加${n}次。`;break;}
 case '神兽药水':next.sd=(p.sd??0)+1;next.rareFen=d.rareFen+500;message=`幻兽${p.type}使用了神兽药水，罕见度增加。`;break;
 case '奇异果':next.qyg=(p.qyg??0)+1;next.rareFen=d.rareFen+50;message=`幻兽${p.type}使用了奇异果，罕见度增加。`;break;
 case '雷神兽内丹':next.nowLifeLv=(p.nowLifeLv??0)+1;axes.forEach((axis,i)=>{const key=('rate'+axis) as 'rateLife';next[key]=p[key]*(d.attributes[i]!.main?1.5:p.nextLvRate!);});if(next.zs<next.maxZs)next.zs++;if((p.oldLevels??1)<p.levels){next.oldLevels=p.levels;next.oldNowExp=p.nowExp??0;next.oldMaxExp=p.maxExp??Math.floor(p.levels*9);}next.levels=1;next.nowExp=0;next.maxExp=9;next.maxZs+=50;next.rareFen=d.rareFen+500;message=`幻兽${p.type}使用神秘的雷神兽内丹，进化出第${['','二代','三代'][next.nowLifeLv]}幻兽。`;break;
 default:{const axis=['水神兽内丹','风神兽内丹','火神兽内丹','地神兽内丹'].indexOf(type),key=('rate'+axes[axis]) as 'rateLife',draw=random();if(!Number.isFinite(draw)||draw<0||draw>=1)return {ok:false,message:'随机输入无效，未消耗'};next.isGod=true;next.rareFen=d.rareFen+200;next[key]=Math.round(p[key]*(1.5+draw/2)*10000)/10000;message=`幻兽${p.type}使用神兽内丹，蜕变成神使幻兽。`;}
 }
 const after=petDetails(next,bell);if(!after)return {ok:false,message:'进阶结果无效，未消耗'};
 if(!['电浆药水','幻兽转世水晶','幻兽转世丹'].includes(type))next.life=Math.max(0,Math.min(oldLife,after.maxLife));
 Object.assign(p,next);return {ok:true,message};
}
export function usePetAdvancement(progression:PetProgression,p:PetRecord,index:number,item:Item,random:()=>number=Math.random){
 const r=progression.owner;if(!progression.valid()||!r.pets.includes(p)||!p.battle||!progression.slots.includes(p)||r.bag[index]!==item||!Number.isInteger(item.number??0)||Number(item.number??0)<0)return {ok:false,message:'幻兽或道具已经改变，未消耗'};
 const result=advancePet(p,item.type,random,progression.bells[progression.slots.indexOf(p)]);if(result.ok){if(Number(item.number)>1)item.number=Number(item.number)-1;else r.bag[index]=null;}r.messages.push(result.message);return result;
}
