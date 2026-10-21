import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {Journey} from '../../src/domain/journey.ts';
import {Actor} from '../../src/domain/actor.ts';
import {captureSave} from '../../src/application/save-game.ts';
import {encodeSave,decodeSave,savedProgress} from '../../src/application/save-codec.ts';
import {literalItem} from '../../src/content/registry.ts';
import {hatchPet} from '../../src/domain/pet-hatching.ts';

const out='.evidence/swamp-city';fs.mkdirSync(out,{recursive:true});
const json=path=>JSON.parse(fs.readFileSync(path));
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
function road(){
 const journey=new Journey(json('public/assets/first-slice/manifest.json'),new Actor(json('public/assets/first-actor/manifest.json')));journey.start('受控沼泽');
 journey.firstQuest.king={number:1,isDoing:false,isComplete:true};for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['swampOutskirts','entry2']])expect(journey.arrive(map,entry,map)).toBe(true);
 return journey;
}
function fight(){const journey=road();journey.arrive('swampCity','entry1','swampCity');const index=journey.reward.bag.findIndex(item=>item?.type==='沼泽幻境');journey.inventory.use(index,journey.reward.bag[index]);return journey;}
function file(journey,name){const path=out+'/'+name+'.json';fs.writeFileSync(path,encodeSave(captureSave(journey.progress())));return path;}
async function load(page,path){await page.goto('/?manual');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(path);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function item(page,scope,name,verb){const cell=page.locator(scope+' [data-item="'+name+'"]').first();if(!await cell.evaluate(element=>element.open))await cell.locator('summary').click();await cell.getByRole('button',{name:verb+' '+name,exact:true}).click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const path=out+'/'+name+'.json';await(await download).saveAs(path);return savedProgress(decodeSave(fs.readFileSync(path,'utf8')));}

test('controlled cleared reward: full bag then real plasma pickup, qualified pet transformation and import',async({page})=>{
 test.setTimeout(90000);const journey=fight(),pet=hatchPet('奇迹龙',true,()=>.1);
 Object.assign(pet,{battle:true,rareFen:4000,life:100,element:1});journey.reward.pets=[pet];journey.petProgression.slots=[pet,null,null];
 journey.combat.random=limit=>limit===10?5:0;for(const monster of journey.combat.monsters)journey.combat.kill(monster);journey.step();
 journey.reward.bag=Array.from({length:40},()=>({type:'英雄令',number:99}));journey.reward.bag[0]=literalItem('勇士勋章');
 await load(page,file(journey,'controlled-plasma'));await page.keyboard.press('x');await item(page,'#ground-items','电浆药水','拾取');await expect(page.locator('#reward-message')).toContainText('没有空格');
 await item(page,'#bag-items','勇士勋章','使用');await item(page,'#ground-items','电浆药水','拾取');
 await page.keyboard.press('Escape');await page.keyboard.press('c');await page.locator('#pet-advancement > summary').click();await page.getByRole('button',{name:'使用 电浆药水',exact:true}).click();await page.getByRole('button',{name:'确认进阶',exact:true}).click();await expect(page.locator('#pet-detail')).toContainText('元素 雷');
 await page.screenshot({path:out+'/plasma-used.png'});const state=await save(page,'plasma-used');expect(state.reward.pets[0].element).toBe(5);expect(state.reward.bag.some(item=>item?.type==='电浆药水')).toBe(false);
 await load(page,out+'/plasma-used.json');await page.keyboard.press('c');await expect(page.locator('#pet-detail')).toContainText('元素 雷');
});

test('controlled four SuperHS eggs from original reward flow are picked and hatched in UI',async({page})=>{
 test.setTimeout(120000);
 for(const [index,name]of ['蝴蝶牛','乖乖虎','嘻哈牛','玲珑虎'].entries()){
  const journey=fight();journey.combat.random=limit=>limit===4?index:0;for(const monster of journey.combat.monsters)journey.combat.kill(monster);journey.step();journey.reward.bag=Array(40).fill(null);
  await load(page,file(journey,'egg-'+index));await page.keyboard.press('x');await item(page,'#ground-items',name,'拾取');await item(page,'#bag-items',name,'孵化');await expect(page.locator('#reward-message')).toContainText('已孵化 '+name);await page.screenshot({path:out+'/egg-'+index+'.png'});
 }
});

test('controlled shared intrusion timer, locked exit, death to swamp city and persisted lucky exit',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{const original=Math.random;Math.random=()=>{if(window.forceMirage){window.forceMirage=false;return 0;}return original();};});
 await load(page,file(road(),'random-road'));await page.evaluate(()=>{window.journeyProbe.advance(300001);window.journeyProbe.position(542,411.6);window.forceMirage=true;});await page.keyboard.press('q');await page.evaluate(()=>window.forceMirage=false);
 await expect(page.locator('#map-name')).toHaveText('沼泽幻境');await expect(page.locator('#notice')).toContainText('首次抵达沼泽');await page.keyboard.press('q');await expect(page.locator('#map-name')).toHaveText('沼泽幻境');await page.screenshot({path:out+'/random-first.png'});
 const dead=fight();dead.vitals.life=0;await load(page,file(dead,'dead'));await page.locator('#combat-revive').click();await expect(page.locator('#map-name')).toHaveText('沼泽');
 await page.screenshot({path:out+'/death-return.png'});
 const lucky=road();lucky.arrive('swampCity','entry1','swampCity');lucky.reward.bag[0]=literalItem('幸运之门');lucky.inventory.use(0,lucky.reward.bag[0]);
 await load(page,file(lucky,'lucky'));await page.keyboard.press('q');await expect(page.locator('#map-name')).toHaveText('沼泽');
 const saved=await save(page,'lucky-return');expect(saved.cityVisit.homeCity).toBe('沼泽');expect(saved.cityVisit.swampMirageGranted).toBe(true);expect(errors).toEqual([]);
});
test('controlled all ordinary factory outputs are picked, consumed or sold and existing pet shop remains separate',async({page})=>{
 test.setTimeout(90000);const journey=fight();journey.reward.bag=Array(40).fill(null);journey.reward.credit=100;
 for(const [index,branch]of [2,3,6,7].entries()){journey.combat.random=limit=>limit===10?branch:99%Math.max(1,Math.floor(limit));journey.combat.kill(journey.combat.monsters[index]);}journey.step();
 await load(page,file(journey,'ordinary-rewards'));await page.keyboard.press('x');
 for(const name of ['9朵玫瑰','极品玉石','英雄令','富豪礼包'])await item(page,'#ground-items',name,'拾取');
 await item(page,'#bag-items','英雄令','使用');await item(page,'#bag-items','富豪礼包','使用');await page.keyboard.press('Escape');
 await page.evaluate(()=>window.journeyProbe.position(353.45,357.6));await page.keyboard.press('q');await expect(page.locator('#map-name')).toHaveText('沼泽');
 const bounds=await page.locator('canvas').boundingBox();await page.mouse.click(bounds.x+180,bounds.y+230);await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();
 for(const name of ['9朵玫瑰','极品玉石'])await page.locator('[data-sell]').filter({hasText:name}).first().click();await page.keyboard.press('Escape');
 const result=await save(page,'ordinary-used');expect(result.reward.credit).toBe(114);expect(result.pharmacy.openNumber).toBe(7);expect(result.petShop.openNumber).toBe(9);expect(result.reward.bag.some(item=>['9朵玫瑰','极品玉石','富豪礼包'].includes(item?.type))).toBe(false);
});

test('controlled additional soul pack and final fruit both consume and persist',async({page})=>{
 test.setTimeout(90000);const j=fight();j.reward.bag.fill(null);j.combat.random=limit=>limit===10?8:99%limit;for(const m of j.combat.monsters)j.combat.kill(m);j.step();await load(page,file(j,'new-rewards'));await page.keyboard.press('x');await item(page,'#ground-items','灵魂礼包','拾取');await item(page,'#bag-items','灵魂礼包','使用');await item(page,'#ground-items','奇异果','拾取');await page.keyboard.press('Escape');await page.keyboard.press('c');await page.locator('#pet-advancement > summary').click();await page.getByRole('button',{name:'使用 奇异果',exact:true}).click();await page.getByRole('button',{name:'确认进阶',exact:true}).click();const result=await save(page,'new-rewards-used');expect(result.reward.pets[0].qyg).toBe(1);expect(result.reward.bag.some(i=>i?.name==='灵魂晶石')).toBe(true);await load(page,out+'/new-rewards-used.json');await expect(page.locator('#map-name')).toHaveText('沼泽幻境');
});
