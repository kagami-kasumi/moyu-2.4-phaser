"""Freeze independent FFDec XML/PNG evidence; never overwrite a frozen baseline."""
import runpy, pathlib, json, hashlib, shutil
m=runpy.run_path('tools/inspect-slice-xml.py')
out=pathlib.Path('docs/reverse-engineering/character-entry');out.mkdir(exist_ok=True)
fixture=out/'mage-fixture.json'
if fixture.exists(): raise RuntimeError('refuse overwrite frozen evidence')
data={'sourceSha256':'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9','timelines':{str(i):m['timeline'](i) for i in [2893,2917]},'selectors':{str(i):m['timeline'](3101)['frames'][i-1] for i in [1,2,5,6]},'labels':m['timeline'](3101)['labels'],'parent':m['timeline'](3106)['frames'][0][0], 'tags':{str(i):[dict(t.attrib) for t in m['chars'][i].find('subTags')] for i in [2893,2917]}}
fixture.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
b=out/'baseline';b.mkdir(exist_ok=True)
files=[]
for name,id,count in [('idle',2893,1),('run',2917,10)]:
 for f in range(1,count+1):
  p=pathlib.Path(f'local-resources/moyu/entry-021-reference/DefineSprite_{id}/{f}.png');dest=b/f'{name}-{f}.png';shutil.copyfile(p,dest)
  files.append({'file':dest.name,'spriteId':id,'frame':f,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
(b/'provenance.json').write_text(json.dumps({'tool':'FFDec 26.0.0 Java PNG sprite exporter','command':'ffdec-cli -onerror abort -selectid 2893,2917 -format sprite:png -export sprite local-resources/moyu/entry-021-reference 魔域2.4.swf','sourceSha256':data['sourceSha256'],'files':files},indent=2),encoding='utf8')
