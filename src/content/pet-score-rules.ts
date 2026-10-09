export const PET_SCORE_RULES={
 source:'__Packages/HuanShouClass.as',evidence:'verified',
 component:'maxScore * (rate - maxRate / 2) / (maxRate / 2)',
 main:'sum of life/minAttack/maxAttack/defense component scores',turnMultiplier:10,
 elements:[{score:0,name:'无'},{score:150,name:'风'},{score:150,name:'火'},{score:150,name:'水'},{score:150,name:'地'},{score:300,name:'雷'}],
 titles:{2:{score:300,name:'罡星兽',short:'罡星'},3:{score:500,name:'银月兽',short:'银月'},4:{score:700,name:'傲日兽',short:'傲日'},5:{score:900,name:'至尊圣兽',short:'至尊'}},
 unknownElement:'no default branch; retain prior element score/name',unknownTitle:'score 0, name 无, short empty',
 total:'mainFen + rareFen + zsFen + elementFen + titleFen after flashAttribute()',
 sortingMirrors:{allFen:'sortFen',levels:'sortLevels',order:'reject NaN; write plain sorting mirror; encode value'},
 scope:'checkUp writes; score setters and attribute refresh semantics are separate',
 scoreAccessors:{fields:['mainFen','lifeFen','minAttackFen','maxAttackFen','defenseFen','rareFen','zsFen','elementFen','titleFen'],write:'ignore isNaN; otherwise encode without local clamp or rounding',read:'decode stored value'},
} as const;
