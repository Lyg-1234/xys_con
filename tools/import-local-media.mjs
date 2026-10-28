/**
 * 扫描 public/media/<频道>/<片名>/<分集>.mp4 并生成本地片单。
 * 只处理用户自行提供、拥有播放和分发授权的文件。
 */
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../public/media/', import.meta.url))
const OUTPUT = fileURLToPath(new URL('../src/data/localCatalog.generated.js', import.meta.url))
const VIDEO_EXTENSIONS = new Set(['.mp4', '.m4v', '.webm', '.ogv', '.ogg'])
const CHANNEL_MAP = {
  tv: { t: 'tv', label: '电视剧' },
  电视剧: { t: 'tv', label: '电视剧' },
  movie: { t: 'movie', label: '电影' },
  电影: { t: 'movie', label: '电影' },
  variety: { t: 'variety', label: '综艺' },
  综艺: { t: 'variety', label: '综艺' },
  anime: { t: 'anime', label: '动漫' },
  动漫: { t: 'anime', label: '动漫' },
  doc: { t: 'doc', label: '纪录片' },
  纪录片: { t: 'doc', label: '纪录片' },
  kids: { t: 'kids', label: '少儿' },
  少儿: { t: 'kids', label: '少儿' }
}
const COLORS = [
  ['#193b63', '#4f9ccf'],
  ['#57345f', '#dd7f91'],
  ['#1e5b50', '#78c59c'],
  ['#68481f', '#e4b866'],
  ['#34286b', '#a88bea']
]

function hashText(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function naturalCompare(a, b) {
  return a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' })
}

function walkFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) return walkFiles(full)
    return VIDEO_EXTENSIONS.has(extname(name).toLowerCase()) ? [full] : []
  })
}

function episodeTitle(file) {
  const base = file.replace(/\.[^.]+$/, '')
  const number = base.match(/第?\s*0?(\d{1,3})\s*[集期话部]?/i)?.[1]
  const clean = base.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim()
  return number && /^\d/.test(base.trim()) ? `第${Number(number)}集 · ${clean}` : clean
}

const catalog = []
const problems = []

if (existsSync(ROOT)) {
  const channelDirs = readdirSync(ROOT)
    .map((name) => ({ name, path: join(ROOT, name) }))
    .filter(({ path }) => statSync(path).isDirectory())

  for (const channelDir of channelDirs) {
    const channel = CHANNEL_MAP[channelDir.name] || CHANNEL_MAP[channelDir.name.toLowerCase()]
    if (!channel) {
      problems.push(`未知频道目录：${channelDir.name}`)
      continue
    }

    const seriesDirs = readdirSync(channelDir.path)
      .map((name) => ({ name, path: join(channelDir.path, name) }))
      .filter(({ path }) => statSync(path).isDirectory())

    for (const series of seriesDirs) {
      const files = walkFiles(series.path).sort(naturalCompare)
      if (!files.length) continue
      const episodeUnit = channel.t === 'movie' ? '部' : channel.t === 'variety' ? '期' : channel.t === 'anime' ? '话' : '集'
      const title = series.name
      const hash = hashText(`${channel.t}:${title}`)
      const color = COLORS[hash % COLORS.length]
      const id = `local-${channel.t}-${hash.toString(36)}`

      catalog.push({
        id,
        local: true,
        t: channel.t,
        title,
        original: '',
        y: new Date().getFullYear(),
        region: '本地',
        g: ['本地授权'],
        s: 8,
        hot: 0,
        vip: false,
        badge: '本地',
        c: color,
        e: '📁',
        desc: `从本机 public/media/${channelDir.name}/${title} 导入的授权视频，共 ${files.length} ${episodeUnit}。`,
        director: '本地媒体',
        cast: [],
        episodes: files.map((file, index) => {
          const filePath = relative(ROOT, file).split('\\').join('/')
          const fileTitle = episodeTitle(filePath.split('/').pop())
          return {
            no: index + 1,
            title: files.length === 1 ? '正片' : fileTitle || `第${index + 1}${episodeUnit}`,
            duration: 1,
            srcs: [`media/${filePath}`]
          }
        })
      })
    }
  }
}

const content = `/**
 * 授权本地视频清单，由 tools/import-local-media.mjs 生成。
 * 请勿手工编辑；运行 npm run import:media 重新扫描。
 */
export const LOCAL_CATALOG = ${JSON.stringify(catalog, null, 2)}
`
writeFileSync(OUTPUT, content, 'utf8')
console.log(`已导入 ${catalog.length} 部本地作品，共 ${catalog.reduce((n, v) => n + v.episodes.length, 0)} 个视频文件`)
if (problems.length) {
  console.error(problems.join('\n'))
  process.exitCode = 1
}
