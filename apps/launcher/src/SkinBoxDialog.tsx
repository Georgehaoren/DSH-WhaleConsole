import { useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { defaultSkinId, skins, type SkinCategory, type SkinId } from '@dsh-whale-console/skins'
import { skinThumbnails } from './skinThumbnails'

type Filter = 'all' | SkinCategory

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'standard', label: '标准' },
  { id: 'medium', label: '中号' },
  { id: 'chibi', label: 'Q版' },
]

export function SkinBoxDialog({ selected, onSelect, onClose }: {
  selected: SkinId
  onSelect(skinId: SkinId): void
  onClose(): void
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const visible = filter === 'all' ? skins : skins.filter(skin => skin.category === filter)

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="skin-box-dialog" role="dialog" aria-modal="true" aria-labelledby="skin-box-title">
        <header>
          <div><p>WHALE_CONSOLE SKINS</p><h2 id="skin-box-title">皮肤盒子</h2></div>
          <button type="button" className="icon-button" title="关闭皮肤盒子" aria-label="关闭皮肤盒子" onClick={onClose}><X size={18} /></button>
        </header>

        <nav className="skin-filters" aria-label="皮肤分类">
          {FILTERS.map(item => (
            <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>
          ))}
        </nav>

        <div className="skin-gallery">
          {visible.map(skin => {
            return (
              <button
                key={skin.id}
                type="button"
                className={`skin-card skin-card--${skin.themeId}`}
                aria-pressed={selected === skin.id}
                onClick={() => onSelect(skin.id)}
              >
                <span className="skin-card__preview" aria-hidden="true">
                  <img className="skin-card__thumbnail" src={skinThumbnails[skin.thumbnailKey]} alt="" />
                </span>
                <span className="skin-card__copy"><b>{skin.label}</b><small>{skin.subtitle}</small></span>
                <span className="skin-card__swatches" aria-hidden="true">
                  {skin.swatches.map(color => <i key={color} style={{ background: color }} />)}
                </span>
                {selected === skin.id && <Check className="skin-card__check" size={17} />}
              </button>
            )
          })}
        </div>

        <footer>
          <span>选择后立即应用，并保存在本机启动器配置中。</span>
          <button type="button" className="secondary-button" onClick={() => onSelect(defaultSkinId)}><RotateCcw size={15} />恢复默认</button>
        </footer>
      </section>
    </div>
  )
}
