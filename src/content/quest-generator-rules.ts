/** Source task-generation inputs; no quest is activated by these registrations. */
export const QUEST_GENERATOR_RULES = {
  evidence: 'verified',
  source: 'DefineSprite_2210_任务系统/frame_1/DoAction.as',
  commanderSource: 'DefineSprite_4312/frame_1/DoAction.as',
  commanders: [
    { command: 3201, tier: '初级', rank: 1, monsters: ['鹿角兽','龙怪'], bosses: ['龙怪头目'] },
    { command: 3202, tier: '初级', rank: 1, monsters: ['骑士亡魂','冰妖剑士'], bosses: ['冰妖剑士头目'] },
    { command: 3203, tier: '初级', rank: 1, monsters: ['巨猿','守卫魔'], bosses: ['守卫魔头目'] },
    { command: 3204, tier: '中级', rank: 4, monsters: ['招魂使','绿魔精'], bosses: ['绿魔精头目'] },
    { command: 3205, tier: '中级', rank: 4, monsters: ['恐兽','炎女'], bosses: ['炎女头目'] },
    { command: 3206, tier: '中级', rank: 4, monsters: ['提风','刺虫人'], bosses: ['刺虫人头目'] },
    { command: 3207, tier: '高级', rank: 7, monsters: ['死神战将','暗黑弥塞亚'], bosses: ['黑翼法师头目','四牙怪头目'] },
  ],
  daily: { 军功: { count: 6, suffix: '' }, 功勋: { count: 4, suffix: '精英' }, 悬赏: { count: 1, suffix: '' } },
  friend: {
    drawCount: 4,
    collect: [{ name: '灵魂晶石', count: 1 }, { name: '幻魔晶石', count: 2 }, { name: '魔魂晶石', count: 3 }],
    defaultMonster: '龙怪',
    byHomeCity: { 卡萨诺城二: '鹿角兽', 树心城: '骑士亡魂', 戈壁: '巨猿', 沼泽: '招魂使', 南城: '恐兽', 边关: '提风', 冰宫: '暗黑弥塞亚' },
    killCounts: [4,2], eliteSuffix: '精英',
  },
  reset: 'daily and friend replace need with zero progress and set isDoing; neither clears isComplete',
  guard: 'friend refuses an already active task; setDailyTask itself does not',
} as const;
