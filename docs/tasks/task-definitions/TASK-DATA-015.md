# TASK-DATA-015 · 全量内容身份与引用注册

## 目标
交付可独立查询的全量内容身份目录与引用对账，后续数值和存档任务可直接消费。

## 输入
- 直接依赖 TASK-ITEM-013；Planned项激活前补齐精确源锚点、差异清单与专项检查，不重做已验证成果。
- docs/reverse-engineering/content-registry/source-contract.md、source-survey.json、object-census.json、reference-audit.json；src/content/registry.ts、registry-data.ts；源 frame_3 至 frame_9、DefineSprite_4536 地图帧、DefineSprite_2210_任务系统 与 ThingMC/RoleMC。
- 沿用 docs/workflow/reverse-engineering-protocol.md、docs/architecture/src-boundaries.md 和 docs/workflow/quality-gates.md。源根为 local-resources/moyu/source-index/as/scripts/，必要时用对应 P-code 消歧；原始源保持只读。

## 范围
覆盖角色职业、物品、地图、NPC、任务、敌人、技能、幻兽及现有扩展类别的稳定ID、原名/别名、源锚点、证据范围、资源引用与可用性；独立枚举源全集，分类动态身份域及源异常。只验证身份生成域、引用与声明数据，不继续实现各系统公式、持久字段语义或玩法。已接入代码保留。

## 输出
正式注册数据、只读 inspect:content 入口、源全集与引用差异报告；数值和持久字段缺口分别交给017/018/019。

## 验收
逐类列出源总量、注册、重复、遗漏和排除理由；覆盖全部物品、地图、角色选项与任务，不能以当前实现反推全集。动态身份域有边界依据，同名分支不误合并，引用解析且异常有明确处置。证据只提升到实际核对范围，unknown不填0。运行 npm run audit:content-references、node tools/check-registry-source-survey.mjs、node --experimental-transform-types --test tests/reference-completion.test.mjs tests/reference-anomalies.test.mjs tests/reference-domain-targets.test.mjs tests/content-registry.test.ts、npm run inspect:content、npm run typecheck。新增或修正源枚举工具时追加 check:source。

完成时更新覆盖证据与 state.json，运行 npm run generate:harness、npm run check:harness。上述检查均为待执行要求，不是本次拆分的通过记录。

## 停止与拆分
2026-10-07按用户要求从原015/016拆出可独立验收的交付；不按单个字段、物品或测试步骤拆任务。只修复阻碍本项交付的直接问题；相邻能力写入所属后续合同，不自动扩大本项。关键未知先有界取证，真实缺源/外部依赖才记录阻塞。不能以耗时到点或上下文压缩虚报完成。

### 拆分前成果保留
原合同身份与引用留在本项；角色/物品数值→017，幻兽/世界数值→018，持久字段→019，既有迁移与综合门禁→020。旧检查点只是历史进度，已有代码和证据全部保留，不能据此关闭任一新任务。综合 check:content-registry 仍要求全量完成，由020承担；工具旧提示中的015沿用旧合同名称，不是当前015的完成条件。

### 任务内检查点（2026-10-06）

已完成734脚本候选清点、165地图独立标签对账、基础表提取和911条初步注册；2076个对象候选及动态身份引用完成分类，装备数值/名称、49种字面幻兽蛋、开局赠送、赠送/兑换及地图清单已接入。源合同见docs/reverse-engineering/content-registry/source-contract.md。当前记录仍为inferred，任务保持Active。9611条数值/状态/返回记录已有结构索引，653个持久键模板已按所属对象记录正常源状态的类型证据；类型确认不代表最终默认值、恢复顺序与setter副作用均已核验。已记录未实现内容保留合同；修正RoleMC货币setter漏算导致的开局余额偏差，新手戒指20160种生成组合和结婚戒指14位对象的端点通过源oracle。继续完成：所有数值表/公式语义与生成边界；持久键的精确类型/默认值/条件和未来内容保留合同；剩余现有数值迁移；完整注册门禁与最终浏览器/视觉验收。最新逻辑回归65项、结构/访问器核验9项、完整浏览器27项通过，后续改动仍按质量门禁复验。不能用当前提取数量、阶段测试通过或未解析字段索引替代全合同完成。

### 当前范围验收证据（2026-10-07）

拆分后的交付与实际检查见 docs/reverse-engineering/content-registry/identity-validation.md、identity-coverage.json；独立身份门禁为 npm run check:content-identities。上方2026-10-06检查点作为旧范围历史保留，所列全量公式、字段、迁移工作已分别归017/018/019/020，不再作为本项未完成列表。
