import {SOUL_MATERIAL,soulDescription} from '../domain/equipment-soul.ts';
import {REFORGE_MATERIALS} from '../domain/equipment-reforge.ts';
import {ELEMENT_MATERIALS,ELEMENT_NAMES} from '../domain/equipment-elements.ts';
import {RING_MATERIALS,ringActiveFields,RING_FIELD_LABELS} from '../domain/ring-forge.ts';
import {GEM_TYPES} from '../domain/equipment-gems.ts';
import {LEVEL_STONES} from '../domain/equipment-level.ts';
import type {Journey} from '../domain/journey.ts';
import {SOCKET_BOXES,type ForgeSlot} from '../domain/equipment-sockets.ts';
import {MAGIC_STONES} from '../domain/equipment-magic.ts';
import {QUALITY_STONE,qualityName} from '../domain/equipment-quality.ts';
const el=(id:string)=>document.getElementById(id)!;
export class SocketView {
 private previous='';
 private mode:'socket'|'magic'|'quality'|'level'|'gem'|'ring'|'element'|'reforge'|'soul'='socket';
 constructor(private journey:Journey){
  const button=document.createElement('button');button.id='socket-button';button.textContent='装备开孔';el('inventory').append(button);
  const magicButton=document.createElement('button');magicButton.id='magic-button';magicButton.textContent='魔魂强化';el('inventory').append(magicButton);
  const qualityButton=document.createElement('button');qualityButton.id='quality-button';qualityButton.textContent='品质提升';el('inventory').append(qualityButton);
  const levelButton=document.createElement('button');levelButton.id='level-button';levelButton.textContent='等级提升';el('inventory').append(levelButton);
  const gemButton=document.createElement('button');gemButton.id='gem-button';gemButton.textContent='宝石镶嵌';el('inventory').append(gemButton);
  const ringButton=document.createElement('button');ringButton.id='ring-button';ringButton.textContent='戒指打造';el('inventory').append(ringButton);
  const elementButton=document.createElement('button');elementButton.id='element-button';elementButton.textContent='元素打造';el('inventory').append(elementButton);
  const reforgeButton=document.createElement('button');reforgeButton.id='reforge-button';reforgeButton.textContent='高阶重铸';el('inventory').append(reforgeButton);
  const soulButton=document.createElement('button');soulButton.id='soul-button';soulButton.textContent='魔之魂附加';el('inventory').append(soulButton);
  const panel=document.createElement('section');panel.id='socket-panel';panel.hidden=true;panel.setAttribute('aria-label','装备开孔');
  panel.innerHTML='<button id="close-sockets" aria-label="关闭装备开孔">关闭</button><h2>装备开孔</h2><p>按初级→中级→高级，依次开至3孔。</p><p>关闭保留物品；穿戴装备需先卸下。</p><div id="socket-item"></div><div id="socket-stone"></div><button id="forge-sockets">确认开孔</button><p id="socket-feedback" role="status"></p>';
  document.querySelector('main')!.append(panel);
  const open=(mode:typeof this.mode)=>{this.mode=mode;journey.removal?.close();journey.reward?.close();journey.sockets?.show();if(journey.sockets)journey.sockets.feedback='';el('equipment-panel').hidden=true;this.render();};
  soulButton.onclick=()=>open('soul');reforgeButton.onclick=()=>open('reforge');elementButton.onclick=()=>open('element');ringButton.onclick=()=>open('ring');gemButton.onclick=()=>open('gem');button.onclick=()=>open('socket');magicButton.onclick=()=>open('magic');qualityButton.onclick=()=>open('quality');levelButton.onclick=()=>open('level');
  el('close-sockets').onclick=()=>{journey.sockets?.close();this.render();};
 }
 render(){
  const j=this.journey,s=j.sockets;if(!s)return;const key=JSON.stringify([this.mode,s.snapshot(),j.reward?.bag,j.inventory?.maxLevel,j.reward?.credit]);if(key===this.previous)return;this.previous=key;
  el('socket-panel').hidden=!s.open;const revision=s.revision;
  const soul=this.mode==='soul',reforge=this.mode==='reforge',element=this.mode==='element',ring=this.mode==='ring',gem=this.mode==='gem',magic=this.mode==='magic',quality=this.mode==='quality',level=this.mode==='level',material=soul||reforge||element||ring||gem||magic||quality||level;
  const title=soul?'魔之魂附加':reforge?'高阶重铸':element?'元素打造':ring?'戒指打造':gem?'宝石镶嵌':level?'等级提升':quality?'品质提升':magic?'魔魂强化':'装备开孔';el('socket-panel').setAttribute('aria-label',title);el('socket-panel').querySelector('h2')!.textContent=title;el('close-sockets').setAttribute('aria-label','关闭'+title);
  el('socket-panel').querySelector('p')!.textContent=soul?'十类属性按材料原值覆盖，每件另加5战斗力。魔之魂与战魂独立；当前旅程尚未开放魔之魂获取。':reforge?`灵魂王：极品前1颗；神品5颗/20声望，上神品10颗/50声望。神力宝石重置为1级。当前声望 ${j.reward?.credit}；神力宝石可在5级杂货商购买，灵魂王获取尚未开放。`:element?`五元素首次附加消耗声望10（雷25）；当前声望 ${j.reward?.credit}。元素石要求极品且四项数值均低于装备等级。普通开局赠送4个雷元素，debug另送5个；其余元素材料获取尚未开放。`:ring?'灵魂材料提升品质；八类精炼共用10级上限。只有已解锁副属性生效。':gem?'宝石依次镶入首个空孔；攻击限武器/鞋，减伤限衣服/头盔。':level?`1级升至15级；120级前每次+15，之后逐级提升。人物最高等级 ${j.inventory?.maxLevel}。`:quality?'灵魂晶石按品质消耗2 / 4 / 8 / 16颗，最高极品。':magic?'晶石最高+19；之心按品质最高+19 / +38 / +50。':'按初级→中级→高级，依次开至3孔。';
  for(const slot of ['item','stone'] as ForgeSlot[]){
   const box=el('socket-'+slot);box.replaceChildren();const item=s[slot],label=document.createElement('strong');label.textContent=slot==='item'?'装备':material?'材料':'宝盒';box.append(label);
   const value=document.createElement('p');value.className='socket-value';value.textContent=item?`${item.name??item.type}${slot==='item'&&item.type==='戒指'?` · ${qualityName(item.grade)} · 精炼 ${item.mhdj??0} / 10 · 售价 ${item.salePrice??0}`:slot==='item'?` · ${item.levels??1}级 · ${item.holes??0}孔 · 售价 ${item.salePrice??0}`:` ×${item.number||1}`}`:'尚未放入';box.append(value);
   if(item){const detail=document.createElement('p');detail.className='socket-detail';detail.textContent=slot==='item'?Array.from({length:Number(item.holes??0)},(_,i)=>`孔${i+1}：${item['hole'+(i+1)]===0?'空':item['hole'+(i+1)]}`).join(' · '):'';box.append(detail);const take=document.createElement('button');take.textContent=slot==='item'?'取回装备':'取回宝盒';take.onclick=()=>{s.take(slot,revision,{x:j.x,y:j.y},(x,y)=>j.groundContains(x,y));this.render();};box.append(take);}
   if(item&&slot==='item'&&item.type==='戒指'){const info=document.createElement('p');info.className='socket-detail';info.textContent=`${qualityName(item.grade)} · 精炼 ${item.mhdj??0} / 10 · 已激活：`+ringActiveFields(item).map(k=>`${RING_FIELD_LABELS[k]??k} ${item[k]??0}`).join('，');box.append(info);}
   if(item&&slot==='item'&&item.type!=='戒指'){const detail=document.createElement('p');detail.className='socket-detail';detail.textContent=`${qualityName(item.grade)} · 元素 ${ELEMENT_NAMES[Number(item.element??0)]}（风${item.wind??0} 火${item.fire??0} 水${item.water??0} 地${item.soil??0}） · 魔魂 +${item.mhdj??0} · 基础攻击 ${item.minAttack??0}–${item.maxAttack??0} / 防御 ${item.defense??0} · 魔魂攻击 +${item.mMinAttack??0}–${item.mMaxAttack??0} / 防御 +${item.mDefense??0}`;box.append(detail);}
   if(item&&(soul||item.val1!==undefined)&&item.type!=='戒指'){const info=document.createElement('p');info.className='socket-detail';info.textContent=soulDescription(item);box.append(info);}
   const select=document.createElement('select');select.setAttribute('aria-label',slot==='item'?(soul?'选择附魂装备':reforge?'选择重铸装备':element?'选择元素装备':ring?'选择打造戒指':gem?'选择镶嵌装备':level?'选择升级装备':quality?'选择品质装备':magic?'选择强化装备':'选择开孔装备'):(soul?'选择魔之魂':reforge?'选择重铸材料':element?'选择元素材料':ring?'选择戒指材料':gem?'选择镶嵌宝石':level?'选择幻魔材料':quality?'选择品质材料':magic?'选择魔魂材料':'选择月光宝盒'));
   const blank=document.createElement('option');blank.value='';blank.textContent=slot==='item'?'从背包选择装备':'从背包选择宝盒';select.append(blank);
   j.reward!.bag.forEach((v,i)=>{if(v&&s.accepts(v)&&(slot==='stone')===(v.type==='宝石')&&(slot==='item'?(ring?v.type==='戒指':v.type!=='戒指'):(soul?v.name===SOUL_MATERIAL:reforge?REFORGE_MATERIALS.includes(v.name??''):element?ELEMENT_MATERIALS.includes(v.name??''):ring?RING_MATERIALS.includes(v.name??''):gem?!!GEM_TYPES[v.name??'']:level?LEVEL_STONES.some(n=>n===v.name):quality?v.name===QUALITY_STONE:magic?MAGIC_STONES.some(n=>n===v.name):SOCKET_BOXES.some(n=>n===v.name)))){const option=document.createElement('option');option.value=String(i);option.textContent=`${v.name??v.type} · ${slot==='item'?(v.type==='戒指'?`${qualityName(v.grade)} · 精炼 ${v.mhdj??0}/10`:`${qualityName(v.grade)} · ${v.holes??0}孔 · 魔魂+${v.mhdj??0}`):`×${v.number||1}`}（背包${i+1}）`;select.append(option);}});
   const items=[...j.reward!.bag];select.onchange=()=>{if(select.value==='')return;const i=Number(select.value),v=items[i];if(v)s.select(i,v,revision,{x:j.x,y:j.y},(x,y)=>j.groundContains(x,y));this.render();};box.append(select);
  }
  if(material){const take=el('socket-stone').querySelector('button');if(take)take.textContent='取回材料';el('socket-stone').querySelector('option')!.textContent='从背包选择材料';}
  const plan=soul?s.soulPlan():reforge?s.reforgePlan():element?s.elementPlan():ring?s.ringPlan():gem?s.gemPlan():level?s.levelPlan():quality?s.qualityPlan():magic?s.magicPlan():null;
  el('forge-sockets').textContent=soul?'确认附魂':reforge?'确认重铸':element?'确认元素打造':ring?'确认戒指打造':gem?'确认镶嵌':level?'确认升级':quality?'确认提升':magic?'确认强化':'确认开孔';el('forge-sockets').onclick=()=>{if(soul)s.forgeSoul(revision);else if(reforge)s.forgeReforge(revision);else if(element)s.forgeElement(revision);else if(ring)s.forgeRing(revision);else if(gem)s.forgeGem(revision);else if(level)s.forgeLevel(revision);else if(quality)s.forgeQuality(revision);else if(magic)s.forgeMagic(revision);else s.forge(revision);this.render();};el('forge-sockets').setAttribute('data-eligible',String(plan?plan.ok:s.canForge()));el('socket-feedback').textContent=plan?[...new Set([s.feedback,plan.reason])].filter(Boolean).join(' '):s.feedback;
 }
}
