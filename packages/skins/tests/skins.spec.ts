import { describe, expect, it } from 'vitest'
import { getSkin, getThemePalette, isSkinId, skins, themePalettes } from '../src/index.js'

describe('WhaleConsole skin registry', () => {
  it('ships five unique built-in skins across all presentation scales', () => {
    expect(new Set(skins.map(skin => skin.id)).size).toBe(5)
    expect(new Set(skins.map(skin => skin.category))).toEqual(new Set(['standard', 'medium', 'chibi']))
  })

  it('keeps every skin attached to a registered palette', () => {
    const paletteIds = new Set(themePalettes.map(theme => theme.id))
    for (const skin of skins) expect(paletteIds.has(skin.themeId)).toBe(true)
  })

  it('assigns one fixed thumbnail to every built-in skin', () => {
    expect(new Set(skins.map(skin => skin.thumbnailKey)).size).toBe(5)
    for (const skin of skins) expect(skin.thumbnailKey).toBe(skin.id)
  })

  it('resolves preview palettes from the same registry', () => {
    expect(getThemePalette('deep-sea-maid').colorScheme).toBe('light')
    expect(getThemePalette('dual-whale').tokens['--dsw-alias-brand-primary']).toBe('#5bd9d0')
  })

  it('falls back safely for unknown skin identifiers', () => {
    expect(getSkin('missing').id).toBe('harness-standard')
    expect(isSkinId('harness-chibi')).toBe(true)
  })
})
