# 架构说明

[English](ARCHITECTURE.md) | 简体中文

## 产品边界

WhaleConsole 使用两个相互独立的界面：

1. 原生启动器负责管理本地 DSH 进程与诊断信息。
2. DSH WebUI 在独立 WebView 中打开，并通过插件获得视觉扩展。

启动器不会向任意页面注入 CSS。WebUI 定制通过 DSH 官方客户端模块与插槽系统交付。

## DSH 插件

`dsh-whale-console` 在同一个包中声明了两种受支持的插件角色：

- `dsh.bundle.patch` 通过 `cordis.patch.yml` 挂载 Host 部分。
- `dsh.client` 通过 `./client` 暴露 Web 客户端。

Host 部分使用 Schemastery 注册 `dsh-whale-console` 设置命名空间。浏览器部分注册三套配色、提供五套皮肤，并向以下增量插槽提供内容：

- `shell.overlay`：角色悬浮层与在线状态。
- `sidebar.footer.action`：快捷面板入口。
- `settings.plugin.item`：WhaleConsole 设置卡片。

插件不会替换 `root`、侧栏或对话渲染器。

浏览器产物构建为 lazy CommonJS 工厂，并由 `window.__ModuleLoader__.load` 包装。图像以 WebP Data URL 编码到产物中，因此 DSH 插件路由只需要提供 `client.js`。

## 皮肤系统

`packages/skins` 是皮肤 ID、分类、角色绑定、美术键、缩略图键、色板与主题 Token 的唯一事实来源。每套皮肤在 `packages/skins/assets/thumbnails` 下拥有一张固定的 16:9 WebP 缩略图；启动器与插件通过各自的小型类型化映射导入同一个文件。PNG 源母版保存在相邻的 `source/` 目录中。

角色悬浮立绘仍按运行界面分别保存：启动器通过 Vite 提供素材，插件则将素材嵌入 lazy 客户端包。缩略图元数据保持共享，但由两个构建工具各自解析素材。

`skinId` 是唯一持久化的外观设置。当前皮肤会统一解析实时配色与角色，因此 Host Schema 不再重复保存主题或角色字段。

## 启动器

Tauri 后端最多管理一个可选子进程，启动命令为：

```text
pnpm dsh web --no-open --port <port>
```

该进程会被分配到独立的 Unix 进程组。停止服务或退出应用时，启动器会先向进程组发送 `SIGTERM`，短暂等待后仅在仍未退出时使用 `SIGKILL`。

子进程获得的 `PATH` 由登录 Shell、检测到的 `pnpm` 目录和 Node.js 目录组合而成。源码目录的文件监听使用轮询，以便在 macOS 图形应用的进程限制下可靠启动。日志默认写入 `~/Library/Logs/DSH WhaleConsole/dsh-whale-console.log`，用户也可以选择其他绝对路径或主目录相对路径。

如果端口可访问但启动器没有对应的子进程，该服务会被识别为外部服务。WhaleConsole 可以打开它，但不会停止或重启它。

WebUI 窗口使用独立标签，并且不具备任何 Tauri 命令权限。主窗口可以隐藏到菜单栏；选择退出时会执行进程清理。

启动器皮肤保存在本机，并有意与 DSH WebUI 皮肤相互独立。这样即使未安装插件，进程控制仍然可用，也不会把原生设置强耦合到正在运行的 WebUI 会话。

## Agent 辅助源码构建

`INSTALL.zh-CN.md` 是面向用户和远程 Agent 的稳定入口。`dsh-whale-console-install` Skill 负责区分全新构建、仅构建启动器、仅构建插件、验证、更新与诊断，并通过双语 Runbook 按需加载详细条件流程。

所有可执行行为都集中在 `scripts/agent`。英文与中文指令调用同一套环境预检、构建、产物验证、文档配对和 Skill 检查脚本。脚本可以在已忽略的 `dist/` 下写入构建产物，但不会安装系统依赖、修改真实 DSH profile、停止现有服务、复制到 `/Applications`、提交或发布。

完整 Preview 构建器固定使用 `tauri build --bundles app`。DMG 制作、签名、公证与公开二进制分发仍然位于源码分发 Preview 边界之外。

## 兼容性

- DSH：`0.1.1-rc.2`
- Node.js：`^22.19.0 || >=24.0.0`
- pnpm：已测试 `11.7.0` 与 `11.24.0`
- macOS：12 或更高版本，Preview 产物为 arm64

每个 DSH 候选版本都有可能更改客户端插槽或设置契约。兼容范围应基于实际验证逐步扩展，并通过真实组合测试进行把关。
