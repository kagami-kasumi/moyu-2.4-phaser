"""Freeze independently exported AVM1 sources; originals stay read only."""
import pathlib,json,hashlib,runpy
m=runpy.run_path('tools/inspect-slice-xml.py')
out=pathlib.Path('docs/reverse-engineering/marshal-quests');out.mkdir(exist_ok=True)
files=['DefineSprite_4312/frame_1/DoAction','DefineSprite_2210_任务系统/frame_1/DoAction','DefineSprite_2210_任务系统/frame_1/DoAction_2','__Packages/RoleMC','frame_9/DoAction']
d={'sources':{},'hashes':[],'actions':[]}
for name in files:
 for kind in ['as','pcode']:
  p=pathlib.Path('local-resources/moyu/source-index')/kind/'scripts'/f'{name}.{kind}'
  if p.exists():
   d['hashes'].append({'path':p.as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
   if kind=='as':d['sources'][name]=p.read_text(encoding='utf8')
for id in [4312,2210]:
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag':d['actions'].append({'timeline':id,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
with (out/'source-fixture.json').open('x',encoding='utf8') as w:json.dump(d,w,ensure_ascii=False,indent=2)
