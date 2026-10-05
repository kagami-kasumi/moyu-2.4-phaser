import runpy, pathlib, json, hashlib, xml.etree.ElementTree as ET, shutil
m=runpy.run_path('tools/inspect-slice-xml.py'); chars=m['chars']; timeline=m['timeline']
out=pathlib.Path('docs/reverse-engineering/first-slice'); out.mkdir(exist_ok=True)
ids=[2804,2806,4323,4326,4238,4240,4242,4257,4259,4269,4281,4295,4305,4307,4244,4245]
fixture={'sourceSha256':'f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9','shapes':{str(i):ET.tostring(chars[i],encoding='unicode') for i in ids},'timelines':{str(i):timeline(i) for i in [2805,2807,4247,4246,4243,4312]},'mapFrames':{str(f):timeline(4536)['frames'][f-1] for f in [8,9]},'rootMap':next(p for p in timeline(0)['frames'][8] if p.get('name')=='map'),'npcFrames':{str(f):timeline(4308)['frames'][f-1] for f in [9,18,29,43,53,58,59]}}
actions=[]
for i,frames in [(0,[3,4,5,9]),(4536,[1,2,8,9]),(4247,[1])]:
 f=1
 for x in (m['tags'] if i==0 else chars[i].find('subTags')):
  if x.get('type')=='DoActionTag' and f in frames: actions.append({'timeline':i,'frame':f,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag': f+=1
fixture['actions']=actions
p=out/'source-fixture.json'
if p.exists(): raise RuntimeError('refuse overwrite frozen fixture')
p.write_text(json.dumps(fixture,ensure_ascii=False,indent=2),encoding='utf-8')
b=out/'baseline';b.mkdir(exist_ok=True)
for i in ids:
 p=pathlib.Path(f'local-resources/moyu/first-slice-shape-png/{i}.png')
 if p.exists(): shutil.copyfile(p,b/f'{i}.png')
print('frozen XML and',len(list(b.glob('*.png'))),'PNG baselines')
