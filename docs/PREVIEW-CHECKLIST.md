# Preview Release Checklist

English | [简体中文](PREVIEW-CHECKLIST.zh-CN.md)

## Required

- [x] Bundle and Client roles declared in one package.
- [x] `./package.json` exported for DSH client discovery.
- [x] Lazy-CJS client factory generated.
- [x] Host settings namespace and browser settings card use the same key.
- [x] Additive slots only; no root or core surface replacement.
- [x] Real DSH profile composition verified against `0.1.2-rc.1`.
- [x] Client entry appears in the DSH boot graph and is served successfully.
- [x] Launcher process ownership distinguishes internal and external services.
- [x] Application exit cleans up the owned process group.
- [x] Desktop and narrow viewport screenshots checked.
- [x] Five unique fixed thumbnails, category filters, and live palette switching checked.
- [x] A single `skinId` controls both palette and character without duplicate appearance fields.
- [x] Original artwork and asset license included.
- [x] Bilingual AI-assisted creation disclosure included in the repository and plugin archive.
- [x] Bilingual source-install entry, Agent Skill, and detailed runbook included.
- [x] One shared script path handles preflight, build, artifact verification, and document-pair checks.
- [x] Unofficial-project disclaimer included.
- [x] Publishable package links to the public repository and uses an owner-specific macOS bundle identifier.
- [x] Default bilingual pull request template, bilingual conduct policy, and private vulnerability reporting included.

## Before Public Distribution

- [ ] Publish `dsh-whale-console@preview` to npm.
- [x] Add macOS CI for type checks, tests, web builds, and native Cargo checks.
- [x] Make CI exercise the same source-only Preview builder used by local Agents.
- [ ] Add a signed arm64 release-build job after Apple credentials are available.
- [ ] Sign with Apple Developer ID.
- [ ] Notarize `.app` and `.dmg`.
- [ ] Test a clean user account with a registry-installed DSH package.
- [ ] Run dependency and security review.
- [ ] Capture final release screenshots and checksums.
