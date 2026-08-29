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

安装插件会修改选定的 DSH profile，并写入 pnpm Store。请先检查插件压缩包、确认目标 DSH 源码目录，并在用户授权该操作前停止。源码工作流不假定全局 `dsh` 命令存在；应在兼容的 DSH checkout 中使用 `pnpm dsh`：

```sh
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add /absolute/path/to/dsh-whale-console-<version>.tgz
```

在受限 Agent 环境中，这条命令通常需要以下位置的最小范围写权限：DSH 源码目录、`~/.dsh/profiles/web` 和当前 pnpm Store（macOS 上常见为 `~/Library/pnpm/store`）。如果无法取得所需权限，应停止并将上面的完整命令交给用户在普通终端执行；不要改写 profile、伪造 Store 状态或申请不受限制的全盘访问来绕过问题。

本地压缩包路径和完整性校验会记录进 profile 与 `pnpm-lock.yaml`。在卸载插件、重新安装新路径或改用发布版之前，请保留原始 `.tgz` 及其路径。不要在版本号不变时用另一次构建覆盖同名压缩包；需要改变包内容时应升级版本，或先为旧安装保留稳定副本并重新安装新路径。官方插件命令会根据已安装包的 `dsh.bundle` 声明自动维护 `dsh.profile.bundles`，无需手动编辑 Bundle 列表，也不会删除其他有效插件。

安装后可以在 DSH 源码目录中验证：

```sh
pnpm dsh plugin --profile web list
pnpm dsh --profile web --dump-config
```

这些验证命令不一定是纯只读操作：`plugin list` 可能以可写方式打开 pnpm Store 索引，`--dump-config` 可能生成或更新 profile 的 `cordis.yml`。权限不足时，可以降级检查 profile 的 `package.json`、`pnpm-lock.yaml`、已安装包的 `package.json`、`cordis.patch.yml` 与入口文件；这种文件检查不能替代最终组合验证，应在报告中明确说明跳过项。

如果 DSH 正在运行，首次加入插件后需要重启该实例；如果 DSH 尚未运行，下次正常启动即可。之后的皮肤切换由 WhaleConsole 内部处理，不需要再次调用构建 Agent。

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
安装插件时使用已确认 DSH 源码目录中的 pnpm dsh，只申请 DSH checkout、
目标 profile 与 pnpm Store 所需的最小写权限；权限不足时把完整命令交给我，
不要改写 profile 或迁移 Store。验证命令的写入副作用按 Runbook 处理。
不要提交代码、创建远程仓库、推送内容、修改 Shell 配置或关闭 macOS
安全机制。
```

不具备本地文件和终端权限的普通聊天助手无法完成此流程。

## 安全边界

- 不要使用 `sudo`、修改 `.zshrc`、修改全局 Git 配置或关闭 Gatekeeper 来绕过构建错误。
- 除非用户明确要求更新源码，否则不要执行 `git pull`。
- 不要按进程名结束进程。由 WhaleConsole 启动器管理它自己创建的 DSH 进程组。
- 不要直接编辑 DSH profile YAML 或 `node_modules`，应使用 DSH 官方插件命令。
- Agent 只应申请安装所需目录的最小权限；不要把 `danger-full-access`、全盘访问或关闭沙箱写成通用安装步骤。
- 不要公开未经遮盖的日志、主目录路径、凭据或 API 密钥。

## 故障排查

运行 `pnpm agent:preflight -- --json --lang=zh-CN` 可以获得便于 Agent 解析的环境检查结果。构建失败时应修复报告的具体层级，不应通过修改系统安全设置绕过。项目边界请参阅[安全策略](SECURITY.zh-CN.md)和[架构说明](docs/ARCHITECTURE.zh-CN.md)。
