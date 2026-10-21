"""Independent FFDec XML fixture for TASK-WORLD-064. Never overwrites evidence."""
import runpy,pathlib,json,hashlib,xml.etree.ElementTree as ET
m=runpy.run_path('tools/inspect-slice-xml.py')
out=pathlib.Path('docs/reverse-engineering/first-combat');out.mkdir(exist_ok=True)
ids=[2809,3101,3106,3147,4116,3126,3135,3146,2943,3031]
d={'timelines':{str(i):m['timeline'](i) for i in ids},'mapFrames':{'7':m['timeline'](4536)['frames'][6]},'shapes':{str(i):ET.tostring(m['chars'][i],encoding='unicode') for i in [2808,4321,3108,3109]},'actions':[]}
for id in ids+[4536]:
 frame=1
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag' and (id!=4536 or frame in [1,7,8]):d['actions'].append({'timeline':id,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':frame+=1
with (out/'source-fixture.json').open('x',encoding='utf8') as w:json.dump(d,w,ensure_ascii=False,indent=2)
