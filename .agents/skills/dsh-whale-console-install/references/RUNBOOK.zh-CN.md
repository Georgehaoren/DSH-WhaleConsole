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

## 确认 DSH 命令与权限

优先使用用户明确指定、启动器已经配置或 `DSH_REPO` 指向的兼容 DSH checkout。只有在实际检查后才能采用 `~/deepseek-harness` 等默认候选；不要为了安装插件自行 clone、pull 或切换 DSH 版本。源码环境不保证存在全局 `dsh`，因此默认在已确认的 checkout 中调用 `pnpm dsh`。只有 `command -v dsh` 确实成功时，裸 `dsh` 才是可选入口。

安装前识别并申请最小范围写权限：DSH checkout、目标 `~/.dsh/profiles/web` 和该 profile 当前使用的 pnpm Store。Store 路径可从已有 `node_modules/.modules.yaml` 的 `storeDir` 读取；不要通过改写它、强制重装依赖或迁移 Store 来绕过权限问题。无法取得写权限时，停止并把经过确认的完整安装命令交给用户在普通终端执行。

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

官方命令成功后会按照已安装包的 `dsh.bundle` 声明自动维护 `dsh.profile.bundles`；不要手动追加 Bundle，也不要删除已有插件。记录 `.tgz` 的实际路径和校验值，并提醒用户保留本地压缩包，因为该路径和完整性会出现在 profile 与锁文件中。如果已有 profile 引用了目标文件，重新打包前先比较版本与校验值；不同内容不得覆盖同版本、同文件名的已安装压缩包。

重启或首次启动前，按以下顺序验证：

```sh
pnpm dsh plugin --profile web list
pnpm dsh --profile web --dump-config
```

这两条命令不保证纯只读：前者可能以可写方式打开 pnpm Store 的 SQLite 索引，后者会经过 profile 准备流程并可能创建或更新 `cordis.yml`。如果权限阻止官方验证，依次检查目标 profile 的 `package.json` 与 `pnpm-lock.yaml`、`node_modules/<package>/package.json`、`dsh.bundle.patch` 和 `dsh.client.platform` 声明、`cordis.patch.yml`、服务端入口及浏览器入口。浏览器入口依赖 `window` 时使用 `node --check` 检查语法，不要在纯 Node 中直接导入执行。

文件检查只能证明安装状态，不能完全替代组合或运行时验证。报告中必须列出被权限阻止的命令。如果 DSH 已运行，首次加入插件后重启该实例；如果端口未运行，下次正常启动即可，不要制造一次无意义的“先启动再重启”。

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
- 插件失败：依次检查压缩包内容、profile 依赖与 Bundle 列表、已安装包元数据、DSH 组合配置、启动入口和客户端路由。
- `plugin list` 报 SQLite `unable to open database file`：先检查当前 pnpm Store 的最小写权限，不要据此认定 Store 已损坏，也不要强制迁移或重装已有插件。
- `--dump-config` 报 profile 写入 `EPERM`：说明组合准备需要写 `cordis.yml`；降级为文件检查并报告未完成组合验证，不要声称两者等价。
- 启动器启动失败：检查配置的持久日志目录和当前服务所有权状态。
- 打包失败：使用 `--bundles app`；DMG 制作不属于源码分发 Preview 契约。

不要通过关闭安全机制、编辑依赖产物、删除锁文件或重装无关工具来解决诊断问题。
