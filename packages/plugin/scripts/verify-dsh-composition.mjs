import { execFileSync, spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const workspaceRoot = resolve(pluginRoot, '../..')
const tsc = resolve(workspaceRoot, 'node_modules/.bin/tsc')
const dshRepo = process.env.DSH_REPO
const expectedDshVersion = '0.1.2-rc.1'
if (!dshRepo) {
  throw new Error(`Set DSH_REPO to a DeepSeek Harness ${expectedDshVersion} checkout before running this test.`)
}
const dshManifest = JSON.parse(readFileSync(resolve(dshRepo, 'package.json'), 'utf8'))
if (dshManifest.version !== expectedDshVersion) {
  throw new Error(`Expected DSH ${expectedDshVersion}, found ${String(dshManifest.version)} at ${dshRepo}.`)
}

const scratch = mkdtempSync(join(tmpdir(), 'dsh-whale-console-composition-'))
const dshHome = join(scratch, 'home')
let child

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      DSH_HOME: dshHome,
      npm_config_cache: process.env.npm_config_cache ?? join(scratch, 'npm-cache'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function freePort() {
  const server = createServer()
  await new Promise((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolveListen)
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 3190
  await new Promise(resolveClose => server.close(resolveClose))
  return port
}

function redacted(text) {
  return text.replace(/([?&]token=)[^\s)]+/gu, '$1<redacted>')
}

async function waitFor(url, options = {}, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  let lastError
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      lastError = new Error(`${url} returned ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 500))
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`)
}

async function waitForLaunchUrl(output, process, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const match = /dsh web: (http:\/\/[^\s]+)/u.exec(output())
    if (match?.[1] !== undefined) return match[1]
    if (process.exitCode !== null) {
      throw new Error(`DSH exited before WebUI became ready (${String(process.exitCode)}).\n${redacted(output())}`)
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 250))
  }
  throw new Error(`Timed out waiting for the authenticated DSH launch URL.\n${redacted(output())}`)
}

try {
  run(tsc, ['-p', resolve(workspaceRoot, 'packages/skins/tsconfig.build.json')], workspaceRoot)
  run('node', [resolve(pluginRoot, 'scripts/build.mjs')], pluginRoot)
  run(tsc, ['-p', resolve(pluginRoot, 'tsconfig.build.json')], workspaceRoot)
  run('npm', ['pack', '--pack-destination', scratch], pluginRoot)
  const tarball = readdirSync(scratch).find(name => name.endsWith('.tgz'))
  if (!tarball) throw new Error('Plugin tarball was not created.')

  run('pnpm', ['dsh', 'plugin', '--profile', 'web', 'add', join(scratch, tarball)], dshRepo)
  const config = run('pnpm', ['dsh', '--profile', 'web', '--dump-default-config'], dshRepo)
  if (!config.includes('id: dsh-whale-console') || !config.includes('skinId: harness-standard')) {
    throw new Error('WhaleConsole host layer is missing from the composed DSH profile.')
  }

  const port = await freePort()
  child = spawn('pnpm', ['dsh', '--profile', 'web', '--no-open', '--port', String(port)], {
    cwd: dshRepo,
    detached: true,
    env: {
      ...process.env,
      DSH_HOME: dshHome,
      CHOKIDAR_USEPOLLING: 'true',
      WATCHPACK_POLLING: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let diagnostics = ''
  child.stdout.on('data', chunk => { diagnostics += chunk.toString() })
  child.stderr.on('data', chunk => { diagnostics += chunk.toString() })

  const launchUrl = await waitForLaunchUrl(() => diagnostics, child)
  const exchange = await fetch(launchUrl, { redirect: 'manual' })
  if (exchange.status !== 303) {
    throw new Error(`DSH browser-session exchange returned ${exchange.status}.\n${redacted(diagnostics)}`)
  }
  const setCookie = exchange.headers.get('set-cookie')
  if (setCookie === null) {
    throw new Error(`DSH browser-session exchange omitted Set-Cookie.\n${redacted(diagnostics)}`)
  }
  const cookie = setCookie.split(';', 1)[0]
  const origin = new URL(launchUrl).origin
  const authenticated = { headers: { cookie } }
  const index = await waitFor(`${origin}/`, authenticated)
  const html = await index.text()
  const encodedBundlePath = /\/plugins\/\?\?[^"'<>]*dsh-whale-console\/client\.js[^"'<>]*/u.exec(html)?.[0]
  if (encodedBundlePath === undefined) {
    throw new Error(`WhaleConsole client is missing from the DSH boot graph.\n${redacted(diagnostics)}`)
  }
  const bundlePath = encodedBundlePath.replaceAll('&amp;', '&')
  const bundle = await waitFor(new URL(bundlePath, origin), authenticated)
  const source = await bundle.text()
  if (
    !source.includes('window.__ModuleLoader__.load')
    || !source.includes('id: "dsh-whale-console"')
    || !source.includes('harness-medium')
    || !source.includes('harness-chibi')
  ) {
    throw new Error('WhaleConsole client artifact is not a lazy-CJS module-loader factory.')
  }
  process.stdout.write(`WhaleConsole composed successfully with DSH at ${origin}/\n`)
} finally {
  if (child?.pid) {
    try {
      process.kill(-child.pid, 'SIGTERM')
    } catch {
      child.kill('SIGTERM')
    }
    if (child.exitCode === null) {
      await new Promise(resolveExit => {
        const timeout = setTimeout(() => {
          try {
            process.kill(-child.pid, 'SIGKILL')
          } catch {
            child.kill('SIGKILL')
          }
        }, 5_000)
        child.once('close', () => {
          clearTimeout(timeout)
          resolveExit()
        })
      })
    }
  }
  rmSync(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}
