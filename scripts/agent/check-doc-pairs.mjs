import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const manifestPath = resolve(root, 'docs/document-pairs.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const errors = []
const declared = new Set()

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

function count(pattern, value) {
  return value.match(pattern)?.length ?? 0
}

for (const pair of manifest.pairs) {
  for (const key of ['en', 'zh']) {
    if (declared.has(pair[key])) errors.push(`Duplicate document entry: ${pair[key]}`)
    declared.add(pair[key])
  }

  const enPath = resolve(root, pair.en)
  const zhPath = resolve(root, pair.zh)
  if (!(await isFile(enPath))) errors.push(`Missing English document: ${pair.en}`)
  if (!(await isFile(zhPath))) errors.push(`Missing Chinese document: ${pair.zh}`)
  if (!(await isFile(enPath)) || !(await isFile(zhPath))) continue

  if (extname(enPath) === '.md' && extname(zhPath) === '.md') {
    const [en, zh] = await Promise.all([readFile(enPath, 'utf8'), readFile(zhPath, 'utf8')])
    if (pair.crossLinks !== false) {
      if (!en.includes(pair.zh.split('/').at(-1))) errors.push(`${pair.en} does not link to ${pair.zh}`)
      if (!zh.includes(pair.en.split('/').at(-1))) errors.push(`${pair.zh} does not link to ${pair.en}`)
    }
    const enFences = count(/^```/gm, en)
    const zhFences = count(/^```/gm, zh)
    if (enFences % 2 || zhFences % 2) errors.push(`Unclosed code fence in ${pair.en} or ${pair.zh}`)
    if (enFences !== zhFences) errors.push(`Code-fence count differs: ${pair.en} (${enFences}) / ${pair.zh} (${zhFences})`)

    const enHeadings = count(/^#{1,6}\s+/gm, en)
    const zhHeadings = count(/^#{1,6}\s+/gm, zh)
    if (enHeadings !== zhHeadings) errors.push(`Heading count differs: ${pair.en} (${enHeadings}) / ${pair.zh} (${zhHeadings})`)
  }
}

async function walk(directory, include) {
  const found = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) found.push(...await walk(path, include))
    else if (include(path)) found.push(relative(root, path).split(sep).join('/'))
  }
  return found
}

const userDocs = []
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && (entry.name.endsWith('.md') || entry.name === 'LICENSE')) userDocs.push(entry.name)
}
userDocs.push(...await walk(resolve(root, 'docs'), path => path.endsWith('.md')))
for (const entry of await readdir(resolve(root, 'packages/plugin'), { withFileTypes: true })) {
  if (entry.isFile() && (entry.name.endsWith('.md') || entry.name === 'LICENSE')) userDocs.push(`packages/plugin/${entry.name}`)
}
userDocs.push(...await walk(resolve(root, '.agents'), path => path.endsWith('.md')))
userDocs.push(...await walk(resolve(root, '.github/PULL_REQUEST_TEMPLATE'), path => path.endsWith('.md')))
userDocs.push(...await walk(resolve(root, '.github/ISSUE_TEMPLATE'), path => path.endsWith('.yml') && !path.endsWith('/config.yml')))

for (const path of userDocs) {
  if (!declared.has(path)) errors.push(`User-facing document is not paired: ${path}`)
}

if (errors.length) {
  process.stderr.write(`${errors.map(error => `- ${error}`).join('\n')}\n`)
  process.exit(1)
}

process.stdout.write(`Verified ${manifest.pairs.length} English/Chinese document pairs.\n`)
