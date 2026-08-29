import { useCallback, useEffect, useRef, useState } from 'react'
import { launcherBridge } from './bridge'
import type { EnvironmentInfo, LauncherConfig, ServiceStatus } from './types'

const initialStatus: ServiceStatus = {
  phase: 'stopped',
  url: 'http://127.0.0.1:3080',
  message: '正在检查本机环境…',
  owned: false,
  logPath: '/tmp/dsh-whale-console.log',
}

export function useLauncher(config: LauncherConfig) {
  const [status, setStatus] = useState<ServiceStatus>(initialStatus)
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [logs, setLogs] = useState('')
  const configRef = useRef(config)
  configRef.current = config

  const refresh = useCallback(async () => {
    try {
      setStatus(await launcherBridge.status(configRef.current))
    } catch (error) {
      setStatus(current => ({ ...current, phase: 'error', message: String(error) }))
    }
  }, [])

  useEffect(() => {
    let active = true
    launcherBridge.environment().then(info => {
      if (active) setEnvironment(info)
    }).catch(() => undefined)
    void refresh()
    const timer = window.setInterval(refresh, 1500)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [refresh])

  const act = useCallback(async (operation: 'start' | 'stop' | 'restart') => {
    setBusy(true)
    try {
      const next = operation === 'stop'
        ? await launcherBridge.stop()
        : operation === 'restart'
          ? await launcherBridge.restart(configRef.current)
          : await launcherBridge.start(configRef.current)
      setStatus(next)
    } catch (error) {
      setStatus(current => ({ ...current, phase: 'error', message: String(error) }))
    } finally {
      setBusy(false)
    }
  }, [])

  const loadLogs = useCallback(async () => {
    try {
      setLogs(await launcherBridge.logs())
    } catch (error) {
      setLogs(`无法读取运行记录：${String(error)}`)
    }
  }, [])

  return { status, environment, busy, logs, refresh, act, loadLogs }
}
