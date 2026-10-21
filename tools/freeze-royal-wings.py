import runpy,pathlib,json,hashlib,xml.etree.ElementTree as ET
m=runpy.run_path('tools/inspect-slice-xml.py');out=pathlib.Path('docs/reverse-engineering/royal-wings');out.mkdir(exist_ok=True);ids=[2798,2796,2794,2792,4333,4335,4337,4339,4297,4301,4263]
d={'shapes':{str(i):ET.tostring(m['chars'][i],encoding='unicode') for i in ids},'timelines':{str(i):m['timeline'](i) for i in [2799,2797,2795,2793]},'mapFrames':{str(f):m['timeline'](4536)['frames'][f-1] for f in [13,14,15,16,17]},'npcFrames':{str(i):m['timeline'](4308)['frames'][i-1] for i in [23,24,54,56]},'npcLabels':{str(i):m['timeline'](4308)['labels'][i] for i in [23,24,54,56]},'actions':[]}
for id,frame in [(4536,n) for n in [14,15,16,17]]+[(4312,1)]:
 f=1
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag' and f==frame:d['actions'].append({'timeline':id,'frame':f,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':f+=1
p=out/'source-fixture.json'
with p.open('x',encoding='utf8') as w:json.dump(d,w,ensure_ascii=False,indent=2)
