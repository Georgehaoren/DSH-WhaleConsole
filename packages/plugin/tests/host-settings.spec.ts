import type { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { apply, WHALE_CONSOLE_NAMESPACE, type Config } from '../src/index.js'

describe('WhaleConsole host settings', () => {
  it('installs its section through the DSH 0.1.2 settings provider', () => {
    type InstallHooks = {
      setSource(source: () => Config): void
      onChange(): void
    }
    const installSection = vi.fn((
      _owner: Context,
      _namespace: string,
      _schema: unknown,
      _entry: Config,
      hooks: InstallHooks,
    ) => {
      hooks.setSource(() => config)
      hooks.onChange()
    })
    const inject = vi.fn((
      _services: string[],
      callback: (settingsCtx: { settings: { installSection: typeof installSection } }) => void,
    ) => {
      callback({ settings: { installSection } })
    })
    const ctx = { inject } as unknown as Context
    const config: Config = {
      enabled: true,
      skinId: 'harness-standard',
      position: 'right',
      scale: 100,
      motion: 'subtle',
      showDuringConversation: true,
    }

    apply(ctx, config)

    expect(inject).toHaveBeenCalledWith(['settings'], expect.any(Function))
    expect(installSection).toHaveBeenCalledWith(
      ctx,
      WHALE_CONSOLE_NAMESPACE,
      expect.anything(),
      config,
      expect.objectContaining({
        validate: expect.any(Function),
        setSource: expect.any(Function),
        onChange: expect.any(Function),
      }),
    )
  })
})
