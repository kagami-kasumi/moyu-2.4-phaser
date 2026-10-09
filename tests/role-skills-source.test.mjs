import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {ROLE_SKILL_RULES,PASSIVE_SKILL_RULES,passiveSkillValue,roleChance,roleSkillDamage,angerLifeCost,renewalShare,incomingRoleDamage} from '../src/content/role-skill-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';const source=fs.readFileSync(root+'__Packages/RoleMC.as','utf8');
const fn=(marker,args='',globals={})=>vm.runInNewContext('(function('+args+')'+functionRange(source,marker).text+')',globals);
test('passive effects match original root dispatcher across levels and professions',()=>{
 const text=fs.readFileSync(root+'frame_9/DoAction.as','utf8');const effect=vm.runInNewContext('(function(skillName,levels)'+functionRange(text,'this.roleSkills.effect =').text+')');
 for(const name of Object.keys(PASSIVE_SKILL_RULES))for(const level of [0,1,9,10,99])for(const rate of [3,7]){const role={rateLife:rate,rateMp:rate+1,flashAttribute(){}};effect.call({role},name,level);const actual=passiveSkillValue(name,level,role);assert.equal(actual.value,role[actual.field]);}
});
test('source activation costs and strict probability endpoints',()=>{
 for(const [name,rule] of Object.entries(ROLE_SKILL_RULES)){
  const body=functionRange(source,`function ${name}()`).text;
  if('mp'in rule){assert.ok(body.includes(`consumeMp(${rule.mp})`));assert.equal(/&& this.consumeMp/.test(body),rule.requiresPayment);}
 }
 for(const threshold of [0,1,5,95,100,-1,101])for(const roll of [0,4,5,94,95,99]){
  const result=fn('function 重击()','',{random:()=>roll}).call({heavyHit:threshold});assert.equal(result===true,roleChance(threshold,roll));
 }
});
test('all damage skill scalar values and effect ranges match bounded original effects',()=>{
 for(const name of ['斩魂','旋风斩','刀光斩','飞天连斩','震','火球术','电击术','光辉光环','爆雷术','怒'])for(const boosted of [false,true])for(const roll of [0,10]){
  let hit,range;const target={isAlive:true,_x:-10,_y:0,byAttack(a,b,n){hit=n;return n}};
  const x={levels:17,minAttack:20,maxAttack:30,life:1000,maxLife:1000,angerState:boosted,flyState:boosted,faceTo:'左',_x:0,_y:0,myTarget:target,_parent:{monstUnit:[target]},lockTarget(a,b){range=[a,b];return true},重击(){return false},辅助技能(){}};
  fn(`function ${name}效果()`,'',{random:()=>roll}).call(x);
  assert.equal(hit,roleSkillDamage(name,20+roll,17,boosted),name);
  if(ROLE_SKILL_RULES[name].range)assert.deepEqual(range??[x.attackLength,x.attackHeight],[...ROLE_SKILL_RULES[name].range],name);
 }
 for(const life of [249,250,251]){const x={life,maxLife:999,angerState:true,myTarget:{attackStopTime:4}};fn('function 飞天连斩结束()').call(x);assert.equal(life-x.life,angerLifeCost(life,999,true));}
 for(const alive of [false,true])for(const open of [[false,false,false],[true,false,true]]){
  let amount;const x={renew:100,isAlive:alive,_parent:{_parent:{}},reBackLife(n){amount=n}};
  open.forEach((v,i)=>x._parent._parent['battleHuanShouPanel'+(i+1)]={isOpen:v,body:{reBackLife(){}}});
  fn('function set renewLife(attack)','attack',{random:()=>0}).call(x,101);assert.equal(amount,renewalShare(101,alive,open));
 }
});
test('incoming scalar stage preserves negative reduction, capped dodge, miss return and element damage after miss',()=>{
 for(const difference of [-200,-3,0,4,200])for(const roll of [0,94,95,99])for(const fly of [false,true])for(const nonDefense of [false,true]){
  const x={attack:57,defense:32,defenderFire:300+difference,attackerFire:300,burst:7,jook:9,reduceDamage:11,fly,nonDefense,dodgeRoll:roll,burstRoll:roll};
  const actual=incomingRoleDamage(x);const parent={attachMovie(){},getNextHighestDepth(){return 1},_parent:{}};
  for(let i=1;i<=3;i++)parent._parent['battleHuanShouPanel'+i]={isOpen:false};
  const role={isAlive:true,life:10000,jook:x.jook,reduceDamage:x.reduceDamage,attackFire:x.defenderFire,defense:x.defense,flyState:fly,nonDefenseMC:{_visible:nonDefense},_parent:parent,toDeath(){}};
  const from={burst:x.burst,attackFire:x.attackerFire,wind:3,fire:5,water:7,soil:11};
  const returned=fn('function byAttack(enemy, from, attack, isMax)','enemy,from,attack,isMax',{random:()=>roll}).call(role,{},from,x.attack,false);
  assert.equal(returned,actual.returnedAttack);assert.equal(10000-role.life,actual.lifeDamage+26);
 }
});
