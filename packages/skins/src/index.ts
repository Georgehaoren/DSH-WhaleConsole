export type SkinCategory = 'standard' | 'medium' | 'chibi'
export type SkinThemeId = 'whale-engineer-dark' | 'deep-sea-maid' | 'dual-whale'
export type SkinMascot = 'harness-engineer' | 'deepseek-maid' | 'duo'
export type SkinArtKey =
  | 'harness-standard'
  | 'harness-medium'
  | 'harness-chibi'
  | 'maid-standard'
  | 'dual-standard'
export type SkinThumbnailKey = SkinArtKey

export interface SkinDefinition {
  id: string
  category: SkinCategory
  themeId: SkinThemeId
  mascot: SkinMascot
  artKey: SkinArtKey
  thumbnailKey: SkinThumbnailKey
  label: string
  labelEn: string
  subtitle: string
  swatches: readonly [string, string, string]
}

export const skins = [
  {
    id: 'harness-standard',
    category: 'standard',
    themeId: 'whale-engineer-dark',
    mascot: 'harness-engineer',
    artKey: 'harness-standard',
    thumbnailKey: 'harness-standard',
    label: '鲸链工程师',
    labelEn: 'Whale Engineer',
    subtitle: '标准立绘 / 石墨黑',
    swatches: ['#101114', '#242936', '#38d8ff'],
  },
  {
    id: 'harness-medium',
    category: 'medium',
    themeId: 'whale-engineer-dark',
    mascot: 'harness-engineer',
    artKey: 'harness-medium',
    thumbnailKey: 'harness-medium',
    label: '中号鲸链工程师',
    labelEn: 'Medium Whale Engineer',
    subtitle: '紧凑比例 / 工程挂件',
    swatches: ['#101114', '#1b2636', '#2f9fff'],
  },
  {
    id: 'harness-chibi',
    category: 'chibi',
    themeId: 'whale-engineer-dark',
    mascot: 'harness-engineer',
    artKey: 'harness-chibi',
    thumbnailKey: 'harness-chibi',
    label: 'Q版鲸链工程师',
    labelEn: 'Chibi Whale Engineer',
    subtitle: 'Q版比例 / 电光青',
    swatches: ['#0d1118', '#263149', '#39dcff'],
  },
  {
    id: 'maid-standard',
    category: 'standard',
    themeId: 'deep-sea-maid',
    mascot: 'deepseek-maid',
    artKey: 'maid-standard',
    thumbnailKey: 'maid-standard',
    label: '深海女仆',
    labelEn: 'Deep Sea Maid',
    subtitle: '标准立绘 / 海雾蓝',
    swatches: ['#edf6ff', '#8fbdf2', '#4176e6'],
  },
  {
    id: 'dual-standard',
    category: 'standard',
    themeId: 'dual-whale',
    mascot: 'duo',
    artKey: 'dual-standard',
    thumbnailKey: 'dual-standard',
    label: '双鲸协作',
    labelEn: 'Dual Whale',
    subtitle: '双角色 / 极光青',
    swatches: ['#101519', '#28515b', '#5bd9d0'],
  },
] as const satisfies readonly SkinDefinition[]

export type SkinId = typeof skins[number]['id']

export const defaultSkinId: SkinId = 'harness-standard'

export const themePalettes = [
  {
    id: 'whale-engineer-dark',
    colorScheme: 'dark' as const,
    tokens: {
      '--dsw-alias-bg-base': '#101114',
      '--dsw-alias-bg-layer-1': '#181b22',
      '--dsw-alias-bg-layer-2': '#242936',
      '--dsw-alias-bg-overlay': '#171a21',
      '--dsw-alias-border-l1': '#303746',
      '--dsw-alias-border-l2': '#43516b',
      '--dsw-alias-brand-primary': '#38d8ff',
      '--dsw-alias-label-primary': '#f4f7fb',
      '--dsw-alias-label-secondary': '#aab6c7',
      '--dsw-specific-sidebar-fill': '#13161c',
    },
  },
  {
    id: 'deep-sea-maid',
    colorScheme: 'light' as const,
    tokens: {
      '--dsw-alias-bg-base': '#f4f9ff',
      '--dsw-alias-bg-layer-1': '#ffffff',
      '--dsw-alias-bg-layer-2': '#e9f3ff',
      '--dsw-alias-bg-overlay': '#ffffff',
      '--dsw-alias-border-l1': '#c8daf0',
      '--dsw-alias-border-l2': '#9ebbdc',
      '--dsw-alias-brand-primary': '#4176e6',
      '--dsw-alias-label-primary': '#17273e',
      '--dsw-alias-label-secondary': '#526982',
      '--dsw-specific-sidebar-fill': '#e8f3ff',
    },
  },
  {
    id: 'dual-whale',
    colorScheme: 'dark' as const,
    tokens: {
      '--dsw-alias-bg-base': '#11151a',
      '--dsw-alias-bg-layer-1': '#192127',
      '--dsw-alias-bg-layer-2': '#222e36',
      '--dsw-alias-bg-overlay': '#182329',
      '--dsw-alias-border-l1': '#344550',
      '--dsw-alias-border-l2': '#4d6574',
      '--dsw-alias-brand-primary': '#5bd9d0',
      '--dsw-alias-label-primary': '#f3faf9',
      '--dsw-alias-label-secondary': '#adc6c2',
      '--dsw-specific-sidebar-fill': '#141b20',
    },
  },
] as const

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === 'string' && skins.some(skin => skin.id === value)
}

export function getSkin(value: unknown): (typeof skins)[number] {
  return skins.find(skin => skin.id === value) ?? skins[0]
}

export function getThemePalette(value: SkinThemeId): (typeof themePalettes)[number] {
  return themePalettes.find(theme => theme.id === value) ?? themePalettes[0]
}
