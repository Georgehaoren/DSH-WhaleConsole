import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('launcher preview contract', () => {
  it('keeps the launcher frameless and the WebUI in a separate window command', async () => {
    const config = JSON.parse(await readFile(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'))
    const rust = await readFile(new URL('../src-tauri/src/lib.rs', import.meta.url), 'utf8')
    expect(config.app.windows[0].decorations).toBe(false)
    expect(rust).toContain('fn open_webui')
    expect(rust).toContain('WebviewWindowBuilder::new(&app, "webui"')
  })

  it('ships lifecycle controls and all preview skins', async () => {
    const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
    const settingsDialog = await readFile(new URL('../src/SettingsDialog.tsx', import.meta.url), 'utf8')
    const skinBox = await readFile(new URL('../src/SkinBoxDialog.tsx', import.meta.url), 'utf8')
    const thumbnails = await readFile(new URL('../src/skinThumbnails.ts', import.meta.url), 'utf8')
    const registry = await readFile(new URL('../../../packages/skins/src/index.ts', import.meta.url), 'utf8')
    expect(app).toContain("launcher.act('start')")
    expect(app).toContain("launcher.act('stop')")
    expect(app).toContain("launcher.act('restart')")
    expect(app).toContain("'dsh-whale-console.launcher-config.v1'")
    expect(skinBox).toContain("from '@dsh-whale-console/skins'")
    expect(skinBox).toContain('visible.map')
    expect(skinBox).toContain('skinThumbnails[skin.thumbnailKey]')
    expect(thumbnails.match(/\.webp'/g)).toHaveLength(5)
    expect(registry).toContain("id: 'harness-medium'")
    expect(registry).toContain("id: 'harness-chibi'")
    expect(registry).toContain("id: 'maid-standard'")
    expect(registry).toContain("id: 'dual-standard'")
    expect(settingsDialog).toContain('config.logDir')
  })

  it('passes a login-shell PATH and writes logs to the configured directory', async () => {
    const rust = await readFile(new URL('../src-tauri/src/lib.rs', import.meta.url), 'utf8')
    expect(rust).toContain('runtime_path')
    expect(rust).toContain('.env("PATH"')
    expect(rust).toContain('config.log_dir')
    expect(rust).toContain('create_dir_all')
  })
})
