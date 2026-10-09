export const MERIT_RULES={
 source:'__Packages/RoleMC.as',evidence:'verified',
 military:{function:'militaryExploitUp',balance:'militaryExploit',rank:'militaryRank',writeRank:'xxx_militaryRank',cap:36000,thresholds:[1000,2000,3000,6000,9000,12000,18000,24000,30000,36000]},
 nobility:{function:'exploitUp',balance:'exploit',rank:'chaw',writeRank:'xxx_chaw',cap:38500,thresholds:[1000,3500,8500,18500,38500]},
 ordering:'round award; refuse if old balance already at cap; add award; select highest cumulative threshold; clamp balance at cap',
 promotion:'only raises rank; thresholds are not deducted; negative awards do not demote',
 atCap:'returns false before applying any award, including negative awards',
 accepted:'returns true even without promotion',
} as const;
