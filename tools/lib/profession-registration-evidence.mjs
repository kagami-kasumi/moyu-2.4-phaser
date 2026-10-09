import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {source,timeline} from './first-slice.mjs';
export function verifyProfessionRegistrations(definitions){
 const frames=timeline(source(),0),verified=[];
 const records=definitions.filter(d=>d.kind==='profession');assert.equal(records.length,2);
 for(const [frame,name] of [[5,'战士'],[6,'法师']]){
  assert.equal(frames[frame-1].label,name+'信息');
  const file=`frame_${frame}/DoAction.as`,text=fs.readFileSync('local-resources/moyu/source-index/as/scripts/'+file,'utf8');
  const jumps=[],context={inputName:{},selectBtn:{},reSelectBtn:{},stop(){},play(){},gotoAndStop(label){jumps.push(label);},Selection:{setFocus(){},setSelection(){}}};
  vm.runInNewContext(text,context,{timeout:1000});
  assert.equal(context.inputName.text,'玩家');assert.equal(context.inputName.maxChars,10);
  context.inputName.text='';context.selectBtn.onRelease();assert.deepEqual(jumps,[]);assert.equal(context.beginName,undefined);
  context.inputName.text='测试姓名';context.selectBtn.onRelease();assert.equal(context.beginName,'测试姓名');assert.equal(context.begingVocational,name);assert.deepEqual(jumps,['游戏']);
  context.reSelectBtn.onRelease();assert.deepEqual(jumps,['游戏','选择角色']);
  const record=records.find(r=>r.id==='profession:'+name);assert.ok(record,'Missing profession '+name);
  assert.equal(record.name,name);assert.deepEqual(record.data,{informationFrame:frame});
  assert.deepEqual(record.source,[{file,line:text.slice(0,text.indexOf(`begingVocational = "${name}"`)).split('\n').length}]);
  verified.push(record.id);
 }
 return verified;
}
