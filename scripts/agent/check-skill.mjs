import { readFile, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const skillRoot = resolve(root, '.agents/skills/dsh-whale-console-install')
const skillPath = resolve(skillRoot, 'SKILL.md')
const translatedPath = resolve(skillRoot, 'SKILL.zh-CN.md')
const errors = []

async function exists(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

const skill = await readFile(skillPath, 'utf8')
const translated = await readFile(translatedPath, 'utf8')
const runbookPath = resolve(skillRoot, 'references/RUNBOOK.md')
const translatedRunbookPath = resolve(skillRoot, 'references/RUNBOOK.zh-CN.md')
const runbook = await readFile(runbookPath, 'utf8')
const translatedRunbook = await readFile(translatedRunbookPath, 'utf8')
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)
if (!frontmatter) errors.push('SKILL.md is missing YAML frontmatter.')
if (!frontmatter?.[1].match(/^name:\s*dsh-whale-console-install\s*$/m)) errors.push('Skill name must match its folder.')
const description = frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1] ?? ''
if (description.length < 60) errors.push('Skill description is too short to route installation requests reliably.')

for (const required of ['pnpm agent:preflight', 'pnpm build:preview', 'pnpm verify:artifacts']) {
  if (!skill.includes(required)) errors.push(`SKILL.md does not route through ${required}.`)
  if (!translated.includes(required)) errors.push(`SKILL.zh-CN.md does not route through ${required}.`)
}

for (const required of ['pnpm dsh plugin --profile web add', 'plugin list', '--dump-config']) {
  if (!skill.includes(required)) errors.push(`SKILL.md does not preserve the installation rule: ${required}.`)
  if (!translated.includes(required)) errors.push(`SKILL.zh-CN.md does not preserve the installation rule: ${required}.`)
  if (!runbook.includes(required)) errors.push(`RUNBOOK.md does not preserve the installation rule: ${required}.`)
  if (!translatedRunbook.includes(required)) errors.push(`RUNBOOK.zh-CN.md does not preserve the installation rule: ${required}.`)
}

for (const document of [skillPath, translatedPath]) {
  const body = await readFile(document, 'utf8')
  const base = dirname(document)
  for (const match of body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1]
    if (/^(https?:|#)/.test(target)) continue
    if (!(await exists(resolve(base, target)))) errors.push(`Broken skill reference in ${document}: ${target}`)
  }
}

if (errors.length) {
  process.stderr.write(`${errors.map(error => `- ${error}`).join('\n')}\n`)
  process.exit(1)
}

process.stdout.write('Validated dsh-whale-console-install skill structure and command routing.\n')
