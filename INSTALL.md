# Source Installation

English | [简体中文](INSTALL.zh-CN.md)

DSH WhaleConsole Preview is distributed as source. The supported path builds an unsigned macOS application and a local DSH plugin archive on the user's Mac.

## Supported Preview

- macOS 12 or newer on Apple Silicon (`arm64`).
- DSH `0.1.1-rc.2` checkout for plugin installation and composition testing.
- Node.js `^22.19.0 || >=24.0.0`, pnpm `11.24.0`, stable Rust (verified with `1.98.0`), and Xcode Command Line Tools.
- This workflow does not disable Gatekeeper, create a DMG, sign the app, or notarize it.

## Manual Build

Run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm agent:preflight
pnpm build:preview -- --skip-install
```

The build performs bilingual-document checks, Skill validation, type checks, tests, web builds, a locked Cargo check, plugin packing, the Tauri app build, ZIP creation, and checksum verification.

## Outputs

Generated files remain under the ignored `dist/` directory:

```text
dist/dsh-whale-console-<version>.tgz
dist/DSH-WhaleConsole-<version>-macos-arm64.zip
dist/SHA256SUMS-<version>.txt
```

## Install the Plugin

Installing the plugin changes the selected DSH profile. Review the archive and stop here until the user authorizes that change.

```sh
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add /absolute/path/to/dsh-whale-console-<version>.tgz
```

Adding the package requires one DSH restart. Later skin changes are handled inside WhaleConsole and do not require the build Agent.

## Install the Launcher

The ZIP contains `DSH WhaleConsole.app`. It can be opened from the extracted directory or, after explicit user approval, copied to `/Applications`.

```sh
unzip DSH-WhaleConsole-<version>-macos-arm64.zip
open "DSH WhaleConsole.app"
```

The launcher project path, pnpm path, port, and log directory remain user-editable in Settings.

## Use an Agent

Use a local coding Agent with filesystem and terminal access. Send it this prompt from an already cloned checkout:

```text
Work only in the current DSH WhaleConsole repository. Read INSTALL.md, then load
.agents/skills/dsh-whale-console-install/SKILL.md and follow its source-build
workflow. Use the repository scripts for preflight, build, and artifact
verification. Ask before installing system dependencies, modifying a DSH
profile, stopping a service, or copying the app to /Applications. Do not
commit, create a remote, push, change shell configuration, or disable macOS
security controls.
```

An ordinary chat assistant without local filesystem and terminal access cannot complete this workflow.

## Safety Boundaries

- Do not use `sudo`, change `.zshrc`, modify global Git configuration, or disable Gatekeeper to make the build pass.
- Do not run `git pull` unless the user explicitly asks to update the checkout.
- Do not stop processes by name. Let the WhaleConsole launcher manage its owned DSH process group.
- Do not edit DSH profile YAML or `node_modules` directly; use the official DSH plugin command.
- Do not publish unredacted logs, home-directory paths, credentials, or API keys.

## Troubleshooting

Run `pnpm agent:preflight -- --json` for machine-readable environment results. Build failures should be fixed at their reported layer rather than bypassed by changing system security settings. See [SECURITY.md](SECURITY.md) and [ARCHITECTURE.md](docs/ARCHITECTURE.md) for project boundaries.
