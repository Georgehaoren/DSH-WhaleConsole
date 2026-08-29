# 发布流程

[English](RELEASING.md) | 简体中文

本文档适用于 Preview 源码标签、DSH 插件压缩包和未签名的 macOS 测试构建。面向公众分发 macOS 应用时，还必须完成 Apple Developer ID 签名与公证。

## 1. 发布准备

1. 在根工作区、启动器、插件、皮肤包、Tauri 配置和 Cargo 包中填写同一个版本号。
2. 在中英文更新日志中加入对应版本说明。
3. 确认每份发生改动的文档都有同步的英文与简体中文内容。
4. 检查美术源文件、运行时衍生文件、许可证、署名信息与 AI 辅助声明是否齐全。

## 2. 验证

```sh
pnpm install --frozen-lockfile
pnpm docs:check
pnpm skill:check
pnpm verify
DSH_REPO=/absolute/path/to/deepseek-harness pnpm --filter dsh-whale-console test:composition
```

界面发生变化时，需要检查启动器和插件皮肤盒子的桌面与窄窗口布局。每套内置皮肤都必须显示独立的 16:9 缩略图，并保证操作控件清晰可用。

## 3. 构建产物

```sh
pnpm build:preview -- --skip-install --lang=zh-CN
```

构建器会生成 SHA-256 校验值并验证两个压缩包。本地构建产物统一放在 `dist/`。源码分发 Preview 不附加未签名应用，除非以后修改发布策略，否则生成产物只保留在本机。

## 4. 发布

1. 从干净的 `main` 分支创建形如 `v0.2.1-preview.1` 的附注标签。
2. 推送分支与标签。
3. 使用对应更新日志创建 GitHub Preview Release。
4. 源码型 GitHub Release 不附加本地构建的插件包、未签名应用和校验文件。
5. 启用 npm 发布后，使用 `preview` dist-tag 发布插件，并在干净的 DSH profile 中验证安装。

请勿将未签名或未公证的 macOS 产物描述为可用于正式环境的版本。
