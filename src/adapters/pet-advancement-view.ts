import {PET_ADVANCEMENT_TYPES,advancementReason,usePetAdvancement} from '../domain/pet-advancement.ts';
import type {PetRecord} from '../domain/npc-reward.ts';
import type {PetProgression} from '../domain/pet-progression.ts';
function effect(type:string,pet:PetRecord){
 const fixed:Record<string,string>={'电浆药水':'变为雷元素。','幻兽转世水晶':'最大转世次数增加1。','幻兽转世丹':`转世次数增加${Math.min(10,pet.maxZs-pet.zs)}，等级不变。`,'神兽药水':'罕见评分增加500。','奇异果':'罕见评分增加50。','雷神兽内丹':'进化一代，提升成长率；降至1级，保留旧等级恢复记录。'};
 return fixed[type]??`成为神使幻兽，罕见评分增加200；${({'风神兽内丹':'最小攻击','火神兽内丹':'最大攻击','水神兽内丹':'生命','地神兽内丹':'防御'} as Record<string,string>)[type]}成长率随机提升至原来的1.5至2倍。`;
}
export function appendPetAdvancement(host:HTMLElement,progression:PetProgression,pet:PetRecord,valid:()=>boolean,done:(message:string)=>void){
 const section=document.createElement('details');section.id='pet-advancement';const summary=document.createElement('summary');summary.textContent='进阶道具（每次消耗1个）';section.append(summary);
 const status=document.createElement('p');status.textContent=`${pet.isGod?'神使幻兽':'普通幻兽'} · 神兽药水 ${pet.sd??0} · 奇异果 ${pet.qyg??0}`;section.append(status);
 const confirm=document.createElement('div');confirm.id='pet-advancement-confirm';let pending=0;
 progression.owner.bag.forEach((item,index)=>{if(!item||!PET_ADVANCEMENT_TYPES.includes(item.type))return;const button=document.createElement('button');button.textContent='使用 '+item.type;button.onclick=()=>{if(!valid())return;const token=++pending,reason=advancementReason(pet,item.type),description=document.createElement('p');description.textContent=reason||`确认对 ${pet.type} 使用 ${item.type}？消耗1个。${effect(item.type,pet)}`;confirm.replaceChildren(description);if(!reason){const yes=document.createElement('button');yes.textContent='确认进阶';yes.onclick=()=>{if(!valid()||token!==pending)return;pending++;done(usePetAdvancement(progression,pet,index,item).message);};confirm.append(yes);}const no=document.createElement('button');no.textContent='取消进阶';no.onclick=()=>{pending++;confirm.replaceChildren();};confirm.append(no);};section.append(button);});section.append(confirm);host.append(section);
}
