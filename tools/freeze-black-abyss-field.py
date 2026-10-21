"""Freeze independent FFDec XML and AS/P-code inputs for task 090."""
import pathlib,json,hashlib,runpy,xml.etree.ElementTree as ET
s=runpy.run_path('tools/inspect-slice-xml.py');timeline=s['timeline'];chars=s['chars']
out=pathlib.Path('docs/reverse-engineering/black-abyss-field');out.mkdir(exist_ok=True)
maps={str(n):timeline(4536)['frames'][n-1] for n in [96,97,98]}
ids={4247,4308,4312};shapes=set();families={}
for name in ['巨杰士','暗黑格拉斯']:
 m=timeline(4116);n=next(k for k,v in m['labels'].items() if v==name);parent=next(p for p in m['frames'][n-1] if p.get('name')=='playAction');selector=int(parent['characterId']);ids.add(selector);families[name]={'parent':parent,'selector':selector}
 for layers in timeline(selector)['frames'][:8]:
  for p in layers:
   identity=int(p['characterId'])
   if chars[identity].get('type')=='DefineSpriteTag':
    ids.add(identity)
    for nested in timeline(identity)['frames']:
     for leaf in nested:shapes.add(int(leaf['characterId']))
   else:shapes.add(identity)
for layers in maps.values():
 for p in layers:
  identity=int(p['characterId'])
  if chars[identity].get('type','').startswith('DefineShape'):shapes.add(identity)
  elif p.get('name')=='ground':
   ids.add(identity)
   for nested in timeline(identity)['frames']:
    for leaf in nested:shapes.add(int(leaf['characterId']))
shapes|={4263,4273,4287,4281}
f={'maps':maps,'families':families,'timelines':{str(n):timeline(n) for n in sorted(ids)},'shapes':{str(n):ET.tostring(chars[n],encoding='unicode') for n in sorted(shapes)},'actions':[],'hashes':[],'sources':{}}
for identity in ids|{4536,2210}:
 frame=1
 for tag in chars[identity].find('subTags'):
  if tag.get('type')=='DoActionTag' and (identity!=4536 or frame in [1,96,97,98]):f['actions'].append({'timeline':identity,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(tag.get('actionBytes'))).hexdigest()})
  if tag.get('type')=='ShowFrameTag':frame+=1
root=pathlib.Path('local-resources/moyu/source-index')
files=['DefineSprite_4581/frame_1/DoAction','__Packages/RoleMC','__Packages/MonsterMC','frame_9/DoAction','frame_9/DoAction_2','DefineSprite_2210_任务系统/frame_1/DoAction','DefineSprite_2210_任务系统/frame_1/DoAction_2']+[f'DefineSprite_4536/frame_{n}/DoAction' for n in [1,2,96,97,98]]
for identity in ids:
 for p in (root/'as/scripts'/f'DefineSprite_{identity}').glob('frame_*/*.as'):files.append(p.relative_to(root/'as/scripts').with_suffix('').as_posix())
for name in sorted(set(files)):
 for kind in ['as','pcode']:
  p=root/kind/'scripts'/f'{name}.{kind}'
  if p.exists():
   f['hashes'].append({'path':p.as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
   if kind=='as':f['sources'][name]=p.read_text(encoding='utf8')
(out/'source-fixture.json').write_text(json.dumps(f,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'shapes':sorted(shapes),'count':len(shapes)}))

