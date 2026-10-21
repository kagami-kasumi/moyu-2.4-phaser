import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {Journey} from '../../src/domain/journey.ts';
import {Actor} from '../../src/domain/actor.ts';
import {captureSave} from '../../src/application/save-game.ts';
import {decodeSave,encodeSave,savedProgress} from '../../src/application/save-codec.ts';
import {literalItem} from '../../src/content/registry.ts';

const out='.evidence/shuxin-bandits';fs.mkdirSync(out,{recursive:true});
const json=path=>JSON.parse(fs.readFileSync(path));
const maps=json('public/assets/first-slice/manifest.json'),actors={战士:json('public/assets/first-actor/manifest.json'),法师:json('public/assets/mage/manifest.json')};
function make(){const journey=new Journey(maps,new Actor(actors.战士),actors);journey.start('强盗受控边界');journey.firstQuest.nextActive=true;for(const [map,entry]of [['city','entry1'],['citySecond','entry1'],['cityThird','entry1'],['shuxinOutskirts','entry1'],['shuxinRoad','entry1']])journey.arrive(map,entry,map);journey.advance(5000);return journey;}
function fixture(journey,name){const file=`${out}/${name}.json`;fs.writeFileSync(file,encodeSave(captureSave(journey.progress())));return file;}
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true');
async function load(page,file){await page.goto('/?manual');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function item(page,scope,name,verb){const card=page.locator(`${scope} [data-item="${name}"]`).first();if(!await card.evaluate(element=>element.open))await card.locator('summary').click();await card.getByRole('button',{name:verb+' '+name,exact:true}).click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const file=`${out}/${name}.json`;await(await download).saveAs(file);return savedProgress(decodeSave(fs.readFileSync(file,'utf8')));}

test('controlled full bag rewards, pickup after consumption and detached claim idempotence',async({page})=>{
 test.setTimeout(120000);const journey=make();for(const wave of [1,2,3]){journey.combat.monsters.forEach(monster=>journey.combat.kill(monster));if(wave<3)journey.advance(5000);}
 journey.reward.drops=[];journey.reward.bag=Array.from({length:40},()=>({...literalItem('英雄令'),number:99}));journey.reward.bag[0]={...literalItem('勇士勋章'),number:1};
 await load(page,fixture(journey,'controlled-full'));const stale=await page.locator('#bandit-quest-prize').evaluateHandle(button=>button.onclick);await page.locator('#bandit-quest-prize').click();await stale.evaluate(callback=>callback());
 await page.keyboard.press('x');await expect(page.locator('#ground-items [data-item="英雄令"]')).toHaveCount(1);await item(page,'#bag-items','勇士勋章','使用');await item(page,'#ground-items','英雄令','拾取');await expect(page.locator('#ground-items [data-item="英雄令"]')).toHaveCount(0);await page.screenshot({path:`${out}/full-claim-pickup.png`});
 const state=await save(page,'controlled-full-claimed');expect(state.firstQuest.bandits).toEqual({number:1,isDoing:false,isComplete:true});expect(state.inventory.exploit).toBe(600);expect(state.inventory.militaryExploit).toBe(600);await load(page,`${out}/controlled-full-claimed.json`);await expect(page.locator('#bandit-quest-prize')).toBeHidden();
});
test('controlled death cancels old encounter on revival; non-task road never starts battle',async({page})=>{
 const journey=make();journey.combat.monsters.forEach(monster=>journey.combat.kill(monster));journey.vitals.life=0;
 await load(page,fixture(journey,'controlled-dead-warning'));await page.evaluate(()=>{window.journeyProbe.advance(10000);window.journeyProbe.render();});await expect(page.locator('#combat-revive')).toBeVisible();await page.locator('#combat-revive').click();await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');await page.evaluate(()=>{window.journeyProbe.advance(10000);window.journeyProbe.render();});await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');await page.screenshot({path:`${out}/death-return.png`});
 const noTask=make();noTask.combat.close();noTask.combat=undefined;noTask.firstQuest.nextActive=false;noTask.firstQuest.bandits={number:0,isDoing:false,isComplete:false};noTask.map='shuxinRoad';noTask.x=42;noTask.y=200.95;
 await load(page,fixture(noTask,'controlled-no-task'));await page.evaluate(()=>{window.journeyProbe.advance(30000);window.journeyProbe.render();});await expect(page.locator('#map-name')).toHaveText('树心路');await expect(page.locator('#base-attack')).toBeHidden();await page.screenshot({path:`${out}/no-task-road.png`});
});
