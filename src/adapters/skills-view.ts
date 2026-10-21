import type {Journey} from '../domain/journey.ts';
import {SKILLS,SKILL_BOOKS} from '../domain/character-skills.ts';
export class SkillsView {
 private previous='';private owner:unknown;private map='';
 private panel=document.createElement('section');private list=document.createElement('div');private summary=document.createElement('p');
 constructor(private journey:Journey){
  const toggle=document.createElement('button');toggle.id='skills-button';toggle.hidden=true;document.querySelector('main')!.append(toggle);
  this.panel.id='skills-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','人物技能');
  const close=document.createElement('button');close.textContent='关闭';close.setAttribute('aria-label','关闭技能');close.className='close-skills';close.onclick=()=>this.panel.hidden=true;
  const title=document.createElement('h2');title.textContent='人物技能';const note=document.createElement('p');note.textContent='在背包使用技能书学习。主动技能的战斗施放尚未开放。';this.list.id='skills-list';this.summary.id='skills-summary';
  this.panel.append(close,title,this.summary,note,this.list);document.querySelector('main')!.append(this.panel);
  toggle.onclick=()=>{this.panel.hidden=!this.panel.hidden;journey.releaseInput();this.render();};
 }
 render(){const inv=this.journey.inventory;if(!inv)return;if(this.owner!==inv||this.map!==this.journey.map){this.panel.hidden=true;this.owner=inv;this.map=this.journey.map;}
  const key=JSON.stringify([inv.skills,inv.xpEnabled,inv.consumables.maxPower,this.journey.profession]);if(this.previous===key)return;this.previous=key;
  this.summary.textContent=`已学 ${Object.values(inv.skills).filter(n=>n>0).length} 种 · XP学习状态 ${inv.xpEnabled?'已启用':'未启用'} · 容量 ${inv.consumables.maxPower}`;
  this.list.replaceChildren(...SKILLS.filter(s=>SKILL_BOOKS.some(b=>b.name===s.name&&(b.data.vocational==='公共'||b.data.vocational===this.journey.profession))).map(s=>{const row=document.createElement('article');row.dataset.skill=s.name;const title=document.createElement('h3');title.textContent=`${s.name} · ${inv.skills[s.name]??0} / ${s.maxLevel}`;const text=document.createElement('p');text.textContent=s.description.replaceAll('\r','\n');if(!s.active&&['重伤','寒冰','重击','破防'].includes(s.name))text.textContent+='\n触发参数已记录，战斗触发尚未开放。';row.append(title,text);return row;}));
 }
}
