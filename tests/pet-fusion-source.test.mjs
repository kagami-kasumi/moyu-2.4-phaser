import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {fusionViceScore,petFusionNumbers,petTitleNumbers,FUSION_GRASSES} from '../src/content/pet-fusion-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
const src=fs.readFileSync(root+'DefineSprite_2356_幻化面板/frame_1/DoAction.as','utf8');
const globals={_global:{sysMsg:{addMsg(){}},msg:{open(){}}},_X:0,_Y:0,battlePanel:{body:{life:1,maxLife:100}}};
const fn=(marker,args='',extra={},source=src)=>vm.runInNewContext('(function('+args+')'+functionRange(source,marker).text+')',{...globals,...extra});
const base=()=>({type:'战士攻防型',levels:30,allFen:3100,zs:1,maxZs:100,element:1,rateLife:10,rateMinAttack:12,rateMaxAttack:14,rateDefense:8,maxRateLife:20,maxRateMinAttack:24,maxRateMaxAttack:28,maxRateDefense:16,maxLifeFen:200,maxMinAttackFen:300,maxMaxAttackFen:500,maxDefenseFen:100});
test('vice score matches independent source including below half rates, zero maxima and flooring',()=>{
 for(const scale of [-1,0,0.5,0.99,1,1.5,10])for(const max of [0,10,23]){const p=base();p.rateLife=max*scale;p.maxRateLife=max;p.rateDefense*=scale;const panel={mainHuanShou:p,viceNeed:{}};const expected=fn('this.viceNeedFen =').call(panel);assert.equal(fusionViceScore(p),expected);}
});
test('growth and mutation agree with original full guarded function and consume random only in eligible branch',()=>{
 for(const score of [499,500,2999,3000,3001])for(const level of [19,20,29,30])for(const rate of [9,19.999,20,20.01,30])for(const bonus of [0,0.2,0.5,0.8,1])for(const roll of [9,10]){
  const p={...base(),allFen:score,levels:level,rateLife:rate,maxDefenseFen:0};const vice={type:'奇异兽',allFen:10000};const events=[];let n=0,m=0;
  const actual=petFusionNumbers(p,vice,100,true,bonus,c=>{assert.equal(c,1000);n++;return roll});
  const sourcePet={...p,turned(){events.push('turned')},checkUp(){events.push('checkUp')}};
  const panel={mainHuanShou:sourcePet,viceHuanShou:vice,needFen:100,useLuckGrass:{nowState:true},useExpball:{nowState:false},moreEffect:()=>bonus,delViceHuanShou(){events.push('delete')},viceNeedFen(){},_parent:{successHuanHua:{openPanel(){}},flashHuanShouView(){}}};
  const expected=fn('this.beginHuanHua =','',{random:c=>{assert.equal(c,1000);m++;return roll}}).call(panel);
  assert.equal(actual.accepted,expected===true);assert.equal(n,m);
  if(actual.accepted){const {turned,checkUp,...out}=sourcePet;assert.deepEqual(actual.pet,out);assert.deepEqual(events,['delete','turned','checkUp']);}else assert.deepEqual(events,[]);
 }
});
test('first available grass, failure boundaries and title award order match source',()=>{
 for(let available=0;available<=4;available++){const used=[];const value=fn('this.moreEffect =').call({_parent:{backPack:{useThing(item,n){used.push(item.type);assert.equal(n,1);return item.type===FUSION_GRASSES[available]?.[0]}}}});assert.equal(value,FUSION_GRASSES[available]?.[1]??0);assert.equal(used.length,Math.min(available+1,4));}
 for(const [main,vice,need] of [[undefined,undefined,100],[{...base(),zs:100},{type:'奇异兽',allFen:100},100],[base(),undefined,100],[base(),{type:'other',allFen:1000},100],[base(),{type:'奇异兽',allFen:99},100]]){
  const actual=petFusionNumbers(main,vice,need,false,0,()=>{throw Error('unexpected roll')});
  assert.equal(fn('this.beginHuanHua =').call({mainHuanShou:main,viceHuanShou:vice,needFen:need,setViceHuanShou(){}}),false);assert.equal(actual.accepted,false);
 }
 const titleSrc=fs.readFileSync(root+'DefineSprite_2327_幻兽超进化/frame_1/DoAction.as','utf8');
 for(const allFen of [4999,5000,10000])for(const titleNum of [0,1])for(const titles of [[],[{type:'pet',number:0}],[{type:'pet',number:9},{type:'pet',number:1}]]){
  const p={type:'pet',allFen,titleNum,maxZs:100};const expectedPet={...p,checkUp(){}};const panel={mainHuanShou:expectedPet,_parent:{allTitle:structuredClone(titles),flashHuanShouView(){}},closePanel(){}};
  const ok=fn('this.superEvolve =','',{mainHuanShou:expectedPet},titleSrc).call(panel);const actual=petTitleNumbers(p,titles);assert.equal(actual.accepted,ok===true);
  if(actual.accepted){const {checkUp,...out}=expectedPet;assert.deepEqual(actual.pet,out);assert.deepEqual(actual.titles,panel._parent.allTitle);}
 }
});
