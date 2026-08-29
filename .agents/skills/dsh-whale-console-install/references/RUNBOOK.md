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

Use `pnpm dsh plugin --profile web list` and `pnpm dsh --profile web --dump-config` to confirm package identity and composition before restarting an existing service.

## Real DSH Composition Test

The repository test uses a temporary `DSH_HOME`, random local port, and packed plugin. It does not install into the user's real profile:

```sh
DSH_REPO=/absolute/path/to/deepseek-harness \
  pnpm --filter dsh-whale-console test:composition
```

This test may create package-manager temporary files in the DSH checkout. Obtain filesystem permission when the execution environment requires it.

## Update and Rebuild

Only update when explicitly requested. Inspect local changes first, fetch without rewriting the worktree, compare the requested tag or branch, and use fast-forward-only pulls. Re-run the full Preview build after any source update. Never use destructive reset or checkout commands to discard changes.

## Diagnosis

- Environment failure: use `pnpm agent:preflight -- --json` and address only failed checks.
- Type or test failure: stop at that layer and preserve its output.
- Rust failure: run the locked Cargo check separately and report the first actionable error.
- Plugin failure: inspect tar contents, DSH plugin list, composed config, boot entry, and client route in that order.
- Launcher startup failure: inspect the configured persistent log directory and current service ownership state.
- Packaging failure: use `--bundles app`; DMG creation is outside the source-only Preview contract.

Do not solve diagnosis by disabling security controls, editing dependency output, deleting lockfiles, or reinstalling unrelated tools.
