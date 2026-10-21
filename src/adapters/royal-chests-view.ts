import type {Journey} from '../domain/journey.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class RoyalChestsView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='royal-chest-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','王室宝箱');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.royalChests;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.kind,s.state,s.feedback,s.waiting]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭王室宝箱',()=>s.close()),node('h2',s.definition.title),node('p',!s.known?'原始宝箱命令未知，保留记录并停止领取。':s.first?`未上锁的箱子：首次免费领取2个${s.definition.heart}与1500魔石。`:`每次打开需要1个${s.definition.material}。`));if(s.waiting)this.panel.append(node('p','读档后需等待超过5分钟；首次免费礼物不受此限制。'));this.panel.append(s.pending?button('确认打开王室宝箱',()=>s.confirm(rev)):button('打开看看',()=>s.request(rev)));if(s.pending)this.panel.append(button('取消开箱',()=>s.cancel(rev)));const result=node('p',s.feedback);result.id='royal-chest-result';result.setAttribute('role','status');this.panel.append(result);
 }
}
