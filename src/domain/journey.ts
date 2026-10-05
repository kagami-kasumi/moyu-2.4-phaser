import {Actor} from './actor.ts';
import type {SliceManifest} from '../content/slice-manifest.ts';
export type MapId='outskirts'|'city';
export interface Entry {name:string;x:number;y:number;visible:boolean;alpha:number;toMap?:MapId;toEntry?:string}
export interface Input {left:boolean;right:boolean;up:boolean;down:boolean;pointerDown:boolean;pointerX:number;pointerY:number}
export const emptyInput=():Input=>({left:false,right:false,up:false,down:false,pointerDown:false,pointerX:0,pointerY:0});
export class Journey {
 map:MapId='outskirts';x=0;y=0;started=false;complete=false;name='';tick=0;transitions=0;input=emptyInput();entries:Entry[]=[];notice='';private phase=0;
 constructor(readonly manifest:SliceManifest,readonly actor:Actor){}
 start(name:string){if(!name||name.length>10)return false;this.name=name;this.started=true;this.complete=false;this.map='outskirts';this.tick=0;this.phase=0;this.transitions=0;this.actor.reset();this.input=emptyInput();this.enter('outskirts','entry3');return true;}
 private enter(map:MapId,entryName:string){this.map=map;this.entries=this.manifest.maps[map].layers.filter(p=>p.name?.startsWith('entry')).map(p=>({name:p.name!,x:p.matrix[4],y:p.matrix[5],visible:true,alpha:(p.color?.mult[3]??256)/256,...(map==='outskirts'&&p.name==='entry2'?{toMap:'city' as const,toEntry:'entry1'}:{})}));const e=this.entries.find(e=>e.name===entryName);if(!e)throw Error('目标入口不存在');this.x=e.x;this.y=e.y;}
 groundContains(globalX:number,globalY:number,map:MapId=this.map){
  const m=this.manifest.rootMatrix,x=globalX/m[0],y=globalY/m[3],shape=this.manifest.shapes[map==='outskirts'?2806:2804],pts=shape.edges.map(e=>[e[1],e[2]]),radius=(shape.lines[0]?.width??0)/2;let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++) {const [ax,ay]=pts[j]!,[bx,by]=pts[i]!,dx=bx!-ax!,dy=by!-ay!,length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((x-ax!)*dx+(y-ay!)*dy)/length)):0;
   if((x-ax!-t*dx)**2+(y-ay!-t*dy)**2<=radius*radius)return true;
   if((ay!>y)!==(by!>y)&&x<(bx!-ax!)*(y-ay!)/(by!-ay!)+ax!)inside=!inside;
  }return inside;
 }
 entryContains(e:Entry,x=this.x,y=this.y){const m=this.manifest.rootMatrix;return x>=(e.x-51)*m[0]&&x<=(e.x+59)*m[0]&&y>=(e.y-21.6)*m[3]&&y<=(e.y+18.4)*m[3];}
 activate(entryName?:string){if(!this.started||this.complete)return false;const e=entryName?this.entries.find(e=>e.name===entryName&&e.visible&&this.entryContains(e)):this.entries.find(e=>e.visible&&this.entryContains(e));if(!e||e.alpha===0)return false;
  if(!e.toMap||!e.toEntry){this.notice='这个出口不在本次旅程中，请前往右侧卡萨诺城一。';return false;}return this.arrive(e.toMap,e.toEntry,e.toMap);
 }
 // Source allowJumpMap validates a pending destination before committing the scene.
 arrive(request:MapId,entry:string,label:MapId){if(this.complete||request!==label)return false;this.enter(label,entry);this.transitions++;this.complete=true;this.input=emptyInput();this.actor.select('idle');return true;}
 releaseInput(){this.input=emptyInput();if(this.started)this.actor.select('idle');}
 private mouseDirection(){if(!this.input.pointerDown)return '';const dx=this.input.pointerX-this.x,dy=this.input.pointerY-this.y;if(Math.abs(dx)<=12&&Math.abs(dy)<=9)return '';const d=Math.abs(dx)-Math.abs(dy);if(d>12)return dx<=0?'L':'R';if(d<9)return dy<=0?'U':'D';return (dx>0?'R':'L')+(dy<=0?'U':'D');}
 step(){if(!this.started)return;this.tick++;if(this.complete){this.actor.step();return;}const before=this.actor.action;const input=this.input,d=this.mouseDirection();let dx=0,dy=0;
  if(input.left||d.includes('L')){dx=-1;dy=input.up||d==='LU'?-1:input.down||d==='LD'?1:0;}
  else if(input.right||d.includes('R')){dx=1;dy=input.up||d==='RU'?-1:input.down||d==='RD'?1:0;}
  else if(input.up||d==='U')dy=-1;else if(input.down||d==='D')dy=1;
  if(dx||dy){this.actor.select('run',dx<0?'left':dx>0?'right':this.actor.facing);
   if(dx&&dy){if(this.groundContains(this.x+dx*9,this.y))this.x+=dx*9;if(this.groundContains(this.x,this.y+dy*9))this.y+=dy*9;}
   else {const choices=dx?[[dx*12,0],[dx*12,9],[dx*12,-9]]:[[0,dy*9],[12,dy*9],[-12,dy*9]];for(const [mx,my]of choices)if(this.groundContains(this.x+mx!,this.y+my!)){this.x+=mx!;this.y+=my!;break;}}
  }else if(!input.pointerDown&&!input.left&&!input.right&&!input.up&&!input.down)this.actor.select('idle');
  if(before===this.actor.action)this.actor.step();else this.actor.tick++;
 }
 advance(ms:number){if(!Number.isFinite(ms)||ms<0)throw Error('Invalid journey clock delta');if(!this.started)return;this.phase+=ms*15;while(this.phase>=1000-1e-7){this.phase=Math.max(0,this.phase-1000);this.step();}}
 snapshot(){return {map:this.map,x:this.x,y:this.y,started:this.started,complete:this.complete,transitions:this.transitions,tick:this.tick,action:this.actor.action,facing:this.actor.facing,frame:this.actor.frame};}
}
