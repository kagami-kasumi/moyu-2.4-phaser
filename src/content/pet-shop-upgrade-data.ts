// Verified branchTask definitions and huanShouShop.levelNum; see pet-shop-upgrades/source-contract.md.
export const PET_SHOP_UPGRADES=[
  {
    "index": 20,
    "name": "2级幻兽商",
    "cost": 300,
    "prize": [
      {
        "type": "莎菲"
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
    "index": 21,
    "name": "3级幻兽商",
    "cost": 500,
    "prize": [
      {
        "type": "灵魂晶石"
      },
      {
        "type": "灵魂晶石"
      },
      {
        "type": "灵魂晶石"
      },
      {
        "type": "灵魂晶石"
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
    "index": 22,
    "name": "4级幻兽商",
    "cost": 2000,
    "prize": [
      {
        "type": "圣天使奈丽"
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
    "index": 23,
    "name": "5级幻兽商",
    "cost": 4000,
    "prize": [
      {
        "type": "吉祥噜噜"
      },
      {
        "type": "声望",
        "val": 1
      }
    ]
  }
] as const;
export const PET_SHOP_LEVEL_STOCK=[0,9,11,14,17,20] as const;
