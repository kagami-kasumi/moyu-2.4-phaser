import {decodeSave,encodeSave,savedProgress,MAX_SAVE_SIZE} from '../application/save-codec.ts';
import type {PersistentState} from '../content/persistence-schema.ts';
import {RecoveryStorage,withSaveLock} from './save-recovery.ts';

/** File IO and DOM only; validation and storage remain separate from presentation. */
export function installSaveManager(storage:RecoveryStorage,validate:(state:PersistentState)=>void){
 const dialog=document.createElement('dialog');dialog.id='save-manager';dialog.setAttribute('aria-label','存档管理');
 dialog.innerHTML='<button id="close-manager">关闭</button><h2>存档管理</h2><p>管理已保存的进度。最多保留 3 份备份，导出文件可另存到电脑。</p><p id="manager-summary"></p><button id="export-save">导出存档</button><button id="backup-save">创建备份</button><label class="import-label">导入存档文件<input id="import-save" type="file" accept=".json,application/json"></label><div id="import-preview" hidden><p id="import-description"></p><button id="apply-import">确认导入并返回菜单</button><button id="cancel-import">取消导入</button></div><h3>可恢复的备份</h3><div id="backup-list"></div><p id="manager-message" role="status"></p>';
 document.querySelector('main')!.append(dialog);
 const el=(id:string)=>dialog.querySelector<HTMLElement>('#'+id)!;
 const say=(text:string)=>{el('manager-message').textContent=text;};
 let pending:PersistentState|undefined,expected:string|null=null,selection=0;
 const cancel=()=>{selection++;pending=undefined;el('import-preview').hidden=true;(el('import-save') as HTMLInputElement).value='';};
 const preview=(raw:string,label:string)=>{cancel();const state=decodeSave(raw);validate(state);const current=storage.read();if(current.kind==='unavailable')throw Error(current.message);expected=current.raw;pending=state;
  const p=savedProgress(state);el('import-description').textContent=`${label}：${p.name} · ${p.profession} · 等级 ${p.vitals.level}。确认后替换已保存进度并返回菜单，未保存进度将丢失；有效旧档自动备份。`;el('import-preview').hidden=false;
 };
 const render=()=>{const current=storage.read();el('manager-summary').textContent=current.kind==='valid'?`已保存：${savedProgress(current.state).name}`:current.kind==='empty'?'暂无存档':current.message;
  for(const id of ['export-save','backup-save'])(el(id) as HTMLButtonElement).disabled=current.kind!=='valid';
  const list=el('backup-list');list.replaceChildren();try{const backups=storage.backups();if(!backups.length)list.textContent='暂无有效备份';for(const b of backups){const button=document.createElement('button');const p=savedProgress(decodeSave(b.raw));button.textContent=`恢复 ${p.name} · ${b.kind} · ${b.at?new Date(b.at).toLocaleString():"旧版原记录"}`;button.onclick=()=>{try{preview(b.raw,'备份恢复');}catch(e){say((e as Error).message);}};list.append(button);const remove=document.createElement("button");remove.textContent="删除此备份";remove.onclick=async()=>{if(!window.confirm("删除这份备份？当前存档保持不变。"))return;try{await withSaveLock(()=>storage.removeBackup(b.raw));render();say("备份已删除。");}catch(e){say("删除失败："+(e as Error).message);}};list.append(remove);}}catch(e){say((e as Error).message);}
 };
 const open=()=>{cancel();say('');render();dialog.showModal();};
 for(const id of ['manage-saves','manage-saves-game'])document.getElementById(id)!.onclick=open;
 el('close-manager').onclick=()=>dialog.close();dialog.addEventListener('close',cancel);el('cancel-import').onclick=cancel;
 el('export-save').onclick=()=>{try{const current=storage.read();if(current.kind!=='valid')throw Error('没有可导出的有效存档');const blob=new Blob([encodeSave(current.state)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='魔域-'+savedProgress(current.state).name.replace(/[^\p{L}\p{N}_-]/gu,'_')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('已导出保存进度，请保管下载文件。');}catch(e){say((e as Error).message);}};
 el('backup-save').onclick=async()=>{const current=storage.read();if(current.kind!=='valid')return;try{await withSaveLock(()=>storage.backup(current.raw));render();say('备份已创建。');}catch(e){say('备份失败：'+(e as Error).message);}};
 el('import-save').onchange=async()=>{const file=(el('import-save') as HTMLInputElement).files?.[0];cancel();const request=selection;if(!file)return;try{if(file.size>MAX_SAVE_SIZE*3)throw Error('存档文件超过容量限制');const raw=await file.text();if(request!==selection||!dialog.open)return;preview(raw,'文件导入');say('校验通过，等待确认。');}catch(e){say('导入失败：'+(e as Error).message);}};
 el('apply-import').onclick=async()=>{if(!pending)return;const state=pending,token=expected;cancel();try{await withSaveLock(()=>storage.write(state,token));location.reload();}catch(e){say('恢复 / 导入失败：'+(e as Error).message+'。原记录已保留。');render();}};
}
