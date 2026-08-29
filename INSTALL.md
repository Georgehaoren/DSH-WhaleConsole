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

Installing the plugin changes the selected DSH profile and writes to the pnpm store. Review the archive, confirm the target DSH checkout, and stop until the user authorizes that change. The source workflow does not assume a global `dsh` command; use `pnpm dsh` from a compatible DSH checkout:

```sh
cd /absolute/path/to/deepseek-harness
pnpm dsh plugin --profile web add /absolute/path/to/dsh-whale-console-<version>.tgz
```

In a restricted Agent environment, this command commonly needs minimally scoped write access to the DSH checkout, `~/.dsh/profiles/web`, and the active pnpm store (commonly `~/Library/pnpm/store` on macOS). If those permissions cannot be obtained, stop and give the complete command above to the user for execution in a normal Terminal. Do not rewrite the profile, fabricate store state, or request unrestricted filesystem access as a workaround.

The local tarball path and integrity are recorded in the profile and `pnpm-lock.yaml`. Keep the original `.tgz` at that path until the plugin is removed, reinstalled from another path, or replaced by a registry release. Do not overwrite the same filename with a different build while keeping the version unchanged; bump the version, or preserve a stable copy for the old installation and reinstall from the new path. The official plugin command maintains `dsh.profile.bundles` from each installed package's `dsh.bundle` declaration, so no manual bundle-list edit is needed and other valid plugins remain installed.

Verify from the DSH checkout after installation:

```sh
pnpm dsh plugin --profile web list
pnpm dsh --profile web --dump-config
```

These verification commands are not guaranteed to be read-only: `plugin list` may open the pnpm store index for writing, while `--dump-config` may create or update the profile's `cordis.yml`. When permissions prevent them, fall back to inspecting the profile `package.json`, `pnpm-lock.yaml`, installed package manifest, `cordis.patch.yml`, and entry files. File inspection is not equivalent to final composition validation, so report any skipped check.

If DSH is running, restart that instance once after first adding the plugin. If DSH is stopped, the next normal launch is sufficient. Later skin changes are handled inside WhaleConsole and do not require the build Agent.

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
install a plugin except through pnpm dsh in a verified DSH checkout. Request
only the minimal write scope for the checkout, target profile, and pnpm store;
if unavailable, hand me the complete command instead of rewriting the profile
or migrating the store. Follow the runbook for verification side effects. Do not
commit, create a remote, push, change shell configuration, or disable macOS
security controls.
```

An ordinary chat assistant without local filesystem and terminal access cannot complete this workflow.

## Safety Boundaries

- Do not use `sudo`, change `.zshrc`, modify global Git configuration, or disable Gatekeeper to make the build pass.
- Do not run `git pull` unless the user explicitly asks to update the checkout.
- Do not stop processes by name. Let the WhaleConsole launcher manage its owned DSH process group.
- Do not edit DSH profile YAML or `node_modules` directly; use the official DSH plugin command.
- An Agent should request only the directories required for installation; do not make `danger-full-access`, unrestricted filesystem access, or sandbox disabling a standard installation step.
- Do not publish unredacted logs, home-directory paths, credentials, or API keys.

## Troubleshooting

Run `pnpm agent:preflight -- --json` for machine-readable environment results. Build failures should be fixed at their reported layer rather than bypassed by changing system security settings. See [SECURITY.md](SECURITY.md) and [ARCHITECTURE.md](docs/ARCHITECTURE.md) for project boundaries.
