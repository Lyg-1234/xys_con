/**
 * 片单与片源验收：
 *   node tools/check-sources.mjs
 *   node tools/check-sources.mjs --network
 *
 * --network 会对全部主源和备用源发起 1 KiB Range 请求，耗时取决于 CDN。
 */
import { VIDEOS as REAL_CATALOG } from '../src/data/videos.js'

const checkNetwork = process.argv.includes('--network')
const failures = []
const jobs = []
const seen = new Set()
let episodeCount = 0
let sourceCount = 0

for (const video of REAL_CATALOG) {
  if (!video.title || !video.original) failures.push(`作品信息不完整：${video.title || '(无标题)'}`)
  if (!Array.isArray(video.episodes) || video.episodes.length === 0) {
    failures.push(`${video.title}: 没有分集`)
    continue
  }

  for (const episode of video.episodes) {
    episodeCount += 1
    if (!episode.title) failures.push(`${video.title}: 第 ${episode.no} 集缺少标题`)
    if (!Number.isFinite(episode.duration) || episode.duration <= 0) {
      failures.push(`${video.title} / ${episode.title}: 时长无效`)
    }
    if (!Array.isArray(episode.srcs) || episode.srcs.length === 0) {
      failures.push(`${video.title} / ${episode.title}: 没有片源`)
      continue
    }

    for (const src of episode.srcs) {
      sourceCount += 1
      try {
        const url = new URL(src)
        if (url.protocol !== 'https:') failures.push(`${video.title}: 非 HTTPS 片源 ${src}`)
      } catch (e) {
        failures.push(`${video.title}: 无效地址 ${src}`)
      }
      if (seen.has(src)) failures.push(`${video.title}: 重复片源 ${src}`)
      seen.add(src)
      if (checkNetwork) jobs.push({ label: `${video.title} / ${episode.title}`, src })
    }
  }
}

async function requestSource({ label, src }) {
  let lastError = ''
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch(src, {
        headers: { Range: 'bytes=0-1023' },
        redirect: 'follow',
        cache: 'no-store',
        signal: controller.signal
      })
      const type = response.headers.get('content-type') || ''
      const okStatus = response.status === 200 || response.status === 206
      const okType = /video|octet-stream/i.test(type)
      await response.body?.cancel()
      if (okStatus && okType) return
      lastError = `HTTP ${response.status}, ${type || '无 Content-Type'}`
      if (response.status < 500 || attempt === 3) break
    } catch (error) {
      lastError = error?.name === 'AbortError' ? '请求超时' : String(error?.message || error)
    } finally {
      clearTimeout(timer)
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 600))
  }
  failures.push(`${label}: ${lastError} (${src})`)
}

if (checkNetwork) {
  let cursor = 0
  const workers = Array.from({ length: Math.min(8, jobs.length) }, async () => {
    while (cursor < jobs.length) {
      const index = cursor++
      await requestSource(jobs[index])
      if (index > 0 && index % 40 === 0) {
        console.log(`已检查 ${index}/${jobs.length} 个片源`)
      }
    }
  })
  await Promise.all(workers)
}

console.log(`片单：${REAL_CATALOG.length} 部，${episodeCount} 集，${sourceCount} 个片源`)
console.log(checkNetwork ? '网络检查：已检查全部片源' : '网络检查：未启用（增加 --network）')

if (failures.length) {
  console.error(`\n发现 ${failures.length} 个问题：`)
  failures.forEach((item) => console.error(`- ${item}`))
  process.exitCode = 1
} else {
  console.log('\n片源检查通过')
}
