# DSH 鲸控台源码安装

[English](INSTALL.md) | 简体中文

DSH WhaleConsole（中文名：DSH 鲸控台）Preview 以源码形式分发。当前支持的流程会在用户自己的 Mac 上构建未签名的 macOS 应用和本地 DSH 插件压缩包。

## 支持范围

- Apple Silicon（`arm64`）上的 macOS 12 或更高版本。
- 安装插件和执行组合测试时需要 DSH `0.1.1-rc.2` 源码目录。
- Node.js `^22.19.0 || >=24.0.0`、pnpm `11.24.0`、稳定版 Rust（已使用 `1.98.0` 验证）与 Xcode Command Line Tools。
- 此流程不会关闭 Gatekeeper、制作 DMG、签名应用或执行公证。

## 手动构建

在仓库根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm agent:preflight -- --lang=zh-CN
pnpm build:preview -- --skip-install --lang=zh-CN
```

构建过程包括双语文档检查、Skill 校验、类型检查、测试、Web 构建、锁定依赖的 Cargo 检查、插件打包、Tauri 应用构建、ZIP 生成和校验值验证。

## 构建产物

生成文件统一保存在已被 Git 忽略的 `dist/` 目录：

```text
dist/dsh-whale-console-<version>.tgz
dist/DSH-WhaleConsole-<version>-macos-arm64.zip
dist/SHA256SUMS-<version>.txt
```

## 安装插件

安装插件会修改选定的 DSH profile。请先检查插件压缩包，并在用户授权该操作前停止。

```sh
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add /absolute/path/to/dsh-whale-console-<version>.tgz
```

首次加入插件包需要重启一次 DSH。之后的皮肤切换由 WhaleConsole 内部处理，不需要再次调用构建 Agent。

## 安装启动器

ZIP 中包含 `DSH WhaleConsole.app`。用户可以直接从解压目录打开，也可以在明确授权后复制到 `/Applications`。

```sh
unzip DSH-WhaleConsole-<version>-macos-arm64.zip
open "DSH WhaleConsole.app"
```

启动器中的项目路径、pnpm 路径、端口与日志目录仍然可以由用户在设置中修改。

## 使用 Agent

请使用具有本地文件和终端权限的编程 Agent。在已经克隆的仓库中，将以下 Prompt 交给 Agent：

```text
仅在当前 DSH WhaleConsole 仓库中工作。先阅读 INSTALL.zh-CN.md，再加载
.agents/skills/dsh-whale-console-install/SKILL.zh-CN.md，并按照源码构建流程
执行。环境检查、构建和产物验证必须使用仓库提供的脚本。安装系统依赖、
修改 DSH profile、停止服务或将应用复制到 /Applications 前必须询问我。
不要提交代码、创建远程仓库、推送内容、修改 Shell 配置或关闭 macOS
安全机制。
```

不具备本地文件和终端权限的普通聊天助手无法完成此流程。

## 安全边界

- 不要使用 `sudo`、修改 `.zshrc`、修改全局 Git 配置或关闭 Gatekeeper 来绕过构建错误。
- 除非用户明确要求更新源码，否则不要执行 `git pull`。
- 不要按进程名结束进程。由 WhaleConsole 启动器管理它自己创建的 DSH 进程组。
- 不要直接编辑 DSH profile YAML 或 `node_modules`，应使用 DSH 官方插件命令。
- 不要公开未经遮盖的日志、主目录路径、凭据或 API 密钥。

## 故障排查

运行 `pnpm agent:preflight -- --json --lang=zh-CN` 可以获得便于 Agent 解析的环境检查结果。构建失败时应修复报告的具体层级，不应通过修改系统安全设置绕过。项目边界请参阅[安全策略](SECURITY.zh-CN.md)和[架构说明](docs/ARCHITECTURE.zh-CN.md)。
