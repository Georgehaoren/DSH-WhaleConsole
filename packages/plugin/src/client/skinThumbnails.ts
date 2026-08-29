import type { SkinThumbnailKey } from '@dsh-whale-console/skins'
import harnessStandard from '../../../skins/assets/thumbnails/harness-standard.webp'
import harnessMedium from '../../../skins/assets/thumbnails/harness-medium.webp'
import harnessChibi from '../../../skins/assets/thumbnails/harness-chibi.webp'
import maidStandard from '../../../skins/assets/thumbnails/maid-standard.webp'
import dualStandard from '../../../skins/assets/thumbnails/dual-standard.webp'

export const skinThumbnails: Record<SkinThumbnailKey, string> = {
  'harness-standard': harnessStandard,
  'harness-medium': harnessMedium,
  'harness-chibi': harnessChibi,
  'maid-standard': maidStandard,
  'dual-standard': dualStandard,
}
