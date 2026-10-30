import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SITE = process.env.SITE || 'http://127.0.0.1:4173/xys_con'
const BASE = process.env.CHROME_BASE || 'http://127.0.0.1:9222'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let failures = 0

function log(name, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`)
}

async function open(path, width = 390, height = 844) {
  const response = await fetch(`${BASE}/json/new?about:blank`, { method: 'PUT' })
  const tab = await response.json()
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
    return response.result?.result?.value ?? null
  }

  const screenshot = async (name) => {
    if (!process.env.UX_SCREENSHOT_DIR) return
    const response = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    if (response.result?.data) {
      writeFileSync(join(process.env.UX_SCREENSHOT_DIR, `${name}.png`), Buffer.from(response.result.data, 'base64'))
    }
  }

  await send('Runtime.enable')
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: width,
    screenHeight: height
  })
  await send('Page.navigate', { url: `${SITE}${path}` })
  await delay(1200)

  return {
    send,
    evaluate,
    screenshot,
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

{
  const session = await open('/game/tetris')
  const layout = await session.evaluate(`(() => {
    document.querySelector('.game-stage')?.scrollIntoView({ block: 'start' });
    const board = document.querySelector('.tetris-board')?.getBoundingClientRect();
    const controls = document.querySelector('.tetris-controls')?.getBoundingClientRect();
    const stage = document.querySelector('.game-stage')?.getBoundingClientRect();
    return {
      boardWidth: board?.width || 0,
      boardHeight: board?.height || 0,
      controlsHeight: controls?.height || 0,
      boardAboveControls: Boolean(board && controls && board.bottom < controls.top),
      stageHeight: stage?.height || 0,
      viewport: innerHeight
    };
  })()`)
  log(
    '俄罗斯方块窄屏棋盘与方向键同屏',
    layout?.boardWidth >= 150 &&
      layout?.boardHeight >= 330 &&
      layout?.boardAboveControls &&
      layout?.controlsHeight >= 90 &&
      layout?.stageHeight <= layout?.viewport,
    JSON.stringify(layout)
  )
  await session.screenshot('tetris-mobile')
  log('俄罗斯方块窄屏无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/about')
  await session.evaluate(`localStorage.removeItem('pixel-play-scorebook-v1')`)
  await session.send('Page.navigate', { url: `${SITE}/game/2048` })
  await delay(900)
  const board = await session.evaluate(`(() => {
    const rect = document.querySelector('.n2048-board')?.getBoundingClientRect();
    return rect ? {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height
    } : null;
  })()`)
  const directions = [
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 }
  ]
  const changes = []
  if (board) {
    for (const direction of directions) {
      const before = await session.evaluate(`document.querySelectorAll('.n2048-cell:not(.tile-0)').length`)
      const start = { x: board.x - direction.x * board.width * 0.24, y: board.y - direction.y * board.height * 0.24 }
      const end = { x: board.x + direction.x * board.width * 0.24, y: board.y + direction.y * board.height * 0.24 }
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: start.x, y: start.y, id: 1, radiusX: 3, radiusY: 3 }]
      })
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: end.x, y: end.y, id: 1, radiusX: 3, radiusY: 3 }]
      })
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await delay(160)
      const after = await session.evaluate(`document.querySelectorAll('.n2048-cell:not(.tile-0)').length`)
      changes.push(after - before)
    }
  }
  log(
    '2048 单次滑动最多执行一个有效回合',
    board && changes.some((change) => change === 1) && changes.every((change) => change === 0 || change === 1),
    JSON.stringify(changes)
  )
  const scores = await session.evaluate(`JSON.parse(localStorage.getItem('pixel-play-scorebook-v1') || '{}')['2048']`)
  log('2048 开局只累计一次且最高分实时保存', scores?.plays === 1 && Number(scores?.best) >= 0, JSON.stringify(scores))
  log('2048 触屏手势无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.close()
}

{
  const session = await open('/game/gomoku')
  await session.evaluate(`document.querySelectorAll('.gomoku-cell')[112]?.click()`)
  await delay(450)
  const state = await session.evaluate(`(() => ({
    black: document.querySelectorAll('.gomoku-cell.is-black').length,
    white: document.querySelectorAll('.gomoku-cell.is-white').length,
    locked: [...document.querySelectorAll('.gomoku-cell')].every((cell) => !cell.disabled)
  }))()`)
  log('五子棋玩家落子并触发电脑回合', state?.black === 1 && state?.white === 1 && state?.locked, JSON.stringify(state))
  log('五子棋无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.screenshot('gomoku-mobile')
  await session.close()
}

{
  const session = await open('/game/reversi')
  const before = await session.evaluate(`document.querySelectorAll('.reversi-cell.is-black, .reversi-cell.is-white').length`)
  await session.evaluate(`
    document.querySelector('.reversi-cell:not(.is-black):not(.is-white)')?.click();
  `)
  await delay(80)
  const illegal = await session.evaluate(`document.querySelectorAll('.reversi-cell.is-black, .reversi-cell.is-white').length`)
  await session.evaluate(`document.querySelector('.reversi-cell.is-legal')?.click()`)
  await delay(520)
  const after = await session.evaluate(`document.querySelectorAll('.reversi-cell.is-black, .reversi-cell.is-white').length`)
  log('黑白棋拦截非法落子并完成双方回合', illegal === before && after > before, `pieces ${before} -> ${illegal} -> ${after}`)
  log('黑白棋无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.screenshot('reversi-mobile')
  await session.close()
}

{
  const session = await open('/game/checkers')
  const before = await session.evaluate(`document.querySelectorAll('.checker-piece').length`)
  await session.evaluate(`document.querySelector('.checker-piece.is-red')?.closest('button')?.click()`)
  await delay(80)
  const legal = await session.evaluate(`document.querySelectorAll('.checker-cell.is-legal').length`)
  await session.evaluate(`document.querySelector('.checker-cell.is-legal')?.click()`)
  await delay(1200)
  const state = await session.evaluate(`(() => ({
    pieces: document.querySelectorAll('.checker-piece').length,
    red: document.querySelectorAll('.checker-piece.is-red').length,
    black: document.querySelectorAll('.checker-piece.is-black').length,
    turn: document.querySelector('.checker-meta b')?.textContent,
    hint: document.querySelector('.pack-hint')?.textContent,
    result: document.querySelector('.pack-result h2')?.textContent || '',
    blackMoves: (() => {
      const board = [...document.querySelectorAll('.checker-cell')].map((cell) => {
        const piece = cell.querySelector('.checker-piece');
        if (!piece) return '';
        const color = piece.classList.contains('is-red') ? 'r' : 'b';
        return piece.classList.contains('is-king') ? color.toUpperCase() : color;
      });
      const moves = [];
      board.forEach((piece, index) => {
        if (piece.toLowerCase() !== 'b') return;
        const row = Math.floor(index / 8);
        const col = index % 8;
        for (const dy of piece === 'B' ? [-1, 1] : [1]) {
          for (const dx of [-1, 1]) {
            const r = row + dy;
            const c = col + dx;
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && !board[r * 8 + c]) moves.push(index);
          }
        }
      });
      return moves.length;
    })()
  }))()`)
  log(
    '西洋跳棋显示合法走法并完成双方回合',
    legal >= 1 && state?.pieces === before && state?.red === 12 && state?.black === 12 && state?.turn === '轮到你',
    JSON.stringify({ before, legal, ...state })
  )
  log('西洋跳棋无报错', session.errors.length === 0, session.errors.join(' | ') || 'none')
  await session.screenshot('checkers-mobile')
  await session.close()
}

console.log(failures ? `\n${failures} failed` : '\nUX CHECK PASSED')
process.exitCode = failures ? 1 : 0

