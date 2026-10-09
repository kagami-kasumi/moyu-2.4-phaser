/** Original task-panel dispatch; registration does not enable task gameplay. */
export const QUEST_DISPATCH_RULES = {
  evidence: 'verified',
  source: { file: 'DefineSprite_2210_任务系统/frame_1/DoAction.as', objectiveLine: 286, rewardLine: 465 },
  objective: {
    traversal: 'reverse group, reverse quest, reverse need; return after first match',
    name: 'typed object: name unless undefined, otherwise type; untyped input: input itself',
    quantity: 'typed object: number unless undefined or zero, otherwise one; untyped input: num',
    eligibility: 'isDoing == true && number < needNumber && name matches && quest.levels <= role.levels',
    invalidQuantity: 'isNaN returns false; negative and zero quantities are not rejected',
    consumption: 'min(quantity, remaining need); mutate input.number only when originally nonzero and defined',
    overflow: 'left on input; not redistributed to another objective',
    completion: 'set isComplete true then false if any need.number < need.needNumber; empty needs complete',
  },
  reward: {
    traversal: 'reverse prize order',
    special: { 魔石: 'role.xxx_ms += val', 资源: 'role.xxx_res += val', 军功: 'role.militaryExploitUp(val)', 功勋: 'role.exploitUp(val)', 声望: 'role.creditUp(val)', 出征3个幻兽: 'huanShou.maxBattleNum = 3', 接荣誉任务: 'confirmation callback setHonorTask' },
    equipment: ['武器', '衣服', '头盔', '鞋', '幸运符', '庇护铃铛', '翡翠铃铛', '凤翼铃铛'],
    equipmentOrder: ['upDataWeapon(prize)', 'backPack.setThing(prize)'],
    other: 'createThing(prize) repeated while integer index < number when number > 0; otherwise once',
    failure: 'factory/backpack return values ignored; no rollback',
    dailyReset: 'all need.number = 0; isComplete = false',
    finish: 'isDoing = false; nowTask = undefined',
    honor: '荣誉任务 cannot be claimed in this panel',
    friend: { currency: 'allFriendLevels * 10 + 100', bucket: 'floor(allFriendLevels / 7)', pets: ['奇异兽', '6星奇异兽', '8星奇异兽', '12星奇异兽', '15星奇异兽', '19星奇异兽'], fallback: '23星奇异兽' },
  },
} as const;
