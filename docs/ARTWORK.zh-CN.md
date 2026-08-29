# 原创美术

[English](ARTWORK.md) | 简体中文

Preview 包含多组 AI 辅助创作的原创素材，均未使用 DeepSeek 或 DSH 官方 Logo。项目级说明请参阅[AI 辅助创作声明](../AI_DISCLOSURE.zh-CN.md)。

## 鲸链工程师

成年技术角色，具有石墨黑长发、电光青瞳、工程制服、Cordis 方块、插件匣腰带与黑鲸工具机器人。角色保留正常双腿，并具有一条独立的水平鲸尾鳍。

## 中号鲸链工程师

位于成年标准立绘与Q版之间的紧凑中等比例形态。保留深蓝到青色的高马尾、宽松工程夹克、功能性 Harness、正常双腿和独立水平鲸尾。重复出现的鲸形徽章和品牌化标记替换为中性石墨色硬件与抽象青色电路细节。

源素材：`assets/skins/harness-engineer/harness-engineer-medium-delogo-v1.png`。

## Q版鲸链工程师

基于鲸尾版设定图制作的约 2.5 至 3 头身Q版形态。保留发型、装备轮廓、鲸尾形发饰、正常双腿和独立鲸尾，同时移除重复 Logo、标题文字与品牌标记。

当前运行时立绘采用 ChatGPT 重绘的 v2 全身图，并保留配套 v2 人设图作为后续视觉制作参考；早期 v1 抠图继续留在仓库中，用于来源追溯与版本对比。

源素材：

- `assets/skins/harness-engineer/harness-engineer-chibi-keyart-v2.png`
- `assets/skins/harness-engineer/harness-engineer-chibi-character-sheet-v2.png`
- `assets/skins/harness-engineer/harness-engineer-chibi-delogo-v1.png`（归档 v1）

## 深海女仆

成年技术助理，长发由深海蓝过渡到浅蓝，佩戴鲸鳍形耳饰，穿海军蓝与白色女仆制服并携带数据板。角色保留正常双腿，并具有一条独立的水平蓝鲸尾鳍。

## 应用图标

一只棱角分明的黑鲸环绕发光的青色工程方块，背景为石墨色 macOS 图标底板。

## 可选图标包

AI 辅助创作的角色图标选项保存在 `assets/icon-packs`。首个二次元图包包含Q版 Harness 娘与Q版深海女仆的 PNG 源图，以及配套的多分辨率 macOS ICNS 文件。这些素材均为可选项，不会自动替换默认应用图标。

详见[二次元额外图标包](../assets/icon-packs/anime/README.zh-CN.md)。

## 皮肤缩略图

五张皮肤卡片分别使用独立的 1280×720 预览图。预览图由实际 WhaleConsole 界面样式和对应原创角色素材渲染而成，不是在卡片中临时拼装的迷你界面，因此启动器与插件会显示相同构图。

PNG 源母版保存在 `packages/skins/assets/thumbnails/source`，运行时 WebP 文件保存在上一级目录，并通过共用皮肤注册表中的 `thumbnailKey` 进行映射。

在 macOS 上运行 `pnpm artwork:thumbnails`，可以通过共用的 WhaleConsole 构图脚本重新生成五张 PNG 母版和运行时 WebP 文件。

部分全尺寸角色素材的原始 PNG 生成文件保留在仓库之外。运行时副本为压缩后的 WebP，Tauri 图标衍生文件由方形源图生成。中号与Q版 PNG 母版保存在 `assets/skins`，皮肤缩略图的源母版则随共用皮肤包保存。

许可证：CC BY 4.0。署名方式：`DSH WhaleConsole contributors`。
