import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

export const name = 'dsh-whale-console'
export const WHALE_CONSOLE_NAMESPACE = settingsNamespace('dsh-whale-console')

export type WhaleConsoleSkin = 'harness-standard' | 'harness-medium' | 'harness-chibi' | 'maid-standard' | 'dual-standard'
export type WhaleConsolePosition = 'left' | 'right'
export type WhaleConsoleMotion = 'off' | 'subtle'

export interface Config {
  enabled: boolean
  skinId: WhaleConsoleSkin
  position: WhaleConsolePosition
  scale: number
  motion: WhaleConsoleMotion
  showDuringConversation: boolean
}

export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true),
  skinId: z.union(['harness-standard', 'harness-medium', 'harness-chibi', 'maid-standard', 'dual-standard'] as const)
    .default('harness-standard'),
  position: z.union(['left', 'right'] as const).default('right'),
  scale: z.number().min(70).max(140).step(5).default(100),
  motion: z.union(['off', 'subtle'] as const).default('subtle'),
  showDuringConversation: z.boolean().default(true),
})

export function apply(ctx: Context, config: Config): void {
  let source = (): Config => config
  installSettingsSection(ctx, WHALE_CONSOLE_NAMESPACE, Config, config, {
    validate: (value) => {
      if (value.scale < 70 || value.scale > 140) {
        throw new Error('WhaleConsole mascot scale must be between 70 and 140.')
      }
    },
    setSource: current => { source = current },
    onChange: () => {
      source()
    },
  })
}
