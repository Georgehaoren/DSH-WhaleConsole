# 二次元额外图标包

[English](README.md) | 简体中文

本可选图包收录用于 DSH WhaleConsole 个人构建的 AI 辅助创作角色图标。图包本身不会替换默认应用图标，也不会自动增加运行时图标选择器。

## 收录图标

| 图标 | PNG 源图 | macOS 图标 |
| --- | --- | --- |
| Q版 Harness 娘胜利手势 | `harness-chibi-v-sign.png` | `harness-chibi-v-sign.icns` |
| Q版深海女仆挥手 | `deep-sea-maid-chibi-wave.png` | `deep-sea-maid-chibi-wave.icns` |

PNG 文件为 1254×1254 的 ChatGPT 生成源图。每个 ICNS 文件均包含 macOS 标准的 16、32、128、256、512 与 1024 像素规格。

`manifest.json` 提供稳定的图标 ID、中英文名称、角色归属和素材相对路径，可供未来的构建选择器或启动器图标面板直接读取。

## 重新生成

源 PNG 修改后，可在 macOS 上运行转换器：

```sh
scripts/png-to-icns.sh INPUT.png OUTPUT.icns
```

永久修改应用在 Finder 中显示的图标，需要在打包前选择图标，或修改仅供个人使用的应用副本。运行时切换程序坞图标属于另一项启动器功能，本素材包暂未实现该功能。

这些图标遵循仓库的 AI 辅助创作声明与 CC BY 4.0 素材许可证。署名方式：`DSH WhaleConsole contributors`。
