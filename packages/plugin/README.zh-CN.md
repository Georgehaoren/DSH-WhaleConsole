# DSH WhaleConsole · DSH 鲸控台

[English](README.md) | 简体中文

DSH WhaleConsole（中文名：DSH 鲸控台）是一款非官方 Preview 插件，为 DSH WebUI 添加五套原创鲸鱼角色皮肤、每套独立缩略图、实时配色切换、角色悬浮层、侧栏皮肤盒子与设置卡片。

点击 WebUI 侧栏中的鲸鱼按钮，即可预览并切换标准、中号、Q版、深海女仆与双鲸协作皮肤。每张卡片使用独立的 16:9 预览图，选择结果通过 DSH 官方设置命名空间保存。

## 安装

```sh
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add dsh-whale-console@preview
```

Preview 包发布后可以使用以上命令。从本地源码构建时，请先打包插件，再用同一个 `pnpm dsh plugin --profile web add` 命令安装 `dist/` 中生成的压缩包绝对路径。源码环境不要求全局安装 `dsh`。

## 兼容性

- DSH：`0.1.1-rc.2`
- Node.js：`^22.19.0 || >=24.0.0`
- 平台：DSH WebUI

本项目与 DeepSeek 不存在隶属、认可或赞助关系。DSH 名称仅用于描述兼容对象，并遵循上游品牌规范。

插件及其原创美术的部分内容在人工指导和审阅下使用生成式 AI 创作或修订，详见[AI 辅助创作声明](AI_DISCLOSURE.zh-CN.md)。
