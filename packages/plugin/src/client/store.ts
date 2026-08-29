import {
  defaultSkinId,
  getSkin,
  isSkinId,
  type SkinId,
  type SkinMascot,
  type SkinThemeId,
} from '@dsh-whale-console/skins'

export interface WhaleConsoleSettings {
  enabled: boolean
  skinId: SkinId
  position: 'left' | 'right'
  scale: number
  motion: 'off' | 'subtle'
  showDuringConversation: boolean
}

export const defaults: WhaleConsoleSettings = {
  enabled: true,
  skinId: defaultSkinId,
  position: 'right',
  scale: 100,
  motion: 'subtle',
  showDuringConversation: true,
}

export interface BoundSettingsScope {
  getSnapshot(): {
    value?: Partial<WhaleConsoleSettings>
    writable?: boolean
  }
  subscribe(listener: () => void): () => void
  set(field: keyof WhaleConsoleSettings, value: WhaleConsoleSettings[keyof WhaleConsoleSettings]): Promise<void>
  unset(field: keyof WhaleConsoleSettings): Promise<void>
}

export interface ResolvedWhaleConsoleSettings extends WhaleConsoleSettings {
  theme: SkinThemeId
  mascot: SkinMascot
}

export function resolved(scope: BoundSettingsScope): ResolvedWhaleConsoleSettings {
  const snapshot = scope.getSnapshot().value ?? {}
  const value = { ...defaults, ...snapshot }
  const skinId = isSkinId(snapshot.skinId) ? snapshot.skinId : defaultSkinId
  const skin = getSkin(skinId)
  return { ...value, skinId, theme: skin.themeId, mascot: skin.mascot }
}
