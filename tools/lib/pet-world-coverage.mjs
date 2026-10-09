import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {ownership as roleItemOwnership,sourceRoot} from './role-item-coverage.mjs';
import {controlScopes,tokens,matching} from './as2-data.mjs';
export {sourceRoot};
// These contracts classify source declarations, not completed gameplay. Branch
// operations remain inert and preserve their original order and dependencies.
const group=(inputs,conditions,defaults,outputs,boundary,runtime=[],tests=[])=>({inputs,conditions,defaults,outputs,boundary,runtime,tests});
export const worldGroups={
 'pet-core':group('类型种子、当前/最高成长率、评分、代数、转世数、等级、元素和铃铛','initialize按type；checkUp按各评分分支；四项成长各自检查max*Fen；出征铃铛才加成','编码setter忽略NaN，life先上限后下限；reset只恢复源指定字段；未知类型不编造种子','派生生命/攻防、评分、旧等级记录、转世/代数与属性加成','复用初始化/评分/成长/重置已验证规则；声明目录保留输入表达式，不执行原类',['pet-initialization-rules','pet-attribute-rules','pet-score-rules','pet-generation-rules','pet-reset-rules','pet-numeric-accessor-rules'],['pet-initialization','pet-attribute','pet-score','pet-generation','pet-reset','pet-numeric-accessors','pet-vital-accessors']),
 'pet-combat':group('huanShou、role战斗力、from、attack、随机整数、出征/存活','受击先拒绝死亡/NaN；闪避后仍处理四元素；经验要求出征、非零生命、等级领先<10','全防御无飞行减半；无怪物当前生命伤害上限；铃铛仅在正伤害分支抽random(100)<5','伤害返回值与扣血写入分离，铃铛反弹/冰冻3、目标和死亡；经验可顿悟还原旧等级','反弹输出事件不递归执行；动作/追踪保留声明，不开放战斗',['pet-world-combat-rules','pet-experience-rules'],['pet-world-combat','pet-experience']),
 'monster-combat':group('怪物实例、角色战斗力、攻击方暴击/元素、随机','是否活着/NaN；闪避严格小于；非闪避分支给XP即使伤害<=0','战斗力比较用role而非from；正伤害先截到当前生命再round；life setter有上下限','扣血/返回值、XP充能、死亡经验levels*expRate+baseExp及装备spiritUp(1)','共享scalar只有incoming-damage-rules一处；怪物策略不套用角色飞行状态',['pet-world-combat-rules'],['pet-world-combat']),
 'pet-fusion':group('主副幻兽、needFen、草开关、库存、随机、称号数组','副兽同种或奇异兽；分数/20或30级/转世上限逐个拒绝；副分数>=needFen','needFen最小100否则向下到10；超过成长上限仍有增量；称号无匹配仍成功；price=100未扣','四成长增量、>3000且元素非零时1%雷变；删副兽→turned→checkUp；称号倒序匹配+50上限','普通幻化、转世幻化和称号/元素进化各分开；源收费失败仍进化明确保留',['pet-fusion-rules','world-effect-rules'],['pet-fusion','world-effect']),
 'pet-panel':group('打开面板、幻兽实例、item.bell、消耗品、role生命储备','生命为0拒绝经验球；等级<role+10；药品生命>0；各药水门槛按逐分支声明','面板flashAttribute清零四贡献；bell.type只与空格比较，没有undefined守卫','min/maxAttack/defense直接贡献、floor(allFen/100)+bell.grade+1；药品和储备数值写入','出征/inOne选择属于角色汇总的输入，汇总仍归017；面板刷新和效果执行分开',['pet-world-combat-rules'],['pet-world-combat']),
 'pet-hatch-use':group('物品类型、幻兽容量、随机、现有幻兽','根useItem中幻兽孵化分支和幻兽专用物品门槛；生成后由addHuanShou判容量','蛋价格/堆叠权威仍在017；不把宠物种子评分当物品售价','具体孵化种子或成长/元素改写；返回值交回原库存消费入口','使用已注册宠物生成域，保留条件和调用次序；不实现孵化UI',['pet-initialization-rules','registry-data'],['pet-registration','pet-initialization']),
 'pet-roster':group('allHuanShou、容量、最大出征数、前三面板、页号','重复/容量、battle/inOne及种类资格；重置/删除各自范围','数组对象身份和源循环方向保留，不凭字符串同名去重','名单、分页、battle/inOne标志与面板选择','管理语义声明，不新增未开放的幻兽玩法',[],[]),
 'enemy-spawn':group('怪物定义、beginNum/endNum、角色等级、地图基数','inclusive槽位循环且slot<7；每次坐标序号从1开始；encounter按place分派','end小于begin仍返回true；不补下限守卫；attackLength/Height/朝向各次独立随机','生命=life*(levels+baseLevels)，攻击0.8/1.2倍，防御同基数，floor(fire+levels*2)；地图和encounter种子','生成器边界到initMonster/地图注册；动作属性/坐标保留，不推定每帧时间',['enemy-initialization-rules','registry-data'],['enemy-initialization','enemy-registration','enemy-reference']),
 'world-drops':group('死亡名称/类别、坐标、level、role职业/等级、随机、地图进度','monsterDeath先记具体名和怪物任务各1，再分派；概率比较符保持原样；dropItem各类独立分支','level==undefined时用role等级；无匹配类别走错误提示；多个if独立抽样','生成器调用次数/顺序、掉落请求、boss推进、声望、预警/后继遭遇','物品值与五族装备公式仍归017；本组只管资格、频率、进度；生成器可能消耗随机，必须同步组合',['world-drop-rules','registry-data'],['world-drop','bell-registration','enemy-reference']),
 'world-navigation':group('入口、当前/下一地图、进度、敌人、生命、随机','允许跳图/危险状态/死亡复活与各地特殊门槛按源顺序','未知入口不生成新目的地；当前地图标志不等同于永久解锁','toMap/toEntry、入口可见、遭遇状态、复活生命/坐标及状态恢复','数值与路由契约；165标签地图注册为身份权威；不开放新增地图',['registry-data'],['enemy-reference']),
 'npc-dispatch':group('NPC当前cmd/nextCmd/prevCmd、任务/角色/背包/好友/地图、随机','command..command4的switch case及嵌套if原样保留；确认框只登记回调，不能提前执行','未命中分支按源返回/默认；提示中数字不是实际奖励；失败不自动退款','有序货币/任务/关系/地图改写、函数参数、创建物品/怪物请求、命令跳转','逐分支声明与已验证quest/friend/merit定义组合；原对话可达性、动画与完整任务链不在本包',['quest-dispatch-rules','quest-generator-rules','friend-relation-rules','merit-rules','registry-data'],['quest-dispatch','quest-generator','friend-relation','merit']),
 'npc-helpers':group('交付装备/幻兽、品质、孔数、魔魂、旧生命之源等级、随机','四装备/三铃铛接受域；分解仅四装备；献祭类型和分数检查','异常品质捐赠军功0仍清槽；分解魔魂之心实际最多7，提示可能更大；低档nimFen写入保留','经验球数量、军功、分解有序物品、删宠后lifeSourseLevels++、彩票/PK辅助返回','内部货币/经验进阶不重复定义；彩票与命令的回调边界保留',['npc-exchange-rules','registry-data'],['npc-exchange']),
 'wedding-ring':group('配偶名称、随机、不重复副属性池','按14个配偶名选择两主属性，再连续从池splice四次','未匹配姓名的主属性保持undefined；四副属性不重复，不补默认职业','原始结婚戒指数值及upDataWeapon刷新请求','戒指刷新权威归017；这里只登记NPC生成初值和随机域',['ring-rules','registry-data'],['ring-registration']),
 'quests':group('主/支/挑战/每日任务、当前任务、目标对象/数量、角色等级、随机','倒序寻找首个满足项；negative/zero数量未统一拒绝；奖励倒序；荣誉任务拒绝面板领取','空目标列表完成；未定义或0物品数量当1；溢出留输入；工厂失败不回滚','目标计数/完成/进行标志、生成目标/奖励、好友总等级分档、3宠出征上限','生成域和派发分别消费已有模块；任务串联/UI未实现',['quest-dispatch-rules','quest-generator-rules','registry-data'],['quest-dispatch','quest-generator']),
 'friends':group('NPC关系/等级/上限、增量、名单、容量、恋人','正增量且>=3级且恰等于上限拒绝；容量检查先于对象身份去重；删除倒序按名','负关系不降级/无零下限；单次只升一级；解除5级恋人后又读空lover的源异常保留','关系截断、人数/页数、恋人/配偶/拒绝计数、赠礼/邮寄/传送','普通路径已有oracle；空lover动态绑定结果仍unknown，不转换为现代JS异常或静默修复',['friend-field-rules','friend-relation-rules','friend-capacity-rules'],['friend-fields','friend-relation']),
 'buildings':group('六建筑等级、住房、主城堡、声望、资源、奖励等级','主城堡需住房(旧等级+1)*3、声望旧等级*5+50；其他先主城堡要求再spendRes','upBuilding无maxLevels守卫；额外_parent.role.res路径疑点保留，不能算第二次有效扣款','等级/prizeLv递增，其他建筑needMainLevels递增；经验球提取/研究所开放数','缺省/编码字段与建筑注册表权威复用；持久恢复交019',['building-rules','registry-data'],['building']),
 'effect-counters':group('times、伤害、enemy/from、buff秒数、外部form','times>0才扣计数/生效；run对NaN伤害或时长拒绝','frost val*15且每次脚本扣2，不推断真实秒数；重伤读取form经P-code确认','stopTime5/0、重伤调用、nonDefense显示状态；buff每50ms计时且end同时清anger/fly','时钟绑定和异常form解析不在纯数值规则内；禁止擅自改为from',['world-effect-rules'],['world-effect']),
 'legion':group('jobFire、militaryRank、旧militaryRankFire','新值不同才触发角色属性刷新','baseFire=50；无额外rank上下限','floor((50+jobFire)*rank*2/100)','角色总和仍归017，本组只生产军衔贡献',['world-effect-rules'],['world-effect']),
 'world-setup':group('根初始化、地图基数、NPC/商店/宠物种子、计时器、输入姓名','初始化/新建/调试/设置的源分支分别保留','初始化赋值不是保存恢复；不把debug/wudi结果混入普通默认值','全局/世界初值、shop容量、名称上限、运行计时和世界开关','角色/装备已有017归属优先；持久键语义交019；地图基数作为enemy-spawn输入',['registry-data'],['static-registration','profession-registration']),
 'mail-transfer':group('物品槽、发送者/接收者、数量、回调','给予/邮寄/邮收门槛和回调返回值；不吞掉失败数量','源使用对象引用，不推断异步网络或自动存档','槽位数量/转移请求、接收对象、提示与传送目标','物品字段与堆叠沿用017，关系受益按friends定义',[],[]),
 'numeric-codec':group('数字、密钥、基数、编码数组','按原编码方法变换；访问器自己的NaN门槛另列','不把混淆编码当现代存档格式；字符串格式化只负责显示','数值编码/解码或显示字符串','复用既有codec；持久化格式由019裁决',['numeric-codec-rules'],['numeric-codec']),
 'ground-items':group('物品对象、坐标、目标、空槽、原数量','拾取门槛/距离、地面列表倒序和数量拆分按原入口','生成后不代表成功入包；掉落数组是临时地图状态','地面创建/删除/拾取与数量转交','沿用现有地面实现和oracle；不重写物品数值权威',['registry-data'],[]),
 'presentation-control':group('显示对象、文本、鼠标、页号、动作标签','显示/隐藏、点击与帧脚本条件保留','文本中的数字不作为奖励/伤害公式；动作结束标签不是伤害时刻','坐标/颜色/比例/字符串/按钮/动作调度支持状态','明确排除为表现或控制记录；含计时/伤害副作用的脚本独立分组，不以文件名一概排除',[],[]),
 'persistence-handoff':group('SharedObject或原存读档/文件选择入口','保存/恢复/索引键条件见源记录','本包不关闭恢复异常，不宣称字段类型和恢复顺序已完成','逐ID移交019的原表达式、条件和位置','仅归属覆盖；019负责持久语义、恢复矩阵和design修复',['persistence-registry-data'],[]),
};
const frame='frame_9/DoAction.as',map='DefineSprite_4536/frame_1/DoAction.as';
export function worldOwnership(r){
 if(roleItemOwnership(r))return null;
 const f=r.source.file,s=r.scope.signature,t=r.target,l=r.source.line;
 if(/saveGame|readGame|SharedObject/.test(s+t)||/^frame_[78]\//.test(f)||/^DefineSprite_423[34]\//.test(f))return 'persistence-handoff';
 if(f==='__Packages/HuanShouClass.as')return 'pet-core';
 if(f==='__Packages/HuanShouMC.as')return 'pet-combat';
 if(f==='__Packages/MonsterMC.as')return 'monster-combat';
 if(f==='__Packages/FriendClass.as'||/^DefineSprite_(2381_|2379\/)/.test(f))return 'friends';
 if(f==='__Packages/BuildingClass.as'||/^DefineSprite_(2313_|2084_)/.test(f))return 'buildings';
 if(/^__Packages\/SecreteCode/.test(f)||s.includes('numberToString'))return 'numeric-codec';
 if(/^DefineSprite_(2356_|2344_|2327_|2335_)/.test(f))return 'pet-fusion';
 if(/^DefineSprite_4556\//.test(f))return 'pet-panel';
 if(/^DefineSprite_(2181_|2171_|2479\/)/.test(f))return 'pet-roster';
 if(/^DefineSprite_2210_/.test(f))return 'quests';
 if(/^DefineSprite_4312\//.test(f))return s.includes('getWeddingRing')?'wedding-ring':f.endsWith('DoAction_2.as')?'npc-helpers':'npc-dispatch';
 if(/^DefineSprite_(2874|2878|2881|4578)\//.test(f))return 'effect-counters';
 if(/^DefineSprite_2093_/.test(f))return 'legion';
 if(/^DefineSprite_(2102_|2107_|2111_)/.test(f))return 'mail-transfer';
 if(/^DefineSprite_(148_|4253\/)/.test(f))return 'ground-items';
 if(f===map){
  if(/initMonster|encounter/.test(s))return 'enemy-spawn';
  if(/monsterDeath|drop|bossLevelsUp|flashBoss|flashBs|SuperHS/.test(s))return 'world-drops';
  if(s==='script/class initialization')return 'world-setup';
  return 'world-navigation';
 }
 if(f.startsWith('DefineSprite_4536/'))return f.includes('/frame_2/')?'world-setup':'enemy-spawn';
 if(f===frame){
  if(s.startsWith('this.useItem ='))return l>=1002?'world-navigation':'pet-hatch-use';
  if(s.startsWith('this.huanShou.')||s.startsWith('this.huanShouItem'))return 'pet-roster';
  if(s.startsWith('this.castleHouse.'))return 'buildings';
  if(s==='script/class initialization'&&!/\.(?:_visible|html|useHandCursor)$/.test(t))return 'world-setup';
  return 'presentation-control';
 }
 if(f==='frame_9/DoAction_2.as')return 'world-setup';
 if(/^frame_[1-6]\//.test(f))return 'world-setup';
 // Enumerated remaining surfaces: quantity picker, UI views, panels, effects,
 // ground hit areas and terminal animation labels. Numeric gameplay effects
 // above take precedence over this explicit reviewed non-gameplay set.
 if(/^__Packages\/(PanelMC|ButtonMC|CheckButtonMC|groundMC)\.as$/.test(f))return 'presentation-control';
 const id=Number(f.match(/^DefineSprite_(\d+)/)?.[1]);
 if([61,65,68,70,78,80,81,150,151,167,2074,2082,2083,2105,2170,2200,2206,2212,2217,2293,2311,2334,2368,2372,2406,2423,2481,2578,4151,4247,4364,4509,4512,4515,4518,4521,4524,4558,4581,4592,4599,4602,4607,4608,4613,4629].includes(id)||id>=2657&&id<=2815||id>=2900&&id<=4140||f.startsWith('DefineButton2_4193/'))return 'presentation-control';
 throw Error('Unclassified source scope: '+r.id);
}
export function buildPetWorldCoverage(index){
 const seen=new Set(),records=[],byFile=new Map();
 for(const r of index.rules){
  if(seen.has(r.id))throw Error('Duplicate numeric ID '+r.id);seen.add(r.id);
  const group=worldOwnership(r);if(!group)continue;
  const representation=group==='persistence-handoff'?'persistence-handoff':group==='presentation-control'||r.classification==='presentation'?'presentation-or-control':typeof r.value==='number'?'constant':typeof r.value==='object'?'structured-value-or-expression':'supporting-state';
  const exclusionReason=representation==='persistence-handoff'?'存读档/文件选择入口的字段搬运与恢复，逐ID归019；本项不认证其恢复语义。':representation==='presentation-or-control'?group==='presentation-control'?'已核对的显示、输入、提示或时间轴控制表面；不作为属性/奖励公式。':'原索引标为显示投影（'+r.target+'）；所属模块的业务条件与调用另保留在有序补充目录。':undefined;
  records.push({...r,group,representation,...(exclusionReason?{exclusionReason}:{}),review:group==='persistence-handoff'?'ownership-only-for-019':'declarative-source-contract'});
  if(!byFile.has(r.source.file))byFile.set(r.source.file,[]);byFile.get(r.source.file).push(r);
 }
 const hashes=new Map(index.sourceFiles.map(s=>[s.file,s.sha256])),supplements=[],sources=[];
 for(const [file,rows]of byFile){
  const text=fs.readFileSync(sourceRoot+file,'utf8'),sha256=createHash('sha256').update(text).digest('hex');
  if(hashes.get(file)!==sha256)throw Error('Source changed: '+file);sources.push({file,sha256});
  const scopes=controlScopes(text),lines=text.split(/\r?\n/),ts=tokens(text),functions=[];let offset=0;
  for(let j=0;j<ts.length;j++)if(ts[j].kind==='identifier'&&ts[j].value==='function'){
   let body=j+1;while(body<ts.length&&!(ts[body].kind==='punctuation'&&ts[body].value==='{'))body++;
   const end=matching(ts,body);functions.push({start:ts[body].start,end:ts[end].end,signature:lines[ts[j].line-1].trim()});
  }
  // All numeric guards/calls in the bounded source files, including functions
  // with no assignment-index row. Do not infer probabilities from assignment
  // counts. Enclosing control headers retain switch aliases and else branches.
  for(let i=0;i<lines.length;i++){
   const line=lines[i],at=offset;offset+=line.length+(text.includes('\r\n')?2:1);
   if(!/(?:\brandom\(|\bMath\.|\b(?:if|else|case|default|while|return)\b|\+\+|--|\b(?:createThing|initMonster|drop\w*|spend\w*|useThing|catchThing|expUp|creditUp|militaryExploitUp|exploitUp|turned|checkUp|lifeLvUp|setThing|addRelation|beginEvolve|GoEvolve|byAttack|run|begin)\s*\()/.test(line))continue;
   if(/(?:\.htmlText|\.text\b|playSound|gotoAnd|attachMovie)/.test(line)&&!/(?:byAttack|initMonster|createThing)/.test(line))continue;
   const previous=[...rows].reverse().find(r=>r.source.line<=i+1)??rows[0];
   // Extract function signature from exact source rather than inheriting the
   // preceding assignment's scope across a function with no numeric rows.
   const signature=functions.filter(f=>f.start<=at+line.search(/\S/)&&f.end>at).sort((a,b)=>b.start-a.start)[0]?.signature??'script/class initialization';
   const probe={...previous,source:{file,line:i+1},scope:{signature},target:''};
   if(roleItemOwnership(probe))continue;
   const group=worldOwnership(probe);if(group==='presentation-control'||group==='persistence-handoff')continue;
   supplements.push({source:{file,line:i+1},group,scope:signature,expression:line.trim(),conditions:scopes.filter(s=>s.start<=at+line.search(/\S/)&&s.end>at).map(({header,line})=>({header,line})),kind:'ordered-control-call-or-nonassignment'});
  }
 }
 const counts={};for(const r of records)counts[r.group]=(counts[r.group]??0)+1;
 return {schemaVersion:1,task:'TASK-DATA-018',scope:'数值声明、控制条件与调用边界；不等同于完整游戏行为已实现',groups:worldGroups,counts,records,supplements,sources};
}
