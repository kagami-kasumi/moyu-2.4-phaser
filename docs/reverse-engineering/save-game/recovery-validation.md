# TASK-SAVE-022 验证报告

日期：2026-10-09。实现/策略及源锚点见[恢复合同](recovery-contract.md)。界面是design，不声称复刻Flash存档面板。

## 实际检查

| 检查 | 结果与证据 |
| --- | --- |
| `npm run check:content-registry` | 通过；`.evidence/save-recovery/content-check.log`，保留015—020全量身份、数值、字段与接入闭环。 |
| `npm run typecheck` | 通过。 |
| `npm test` | 101/101通过，其中新增恢复专项8项；`.evidence/save-recovery/logic-check.log`。 |
| `npm run check:save` | 653字段表校验和既有14保存专项通过；`.evidence/save-recovery/save-check.log`。 |
| `npm run build` | 通过；仍有既有大bundle提示，无构建失败。 |
| `npm run test:browser` | 全量39/39通过，包含既有两职业完整旅程与3项恢复场景；`.evidence/save-recovery/browser-check.log`。 |
| `npx playwright test tests/browser/save-recovery.spec.mjs` | 新增整库截断/删除/debug场景后4/4通过；`.evidence/save-recovery/recovery-browser-check.log`。与全量合并为40个不同场景，不把重跑项重复计数。 |

首次定向浏览器运行6/7通过，发现SecurityError仅显示原英文denied导致既有中文提示检查失败。修复统一中文提示后，全量检查通过。未改源文件、源清单或解析器，因此本次没有额外运行SWF扫描。

状态收尾后`npm run generate:harness`、`npm run check:harness`通过（14项harness测试及状态/路径校验）。

## 实际界面与文件检查

已查看`.evidence/save-recovery/`下`warrior-backups.png`、`quota-failed.png`、`mage-imported-forge.png`、`warrior-corrupt.png`、`conflict.png`、`mage-recovered.png`、`future-vault.png`、`storage-denied.png`、`truncated-vault-preview.png`、`debug-external-restored.png`。确认管理窗口文本/按钮可读，预览显示角色、职业、等级和覆盖后果，异常提示不遮挡操作，恢复后精品魔魂+10/1孔打造托管仍在，debug幻兽/背包/七份掉落不重复。

两职业下载的`warrior-export.json`、`mage-export.json`与冻结完整v1输入逐字节比较；debug冷启动实际保存再下载`debug-external.json`，与实时存档逐字节比较。浏览器经真实file input导入，不用probe代替界面。正常旅程回归同时核验两职业新建、技能/幻兽/领取、打造、保存刷新与关闭重开、进入城内再继续。

故障断言检查整个存储Map或vault字符串不变，包括容量不足/存储拒绝、坏字段和引用、未来版本、截断输入、覆盖取消和双页过期确认。主记录坏档恢复不挤走有效备份；删除备份可取消，删除失败保留原备份。整个库截断后既验证迁移前旧档回退，也验证无旧档时由下载文件恢复。

## 基础线关闭核对

| 关闭条件 | 已消费证据 |
| --- | --- |
| 全量内容/数值注册与独立源对账 | 015身份911条；017/018合计9611数值索引及分类语义；020集成报告；本次内容注册综合门禁实际重跑通过。 |
| 全部角色入口与既有玩法接入 | 021男战士/女法师；全量浏览器包含两职业UI、女法师22投影及既有男战士动作/地图/背包/打造回归。 |
| 完整持久字段与未实现内容保留 | 019的653模板与016字段矩阵；本次8专项再次检查653模板/911payload在迁移/备份恢复后全量保留；01614专项仍通过。 |
| 正常存读档与版本/异常/备份恢复 | 016完整旅程实际回归；022真实v1迁入容器v2、文件导入导出、备份选择/删除与故障保护闭环。 |

满足LINE-GAME-FOUNDATIONS的既定关闭范围。该结论不表示未实现内容已可玩，不表示完整战斗、幻兽成长或区域任务已经复刻。

## 限制与后续

领域schema仍是v1；v2只是原子存储容器。没有Flash .sol兼容承诺。备份最多3份且受浏览器配额约束；整个库/站点数据丢失只能依赖迁移前旧档或外部导出文件。未知库版本拒绝覆盖；Web Locks只协调遵守本应用协议的页面。

下一项为TASK-GROWTH-014，合同已补齐现有经验/等级规则模块、原调用链、成长持久化集成和明确验收；只设Ready，不在本次执行。
