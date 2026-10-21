// Verified branchTask definitions and shop.levelNum; see shop-upgrades/source-contract.md.
export const SHOP_UPGRADES=[
  {
    "index": 16,
    "name": "2级杂货商",
    "cost": 200,
    "prize": [
      {
        "type": "中级战斗力宝石"
      },
      {
        "type": "中级战斗力宝石"
      },
      {
        "type": "经验球",
        "number": 2,
        "salePrice": 50
      },
      {
        "type": "声望",
        "val": 1
      }
    ]
  },
  {
    "index": 17,
    "name": "3级杂货商",
    "cost": 500,
    "prize": [
      {
        "type": "初级月光宝盒"
      },
      {
        "type": "经验球",
        "number": 3,
        "salePrice": 50
      },
      {
        "type": "声望",
        "val": 1
      }
    ]
  },
  {
    "index": 18,
    "name": "4级杂货商",
    "cost": 2000,
    "prize": [
      {
        "type": "初级月光宝盒"
      },
      {
        "type": "初级月光宝盒"
      },
      {
        "type": "经验球",
        "number": 5,
        "salePrice": 50
      },
      {
        "type": "声望",
        "val": 1
      }
    ]
  },
  {
    "index": 19,
    "name": "5级杂货商",
    "cost": 5000,
    "prize": [
      {
        "type": "电浆药水"
      },
      {
        "type": "声望",
        "val": 1
      }
    ]
  }
] as const;
export const SHOP_LEVEL_STOCK=[0,4,7,10,13,16] as const;
