import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';

const out='.evidence/south-city';fs.mkdirSync(out,{recursive:true});
const ready=page=>expect(page.locator('body')).toHaveAttribute('data-ready','true',{timeout:15000});
async function load(page,file){await page.goto('/');await ready(page);await page.locator('#manage-saves').click();await page.locator('#import-save').setInputFiles(file);await Promise.all([page.waitForEvent('load'),page.locator('#apply-import').click()]);await ready(page);await page.locator('#continue-game').click();}
async function save(page,name){await page.keyboard.press('Escape');await page.locator('#system-button').click();await page.locator('#save-game').click();await expect(page.locator('#save-message')).toContainText('保存成功');await page.locator('#manage-saves-game').click();const download=page.waitForEvent('download');await page.locator('#export-save').click();const file=`${out}/${name}.json`;await(await download).saveAs(file);const progress=savedProgress(decodeSave(fs.readFileSync(file,'utf8')));await page.locator('#close-manager').click();await page.locator('#close-system').click();return progress;}
async function move(page,key,ms){await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);}
async function click(page,x,y){const bounds=await page.locator('canvas').boundingBox();await page.mouse.click(bounds.x+x,bounds.y+y);}
async function walk(page,x,y){const bounds=await page.locator('canvas').boundingBox();await page.mouse.move(bounds.x+x,bounds.y+y);await page.mouse.down();await page.waitForTimeout(4200);await page.mouse.up();}
async function portal(page,id,x,y,destination){
 for(let attempt=0;attempt<6;attempt++){const position=await save(page,id+'-position'),dx=x-position.x,dy=y-position.y;if(Math.abs(dx)>18)await move(page,dx>0?'ArrowRight':'ArrowLeft',Math.abs(dx)/180*1000);if(Math.abs(dy)>10)await move(page,dy>0?'ArrowDown':'ArrowUp',Math.abs(dy)/135*1000);await page.keyboard.press('q');if(await page.locator('#map-name').textContent()===destination)return;}
 await expect(page.locator('#map-name')).toHaveText(destination);
}
async function item(page,container,name,verb){const entry=page.locator(container+' [data-item="'+name+'"]').first();if(!await entry.evaluate(element=>element.open))await entry.locator('summary').click();await entry.getByRole('button',{name:verb+' '+name,exact:true}).click();}
for(const id of ['warrior','mage'])test(`${id}: natural south cities, pharmacy, first grant and file restore`,async({page})=>{
 test.setTimeout(180000);page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await load(page,`.evidence/south-battle/${id}-home.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 await portal(page,id,507,431,'南城郊区');await portal(page,id,542,411.6,'南城一');const city=await save(page,id+'-city');expect(city.cityVisit.southMirageGranted).toBe(true);expect(city.reward.bag.some(i=>i?.type==='南城幻境')).toBe(true);await page.screenshot({path:`${out}/${id}-city.png`});
 await portal(page,id,542,411.6,'南城二');const second=await save(page,id+'-second');expect(second.cityVisit.homeCity).toBe('南城一');expect(second.cityVisit.gobiPetShopOpenNumber).toBe(10);await load(page,`${out}/${id}-second.json`);await page.screenshot({path:`${out}/${id}-second.png`});await portal(page,id,42,414,'南城一');
 await click(page,240,300);await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();await expect(page.locator('[data-good]')).toHaveCount(7);await page.locator('[data-good="6"]').click();await page.getByRole('textbox',{name:'购买数量'}).fill('1');await page.getByRole('button',{name:'确认购买',exact:true}).click();await expect(page.locator('#shop-feedback')).toContainText('购买 超级药 × 1');await page.keyboard.press('Escape');
 const home=await save(page,id+'-home');expect(home.reward.bag.filter(i=>i?.type==='南城幻境')).toHaveLength(1);await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,`${out}/${id}-home.json`);await expect(page.locator('#map-name')).toHaveText('南城一');expect(errors).toEqual([]);
});
