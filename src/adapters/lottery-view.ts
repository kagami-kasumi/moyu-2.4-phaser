import type {Journey} from '../domain/journey.ts';
const node=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export class LotteryView {
 private panel=node('section');private previous='';
 constructor(private j:Journey){this.panel.id='lottery-panel';this.panel.hidden=true;this.panel.setAttribute('aria-label','皇宫抽奖箱');document.querySelector('main')!.append(this.panel);}
 render(){const s=this.j.lottery;this.panel.hidden=!s?.open;if(!s)return;const key=JSON.stringify([s.open,s.revision,s.remainingSeconds,s.feedback]);if(key===this.previous)return;this.previous=key;const rev=s.revision,button=(label:string,run:()=>void)=>{const b=node('button',label);b.onclick=()=>{run();this.render();};return b;};this.panel.replaceChildren(button('关闭抽奖箱',()=>s.close()),node('h2','皇宫抽奖箱'),node('p','每次消耗1颗灵魂晶石。奖池包括宝石、材料、技能书与幻兽蛋；满包奖品掉落在地上。'));
 if(s.waiting)this.panel.append(node('p',`读档后等待：还需${s.remainingSeconds}秒。`));
 this.panel.append(s.pending?button('确认打开宝箱',()=>s.confirm(rev)):button('芝麻开门',()=>s.request(rev)));if(s.pending)this.panel.append(button('取消抽奖',()=>s.cancel(rev)));const result=node('p',s.feedback);result.id='lottery-result';result.setAttribute('role','status');this.panel.append(result);
 }
}
