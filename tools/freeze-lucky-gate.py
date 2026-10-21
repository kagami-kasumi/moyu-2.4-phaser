import pathlib,json,hashlib,runpy,xml.etree.ElementTree as ET
m=runpy.run_path('tools/inspect-slice-xml.py');out=pathlib.Path('docs/reverse-engineering/lucky-gate');out.mkdir(exist_ok=True)
names=['鹿角兽','龙怪','骑士亡魂','巨猿','守卫魔','绿魔精','恐兽','提风','四牙怪','巨杰士','暗黑格拉斯','机关兽'];t=m['timeline'](4116);ids={2807,4247,4312,4116};families={};shapes={2806,4343}
for name in names:
 n=next(int(k) for k,v in t['labels'].items() if v==name);parent=next(p for p in t['frames'][n-1] if p.get('name')=='playAction');sid=int(parent['characterId']);ids.add(sid);a=m['timeline'](sid);animations={}
 for frame in a['frames'][:6]:
  for layer in frame:
   id=int(layer['characterId'])
   if m['chars'][id].get('type')=='DefineSpriteTag':
    ids.add(id);animations[str(id)]=m['timeline'](id)
    for frame2 in animations[str(id)]['frames']:
     for leaf in frame2:shapes.add(int(leaf['characterId']))
   else:shapes.add(id)
 families[name]={'parent':parent,'selector':sid,'animations':animations}
d={'families':families,'timelines':{str(i):m['timeline'](i) for i in ids},'map':m['timeline'](4536)['frames'][161],'shapes':{str(i):ET.tostring(m['chars'][i],encoding='unicode') for i in shapes},'actions':[],'hashes':[],'sources':{}}
for id in ids|{4536}:
 frame=1
 for x in m['chars'][id].find('subTags'):
  if x.get('type')=='DoActionTag' and (id!=4536 or frame in [1,162]):d['actions'].append({'timeline':id,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':frame+=1
files=['__Packages/MonsterMC','DefineSprite_4536/frame_1/DoAction','DefineSprite_4536/frame_162/DoAction','DefineSprite_4312/frame_1/DoAction','frame_9/DoAction']
for id in ids:
 for p in pathlib.Path(f'local-resources/moyu/source-index/as/scripts/DefineSprite_{id}').glob('frame_*/*.as'):files.append(str(p.relative_to('local-resources/moyu/source-index/as/scripts').with_suffix('')).replace('\\','/'))
for name in set(files):
 for kind in ['as','pcode']:
  p=pathlib.Path('local-resources/moyu/source-index')/kind/'scripts'/f'{name}.{kind}'
  if p.exists():
   d['hashes'].append({'path':p.as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
   if kind=='as':d['sources'][name]=p.read_text(encoding='utf8')
with (out/'source-fixture.json').open('x',encoding='utf8') as w:json.dump(d,w,ensure_ascii=False,indent=2)
print(','.join(map(str,sorted(shapes))))
