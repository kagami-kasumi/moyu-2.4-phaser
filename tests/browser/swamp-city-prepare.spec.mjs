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
for(const id of ['warrior','mage'])test(`${id}: natural checkpoint loot, replay finale and defensive gem preparation`,async({page})=>{
 test.setTimeout(1200000);page.setDefaultTimeout(15000);const armor=id==='warrior'?'精锐之铠':'魔导装';
 await load(page,process.env.SWAMP_GEAR_RESUME?`${out}/${id}-loot-home.json`:`.evidence/swamp-battle/${id}-${id==='warrior'?'down':'right'}-cleared.json`);expect(await page.evaluate(()=>window.journeyProbe)).toBeUndefined();
 if(!process.env.SWAMP_GEAR_RESUME){await page.keyboard.press('x');await item(page,'#ground-items',armor,'拾取');await page.keyboard.press('Escape');
 if(id==='warrior'){await portal(page,id,542,137.6,'沼泽战场右');await fight(page,id,'replay-right');}
 await page.locator('#swamp-quest-prize').click();await page.keyboard.press('x');await item(page,'#bag-items','超级经验球','使用');await page.keyboard.press('Escape');await portal(page,id,42,256,'沼泽战场中');await portal(page,id,42,257.6,'沼泽战场左');await click(page,280,160);await page.locator('#gobi-leave').click();await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');await save(page,id+'-loot-home');}
 await page.keyboard.press('x');await page.locator('#warehouse-button').click();for(;;){const select=page.getByRole('combobox',{name:'选择存入物品'}),v=await select.locator('option').evaluateAll((os,armor)=>os.find(o=>o.value&&!o.textContent.startsWith(armor+' ×'))?.value,armor);if(!v)break;await select.selectOption(v);}
 for(const box of ['初级月光宝盒','中级月光宝盒','高级月光宝盒'])await page.getByRole('button',{name:'取回 '+box,exact:true}).click();await page.keyboard.press('Escape');
 await walk(page,510,340);await walk(page,42,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城一');
 for(let gem=0;gem<6;gem++){
  await click(page,320,250);await page.getByRole('button',{name:'我想买点东西',exact:true}).click();await page.locator('[data-good]').filter({hasText:'高级减伤害宝石'}).click();await page.getByRole('textbox',{name:'购买数量'}).fill('6');await page.getByRole('button',{name:'确认购买',exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('x');await page.locator('#fusion-button').click();
  const select=page.getByRole('combobox',{name:'选择融合主宝石'}),v=await select.locator('option').evaluateAll(os=>os.find(o=>o.textContent.startsWith('高级减伤害宝石 · 8（'))?.value);expect(v).toBeDefined();await select.selectOption(v);
  for(let n=0;n<5;n++){const sub=page.getByRole('combobox',{name:'选择融合副宝石'}),value=await sub.locator('option').evaluateAll(os=>os.find(o=>o.textContent.startsWith('高级减伤害宝石 · 8（'))?.value);await sub.selectOption(value);await page.getByRole('button',{name:'确认融合',exact:true}).click();}
  await expect(page.locator('[data-fusion-slot="stone1"]')).toContainText('13');await page.getByRole('button',{name:'取回主宝石',exact:true}).click();await page.getByRole('button',{name:'关闭融合',exact:true}).click();await page.keyboard.press('Escape');
 }
 await page.keyboard.press('e');const gear=await page.locator('#equipment-panel button[aria-label]').evaluateAll(bs=>bs.map(b=>b.getAttribute('aria-label')).filter(n=>n.startsWith('卸下 ')).slice(0,1));for(const name of gear)await page.getByRole('button',{name,exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('x');
 for(const name of gear.map(n=>n.slice(3))){await page.locator('#split-button').click();await choose(page,'选择拆取装备',name);await page.locator('#confirm-split').click();for(let n=1;n<=3;n++)await page.getByRole('button',{name:'取回宝石 '+n,exact:true}).click();await page.getByRole('button',{name:'取回装备',exact:true}).click();await page.locator('#close-split').click();}
 await page.locator('#socket-button').click();await choose(page,'选择开孔装备',armor);for(const box of ['初级月光宝盒','中级月光宝盒','高级月光宝盒']){await choose(page,'选择月光宝盒',box);await page.locator('#forge-sockets').click();}await expect(page.locator('#socket-item')).toContainText('3孔');await page.getByRole('button',{name:'取回装备',exact:true}).click();await page.locator('#close-sockets').click();
 for(const name of [...gear.map(n=>n.slice(3)),armor]){await page.locator('#gem-button').click();await choose(page,'选择镶嵌装备',name);for(let n=0;n<3;n++){await choose(page,'选择镶嵌宝石','高级减伤害宝石');await page.locator('#forge-sockets').click();await expect(page.locator('#socket-feedback')).toContainText('镶嵌成功');}await page.getByRole('button',{name:'取回装备',exact:true}).click();await page.locator('#close-sockets').click();await item(page,'#bag-items',name,'装备');}
 await page.keyboard.press('Escape');await page.keyboard.press('e');await expect(page.locator('#equipment-stats')).toContainText('减伤害 78%');await page.screenshot({path:`${out}/${id}-defensive.png`});await page.keyboard.press('Escape');await walk(page,542,411.6);await expect(page.locator('#map-name')).toHaveText('卡萨诺城二');await save(page,id+'-prepared');
});


