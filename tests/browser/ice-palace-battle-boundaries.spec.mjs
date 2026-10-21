import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {Journey} from '../../src/domain/journey.ts';
import {Actor} from '../../src/domain/actor.ts';
import {captureSave} from '../../src/application/save-game.ts';
import {encodeSave,decodeSave,savedProgress} from '../../src/application/save-codec.ts';
import {literalItem} from '../../src/content/registry.ts';

const out='.evidence/ice-palace-battle';fs.mkdirSync(out,{recursive:true});const json=path=>JSON.parse(fs.readFileSync(path));
function make(){const journey=new Journey(json('public/assets/first-slice/manifest.json'),new Actor(json('public/assets/first-actor/manifest.json')));journey.restore(savedProgress(decodeSave(fs.readFileSync('.evidence/ice-battle/warrior-home.json','utf8'))));for(const [map,entry]of [['iceCorridor','entry1'],['frostOutskirts','entry1']])expect(journey.arrive(map,entry,map)).toBe(true);return journey;}
function field(){const journey=make();for(let index=0;index<75;index++)journey.step();return journey;}
function file(journey,name){const path=out+'/'+name+'.json';fs.writeFileSync(path,encodeSave(captureSave(journey.progress())));return path;}
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
async function load(page,path){await page.goto('/?manual');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(path);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const path=out+'/'+name+'.json';await(await download).saveAs(path);const progress=savedProgress(decodeSave(fs.readFileSync(path,'utf8')));await page.locator('#close-manager').click();await page.locator('#close-system').click();return progress;}
async function item(page,scope,name,verb){const cell=page.locator(scope+' [data-item="'+name+'"]').first();if(!await cell.evaluate(element=>element.open))await cell.locator('summary').click();await cell.getByRole('button',{name:verb+' '+name,exact:true}).click();}

test('controlled five-map visual / import, all three families and partially cleared state',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',error=>errors.push(error.message));const journey=field();
 for(const [region,entry,title]of [['frostLeft',null,'冰宫战场左'],['frostUp','entry1','冰宫战场上'],['frostCenter','entry2','冰宫战场中'],['frostDown','entry2','冰宫战场下'],['frostRight','entry3','冰宫战场右']]){
  if(entry)expect(journey.arrive(region,entry,region)).toBe(true);if(journey.combat.monsters.length)journey.combat.monsters[1].life-=17;await load(page,file(journey,'visual-'+region));await expect(page.locator('#map-name')).toHaveText(title);await page.waitForTimeout(750);await page.screenshot({path:out+'/'+region+'.png'});const restored=await save(page,'visual-restored-'+region);expect(restored.frostBattle).toEqual(journey.frostBattle);expect(restored.combat.monsters).toEqual(journey.progress().combat.monsters);
 }
 expect(errors).toEqual([]);
});
test('controlled paused warning, field death home, quartermaster revival and lucky return',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',error=>errors.push(error.message));await load(page,file(make(),'warning'));
 await page.locator('#system-button').click();await page.evaluate(()=>{window.journeyProbe.render();window.journeyProbe.advance(10000);});await page.locator('#close-system').click();expect((await save(page,'paused-warning')).frostBattle.warningTicks).toBe(75);await page.evaluate(()=>{window.journeyProbe.render();window.journeyProbe.advance(5000);});await expect(page.locator('#map-name')).toHaveText('冰宫战场左');
 const journey=field();journey.arrive('frostCenter','entry1','frostCenter');journey.vitals.life=0;for(const pet of journey.petProgression.slots)if(pet)pet.life=0;await load(page,file(journey,'dead'));await page.locator('#combat-revive').click();await expect(page.locator('#map-name')).toHaveText('冰宫战场左');const revived=await save(page,'revived');expect(revived.x).toBe(379.4);expect(revived.y).toBe(256);expect(revived.vitals.life).toBe(revived.vitals.maxLife);for(const index of revived.petProgression.slots)if(index!==null)expect(revived.reward.pets[index].life).toBeGreaterThan(0);
 journey.restore(revived);journey.reward.bag[0]=literalItem('幸运之门');expect(journey.inventory.use(0,journey.reward.bag[0])).toBe(true);await load(page,file(journey,'lucky'));await page.keyboard.press('q');await expect(page.locator('#map-name')).toHaveText('冰宫战场左');await page.screenshot({path:out+'/lucky-home.png'});expect(errors).toEqual([]);
});
test('controlled full bag icePalace reward, genuine pickup and use, and import',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',error=>errors.push(error.message));const journey=field();journey.arrive('frostCenter','entry1','frostCenter');journey.arrive('frostRight','entry2','frostRight');journey.combat.random=limit=>limit-1;for(const monster of journey.combat.monsters)journey.combat.kill(monster);journey.reward.bag=Array.from({length:40},()=>({...literalItem('英雄令'),number:1}));await load(page,file(journey,'full-claim'));await page.locator('#frost-quest-prize').click();await expect(page.locator('#frost-quest-prize')).toBeHidden();await page.keyboard.press('x');await item(page,'#ground-items','超级经验球','拾取');await expect(page.locator('#reward-message')).toContainText('没有空格');await item(page,'#bag-items','英雄令','使用');await item(page,'#ground-items','超级经验球','拾取');await item(page,'#bag-items','超级经验球','使用');await page.screenshot({path:out+'/full-reward-used.png'});const progress=await save(page,'full-reward-used');expect(progress.firstQuest.icePalace.isDoing).toBe(false);expect(progress.inventory.consumables.expBallNum).toBe(Math.min(150,journey.inventory.consumables.expBallNum+1));await load(page,out+'/full-reward-used.json');await expect(page.locator('#frost-quest-prize')).toBeHidden();expect(errors).toEqual([]);
});


test('controlled completed outskirts displays pillar, shared merchant stock and honest closed destinations',async({page})=>{const j=make();j.firstQuest.icePalace={number:1,isDoing:false,isComplete:true};j.firstQuest.icePalaceActive=false;j.transition('iceCorridor','entry3');expect(j.arrive('frostOutskirts','entry1','frostOutskirts')).toBe(true);await load(page,file(j,'completed-outskirts'));const b=await page.locator('canvas').boundingBox();await page.mouse.click(b.x+400,b.y+290);await expect(page.locator('#notice')).toContainText('共享库存开放 15 项');await page.screenshot({path:out+'/merchant-stock.png'});const p=await save(page,'merchant-stock');expect(p.cityVisit.gobiPetShopOpenNumber).toBe(15);expect(p.frostBattle.warningTicks).toBe(0);});
