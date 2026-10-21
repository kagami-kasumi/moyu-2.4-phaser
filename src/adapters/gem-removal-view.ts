import type {Journey} from '../domain/journey.ts';
import type {SplitSlot} from '../domain/equipment-gems.ts';
const el=(id:string)=>document.getElementById(id)!;
export class GemRemovalView {
 private previous='';
 constructor(private journey:Journey){
  const button=document.createElement('button');button.id='split-button';button.textContent='宝石拆取';el('inventory').append(button);
  const panel=document.createElement('section');panel.id='split-panel';panel.hidden=true;panel.setAttribute('aria-label','宝石拆取');
  panel.innerHTML='<button id="close-split">关闭</button><h2>宝石拆取</h2><p>按占用孔收费：第1孔10、第2孔100、第3孔1000魔石。旧拆出物会先放回背包。</p><div id="split-slots"></div><button id="confirm-split">确认拆取</button><p id="split-feedback" role="status"></p>';
  document.querySelector('main')!.append(panel);
  button.onclick=()=>{journey.sockets?.close();journey.reward?.close();journey.removal?.show();el('equipment-panel').hidden=true;this.render();};
  el('close-split').onclick=()=>{journey.removal?.close();this.render();};
 }
 render(){
  const j=this.journey,s=j.removal;if(!s)return;const key=JSON.stringify([s.snapshot(),j.reward?.bag,j.reward?.ms]);if(key===this.previous)return;this.previous=key;
  el('split-panel').hidden=!s.open;const revision=s.revision,host=el('split-slots');host.replaceChildren();
  for(const slot of ['item','stone1','stone2','stone3'] as SplitSlot[]){const row=document.createElement('div'),label=document.createElement('p'),item=s[slot];row.dataset.slot=slot;label.textContent=(slot==='item'?'装备':'拆出槽'+slot.slice(-1))+'：'+(item?(item.name??item.type):'空');row.append(label);
   if(item){const take=document.createElement('button');take.textContent=slot==='item'?'取回装备':'取回宝石 '+slot.slice(-1);take.onclick=()=>{s.take(slot,revision,{x:j.x,y:j.y},(x,y)=>j.groundContains(x,y));this.render();};row.append(take);}
   if(slot==='item'){const select=document.createElement('select');select.setAttribute('aria-label','选择拆取装备');select.add(new Option('从背包选择装备',''));const bag=[...j.reward!.bag];bag.forEach((v,i)=>{if(v&&['武器','鞋','衣服','头盔'].includes(v.type))select.add(new Option(`${v.name??v.type} · ${v.holes??0}孔（背包${i+1}）`,String(i)));});select.onchange=()=>{if(select.value==='')return;const n=Number(select.value),v=bag[n];if(v)s.select(n,v,revision,{x:j.x,y:j.y},(x,y)=>j.groundContains(x,y));this.render();};row.append(select);}
   host.append(row);
  }
  el('confirm-split').textContent=`确认拆取（${s.price()}魔石）`;el('confirm-split').onclick=()=>{s.split(revision,{x:j.x,y:j.y},(x,y)=>j.groundContains(x,y));this.render();};el('split-feedback').textContent=s.feedback;
 }
}
