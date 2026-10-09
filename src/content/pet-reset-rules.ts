export const PET_RESET_RULES={
 evidence:'verified',source:{file:'__Packages/HuanShouClass.as',line:1392},
 fields:{oldLevels:0,oldNowExp:0,oldMaxExp:0,levels:1,nowExp:0,maxExp:9},
 order:'reset progression; flashAttribute(); life = maxLife',
 collection:{file:'frame_9/DoAction.as',line:2601,order:'reset every allHuanShou entry in ascending index, then refresh collection view and three battle panels'},
 retained:'reset does not explicitly change species, generation, growth rates, rarity or battle flag',
 scope:'reset writes and collection traversal; derived attributes and view refresh internals excluded',
} as const;
