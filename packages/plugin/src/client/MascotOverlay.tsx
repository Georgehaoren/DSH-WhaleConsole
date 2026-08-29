import { useSyncExternalStore } from 'react'
import { getSkin } from '@dsh-whale-console/skins'
import type { BoundSettingsScope } from './store.js'
import { resolved } from './store.js'
import { skinAssets } from './skinAssets.js'

export function MascotOverlay({ whaleConsole }: { whaleConsole: BoundSettingsScope }) {
  useSyncExternalStore(
    listener => whaleConsole.subscribe(listener),
    () => whaleConsole.getSnapshot(),
  )
  const settings = resolved(whaleConsole)
  if (!settings.enabled) return null
  const skin = getSkin(settings.skinId)
  const assets = skinAssets[skin.artKey]

  return (
    <aside
      className={`wd-mascot wd-mascot--${settings.position} wd-mascot--${settings.motion} wd-mascot--${skin.category}`}
      style={{ '--wd-scale': `${settings.scale / 100}` } as React.CSSProperties}
      aria-label="WhaleConsole mascot"
    >
      <div className="wd-mascot__halo" />
      <div className="wd-mascot__portrait">
        <img src={assets.primary} alt="" />
        {assets.secondary && <img className="wd-mascot__secondary" src={assets.secondary} alt="" />}
      </div>
      <div className="wd-mascot__status">
        <span className="wd-live-dot" />
        <span>{skin.label}</span>
      </div>
    </aside>
  )
}
