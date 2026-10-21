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
 for(let cycle=0;cycle<300;cycle++){
  await page.keyboard.press('f');await page.waitForTimeout(850);await expect(page.locator('#combat-revive')).toBeHidden();if(cycle%4!==3)continue;
  const state=await save(page,id+'-'+stage+'-tracking');console.log(id,stage,cycle,state.combat.monsters.map(monster=>Math.round(monster.life)));
  if(state.combat.monsters.every(monster=>monster.life<=0)){await save(page,id+'-'+stage+'-cleared');return state;}
  if(!partial&&state.combat.monsters.some((monster,index)=>monster.life>0&&monster.life<(index===0?(stage==='right'?45900:34884):7650))){await load(page,`${out}/${id}-${stage}-tracking.json`);partial=true;}
  const target=state.combat.monsters.find(monster=>monster.life>0),targetY=Math.min(410,Math.max(180,target.y)),targetX=Math.min(490,Math.max(70,target.x+50));
  if(Math.abs(targetY-state.y)>12)await move(page,targetY>state.y?'ArrowDown':'ArrowUp',Math.min(1800,Math.abs(targetY-state.y)/135*1000));
  if(Math.abs(targetX-state.x)>50)await move(page,targetX>state.x?'ArrowRight':'ArrowLeft',Math.min(2200,Math.abs(targetX-state.x)/180*1000));await move(page,cycle%8===3?'ArrowLeft':'ArrowRight',70);
 }
 throw Error('Natural field combat did not finish');
}
async function item(page,scope,name,verb){const cell=page.locator(scope+' [data-item="'+name+'"]').first();if(!await cell.evaluate(element=>element.open))await cell.locator('summary').click();await cell.getByRole('button',{name:verb+' '+name,exact:true}).click();}
async function choose(page,label,name){const select=page.getByRole('combobox',{name:label}),v=await select.locator('option').evaluateAll((os,n)=>os.find(o=>o.textContent.startsWith(n+' ·'))?.value,name);expect(v).toBeDefined();await select.selectOption(v);}
for(const id of ['warrior','mage'])test(`${id}: natural journey to the teacher, buy and learn 49 bravery books to the source cap`,async({page})=>{
 test.setTimeout(300000);page.setDefaultTimeout(15000);await load(page,`${out}/${id}-powered.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 for(const [x,y,map]of [[510,340,'卡萨诺城二'],[540,415.6,'卡萨诺城三'],[542,411.6,'树心城郊区'],[531,217,'树心路'],[300,350,'树心路'],[538,422,'树心城']]){await walk(page,x,y);await expect(page.locator('#map-name')).toHaveText(map);}
 for(const count of [25,24]){await click(page,350,260);await expect(page.locator('#shop-panel')).toContainText('其他书籍及导师社交尚未开放');await page.getByRole('button',{name:'购买英勇训练书',exact:true}).click();await page.locator('[data-good="0"]').click();await page.getByRole('textbox',{name:'购买数量'}).fill(String(count));await page.getByRole('button',{name:'确认购买',exact:true}).click();await expect(page.locator('#shop-feedback')).toContainText('购买 英勇 × '+count);await page.keyboard.press('Escape');await page.keyboard.press('x');for(let n=0;n<count;n++)await item(page,'#bag-items','英勇','学习');await page.keyboard.press('Escape');}
 await page.keyboard.press('e');await expect(page.locator('#equipment-stats')).toContainText('英勇 50 / 50');await expect(page.locator('#equipment-stats')).toContainText('总战斗力 '+(id==='warrior'?688:684));await page.screenshot({path:`${out}/${id}-training.png`});await page.keyboard.press('Escape');
 for(const [x,y,map]of [[42,411.6,'树心路'],[300,350,'树心路'],[42,200.95,'树心城郊区'],[41.55,401,'卡萨诺城三'],[42,411.6,'卡萨诺城二']]){await walk(page,x,y);await expect(page.locator('#map-name')).toHaveText(map);}
 const state=await save(page,id+'-trained');expect(state.inventory.skills.英勇).toBe(50);
});
