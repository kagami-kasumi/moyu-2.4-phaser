import pathlib,json,hashlib,runpy,xml.etree.ElementTree as ET
m=runpy.run_path('tools/inspect-slice-xml.py');out=pathlib.Path('docs/reverse-engineering/kasano-mirage');out.mkdir(exist_ok=True)
d={'map':m['timeline'](4536)['frames'][10],'timelines':{str(i):m['timeline'](i) for i in [2803,4247,3188]},'shapes':{str(i):ET.tostring(m['chars'][i],encoding='unicode') for i in [2802,4328]},'actions':[],'sources':{},'hashes':[]}
for id in [4536,2803,4247,3188]:
 frame=1
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag' and (id!=4536 or frame in [1,2,10,11]):d['actions'].append({'timeline':id,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':frame+=1
for name in ['DefineSprite_4536/frame_1/DoAction','DefineSprite_4536/frame_2/DoAction','DefineSprite_4536/frame_10/DoAction','DefineSprite_4536/frame_11/DoAction','DefineSprite_4247/frame_1/DoAction','DefineSprite_4253/frame_1/DoAction','__Packages/MonsterMC','frame_9/DoAction']:
 for kind in ['as','pcode']:
  p=pathlib.Path('local-resources/moyu/source-index')/kind/'scripts'/f'{name}.{kind}'
  if p.exists():
   d['hashes'].append({'path':p.as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
   if kind=='as':d['sources'][name]=p.read_text(encoding='utf8')
with(out/'source-fixture.json').open('x',encoding='utf8')as w:json.dump(d,w,ensure_ascii=False,indent=2)
