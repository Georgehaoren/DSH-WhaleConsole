# Architecture

English | [简体中文](ARCHITECTURE.zh-CN.md)

## Product Boundary

WhaleConsole uses two independent surfaces:

1. The native launcher owns the local DSH process and diagnostics.
2. DSH WebUI opens in a separate webview and receives visual additions from the plugin.

The launcher never injects CSS into an arbitrary page. WebUI customization is delivered through the official DSH client module and slot systems.

## DSH Plugin

`dsh-whale-console` declares both supported package roles:

- `dsh.bundle.patch` mounts the Host half from `cordis.patch.yml`.
- `dsh.client` exposes the Web client from `./client`.

The Host half registers the `dsh-whale-console` settings namespace with Schemastery. The browser half registers three palettes, exposes five skins, and contributes to these additive slots:

- `shell.overlay`: mascot and online status.
- `sidebar.footer.action`: quick panel entry.
- `settings.plugin.item`: WhaleConsole settings card.

It does not replace `root`, the sidebar, or the conversation renderer.

The browser artifact is built as a lazy CommonJS factory and wrapped with `window.__ModuleLoader__.load`. Images are encoded into that artifact as WebP data URLs, so the DSH plugin route only needs to serve `client.js`.

## Skin System

`packages/skins` is the single source of truth for skin identifiers, categories, mascot bindings, artwork keys, thumbnail keys, swatches, and palette tokens. Each skin has one fixed 16:9 WebP thumbnail under `packages/skins/assets/thumbnails`; both surfaces import the same file through small typed mappings. The PNG source masters remain beside the runtime files under `source/`.

Character overlay artwork remains surface-specific because the launcher serves it through Vite while the plugin embeds it into the lazy client bundle. Thumbnail metadata is shared even though each build tool resolves the asset independently.

`skinId` is the single persisted appearance setting. The selected skin resolves both the live theme and mascot, so the Host schema does not maintain duplicate theme or character fields.

## Launcher

The Tauri backend owns one optional child process. Starting uses:

```text
pnpm dsh web --no-open --port <port>
```

The process is assigned its own Unix process group. Stop and application exit send `SIGTERM` to that group, wait briefly, and use `SIGKILL` only if it remains alive.

The child receives a `PATH` composed from the login shell plus the detected `pnpm` and Node.js directories. Source-tree file watchers use polling for reliable startup under macOS GUI process limits. Logs default to `~/Library/Logs/DSH WhaleConsole/dsh-whale-console.log`; the user may select another absolute or home-relative directory.

A reachable port without an owned child is classified as an external service. WhaleConsole can open it but will not stop or restart it.

The WebUI window has a separate label and receives no Tauri command capability. The main window hides to the menu bar; Quit performs process cleanup.

Launcher skin choice is stored locally and intentionally remains independent from the DSH WebUI skin choice. This keeps process control usable even when the plugin is not installed and avoids coupling native settings to a running WebUI session.

## Agent-Assisted Source Build

`INSTALL.md` is the stable user and remote-Agent entry. The `dsh-whale-console-install` Skill routes fresh builds, launcher-only builds, plugin-only builds, verification, updates, and diagnosis. Detailed conditional guidance is progressively disclosed through its bilingual runbook.

All executable behavior remains in `scripts/agent`. English and Chinese instructions call the same preflight, build, artifact-verification, document-pair, and Skill checks. The scripts may write ignored build output under `dist/`; they do not install system dependencies, edit a live DSH profile, stop an existing service, copy to `/Applications`, commit, or publish.

The full Preview builder deliberately uses `tauri build --bundles app`. DMG creation, signing, notarization, and public binary distribution remain outside the source-only Preview boundary.

## Compatibility

- DSH: `0.1.1-rc.2`
- Node.js: `^22.19.0 || >=24.0.0`
- pnpm: tested with `11.7.0` and `11.24.0`
- macOS: 12 or newer, arm64 Preview artifact

Every DSH release candidate may change client slots or settings contracts. Compatibility expansion should be evidence-based and gated by the real composition test.
