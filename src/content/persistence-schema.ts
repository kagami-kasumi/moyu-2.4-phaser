import type {PreservedValue} from './persistence-types.ts';
import {preserveValue, restorePreservedValue} from './preserved-value.ts';

/** Design: data envelope only. IO, untrusted input validation and migrations belong to SAVE-016/022. */
export interface PersistentState {
  schema: 'moyu-state';
  schemaVersion: 1;
  /** All concrete source keys, including keys unknown to this build. Never a filtered projection. */
  source: Extract<PreservedValue, {kind:'object'}>;
  /** Modern domain state absent from the legacy save: ground drops, pet deployment/life,
   * building needMainLevels, pending item ownership, future modules. */
  extensions: Extract<PreservedValue, {kind:'object'}>;
}

function record(value:Record<string,unknown>):Extract<PreservedValue,{kind:'object'}> {
  const encoded=preserveValue(value);
  if(encoded.kind!=='object')throw Error('Persistent state requires a plain record');
  return encoded;
}
export function persistentState(source:Record<string,unknown>,extensions:Record<string,unknown>={}):PersistentState {
  return {schema:'moyu-state',schemaVersion:1,source:record(source),extensions:record(extensions)};
}

export type PersistentEdit = {key:string;operation:'set';value:unknown}|{key:string;operation:'delete'};
/** Exact owned keys only; absence from a projection is never a deletion. Pure and atomic. */
export function editPersistentState(state:PersistentState,section:'source'|'extensions',ownedKeys:readonly string[],edits:readonly PersistentEdit[]):PersistentState {
  const owned=new Set(ownedKeys),seen=new Set<string>();
  for(const edit of edits){
    if(!owned.has(edit.key))throw Error('Unowned persistent key: '+edit.key);
    if(seen.has(edit.key))throw Error('Duplicate persistent edit: '+edit.key);
    seen.add(edit.key);
  }
  const entries=state[section].entries.map(entry=>({...entry}));
  for(const edit of edits){
    const index=entries.findIndex(entry=>entry.key===edit.key);
    if(edit.operation==='delete'){if(index>=0)entries.splice(index,1);}
    else {
      const entry={key:edit.key,value:preserveValue(edit.value)};
      if(index<0)entries.push(entry);else entries[index]=entry;
    }
  }
  return {...state,[section]:{kind:'object',entries}};
}

/** Corrected legacy constructor seed: source stores these independently. Never execute AS text. */
export const LEGACY_PET_FIELDS=['type','levels','rateLife','rateMinAttack','rateMaxAttack','rateDefense','zs','maxZs','element','titleNum','nowExp','maxExp','oldLevels','oldNowExp','oldMaxExp','rareFen','isGod','nowLifeLv','nextLvRate','sd','qyg'] as const;
export function legacyPetSeed(state:PersistentState,index:number):Record<string,unknown> {
  if(!Number.isSafeInteger(index)||index<0)throw Error('Invalid pet index');
  const seed:Record<string,unknown>={};
  for(const property of LEGACY_PET_FIELDS){
    const entry=state.source.entries.find(e=>e.key===`allHuanShou${index}${property}`);
    if(entry)Object.defineProperty(seed,property,{value:restorePreservedValue(entry.value),enumerable:true,writable:true,configurable:true});
  }
  return seed;
}
