# Installation Runbook

English | [简体中文](RUNBOOK.zh-CN.md)

Use this runbook after the Skill has selected a task mode. Commands assume the repository root unless stated otherwise.

## Fresh Source Build

1. Confirm the checkout version and inspect `git status`; never discard user changes.
2. Run `pnpm agent:preflight`.
3. If dependencies are absent, explain that installation may use the network, then run `pnpm install --frozen-lockfile` after any required authorization.
4. Run `pnpm build:preview -- --skip-install`.
5. Report the three files in `dist/` and the unsigned Preview status.

For a non-mutating rehearsal, use:

```sh
pnpm build:preview -- --dry-run --skip-install
```

## Launcher-Only Build

Run repository verification before the native build:

```sh
pnpm docs:check
pnpm skill:check
pnpm typecheck
pnpm test
pnpm --filter @dsh-whale-console/launcher run tauri:build:app
```

The app remains under `apps/launcher/src-tauri/target/release/bundle/macos/`. Do not copy it without approval.

## Resolve the DSH Command and Permissions

Prefer a compatible DSH checkout explicitly supplied by the user, already configured in the launcher, or selected through `DSH_REPO`. The current Preview requires DSH `0.1.2-rc.1`; run preflight with `--dsh-repo=/absolute/path` and do not treat another release candidate as compatible without composition evidence. Treat defaults such as `~/deepseek-harness` only as candidates that must be checked. Do not clone, pull, or switch DSH revisions merely to install the plugin. Source environments do not guarantee a global `dsh` executable, so invoke `pnpm dsh` from the verified checkout by default. A bare `dsh` is optional only when `command -v dsh` actually succeeds.

Before installation, identify and request minimally scoped write access to the DSH checkout, target `~/.dsh/profiles/web`, and that profile's active pnpm store. Read the store path from an existing `node_modules/.modules.yaml` `storeDir` when available. Do not rewrite it, force-reinstall dependencies, or migrate the store to work around permissions. If write access cannot be granted, stop and give the confirmed complete install command to the user for execution in a normal Terminal.

## Plugin-Only Build and Installation

Build and inspect the package first:

```sh
pnpm --filter dsh-whale-console run pack
tar -tzf dist/dsh-whale-console-<version>.tgz
```

After user confirmation, install it from the DSH checkout with an absolute tarball path:

```sh
pnpm dsh plugin --profile web add /absolute/path/to/dsh-whale-console-<version>.tgz
```

After the official command succeeds, DSH maintains `dsh.profile.bundles` from each installed package's `dsh.bundle` declaration. Do not append the bundle manually or remove existing plugins. Record the `.tgz` path and checksum, and tell the user to retain the local archive because the profile and lockfile reference its path and integrity. If an existing profile references the target file, compare its version and checksum before repacking; different contents must not replace an installed archive under the same version and filename.

Validate in this order before restarting or first launch:

```sh
pnpm dsh plugin --profile web list
pnpm dsh --profile web --dump-config
```

Neither command is guaranteed to be read-only: the former may open the pnpm store SQLite index for writing, while the latter runs profile preparation and may create or update `cordis.yml`. If permissions block official validation, inspect the target profile `package.json` and `pnpm-lock.yaml`, `node_modules/<package>/package.json`, the `dsh.bundle.patch` and `dsh.client.platform` declarations, `cordis.patch.yml`, and both server and browser entry files in that order. When the browser entry expects `window`, use `node --check` for syntax rather than importing it into plain Node.

File inspection proves installation state but does not fully replace composition or runtime validation. Report every command blocked by permissions. If DSH is running, restart that instance once after first adding the plugin. If its port is closed, the next normal launch is sufficient; do not create a meaningless start-then-restart cycle.

## Real DSH Composition Test

The repository test uses a temporary `DSH_HOME`, random local port, and packed plugin. It does not install into the user's real profile:

```sh
DSH_REPO=/absolute/path/to/deepseek-harness \
  pnpm --filter dsh-whale-console test:composition
```

This test may create package-manager temporary files in the DSH checkout. Obtain filesystem permission when the execution environment requires it. DSH `0.1.2` protects WebUI with a browser-session exchange; the test consumes the process launch token, stores only the returned cookie in memory, and redacts the token from failures.

## Update and Rebuild

Only update when explicitly requested. Inspect local changes first, fetch without rewriting the worktree, compare the requested tag or branch, and use fast-forward-only pulls. Re-run the full Preview build after any source update. Never use destructive reset or checkout commands to discard changes.

## Diagnosis

- Environment failure: use `pnpm agent:preflight -- --json` and address only failed checks.
- Type or test failure: stop at that layer and preserve its output.
- Rust failure: run the locked Cargo check separately and report the first actionable error.
- Plugin failure: inspect tar contents, profile dependencies and bundle list, installed package metadata, composed DSH config, boot entry, and client route in that order.
- `plugin list` reports SQLite `unable to open database file`: first check minimally scoped write access to the active pnpm store. Do not infer corruption or force a store migration or reinstall from this error alone.
- `--dump-config` reports a profile-write `EPERM`: composition preparation needs to write `cordis.yml`. Fall back to file inspection, report the missing composition check, and do not call the two methods equivalent.
- Launcher startup failure: inspect the configured persistent log directory and current service ownership state. On DSH `0.1.2`, a plain loopback request returning `401` means the browser-session exchange did not happen; confirm that an owned process printed its authenticated launch URL, but redact the token from every report.
- Packaging failure: use `--bundles app`; DMG creation is outside the source-only Preview contract.

Do not solve diagnosis by disabling security controls, editing dependency output, deleting lockfiles, or reinstalling unrelated tools.
