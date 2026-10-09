"""Freeze selected FFDec XML and independent complete-sprite PNG baselines. Never overwrite."""
import runpy,json,pathlib,xml.etree.ElementTree as ET,hashlib,shutil
m=runpy.run_path('tools/inspect-slice-xml.py'); runtime=json.loads(pathlib.Path('public/assets/original-ui/manifest.json').read_text(encoding='utf8'))
# IDs/frame numbers select evidence only; all expected field values below come from FFDec XML.
chars={}
for x in m['tags']:
 if not x.get('type','').startswith('Define'):continue
 for key in ['spriteId','shapeId','characterID','buttonId','characterId']:
  if x.get(key): chars[int(x.get(key))]=x;break
out=pathlib.Path('docs/reverse-engineering/original-ui');out.mkdir(exist_ok=True)
def normalize(p):
 d={'depth':p['depth'],'characterId':int(p['characterId'])}
 if 'name' in p:d['name']=p['name']
 a=p.get('matrix',{});d['matrix']=[float(a.get('scaleX',1)) if a.get('hasScale')=='true' else 1,float(a.get('rotateSkew0',0)) if a.get('hasRotate')=='true' else 0,float(a.get('rotateSkew1',0)) if a.get('hasRotate')=='true' else 0,float(a.get('scaleY',1)) if a.get('hasScale')=='true' else 1,int(a.get('translateX',0))/20,int(a.get('translateY',0))/20]
 if 'colorTransform' in p:
  a=p['colorTransform'];d['color']={'mult':[int(a.get(k+'MultTerm',256)) if a.get('hasMultTerms')=='true' else 256 for k in ['red','green','blue','alpha']],'add':[int(a.get(k+'AddTerm',0)) if a.get('hasAddTerms')=='true' else 0 for k in ['red','green','blue','alpha']]}
 return d
fixture={'root':sorted([normalize(p) for p in m['timeline'](0)['frames'][8]],key=lambda x:x['depth']),'nodes':{},'actions':[]}
for key,n in runtime['nodes'].items():
 id=int(key);x=chars[id];d={'xml':ET.tostring(x,encoding='unicode')}
 if x.get('type')=='DefineSpriteTag':
  t=m['timeline'](id);d['frames']=[{'frame':f['frame'],'layers':sorted([normalize(p) for p in t['frames'][f['frame']-1]],key=lambda x:x['depth'])} for f in n['frames']]
 else:
  b=x.find('shapeBounds');b=x.find('bounds') if b is None else b;b=x.find('textBounds') if b is None else b
  if b is not None:d['bounds']=[int(b.get(k))/20 for k in ['Xmin','Ymin','Xmax','Ymax']]
 fixture['nodes'][key]=d
for id in [0,4591,4556,4603,2293,4536]:
 frame=1
 for x in m['tags'] if id==0 else chars[id].find('subTags'):
  if x.get('type')=='DoActionTag' and ((id==0 and frame==9) or (id==4536 and frame in [1,2]) or id not in [0,4536]):fixture['actions'].append({'id':id,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
  if x.get('type')=='ShowFrameTag':frame+=1
with (out/'source-fixture.json').open('x',encoding='utf8') as f:json.dump(fixture,f,ensure_ascii=False,indent=2)
baseline=out/'baseline';baseline.mkdir(exist_ok=True);provenance={}
for p in pathlib.Path('local-resources/moyu/original-ui/sprite-baseline-v2').glob('*/*.png'):
 id=p.parent.name.split('_')[1];name=id+'-'+p.name;target=baseline/name
 if target.exists():raise RuntimeError('Refusing to overwrite')
 shutil.copyfile(p,target);provenance[name]={'source':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
with (baseline/'provenance.json').open('x',encoding='utf8') as f:json.dump(provenance,f,ensure_ascii=False,indent=2)
print('Frozen',len(fixture['nodes']),'UI nodes and',len(provenance),'independent sprite images')
