import { Activity, Cable, Cpu } from 'lucide-react'
import { getSkin, type SkinId } from '@dsh-whale-console/skins'
import { skinAssets } from './skinAssets'
import type { ServicePhase } from './types'

const COPY: Record<ServicePhase, { eyebrow: string; title: string; detail: string }> = {
  stopped: { eyebrow: 'STANDBY', title: '鲸链工程师待命', detail: '检查配置后即可唤醒 Harness。' },
  starting: { eyebrow: 'BOOT SEQUENCE', title: '正在接驳工具链', detail: 'Cordis、插件与 WebUI 正在组合。' },
  ready: { eyebrow: 'SYSTEM ONLINE', title: '总包工程师已就位', detail: 'WebUI 服务稳定，可以进入工作区。' },
  external: { eyebrow: 'PORT OCCUPIED', title: '发现外部 DSH 服务', detail: 'WhaleConsole 不会接管非本启动器创建的进程。' },
  error: { eyebrow: 'DIAGNOSTIC', title: '启动链路需要检查', detail: '打开运行记录可查看具体原因。' },
}

export function CharacterStage({ phase, skinId }: { phase: ServicePhase; skinId: SkinId }) {
  const skin = getSkin(skinId)
  const theme = skin.themeId
  const baseCopy = COPY[phase]
  const themedTitle = theme === 'deep-sea-maid'
    ? phase === 'ready' ? 'DeepSeek 娘已就位' : phase === 'stopped' ? '深海助理待命' : baseCopy.title
    : theme === 'dual-whale'
      ? phase === 'ready' ? '双鲸协作链已就位' : phase === 'stopped' ? '双鲸搭档待命' : baseCopy.title
      : baseCopy.title
  const copy = { ...baseCopy, title: themedTitle }
  const linkLabel = theme === 'deep-sea-maid' ? 'ASSISTANT' : theme === 'dual-whale' ? 'DUAL LINK' : 'HARNESS'
  const assets = skinAssets[skin.artKey]
  return (
    <section className={`character-stage character-stage--${theme} character-stage--skin-${skin.id}`} aria-label="Harness 娘状态舞台">
      <div className="stage-grid" aria-hidden="true" />
      <div className="stage-telemetry stage-telemetry--top">
        <Cpu size={14} />
        <span>CORDIS CORE</span>
        <b>{phase === 'ready' ? 'SYNC' : 'IDLE'}</b>
      </div>
      <div className="stage-telemetry stage-telemetry--side">
        <Cable size={14} />
        <span>{linkLabel}</span>
        <b>{phase === 'error' ? 'CHECK' : 'LINKED'}</b>
      </div>

      <div className={`character-keyart character-keyart--${phase} character-keyart--${theme} character-keyart--skin-${skin.id}`} aria-hidden="true">
        <img src={assets.primary} alt="" />
        {assets.secondary && <img className="character-keyart__secondary" src={assets.secondary} alt="" />}
      </div>

      <div className="stage-copy">
        <div className="stage-eyebrow"><Activity size={14} /><span>{copy.eyebrow}</span></div>
        <h1>{copy.title}</h1>
        <p>{copy.detail}</p>
      </div>
    </section>
  )
}
