# Security Policy

English | [简体中文](SECURITY.zh-CN.md)

## Preview Status

`0.2.1-preview.1` has not received a security audit. Use it only with a trusted local DSH checkout and review the source before distribution.

## Boundaries

- The launcher binds to `127.0.0.1` and does not expose DSH to the LAN.
- It never stops a process it did not create.
- The separate WebUI window is not granted launcher command permissions.
- Logs may contain local paths or DSH diagnostics; do not publish them without review.
- API keys remain owned by DSH. WhaleConsole does not read, store, or transmit them.

## Reporting

Open a private security report with a minimal reproduction, affected version, and impact. Do not include API keys, credentials, or personal logs.
