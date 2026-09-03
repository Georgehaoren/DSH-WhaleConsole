import { useEffect, useMemo, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Minus, Palette, Settings, X } from 'lucide-react'
import { defaultSkinId, getSkin, isSkinId } from '@dsh-whale-console/skins'
import { launcherBridge } from './bridge'
import { CharacterStage } from './CharacterStage'
import { LogDrawer } from './LogDrawer'
import { ServicePanel } from './ServicePanel'
import { SkinBoxDialog } from './SkinBoxDialog'
import { SettingsDialog } from './SettingsDialog'
import type { LauncherConfig } from './types'
import { useLauncher } from './useLauncher'

const STORAGE_KEY = 'dsh-whale-console.launcher-config.v1'
const defaultConfig: LauncherConfig = {
  projectDir: '~/deepseek-harness',
  pnpmPath: 'pnpm',
  logDir: '~/Library/Logs/DSH WhaleConsole',
  port: 3080,
  skinId: defaultSkinId,
}

function loadConfig(): LauncherConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    const skinId = isSkinId(saved.skinId) ? saved.skinId : defaultSkinId
    return { ...defaultConfig, ...saved, skinId }
  } catch {
    return defaultConfig
  }
}

export default function App() {
  const [config, setConfig] = useState(loadConfig)
  const [hadSavedConfig] = useState(() => localStorage.getItem(STORAGE_KEY) !== null)
  const [showSettings, setShowSettings] = useState(false)
  const [showSkins, setShowSkins] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const launcher = useLauncher(config)
  const appWindow = useMemo(() => launcherBridge.isNative ? getCurrentWindow() : null, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    document.body.dataset.theme = getSkin(config.skinId).themeId
  }, [config])

  useEffect(() => {
    if (hadSavedConfig || launcher.environment === null) return
    setConfig(current => ({
      ...current,
      projectDir: launcher.environment?.projectDir ?? current.projectDir,
      pnpmPath: launcher.environment?.pnpmPath ?? current.pnpmPath,
    }))
  }, [hadSavedConfig, launcher.environment])

  async function openLogs() {
    setShowLogs(true)
    await launcher.loadLogs()
  }

  const skin = getSkin(config.skinId)

  return (
    <main className={`launcher launcher--${skin.themeId} launcher--skin-${skin.id}`}>
      <header className="titlebar" data-tauri-drag-region>
        <div className="brand-lockup" data-tauri-drag-region>
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div><b>DSH WhaleConsole</b><span>DSH 鲸控台 · PREVIEW 01</span></div>
        </div>
        <div className="titlebar-actions">
          {!launcherBridge.isNative && <span className="preview-badge">浏览器预览</span>}
          <button type="button" className="icon-button" title="皮肤盒子" aria-label="皮肤盒子" onClick={() => setShowSkins(true)}><Palette size={17} /></button>
          <button type="button" className="icon-button" title="设置" aria-label="设置" onClick={() => setShowSettings(true)}><Settings size={17} /></button>
          {appWindow && <button type="button" className="icon-button" title="最小化" aria-label="最小化" onClick={() => appWindow.minimize()}><Minus size={17} /></button>}
          {appWindow && <button type="button" className="icon-button icon-button--close" title="隐藏到菜单栏" aria-label="隐藏到菜单栏" onClick={() => appWindow.hide()}><X size={17} /></button>}
        </div>
      </header>

      <div className="launcher-content">
        <CharacterStage phase={launcher.status.phase} skinId={config.skinId} />
        <ServicePanel
          status={launcher.status}
          environment={launcher.environment}
          config={config}
          busy={launcher.busy}
          onStart={() => launcher.act('start')}
          onStop={() => launcher.act('stop')}
          onRestart={() => launcher.act('restart')}
          onOpen={() => launcherBridge.openWebui(launcher.status.launchUrl ?? launcher.status.url)}
          onLogs={openLogs}
        />
      </div>

      <footer className="launcher-footer">
        <span><i className={`footer-dot footer-dot--${launcher.status.phase}`} />{launcher.status.message}</span>
        <span>UNOFFICIAL COMMUNITY PREVIEW</span>
      </footer>

      {showSettings && <SettingsDialog config={config} onChange={setConfig} onClose={() => setShowSettings(false)} />}
      {showSkins && <SkinBoxDialog selected={config.skinId} onSelect={skinId => setConfig(current => ({ ...current, skinId }))} onClose={() => setShowSkins(false)} />}
      {showLogs && <LogDrawer logs={launcher.logs} path={launcher.status.logPath} onClose={() => setShowLogs(false)} />}
    </main>
  )
}
