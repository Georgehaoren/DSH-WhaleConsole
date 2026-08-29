import type { SkinArtKey } from '@dsh-whale-console/skins'
import harnessStandard from './assets/harness-engineer.webp'
import harnessMedium from './assets/harness-engineer-medium.webp'
import harnessChibi from './assets/harness-engineer-chibi.webp'
import maidStandard from './assets/deepsea-maid.webp'

export interface SkinAssetSet {
  primary: string
  secondary?: string
}

export const skinAssets: Record<SkinArtKey, SkinAssetSet> = {
  'harness-standard': { primary: harnessStandard },
  'harness-medium': { primary: harnessMedium },
  'harness-chibi': { primary: harnessChibi },
  'maid-standard': { primary: maidStandard },
  'dual-standard': { primary: harnessStandard, secondary: maidStandard },
}
