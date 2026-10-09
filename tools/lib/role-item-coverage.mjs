// Explicit TASK-DATA-017 ownership. A declaration is NOT an executable module
// certification. The original numeric index's reviewed-module flags are untouched.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {functionRange} from './as2-data.mjs';
const dir='docs/reverse-engineering/content-registry/';
export const sourceRoot='local-resources/moyu/source-index/as/scripts/';
export const groups={
 'role-fields':{meaning:'角色构造初值、编码属性读写、只读别名与NaN/上下限策略；当前生命/魔力与最大值的写入顺序分别保留。',runtime:['role-state-rules','role-progression-rules','role-vital-rules','role-attribute-rules'],tests:['role-attributes','role-progression','role-vital']},
 'role-attributes':{meaning:'先重置技能与经验加成，再加装备，基础属性乘百分比并round，最后加前三个出征面板；合体只控制攻防，出征均加战斗力；jobFire不进入总和。',runtime:['role-attribute-rules'],tests:['role-attributes']},
 'role-growth':{meaning:'经验、军功、功勋、声望、转世、货币及MP消耗按既有独立模块执行；源别名和调用顺序不重解释。',runtime:['role-experience-rules','merit-rules','role-rebirth-rules','resource-consumption-rules'],tests:['role-experience','merit','role-rebirth','resource-consumption']},
 'role-skills':{meaning:'技能发动消费、效果倍率与范围、严格随机阈值、生命恢复分配和伤害数值；动作/显示与循环变量单列，未开启战斗。byAttack返回attack并非实际扣血，元素在Miss后仍处理。',runtime:['role-skill-rules'],tests:['role-skills']},
 'role-movement':{meaning:'既有角色动作、坐标、朝向、显示层级和目标选择支持状态；非属性成长表，不用坐标数值充当战斗数值。',runtime:[],tests:[]},
 'item-fields':{meaning:'物品类默认空格/maxNum=1/MAXNUM=99，访问器逐字段限幅、堆叠和编码委派见已验证字段表。',runtime:['item-field-rules','item-stack-rules'],tests:['item-field-registry']},
 'item-transfer':{meaning:'物品实例字段复制、背包倒序查找/堆叠、数量消费与库存容量；不把来源字段复制当成新的生成常量。',runtime:['item-stack-rules'],tests:['item-field-registry']},
 'item-use':{meaning:'角色/物品使用入口：职业与等级条件、药品补给、礼包产物、勋章奖励、数量减一和清槽。幻兽孵化和地图目的地分支交018；通用数量消耗只定义一次。',runtime:['resource-consumption-rules'],tests:['resource-consumption']},
 'equipment-aggregate':{meaning:'四装备逆序累计：魔魂/战魂最小等级和四件条件、孔内宝石、魔之魂、元素套装、幸运符fallthrough和戒指动态字段；thisallItem异常保留，不能修成this.allItem冒充原版。',runtime:['equipment-rules'],tests:[]},
 'passive-skills':{meaning:'技能等级先检查旧等级+1上限，再选择reLv覆盖或++；首次学习启用XP。九种被动对应字段和等级倍率，其他技能不产生被动属性。',runtime:['role-skill-rules'],tests:['role-skills']},
 'refinement':{meaning:'材料表gradeSuccess是数量而非概率。区分戒指/四装备/幸运符：品质、魔魂、等级、孔/镶嵌、元素、附加和战魂，保留先写后扣及陨铁矿先扣后失败。',runtime:['item-numeric-rules'],tests:['item-numeric']},
 'bell-refinement':{meaning:'同品质且主件<4才合成；同种累加pure；到2级随机第二属性，到4级补第三属性；4级pure恰等16且skill=0时随机技能1/2，消耗副件。',runtime:['item-numeric-rules'],tests:['bell-registration','item-numeric']},
 'gem-split':{meaning:'至少一个已镶孔且货币足够；按实际孔号1..3取出，对基础值3/10/5/15区分中高级售价，复合圣石售价3000；清hole保留gem残值。',runtime:[],tests:[]},
 'gem-fusion':{meaning:'同类高级宝石按旧值阈值递增(非最终限幅)，战斗力8以上扣旧val1-6声望、最多检查<15；混合战斗石生成三类圣石，保留主副值次序，消耗副石。',runtime:['item-numeric-rules'],tests:['item-numeric']},
 'item-factory':{meaning:'createThing按药品/技能书/宝石name或其他type分派；保留全部静态价格/数值和参数宝石默认规则；同名商店实例价格不可覆盖工厂价格。幻兽蛋物品价格属017，孵化体属018。',runtime:['registry-data'],tests:['item-registration','parameter-item']},
 'item-refresh':{meaning:'四装备缺省值、1.5*等级+5基数与职业系数、round基础/ceil魔魂、元素取较大值、分档售价；戒指主属性表、幸运符阈值、铃铛已解锁属性单独分派。',runtime:['item-numeric-rules','equipment-rules','ring-rules'],tests:['item-numeric','ring-registration','lucky-charm','bell-registration']},
 'item-spirit':{meaning:'仅四类装备；spirit=0或等级>=8拒绝；每次至多升一级并丢弃余量，7->8替换最终值10/20/20/8/8。',runtime:['item-numeric-rules'],tests:['item-numeric']},
 'item-presentation':{meaning:'物品图标、提示字符串、颜色、面板布局与鼠标事件；仅出售单价floor(salePrice/2)属于已独立核验的价格投影，不把说明文字当实际效果。',runtime:[],tests:[]},
 'role-panel-items':{meaning:'经验球2000经验；超级球次数<等级时五项+2，但达到上限仍消费；能量药水只在XP容量未满时消费；生命/魔力储备按缺口补足，NaN药品值跳过。',runtime:['role-experience-rules','role-vital-rules','xp-energy-rules'],tests:['role-experience','role-vital','xp-energy']},
 'xp':{meaning:'XP充能阈值、容量、技能消费和开启状态，沿用独立XP规则与源oracle。',runtime:['xp-energy-rules'],tests:['xp-energy']},
 'initial-role-items':{meaning:'新建职业/性别属性、四装备和戒指初始模板、wudi及debug分支分阶段保存；不将debug设定混成普通初始值。',runtime:['original-start','registry-data'],tests:['profession-registration','role-progression','ring-registration']},
 'shop-prices':{meaning:'商店入口容量、货币/资源价格表与工厂价分别注册；出售floor(price/2)*数量(number<=0当1)，购买检查空格和总价后生成num次；建筑开放条件交018。',runtime:['item-numeric-rules','registry-data'],tests:['item-numeric','item-registration']},
 'equipment-generation':{meaning:'五个装备生成族：等级分档封顶90；普通/头目/超级头目附加、品质、孔数、元素和魔魂按各次random独立采样；两类雷兽族等级1/15。018只负责何时调用。',runtime:['equipment-generation-rules'],tests:['equipment-generation']},
 'drop-item-values':{meaning:'物品掉落生成值和条件：货币袋等级50/100分档，花玉六个独立概率判断，普通/头目宝石独立判断，铃铛grade随机0/1；敌人掉落调用频率交018。',runtime:['registry-data'],tests:['bell-registration','item-registration']},
};
const role='__Packages/RoleMC.as',frame='frame_9/DoAction.as',map='DefineSprite_4536/frame_1/DoAction.as';
export function ownership(r){
 const f=r.source.file,l=r.source.line,s=r.scope.signature,t=r.target;
 if(f===role){
  if(/function (init|flashAttribute)\(/.test(s))return 'role-attributes';
  if(/function (priseExp|expUp|upGod|militaryExploitUp|exploitUp|creditUp|spendMs|spendRes|consumeMp)\(/.test(s))return 'role-growth';
  if(/function (站立|向.+跑|changeHpMp|changeDepth|lockTarget|autoAttack|下降)\(/.test(s))return 'role-movement';
  if(l>=1000)return 'role-skills';return 'role-fields';
 }
 if(f==='__Packages/ThingMC.as')return 'item-fields';
 if(f===frame){
  if(s.startsWith('this.useItem =')){
   if((l>=334&&l<350)||(l>=363&&l<936)||(l>=1002&&l<1307)||(l>=1359&&l<1379))return null;
   return 'item-use';
  }
  if(s.startsWith('function delivery(')||s.startsWith('this.backPack.')||s.startsWith('this.wareHouse.')||s.startsWith('this.fastKey.'))return 'item-transfer';
  if(s.startsWith('this.equipment.'))return /flashAttribute|init =/.test(s)?'equipment-aggregate':'item-transfer';
  if(s.startsWith('this.roleSkills.'))return 'passive-skills';
  if(s.startsWith('this.make.'))return 'refinement';
  if(s.startsWith('this.makeBell.'))return 'bell-refinement';
  if(s.startsWith('this.splitStone.'))return 'gem-split';
  if(s.startsWith('this.castleStone.'))return 'gem-fusion';
  if(s.startsWith('this.createThing ='))return 'item-factory';
  if(s.startsWith('this.upDataWeapon ='))return 'item-refresh';
  if(s==='script/class initialization'){
   if(t.startsWith('ringMainValue'))return 'item-refresh';
   if(t.startsWith('this.make.'))return 'refinement';
   if(t.startsWith('this.splitStone.'))return 'gem-split';
   if(t.startsWith('this.roleSkills.'))return 'passive-skills';
   if(t.startsWith('this.equipment.'))return 'equipment-aggregate';
   if(/^this\.(backPack|wareHouse|fastKey)\./.test(t))return 'item-transfer';
  }
 }
 if(f==='frame_9/DoAction_2.as'&&s==='script/class initialization'&&/\.(saleThings|number|openNumber|levelNum)$/.test(t))return 'shop-prices';
 if(f==='DefineSprite_2049_物品栏物品/frame_1/DoAction.as')return s.startsWith('this.spiritUp =')?'item-spirit':'item-presentation';
 if(f==='DefineSprite_4591/frame_1/DoAction.as')return /this\.(setThing|useExpball) =/.test(s)?'role-panel-items':'item-presentation';
 if(f==='DefineSprite_4603/frame_1/DoAction.as')return 'xp';
 if(f==='DefineSprite_4536/frame_2/DoAction.as'){
  if(s==='script/class initialization'||s.startsWith('function setMonistLv')||t==='_root.intoV'||(s.startsWith('initNewGame')&&l<88))return null;
  return 'initial-role-items';
 }
 if(f==='DefineSprite_2089_幻兽商店/frame_1/DoAction.as')return 'shop-prices';
 if(f===map){
  if(s==='script/class initialization'&&t.startsWith('role.'))return 'initial-role-items';
  if(/this\.drop(NormalItem|BossItem|SuperBossItem|ReiBossItem|ReiSuperBossItem) =/.test(s))return 'equipment-generation';
  if(/this\.drop(MsBag|Flower|Stone|BossStone|HSItem) =/.test(s))return 'drop-item-values';
 }
 return null;
}
export function buildRoleItemCoverage(index){
 const sourceHashes=new Map(index.sourceFiles.map(s=>[s.file,s.sha256])),texts=new Map();
 const read=f=>{if(!texts.has(f)){const text=fs.readFileSync(sourceRoot+f,'utf8');if(createHash('sha256').update(text).digest('hex')!==sourceHashes.get(f))throw Error('Source changed: '+f);texts.set(f,text);}return texts.get(f)};
 const records=[],deferred=[],seen=new Set();
 for(const r of index.rules){
  if(seen.has(r.id))throw Error('Duplicate numeric ID '+r.id);seen.add(r.id);
  const group=ownership(r);
  if(!group){deferred.push({id:r.id,owner:/saveGame|readGame|SharedObject/.test(r.scope.signature+r.target)?'TASK-DATA-019':'TASK-DATA-018',reason:'不在017精确函数/分支集合；018核对世界/幻兽及其余非玩法记录，019核对持久赋值。'});continue;}
  read(r.source.file);
  const display=r.classification==='presentation'||['role-movement','item-presentation'].includes(group);
  records.push({id:r.id,group,representation:display?'presentation-or-control':typeof r.value==='number'?'constant':r.value&&typeof r.value==='object'?'structured-value-or-expression':'supporting-state',source:r.source,scope:r.scope.signature,target:r.target,operator:r.operator,value:r.value,inputs:r.inputs,conditions:r.conditions,review:'declarative-source-contract',existingModule:r.semanticModule??null});
 }
 // Assignment-only indices omit random guards, return values and method arguments.
 // Record exact numeric-bearing lines too; they are inert expressions, never eval'd.
 const supplements=[];
 for(const [file,text]of texts){
  const relevant=records.filter(r=>r.source.file===file),scopes=[...new Set(relevant.map(r=>r.scope).filter(s=>s!=='script/class initialization'))];
  // These generators contain only calls/guards, hence have no assignment-index row.
  if(file===map)for(const name of ['dropMsBag','dropFlower','dropStone','dropBossStone','dropHSItem'])scopes.push(`this.${name} = function(fX, fY, level)`);
  for(const signature of scopes){const range=functionRange(text,signature);
   for(const [i,line]of range.text.split(/\r?\n/).entries()){
    const group=ownership({source:{file,line:range.line+i},scope:{signature},target:''});
    if(group&&/(?:^\s*(?:if|else|switch|case|default|while|return)\b|\brandom\(|\bMath\.|\b(?:consumeMp|lockTarget|run|begin|expUp|creditUp|createThing|throwGoods)\(|\+\+|--)/.test(line)&&!/(?:htmlText|\.text|playSound|attachMovie|gotoAnd)/.test(line))supplements.push({source:{file,line:range.line+i},group,scope:signature,expression:line.trim(),kind:'control-call-or-nonassignment',meaning:groups[group].meaning});
   }
  }
 }
 const counts={};for(const r of records)counts[r.group]=(counts[r.group]??0)+1;
 return {schemaVersion:1,task:'TASK-DATA-017',scope:'完整角色/物品数值声明目录；表达式不可执行；模块与原版可玩行为不等价',groups,counts,records,supplements,deferred,sources:[...texts.keys()].map(file=>({file,sha256:sourceHashes.get(file)}))};
}
