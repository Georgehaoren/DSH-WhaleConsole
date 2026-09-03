# Releasing

English | [简体中文](RELEASING.zh-CN.md)

This guide covers Preview source tags, DSH plugin archives, and unsigned macOS test builds. Public macOS distribution additionally requires Apple Developer ID signing and notarization.

## 1. Prepare

1. Update the same version in the root workspace, launcher, plugin, skins package, Tauri configuration, and Cargo package.
2. Add the release notes to both changelogs.
3. Confirm that every changed document has matching English and Simplified Chinese content.
4. Check that artwork sources, runtime derivatives, licenses, attributions, and AI-assistance disclosures are present.

## 2. Verify

```sh
pnpm install --frozen-lockfile
pnpm docs:check
pnpm skill:check
pnpm verify
DSH_REPO=/absolute/path/to/deepseek-harness pnpm --filter dsh-whale-console test:composition
```

For UI changes, inspect the launcher and plugin skin boxes at desktop and narrow widths. Every built-in skin must show its own 16:9 thumbnail and retain readable controls.

## 3. Build Artifacts

```sh
pnpm build:preview -- --skip-install
```

The builder generates SHA-256 checksums and verifies both archives. Keep local build output under `dist/`. Source-only Preview releases do not attach the unsigned application; generated artifacts remain local unless the release policy changes.

## 4. Publish

1. Create an annotated tag such as `v0.3.0-preview.1` from a clean `main` branch.
2. Push the branch and tag.
3. Create a GitHub Preview release from the matching changelog entry.
4. Keep the locally built plugin archive, unsigned app, and checksum file off the source-only GitHub release.
5. When npm publication is enabled, publish the plugin with the `preview` dist-tag and verify a clean DSH profile installation.

Do not describe unsigned or unnotarized macOS artifacts as production-ready.
