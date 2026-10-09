import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {initialWarriorVitals,initialKainVitals,fraction} from '../src/domain/hud.ts';import {NpcReward} from '../src/domain/npc-reward.ts';import {rewardOracle} from './source-reward-oracle.mjs';
const source=JSON.parse(fs.readFileSync('docs/reverse-engineering/original-ui/details-source.json','utf8'));
test('HUD initial values derive from original constructor/rates and real startup grants',()=>{
 const ctor=source.roleConstructor,warrior=source.warrior.split('else')[0];const get=(s:string,name:string)=>Number(s.match(new RegExp('(?:this|role)\\.'+name+' = ([0-9.]+);'))![1]);
 const level=get(ctor,'levels');assert.deepEqual(initialWarriorVitals(),{level,life:get(warrior,'rateLife')*(level+5),maxLife:get(warrior,'rateLife')*(level+5),mp:get(warrior,'rateMp')*(level+5),maxMp:get(warrior,'rateMp')*(level+5),exp:get(ctor,'xxx_nowExp'),maxExp:get(ctor,'maxExp')});
 const current=new NpcReward('玩家',()=>0),original=rewardOracle();assert.equal(current.ms,original.root.map.role.xxx_ms);assert.equal(current.res,original.root.map.role.xxx_res);assert.equal(current.bag.filter(Boolean).length,36);assert.equal(current.bag[9]!.number,999);assert.deepEqual(current.bag,original.bag());
 assert.equal(initialKainVitals().maxLife,current.pets[0]!.rateLife*(current.pets[0]!.levels+5));
});
test('bar presentation handles empty pools and bounds without changing rule values',()=>{assert.equal(fraction(45,90),.5);assert.equal(fraction(3,9),1/3);assert.equal(fraction(0,0),0);assert.equal(fraction(-1,90),0);assert.equal(fraction(100,90),1);});
