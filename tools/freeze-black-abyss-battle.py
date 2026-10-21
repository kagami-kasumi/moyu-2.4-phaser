import pathlib,json,hashlib,runpy,xml.etree.ElementTree as ET

source=runpy.run_path('tools/inspect-slice-xml.py')
output=pathlib.Path('docs/reverse-engineering/black-abyss-battle')
output.mkdir(exist_ok=True)
timeline=source['timeline']
characters=source['chars']
families={}
ids={4247,4308,4312}
shapes={4255}
monster=timeline(4116)
for name in ['魔军士兵','魔军副将','魔军主将']:
    frame=next(number for number,label in monster['labels'].items() if label==name)
    parent=next(layer for layer in monster['frames'][frame-1] if layer.get('name')=='playAction')
    selector=int(parent['characterId'])
    families[name]={'parent':parent,'selector':selector}
    ids.add(selector)
    for layers in timeline(selector)['frames']:
        for layer in layers:
            identity=int(layer['characterId'])
            if characters[identity].get('type')=='DefineSpriteTag':
                ids.add(identity)
                for nested in timeline(identity)['frames']:
                    for leaf in nested:shapes.add(int(leaf['characterId']))
            else:shapes.add(identity)
frames=[95,142,144,146,148,150]
maps={str(number):timeline(4536)['frames'][number-1] for number in frames}
for layers in maps.values():
    for layer in layers:
        identity=int(layer['characterId'])
        if characters[identity].get('type','').startswith('DefineShape'):shapes.add(identity)
        elif layer.get('name')=='ground':
            ids.add(identity)
            for nested in timeline(identity)['frames']:
                for leaf in nested:shapes.add(int(leaf['characterId']))
fixture={'families':families,'maps':maps,'timelines':{str(identity):timeline(identity) for identity in sorted(ids)},'shapes':{str(identity):ET.tostring(characters[identity],encoding='unicode') for identity in sorted(shapes)},'actions':[],'hashes':[],'sources':{}}
for identity in ids|{4536,2210}:
    number=1
    for tag in characters[identity].find('subTags'):
        if tag.get('type')=='DoActionTag' and (identity!=4536 or number in [1,2]+frames):fixture['actions'].append({'timeline':identity,'frame':number,'sha256':hashlib.sha256(bytes.fromhex(tag.get('actionBytes'))).hexdigest()})
        if tag.get('type')=='ShowFrameTag':number+=1
files=['__Packages/RoleMC','frame_9/DoAction_2','__Packages/MonsterMC','DefineSprite_2210_任务系统/frame_1/DoAction','DefineSprite_2210_任务系统/frame_1/DoAction_2','frame_9/DoAction']+[f'DefineSprite_4536/frame_{number}/DoAction' for number in [1,2]+frames]
for identity in ids:
    for path in pathlib.Path(f'local-resources/moyu/source-index/as/scripts/DefineSprite_{identity}').glob('frame_*/*.as'):files.append(path.relative_to('local-resources/moyu/source-index/as/scripts').with_suffix('').as_posix())
for name in sorted(set(files)):
    for kind in ['as','pcode']:
        path=pathlib.Path('local-resources/moyu/source-index')/kind/'scripts'/f'{name}.{kind}'
        if path.exists():
            fixture['hashes'].append({'path':path.as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
            if kind=='as':fixture['sources'][name]=path.read_text(encoding='utf8')
with(output/'source-fixture.json').open('w',encoding='utf8')as stream:json.dump(fixture,stream,ensure_ascii=False,indent=2)
print(json.dumps({'families':families,'timelines':sorted(ids),'shapes':sorted(shapes)},ensure_ascii=False))


