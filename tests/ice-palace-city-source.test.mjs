import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {functionRange} from '../tools/lib/as2-data.mjs';
import {spawnIcePalaceMirage,icePalaceMirageDrops} from '../src/domain/ice-palace-city.ts';
import {CombatSession} from '../src/domain/combat-session.ts';
import {NPCS} from '../src/content/journey-content.ts';
import {mirageIntrusion} from '../src/domain/kasano-mirage.ts';
import {Journey} from '../src/domain/journey.ts';import {Actor} from '../src/domain/actor.ts';

const fixture=JSON.parse(fs.readFileSync('docs/reverse-engineering/ice-palace-city/source-fixture.json'));
const source=fixture.sources['DefineSprite_4536/frame_1/DoAction'];

test('four mirage guards match original frame91 and initMonster with all numeric fields and RNG order',()=>{
 for(const draw of [0,1,9,19,49,999]){
  const expectedCalls=[],actualCalls=[],random=calls=>limit=>{calls.push(limit);return draw%Math.trunc(limit);};
  const original={role:{attackFire:50},entry6:{},allowJumpMap(){},dangerous(){}};
  for(let index=1;index<=4;index++)original['monster'+index]={monsterName:{},monsterFire:{}};
  const context=vm.createContext({...original,random:random(expectedCalls)});
  const initialization=fixture.sources['DefineSprite_4536/frame_2/DoAction'];
  vm.runInContext(initialization.slice(initialization.indexOf('var bLife =')),context);
  original.initMonster=new vm.Script('(function(beginNum,endNum,monster)'+functionRange(source,'this.initMonster =').text+')').runInContext(context);
  context.initMonster=original.initMonster.bind(original);
  new vm.Script('(function(){'+fixture.sources['DefineSprite_4536/frame_91/DoAction']+'})').runInContext(context).call(original);
  const actual=spawnIcePalaceMirage(random(actualCalls));assert.deepEqual(actualCalls,expectedCalls);assert.equal(actual.length,4);
  actual.forEach((monster,index)=>{
   const expected=original['monster'+(index+1)];
   for(const key of ['minAttack','maxAttack','defense','maxLife','life','attackFire','burst','jook','wind','fire','soil','water','reduceDamage','speedX','speedY','attackLength','attackHeight','guardLength','guardHeight','attackStopTime','stopRate','attackTypeNum'])assert.equal(monster[key],expected[key],key);
   assert.equal(monster.name,expected.myName);assert.equal(monster.species,expected.type);assert.equal(monster.x,expected._x);assert.equal(monster.y,expected._y);
  });
  assert.equal(original.entry6.toMap,'冰宫');assert.equal(original.entry6.toEntry,'backPoint');assert.equal(original.entry6._visible,false);
 }
});
test('source item asks for missing entry1; modern entry6 correction is not labeled original landing',()=>{
 const script=new vm.Script('(function(item)'+functionRange(fixture.sources['frame_9/DoAction'],'this.useItem =').text+')');
 assert.equal(fixture.maps['91'].some(p=>p.name==='entry1'),false);assert(fixture.maps['91'].some(p=>p.name==='entry6'));
 for(const same of [false,true])for(const number of [0,1,2]){const events=[],item={type:'冰宫幻境',number,hitTest:()=>true,setThing:item=>events.push(['clear',item.type])},parent={map:{nowMap:same?'冰宫幻境':'冰宫',gotoAndStop(map){events.push([map,this.nextEntry,item.number]);}},backPack:{},fastKey:{}};script.runInNewContext({_global:{sysMsg:{addMsg(){}}}}).call(parent,item);if(same){assert.equal(item.number,number);assert.equal(events.length,0);}else{assert.deepEqual(events[0],['冰宫幻境','entry1',number]);assert.equal(item.number,number-1);}}
});

test('all thirteen ordinary reward branches and SuperHS thresholds preserve original death and factory RNG order',()=>{
 for(const remaining of [true,false])for(let branch=0;branch<13;branch++)for(const chance of [0,19,20,99])for(let egg=0;egg<4;egg++){
  const expected=[],actual=[],expectedCalls=[],actualCalls=[];
  const random=calls=>limit=>{calls.push(limit);return limit===13?branch:limit===100?chance:limit===4?egg:0;};
  const expectedRandom=random(expectedCalls),actualRandom=random(actualCalls);
  const parent={task:{catchThing:(name,count)=>expected.push({kind:'catch',name,count})},map:{goods:{throwGoods(x,y,item){
   expected.push({kind:'create',name:item.name??item.type,atRole:x===undefined&&y===undefined});expectedRandom(150);expectedRandom(50);
  }}}};
  parent.createThing=new vm.Script('(function(tThing,isDrop,fX,fY)'+functionRange(fixture.sources['frame_9/DoAction'],'this.createThing =').text+')').runInNewContext().bind(parent);
  const context=vm.createContext({_parent:parent,role:{creditUp:amount=>expected.push({kind:'credit',amount})},random:expectedRandom,maxArr:[4,6,8,10,11,12,13],fX:undefined,fY:undefined,haveMonst:()=>remaining,entry1:{}});
  for(const [name,args]of [['dropItemX','prizeLevel,fX,fY'],['SuperHS','rand']])context[name]=new vm.Script('(function('+args+')'+functionRange(source,'function '+name).text+')').runInContext(context);
  new vm.Script('(function(mName,fX,fY,level)'+functionRange(source,'this.monsterDeath =').text+')').runInContext(context).call({_parent:parent},'幻影死神战将',100,200,45);
  icePalaceMirageDrops(remaining,actualRandom,(event,atRole=false)=>{actual.push(event.kind==='create'?{...event,atRole}:event);if(event.kind==='create'){actualRandom(150);actualRandom(50);}});
  assert.deepEqual(actual,expected);assert.deepEqual(actualCalls,expectedCalls);assert.equal(context.entry1._visible,remaining?undefined:true);
 }
});


test('city first grant, untouched pharmacy stock, four NPC identities and strict intrusion order match frame90',()=>{
 const json=p=>JSON.parse(fs.readFileSync(p)),maps=json('public/assets/first-slice/manifest.json'),actor=json('public/assets/first-actor/manifest.json');
 for(const elapsed of [0,300000,300001])for(const chance of [.05,.5])for(const draw of [0,.049999,.05,.5,.999])for(const granted of [false,true])for(const stock of [0,2,7]){
  const gifts=[],npcs=[],original={entry1:{},entry2:{},entry3:{},npc01:{appear:(...args)=>npcs.push(args)},npc02:{appear:(...args)=>npcs.push(args)},npc03:{appear:(...args)=>npcs.push(args)},npc04:{appear:(...args)=>npcs.push(args)},allowJumpMap(){},dangerous(){},gotoAndStop(){}};let calls=0,jumped=false;
  const context=vm.createContext({_parent:{createThing:item=>gifts.push(item.type)},gotoAndStop:()=>{jumped=true;},getNpc:n=>n,getTimer:()=>elapsed,nowMap:'冰宫',homeCity:'南城一',drugShop:stock,冰宫获得幻境:granted,_root:{intoV:chance,intoTime:0,intoWait:300000},_global:{playBackSound(){}},Math:{random:()=>{calls++;return draw;}}});
  new vm.Script('(function(){'+fixture.sources['DefineSprite_4536/frame_90/DoAction']+'})').runInContext(context).call(original);
  const j=new Journey(maps,new Actor(actor),undefined,()=>.999);j.start('冰宫');j.firstQuest.king={isDoing:false,isComplete:true,number:1};j.ice.task.isComplete=true;j.vitals.level=100;for(const [m,e]of [['city','entry1'],['citySecond','entry1'],['swampOutskirts','entry2'],['swampCity','entry1'],['southOutskirts','entry2'],['southCity','entry1'],['southSecond','entry1'],['borderOutskirts','entry2'],['borderCity','entry1'],['iceCorridor','entry1'],['frostOutskirts','entry1']])assert(j.arrive(m,e,m));j.pharmacy.openNumber=stock;j.cityVisit.icePalaceMirageGranted=granted;j.reward.bag.fill(null);j.initialState.intoV=chance;j.mirageElapsed=elapsed;let actualCalls=0;j.mirageRandom=()=>{actualCalls++;return draw;};assert(j.arrive('icePalaceCity','entry1','icePalaceCity'));
  assert.equal(actualCalls,calls);assert.equal(calls,1);assert.equal(j.cityVisit.homeCity,context.homeCity);assert.equal(j.cityVisit.icePalaceMirageGranted,context.冰宫获得幻境);assert.equal(j.pharmacy.openNumber,context.drugShop);assert.deepEqual(j.reward.bag.filter(Boolean).map(i=>i.type),gifts);assert.equal(j.map,jumped?'icePalaceMirage':'icePalaceCity');assert.deepEqual(npcs,[['药剂师',235,220],['冰宫指挥官',300,330],['白衣圣兽师',470,330],['挑战者',375,330]]);
  assert.equal(original.entry1.toMap,'冰宫郊区');assert.equal(original.entry2.toMap,'港口');
 }
 assert(fixture.sources['DefineSprite_4536/frame_1/DoAction'].includes('nTitle:"巧匠",name:"",cmd:10100'));
 const portraits=fixture.timelines['4308'];for(const map of ['icePalaceCity'])for(const npc of NPCS[map]){const frame=Object.entries(portraits.labels).find(([,name])=>name===npc.title)?.[0];assert(frame,npc.title);assert.equal(Number(portraits.frames[Number(frame)-1][0].characterId),npc.shape);}
 assert.deepEqual(NPCS.icePalaceCity.map(n=>[n.title,n.x,n.y]),[['药剂师',235,220],['冰宫指挥官',300,330],['白衣圣兽师',470,330],['挑战者',375,330]]);
});
