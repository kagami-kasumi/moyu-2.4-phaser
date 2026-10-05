// Independent expected: verbatim source functions, XML-reviewed geometry, no production imports.
import fs from 'node:fs';import vm from 'node:vm';
const frozen=JSON.parse(fs.readFileSync('docs/reverse-engineering/first-slice/behavior-source.json','utf8'));
export function oracle(){
 const keys=new Set(),context=vm.createContext({Math,Key:{isDown:k=>keys.has(k)},_global:{ownMap:false}});
 const map={catchMouseDown:false,_xmouse:0,_ymouse:0,nowMap:'卡萨诺城郊区',nextMap:'',nextEntry:'',goods:{clearGoods(){}},_parent:{closeAllPanel(){},warning:{close(){}}},hideMonster(){},hideNPC(){},冰柱:{},huanShou1:{},huanShou2:{},huanShou3:{}};
 const role={_x:277.8,_y:421.6,speedX:12,speedY:9,faceTo:'左',motion:'站立',place:'地上',isAlive:true,myTarget:{},stopTime:0,cantMove:false,sex:'男',vocational:'战士',playAction:{gotoAndStop(){}},changeDepth(){},_parent:map};map.role=role;
 const contains=(x,y)=>{x/=65540/65536;y/=65530/65536;const polygon=map.nowMap==='卡萨诺城郊区'?[[0,0],[580,0],[580,460],[0,460]]:[[0,85],[390.65,338.05],[580,338.05],[580,460],[0,460]];
  // Independent analytic top boundary + explicit stroke; AS2 undefined property reads are lowered to optional access below.
  const top=map.nowMap==='卡萨诺城郊区'?0:x<=390.65?85+x*253.05/390.65:338.05; if(x>=0&&x<=580&&y>=top&&y<=460)return true;
  return polygon.some(([ax,ay],i)=>{const [bx,by]=polygon[(i+1)%polygon.length],length=Math.hypot(bx-ax,by-ay),project=((x-ax)*(bx-ax)+(y-ay)*(by-ay))/length;const t=Math.max(0,Math.min(length,project))/length;return Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay))<=1;});
 };map.ground={hitTest:contains};
 function entries(city){for(let i=1;i<=6;i++){const [x,y]=city?(i===1?[42,306.6]:[542,411.6]):(i===1?[38,306.6]:i===2?[539,306.6]:[277.8,421.6]);const e={_x:x,_y:y,_visible:i<=(city?2:3),_alpha:!city&&i===3?0:100,toMap:!city&&i===2?'卡萨诺城一':'卡萨诺城郊区',toEntry:!city?'entry1':'entry2',hitTest(px,py){return px>=(this._x-51)*65540/65536&&px<=(this._x+59)*65540/65536&&py>=(this._y-21.6)*65530/65536&&py<=(this._y+18.4)*65530/65536;}};map['entry'+i]=e;context['entry'+i]=e;}}
 entries(false);context.role=role;for(const name of ['nextEntry','nextMap','nowMap'])Object.defineProperty(context,name,{get:()=>map[name],set:v=>map[name]=v});map.gotoAndStop=label=>{entries(label==='卡萨诺城一');map.allowJumpMap(label);};
 for(const [name,body]of Object.entries(frozen.functions)){const target=['jumpMap','jumpToMap','allowJumpMap','afterJumpMap'].includes(name)?map:role;target[name]=vm.runInContext(`(function(${name==='jumpToMap'?'entry':['allowJumpMap','afterJumpMap'].includes(name)?'toMap':''})${body.replaceAll('role.myTarget.isAlive','role.myTarget?.isAlive')})`,context);}
 return {role,map,keys,contains,step(input){keys.clear();for(const [k,v]of [[37,input.left],[39,input.right],[38,input.up],[40,input.down]])if(v)keys.add(k);map.catchMouseDown=!!input.pointerDown;map._xmouse=input.pointerX??0;map._ymouse=input.pointerY??0;role.Activities();return this.snapshot();},snapshot(){return {x:role._x,y:role._y,action:role.motion==='站立'?'idle':'run',facing:role.faceTo==='左'?'left':'right'};}};
}
