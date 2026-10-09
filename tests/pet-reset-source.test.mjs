import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {PET_RESET_RULES as rules} from '../src/content/pet-reset-rules.ts';
const root='local-resources/moyu/source-index/as/scripts/';
test('pet reset clears old and current progression, fills refreshed life and preserves independent fields',()=>{
 const source=fs.readFileSync(root+rules.source.file,'utf8');
 const fn=vm.runInNewContext('(function()'+functionRange(source,'function reset()').text+')',{Math});
 const pet={oldLevels:90,oldNowExp:123,oldMaxExp:999,levels:100,nowExp:32,maxExp:88,life:0,maxLife:10,type:'fixture',zs:10,rateLife:25,isBattle:true,flashAttribute(){assert.equal(this.levels,1);this.maxLife=150;}};
 fn.call(pet);for(const [key,value] of Object.entries(rules.fields))assert.equal(pet[key],value);
 assert.equal(pet.life,150);assert.equal(pet.type,'fixture');assert.equal(pet.zs,10);assert.equal(pet.rateLife,25);assert.equal(pet.isBattle,true);
});
test('collection reset includes every pet and refreshes panels after traversal',()=>{
 const source=fs.readFileSync(root+rules.collection.file,'utf8'),events=[];
 const context={};for(let i=1;i<=3;i++)context['battleHuanShouPanel'+i]={flashView:()=>events.push('panel'+i)};
 const fn=vm.runInNewContext('(function()'+functionRange(source,'this.huanShou.reset =').text+')',context);
 fn.call({allHuanShou:Array.from({length:5},(_,i)=>({reset:()=>events.push(i)})),flashView:()=>events.push('view')});
 assert.deepEqual(events,[0,1,2,3,4,'view','panel1','panel2','panel3']);
});
