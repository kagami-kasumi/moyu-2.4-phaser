import type {Journey} from '../domain/journey.ts';
import {SOUTH_PET_CARDS} from '../domain/south-pet-merchant.ts';
export class SouthPetMerchantView {
 private panel=document.createElement('section');private previous='';
 constructor(private journey:Journey){this.panel.id='south-pet-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','南城幻兽商');document.querySelector('main')!.append(this.panel);}
 render(){const service=this.journey.southPetMerchant;if(!service){this.panel.hidden=true;return;}if(service.open&&!service.canInteract())service.close();this.panel.hidden=!service.open;
  const key=JSON.stringify([service.open,service.revision,service.reward.ms]);if(key===this.previous)return;this.previous=key;
  const revision=service.revision,button=(label:string,action:()=>void)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{action();this.render();};return b;};
  const title=document.createElement('h2');title.textContent='南城幻兽商';const description=document.createElement('p');description.textContent='极品35星幻兽卡 · 购买后在背包孵化。满包时卡片会落在地上。';const balance=document.createElement('p');balance.textContent='魔石 '+service.reward.ms;
  this.panel.replaceChildren(title,description,balance);if(!service.failed)SOUTH_PET_CARDS.forEach((card,index)=>this.panel.append(button('购买 '+card.type+' · '+card.cost+' 魔石',()=>service.buy(index,revision))));
  const feedback=document.createElement('p');feedback.id='south-pet-feedback';feedback.setAttribute('role','status');feedback.textContent=service.feedback;this.panel.append(feedback,button('关闭幻兽商',()=>service.close()));
 }
}
