import {SaveStorage,SAVE_KEY,type StoragePort,type SaveRead} from './save-storage.ts';
import {decodeSave,encodeSave,MAX_SAVE_SIZE} from '../application/save-codec.ts';
import type {PersistentState} from '../content/persistence-schema.ts';

export const VAULT_KEY='moyu.progress.vault.v2';
export const BACKUP_LIMIT=3;
interface Backup {raw:string;at:string;kind:'自动'|'手动'|'迁移前'}
interface Vault {format:'moyu-vault';version:2;current:string|null;backups:Backup[]}
const empty=():Vault=>({format:'moyu-vault',version:2,current:null,backups:[]});
/** Design: one atomic setItem commits both progress and its bounded history.
 * Legacy v1 is read-only; migration happens only on an explicit successful write. */
export class RecoveryStorage {
 constructor(private port:()=>StoragePort){}
 private load():Vault {
  const storage=this.port(),text=storage.getItem(VAULT_KEY);
  if(text===null)return {...empty(),current:storage.getItem(SAVE_KEY)};
  if(text.length>MAX_SAVE_SIZE*5)throw Error('存档库超过容量限制');
  let v:Vault;
  try{v=JSON.parse(text) as Vault;}catch{
   // A truncated container can be replaced only after the UI confirms a validated
   // import/recovery. Retain its exact bytes as the conflict token until then.
   const legacy=storage.getItem(SAVE_KEY),backups:Backup[]=[];
   if(legacy!==null){try{decodeSave(legacy);backups.push({raw:legacy,at:'',kind:'迁移前'});}catch{/* No usable legacy copy. */}}
   return {...empty(),current:text,backups};
  }
  if(!v||v.format!=='moyu-vault'||v.version!==2)throw Error('存档库版本不支持，原记录已保留');
  if(!(v.current===null||typeof v.current==='string')||!Array.isArray(v.backups)||v.backups.length>BACKUP_LIMIT)throw Error('存档库结构损坏');
  for(const b of v.backups)if(!b||typeof b.raw!=='string'||typeof b.at!=='string'||!['自动','手动','迁移前'].includes(b.kind))throw Error('备份目录损坏');
  return v;
 }
 read():SaveRead {
  try {const v=this.load();return new SaveStorage(()=>({getItem:()=>v.current,setItem:()=>{throw Error('只读');}})).read();}
  catch(e){return {kind:'unavailable',message:(e as Error).name==='SecurityError'?'浏览器拒绝读取存档':'无法读取存档库：'+(e as Error).message};}
 }
 backups():Backup[]{return this.load().backups.filter(b=>{try{decodeSave(b.raw);return true;}catch{return false;}});}
 private add(v:Vault,raw:string,kind:Backup['kind']){
  decodeSave(raw);v.backups=[{raw,kind,at:new Date().toISOString()},...v.backups.filter(b=>b.raw!==raw)].slice(0,BACKUP_LIMIT);
 }
 write(state:PersistentState,expected:string|null):string {
  const encoded=encodeSave(state),v=this.load();
  if(v.current!==expected)throw Error('存档已被其他页面修改，请返回菜单重新读取');
  if(v.current!==null&&v.current!==encoded){try{decodeSave(v.current);this.add(v,v.current,'自动');}catch{/* Invalid primary never displaces a valid backup. */}}
  v.current=encoded;this.port().setItem(VAULT_KEY,JSON.stringify(v));return encoded;
 }
 backup(expected:string|null){
  const v=this.load();if(v.current!==expected)throw Error('存档已被其他页面修改，请重新读取');
  if(v.current===null)throw Error('请先保存进度');this.add(v,v.current,'手动');this.port().setItem(VAULT_KEY,JSON.stringify(v));
 }
 removeBackup(raw:string){const v=this.load();v.backups=v.backups.filter(b=>b.raw!==raw);this.port().setItem(VAULT_KEY,JSON.stringify(v));}
}

/** Every browser mutation uses the same origin-scoped lock, including imports and backups.
 * Fail closed where Web Locks is unavailable instead of claiming cross-page safety. */
export function withSaveLock<T>(action:()=>T):Promise<T>{
 if(!navigator.locks)return Promise.reject(Error('当前浏览器不支持安全存档锁，请使用新版浏览器'));
 return navigator.locks.request('moyu-save-v2',action);
}
