import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('start menu enters the playable game with in-game panels',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('body')).toHaveAttribute('data-ready','true');
 await page.locator('#new-game').click();await page.locator('#warrior').click();await page.getByRole('button',{name:'进入卡萨诺城郊区'}).click();await expect(page.locator('#entry')).toBeHidden();await expect(page.locator('#status')).toContainText('玩家 · 卡萨诺城郊区');
 await expect(page.locator('header,footer,.badge')).toHaveCount(0);
 await page.keyboard.down('ArrowRight');await expect(page.locator('#status')).toContainText('移动中');await page.keyboard.up('ArrowRight');await expect(page.locator('#status')).toContainText('站立');
 const b=await page.locator('canvas').boundingBox();await page.mouse.click(b.x+170,b.y+190);await expect(page.locator('#talk')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#talk')).toBeHidden();
 await page.locator('#inventory-button').click();await expect(page.locator('#inventory')).toBeVisible();await expect(page.locator('#bag-count')).toHaveText('物品背包 36 / 40');await page.locator('#close-inventory').click();await expect(page.locator('#inventory')).toBeHidden();
 fs.mkdirSync('.evidence/game-entry',{recursive:true});await page.screenshot({path:'.evidence/game-entry/default.png'});expect(errors).toEqual([]);
});
