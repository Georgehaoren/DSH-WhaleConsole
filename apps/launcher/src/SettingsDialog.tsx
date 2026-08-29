import { X } from 'lucide-react'
import type { LauncherConfig } from './types'

export function SettingsDialog({ config, onChange, onClose }: {
  config: LauncherConfig
  onChange(config: LauncherConfig): void
  onClose(): void
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header>
          <div><p>LAUNCHER PROFILE</p><h2 id="settings-title">启动器设置</h2></div>
          <button type="button" className="icon-button" aria-label="关闭设置" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="form-field">
          <label htmlFor="project-dir">DSH 项目目录</label>
          <input id="project-dir" value={config.projectDir} onChange={event => onChange({ ...config, projectDir: event.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="log-dir">日志目录</label>
          <input
            id="log-dir"
            placeholder="~/Library/Logs/DSH WhaleConsole"
            value={config.logDir}
            onChange={event => onChange({ ...config, logDir: event.target.value })}
          />
          <small>支持绝对路径或以 ~/ 开头的路径，目录会在启动时自动创建。</small>
        </div>
        <div className="settings-grid">
          <div className="form-field">
            <label htmlFor="pnpm-path">pnpm 路径</label>
            <input id="pnpm-path" value={config.pnpmPath} onChange={event => onChange({ ...config, pnpmPath: event.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="port">端口</label>
            <input id="port" type="number" min="1024" max="65535" value={config.port} onChange={event => onChange({ ...config, port: Number(event.target.value) })} />
          </div>
        </div>
        <footer><button type="button" className="primary-button" onClick={onClose}>完成</button></footer>
      </section>
    </div>
  )
}
