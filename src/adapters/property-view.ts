import type {Journey} from '../domain/journey.ts';import {ROLE_PROGRESSION_RULES} from '../content/role-progression-rules.ts';
export class PropertyView {
 private panel=document.createElement('section');private previous='';
 constructor(private journey:Journey){this.panel.id='property-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','城郊产权');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.journey.property;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.owned,s.revision,s.rank(),s.reward.ms,s.reward.res]);if(key===this.previous)return;this.previous=key;
  const node=(tag:string,text:string)=>{const e=document.createElement(tag);e.textContent=text;return e;},button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;},rev=s.revision;
  this.panel.replaceChildren(button('关闭产权',()=>s.close()),node('h2','卡萨诺城郊区产权'),node('p',`爵位 ${ROLE_PROGRESSION_RULES.nobility[s.rank()]!.name} · 魔石 ${s.reward.ms.toLocaleString('en-US')} · 资源 ${s.reward.res.toLocaleString('en-US')}`),node('p',s.owned?'已拥有产权':'购买需要勋爵及以上、100魔石；赠送10,000资源。'),node('p','原版产权可使对应野外战斗获得资源；野外战斗尚未开放。'));
  if(!s.owned)this.panel.append(button('我确定要购买',()=>s.buy(rev)));
  this.panel.append(button(s.owned?'返回管理员':'我还是再考虑一下吧',()=>{s.close();this.journey.openTrade();}));const feedback=node('p',s.feedback);feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
