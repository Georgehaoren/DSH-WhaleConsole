# Changelog

English | [简体中文](CHANGELOG.zh-CN.md)

## 0.2.1-preview.1

- Established the public project identity as DSH WhaleConsole before the first source release.
- Added one fixed 16:9 WebUI thumbnail to each of the five launcher and plugin skin cards.
- Rendered the previews from the real WhaleConsole interface styles and matching original character artwork.
- Replaced the chibi runtime key art with the ChatGPT-redrawn v2 character, retained its matching character sheet, and added a reproducible macOS thumbnail renderer.
- Added GitHub Actions CI, Dependabot, bilingual issue and pull request templates, and release documentation.
- Added bilingual AI-assisted creation disclosures to the repository and distributable plugin package.
- Added bilingual source-install documents, an Agent installation Skill, and a progressively disclosed runbook.
- Added deterministic preflight, Preview build, artifact verification, document-pair, and Skill validation scripts.
- Pinned the verified Node.js and CI Rust toolchains, selected local stable Rust, and made CI run the source-only Preview builder.
- Prepared the workspace as a public source repository with generated artifacts and local caches excluded.

## 0.2.0-preview.1

- Added a shared skin manifest used by both the native launcher and the DSH WebUI plugin.
- Added launcher and WebUI skin boxes with standard, medium, chibi, Deep Sea Maid, and Dual Whale skins.
- Added de-logoed transparent medium and chibi Harness Engineer artwork with optimized WebP runtime assets.
- Added live category filtering, one-click apply, default restore, mascot visibility, and WebUI undo controls.
- Consolidated palette and mascot selection under a single persisted `skinId`.

## 0.1.0-preview.1

- Added the macOS Tauri launcher with process lifecycle, logs, tray behavior, and a separate WebUI window.
- Added the combined DSH Bundle and Client plugin.
- Added three live themes, mascot overlay, sidebar quick panel, and plugin settings card.
- Added original Harness Engineer, Deep Sea Maid, and black-whale application artwork.
- Added real DSH composition verification for `0.1.1-rc.2`.
- Added complete English and Simplified Chinese documentation sets.
- Fixed native launches that could not resolve Node.js from `pnpm`, and added a configurable persistent log directory.
