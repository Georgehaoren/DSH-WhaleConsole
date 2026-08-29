import { FolderOpen, Play, RefreshCw, RotateCcw, Square, TerminalSquare } from 'lucide-react'
import { getSkin } from '@dsh-whale-console/skins'
import type { EnvironmentInfo, LauncherConfig, ServiceStatus } from './types'

const STATUS_LABEL = {
  stopped: '未启动',
  starting: '启动中',
  ready: '运行中',
  external: '外部服务',
  error: '需要检查',
}

interface Props {
  status: ServiceStatus
  environment: EnvironmentInfo | null
  config: LauncherConfig
  busy: boolean
  onStart(): void
  onStop(): void
  onRestart(): void
  onOpen(): void
  onLogs(): void
}

export function ServicePanel({ status, environment, config, busy, onStart, onStop, onRestart, onOpen, onLogs }: Props) {
  const canOpen = status.phase === 'ready' || status.phase === 'external'
  const running = status.phase === 'ready' || status.phase === 'starting'
  const canStop = running && status.owned

  return (
    <section className="service-panel" aria-label="DSH 服务控制">
      <header className="service-header">
        <div>
          <span className={`status-dot status-dot--${status.phase}`} />
          <div>
            <p>LOCAL SERVICE</p>
            <h2>{STATUS_LABEL[status.phase]}</h2>
          </div>
        </div>
        <button type="button" className="icon-button" title="刷新状态" aria-label="刷新状态" onClick={() => window.location.reload()}>
          <RefreshCw size={17} />
        </button>
      </header>

      <div className="service-address">
        <span>{status.url}</span>
        <b>{status.pid ? `PID ${status.pid}` : 'LOCAL'}</b>
      </div>

      <div className="primary-actions">
        {!running && !canOpen ? (
          <button type="button" className="primary-button" disabled={busy} onClick={onStart}>
            <Play size={18} fill="currentColor" />
            <span>{busy ? '正在启动' : '启动 Harness'}</span>
          </button>
        ) : (
          <button type="button" className="primary-button" disabled={!canOpen || busy} onClick={onOpen}>
            <Play size={18} fill="currentColor" />
            <span>{status.phase === 'starting' ? '等待服务就绪' : '进入 WebUI'}</span>
          </button>
        )}
        <button type="button" className="square-button" title="重新启动" aria-label="重新启动" disabled={busy || !canStop} onClick={onRestart}>
          <RotateCcw size={18} />
        </button>
        <button type="button" className="square-button square-button--danger" title="停止服务" aria-label="停止服务" disabled={busy || !canStop} onClick={onStop}>
          <Square size={16} fill="currentColor" />
        </button>
      </div>

      <div className="runtime-info">
        <div><span>DSH 版本</span><b>{environment?.dshVersion ?? '检测中'}</b></div>
        <div><span>Node.js</span><b>{environment?.nodeVersion ?? '检测中'}</b></div>
        <div><span>当前皮肤</span><b>{getSkin(config.skinId).label}</b></div>
      </div>

      <div className="path-row">
        <FolderOpen size={15} />
        <span title={config.projectDir}>{config.projectDir}</span>
      </div>

      <button type="button" className="log-button" onClick={onLogs}>
        <TerminalSquare size={16} />
        <span>查看运行记录</span>
      </button>
    </section>
  )
}
