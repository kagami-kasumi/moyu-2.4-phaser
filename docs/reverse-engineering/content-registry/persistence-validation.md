# TASK-DATA-019 验证报告

2026-10-08完成完整字段schema、初始化配方、恢复次序与未实现状态保留合同；没有实现存储IO或角色/存档UI。

## 交付和覆盖

- [完整合同](persistence-schema.md)、`persistence-survey.json`及正式`persistence-registry-data.ts`：653键模板，包含阶段默认、最终初始化配方、条件、归属、引用、原语句、setter与后续恢复副作用。
- `restore-matrix.json`：13阶段、686个源load访问位置；保存侧696个访问（含读取保存长度等控制）；6字段只保存/外部读取而不由readGame恢复。
- `persistence-coverage.json`：018移交927个ID全部唯一闭合；840个字段语义映射与87个临时/派生/迁移项。未修改018历史归属或原始AS/SWF。
- `persistence-schema.ts`：无损source/extensions数据模型、显式归属更新与删除、三键分离的legacyPetSeed；不是存储适配器。`persistence-repairs.ts`登记现代design，不将AVM1未知行为标verified。
- 综合门禁保留原异常记录，通过结构条件接受唯一已处置幻兽异常；删字段、缺初始化、误映射sd或更换源位置的负向测试均拒绝。

## 实际检查

| 命令 | 结果 |
| --- | --- |
| `npm run catalog:persistence` | 通过，重建字典、恢复矩阵、927条对账及正式注册；源提取物只读 |
| `npm run inspect:persistence` | 通过，final-schema-reviewed、653模板、31个owner |
| `node --test tools/persistence-review.test.mjs tools/persistence-coverage.test.mjs tools/external-save-access.test.mjs` | 5项通过（由check:persistence调用） |
| `npm run check:persistence` | 上述5项+37项源语义/表示检查通过；包含合同要求的preserved-value专项3项 |
| `npm run typecheck` | 通过 |
| `npm test` | 71项通过（含3项新增schema回归） |
| `npm run build` | 通过；仍有既有大chunk提示 |
| `npm run check:source` | 5项通过，原SWF清单一致 |
| `node tools/check-registry-source-survey.mjs` | 734原脚本哈希、165地图标签/帧及表基数通过 |
| `npm run check:harness` | 14项与状态/链接校验通过；019 Done、020 Ready后再次通过，task:next返回020 |

专项直接使用源访问器/函数，覆盖：人物源泉容量后写覆盖、最终装备刷新与当前值不夹取、技能effect与XP后写、朋友零增量升级、活动日常目标/非活动保留、0坐标/缺一坐标、幻兽独立nextLvRate/sd/qyg及rareFen/life语义。所有653字段分别测试undefined、0、-0、NaN、±Infinity、空串、false、null；911内容payload、稀疏数组/关联属性、重复未知实例、未来模块字段均可JSON往返。

检查中曾发现新测试替身缺少AS作用域中的setRelationName绑定，以及handoff的return实际target为`$return`；已修复测试绑定/分类并重跑全部专项通过，没有改变原期望或源文件。日志保存在本地`.evidence/persistence/`。

## 未关闭的相邻范围

只读执行`node --experimental-transform-types tools/check-content-registry.mjs`仍返回exit 1，两项为：8716/9611条在旧numeric-rule-index中仍非reviewed-module；reference-audit仍为classification-audit-in-progress。017/018已提供分域独立对账，019已提供持久语义及异常处置，020负责将其整合到综合门禁，不能直接改标签掩盖缺口。本次未将此综合检查记录为通过。

本任务没有改动场景/可见交互，因此未重跑浏览器；020依合同承担完整浏览器/截图验收。来源重复键的AVM1实际冲突结果、018的form/空lover/悬空建筑路径仍保留unknown/inferred边界。旧档本来未保存的历史不能补造。正常完整存取旅程交016，迁移/备份/坏档处理交022，基础功能线继续Active。
