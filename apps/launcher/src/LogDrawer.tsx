import { Copy, X } from 'lucide-react'

export function LogDrawer({ logs, path, onClose }: { logs: string; path: string; onClose(): void }) {
  return (
    <aside className="log-drawer" aria-label="运行记录">
      <header>
        <div><p>DIAGNOSTICS</p><h2>运行记录</h2></div>
        <div>
          <button type="button" className="icon-button" title="复制记录" aria-label="复制记录" onClick={() => navigator.clipboard.writeText(logs)}><Copy size={17} /></button>
          <button type="button" className="icon-button" title="关闭记录" aria-label="关闭记录" onClick={onClose}><X size={18} /></button>
        </div>
      </header>
      <pre>{logs || '暂无记录。'}</pre>
      <footer>{path}</footer>
    </aside>
  )
}
