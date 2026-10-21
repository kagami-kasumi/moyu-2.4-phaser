import type {Journey} from '../domain/journey.ts';
const labels:Record<number,string>={3011:'返回',3103:'出售我的资源',3104:'1,000资源 → 8魔石',3105:'10,000资源 → 85魔石',3106:'100,000资源 → 850魔石',3107:'500,000资源 → 4,250魔石',3108:'5灵魂晶石 → 亚维特岛地图',3109:'1魔魂之心 → 蜘蛛谷地图',13111:'5声望和888魔石 → 50级PK赛参赛券'};
export class TradeView {
 private panel=document.createElement('section');private previous='';
 constructor(private journey:Journey){this.panel.id='trade-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','城郊管理员');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.journey.trade;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.reward.ms,s.reward.res,s.reward.credit,this.journey.property?.owned]);if(key===this.previous)return;this.previous=key;
  const node=(tag:string,text:string)=>{const e=document.createElement(tag);e.textContent=text;return e;},button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;},rev=s.revision;
  this.panel.replaceChildren(button('关闭管理员',()=>s.close()),node('h2','卡萨诺城郊区管理员'),node('p',`资源 ${s.reward.res.toLocaleString('en-US')} · 魔石 ${s.reward.ms.toLocaleString('en-US')} · 声望 ${s.reward.credit}`),node('p',s.words||'兑换地图与参赛券；对应地区与赛事尚未开放。'));
  if(s.page==='main')this.panel.append(button('我要复活我的幻兽',()=>{if(s.revision===rev)this.journey.revive();}),button(this.journey.property?.owned?'查看已拥有产权':'购买卡萨诺城郊区产权',()=>this.journey.openProperty()));
  for(const cmd of s.choices){const b=button(labels[cmd]!,()=>s.choose(cmd,rev));b.dataset.trade=String(cmd);this.panel.append(b);}const feedback=node('p',s.feedback);feedback.setAttribute('role','status');this.panel.append(feedback);
 }
}
