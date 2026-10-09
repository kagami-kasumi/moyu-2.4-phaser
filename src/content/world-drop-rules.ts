/** Calls to the authoritative item generators, in source order. These are
 * requests, not item definitions; their generators may consume more randomness. */
export type DropRequest={kind:'generator';name:string;level:number}|{kind:'item';name:string}|{kind:'bell';name:string;grade:number}|{kind:'unknown-category'};
export const WORLD_DROP_CATEGORIES=['普通怪','精英怪','头目','猎杀兽精英','猎杀兽','黑骑士','军团管理员','攻城队长','攻城魔将','黑衣圣兽师','魔王子','魔将','舰队主帅','大魔王','奇迹龙','物攻兽','孤星龙','雷霆兽','蜘蛛','大蜘蛛','蜘蛛王后'] as const;
/** emit must synchronously resolve generator calls before the next random draw
 * when composing with real generators. Missing level defaults to role level.
 * A source null level also defaults (AS loose == undefined); no numeric clamp. */
export function dispatchWorldDrops(name:string,level:number|null|undefined,role:{levels:number;vocational:string},random:(count:number)=>number,emit:(request:DropRequest)=>void){
 const lv=level??role.levels;
 const gen=(name:string,n=1)=>{for(let i=0;i<n;i++)emit({kind:'generator',name,level:lv})};
 const item=(name:string)=>emit({kind:'item',name});
 const chance=(threshold:number,action:()=>void)=>{if(random(10000)<threshold)action()};
 const gifts=()=>{item('极品玉石');item('9朵玫瑰')};
 switch(name){
  case '普通怪':chance(500,()=>gen('dropNormalItem'));gen('dropStone');gen('dropFlower');gen('dropHSItem');chance(2000,()=>gen('dropMsBag'));chance(50,()=>item('幸运之门'));return;
  case '精英怪':chance(500,()=>gen('dropNormalItem'));gen('dropStone');chance(7500,()=>gen('dropMsBag'));return;
  case '头目':if(random(10000)>5000)gen('dropBossItem');gen('dropBossStone',2);gifts();return;
  case '猎杀兽精英':item('镐');chance(5000,()=>item('镐'));return;
  case '猎杀兽':chance(5000,()=>item('镐'));return;
  case '黑骑士':case '军团管理员':gen('dropBossStone',3);gen('dropSuperBossItem');gifts();return;
  case '攻城队长':case '攻城魔将':gen('dropBossStone');chance(name==='攻城队长'?5000:6000,()=>gen('dropSuperBossItem'));chance(name==='攻城队长'?5000:7000,()=>item('极品玉石'));chance(name==='攻城队长'?5000:7000,()=>item('9朵玫瑰'));return;
  case '黑衣圣兽师':gen('dropBossStone',4);gen('dropSuperBossItem');gifts();return;
  case '魔王子':case '魔将':gen('dropBossStone',5);gen('dropSuperBossItem');gifts();chance(name==='魔王子'?5000:7000,()=>item('灵魂王'));return;
  case '舰队主帅':case '大魔王':gen('dropBossStone',6);gen('dropSuperBossItem',name==='大魔王'?2:1);gifts();item('灵魂王');return;
  case '奇迹龙':case '物攻兽':case '孤星龙':case '雷霆兽':{
   const advanced=name==='孤星龙'||name==='雷霆兽';gen('dropStone',advanced?2:1);
   for(const bell of ['庇护铃铛','凤翼铃铛','翡翠铃铛'])chance(advanced?2000:1500,()=>emit({kind:'bell',name:bell,grade:random(10)>=(advanced?7:5)?(advanced?2:1):0}));return;
  }
  case '蜘蛛':case '大蜘蛛':case '蜘蛛王后':{
   const mage=role.vocational==='法师';
   const basic=mage?['电击术','光辉光环','雷霆万钧','爆雷术','重伤','寒冰']:['旋风斩','刀光斩','狂暴','飞天连斩','破防','重击'];
   const entries:[string,number][]=name==='蜘蛛'?[[basic[0]!,1000],[basic[1]!,1000],[basic[2]!,500],[basic[4]!,200],[basic[5]!,200],[basic[3]!,50]]:
    name==='大蜘蛛'?[[basic[0]!,2000],[basic[1]!,5000],[basic[2]!,500],[basic[3]!,100],[basic[4]!,1000],[basic[5]!,1000],['强健之术',100],['智慧之术',100]]:
    [[basic[1]!,4000],[basic[2]!,2000],[basic[3]!,1000],[basic[4]!,2500],[basic[5]!,2500],['强健之术',1000],['智慧之术',1000],['金刚',500]];
   for(const [book,threshold]of entries)chance(threshold,()=>item(book));return;
  }
  default:emit({kind:'unknown-category'});
 }
}
