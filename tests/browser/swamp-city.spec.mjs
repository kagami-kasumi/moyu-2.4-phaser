import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {decodeSave,savedProgress} from '../../src/application/save-codec.ts';

const out='.evidence/swamp-city';fs.mkdirSync(out,{recursive:true});
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
async function fight(page,id,stage){
 let partial=false;
 for(let cycle=0;cycle<500;cycle++){
  const labels=await page.locator('#hud [data-pet-slot],.hud-status-hit').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('title')??''));const heal=labels.some(label=>{const match=label.match(/生命 ([\d.]+)\s*\/\s*([\d.]+)/);return match&&Number(match[1])>0&&Number(match[2])-Number(match[1])>Math.min(650,Number(match[2])*.3);});if(heal){await page.keyboard.press('x');if(await page.locator('#bag-items [data-item="超级药"]').count())await item(page,'#bag-items','超级药','使用');await page.keyboard.press('Escape');}await page.keyboard.press('f');await page.waitForTimeout(700);await expect(page.locator('#combat-revive')).toBeHidden();if(cycle%4!==3)continue;
  const state=await save(page,id+'-'+stage+'-tracking');console.log(id,stage,cycle,state.combat.monsters.map(monster=>Math.round(monster.life)));
  if(state.combat.monsters.every(monster=>monster.life<=0)){await save(page,id+'-'+stage+'-cleared');return state;}
  if(!partial&&state.combat.monsters.some((monster,index)=>monster.life>0&&monster.life<66300)){await load(page,`${out}/${id}-${stage}-tracking.json`);partial=true;}
  const target=state.combat.monsters.filter(monster=>monster.life>0).sort((a,b)=>Math.hypot(a.x-state.x,a.y-state.y)-Math.hypot(b.x-state.x,b.y-state.y))[0],targetY=Math.min(410,Math.max(180,target.y)),targetX=Math.min(490,Math.max(70,target.x+80));
  if(Math.abs(targetY-state.y)>12)await move(page,targetY>state.y?'ArrowDown':'ArrowUp',Math.min(250,Math.abs(targetY-state.y)/135*1000));
  if(Math.abs(targetX-state.x)>12)await move(page,targetX>state.x?'ArrowRight':'ArrowLeft',Math.min(250,Math.abs(targetX-state.x)/180*1000));await move(page,'ArrowLeft',70);
 }
 throw Error('Natural field combat did not finish');
}

async function item(page,container,name,verb){const entry=page.locator(container+' [data-item="'+name+'"]').first();if(!await entry.evaluate(element=>element.open))await entry.locator('summary').click();await entry.getByRole('button',{name:verb+' '+name,exact:true}).click();}
for(const id of ['warrior','mage'])test(`${id}: natural swamp city, green mirage combat, fruit consumption and file restore`,async({page})=>{
 test.setTimeout(1200000);page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message);});
 await load(page,process.env.SWAMP_CITY_RESUME?`${out}/${id}-mirage-tracking.json`:`${out}/${id}-trained.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 if(!process.env.SWAMP_CITY_RESUME){await walk(page,303.65,437.2);await expect(page.locator('#map-name')).toHaveText('沼泽郊区');await walk(page,350,300);await walk(page,542,411.6);await expect(page.locator('#map-name')).toHaveText('沼泽');
 await click(page,180,230);await page.getByRole('button',{name:'好的，我想买点药',exact:true}).click();await expect(page.locator('[data-good]')).toHaveCount(7);await page.locator('[data-good="6"]').click();await page.getByRole('textbox',{name:'购买数量'}).fill('30');await page.getByRole('button',{name:'确认购买',exact:true}).click();await expect(page.locator('#shop-feedback')).toContainText('购买 超级药 × 30');await page.keyboard.press('Escape');await save(page,id+'-city');await page.screenshot({path:`${out}/${id}-city.png`});await page.keyboard.press('x');await item(page,'#bag-items','沼泽幻境','使用');await page.keyboard.press('Escape');await expect(page.locator('#map-name')).toHaveText('沼泽幻境');}
 const cleared=await fight(page,id,'mirage');expect(cleared.combat.monsters.every(m=>m.life===0)).toBe(true);await page.screenshot({path:`${out}/${id}-cleared.png`});await load(page,`${out}/${id}-mirage-cleared.json`);
 await page.keyboard.press('x');await item(page,'#ground-items','奇异果','拾取');await page.keyboard.press('Escape');await page.keyboard.press('c');await page.getByRole('button',{name:'6. 玲珑虎',exact:true}).click();await page.locator('#pet-advancement > summary').click();await page.getByRole('button',{name:'使用 奇异果',exact:true}).click();await page.getByRole('button',{name:'确认进阶',exact:true}).click();await page.keyboard.press('Escape');const used=await save(page,id+'-reward-used');expect(used.reward.pets[5].qyg).toBe((cleared.reward.pets[5].qyg??0)+1);
 await portal(page,id,353.45,357.6,'沼泽');const home=await save(page,id+'-home');expect(home.cityVisit.homeCity).toBe('沼泽');expect(home.cityVisit.swampMirageGranted).toBe(true);await page.reload();await ready(page);await page.locator('#continue-game').click();await load(page,`${out}/${id}-home.json`);await expect(page.locator('#map-name')).toHaveText('沼泽');expect(errors).toEqual([]);
});

