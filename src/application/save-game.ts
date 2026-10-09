import {persistentState,type PersistentState} from '../content/persistence-schema.ts';
import {restorePreservedValue} from '../content/preserved-value.ts';
import {initialSource,updateSource} from './save-source.ts';
import {record,savedProgress,validateProgress} from './save-codec.ts';
import type {GameProgress} from './save-types.ts';

/** Merge data objects recursively so new versions' unowned fields survive a read/save.
 * Arrays are owned ordered containers; their items carry their own extra data. */
function merge(previous:unknown,current:unknown):unknown {
 if(!current||typeof current!=='object'||Array.isArray(current))return structuredClone(current);
 const output=previous&&typeof previous==='object'&&!Array.isArray(previous)?structuredClone(previous) as Record<string,unknown>:{};
 for(const [key,value]of Object.entries(current))Object.defineProperty(output,key,{value:merge(output[key],value),enumerable:true,writable:true,configurable:true});
 return output;
}
export function captureSave(progress:GameProgress,previous?:PersistentState):PersistentState {
 validateProgress(progress);
 const seed=previous?undefined:initialSource(progress);
 const raw=previous?record(restorePreservedValue(previous.source)):seed!.source;
 const extensions=previous?record(restorePreservedValue(previous.extensions)):{buildings:seed!.buildings,initialization:{evidence:'design',deferredSourceKeys:seed!.deferred,policy:'Unimplemented generated values remain undefined until their owning gameplay module exists; raw loaded values are never default-filled.'}};
 extensions.game=merge(extensions.game,progress);
 const source=updateSource(raw,progress);
 if(seed)record(extensions.initialization).deferredSourceKeys=seed.deferred.filter(key=>source[key]===undefined);
 return persistentState(source,extensions);
}
export {savedProgress};
