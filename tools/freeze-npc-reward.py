"""One-time independent FFDec XML fixture. Never overwrites expected."""
import runpy, json, pathlib, hashlib, xml.etree.ElementTree as ET
m = runpy.run_path('tools/inspect-slice-xml.py')
t, chars = m['timeline'], m['chars']
out = pathlib.Path('docs/reverse-engineering/npc-reward'); out.mkdir(exist_ok=True)
names = ['英雄令','富豪礼包','灵魂礼包','英勇','莎菲','雪瑞','圣天使雷斯','圣天使奈丽','新手戒指','上品1级战士武器','良品1级战士衣服','良品1级战士头盔','良品1级战士鞋']
icons = {}
for sprite, wanted in [(2047,names),(2292,['老兵','男战士']),(2477,['凯恩'])]:
    v=t(sprite)
    for frame,label in v['labels'].items():
        if label in wanted:
            layers=v['frames'][frame-1]
            assert len(layers)==1
            icons[label]={'sprite':sprite,'frame':frame,'layer':layers[0]}
assert set(names+['老兵','男战士','凯恩'])==set(icons), set(names)-set(icons)
ids=sorted({int(x['layer']['characterId']) for x in icons.values()})
f={'icons':icons,'shapes':{str(i):ET.tostring(chars[i],encoding='unicode') for i in ids},
   'panels':{str(i):t(i) for i in [2293,2074,2482,2049,2479,2217]},
   'rootPanels':[p for p in t(0)['frames'][8] if p.get('name') in ['talking','backPack','huanShou']], 'actions':[]}
for i,frames in [(0,[9]),(4312,[1]),(4536,[1,2]),(2293,[1]),(2217,[1]),(2049,[1]),(4253,[1])]:
    frame=1
    for x in m['tags'] if i==0 else chars[i].find('subTags'):
        if x.get('type')=='DoActionTag' and frame in frames:
            f['actions'].append({'timeline':i,'frame':frame,'sha256':hashlib.sha256(bytes.fromhex(x.get('actionBytes'))).hexdigest()})
        if x.get('type')=='ShowFrameTag':frame+=1
with (out/'source-fixture.json').open('x',encoding='utf-8') as file:json.dump(f,file,ensure_ascii=False,indent=2)
print(','.join(map(str,ids)))
