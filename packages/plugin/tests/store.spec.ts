import { describe, expect, it } from 'vitest'
import type { BoundSettingsScope, WhaleConsoleSettings } from '../src/client/store.js'
import { resolved } from '../src/client/store.js'

function scope(value: Partial<WhaleConsoleSettings>): BoundSettingsScope {
  return {
    getSnapshot: () => ({ value, writable: true }),
    subscribe: () => () => undefined,
    set: async () => undefined,
    unset: async () => undefined,
  }
}

describe('WhaleConsole settings resolution', () => {
  it('uses an explicit skin as the source of its palette and mascot', () => {
    const settings = resolved(scope({ skinId: 'harness-chibi' }))
    expect(settings.skinId).toBe('harness-chibi')
    expect(settings.theme).toBe('whale-engineer-dark')
    expect(settings.mascot).toBe('harness-engineer')
  })

  it('falls back to the default skin when the stored value is absent', () => {
    expect(resolved(scope({})).skinId).toBe('harness-standard')
  })
})
