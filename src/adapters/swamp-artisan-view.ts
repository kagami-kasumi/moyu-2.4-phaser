import type {Journey} from '../domain/journey.ts';
import {ARTISAN_RECIPES,type SwampArtisan} from '../domain/swamp-artisan.ts';
const node=(tag:string,text='')=>{const value=document.createElement(tag);value.textContent=text;return value;};
export class SwampArtisanView {
 private panel=node('section');private previous='';private owner?:SwampArtisan;
 constructor(private journey:Journey){this.panel.id='swamp-artisan-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','沼泽巧匠');document.querySelector('main')!.append(this.panel);}
 render(){const title=this.journey.map==='borderCity'?'边关巧匠':'沼泽巧匠';this.panel.setAttribute('aria-label',title);const s=this.journey.swampArtisan;if(!s){this.panel.hidden=true;return;}if(this.owner!==s){this.owner=s;this.previous='';}if(s.open&&!s.canInteract())s.close();this.panel.hidden=!s.open;
  const key=JSON.stringify([this.journey.map,s.open,s.revision,s.feedback,s.reward.credit,this.journey.vitals.level]);if(key===this.previous)return;this.previous=key;
  const revision=s.revision,close=node('button','关闭巧匠');close.onclick=()=>{s.close();this.render();};
  this.panel.replaceChildren(close,node('h2',title),node('p',`等级 ${this.journey.vitals.level} · 声望 ${s.reward.credit}。点击配方立即合成，满包产物落地。`));
  for(const recipe of ARTISAN_RECIPES){const row=node('div'),materials=[recipe.primary,...recipe.checks].map(m=>`${m.count}个${m.name}`).join(' + ')+(recipe.credit?' + 1声望':'');row.append(node('p',materials));const button=node('button','合成 '+recipe.result+(recipe.level?' · 100级起':''));button.dataset.artisan=String(recipe.cmd);button.onclick=()=>{s.craft(recipe.cmd,revision);this.render();};row.append(button);this.panel.append(row);}
  const feedback=node('p',s.feedback);feedback.id='swamp-artisan-feedback';feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
