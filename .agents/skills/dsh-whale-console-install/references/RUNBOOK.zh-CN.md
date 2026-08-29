# 安装操作规程

[English](RUNBOOK.md) | 简体中文

Skill 选定任务模式后再使用本规程。除非另有说明，命令均在仓库根目录执行。

## 全新源码构建

1. 确认源码版本并检查 `git status`，绝不丢弃用户改动。
2. 运行 `pnpm agent:preflight -- --lang=zh-CN`。
3. 如果依赖尚未安装，说明安装可能访问网络，并在取得所需授权后运行 `pnpm install --frozen-lockfile`。
4. 运行 `pnpm build:preview -- --skip-install --lang=zh-CN`。
5. 报告 `dist/` 中的三个文件和 Preview 应用未签名状态。

只进行不产生修改的流程演练时，使用：

```sh
pnpm build:preview -- --dry-run --skip-install --lang=zh-CN
```

## 仅构建启动器

原生构建前先验证仓库：

```sh
pnpm docs:check
pnpm skill:check
pnpm typecheck
pnpm test
pnpm --filter @dsh-whale-console/launcher run tauri:build:app
```

应用保存在 `apps/launcher/src-tauri/target/release/bundle/macos/`，未经授权不要复制。

## 仅构建和安装插件

先构建并检查插件包：

```sh
pnpm --filter dsh-whale-console run pack
tar -tzf dist/dsh-whale-console-<version>.tgz
```

用户确认后，在 DSH 源码目录中使用插件压缩包的绝对路径安装：

```sh
pnpm dsh plugin --profile web add /absolute/path/to/dsh-whale-console-<version>.tgz
```

重启现有服务前，使用 `pnpm dsh plugin --profile web list` 和 `pnpm dsh --profile web --dump-config` 确认包身份与组合配置。

## 真实 DSH 组合测试

仓库测试使用临时 `DSH_HOME`、随机本地端口和打包后的插件，不会安装到用户的真实 profile：

```sh
DSH_REPO=/absolute/path/to/deepseek-harness \
  pnpm --filter dsh-whale-console test:composition
```

测试可能在 DSH 源码目录创建包管理器临时文件。如果执行环境有权限限制，应先取得对应文件系统权限。

## 更新与重新构建

只有用户明确要求时才更新。先检查本地改动，再执行不会重写工作区的 fetch，比较目标标签或分支，并且只允许快进 pull。源码更新后重新运行完整 Preview 构建。绝对不要使用破坏性 reset 或 checkout 命令丢弃改动。

## 故障诊断

- 环境失败：使用 `pnpm agent:preflight -- --json --lang=zh-CN`，只处理失败项。
- 类型或测试失败：停在对应层级并保留输出。
- Rust 失败：单独运行锁定依赖的 Cargo 检查，报告第一个可处理错误。
- 插件失败：依次检查压缩包内容、DSH 插件列表、组合配置、启动入口和客户端路由。
- 启动器启动失败：检查配置的持久日志目录和当前服务所有权状态。
- 打包失败：使用 `--bundles app`；DMG 制作不属于源码分发 Preview 契约。

不要通过关闭安全机制、编辑依赖产物、删除锁文件或重装无关工具来解决诊断问题。
