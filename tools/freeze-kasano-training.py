"""Independent read-only FFDec evidence, TASK-WORLD-065. Exclusive output."""
import runpy,pathlib,json,hashlib,xml.etree.ElementTree as ET
m=runpy.run_path('tools/inspect-slice-xml.py')
out=pathlib.Path('docs/reverse-engineering/kasano-training');out.mkdir(exist_ok=True)
d={'mapFrames':{str(n):m['timeline'](4536)['frames'][n-1] for n in [5,6]},'shapes':{str(i):ET.tostring(m['chars'][i],encoding='unicode') for i in [2811,2813,4318,4320]},'actions':[],'hashes':[]}
for id in [4536,2210]:
 frame=1
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag' and (id==2210 or frame in [1,5,6]):d['actions'].append({'timeline':id,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':frame+=1
for folder,frames in [('DefineSprite_4536',[1,5,6]),('DefineSprite_2210_任务系统',[1])]:
 for n in frames:
  for kind,ext in [('as','as'),('pcode','pcode')]:
   for p in pathlib.Path(f'local-resources/moyu/source-index/{kind}/scripts/{folder}/frame_{n}').glob(f'*.{ext}'):
    d['hashes'].append({'path':p.as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
with (out/'source-fixture.json').open('x',encoding='utf8') as w:json.dump(d,w,ensure_ascii=False,indent=2)
