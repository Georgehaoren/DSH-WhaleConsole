import type { SkinId } from '@dsh-whale-console/skins'

export type ServicePhase = 'stopped' | 'starting' | 'ready' | 'external' | 'error'

export interface LauncherConfig {
  projectDir: string
  pnpmPath: string
  logDir: string
  port: number
  skinId: SkinId
}

export interface ServiceStatus {
  phase: ServicePhase
  pid?: number
  url: string
  message: string
  owned: boolean
  logPath: string
  startedAt?: number
}

export interface EnvironmentInfo {
  projectDir: string
  pnpmPath: string
  dshVersion?: string
  nodeVersion?: string
  native: boolean
}
