import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';

const out='.evidence/shuxin-city';
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
async function load(page,file){await page.goto('/');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const file=`${out}/${name}.json`;await(await download).saveAs(file);const progress=savedProgress(decodeSave(fs.readFileSync(file,'utf8')));await page.locator('#close-manager').click();await page.locator('#close-system').click();return progress;}
async function move(page,key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
for(const id of ['warrior','mage'])test(`${id}: continue real cleared export, keyboard exit, consume reward and reimport home`,async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const source=`${out}/${id}-cleared.json`,cleared=savedProgress(decodeSave(fs.readFileSync(source,'utf8')));expect(cleared.combat.monsters.every(monster=>monster.life===0)).toBe(true);expect(cleared.combatLedger.kills.幻影冰妖剑士).toBe(4);
 await load(page,source);await page.waitForTimeout(750);await page.screenshot({path:`${out}/${id}-cleared-settled.png`});expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();await page.keyboard.press('x');
 const item=page.locator('#ground-items [data-item="电浆药水"]').first();if(!await item.evaluate(element=>element.open))await item.locator('summary').click();await item.getByRole('button',{name:'拾取 电浆药水',exact:true}).click();await page.keyboard.press('Escape');
 for(let attempt=0;attempt<5;attempt++){const position=await save(page,id+'-exit-position');const dx=338.45-position.x,dy=331.55-position.y;if(Math.abs(dx)>15)await move(page,dx>0?'ArrowRight':'ArrowLeft',Math.abs(dx)/180*1000);if(Math.abs(dy)>10)await move(page,dy>0?'ArrowDown':'ArrowUp',Math.abs(dy)/135*1000);await page.keyboard.press('q');if(await page.locator('#map-name').textContent()==='树心城')break;}
 await expect(page.locator('#map-name')).toHaveText('树心城');
 const bounds=await page.locator('canvas').boundingBox();await page.mouse.click(bounds.x+455,bounds.y+260);await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();await page.locator('[data-sell]').filter({hasText:'电浆药水'}).first().click();await expect(page.locator('#shop-feedback')).toContainText('出售 电浆药水');await page.screenshot({path:`${out}/${id}-reward-used.png`});await page.keyboard.press('Escape');
 const home=await save(page,id+'-home');expect(home.cityVisit.homeCity).toBe('树心城');expect(home.reward.ms).toBeGreaterThan(cleared.reward.ms);await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,`${out}/${id}-home.json`);await expect(page.locator('#map-name')).toHaveText('树心城');expect(errors).toEqual([]);
});
