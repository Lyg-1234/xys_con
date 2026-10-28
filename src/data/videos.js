/**
 * 视频数据源
 *
 * 片源说明：
 * 片单来自 Internet Archive「公有领域影片库」（public domain films / serials / cartoons），
 * 由 tools/gen-catalog.mjs 抓取生成到 realCatalog.js：
 *   - 片名 = 实际播放内容（不会再出现「片名与画面不符」）
 *   - 时长为片源真实时长（电影为完整长片，剧集为完整分集）
 *   - 每集配置 1~4 个同源备选地址（同一文件的不同编码），单个地址失效会自动切换
 *
 * 若你有自有 / 正版片源（例如某部剧的正版播放地址），可以在下面的 CUSTOM_SOURCES 中
 * 按视频 id 覆盖，格式：{ 'movie-01': ['https://your-cdn/ep1.mp4', ...] }，
 * 留空则继续使用内置片源。
 */
import { REAL_CATALOG } from './realCatalog.js'
import { ARCHIVE_SERVERS } from './archiveServers.js'
import { LOCAL_CATALOG } from './localCatalog.generated.js'
import { formatDuration } from '../utils/format.js'

export const CUSTOM_SOURCES = {
  // 示例：'tv-01': ['https://example.com/bonanza-01.mp4', 'https://example.com/bonanza-02.mp4']
}

// 清晰度档位。片源没有明确分辨率时，“自动”会优先使用主文件。
export const QUALITY_LIST = [
  { key: 'auto', label: '自动', desc: '自动选择最佳线路' },
  { key: '1080p', label: '蓝光 1080P', desc: '会员专享' },
  { key: '720p', label: '超清 720P', desc: '推荐网络' },
  { key: '480p', label: '高清 480P', desc: '流畅' },
  { key: '360p', label: '标清 360P', desc: '省流量' }
]

const UNIT = { tv: '集', movie: '部', variety: '期', anime: '话', doc: '集', kids: '集' }

// 每个 id 对应一张稳定的封面图（同 seed 恒定返回同一张图）
export function posterUrl(id, w = 300, h = 420) {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/${w}/${h}`
}

/** 从文件名推断清晰度，无法推断时保留“原画” */
export function sourceQualityKey(src) {
  const value = String(src || '').toLowerCase()
  if (/2160p|4k|uhd/.test(value)) return '1080p'
  if (/1080p?|fullhd/.test(value)) return '1080p'
  if (/720p?/.test(value)) return '720p'
  if (/480p?/.test(value)) return '480p'
  if (/360p?|_512kb/.test(value)) return '360p'
  return 'original'
}

/**
 * 将候选地址按用户偏好排序。不会伪造清晰度：
 * 找不到对应分辨率时仍使用主文件，避免出现“显示 1080P 实际却是 360P”。
 */
export function orderSources(srcs, qualityKey = 'auto') {
  const list = Array.isArray(srcs) ? srcs.filter(Boolean) : []
  if (!list.length || !qualityKey || qualityKey === 'auto') return list
  const preferred = list.filter((src) => sourceQualityKey(src) === qualityKey)
  return preferred.length ? [...preferred, ...list.filter((src) => !preferred.includes(src))] : list
}

/** 依据清晰度取播放地址；failedIndex 表示已经尝试失败的线路数 */
export function resolvePlayUrl(srcs, qualityKey, failedIndex = 0) {
  const list = orderSources(srcs, qualityKey)
  if (!list.length) return ''
  return list[Math.min(Math.max(0, failedIndex), list.length - 1)]
}

/** 应用自定义片源（用户自有 / 正版地址优先） */
function applyCustomSources(id, episodes) {
  const custom = CUSTOM_SOURCES[id]
  if (!custom || !custom.length) return episodes
  return episodes.map((ep, i) => ({
    ...ep,
    // 自定义正版地址由调用方按集提供，不再混入可能属于另一集的公开片源。
    srcs: [custom[i % custom.length]]
  }))
}

function sourceIdentity(src) {
  try {
    return decodeURIComponent(new URL(src).pathname.split('/').pop() || '')
      .replace(/\.(?:ia\.)?mp4$/i, '')
      .replace(/_(?:512kb|256kb|64kb|1080p|720p|480p|ipod|h264)\b/gi, '')
      .replace(/\s*\((?:MISSING FOOTAGE|SAMPLE)\)/gi, '')
      .replace(/[^\p{L}\p{N}]+/gu, '')
      .toLowerCase()
  } catch (e) {
    return String(src || '')
  }
}

/** 同一集只保留同名文件的转码版本，防止备用线路切到另一集。 */
function matchingSources(srcs, type) {
  const list = Array.isArray(srcs) ? srcs.filter(Boolean) : []
  if (list.length < 2 || type === 'movie') return list
  const primary = sourceIdentity(list[0])
  const matches = list.filter((src) => sourceIdentity(src) === primary)
  return matches.length ? matches : [list[0]]
}

function resolveLocalSource(src) {
  const value = String(src || '')
  if (!value.startsWith('media/')) return value
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${value.split('/').map(encodeURIComponent).join('/')}`
}

function addDirectNodes(srcs) {
  return Array.from(
    new Set(
      srcs.flatMap((src) => {
        const direct = archiveDirectUrl(src)
        return direct ? [direct, src] : [src]
      })
    )
  )
}

/** 解析 Internet Archive 的 item 标识，用于取得与影片匹配的真实封面 */
export function archiveIdentifier(src) {
  try {
    const url = new URL(src)
    const parts = url.pathname.split('/').filter(Boolean)
    if (url.hostname === 'archive.org' || url.hostname === 'www.archive.org') {
      if (parts[0] !== 'download' || !parts[1]) return ''
      return decodeURIComponent(parts[1])
    }
    const itemIndex = parts.indexOf('items')
    if (/\.archive\.org$/i.test(url.hostname) && itemIndex > -1 && parts[itemIndex + 1]) {
      return decodeURIComponent(parts[itemIndex + 1])
    }
    return ''
  } catch (e) {
    return ''
  }
}

export function archivePosterUrl(src) {
  const identifier = archiveIdentifier(src)
  return identifier ? `https://archive.org/services/img/${encodeURIComponent(identifier)}` : ''
}

/** 作品来源页与正版平台搜索入口。只打开平台官方页面，不抓取加密播放流。 */
export function sourcePageUrl(src) {
  const identifier = archiveIdentifier(src)
  return identifier ? `https://archive.org/details/${encodeURIComponent(identifier)}` : String(src || '')
}

export function archiveDirectUrl(src) {
  const identifier = archiveIdentifier(src)
  const mapping = ARCHIVE_SERVERS[identifier]
  if (!identifier || !mapping?.servers?.length) return ''
  try {
    const url = new URL(src)
    const file = decodeURIComponent(url.pathname.split('/').pop() || '')
    return `https://${mapping.servers[0]}${mapping.dir}/${encodeURIComponent(file)}`
  } catch (e) {
    return ''
  }
}

export function officialSearchLinks(title) {
  const keyword = String(title || '').trim()
  const encoded = encodeURIComponent(keyword)
  return [
    { name: '腾讯视频', url: `https://v.qq.com/x/search/?q=${encoded}` },
    { name: '爱奇艺', url: `https://so.iqiyi.com/so/q_${encoded}` },
    { name: '优酷', url: `https://so.youku.com/search_video/q_${encoded}` },
    { name: '芒果 TV', url: `https://so.mgtv.com/so?k=${encoded}` }
  ]
}

const GENERIC_EPISODE_TITLE = /^(第\d+[集期话部]|正片)$/

function sourceFileTitle(src, raw) {
  try {
    const file = decodeURIComponent(new URL(src).pathname.split('/').pop() || '')
    let title = file
      .replace(/\.[^.]+$/, '')
      .replace(/\[[^\]]+\]|\{[^}]+\}/g, ' ')
      .replace(/\((?:19|20)\d{2}[^)]*\)/g, ' ')
      .replace(/_(?:512kb|256kb|64kb|h264|ia)\b/gi, ' ')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!title || /^(videoplayback|video|movie)\b/i.test(title)) return ''

    const parents = [raw.original, raw.title]
      .map((x) => String(x || '').replace(/\s*\((?:19|20)\d{2}\).*$/, '').replace(/[_]+/g, ' ').trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)

    for (const parent of parents) {
      if (title.toLowerCase().startsWith(parent.toLowerCase())) {
        title = title.slice(parent.length)
        break
      }
    }

    title = title.replace(/^[\s\-–—:：.]+/, '').replace(/^(?:episode|ep)\s*\d+\s*[-–—:：]?\s*/i, '').trim()
    if (!title || /^\d+$/.test(title)) return ''
    return title.slice(0, 56)
  } catch (e) {
    return ''
  }
}

function episodeTitle(raw, episode, index, total, unit) {
  if (total === 1) return '正片'
  if (episode.title && !GENERIC_EPISODE_TITLE.test(episode.title)) return episode.title
  const label = `第${index + 1}${unit}`
  const actual = sourceFileTitle((episode.srcs || [])[0], raw)
  return actual ? `${label} · ${actual}` : label
}

export const CHANNELS = [
  { key: 'all', name: '全部' },
  { key: 'tv', name: '电视剧' },
  { key: 'movie', name: '电影' },
  { key: 'variety', name: '综艺' },
  { key: 'anime', name: '动漫' },
  { key: 'doc', name: '纪录片' },
  { key: 'kids', name: '少儿' }
]

export const CHANNEL_NAME = CHANNELS.reduce((acc, c) => {
  acc[c.key] = c.name
  return acc
}, {})

const COUNTERS = {}

function enrich(raw) {
  COUNTERS[raw.t] = (COUNTERS[raw.t] || 0) + 1
  const id = raw.id || `${raw.t}-${String(COUNTERS[raw.t]).padStart(2, '0')}`
  const unit = UNIT[raw.t] || '集'
  const source = applyCustomSources(id, raw.episodes || [])
  const total = source.length
  const episodes = source.map((ep, i) => {
    const srcs = addDirectNodes(matchingSources(ep.srcs, raw.t).map(resolveLocalSource))
    return {
      no: i + 1,
      title: episodeTitle(raw, ep, i, total, unit),
      duration: ep.duration,
      durationText: formatDuration(ep.duration),
      srcs,
      poster: raw.local ? '' : archivePosterUrl(srcs[0]) || posterUrl(`${id}-ep-${i + 1}`, 640, 360)
    }
  })

  return {
    id,
    type: raw.t,
    typeName: CHANNEL_NAME[raw.t],
    unit,
    title: raw.title,
    original: raw.original || '',
    genres: raw.g,
    region: raw.region,
    year: raw.y,
    score: raw.s,
    desc: raw.desc,
    director: raw.director,
    cast: (raw.cast || []).map(([name, role]) => ({ name, role })),
    hot: raw.hot,
    // 当前片库全部为可公开播放的片源，不再设置试看或会员拦截。
    vip: false,
    pay: false,
    badge: raw.badge || '',
    episodeTotal: total,
    episodeUpdated: total,
    updateText: total > 1 ? `全${total}${unit}` : '高清正片',
    totalDuration: episodes.reduce((s, e) => s + (e.duration || 0), 0),
    local: !!raw.local,
    poster: raw.local ? '' : archivePosterUrl(episodes[0]?.srcs?.[0]) || posterUrl(id),
    posterLarge: raw.local ? '' : archivePosterUrl(episodes[0]?.srcs?.[0]) || posterUrl(id, 600, 338),
    cover: { from: raw.c[0], to: raw.c[1], emoji: raw.e },
    episodes
  }
}

export const VIDEOS = [...REAL_CATALOG, ...LOCAL_CATALOG].map(enrich)

/** 按 id 获取视频 */
export function getVideo(id) {
  return VIDEOS.find((v) => v.id === id) || null
}

/** 按 id 列表获取 */
export function listByIds(ids = []) {
  return ids.map((id) => getVideo(id)).filter(Boolean)
}

/** 按频道取列表 */
export function listByType(type, limit) {
  const arr = type && type !== 'all' ? VIDEOS.filter((v) => v.type === type) : VIDEOS.slice()
  return typeof limit === 'number' ? arr.slice(0, limit) : arr
}

/** 排序器 */
const SORTERS = {
  hot: (a, b) => b.hot - a.hot,
  new: (a, b) => b.year - a.year || b.hot - a.hot,
  score: (a, b) => b.score - a.score,
  title: (a, b) => a.title.localeCompare(b.title, 'zh-CN')
}

/**
 * 统一查询：频道 + 筛选 + 搜索 + 排序 + 分页
 */
export function queryVideos(opts = {}) {
  const {
    type = 'all',
    keyword = '',
    genre = '',
    region = '',
    year = '',
    sort = 'hot',
    page = 1,
    pageSize = 12,
    vipOnly = false
  } = opts

  const kw = String(keyword).trim().toLowerCase()
  let list = VIDEOS.filter((v) => {
    if (type && type !== 'all' && v.type !== type) return false
    if (genre && !v.genres.includes(genre)) return false
    if (region && v.region !== region) return false
    if (year && String(v.year) !== String(year)) return false
    if (vipOnly && !v.vip) return false
    if (kw) {
      const hay = [v.title, v.original, v.desc, v.director, ...v.genres, ...v.cast.map((c) => c.name)]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(kw)) return false
    }
    return true
  })

  list = list.slice().sort(SORTERS[sort] || SORTERS.hot)

  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    list: list.slice(start, start + pageSize),
    total,
    page: safePage,
    totalPages,
    hasMore: start + pageSize < total
  }
}

/** 动态生成筛选项 */
export function filterOptions(type = 'all') {
  const scoped = type && type !== 'all' ? VIDEOS.filter((v) => v.type === type) : VIDEOS
  const uniq = (arr) => Array.from(new Set(arr)).filter(Boolean)
  return {
    genres: uniq(scoped.flatMap((v) => v.genres)).slice(0, 16),
    regions: uniq(scoped.map((v) => v.region)),
    years: uniq(scoped.map((v) => v.year)).sort((a, b) => b - a)
  }
}

/** 相关推荐 */
export function relatedVideos(video, limit = 8) {
  if (!video) return []
  const scored = VIDEOS.filter((v) => v.id !== video.id).map((v) => {
    const sameGenre = v.genres.filter((g) => video.genres.includes(g)).length
    let s = sameGenre * 3
    if (v.type === video.type) s += 4
    if (v.region === video.region) s += 1
    if (v.vip === video.vip) s += 0.5
    return { v, s }
  })
  return scored.sort((a, b) => b.s - a.s || b.v.hot - a.v.hot).slice(0, limit).map((x) => x.v)
}
