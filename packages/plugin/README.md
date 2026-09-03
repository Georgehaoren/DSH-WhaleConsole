# DSH WhaleConsole

English | [简体中文](README.zh-CN.md)

DSH WhaleConsole is an unofficial preview plugin that adds five original whale-character skins, fixed per-skin thumbnails, live palette switching, a mascot overlay, a sidebar skin box, and a settings card to DSH WebUI.

Open the whale button in the WebUI sidebar to preview and switch among the standard, medium, chibi, Deep Sea Maid, and Dual Whale skins. Every card uses its own 16:9 preview, and the selection is saved through the official DSH settings namespace.

## Install

```sh
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add dsh-whale-console@preview
```

Use this command after the Preview package is published. For local source builds, pack the plugin and pass the absolute path of the generated `dist/` tarball to the same `pnpm dsh plugin --profile web add` command. A global `dsh` installation is not required for the source workflow.

## Compatibility

- DSH: `0.1.2-rc.1`
- Node.js: `^22.19.0 || >=24.0.0`
- Platform: DSH WebUI

This project is not affiliated with, endorsed by, or sponsored by DeepSeek. DSH is used descriptively under the upstream brand guidelines.

Parts of the plugin and its original artwork were created or revised with generative AI under human direction and review. See [AI_DISCLOSURE.md](AI_DISCLOSURE.md).
