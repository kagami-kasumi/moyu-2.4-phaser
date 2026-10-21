import runpy, pathlib, json, hashlib
m=runpy.run_path('tools/inspect-slice-xml.py')
import xml.etree.ElementTree as ET
out=pathlib.Path('docs/reverse-engineering/palace');out.mkdir(exist_ok=True)
p=out/'source-fixture.json'
if p.exists(): raise RuntimeError('refuse overwrite')
ids=[2800,4331,4299,4301,4263,4267,4275]
d={'shapes':{str(i):ET.tostring(m['chars'][i],encoding='unicode') for i in ids},'timelines':{str(i):m['timeline'](i) for i in [2801]},'mapFrames':{'13':m['timeline'](4536)['frames'][12]},'npcFrames':{str(i):m['timeline'](4308)['frames'][i-1] for i in [22,28,33,55,56]},'npcLabels':{str(i):m['timeline'](4308)['labels'][i] for i in [22,28,33,55,56]},'actions':[]}
for id,frame in [(4536,13),(4312,1)]:
 f=1
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag' and f==frame:d['actions'].append({'timeline':id,'frame':f,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':f+=1
p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf8')
