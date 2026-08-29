import type { SkinArtKey } from '@dsh-whale-console/skins'

export interface SkinAssetSet {
  primary: string
  secondary?: string
}

export const skinAssets: Record<SkinArtKey, SkinAssetSet> = {
  'harness-standard': { primary: '/assets/harness-engineer.webp' },
  'harness-medium': { primary: '/assets/harness-engineer-medium.webp' },
  'harness-chibi': { primary: '/assets/harness-engineer-chibi.webp' },
  'maid-standard': { primary: '/assets/deepsea-maid.webp' },
  'dual-standard': {
    primary: '/assets/harness-engineer.webp',
    secondary: '/assets/deepsea-maid.webp',
  },
}
