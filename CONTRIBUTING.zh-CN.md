# 参与贡献

[English](CONTRIBUTING.md) | 简体中文

所有改动都应与当前 DSH 兼容基线及其增量扩展点保持兼容。

参与项目 Issue、Discussion、Pull Request 及其他社区空间时，请遵守[行为准则](CODE_OF_CONDUCT.zh-CN.md)。

如果改动涉及大范围兼容性、新增插件界面或改变现有人物设计，请先创建 Issue 讨论。范围较小的问题修复和文档更正可以直接提交专注的 Pull Request。

请从 `main` 创建分支，保持提交范围清晰，并同步更新英文与简体中文文档。皮肤改动应修改 `packages/skins` 中的共用注册表；启动器与插件不得分别定义冲突的皮肤 ID 或缩略图映射。

提交 Pull Request 前请运行：

```sh
pnpm install
pnpm docs:check
pnpm skill:check
pnpm typecheck
pnpm test
pnpm build
DSH_REPO=/path/to/deepseek-harness pnpm --filter dsh-whale-console test:composition
```

界面改动还需要检查桌面与窄窗口效果。请勿提交构建产物、本地缓存、个人路径、访问令牌或未经处理的日志。

请勿添加 DeepSeek 官方 Logo、暗示项目获得官方认可，或提交基于现有受版权保护角色的美术素材。新增原创美术必须附带清晰的许可证与署名信息。

请在 Pull Request 中披露具有实质影响的 AI 辅助，并检查生成内容的正确性、密钥、个人数据、许可证与非预期相似性，详见[AI 辅助创作声明](AI_DISCLOSURE.zh-CN.md)。

Preview 打包与发布要求请参阅[发布流程](docs/RELEASING.zh-CN.md)。
