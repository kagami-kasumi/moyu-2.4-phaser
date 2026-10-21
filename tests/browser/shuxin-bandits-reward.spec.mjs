import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';
import {restorePreservedValue} from '../../src/content/preserved-value.ts';

const out='.evidence/shuxin-bandits';
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
async function load(page,file){await page.goto('/');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
const count=state=>state.reward.bag.reduce((sum,item)=>sum+(item?.type==='英雄令'?Number(item.number):0),0);
for(const id of ['warrior','mage'])test(`${id}: naturally awarded hero token is consumed, capped and preserved through real file import`,async({page})=>{
 test.setTimeout(60000);const input=`${out}/${id}-home.json`,before=savedProgress(decodeSave(fs.readFileSync(input,'utf8')));expect(before.firstQuest.bandits.isComplete).toBe(true);expect(before.firstQuest.bandits.isDoing).toBe(false);
 await load(page,input);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();await page.keyboard.press('x');const token=page.locator('#bag-items [data-item="英雄令"]').first();await token.locator('summary').click();await token.getByRole('button',{name:'使用 英雄令',exact:true}).click();await expect(page.locator('#reward-message')).toContainText('已使用英雄令');await page.screenshot({path:`${out}/${id}-hero-used.png`});
 await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const output=`${out}/${id}-reward-used.json`;await(await download).saveAs(output);
 const saved=decodeSave(fs.readFileSync(output,'utf8')),after=savedProgress(saved);expect(count(after)).toBe(count(before)-1);expect(after.reward.credit).toBe(Math.min(500,before.reward.credit+10));expect(restorePreservedValue(saved.source).role_credit).toBe(after.reward.credit);
 await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,output);await expect(page.locator('#bandit-quest-prize')).toBeHidden();
});
