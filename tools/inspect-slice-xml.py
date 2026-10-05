"""Bounded read-only FFDec XML inspection; no source mutation."""
import xml.etree.ElementTree as ET
import json, sys

root = ET.parse('local-resources/moyu/source-index/source.xml').getroot()
tags = root.find('tags')
chars = {int(x.get('spriteId', x.get('shapeId', x.get('characterID', '-1')))): x for x in tags if x.get('type', '').startswith('Define')}

def timeline(id):
    display, frames, labels = {}, [], {}
    for x in (tags if id == 0 else chars[id].find('subTags')):
        kind, depth = x.get('type'), x.get('depth')
        if kind == 'PlaceObject2Tag':
            p = dict(display.get(depth, {})) if x.get('placeFlagMove') == 'true' else {}
            p['depth'] = int(depth)
            for a, flag in [('characterId','Character'), ('name','Name'), ('ratio','Ratio')]:
                if x.get('placeFlagHas'+flag) == 'true': p[a] = x.get(a)
            for c in x:
                if x.get('placeFlagHas'+c.tag[0].upper()+c.tag[1:]) == 'true': p[c.tag] = dict(c.attrib)
            display[depth] = p
        elif kind == 'RemoveObject2Tag': display.pop(depth, None)
        elif kind == 'FrameLabelTag': labels[len(frames)+1] = x.get('name')
        elif kind == 'ShowFrameTag': frames.append(list(display.values()))
    return {'frames': frames, 'labels': labels}

if __name__ == '__main__':
    for id in map(int, sys.argv[1:]):
        x = chars[id]
        print(id, json.dumps(timeline(id), ensure_ascii=True) if x.get('type') == 'DefineSpriteTag' else ET.tostring(x,encoding='unicode'))

