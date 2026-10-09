export const FRIEND_CAPACITY_RULES = {
  source: 'DefineSprite_2381_朋友/frame_1/DoAction.as',
  evidence: 'verified',
  capacity: { levelDivisor: 10, extraSlots: 1, maximum: 14, godCapacity: 14 },
  omittedLevel: 'use parent map role levels',
  levelTotal: 'sum every allFriends entry levels, from last to first, starting at zero',
  scope: 'levelsUp capacity assignment and getAllLevels; upData effects and membership changes separate',
} as const;
