# DSH WhaleConsole · DSH 鲸控台

[English](README.md) | 简体中文

DSH WhaleConsole（中文名：DSH 鲸控台）是一款非官方的 DeepSeek Harness（DSH）macOS 启动器与 WebUI 主题插件。Preview 版本将本地 WebUI 的使用流程改造成类似游戏启动器的桌面体验，同时让实际 DSH 页面在独立窗口中运行。

![WhaleConsole 标准皮肤预览](packages/skins/assets/thumbnails/source/harness-standard.png)

## Preview 功能范围

- 启动、停止、重启本地 DSH WebUI 服务，并查看运行记录。
- 在独立的原生 WebView 窗口中打开 WebUI。
- 通过 macOS 菜单栏保持启动器可用。
- 识别由其他进程启动的服务，并避免误停止该服务。
- 可在启动器皮肤盒子中切换五套内置皮肤，每套都有独立的固定 16:9 预览图。
- 可随时从 WebUI 侧栏皮肤盒子换肤，并即时更新角色立绘与界面配色。
- 通过官方增量插槽添加角色悬浮层、侧栏入口与插件设置卡片。
- 通过 DSH 设置命名空间保存 WhaleConsole 配置。

`0.2.1-preview.1` 的兼容基线为 DSH `0.1.1-rc.2`，Node.js `^22.19.0 || >=24.0.0`。

## 内置皮肤

| 鲸链工程师 | 中号鲸链工程师 |
| --- | --- |
| ![鲸链工程师](packages/skins/assets/thumbnails/harness-standard.webp) | ![中号鲸链工程师](packages/skins/assets/thumbnails/harness-medium.webp) |

| Q版鲸链工程师 | 深海女仆 |
| --- | --- |
| ![Q版鲸链工程师](packages/skins/assets/thumbnails/harness-chibi.webp) | ![深海女仆](packages/skins/assets/thumbnails/maid-standard.webp) |

| 双鲸协作 |
| --- |
| ![双鲸协作](packages/skins/assets/thumbnails/dual-standard.webp) |

## 仓库结构

```text
apps/launcher/       基于 Tauri 2 和 React 的 macOS 启动器
packages/plugin/     可安装的 DSH Bundle + Client 插件
packages/skins/      启动器与插件共用的皮肤清单和配色注册表
scripts/agent/       确定性的源码构建与验证脚本
.agents/skills/      供 Agent 读取的安装流程
docs/                架构、角色、美术与发布说明
.github/             自动检查、依赖更新与协作模板
dist/                本地构建的 Preview 产物
```

## 文档

- [架构说明](docs/ARCHITECTURE.zh-CN.md)
- [源码安装](INSTALL.zh-CN.md)
- [人物设定](docs/CHARACTERS.zh-CN.md)
- [原创美术](docs/ARTWORK.zh-CN.md)
- [Preview 发布检查清单](docs/PREVIEW-CHECKLIST.zh-CN.md)
- [发布流程](docs/RELEASING.zh-CN.md)
- [安全策略](SECURITY.zh-CN.md)
- [参与贡献](CONTRIBUTING.zh-CN.md)
- [更新日志](CHANGELOG.zh-CN.md)
- [素材许可证](ASSET_LICENSE.zh-CN.md)
- [AI 辅助创作声明](AI_DISCLOSURE.zh-CN.md)

## 源码构建与 Agent 安装

WhaleConsole Preview 采用源码优先分发。使用以下命令在本机构建插件包和未签名的 macOS 应用：

```sh
pnpm install --frozen-lockfile
pnpm agent:preflight -- --lang=zh-CN
pnpm build:preview -- --skip-install --lang=zh-CN
```

使用本地编程 Agent 的用户可以将以下简短要求交给 Agent：

```text
阅读 INSTALL.zh-CN.md，加载
.agents/skills/dsh-whale-console-install/SKILL.zh-CN.md，并按照仓库的源码构建
流程执行。修改 DSH profile、停止服务、安装系统依赖或将应用复制到
/Applications 前必须询问我。
```

完整人工与 Agent 流程请参阅[源码安装说明](INSTALL.zh-CN.md)。Agent 指令不会授予修改系统依赖、真实 DSH profile 或 macOS 安全设置的权限。

## 试用启动器

```sh
pnpm install
pnpm --filter @dsh-whale-console/launcher dev
```

浏览器预览地址为 `http://127.0.0.1:1420/`。原生开发还需要 Rust 与 macOS Command Line Tools：

```sh
pnpm --filter @dsh-whale-console/launcher tauri:dev
```

启动器会从登录 Shell 中查找 `pnpm` 与 Node.js，项目目录默认使用 `~/deepseek-harness`。项目路径、`pnpm` 路径、日志目录和 WebUI 端口都可以在设置中修改。

## 运行诊断

日志默认写入 `~/Library/Logs/DSH WhaleConsole/dsh-whale-console.log`。首次启动时会自动创建目录，也可以在设置中改为其他绝对路径或 `~/...` 路径。

从 Finder 启动时，WhaleConsole 会把登录 Shell 的 `PATH` 传给 DSH，确保包管理器脚本能够找到 Node.js。启动器还会为源码目录中的 WebUI 文件监听启用轮询，以避开 macOS 图形应用通常继承的较低文件描述符限制。

## 安装插件

插件目前尚未发布到 npm。可以先构建本地压缩包，再将其安装到 DSH Web profile：

```sh
pnpm --filter dsh-whale-console run pack
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add /absolute/path/to/dsh-whale-console-0.2.1-preview.1.tgz
```

这里使用 DSH 源码目录中的 `pnpm dsh`，因为源码安装环境不一定存在全局 `dsh` 命令。安装会更新 `~/.dsh/profiles/web` 和 pnpm Store；使用本地压缩包时，其绝对路径和完整性校验还会记录进 profile 与锁文件，因此请在卸载或改装发布版之前保留该文件及路径，也不要用不同内容覆盖同版本、同文件名的压缩包。

发布 Preview npm 包后，计划使用以下命令安装：

```sh
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add dsh-whale-console@preview
```

## 验证

```sh
pnpm typecheck
pnpm test
DSH_REPO=/absolute/path/to/deepseek-harness pnpm --filter dsh-whale-console test:composition
```

组合测试会创建临时 DSH 目录、安装打包后的插件、检查 Host 配置、启动 WebUI，并确认客户端启动图与 lazy-CJS 浏览器包可用。

## 构建 macOS 应用

```sh
pnpm --filter @dsh-whale-console/launcher tauri:build:app
```

`pnpm build:preview` 还会打包插件、生成应用 ZIP 并验证校验值。公开分发二进制文件仍需要 Apple Developer ID 签名与公证。

## 项目状态

当前版本属于开发者 Preview，尚未经过安全审计，兼容范围也有意保持收敛。请参阅[安全策略](SECURITY.zh-CN.md)、[架构说明](docs/ARCHITECTURE.zh-CN.md)和[发布检查清单](docs/PREVIEW-CHECKLIST.zh-CN.md)。

本项目与 DeepSeek 不存在隶属、认可或赞助关系。DSH 与 DeepSeek 名称仅用于描述兼容对象，项目不包含官方 Logo 或上游品牌素材。

代码使用 MIT 许可证；原创角色美术使用 CC BY 4.0，详见[素材许可证](ASSET_LICENSE.zh-CN.md)。

部分代码、文档、设计与原创美术在人工指导和审阅下使用生成式 AI 创作或修订，详见[AI 辅助创作声明](AI_DISCLOSURE.zh-CN.md)。
