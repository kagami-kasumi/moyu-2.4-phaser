import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';import {lockPlayerTarget,clickAttack} from '../src/domain/combat-targeting.ts';
const source=fs.readFileSync('local-resources/moyu/source-index/as/scripts/__Packages/RoleMC.as','utf8');
const lock=vm.runInNewContext('(function(横向范围,纵向范围)'+functionRange(source,'function lockTarget(').text+')');
const click=vm.runInNewContext('(function(target)'+functionRange(source,'function autoAttack(').text+')');
test('player targeting matches source range edges, ties, facing, retained targets and source slot order',()=>{
 for(const facing of ['left','right'])for(const dx of [-401,-400,-151,-150,-1,0,1,150,151,400,401])for(const dy of [-41,-40,-31,-30,0,30,31,40,41])for(const alive of [false,true])for(const held of [false,true]){
  const p={x:250,y:300,facing,...held?{target:'m1'}:{}},units=[{id:'m1',x:250+dx,y:300+dy,alive},{id:'m2',x:250+dx,y:300+dy,alive:true}];
  for(const [width,height]of [[150,30],[400,30],[400,40]]){
   const us=units.map(u=>({...u,_x:u.x,_y:u.y,isAlive:u.alive})),o={_x:p.x,_y:p.y,faceTo:facing==='left'?'左':'右',myTarget:held?us[0]:undefined,_parent:{monstUnit:us}},a=structuredClone(p);
   const result=lock.call(o,width,height);assert.equal(lockPlayerTarget(a,units,width,height),result);assert.equal(a.target,o.myTarget?.id);
  }
 }
});
test('base click range is strict and mage dispatches fireball, without overwriting held target',()=>{
 for(const profession of ['warrior','mage'])for(const dx of [-400,-150,-149,0,149,150,399,400])for(const dy of [-40,-30,-29,0,29,30,39,40]){
  const p={x:250,y:300,facing:'left',target:'held'},u={id:'clicked',x:250+dx,y:300+dy,alive:true};let action='',moved=false;
  const o={_x:p.x,_y:p.y,faceTo:'左',vocational:profession==='warrior'?'战士':'法师',斩魂(){action='warrior'},火球术(){action='mage'},_parent:{ground:{onPress(){moved=true}}}};
  const result=click.call(o,{_x:u.x,_y:u.y});assert.equal(clickAttack(p,u,profession),result===true);assert.equal(p.facing,o.faceTo==='左'?'left':'right');assert.equal(p.target,'held');assert.equal(action,result===true?profession:'');assert.equal(moved,result!==true);
 }
});
