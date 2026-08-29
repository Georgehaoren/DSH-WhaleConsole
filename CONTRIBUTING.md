# Contributing

English | [简体中文](CONTRIBUTING.zh-CN.md)

Keep changes compatible with the current DSH baseline and its additive extension points.

Participation in project issues, discussions, pull requests, and other community spaces is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

Open an issue before starting a broad compatibility change, a new plugin surface, or artwork that changes an established character design. Small bug fixes and documentation corrections can go directly to a focused pull request.

Create a branch from `main`, keep commits scoped, and update English and Simplified Chinese documentation together. Skin changes should update the shared registry in `packages/skins`; the launcher and plugin must not define conflicting skin identifiers or thumbnail mappings.

Before a pull request:

```sh
pnpm install
pnpm docs:check
pnpm skill:check
pnpm typecheck
pnpm test
pnpm build
DSH_REPO=/path/to/deepseek-harness pnpm --filter dsh-whale-console test:composition
```

UI changes also need desktop and narrow-window visual checks. Do not include generated build output, local caches, personal paths, access tokens, or unredacted logs in a commit.

Do not add official DeepSeek logos, imply endorsement, or submit character art based on existing copyrighted characters. New original artwork must include a clear license and attribution.

Disclose material AI assistance in the pull request and review generated output for correctness, secrets, personal data, licensing, and unintended similarity. See [AI_DISCLOSURE.md](AI_DISCLOSURE.md).

See [RELEASING.md](docs/RELEASING.md) for Preview packaging and release rules.
