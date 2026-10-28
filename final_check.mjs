const SITE = process.env.SITE || 'http://127.0.0.1:4173'
const BASE = process.env.CHROME_BASE || 'http://127.0.0.1:9222'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let failures = 0

function log(name, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`)
}

async function newTab() {
  const response = await fetch(`${BASE}/json/new?about:blank`, { method: 'PUT' })
  return response.json()
}

async function open(path, width = 1440, height = 1000) {
  const tab = await newTab()
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  let sequence = 0
  const pending = new Map()
  const errors = []

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message)
      pending.delete(message.id)
    }
    if (message.method === 'Runtime.exceptionThrown') {
      errors.push(`EXC:${message.params.exceptionDetails?.text || ''}`)
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      errors.push(`ERR:${message.params.args.map((arg) => arg.value ?? '').join(' ')}`)
    }
  }

  await new Promise((resolve) => {
    ws.onopen = resolve
    ws.onerror = resolve
  })

  const send = (method, params = {}) => {
    const id = ++sequence
    ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve) => pending.set(id, resolve))
  }

  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    })
    if (response.result?.exceptionDetails) {
      errors.push(`EVAL:${response.result.exceptionDetails.text}`)
      return null
    }
    return response.result?.result?.value ?? null
  }

  const key = async (value, code = value, keyCode = 0) => {
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: value,
      code,
      windowsVirtualKeyCode: keyCode
    })
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: value,
      code,
      windowsVirtualKeyCode: keyCode
    })
  }

  const click = async (selector) => {
    const box = await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`)
    if (!box) return false
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', {
        type,
        x: box.x,
        y: box.y,
        button: type === 'mouseMoved' ? 'none' : 'left',
        buttons: type === 'mousePressed' ? 1 : 0,
        clickCount: 1
      })
    }
    return true
  }

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700
  })
  await send('Page.navigate', { url: `${SITE}${path}` })
  await delay(1400)

  return {
    send,
    evaluate,
    click,
    key,
    errors,
    close: async () => {
      ws.close()
      try {
        await fetch(`${BASE}/json/close/${tab.id}`)
      } catch (error) {
        /* ignore */
      }
    }
  }
}

async function page(path, mark, width = 1440, height = 1000) {
  const session = await open(path, width, height)
  const body = await session.evaluate('document.body.innerText')
  log(`页面 ${path}`, body?.includes(mark) && session.errors.length === 0, session.errors.join(' | ') || mark)
  await session.close()
}

await page('/', '今天玩点什么')
await page('/games', '全部小游戏')
await page('/leaderboard', '我的游戏排行榜')
await page('/about', '网页游戏厅')

{
  const session = await open('/game/tetris')
  await session.click('.tetris-overlay .btn')
  await delay(500)
  await session.key('ArrowLeft', 'ArrowLeft', 37)
  await session.key('ArrowUp', 'ArrowUp', 38)
  await session.key(' ', 'Space', 32)
  await delay(500)
  const state = await session.evaluate(`(() => ({
    filled: document.querySelectorAll('.tetris-cell.is-filled').length,
    status: document.querySelector('.game-stat.is-status strong')?.textContent,
    score: document.querySelector('.game-stat strong')?.textContent
  }))()`)
  log('俄罗斯方块开始、旋转、直落', state?.filled > 0 && state?.status === '游戏中', JSON.stringify(state))
  log('俄罗斯方块无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/spot-difference')
  await session.click('.spot-start')
  const points = [
    [72, 44],
    [282, 72],
    [266, 145],
    [118, 236],
    [357, 117]
  ]
  for (const [x, y] of points) {
    const point = await session.evaluate(`(() => {
      const el = document.querySelectorAll('.spot-scene')[1];
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width * ${x / 420}, y: rect.top + rect.height * ${y / 300} };
    })()`)
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await session.send('Input.dispatchMouseEvent', {
        type,
        x: point.x,
        y: point.y,
        button: type === 'mouseMoved' ? 'none' : 'left',
        buttons: type === 'mousePressed' ? 1 : 0,
        clickCount: 1
      })
    }
    await delay(80)
  }
  await delay(250)
  const state = await session.evaluate(`(() => ({
    rings: document.querySelectorAll('.spot-scene')[1]?.querySelectorAll('.spot-ring').length || 0,
    result: document.body.innerText.includes('全部找出来了')
  }))()`)
  log('找不同完成 5 处热点', state?.rings === 5 && state?.result, JSON.stringify(state))
  log('找不同无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/memory')
  const first = await session.evaluate(`(() => {
    const cards = document.querySelectorAll('.memory-card');
    cards[0].click(); cards[1].click();
    return cards.length;
  })()`)
  await delay(850)
  const moves = await session.evaluate(`document.querySelector('.memory-meta')?.innerText`)
  log('记忆翻牌可翻牌计步', first === 16 && moves?.includes('1'), moves)
  log('记忆翻牌无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/snake')
  await session.key('ArrowUp', 'ArrowUp', 38)
  await delay(650)
  const state = await session.evaluate(`(() => ({
    head: document.querySelectorAll('.snake-cell.is-head').length,
    overlay: Boolean(document.querySelector('.snake-overlay')),
    status: document.querySelector('.game-stat.is-status strong')?.textContent
  }))()`)
  log('贪吃蛇自动运行且可转向', state?.head === 1 && state?.status === '移动中', JSON.stringify(state))
  log('贪吃蛇无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/2048')
  const before = await session.evaluate(`document.querySelectorAll('.n2048-cell:not(.tile-0)').length`)
  await session.key('ArrowLeft', 'ArrowLeft', 37)
  await delay(300)
  const after = await session.evaluate(`document.querySelectorAll('.n2048-cell:not(.tile-0)').length`)
  log('2048 初始化和移动', before >= 2 && after >= 2, `tiles ${before} -> ${after}`)
  log('2048无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/minesweeper')
  await session.click('.mine-cell')
  await delay(200)
  const state = await session.evaluate(`(() => ({
    revealed: document.querySelectorAll('.mine-cell.is-revealed').length,
    status: document.querySelector('.game-stat.is-status strong')?.textContent
  }))()`)
  log('扫雷首次点击安全开局', state?.revealed >= 1 && state?.status !== '等待开局', JSON.stringify(state))
  log('扫雷无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/', 390, 844)
  const state = await session.evaluate(`(() => ({
    dock: getComputedStyle(document.querySelector('.mobile-dock')).display,
    width: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth
  }))()`)
  log('手机端导航与横向布局', state?.dock === 'grid' && state?.width <= state?.viewport, JSON.stringify(state))
  log('手机首页无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

for (const width of [320, 360, 390]) {
  for (const slug of ['tetris', 'spot-difference', 'memory', 'snake', '2048', 'minesweeper']) {
    const session = await open(`/game/${slug}`, width, 800)
    const state = await session.evaluate(`(() => ({
      width: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      clipped: (() => {
        const stage = document.querySelector('.game-stage');
        if (!stage) return [];
        const bounds = stage.getBoundingClientRect();
        return [...stage.querySelectorAll('*')].filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && (rect.right > bounds.right + 1 || rect.left < bounds.left - 1);
        }).slice(0, 4).map((el) => el.className?.toString() || el.tagName);
      })()
    }))()`)
    log(
      `移动端棋盘完整可见 ${width}px / ${slug}`,
      state?.width <= state?.viewport && state?.clipped?.length === 0,
      `${state?.width}/${state?.viewport}${state?.clipped?.length ? ` clipped=${state.clipped.join(',')}` : ''}`
    )
    await session.close()
  }
}

console.log(failures ? `\n${failures} failed` : '\nFINAL CHECK PASSED')
process.exitCode = failures ? 1 : 0
