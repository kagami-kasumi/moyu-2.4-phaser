"""Independent FFDec XML and source hash freeze for TASK-WORLD-066."""
import runpy,pathlib,json,hashlib,xml.etree.ElementTree as ET
m=runpy.run_path('tools/inspect-slice-xml.py');out=pathlib.Path('docs/reverse-engineering/kasano-finale');out.mkdir(exist_ok=True)
ids=[2815,4118,4247,4312]
d={'mapFrames':{str(n):m['timeline'](4536)['frames'][n-1] for n in [3,4]},'timelines':{str(i):m['timeline'](i) for i in ids},'npcChest':m['timeline'](4308)['frames'][22],'shapes':{str(i):ET.tostring(m['chars'][i],encoding='unicode') for i in [2814,4117,4236,4317,4263]},'actions':[],'hashes':[]}
for id in ids+[4536,2210,0]:
 frame=1
 for x in (m['tags'] if id==0 else m['chars'][id].find('subTags')):
  if x.get('type')=='DoActionTag' and ((id==4536 and frame in [1,3,4]) or(id==0 and frame==9)or id in ids+[2210]):d['actions'].append({'timeline':id,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':frame+=1
for folder,frames in [('DefineSprite_4536',[1,3,4]),('DefineSprite_2210_任务系统',[1]),('DefineSprite_4312',[1]),('DefineSprite_4247',[1]),('',[9])]:
 for n in frames:
  for kind,ext in [('as','as'),('pcode','pcode')]:
   for p in pathlib.Path(f'local-resources/moyu/source-index/{kind}/scripts/{folder}/frame_{n}').glob(f'*.{ext}'):
    d['hashes'].append({'path':p.as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
with (out/'source-fixture.json').open('x',encoding='utf8') as w:json.dump(d,w,ensure_ascii=False,indent=2)
