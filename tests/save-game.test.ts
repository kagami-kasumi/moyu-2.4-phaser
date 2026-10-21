import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {Actor} from '../src/domain/actor.ts';import {Journey} from '../src/domain/journey.ts';
import {validateManifest} from '../src/content/manifest.ts';import {validateSlice} from '../src/content/slice-manifest.ts';
import {captureSave,savedProgress} from '../src/application/save-game.ts';import {encodeSave,decodeSave,validatePreserved,MAX_SAVE_SIZE} from '../src/application/save-codec.ts';
import {SaveStorage,SAVE_KEY} from '../src/adapters/save-storage.ts';import {persistentState} from '../src/content/persistence-schema.ts';import {restorePreservedValue} from '../src/content/preserved-value.ts';
import {persistenceFields} from '../src/content/persistence-registry-data.ts';import {registryData} from '../src/content/registry-data.ts';import {SAVE_FIELDS} from '../src/content/save-field-data.ts';import {concreteKey} from '../src/application/save-source.ts';
import {rewardEquipment} from '../src/domain/npc-reward.ts';import {literalItem} from '../src/content/registry.ts';import type {Profession} from '../src/content/character-entry.ts';
const json=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
function create(){const a=validateManifest(json('public/assets/first-actor/manifest.json')),mage=validateManifest(json('public/assets/mage/manifest.json'));return new Journey(validateSlice(json('public/assets/first-slice/manifest.json')),new Actor(a),{战士:a,法师:mage});}
function memory(){const data=new Map<string,string>();let fail=false;return {data,set fail(v:boolean){fail=v;},getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{if(fail)throw Error('QuotaExceededError');data.set(k,v);}};}
function use(j:Journey,type:string){const r=j.reward!,n=r.bag.findIndex(v=>v?.type===type||v?.name===type);assert(n>=0,type);assert(j.inventory!.use(n,r.bag[n]!,{x:j.x,y:j.y}));}
for(const profession of ['战士','法师'] as Profession[])for(const name of ['远行','DeBuG'])for(const map of ['outskirts','city'] as const)test(`${profession}/${name}/${map}: all state, forging owners, damaged vitals and rewards survive repeated restore without initialization`,()=>{
 const j=create();j.start(name,profession);const r=j.reward!;use(j,'富豪礼包');use(j,'英勇');use(j,'勇士勋章');
 r.interact();r.choose(2);r.choose(3);r.close();r.ms=127;r.res=456;
 // Make free slots by equipping before hatching, including full debug inventory.
 const gear=rewardEquipment(profession)[0]!;r.bag[0]=gear;use(j,gear.name!);r.bag[0]=literalItem('莎菲');use(j,'莎菲');
 const held=structuredClone(gear);held.holes=1;held.mhdj=10;held.grade=4;
 j.sockets!.item=held;j.sockets!.stone={type:'宝石',name:'灵魂晶石',number:7};j.sockets!.open=true;
 j.inventory!.refresh();j.vitals.life=17;j.vitals.mp=3;j.petVitals.life=11;r.drops.push({item:literalItem('初级月光宝盒'),x:j.x,y:j.y});
 j.input.right=true;j.advance(1000/15);j.releaseInput();
 if(map==='city')j.arrive('city','entry1','city');
 const p=j.progress(),save=captureSave(p),disk=memory(),store=new SaveStorage(()=>disk);store.write(save,null);
 const originalRandom=Math.random;Math.random=()=>{throw Error('Restore must not draw random rewards');};
 try{for(let n=0;n<3;n++){const loaded=store.read();assert.equal(loaded.kind,'valid');if(loaded.kind!=='valid')throw Error('load');const next=create();next.restore(savedProgress(loaded.state));assert.deepEqual(next.progress(),p);assert.equal(next.reward!.messages.length,0);assert.equal(next.actor.events.length,0);assert.equal(next.reward!.open,false);assert.equal(next.sockets!.open,false);const again=captureSave(next.progress(),loaded.state);store.write(again,loaded.raw);}}
 finally{Math.random=originalRandom;}
 const next=create();next.restore(savedProgress(decodeSave(disk.data.get(SAVE_KEY)!)));next.sockets!.show();const count=next.reward!.bag.filter(Boolean).length;next.sockets!.take('item');assert.equal(next.sockets!.item,null);assert.equal(next.reward!.bag.filter(Boolean).length,count+1);assert.equal(next.reward!.bag.find(i=>i?.grade===4)?.mhdj,10);
 next.reward!.interact();assert.equal(next.reward!.cmd,6);assert(!next.reward!.choose(3));
});

test('all 653 templates instantiate concrete keys; all 911 identities and opaque payloads survive actual codec and repeated capture',()=>{
 const j=create();j.start('保存');const game=j.progress();const base=captureSave(game);
 assert.equal(SAVE_FIELDS.length,653);assert.deepEqual(SAVE_FIELDS.map(f=>f.id),persistenceFields.map(f=>f.id));
 const source=restorePreservedValue(base.source) as Record<string,unknown>;
 const values=[undefined,null,false,0,-0,NaN,Infinity,-Infinity,'',new Array(4)];
 for(const [i,field]of persistenceFields.entries()){const key=typeof field.key==='string'?field.key:concreteKey(field.key.expression,2,1);source[key]={testValue:values[i%values.length],unknown:'未来字段'};}
 const extensions=restorePreservedValue(base.extensions) as Record<string,unknown>;
 extensions.records=registryData.definitions.map(d=>({contentId:d.id,payload:d.data}));extensions.future={sparse:[,undefined,NaN],duplicate:[{type:'未知'},{type:'未知'}],__notExecutable:'keep'};
 const p=extensions.game as unknown as Record<string,unknown>;p.future=Infinity;(p.reward as Record<string,unknown>).future={flag:undefined};
 const state=persistentState(source,extensions),round=decodeSave(encodeSave(state));assert.deepEqual(round,state);
 const again=captureSave(savedProgress(round),round),after=restorePreservedValue(again.extensions) as Record<string,unknown>;
 assert.deepEqual(after,extensions);assert.deepEqual(restorePreservedValue(round.source),source);
 // Unknown source keys and inactive systems are not deleted by saving the playable projection.
 const extra=persistentState({...source,unknownSource:[,undefined,-0]},extensions);const next=captureSave(game,extra);
 assert.deepEqual((restorePreservedValue(next.source) as Record<string,unknown>).unknownSource,[,undefined,-0]);
 assert.deepEqual((restorePreservedValue(next.source) as Record<string,unknown>).XPPower_nowPower,game.combatLedger!.nowPower);
});

test('new source seeds include capacities, original equipment ordering, NPC defaults, every template domain and owned live mutations',()=>{
 const j=create();j.start('验证','法师');j.reward!.interact();j.reward!.choose(2);j.reward!.choose(3);j.inventory!.bravery=1;use(j,'蛇杖');
 const state=captureSave(j.progress()),source=restorePreservedValue(state.source) as Record<string,unknown>;
 assert.equal(source.backPack_number,40);assert.equal(source.wareHouse_number,54);assert.equal(source.fastKey_number,7);assert.equal(source.equipment2name,'蛇杖');assert.equal(source.role_vocational,'法师');
 assert.equal(source.mainCastle0levels,3);assert.equal(source.mainTask1isDoing,true);assert.equal(source.allHuanShou0type,'凯恩');assert(Object.keys(source).length>7000);
 for(const f of SAVE_FIELDS){if(!f.dynamic)assert(Object.hasOwn(source,f.key),f.key);else if(f.owner!=='friend'&&!f.key.includes(' + n + '))assert(Object.keys(source).some(k=>k.startsWith(concreteKey(f.key,0).replace(/0.*$/,''))),f.id);}
});

test('bad input, references, higher versions, duplicates and resource exhaustion are rejected before any storage write',()=>{
 const j=create();j.start('安全');const good=captureSave(j.progress()),disk=memory(),store=new SaveStorage(()=>disk);const raw=store.write(good,null);
 for(const mutate of [(s:any)=>s.schemaVersion=99,(s:any)=>s.schema='other',(s:any)=>s.source.entries.push(s.source.entries[0]),(s:any)=>s.source.entries[0].value={kind:'array',length:1e10,entries:[]}]){const s=structuredClone(good);mutate(s);assert.throws(()=>store.write(s,raw));assert.equal(disk.data.get(SAVE_KEY),raw);}
 for(const mutate of [(p:any)=>p.map='未知地图',(p:any)=>p.profession='未知职业',(p:any)=>p.reward.bag[0]={type:'未注册物品'},(p:any)=>p.reward.pets[0].type='未知幻兽',(p:any)=>p.initialState.skills[0].name='不存在技能',(p:any)=>p.inventory.equipment.武器={type:'衣服'},(p:any)=>p.reward.cmd=1+(p.reward.claimedPack=1), (p:any)=>p.vitals.life=NaN]){const p=j.progress();mutate(p);assert.throws(()=>captureSave(p));assert.equal(disk.data.get(SAVE_KEY),raw);}
 assert.throws(()=>decodeSave('{"schema":1,"schema":2}'),/重复/);assert.throws(()=>decodeSave(' '.repeat(MAX_SAVE_SIZE+1)),/容量/);
 for(const v of [{kind:'array',length:1,entries:[{index:1,value:{kind:'null'}}]},{kind:'array',length:1,entries:[],properties:[{key:'length',value:{kind:'number',value:9}}]},{kind:'special-number',value:'constructor'}])assert.throws(()=>validatePreserved(v));
 assert.equal(new SaveStorage(()=>{throw Error('SecurityError');}).read().kind,'unavailable');
 disk.fail=true;assert.throws(()=>store.write(good,raw),/Quota/);assert.equal(disk.data.get(SAVE_KEY),raw);disk.fail=false;
 assert.throws(()=>store.write(good,null),/其他页面/);assert.equal(disk.data.get(SAVE_KEY),raw);
 disk.data.set(SAVE_KEY,'corrupt');assert.equal(store.read().kind,'invalid');assert.equal(disk.data.get(SAVE_KEY),'corrupt');disk.data.delete(SAVE_KEY);assert.equal(store.read().kind,'empty');
});

test('restore validates geometry atomically and derives maxima without resetting current vitals or upgrading equipment',()=>{
 const j=create();j.start('旧角色');const before=j.progress(),bad=structuredClone(before);bad.x=-9999;assert.throws(()=>j.restore(bad));assert.deepEqual(j.progress(),before);
 const p=structuredClone(before);p.vitals.maxLife=1;p.vitals.maxMp=1;p.vitals.life=8;p.vitals.mp=2;j.restore(p);assert.equal(j.vitals.maxLife,90);assert.equal(j.vitals.maxMp,30);assert.equal(j.vitals.life,8);assert.equal(j.vitals.mp,2);assert.equal(j.reward!.bag.length,40);
});

test('independent AS save keys use one-based bag/shortcut/warehouse and zero-based equipment; source building initializer keeps housing at 3',()=>{
 const root='local-resources/moyu/source-index/as/scripts/';const body=fs.readFileSync(root+'frame_9/DoAction_2.as','utf8');
 for(const owner of ['backPack','fastKey','wareHouse'])assert.match(body,new RegExp('moyu_so.data.'+owner+'_number = this.'+owner+'.number;\\s+i = 1;\\s+while\\(i <= this.'+owner+'.number\\)'));
 const housing=fs.readFileSync(root+'DefineSprite_2313_主城堡/frame_1/DoAction.as','utf8');assert.match(housing,/building\[0\].levels = 3;/);assert.match(housing,/building\[0\].prizeLv = 3;/);
 const j=create();j.start('源映射');j.inventory!.bravery=50;j.inventory!.refresh();const state=captureSave(j.progress()),s=restorePreservedValue(state.source) as Record<string,unknown>;
 assert.equal(s.backPack1type,j.reward!.bag[0]!.type);assert.equal(s.backPack40type,j.reward!.bag[39]?.type);assert(!Object.hasOwn(s,'backPack0type'));assert(Object.hasOwn(s,'wareHouse54type'));assert(Object.hasOwn(s,'fastKey7type'));assert.equal(s.fastKey5type,'技能图标');assert.equal(s.fastKey5name,'斩魂');
 assert.equal(s.mainCastle0levels,3);assert.equal(s.mainCastle0prizeLv,3);
 for(const f of persistenceFields)if(typeof f.key!=='string')assert.equal(concreteKey(f.key.expression,3,2),vm.runInNewContext(f.key.expression,{i:3,n:2}));
 const next=create();next.restore(savedProgress(decodeSave(encodeSave(state))));assert.equal(next.inventory!.bravery,50);assert.deepEqual(next.inventory!.stats(),j.inventory!.stats());
 const bad=j.progress();bad.inventory.bravery=51;assert.throws(()=>captureSave(bad));
 for(const amount of [-100,0,127,100000000]){j.reward!.ms=amount;j.reward!.res=amount;next.restore(savedProgress(decodeSave(encodeSave(captureSave(j.progress())))));assert.equal(next.reward!.ms,amount);assert.equal(next.reward!.res,amount);}
});

test('all four forge ownership combinations persist with the panel closed; taking a held stack cannot duplicate or lose it',()=>{
 for(const itemPresent of [false,true])for(const stonePresent of [false,true]){
  const j=create();j.start('托管');j.reward!.bag[0]=null;j.reward!.bag[1]=null;j.sockets!.item=itemPresent?rewardEquipment()[0]!:null;j.sockets!.stone=stonePresent?{type:'宝石',name:'魔魂之心',number:5}:null;
  j.sockets!.close();const p=j.progress(),next=create();next.restore(savedProgress(decodeSave(encodeSave(captureSave(p)))));assert.deepEqual(next.progress().crafting,p.crafting);assert.equal(next.sockets!.open,false);
  const before=next.reward!.bag.filter(Boolean).length;next.sockets!.show();next.sockets!.take('stone');next.sockets!.take('item');assert.equal(next.reward!.bag.filter(Boolean).length,before+Number(itemPresent)+Number(stonePresent));
  const saved=captureSave(next.progress());const after=create();after.restore(savedProgress(decodeSave(encodeSave(saved))));assert.equal(after.sockets!.item,null);assert.equal(after.sockets!.stone,null);assert.deepEqual(after.reward!.bag,next.reward!.bag);
 }
});
