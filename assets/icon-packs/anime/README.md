# Anime Extra Icon Pack

English | [简体中文](README.zh-CN.md)

This optional pack contains AI-assisted character icons for personal DSH WhaleConsole builds. It does not replace the default app icon or add a runtime icon picker by itself.

## Included Icons

| Icon | PNG source | macOS icon |
| --- | --- | --- |
| Harness Chibi V Sign | `harness-chibi-v-sign.png` | `harness-chibi-v-sign.icns` |
| Deep Sea Maid Chibi Wave | `deep-sea-maid-chibi-wave.png` | `deep-sea-maid-chibi-wave.icns` |

The PNG files are the 1254x1254 ChatGPT-generated source illustrations. Each ICNS file contains the standard 16, 32, 128, 256, 512, and 1024 pixel macOS representations.

`manifest.json` provides stable icon IDs, bilingual names, character bindings, and relative asset paths for a future build selector or launcher icon panel.

## Rebuild

Run the converter on macOS whenever a source PNG changes:

```sh
scripts/png-to-icns.sh INPUT.png OUTPUT.icns
```

Changing the permanent Finder icon of an app requires selecting the icon before packaging or modifying a private app copy. Runtime Dock-icon switching is a separate launcher feature and is not implemented by this asset pack.

These icons follow the repository's AI-assisted creation disclosure and CC BY 4.0 asset license. Attribution: `DSH WhaleConsole contributors`.
