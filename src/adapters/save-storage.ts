import {decodeSave,encodeSave} from '../application/save-codec.ts';
import type {PersistentState} from '../content/persistence-schema.ts';
export const SAVE_KEY='moyu.progress.v1';
export interface StoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void}
export type SaveRead={kind:'empty';raw:null}|{kind:'valid';raw:string;state:PersistentState}|{kind:'invalid';raw:string;message:string}|{kind:'unavailable';message:string};
/** One setItem is the commit: Web Storage guarantees quota failures leave the old value intact. */
export class SaveStorage {
 constructor(private port:()=>StoragePort){}
 read():SaveRead {try{const raw=this.port().getItem(SAVE_KEY);if(raw===null)return {kind:'empty',raw};try{return {kind:'valid',raw,state:decodeSave(raw)};}catch(e){return {kind:'invalid',raw,message:(e as Error).message};}}catch{return {kind:'unavailable',message:'浏览器拒绝读取存档'};}}
 write(state:PersistentState,expected:string|null){
  const encoded=encodeSave(state),storage=this.port();
  if(storage.getItem(SAVE_KEY)!==expected)throw Error('存档已被其他页面修改，请返回菜单重新读取');
  storage.setItem(SAVE_KEY,encoded);return encoded;
 }
}
