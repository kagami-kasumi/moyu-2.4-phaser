import pathlib,json,hashlib,runpy,xml.etree.ElementTree as ET

source=runpy.run_path('tools/inspect-slice-xml.py')
output=pathlib.Path('docs/reverse-engineering/south-city')
output.mkdir(exist_ok=True)
timeline=source['timeline']
characters=source['chars']
monster=timeline(4116)
frame=next(number for number,label in monster['labels'].items() if label=='炎女')
parent=next(layer for layer in monster['frames'][frame-1] if layer.get('name')=='playAction')
selector=int(parent['characterId'])
ids={selector,4247,4308,4312}
shapes={4255,4269,4259,4279,4287,4273,4281}
for layers in timeline(selector)['frames']:
    for layer in layers:
        identity=int(layer['characterId'])
        if characters[identity].get('type')=='DefineSpriteTag':
            ids.add(identity)
            for nested in timeline(identity)['frames']:
                for leaf in nested:shapes.add(int(leaf['characterId']))
        else:shapes.add(identity)
maps={str(number):timeline(4536)['frames'][number-1] for number in [64,65,66]}
for layers in maps.values():
    for layer in layers:
        identity=int(layer['characterId'])
        if characters[identity].get('type','').startswith('DefineShape'):shapes.add(identity)
        elif layer.get('name')=='ground':
            ids.add(identity)
            for nested in timeline(identity)['frames']:
                for leaf in nested:shapes.add(int(leaf['characterId']))
fixture={'parent':parent,'selector':selector,'maps':maps,'timelines':{str(identity):timeline(identity) for identity in sorted(ids)},'shapes':{str(identity):ET.tostring(characters[identity],encoding='unicode') for identity in sorted(shapes)},'actions':[],'hashes':[],'sources':{}}
for identity in ids|{4536,2210}:
    number=1
    for tag in characters[identity].find('subTags'):
        if tag.get('type')=='DoActionTag' and (identity!=4536 or number in [1,64,65,66]):fixture['actions'].append({'timeline':identity,'frame':number,'sha256':hashlib.sha256(bytes.fromhex(tag.get('actionBytes'))).hexdigest()})
        if tag.get('type')=='ShowFrameTag':number+=1
files=['__Packages/RoleMC','frame_9/DoAction_2','__Packages/MonsterMC','DefineSprite_2210_任务系统/frame_1/DoAction','DefineSprite_2210_任务系统/frame_1/DoAction_2','frame_9/DoAction']+[f'DefineSprite_4536/frame_{number}/DoAction' for number in [1,2,64,65,66]]
for identity in ids:
    for path in pathlib.Path(f'local-resources/moyu/source-index/as/scripts/DefineSprite_{identity}').glob('frame_*/*.as'):files.append(path.relative_to('local-resources/moyu/source-index/as/scripts').with_suffix('').as_posix())
for name in sorted(set(files)):
    for kind in ['as','pcode']:
        path=pathlib.Path('local-resources/moyu/source-index')/kind/'scripts'/f'{name}.{kind}'
        if path.exists():
            fixture['hashes'].append({'path':path.as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
            if kind=='as':fixture['sources'][name]=path.read_text(encoding='utf8')
with(output/'source-fixture.json').open('w',encoding='utf8')as stream:json.dump(fixture,stream,ensure_ascii=False,indent=2)
print(json.dumps({'selector':selector,'timelines':sorted(ids),'shapes':sorted(shapes)}))


