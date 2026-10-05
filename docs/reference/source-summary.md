# 原文件与工具现状

## 已确认

来源：根目录 `魔域2.4.swf`，本次仅读取。机器清单见 [swf-inventory.json](swf-inventory.json)，由 `node tools/inspect-swf.mjs` 可重复生成，不含运行时间戳。

| 字段 | 值 |
| --- | --- |
| 压缩格式 / 版本 | CWS（zlib） / SWF 8 |
| 文件长度 | 14,088,083 bytes |
| 声明解压长度 | 16,244,841 bytes |
| 原文件 SHA-256 | `f3c5fadfa7100946226a6fae218cde141c96736657f270767a247917bb8c5bf9` |
| 舞台 | 580×500 px |
| 文件帧率 | 15 FPS |
| 根时间轴帧数 | 9，不代表角色动作数或每个 MovieClip 的帧数 |
| DefineSprite | 491 |
| DoAction / DoInitAction / DoABC | 467 / 188 / 0 |
| VM 指示 | AVM1；未发现 AVM2 字节码标签 |

这是 AS1/AS2 时代的源文件，需要按时间轴脚本、MovieClip 实例、attachMovie、gotoAndPlay/gotoAndStop、onEnterFrame 等实际存在的语义追踪；标签扫描不能直接确认脚本类结构、角色数量、伤害规则或运行时依赖。

## 本机工具

本次确认 Node.js 24.6.0、Java 8 可用；FFDec CLI 和 JAR 已存在：

```text
C:\Program Files (x86)\FFDec\ffdec-cli.exe
C:\Program Files (x86)\FFDec\ffdec.jar
```

这是本机环境记录，不是其他机器的安装前提。正式逆向任务应先查 FFDec 帮助/版本再使用已支持参数；本次未启动 FFDec 导出、未运行原游戏。无需为 harness 下载额外引擎或复杂工具。

## 尚未确认

本节是初始结构盘点的边界。TASK-RE-001 已补充 [启动与角色源索引](../reverse-engineering/source-index.md)：下列启动/输入问题已有静态定位，运行行为仍未验证；后续以该证据报告的逐项等级为准。

- 实际启动/加载/菜单链，以及是否存在运行必需的外部加载。
- 首个可控角色、视角、地图和操作方式。
- 动作帧、持帧、脚本跳转、镜像原点和命中时序。
- 存档、成长、背包、任务等系统是否存在及其数据结构。

字符串中出现论坛或 Adobe 元数据 URL，不等于游戏必须联网。需跟踪实际 load/getURL 调用及用途，不能只凭字符串判依赖，也不要执行源文件内的链接或指令。

原 SWF 与批量提取材料在 Git 忽略范围；`check:harness` 不依赖它们，源复验则需要本地文件。运行所需资源应在后续实现时单独纳入正式目录，不能依赖逆向人员的绝对路径。
