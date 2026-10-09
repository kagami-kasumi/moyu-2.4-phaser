import {CHARACTERS} from '../content/character-entry.ts';
import {qualityName} from '../domain/equipment-quality.ts';
import {EQUIPMENT_SLOTS} from '../domain/inventory.ts';
import {SourceUI} from './source-ui.ts';
import type {Journey} from '../domain/journey.ts';
import type {Item} from '../domain/npc-reward.ts';
export interface RewardAssets {icons:Record<string,{shape:number}>;shapes:Record<number,{file:string;bounds:number[]}>}
const labels:Record<string,string>={type:'种类',name:'名称',salePrice:'售价',grade:'品质',mhdj:'魔魂等级',vocational:'职业',levels:'等级',minAttack:'最小攻击',maxAttack:'最大攻击',mMinAttack:'魔魂最小攻击',mMaxAttack:'魔魂最大攻击',defense:'防御',mDefense:'魔魂防御',attack:'攻击',maxLife:'生命',maxMp:'魔力',otherFire:'战斗力',reduceDamage:'减伤害',burst:'暴击',jook:'闪避',moreAttack:'攻击加成',moreDefense:'防御加成',moreLife:'生命加成',moreMp:'魔力加成',mainType1:'主属性一',mainType2:'主属性二',pairType1:'副属性一',pairType2:'副属性二',pairType3:'副属性三',pairType4:'副属性四',element:'元素',wind:'风',fire:'火',soil:'地',water:'水',holes:'镶嵌孔',hole1:'孔一',hole2:'孔二',hole3:'孔三',gem1:'宝石一',gem2:'宝石二',gem3:'宝石三',gem11:'宝石一副值',gem12:'宝石二副值',gem13:'宝石三副值',additional:'附加',spirit:'魔之魂',spiritVal:'魔之魂属性',spiritLevels:'魔之魂等级',spiritExp:'魔之魂经验'};
const el=(id:string)=>document.getElementById(id)!;
const node=(tag:string,text?:string)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export class RewardView {
 private previous='';private depth=10;
 constructor(private journey:Journey,private assets:RewardAssets,private ui:SourceUI){el('close-talk').onclick=()=>{journey.reward?.close();this.render();};el('inventory-button').onclick=()=>{el('inventory').hidden=!el('inventory').hidden;el('inventory').style.zIndex=String(++this.depth);this.render();};
 el('pets-button').onclick=()=>{el('pet-panel').hidden=!el('pet-panel').hidden;el('pet-panel').style.zIndex=String(++this.depth);journey.reward?.close();this.render();};
 el('equipment-button').onclick=()=>{el('equipment-panel').hidden=!el('equipment-panel').hidden;el('equipment-panel').style.zIndex=String(++this.depth);this.render();};el('close-equipment').onclick=()=>{el('equipment-panel').hidden=true;};
 el('close-pets').onclick=()=>{el('pet-panel').hidden=true;};
 const bag=this.ui.tree(2074,{skip:[...Array.from({length:40},(_,i)=>'包格'+(i+1)),'closeButton','msGold','resGold','mstip','restip']});bag.classList.add('panel-art');el('inventory').prepend(bag);
 const pet=this.ui.tree(2482,{skip:['closeButton','detailButton','dropButton','page','focusMC','幻兽格1','幻兽格2','幻兽格3','幻兽格4']});pet.classList.add('panel-art');el('pet-panel').prepend(pet);
 for(const id of ['close-talk','close-inventory','close-pets'])el(id).replaceChildren(this.ui.tree(2057));
 el('talk-art').append(this.ui.tree(2212));}
 private icon(label:string){const data=this.assets.icons[label];if(!data&&!this.ui.assets.nodes[2047]?.frames?.some(f=>f.label===label)){const badge=node('span',label.slice(0,2));badge.className='item-badge';badge.setAttribute('aria-label',label);badge.title=label;return badge;}if(!data){const icon=this.ui.tree(2047,{label});icon.classList.add('source-icon');icon.setAttribute('aria-label',label);return icon;}const s=this.assets.shapes[data.shape]!;const img=document.createElement('img');img.src='/assets/npc-reward/'+s.file;img.alt=label;img.width=Math.ceil(s.bounds[2]!-s.bounds[0]!);img.height=Math.ceil(s.bounds[3]!-s.bounds[1]!);return img;}
 private item(item:Item,index?:number){
  const title=item.name??item.type;const iconLabel=['武器','衣服','头盔','鞋'].includes(item.type)?qualityName(item.grade)+(item.levels??1)+'级'+(item.vocational??'战士')+item.type:title;
  const card=node('details');card.className='item';card.dataset.item=title;const summary=node('summary');summary.setAttribute('aria-label',title);summary.title=title+(['武器','衣服','头盔','鞋'].includes(item.type)?' · '+qualityName(item.grade):'');card.dataset.quality=String(item.grade??'');summary.append(this.icon(iconLabel),node('span',title),node('b',(item.number??0)>1?String(item.number):''));card.append(summary);card.addEventListener('toggle',()=>{if((card as HTMLDetailsElement).open){for(const other of el('bag-items').querySelectorAll('details'))if(other!==card)other.open=false;}});
  const list=node('dl');list.setAttribute('aria-label',title+'属性');for(const [k,v]of Object.entries(item)){if(k==='number'||v===undefined)continue;let text=String(v);if(k==='grade')text=qualityName(v);else if(k.includes('Type'))text=labels[text]??text;list.append(node('dt',labels[k]??k),node('dd',text));}if(index!==undefined){const action=this.journey.inventory?.action(item);const button=node('button',action??'查看使用条件');button.className='item-use';button.setAttribute('aria-label',(action??'查看使用条件')+' '+title);button.onclick=()=>{this.journey.inventory?.use(index,item,{x:this.journey.x,y:this.journey.y},(x,y)=>this.journey.groundContains(x,y));this.render();};const row=node('div');row.className='item-action';row.append(button);list.prepend(row);}card.append(list);
  return card;
 }
 render(){const r=this.journey.reward;if(!r)return;const key=JSON.stringify([r.revision,r.snapshot(),this.journey.inventory?.snapshot()]);if(key===this.previous)return;this.previous=key;el('talk-role').replaceChildren(this.ui.tree(2292,{label:CHARACTERS[this.journey.profession].label}));
  el('reward-controls').hidden=false;el('talk').hidden=!r.open;if(r.open)el('talk').style.zIndex=String(++this.depth);el('talk-words').textContent='　　'+r.words.replaceAll('\r','\n');el('talk-later').hidden=!r.answers.some(a=>a.cmd===7);
  el('talk-art').style.height=(180+20*Math.max(0,r.answers.length-3))+'px';
  (el('talk-art').firstElementChild as HTMLElement).style.transform=`scaleY(${(180+20*Math.max(0,r.answers.length-3))/322})`;
  const answers=el('talk-answers');answers.replaceChildren();const revision=r.revision;for(const a of r.answers){const button=node('button',a.txt);button.addEventListener('click',()=>{r.choose(a.cmd,revision,{x:this.journey.x,y:this.journey.y},(x,y)=>this.journey.groundContains(x,y));this.render();});answers.append(button);}
  const head=el('talk-head');if(!head.childElementCount)head.append(this.icon('老兵'));
  el('reward-completed').hidden=r.claimedPack===null;el('reward-completed').textContent=r.claimedPack===null?'':`首次礼包${['一','二','三'][r.claimedPack-1]}已领取。可打开背包查看；老兵不会再次提供首次礼包。`;
  el('bag-count').textContent=`物品背包 ${r.bag.filter(Boolean).length} / 40`;el('bag-items').replaceChildren(...r.bag.map((item,i)=>{const card=item?this.item(item,i):node('div');card.classList.add('bag-slot');card.dataset.slot=String(i+1);Object.assign(card.style,{left:(5+(i%8)*36)+'px',top:(35+Math.floor(i/8)*35)+'px'});return card;}));
  el('ms-value').textContent=r.ms.toLocaleString('en-US');el('res-value').textContent=r.res.toLocaleString('en-US');
  const inv=this.journey.inventory;if(inv){el('equipment-slots').replaceChildren(...EQUIPMENT_SLOTS.map(slot=>{const item=inv.equipment[slot],row=node('div');row.className='equipment-slot';row.append(node('span',slot),node('strong',item?(item.name??slot)+' · '+qualityName(item.grade):'未装备'));if(item){const button=node('button','卸下');button.setAttribute('aria-label','卸下 '+(item.name??slot));button.onclick=()=>{inv.unequip(slot,item,{x:this.journey.x,y:this.journey.y},(x,y)=>this.journey.groundContains(x,y));this.render();};row.append(button);}return row;}));const st=inv.stats();el('equipment-stats').textContent=`攻击 ${st.minAttack}–${st.maxAttack} · 防御 ${st.defense}\n生命上限 ${st.maxLife} · 魔力上限 ${st.maxMp}\n人物战斗力 ${st.roleFire}（不含幻兽）\n英勇 ${st.bravery} / 50 级\n功勋 ${st.exploit} · 军功 ${st.militaryExploit}`;}
  el('pet-count').textContent=`幻兽初始记录 ${r.pets.length} / 40`;el('pet-items').replaceChildren(...r.pets.map(p=>{const card=node('article');card.className='pet-record';card.append(this.icon(p.type),node('h3',p.type),node('p',`等级 ${p.levels} · 转世 ${p.zs} / ${p.maxZs} · 元素 无 · 称号 无`),node('p',`生命成长 ${p.rateLife} · 攻击成长 ${p.rateMinAttack}–${p.rateMaxAttack} · 防御成长 ${p.rateDefense}`),node('p',p.battle?'新建时已出征。战斗与跟随尚未开放。':'已孵化，未出征。战斗与跟随尚未开放。'));return card;}));
  el('ground-items').replaceChildren(...r.drops.map(d=>{const card=this.item(d.item);return card;}));el('ground-section').hidden=!r.drops.length;el('reward-message').textContent=r.messages.at(-1)??'';
 }
}

