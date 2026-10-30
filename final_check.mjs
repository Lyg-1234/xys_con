import { GAMES } from './src/data/games.js'

const SITE = process.env.SITE || 'http://127.0.0.1:4173/xys_con'
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

for (const game of GAMES) {
  await page(`/game/${game.id}`, game.name, 390, 844)
}

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
  const session = await open('/game/tic-tac-toe')
  await session.evaluate(`document.querySelector('.tic-board button')?.click()`)
  await delay(450)
  const state = await session.evaluate(`({
    x: document.querySelectorAll('.tic-board .is-x').length,
    o: document.querySelectorAll('.tic-board .is-o').length
  })`)
  log('井字棋玩家落子并触发电脑回合', state?.x === 1 && state?.o === 1, JSON.stringify(state))
  log('井字棋无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/connect-four')
  await session.evaluate(`document.querySelectorAll('.connect-cell')[38]?.click()`)
  await delay(550)
  const state = await session.evaluate(`({
    red: document.querySelectorAll('.connect-cell.is-red').length,
    yellow: document.querySelectorAll('.connect-cell.is-yellow').length
  })`)
  log('四子棋落子并触发电脑回合', state?.red === 1 && state?.yellow === 1, JSON.stringify(state))
  log('四子棋无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/lights-out')
  const before = await session.evaluate(`document.querySelectorAll('.light-cell.is-on').length`)
  await session.evaluate(`document.querySelectorAll('.light-cell')[12]?.click()`)
  await delay(120)
  const state = await session.evaluate(`({
    before: ${before},
    after: document.querySelectorAll('.light-cell.is-on').length,
    hint: document.querySelector('.game-stat.is-status strong')?.textContent
  })`)
  log('关灯挑战可翻转相邻灯', state?.after !== state?.before && state?.hint?.includes('步'), JSON.stringify(state))
  log('关灯挑战无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/sliding-puzzle')
  await session.evaluate(`(() => {
    const cells = [...document.querySelectorAll('.sliding-cell')];
    const blank = cells.findIndex((cell) => cell.classList.contains('is-blank'));
    const candidates = [blank - 1, blank + 1, blank - 3, blank + 3].filter((index) => index >= 0 && index < 9);
    const target = candidates.find((index) => Math.floor(index / 3) === Math.floor(blank / 3) || index % 3 === blank % 3);
    cells[target]?.click();
  })()`)
  await delay(120)
  const hint = await session.evaluate(`document.querySelector('.sliding-board + .pack-hint')?.textContent`)
  log('数字华容道可滑动空格相邻块', hint?.includes('步数 1'), hint)
  log('数字华容道无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/number-guess')
  await session.evaluate(`(() => {
    const input = document.querySelector('.pack-form input');
    input.value = '50';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.pack-form form').requestSubmit();
  })()`)
  await delay(120)
  const hint = await session.evaluate(`document.querySelector('.pack-form > p')?.textContent`)
  log('数字猜猜可提交并获得区间提示', Boolean(hint && hint.includes('50')), hint)
  log('数字猜猜无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/math-sprint')
  await session.evaluate(`(() => {
    const input = document.querySelector('.pack-form input');
    input.value = '0';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.pack-form form').requestSubmit();
  })()`)
  await delay(120)
  const hint = await session.evaluate(`document.querySelector('.pack-form .pack-hint')?.textContent`)
  log('心算冲刺题目可提交并刷新', Boolean(hint?.includes('答案')), hint)
  log('心算冲刺无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/odd-one-out')
  await session.evaluate(`document.querySelector('.odd-cell')?.click()`)
  await delay(120)
  const state = await session.evaluate(`({
    cells: document.querySelectorAll('.odd-cell').length,
    hint: document.querySelector('.odd-board + .pack-hint')?.textContent
  })`)
  log('找出异类网格可点击反馈', state?.cells === 12 && Boolean(state?.hint), JSON.stringify(state))
  log('找出异类无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/simon-says')
  await delay(2900)
  const state = await session.evaluate(`(() => {
    const pads = [...document.querySelectorAll('.simon-pad')];
    pads[0]?.click();
    return {
      pads: pads.length,
      disabled: pads[0]?.disabled,
      hint: document.querySelector('.simon-board + .pack-hint')?.textContent
    };
  })()`)
  log('记忆彩灯可播放并接受序列输入', state?.pads === 4 && Boolean(state?.hint), JSON.stringify(state))
  log('记忆彩灯无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/word-scramble')
  await session.evaluate(`document.querySelector('.word-letter:not(:disabled)')?.click()`)
  await delay(100)
  const state = await session.evaluate(`({
    letters: document.querySelectorAll('.word-letter').length,
    answer: document.querySelector('.word-answer')?.textContent?.trim()
  })`)
  log('单词重组可选择字母', state?.letters >= 4 && state?.answer !== '点击下方字母', JSON.stringify(state))
  log('单词重组无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/color-match')
  await session.evaluate(`document.querySelector('.stroop-options button')?.click()`)
  await delay(100)
  const hint = await session.evaluate(`document.querySelector('.stroop-game .pack-hint')?.textContent`)
  log('色彩陷阱可辨认并提交颜色', Boolean(hint), hint)
  log('色彩陷阱无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/rock-paper-scissors')
  await session.evaluate(`document.querySelector('.rps-options button')?.click()`)
  await delay(120)
  const state = await session.evaluate(`({
    player: document.querySelectorAll('.rps-arena > div')[0]?.textContent,
    computer: document.querySelectorAll('.rps-arena > div')[1]?.textContent
  })`)
  log('猜拳对决可出拳并生成电脑结果', state?.player && !state?.computer?.includes('❔'), JSON.stringify(state))
  log('猜拳对决无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/whack-a-mole')
  await session.evaluate(`document.querySelector('.mole-hole.is-active')?.click()`)
  await delay(120)
  const state = await session.evaluate(`({
    hits: document.querySelector('.mole-meta')?.textContent,
    active: document.querySelectorAll('.mole-hole.is-active').length
  })`)
  log('打地鼠可命中当前地鼠', state?.active === 0 && Boolean(state?.hits), JSON.stringify(state))
  log('打地鼠无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/reaction-test')
  await delay(650)
  await session.evaluate(`document.querySelector('.reaction-pad')?.click()`)
  await delay(100)
  const text = await session.evaluate(`document.querySelector('.reaction-pad span')?.textContent`)
  log(
    '闪电反应能记录点击结果',
    text === '抢跑了' || text === '现在点击！' || text === '等待变绿…' || /\d+\s*ms/.test(text || ''),
    text
  )
  log('闪电反应无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/aim-trainer')
  await session.evaluate(`document.querySelector('.aim-target')?.click()`)
  await delay(100)
  const text = await session.evaluate(`document.querySelector('.aim-meta')?.textContent`)
  log('准星训练可命中移动目标', Boolean(text?.includes('1')), text)
  log('准星训练无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/typing-rush')
  await session.evaluate(`(() => {
    const word = document.querySelector('.typing-word')?.textContent?.trim();
    const input = document.querySelector('.typing-game input');
    input.value = word;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.typing-game form').requestSubmit();
  })()`)
  await delay(120)
  const hint = await session.evaluate(`document.querySelector('.typing-game .pack-hint')?.textContent`)
  log('打字冲刺可正确提交并刷新单词', Boolean(hint?.includes('正确')), hint)
  log('打字冲刺无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/tap-sequence')
  await session.evaluate(`[...document.querySelectorAll('.tap-board button')].find((button) => button.textContent.trim() === '1')?.click()`)
  await delay(120)
  const text = await session.evaluate(`document.querySelector('.tap-meta')?.textContent`)
  log('数字寻宝可从 1 开始按顺序点击', text?.includes('2'), text)
  log('数字寻宝无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/stack-tower')
  await delay(420)
  await session.evaluate(`document.querySelector('.stack-field')?.click()`)
  await delay(100)
  const count = await session.evaluate(`document.querySelectorAll('.stack-block:not(.is-moving)').length`)
  log('叠叠高可落下并堆叠砖块', count === 2, `blocks=${count}`)
  log('叠叠高无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/pong')
  await session.evaluate(`(() => {
    const field = document.querySelector('.pong-field');
    const rect = field.getBoundingClientRect();
    field.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: rect.left + rect.width * 0.5,
      clientY: rect.top + rect.height * 0.25
    }));
  })()`)
  await delay(80)
  const state = await session.evaluate(`({
    top: document.querySelector('.pong-paddle.is-player')?.style.top,
    ball: document.querySelector('.pong-ball')?.style.left
  })`)
  log('像素乒乓球拍可跟随触控位置', state?.top === '25%' && Boolean(state?.ball), JSON.stringify(state))
  log('像素乒乓无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/breakout')
  await session.evaluate(`(() => {
    const field = document.querySelector('.breakout-field');
    const rect = field.getBoundingClientRect();
    field.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: rect.left + rect.width * 0.75,
      clientY: rect.top + rect.height * 0.8
    }));
  })()`)
  await delay(80)
  const state = await session.evaluate(`({
    bricks: document.querySelectorAll('.breakout-brick').length,
    paddle: document.querySelector('.breakout-paddle')?.style.left,
    ball: document.querySelector('.breakout-ball')?.style.top
  })`)
  log('弹球砖块棋盘与触控球拍正常', state?.bricks === 30 && state?.paddle === '75%' && Boolean(state?.ball), JSON.stringify(state))
  log('弹球砖块无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/sky-dodge')
  await delay(900)
  await session.evaluate(`(() => {
    const field = document.querySelector('.sky-field');
    const rect = field.getBoundingClientRect();
    field.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: rect.left + rect.width * 0.3,
      clientY: rect.top + rect.height * 0.7
    }));
  })()`)
  await delay(80)
  const state = await session.evaluate(`({
    enemies: document.querySelectorAll('.sky-enemy').length,
    ship: document.querySelector('.sky-ship')?.style.left
  })`)
  log('星海穿梭可生成陨石并移动飞船', state?.enemies >= 1 && state?.ship === '30%', JSON.stringify(state))
  log('星海穿梭无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
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
  for (const game of GAMES) {
    const session = await open(`/game/${game.id}`, width, 800)
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
      `移动端棋盘完整可见 ${width}px / ${game.id}`,
      state?.width <= state?.viewport && state?.clipped?.length === 0,
      `${state?.width}/${state?.viewport}${state?.clipped?.length ? ` clipped=${state.clipped.join(',')}` : ''}`
    )
    await session.close()
  }
}

for (const path of ['/', '/games', '/leaderboard', '/about']) {
  const session = await open(path, 320, 800)
  const state = await session.evaluate(`(() => ({
    width: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    clipped: [...document.querySelectorAll('body *')].filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 &&
        !el.closest('.category-row, .filter-bar__chips, .game-card__art') &&
        (rect.right > innerWidth + 1 || rect.left < -1);
    }).slice(0, 5).map((el) => el.className?.toString() || el.tagName)
  }))()`)
  log(
    `320px 页面无横向溢出 ${path}`,
    state?.width <= state?.viewport && state?.clipped?.length === 0,
    JSON.stringify(state)
  )
  await session.close()
}

{
  const session = await open('/', 390, 844)
  const mobileCards = await session.evaluate(`(() => {
    const cards = [...document.querySelectorAll('.game-card')];
    const first = cards[0];
    const firstRect = first?.getBoundingClientRect();
    const art = first?.querySelector('.game-card__art')?.getBoundingClientRect();
    const icon = first?.querySelector('.game-card__icon')?.getBoundingClientRect();
    return {
      columns: new Set(cards.map((card) => Math.round(card.getBoundingClientRect().left))).size,
      cardWidth: firstRect?.width || 0,
      artWidth: art?.width || 0,
      artHeight: art?.height || 0,
      iconWidth: icon?.width || 0
    };
  })()`)
  log(
    '手机端游戏图片放大并铺满卡片',
    mobileCards?.columns === 1 &&
      mobileCards?.artWidth >= mobileCards?.cardWidth - 6 &&
      mobileCards?.artHeight >= 200 &&
      mobileCards?.iconWidth >= 100,
    JSON.stringify(mobileCards)
  )
  await session.close()
}

{
  const session = await open('/game/spot-difference', 390, 844)
  const spotLayout = await session.evaluate(`(() => {
    const scenes = [...document.querySelectorAll('.spot-scene')].map((item) => item.getBoundingClientRect());
    return {
      count: scenes.length,
      firstWidth: scenes[0]?.width || 0,
      firstHeight: scenes[0]?.height || 0,
      stacked: scenes.length === 2 && scenes[1].top >= scenes[0].bottom
    };
  })()`)
  log(
    '手机端找不同图片全宽纵向展示',
    spotLayout?.count === 2 && spotLayout?.stacked && spotLayout?.firstWidth >= 300 && spotLayout?.firstHeight >= 210,
    JSON.stringify(spotLayout)
  )
  await session.close()
}

console.log(failures ? `\n${failures} failed` : '\nFINAL CHECK PASSED')
process.exitCode = failures ? 1 : 0
