import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RecoveryStorage,VAULT_KEY,BACKUP_LIMIT} from '../src/adapters/save-recovery.ts';
import {SAVE_KEY} from '../src/adapters/save-storage.ts';
import {decodeSave,encodeSave,savedProgress} from '../src/application/save-codec.ts';
import {captureSave} from '../src/application/save-game.ts';
import {persistentState} from '../src/content/persistence-schema.ts';
import {restorePreservedValue} from '../src/content/preserved-value.ts';
import {registryData} from '../src/content/registry-data.ts';
import {persistenceFields} from '../src/content/persistence-registry-data.ts';
import {concreteKey} from '../src/application/save-source.ts';
const fixture=(name='warrior')=>fs.readFileSync(`tests/fixtures/save-recovery/${name}-v1.json`,'utf8');
function setup(raw:string|null=fixture()){
 const data=new Map<string,string>();if(raw!==null)data.set(SAVE_KEY,raw);
 let failure='',writes=0;
 const port={getItem:(k:string)=>{if(failure==='read')throw Error('SecurityError');return data.get(k)??null;},setItem:(k:string,v:string)=>{if(failure)throw Error(failure);writes++;data.set(k,v);}};
 return {data,store:new RecoveryStorage(()=>port),get writes(){return writes;},fail:(s:string)=>failure=s};
}
for(const name of ['warrior','mage'])test(`${name}: genuine modern v1 migrates on explicit commit, full progress and legacy remain intact`,()=>{
 const raw=fixture(name),s=setup(raw),state=decodeSave(raw);
 assert.deepEqual(s.store.read(),{kind:'valid',raw,state});assert.equal(s.writes,0);
 assert.equal(s.store.write(state,raw),raw);assert.equal(s.writes,1);assert.equal(s.data.get(SAVE_KEY),raw);
 const vault=JSON.parse(s.data.get(VAULT_KEY)!);assert.equal(vault.version,2);assert.equal(vault.current,raw);
 assert.deepEqual(s.store.read(),{kind:'valid',raw,state});s.store.backup(raw);assert.equal(s.store.backups()[0]!.raw,raw);
 // Damage only the current record, leaving the independently validated backup recoverable.
 vault.backups=s.store.backups();vault.current=raw.slice(0,77);s.data.set(VAULT_KEY,JSON.stringify(vault));
 assert.equal(s.store.read().kind,'invalid');const restored=decodeSave(s.store.backups()[0]!.raw);s.store.write(restored,vault.current);
 assert.deepEqual(savedProgress(restored),savedProgress(state));assert.equal(s.store.backups().length,1);
});
test('backup rotation is bounded, deduplicated and atomic with the new current record',()=>{
 const s=setup(),state=decodeSave(fixture());let token=fixture();const history=[];
 for(let n=0;n<5;n++){history.push(token);const progress=savedProgress(state);progress.name='版本'+n;progress.initialState.name=progress.name;token=s.store.write(captureSave(progress,state),token);}
 assert.equal(s.writes,5);assert.equal(s.store.backups().length,BACKUP_LIMIT);
 assert.deepEqual(s.store.backups().map(b=>b.raw),history.reverse().slice(0,3));
 s.store.backup(token);s.store.backup(token);assert.equal(s.store.backups().filter(b=>b.raw===token).length,1);
});
test('quota, denied writes/reads, stale tokens and unknown vault versions cannot change any persisted bytes',()=>{
 for(const failure of ['QuotaExceededError','SecurityError','read']){
  const s=setup();s.store.backup(fixture());const before=[...s.data];s.fail(failure);
  assert.throws(()=>s.store.write(decodeSave(fixture('mage')),fixture()));assert.throws(()=>s.store.backup(fixture()));assert.deepEqual([...s.data],before);
 }
 const s=setup();s.store.write(decodeSave(fixture('mage')),fixture());const before=[...s.data];
 assert.throws(()=>s.store.write(decodeSave(fixture()),fixture()),/其他页面/);assert.deepEqual([...s.data],before);
 const vault=JSON.parse(s.data.get(VAULT_KEY)!);vault.version=99;s.data.set(VAULT_KEY,JSON.stringify(vault));const unknown=[...s.data];
 assert.equal(s.store.read().kind,'unavailable');assert.throws(()=>s.store.write(decodeSave(fixture()),null),/版本/);assert.deepEqual([...s.data],unknown);
});
test('invalid fields, references, truncated files and future schema versions reject without writing',()=>{
 const s=setup();const before=[...s.data];const valid=fixture();
 for(const raw of [valid.slice(0,99),valid.replace('"schemaVersion":1','"schemaVersion":9'),valid.replace('"value":"outskirts"','"value":"missing"'),valid.replaceAll('"value":"战士"','"value":"其他"')]){
  assert.throws(()=>s.store.write(decodeSave(raw),valid));assert.deepEqual([...s.data],before);assert.equal(s.writes,0);
 }
});
test('migration and backup restoration preserve all 653 field templates, 911 payloads and future extensions',()=>{
 const initial=decodeSave(fixture()),source=restorePreservedValue(initial.source) as Record<string,unknown>;
 for(const field of persistenceFields){const key=typeof field.key==='string'?field.key:concreteKey(field.key.expression,2,1);source[key]={future:[,undefined,-0,NaN],id:field.id};}
 const extensions=restorePreservedValue(initial.extensions) as Record<string,unknown>;
 extensions.records=registryData.definitions.map(d=>({id:d.id,payload:d.data}));extensions.future={list:[,Infinity,-Infinity]};
 const state=persistentState(source,extensions),raw=encodeSave(state),s=setup(raw);assert.equal(persistenceFields.length,653);assert.equal(registryData.definitions.length,911);
 s.store.backup(raw);s.store.write(decodeSave(fixture('mage')),raw);const backup=s.store.backups().find(b=>b.raw===raw)!;
 s.store.write(decodeSave(backup.raw),fixture('mage'));const restored=s.store.read();assert.equal(restored.kind,'valid');if(restored.kind==='valid')assert.deepEqual(restored.state,state);
});
test('truncated vault remains byte-exact until confirmed recovery; pre-migration record remains discoverable',()=>{
 const s=setup();s.data.set(VAULT_KEY,'{"format":"moyu-vault"');
 assert.equal(s.store.read().kind,'invalid');assert.equal(s.store.backups()[0]!.kind,'迁移前');assert.equal(s.writes,0);
 s.store.write(decodeSave(fixture()),'{"format":"moyu-vault"');assert.equal(s.store.read().kind,'valid');assert.equal(s.data.get(SAVE_KEY),fixture());
});
test('backup removal changes no progress and storage failure retains the full backup',()=>{
 const s=setup();s.store.backup(fixture());const before=[...s.data];s.fail('QuotaExceededError');assert.throws(()=>s.store.removeBackup(fixture()));assert.deepEqual([...s.data],before);
 s.fail('');s.store.removeBackup(fixture());assert.equal(s.store.backups().length,0);assert.equal(s.store.read().kind,'valid');
});
