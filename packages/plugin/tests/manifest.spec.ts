import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('plugin manifest', () => {
  it('declares both official DSH plugin roles', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    expect(manifest.dsh.bundle.patch).toBe('./cordis.patch.yml')
    expect(manifest.dsh.client.platform).toBe('web')
    expect(manifest.exports['./client'].default).toBe('./lib/client.js')
    expect(manifest.exports['./package.json']).toBe('./package.json')
    expect(manifest.files).toEqual(expect.arrayContaining(['AI_DISCLOSURE.md', 'AI_DISCLOSURE.zh-CN.md']))
  })

  it('uses the preview channel version', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    expect(manifest.version).toMatch(/^0\.\d+\.\d+-preview\./)
  })

  it('targets the DSH 0.1.2 client and settings contracts', async () => {
    const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
    const dshPeers = Object.entries(manifest.peerDependencies)
      .filter(([name]) => name.startsWith('@deepseek-ai/dsh-'))
    expect(dshPeers).not.toHaveLength(0)
    expect(dshPeers.every(([, version]) => version === '0.1.2-rc.1')).toBe(true)
    expect(manifest.peerDependencies['@deepseek-ai/dsh-client-runtime']).toBeUndefined()
  })

  it('maps one fixed thumbnail to every skin card', async () => {
    const sidebar = await readFile(new URL('../src/client/SidebarAction.tsx', import.meta.url), 'utf8')
    const thumbnails = await readFile(new URL('../src/client/skinThumbnails.ts', import.meta.url), 'utf8')
    expect(sidebar).toContain('skinThumbnails[skin.thumbnailKey]')
    expect(thumbnails.match(/\.webp'/g)).toHaveLength(5)
  })

  it('declares the shared skin identifier in the default DSH patch', async () => {
    const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
    expect(patch).toContain('skinId: harness-standard')
  })
})
