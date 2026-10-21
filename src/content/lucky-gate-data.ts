/** XML selectors and their nested action end markers, frozen in lucky-gate/source-fixture.json. */
export const LUCKY_SPECIES=['鹿角兽','龙怪','骑士亡魂','巨猿','守卫魔','绿魔精','恐兽','提风','四牙怪','巨杰士','暗黑格拉斯','机关兽'] as const;
export type LuckySpecies=typeof LUCKY_SPECIES[number];
export const LUCKY_TIMING:Record<LuckySpecies,{run:number;attack:number}>={鹿角兽:{run:16,attack:9},龙怪:{run:14,attack:10},骑士亡魂:{run:14,attack:9},巨猿:{run:8,attack:11},守卫魔:{run:16,attack:9},绿魔精:{run:12,attack:9},恐兽:{run:12,attack:8},提风:{run:12,attack:9},四牙怪:{run:12,attack:8},巨杰士:{run:12,attack:9},暗黑格拉斯:{run:12,attack:9},机关兽:{run:12,attack:8}};
