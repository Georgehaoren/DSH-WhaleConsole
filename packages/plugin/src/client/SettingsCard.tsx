import { useState, useSyncExternalStore } from 'react'
import { skins, type SkinId } from '@dsh-whale-console/skins'
import type { BoundSettingsScope, WhaleConsoleSettings } from './store.js'
import { resolved } from './store.js'

export function SettingsCard({ whaleConsole }: { whaleConsole: BoundSettingsScope }) {
  useSyncExternalStore(listener => whaleConsole.subscribe(listener), () => whaleConsole.getSnapshot())
  const settings = resolved(whaleConsole)
  const [saving, setSaving] = useState<string | null>(null)

  async function set<K extends keyof WhaleConsoleSettings>(field: K, value: WhaleConsoleSettings[K]) {
    setSaving(field)
    try {
      await whaleConsole.set(field, value)
    } finally {
      setSaving(null)
    }
  }

  return (
    <section className="wd-settings-card">
      <header>
        <div>
          <p>DSH WhaleConsole</p>
          <h3>鲸控台皮肤与角色</h3>
        </div>
        <label className="wd-switch">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={event => set('enabled', event.target.checked)}
          />
          <span aria-hidden="true" />
          <b>{settings.enabled ? '已启用' : '已停用'}</b>
        </label>
      </header>

      <div className="wd-setting-row">
        <label htmlFor="wd-skin">当前皮肤</label>
        <select id="wd-skin" value={settings.skinId} onChange={event => set('skinId', event.target.value as SkinId)}>
          {skins.map(skin => <option key={skin.id} value={skin.id}>{skin.label} · {skin.subtitle}</option>)}
        </select>
      </div>

      <div className="wd-setting-row wd-setting-row--range">
        <label htmlFor="wd-scale">角色大小 <output>{settings.scale}%</output></label>
        <input id="wd-scale" type="range" min="70" max="140" step="5" value={settings.scale} onChange={event => set('scale', Number(event.target.value))} />
      </div>

      <fieldset>
        <legend>停靠位置</legend>
        <div className="wd-segmented">
          <button type="button" aria-pressed={settings.position === 'left'} onClick={() => set('position', 'left')}>左侧</button>
          <button type="button" aria-pressed={settings.position === 'right'} onClick={() => set('position', 'right')}>右侧</button>
        </div>
      </fieldset>

      <label className="wd-check-row">
        <input type="checkbox" checked={settings.motion === 'subtle'} onChange={event => set('motion', event.target.checked ? 'subtle' : 'off')} />
        <span>启用轻微待机动画</span>
      </label>
      <p className="wd-save-state" aria-live="polite">{saving ? '正在保存设置…' : '更改会同步到当前 DSH 配置。'}</p>
    </section>
  )
}
