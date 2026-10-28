/**
 * 生成 Internet Archive 直连存储节点映射。
 * 运行：node tools/gen-archive-servers.mjs
 */
import { writeFileSync } from 'node:fs'
import { REAL_CATALOG } from '../src/data/realCatalog.js'

const identifiers = new Set()
for (const video of REAL_CATALOG) {
  for (const episode of video.episodes || []) {
    for (const src of episode.srcs || []) {
      try {
        const url = new URL(src)
        const parts = url.pathname.split('/').filter(Boolean)
        if (url.hostname === 'archive.org' && parts[0] === 'download' && parts[1]) {
          identifiers.add(decodeURIComponent(parts[1]))
        }
      } catch (e) {
        /* 无效地址会由片源检查脚本报告 */
      }
    }
  }
}

async function fetchMeta(identifier) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`, {
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const servers = [...new Set([data.d1, data.d2, data.server].filter(Boolean))]
    if (!servers.length || !data.dir) throw new Error('缺少存储节点')
    return [identifier, { dir: data.dir, servers }]
  } finally {
    clearTimeout(timer)
  }
}

const jobs = [...identifiers].sort()
const entries = []
const failures = []
let cursor = 0

await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < jobs.length) {
      const identifier = jobs[cursor++]
      try {
        entries.push(await fetchMeta(identifier))
      } catch (error) {
        failures.push(`${identifier}: ${error?.message || error}`)
      }
    }
  })
)

entries.sort(([a], [b]) => a.localeCompare(b))
const content = `/**
 * 由 tools/gen-archive-servers.mjs 生成。
 * Archive 主域名不可达时，播放器会改用这些实际存储节点。
 */
export const ARCHIVE_SERVERS = ${JSON.stringify(Object.fromEntries(entries), null, 2)}
`

writeFileSync(new URL('../src/data/archiveServers.js', import.meta.url), content, 'utf8')
console.log(`已写入 ${entries.length} 个 Archive 存储节点映射`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}
