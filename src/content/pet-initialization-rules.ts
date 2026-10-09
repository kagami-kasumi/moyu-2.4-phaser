/** HuanShouClass constructor contract; randomized pet seeds retain their own generators. */
export const PET_INITIALIZATION_RULES={
 source:{file:'__Packages/HuanShouClass.as',line:82},
 directSeedFields:['type','levels','rateLife','rateMinAttack','rateMaxAttack','rateDefense','zs','maxZs','element','titleNum'],
 optional:{nowExp:0,maxExp:'floor(levels * 9)',oldLevels:1,oldNowExp:0,oldMaxExp:'floor(levels * 9)',sd:0,qyg:0,nowLifeLv:0,nextLvRate:'random(3) * 0.1 + 1.3'},
 presence:'source compares != undefined; explicit zero is retained',
 god:'isGod == true becomes true; otherwise false',
 order:['class declaration defaults','constructor copies seed and optional fields','initialize species table and generation growth','raise rareFen only if input exceeds species value','checkUp scoring and flashAttribute','life = maxLife'],
 generation:{scoreIncrement:'nowLifeLv * 1000',mainRateMultiplier:'pow(1.5, nowLifeLv)',appliesTo:'only attributes with positive species max score',unusedCalculation:'pow(nextLvRate, nowLifeLv) is computed in initialize but not consumed there'},
 restore:{life:'always refilled; input life not copied',rareFen:'species minimum preserved',battle:false,inOne:false},
 codec:'original encode/decode introduces floating roundoff; modern plain numeric representation is a design choice',
} as const;
