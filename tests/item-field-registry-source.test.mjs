import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ITEM_FIELD_RULES} from '../src/content/item-field-rules.ts';
import {itemFieldSemantics} from '../tools/lib/item-field-semantics.mjs';
test('formal item field registry matches the reviewed original accessors exactly',()=>{
 const root='local-resources/moyu/source-index/as/scripts/__Packages/';
 const expected=itemFieldSemantics(fs.readFileSync(root+'ThingMC.as','utf8'),fs.readFileSync(root+'SecreteCodeMC.as','utf8'));
 assert.equal(expected.length,46);assert.deepEqual(ITEM_FIELD_RULES,expected);
 assert.equal(new Set(ITEM_FIELD_RULES.map(f=>f.property)).size,46);
});
