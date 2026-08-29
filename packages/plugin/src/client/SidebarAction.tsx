import { useState, useSyncExternalStore } from 'react'
import { skins, type SkinCategory, type SkinId } from '@dsh-whale-console/skins'
import type { BoundSettingsScope } from './store.js'
import { resolved } from './store.js'
import { skinThumbnails } from './skinThumbnails.js'
import { WhaleMark } from './WhaleMark.js'

type Filter = 'all' | SkinCategory

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'standard', label: '标准' },
  { id: 'medium', label: '中号' },
  { id: 'chibi', label: 'Q版' },
]

export function SidebarAction({ whaleConsole, wide = false }: { whaleConsole: BoundSettingsScope; wide?: boolean }) {
  useSyncExternalStore(listener => whaleConsole.subscribe(listener), () => whaleConsole.getSnapshot())
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [previous, setPrevious] = useState<SkinId | null>(null)
  const settings = resolved(whaleConsole)
  const visible = filter === 'all' ? skins : skins.filter(skin => skin.category === filter)

  async function select(skinId: SkinId) {
    if (skinId === settings.skinId) return
    setPrevious(settings.skinId)
    await whaleConsole.set('skinId', skinId)
  }

  return (
    <div className="wd-sidebar-action">
      <button
        type="button"
        className="wd-icon-button"
        aria-label="打开 WhaleConsole 皮肤盒子"
        title="WhaleConsole 皮肤盒子"
        onClick={() => setOpen(value => !value)}
      >
        <WhaleMark variant={settings.mascot === 'deepseek-maid' ? 'maid' : 'engineer'} />
      </button>
      {open && (
        <div
          className="wd-quick-panel"
          style={{ '--wd-sidebar-offset': wide ? '286px' : '62px' } as React.CSSProperties}
          role="dialog"
          aria-label="WhaleConsole 皮肤盒子"
        >
          <header>
            <div><strong>皮肤盒子</strong><span>当前：{skins.find(skin => skin.id === settings.skinId)?.label}</span></div>
            <button type="button" className="wd-panel-close" aria-label="关闭皮肤盒子" onClick={() => setOpen(false)}>×</button>
          </header>

          <nav className="wd-skin-filters" aria-label="皮肤分类">
            {FILTERS.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
          </nav>

          <div className="wd-skin-grid">
            {visible.map(skin => {
              return (
                <button key={skin.id} type="button" className={`wd-skin-card wd-skin-card--${skin.themeId}`} aria-pressed={settings.skinId === skin.id} onClick={() => select(skin.id)}>
                  <span className="wd-skin-preview" aria-hidden="true">
                    <img className="wd-skin-thumbnail" src={skinThumbnails[skin.thumbnailKey]} alt="" />
                  </span>
                  <span><b>{skin.label}</b><small>{skin.subtitle}</small></span>
                </button>
              )
            })}
          </div>

          <footer>
            <button type="button" onClick={() => whaleConsole.set('enabled', !settings.enabled)}>{settings.enabled ? '隐藏角色' : '显示角色'}</button>
            <button type="button" disabled={!previous} onClick={() => previous && select(previous)}>撤销换肤</button>
          </footer>
        </div>
      )}
    </div>
  )
}
