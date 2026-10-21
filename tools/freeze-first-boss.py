"""Independent additional source evidence; existing first-combat fixtures stay intact."""
import runpy,pathlib,json,hashlib
m=runpy.run_path('tools/inspect-slice-xml.py');out=pathlib.Path('docs/reverse-engineering/first-combat')
ids=[3188,3167,3178,3187,2874,2878,2881,4581]
d={'timelines':{str(i):m['timeline'](i) for i in ids},'actions':[]}
for id in ids:
 frame=1
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag':d['actions'].append({'timeline':id,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':frame+=1
with (out/'boss-fixture.json').open('x',encoding='utf8') as w:json.dump(d,w,ensure_ascii=False,indent=2)
