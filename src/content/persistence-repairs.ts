/** Design dispositions. These do not assert AVM1 duplicate-key or missing-target behavior. */
export const PERSISTENCE_REPAIRS={
 petConstructor:{
  id:'distinct-pet-constructor-fields',source:{file:'frame_9/DoAction_2.as',line:1772},
  mapping:{nextLvRate:'nextLvRate',sd:'sd',qyg:'qyg'},
  rawPolicy:'preserve-all-source-keys',legacyCollision:'unknown',evidence:'design',
 },
 selectedVersion:{source:{file:'frame_9/DoAction_2.as',line:1695},policy:'validate-selected-record-before-mutation',evidence:'design'},
 freshOwners:{source:{file:'frame_9/DoAction_2.as',line:354},policy:'construct-fresh-domain-owners; do not reproduce equitment spelling or reused display-field residue',evidence:'design'},
 buildingRequirements:{source:{file:'DefineSprite_2313_主城堡/frame_1/DoAction.as',line:115},policy:'extensions.buildings stores needMainLevels per stable building ID; absent legacy value stays absent in raw, projection uses registered seed and marks provenance legacy-default, never pretends to recover lost history',evidence:'design'},
 collectionLimits:{source:{file:'frame_9/DoAction_2.as',line:1638},policy:'retain every record including beyond current capacity; limit active projection only, no save truncation',evidence:'design'},
 missingReferences:{policy:'preserve raw identity and instance; unsupported or dangling reference is opaque and never executable',evidence:'design'},
 modernCurrentValues:{policy:'recompute dependencies first then restore modern current-value extensions; legacy pet life refill is not applied to modern snapshots',evidence:'design'},
 debugOnLoad:{source:{file:'DefineSprite_4536/frame_2/DoAction.as',line:138},policy:'legacy source debug behavior remains documented; modern load does not issue new grants or mutate saved levels by player name',evidence:'design'},
} as const;
