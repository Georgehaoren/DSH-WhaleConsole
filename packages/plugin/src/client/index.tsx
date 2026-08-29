import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import { MascotOverlay } from './MascotOverlay.js'
import { SettingsCard } from './SettingsCard.js'
import { SidebarAction } from './SidebarAction.js'
import type { BoundSettingsScope, WhaleConsoleSettings } from './store.js'
import { resolved } from './store.js'
import { installStyles } from './style.js'
import { themes } from './themes.js'

export const name = 'dsh-whale-console/client'
export const inject = ['slots', 'theme', 'settingsScope']

export function apply(ctx: ClientContext): void {
  ctx.effect(installStyles, 'dsh-whale-console: styles')

  for (const theme of themes) {
    ctx.effect(() => ctx.theme.register(theme), `dsh-whale-console: theme ${theme.id}`)
  }

  const whaleConsole = ctx.settingsScope.bind<WhaleConsoleSettings>({
    namespace: 'dsh-whale-console',
  }) as unknown as BoundSettingsScope

  const syncTheme = (): void => {
    ctx.theme.setTheme(resolved(whaleConsole).theme)
  }
  syncTheme()
  ctx.effect(() => whaleConsole.subscribe(syncTheme), 'dsh-whale-console: theme preference sync')

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-whale-console-mascot',
    order: 90,
    label: 'WhaleConsole mascot',
    inject: () => ({ whaleConsole }),
  }, MascotOverlay))

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dsh-whale-console-action',
    order: 90,
    label: 'WhaleConsole',
    inject: () => ({ whaleConsole }),
  }, SidebarAction))

  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    key: 'dsh-whale-console',
    inject: () => ({ whaleConsole }),
  }, SettingsCard))
}
