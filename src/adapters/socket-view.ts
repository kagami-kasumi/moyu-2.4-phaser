import type {Journey} from '../domain/journey.ts';
import {SOCKET_BOXES,type ForgeSlot} from '../domain/equipment-sockets.ts';
import {MAGIC_STONES} from '../domain/equipment-magic.ts';
import {QUALITY_STONE,qualityName} from '../domain/equipment-quality.ts';
const el=(id:string)=>document.getElementById(id)!;
export class SocketView {
 private previous='';
 private mode:'socket'|'magic'|'quality'='socket';
 constructor(private journey:Journey){
  const button=document.createElement('button');button.id='socket-button';button.textContent='装备开孔';el('inventory').append(button);
  const magicButton=document.createElement('button');magicButton.id='magic-button';magicButton.textContent='魔魂强化';el('inventory').append(magicButton);
  const qualityButton=document.createElement('button');qualityButton.id='quality-button';qualityButton.textContent='品质提升';el('inventory').append(qualityButton);
  const panel=document.createElement('section');panel.id='socket-panel';panel.hidden=true;panel.setAttribute('aria-label','装备开孔');
  panel.innerHTML='<button id="close-sockets" aria-label="关闭装备开孔">关闭</button><h2>装备开孔</h2><p>按初级→中级→高级，依次开至3孔。</p><p>关闭保留物品；穿戴装备需先卸下。</p><div id="socket-item"></div><div id="socket-stone"></div><button id="forge-sockets">确认开孔</button><p id="socket-feedback" role="status"></p>';
  document.querySelector('main')!.append(panel);
  const open=(mode:typeof this.mode)=>{this.mode=mode;journey.reward?.close();journey.sockets?.show();if(journey.sockets)journey.sockets.feedback='';el('equipment-panel').hidden=true;this.render();};
  button.onclick=()=>open('socket');magicButton.onclick=()=>open('magic');qualityButton.onclick=()=>open('quality');
  el('close-sockets').onclick=()=>{journey.sockets?.close();this.render();};
 }
 render(){
  const j=this.journey,s=j.sockets;if(!s)return;const key=JSON.stringify([this.mode,s.snapshot(),j.reward?.bag]);if(key===this.previous)return;this.previous=key;
  el('socket-panel').hidden=!s.open;const revision=s.revision;
  const magic=this.mode==='magic',quality=this.mode==='quality',material=magic||quality;
  const title=quality?'品质提升':magic?'魔魂强化':'装备开孔';el('socket-panel').setAttribute('aria-label',title);el('socket-panel').querySelector('h2')!.textContent=title;el('close-sockets').setAttribute('aria-label','关闭'+title);
  el('socket-panel').querySelector('p')!.textContent=quality?'灵魂晶石按品质消耗2 / 4 / 8 / 16颗，最高极品。':magic?'晶石最高+19；之心按品质最高+19 / +38 / +50。':'按初级→中级→高级，依次开至3孔。';
  for(const slot of ['item','stone'] as ForgeSlot[]){
   const box=el('socket-'+slot);box.replaceChildren();const item=s[slot],label=document.createElement('strong');label.textContent=slot==='item'?'装备':material?'材料':'宝盒';box.append(label);
   const value=document.createElement('p');value.className='socket-value';value.textContent=item?`${item.name??item.type}${slot==='item'?` · ${item.holes??0}孔 · 售价 ${item.salePrice??0}`:` ×${item.number||1}`}`:'尚未放入';box.append(value);
   if(item){const detail=document.createElement('p');detail.className='socket-detail';detail.textContent=slot==='item'?Array.from({length:Number(item.holes??0)},(_,i)=>`孔${i+1}：${item['hole'+(i+1)]===0?'空':item['hole'+(i+1)]}`).join(' · '):'';box.append(detail);const take=document.createElement('button');take.textContent=slot==='item'?'取回装备':'取回宝盒';take.onclick=()=>{s.take(slot,revision,{x:j.x,y:j.y},(x,y)=>j.groundContains(x,y));this.render();};box.append(take);}
   if(item&&slot==='item'){const detail=document.createElement('p');detail.className='socket-detail';detail.textContent=`${qualityName(item.grade)} · 魔魂 +${item.mhdj??0} · 基础攻击 ${item.minAttack??0}–${item.maxAttack??0} / 防御 ${item.defense??0} · 魔魂攻击 +${item.mMinAttack??0}–${item.mMaxAttack??0} / 防御 +${item.mDefense??0}`;box.append(detail);}
   const select=document.createElement('select');select.setAttribute('aria-label',slot==='item'?(quality?'选择品质装备':magic?'选择强化装备':'选择开孔装备'):(quality?'选择品质材料':magic?'选择魔魂材料':'选择月光宝盒'));
   const blank=document.createElement('option');blank.value='';blank.textContent=slot==='item'?'从背包选择装备':'从背包选择宝盒';select.append(blank);
   j.reward!.bag.forEach((v,i)=>{if(v&&s.accepts(v)&&(slot==='stone')===(v.type==='宝石')&&(slot==='item'||(quality?v.name===QUALITY_STONE:magic?MAGIC_STONES.some(n=>n===v.name):SOCKET_BOXES.some(n=>n===v.name)))){const option=document.createElement('option');option.value=String(i);option.textContent=`${v.name??v.type} · ${slot==='item'?`${qualityName(v.grade)} · ${v.holes??0}孔 · 魔魂+${v.mhdj??0}`:`×${v.number||1}`}（背包${i+1}）`;select.append(option);}});
   const items=[...j.reward!.bag];select.onchange=()=>{if(select.value==='')return;const i=Number(select.value),v=items[i];if(v)s.select(i,v,revision,{x:j.x,y:j.y},(x,y)=>j.groundContains(x,y));this.render();};box.append(select);
  }
  if(material){const take=el('socket-stone').querySelector('button');if(take)take.textContent='取回材料';el('socket-stone').querySelector('option')!.textContent='从背包选择材料';}
  const plan=quality?s.qualityPlan():magic?s.magicPlan():null;
  el('forge-sockets').textContent=quality?'确认提升':magic?'确认强化':'确认开孔';el('forge-sockets').onclick=()=>{if(quality)s.forgeQuality(revision);else if(magic)s.forgeMagic(revision);else s.forge(revision);this.render();};el('forge-sockets').setAttribute('data-eligible',String(plan?plan.ok:s.canForge()));el('socket-feedback').textContent=plan?[...new Set([s.feedback,plan.reason])].filter(Boolean).join(' '):s.feedback;
 }
}
