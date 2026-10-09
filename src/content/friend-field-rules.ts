export const FRIEND_FIELD_RULES={
 source:'__Packages/FriendClass.as',evidence:'verified',
 defaults:{nTitle:'',name:'',sex:'',address:'未知',isLover:false,cmd:-1,jobMaxLevels:0,levels:0,relationName:'',rejectTimes:0,relation:0,maxRelation:0,isFriend:false,isIntimate:false},
 specialDefaults:{oldCmd:'target.oldCmd unless undefined, otherwise initialized cmd',jobLevels:'target.jobLevels unless undefined, otherwise retain existing field'},
 classFlags:{isTask:false,isFriend:false,isIntimate:false,isBest:false},
 encodedFields:['relation','maxRelation'],
 accessors:'ignore NaN writes; encode otherwise without clamping to maxRelation; getters decode',
 scope:'constructor writes and relation accessors; social progression logic is elsewhere',
} as const;
