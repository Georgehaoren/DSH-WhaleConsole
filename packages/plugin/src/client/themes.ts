import { themePalettes } from '@dsh-whale-console/skins'

export const themes = themePalettes

export type ThemeId = typeof themes[number]['id']
