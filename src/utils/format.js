/**
 * 秒 -> 时间文本
 */
export function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '--:--'
  const total = Math.floor(sec)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/**
 * 观看进度百分比
 */
export function percent(current, duration) {
  if (!duration || !Number.isFinite(current)) return 0
  return Math.min(100, Math.max(0, (current / duration) * 100))
}

/**
 * 播放量 -> 中文字符串
 */
export function formatCount(n) {
  if (!Number.isFinite(n)) return '0'
  if (n >= 1e8) return `${(n / 1e8).toFixed(1).replace(/\.0$/, '')}亿`
  if (n >= 1e4) return `${(n / 1e4).toFixed(1).replace(/\.0$/, '')}万`
  return String(n)
}

/**
 * 相对时间
 */
export function fromNow(ts) {
  const diff = Date.now() - ts
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)}天前`
  return new Date(ts).toLocaleDateString('zh-CN')
}

/**
 * 关键词高亮：返回分段数组
 */
export function splitHighlight(text, keyword) {
  const kw = String(keyword || '').trim()
  if (!kw) return [{ text, hit: false }]
  const lower = String(text)
  const target = kw.toLowerCase()
  const result = []
  let index = 0
  let found = lower.toLowerCase().indexOf(target)
  while (found !== -1) {
    if (found > index) result.push({ text: lower.slice(index, found), hit: false })
    result.push({ text: lower.slice(found, found + kw.length), hit: true })
    index = found + kw.length
    found = lower.toLowerCase().indexOf(target, index)
  }
  if (index < lower.length) result.push({ text: lower.slice(index), hit: false })
  return result
}

/**
 * 数值安全化
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
