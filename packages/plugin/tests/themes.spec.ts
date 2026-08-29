import { describe, expect, it } from 'vitest'
import { themes } from '../src/client/themes.js'

describe('WhaleConsole themes', () => {
  it('registers three unique namespaced themes', () => {
    expect(new Set(themes.map(theme => theme.id)).size).toBe(3)
    expect(themes.map(theme => theme.id)).toEqual([
      'whale-engineer-dark',
      'deep-sea-maid',
      'dual-whale',
    ])
  })

  it('keeps required text and surface tokens in every theme', () => {
    for (const theme of themes) {
      expect(theme.tokens['--dsw-alias-bg-base']).toBeTruthy()
      expect(theme.tokens['--dsw-alias-label-primary']).toBeTruthy()
      expect(theme.tokens['--dsw-alias-brand-primary']).toBeTruthy()
    }
  })
})
