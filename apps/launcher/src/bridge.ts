import { invoke } from '@tauri-apps/api/core'
import type { EnvironmentInfo, LauncherConfig, ServiceStatus } from './types'

const isTauri = '__TAURI_INTERNALS__' in window

const mockEnvironment: EnvironmentInfo = {
  projectDir: '~/deepseek-harness',
  pnpmPath: 'pnpm',
  dshVersion: '0.1.2-rc.1',
  nodeVersion: '24.20.0',
  native: false,
}

let mockStatus: ServiceStatus = {
  phase: 'stopped',
  url: 'http://127.0.0.1:3080',
  message: '服务尚未启动',
  owned: false,
  logPath: '~/Library/Logs/DSH WhaleConsole/dsh-whale-console.log',
}

const logPath = (config: LauncherConfig) => `${config.logDir.replace(/\/$/, '')}/dsh-whale-console.log`

const pause = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms))

export const launcherBridge = {
  isNative: isTauri,

  async environment(): Promise<EnvironmentInfo> {
    return isTauri ? invoke('get_environment') : mockEnvironment
  },

  async status(config: LauncherConfig): Promise<ServiceStatus> {
    if (isTauri) return invoke('get_status', { config })
    return { ...mockStatus, url: `http://127.0.0.1:${config.port}`, logPath: logPath(config) }
  },

  async start(config: LauncherConfig): Promise<ServiceStatus> {
    if (isTauri) return invoke('start_service', { config })
    mockStatus = {
      ...mockStatus,
      phase: 'starting',
      message: '正在加载 DSH WebUI…',
      owned: true,
      pid: 42861,
      startedAt: Date.now(),
      url: `http://127.0.0.1:${config.port}`,
      launchUrl: `http://127.0.0.1:${config.port}/?token=browser-preview`,
      logPath: logPath(config),
    }
    await pause(950)
    mockStatus = { ...mockStatus, phase: 'ready', message: '服务已就绪' }
    return mockStatus
  },

  async stop(): Promise<ServiceStatus> {
    if (isTauri) return invoke('stop_service')
    await pause(500)
    mockStatus = { ...mockStatus, phase: 'stopped', message: '服务已停止', owned: false, pid: undefined, launchUrl: undefined }
    return mockStatus
  },

  async restart(config: LauncherConfig): Promise<ServiceStatus> {
    if (isTauri) return invoke('restart_service', { config })
    await this.stop()
    return this.start(config)
  },

  async openWebui(url: string): Promise<void> {
    if (isTauri) await invoke('open_webui', { url })
    else window.open(url, '_blank', 'noopener,noreferrer')
  },

  async logs(): Promise<string> {
    if (isTauri) return invoke('read_logs')
    return [
      '[WhaleConsole] Preview mode: native service control is simulated.',
      '[DSH] Web bundle composed successfully.',
      '[DSH] Listening on http://127.0.0.1:3080',
    ].join('\n')
  },
}
