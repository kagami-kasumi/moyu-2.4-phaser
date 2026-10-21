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
for(const id of ['warrior','mage'])test(`${id}: fuse combat stones and equip all twelve sockets through normal UI`,async({page})=>{
 test.setTimeout(1200000);page.setDefaultTimeout(15000);await load(page,`${out}/${id}-prepared.json`);await walk(page,510,340);await walk(page,42,411.6);
 const initial=savedProgress(decodeSave(fs.readFileSync(`${out}/${id}-prepared.json`,'utf8')));
 for(const type of ['武器','鞋','头盔','衣服']){
  const name=initial.inventory.equipment[type].name;await page.keyboard.press('e');await page.getByRole('button',{name:'卸下 '+name,exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('x');await page.locator('#split-button').click();await choose(page,'选择拆取装备',name);await page.locator('#confirm-split').click();for(let n=1;n<=3;n++)await page.getByRole('button',{name:'取回宝石 '+n,exact:true}).click();await page.getByRole('button',{name:'取回装备',exact:true}).click();await page.locator('#close-split').click();await page.keyboard.press('Escape');
  for(let gem=0;gem<3;gem++){
   await click(page,320,250);await page.getByRole('button',{name:'我想买点东西',exact:true}).click();await page.locator('[data-good]').filter({hasText:'高级战斗力宝石'}).click();await page.getByRole('textbox',{name:'购买数量'}).fill('11');await page.getByRole('button',{name:'确认购买',exact:true}).click();await expect(page.locator('#shop-feedback')).toContainText('购买 高级战斗力宝石 × 11');await page.keyboard.press('Escape');await page.keyboard.press('x');await page.locator('#fusion-button').click();const primary=page.getByRole('combobox',{name:'选择融合主宝石'});await primary.selectOption(await primary.locator('option').evaluateAll(os=>os.find(o=>o.textContent.startsWith('高级战斗力宝石 · 5（'))?.value));
   for(let n=0;n<10;n++){await choose(page,'选择融合副宝石','高级战斗力宝石');await page.getByRole('button',{name:'确认融合',exact:true}).click();await expect(page.locator('#fusion-feedback')).toContainText('融合成功');}
   if(type==='头盔'||type==='衣服'){await choose(page,'选择融合副宝石','高级减伤害宝石');await page.getByRole('button',{name:'确认融合',exact:true}).click();}
   await expect(page.locator('[data-fusion-slot="stone1"]')).toContainText('15');await page.getByRole('button',{name:'取回主宝石',exact:true}).click();await page.getByRole('button',{name:'关闭融合',exact:true}).click();await page.locator('#gem-button').click();await choose(page,'选择镶嵌装备',name);
   const label=type==='头盔'||type==='衣服'?'战斗减伤害圣石':'高级战斗力宝石',slot=await page.locator('#bag-items details').evaluateAll((nodes,label)=>nodes.find(node=>node.dataset.item===label&&Array.from(node.querySelectorAll('dt')).some(dt=>dt.textContent==='val1'&&dt.nextElementSibling.textContent==='15'))?.dataset.slot,label);expect(slot).toBeDefined();await page.getByRole('combobox',{name:'选择镶嵌宝石'}).selectOption(String(Number(slot)-1));await page.locator('#forge-sockets').click();await expect(page.locator('#socket-feedback')).toContainText('镶嵌成功');await page.getByRole('button',{name:'取回装备',exact:true}).click();await page.locator('#close-sockets').click();await page.keyboard.press('Escape');
  }
  await page.keyboard.press('x');await item(page,'#bag-items',name,'装备');await page.keyboard.press('Escape');
 }
 await page.keyboard.press('e');await expect(page.locator('#equipment-stats')).toContainText('减伤害 78%');await page.screenshot({path:`${out}/${id}-power.png`});await page.keyboard.press('Escape');await walk(page,542,411.6);await save(page,id+'-powered');
});
