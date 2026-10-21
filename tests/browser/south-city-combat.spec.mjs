import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {encodeSave,decodeSave,savedProgress} from '../../src/application/save-codec.ts';

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

for(const id of ['warrior','mage'])test(`${id}: controlled strong party, original four flame monsters, real attacks and reward consumption`,async({page})=>{
 test.setTimeout(240000);page.setDefaultTimeout(10000);
 // Explicit test-only party strength; no claim this was earned through natural growth.
 const document=decodeSave(fs.readFileSync(`.evidence/south-battle/${id}-home.json`,'utf8'));
 const {Journey}=await import('../../src/domain/journey.ts');const {Actor}=await import('../../src/domain/actor.ts');const {captureSave}=await import('../../src/application/save-game.ts');
 const maps=JSON.parse(fs.readFileSync('public/assets/first-slice/manifest.json'));const actors={'战士':JSON.parse(fs.readFileSync('public/assets/first-actor/manifest.json')),'法师':JSON.parse(fs.readFileSync('public/assets/mage/manifest.json'))};const progress=savedProgress(document),j=new Journey(maps,new Actor(actors[progress.profession]),actors);j.restore(progress);j.arrive('southOutskirts','entry2','southOutskirts');j.arrive('southCity','entry1','southCity');
 for(const p of j.reward.pets)if(p.battle)p.rareFen=100000;
 const seed=`${out}/${id}-controlled-seed.json`;fs.writeFileSync(seed,encodeSave(captureSave(j.progress())));await load(page,seed);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();await page.keyboard.press('x');await item(page,'#bag-items','南城幻境','使用');await page.keyboard.press('Escape');
 let cleared,partial=false;
 for(let cycle=0;cycle<140;cycle++){
  await page.keyboard.press('f');await page.waitForTimeout(700);await expect(page.locator('#combat-revive')).toBeHidden();if(cycle%4!==3)continue;
  const state=await save(page,id+'-controlled-tracking');
  if(state.combat.monsters.every(m=>m.life===0)){cleared=state;break;}
  if(!partial&&state.combat.monsters.some(m=>m.life>0&&m.life<86700)){await load(page,`${out}/${id}-controlled-tracking.json`);partial=true;}
  const target=state.combat.monsters.find(m=>m.life>0),dy=target.y-state.y,dx=target.x+55-state.x;
  if(Math.abs(dy)>10)await move(page,dy>0?'ArrowDown':'ArrowUp',Math.min(900,Math.abs(dy)/135*1000));if(Math.abs(dx)>15)await move(page,dx>0?'ArrowRight':'ArrowLeft',Math.min(1300,Math.abs(dx)/180*1000));await move(page,'ArrowLeft',50);
 }
 expect(cleared).toBeDefined();await page.screenshot({path:`${out}/${id}-controlled-cleared.png`});await page.keyboard.press('x');await item(page,'#ground-items','幻兽转世丹','拾取');await page.keyboard.press('Escape');await page.keyboard.press('c');await page.getByRole('button',{name:'7. 凯恩',exact:true}).click();await page.locator('#pet-advancement > summary').click();await page.getByRole('button',{name:'使用 幻兽转世丹',exact:true}).click();await page.getByRole('button',{name:'确认进阶',exact:true}).click();await page.keyboard.press('Escape');const used=await save(page,id+'-controlled-used');expect(used.reward.pets[6].zs).toBe(cleared.reward.pets[6].zs+10);
 await portal(page,id+'-controlled',310.95,380.55,'南城一');await save(page,id+'-controlled-home');await load(page,`${out}/${id}-controlled-home.json`);await expect(page.locator('#map-name')).toHaveText('南城一');
});
