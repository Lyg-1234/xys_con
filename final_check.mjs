const SITE = process.env.SITE || 'http://127.0.0.1:4173'
const BASE = process.env.CHROME_BASE || 'http://127.0.0.1:9222'
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
let bad = 0
const log = (n, ok, d) => {
  if (!ok) bad += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${n} :: ${d}`)
}

async function newTab() {
  const r = await fetch(`${BASE}/json/new?about:blank`, { method: 'PUT' })
  return r.json()
}
async function closeTab(id) {
  try {
    await fetch(`${BASE}/json/close/${id}`)
  } catch (e) {
    /* ignore */
  }
}

async function open(path, fresh = true) {
  const tab = await newTab()
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  let seq = 0
  const pending = new Map()
  const errors = []
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
    if (msg.method === 'Runtime.exceptionThrown') errors.push('EXC:' + String(msg.params.exceptionDetails?.text || '').slice(0, 120))
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push('ERR:' + msg.params.args.map((a) => a.value ?? '').join(' ').slice(0, 120))
  }
  await new Promise((r) => {
    ws.onopen = r
    ws.onerror = r
  })
  const send = (method, params = {}) => {
    const id = ++seq
    ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve) => pending.set(id, resolve))
  }
  const evalExpr = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true })
    return res.result?.result?.value ?? null
  }
  const realClick = async (selector) => {
    const box = await evalExpr(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left+r.width/2), y: Math.round(r.top+r.height/2) } })()`)
    if (!box) return false
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 })
    }
    return true
  }
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Page.navigate', { url: SITE + path })
  await delay(1500)
  if (fresh) {
    await evalExpr(`try { localStorage.clear() } catch(e) {}`)
    await send('Page.navigate', { url: SITE + path })
  }
  await delay(2500)
  return { eval: evalExpr, click: realClick, errors, close: async () => { ws.close(); await closeTab(tab.id) } }
}

const P = `(() => { const v = document.querySelector('video'); return { src: v ? (v.currentSrc||v.src||'') : '', dur: v ? Math.round(v.duration||0) : -1, rs: v ? v.readyState : -1, paused: v ? v.paused : true, t: v ? Math.round(v.currentTime*10)/10 : 0, title: ((document.querySelector('.play__title')||{}).textContent||'').trim(), epi: document.querySelectorAll('.play__epi-btn').length, dmk: document.querySelectorAll('.dmk__item').length } })()`

async function waitLoaded(s, max = 60000) {
  for (let i = 0; i < max / 2500; i += 1) {
    await delay(2500)
    const p = await s.eval(P)
    if (p && p.rs >= 1 && p.dur > 0) return p
  }
  return s.eval(P)
}

/* 剧集播放 + 片名一致 + 交互 */
{
  const s = await open('/play/tv-01')
  const p0 = await waitLoaded(s)
  log('大淘金 第1集', p0.dur > 1800 && p0.epi === 20 && /Bonanza/i.test(p0.src), `${p0.title} 时长=${p0.dur}s 集数=${p0.epi} 文件=${p0.src.split('/').pop().slice(0, 32)}`)
  await s.eval(`document.querySelectorAll('.play__epi-btn')[2].click()`)
  const p1 = await waitLoaded(s)
  log('切换第3集', p1.title.includes('第3集') && p1.src !== p0.src, `${p1.title} | ${p1.src.split('/').pop().slice(0, 32)}`)
  await s.click('.vp__bigplay')
  await delay(5000)
  const p2 = await s.eval(P)
  log('播放 + 弹幕', p2.paused === false && p2.t > 0, `t=${p2.t}s 弹幕=${p2.dmk}`)
  await s.eval(`document.querySelectorAll('.play__op')[0].click()`)
  await delay(600)
  const fav = await s.eval(`(() => ({ text: document.querySelectorAll('.play__op')[0].textContent.trim(), fav: JSON.parse(localStorage.getItem('cloud-video-app-state-v1')||'{}').favorites }))()`)
  log('收藏', fav.fav && fav.fav.includes('tv-01'), JSON.stringify(fav))
  log('播放页无报错', s.errors.length === 0, s.errors.join(' | ') || 'none')
  await s.close()
}

/* 电影长片 */
{
  const s = await open('/play/movie-02')
  const p = await waitLoaded(s)
  log('大都会（长片）', p.dur > 5400 && /Metropolis/i.test(p.src), `${p.title} 时长=${p.dur}s（${Math.round(p.dur / 60)}分钟）`)
  log('电影页无报错', s.errors.length === 0, s.errors.join(' | ') || 'none')
  await s.close()
}

/* 备用线路修复集 */
for (const [path, name, mark] of [
  ['/play/anime-02?epi=15', '幸运兔第15话', 'Hungry Hoboes'],
  ['/play/anime-02?epi=16', '幸运兔第16话', 'Oh What a Knight']
]) {
  const s = await open(path)
  const p = await waitLoaded(s)
  const body = await s.eval(`document.body.innerText`)
  log(name, p.dur > 280 && body.includes(mark), `${p.title} 时长=${p.dur}s`)
  log(`${name}无报错`, s.errors.length === 0, s.errors.join(' | ') || 'none')
  await s.close()
}

/* 首页 / 频道 / 搜索 / 榜单 */
for (const [path, name, mark] of [
  ['/', '首页', '大淘金'],
  ['/channel/tv', '电视剧频道', '全20集'],
  ['/channel/movie', '电影频道', '大都会'],
  ['/rank', '排行榜', '榜上有名'],
  ['/search?q=%E8%AF%BA%E6%96%AF%E8%B4%B9%E6%8B%89%E5%9B%BE', '搜索', '诺斯费拉图'],
  ['/search?q=%E8%92%B8%E8%92%B8%E6%97%A5%E4%B8%8A', '正版平台搜索入口', '腾讯视频']
]) {
  const s = await open(path, false)
  const body = await s.eval(`document.body.innerText.length`)
  const has = await s.eval(`document.body.innerText.includes(${JSON.stringify(mark)})`)
  log(`渲染 ${name}`, has && body > 100, `含「${mark}」=${has} 文本长度=${body}`)
  await s.close()
}

console.log(bad === 0 ? '\nFINAL CHECK PASSED' : `\n${bad} failed`)
process.exit(0)
