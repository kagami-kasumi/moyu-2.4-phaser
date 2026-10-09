import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {worldIncomingHit,petPanelNumbers,MONSTER_DEATH_NUMBERS} from '../src/content/pet-world-combat-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
const sources=Object.fromEntries(['pet','monster'].map(kind=>[kind,fs.readFileSync(root+'__Packages/'+(kind==='pet'?'HuanShouMC':'MonsterMC')+'.as','utf8')]));
function oracle(x,rolls){
 const writes=[],effects=[];let life=x.life,xpCharges=0,calls=0;
 const fn=vm.runInNewContext('(function(enemy,from,attack,isMax)'+functionRange(sources[x.kind],'function byAttack(').text+')',{random:n=>{assert.equal(n,100);return rolls[calls++%rolls.length]}});
 const pet={...x.defender,item:{bell:{skill:x.bellSkill}}};
 const target={...x.defender,huanShou:pet,isAlive:x.alive,nonDefenseMC:{_visible:x.nonDefense},toDeath(){},_parent:{role:{attackFire:x.roleFire},attachMovie(){},getNextHighestDepth(){return 1},_parent:{XPPower:{addExp(){xpCharges++}}}}};
 Object.defineProperty(target,'life',{get:()=>life,set:v=>{writes.push(v);if(!Number.isNaN(v))life=v>x.maxLife?x.maxLife:v<0?0:v;}});
 const enemy={byAttack(a,b,attack){assert.equal(a,null);assert.equal(b,pet);effects.push({type:'reflect',attack});},frostMC:{run:duration=>effects.push({type:'frost',duration})}};
 const returnedAttack=fn.call(target,enemy,x.from,x.attack,false);
 return {returnedAttack,life,writes,effects,xpCharges,calls};
}
const numbers={attackFire:100,burst:7,jook:9,reduceDamage:11,defense:32,wind:3,fire:5,water:7,soil:11};
const seed=kind=>({kind,alive:true,attack:57,life:90,maxLife:100,defender:{...numbers},from:{...numbers,attackFire:400},roleFire:300,nonDefense:false,bellSkill:1});
function compare(x,rolls){let calls=0;const actual=worldIncomingHit(x,n=>{assert.equal(n,100);return rolls[calls++%rolls.length]});const {miss,critical,...out}=actual;assert.deepEqual({...out,calls},oracle(x,rolls),JSON.stringify({x,rolls}));return actual;}
test('pet and monster full incoming numeric stages independently match source across caps, elements, dodge and bell branches',()=>{
 for(const kind of ['pet','monster'])for(const diff of [-200,-3,0,4,200])for(const life of [0,0.4,30,90])for(const attack of [-1,0,0.1,57,999])for(const rolls of [[0,0,0],[94,95,4],[95,94,5],[99,99,99]])for(const bellSkill of [0,1,2]){
  const x=seed(kind);x.life=life;x.attack=attack;x.bellSkill=bellSkill;
  if(kind==='pet')x.from.attackFire=x.roleFire-diff;else x.defender.attackFire=x.roleFire+diff;
  compare(x,rolls);
 }
});
test('invalid input, defense bypass, negative reduction and NaN fields preserve source branches and random consumption',()=>{
 for(const kind of ['pet','monster'])for(const change of [{alive:false},{attack:NaN},{nonDefense:true},{defender:{...numbers,reduceDamage:-200}},{defender:{...numbers,defense:NaN}},{from:{...numbers,wind:NaN,fire:-1,water:0,soil:0}}])compare({...seed(kind),...change},[99,99,0]);
});
test('pet panel floor score and bell sentinel rules match full source function, including undefined bell type',()=>{
 const source=fs.readFileSync(root+'DefineSprite_4556/frame_1/DoAction.as','utf8');
 for(const allFen of [-1,0,99,100,2999,3000])for(const type of ['空格','铃铛',undefined])for(const grade of [-1,0,4]){
  const pet={minAttack:1.5,maxAttack:4,defense:3,allFen},bell={type,grade};
  const sandbox={minAttack:999,maxAttack:999,defense:999,attackFire:999,huanShou:pet,item:{bell},role:{flashAttribute(){}}};
  vm.runInNewContext('(function()'+functionRange(source,'this.flashAttribute =').text+').call(this)',sandbox);
  assert.deepEqual(petPanelNumbers(pet,bell),Object.fromEntries(['minAttack','maxAttack','defense','attackFire'].map(k=>[k,sandbox[k]])));
 }
});
test('monster death experience and equipment spirit match source call arguments',()=>{
 for(const levels of [0,1,99,150]){let exp,spirit;const x={levels,expRate:MONSTER_DEATH_NUMBERS.experienceRate,baseExp:MONSTER_DEATH_NUMBERS.baseExperience,_parent:{attachMovie(){},getNextHighestDepth(){return 1},role:{priseExp(n){exp=n}},monsterDeath(){},_parent:{equipment:{spiritUp(n){spirit=n}}}},站立(){}};
  const source=sources.monster;assert.match(source,/var expRate = 3;/);assert.match(source,/var baseExp = 15;/);
  vm.runInNewContext('(function()'+functionRange(source,'function toDeath()').text+')',{random:()=>0}).call(x);
  assert.equal(exp,levels*3+15);assert.equal(spirit,MONSTER_DEATH_NUMBERS.equipmentSpirit);
 }
});
