export const PET_GENERATION_RULES={
 source:'__Packages/HuanShouClass.as',evidence:'verified',
 labels:{generation:'nowLifeLv == 1: 二代; == 2: 三代; > 2: N代; otherwise empty',god:'isGod == true: 神使; otherwise empty'},
 turn:{counter:'increment zs only if zs < maxZs',history:'replace old level/experience triple only if current levels > oldLevels',reset:{levels:1,nowExp:0,maxExp:9}},
 evolve:{minimumMainScore:6000,exemptSpecies:'奇迹龙',maximumGeneration:2,main:'positive max*Fen: multiply current and max rate by nextLvMain, add 1000 max score',secondary:'otherwise multiply current rate by nextLvRate only',order:'increment generation; update four attributes; turned(); maxZs += 50; rareFen += 500',extraTurnCapacity:50,extraRarity:500},
 scope:'direct mutations and turned composition; input eligibility outside these methods and downstream recalculation excluded',
} as const;
