import { existsSync } from 'node:fs'
import { GAMES } from '../src/data/games.js'

const expected = ['tetris', 'spot-difference', 'memory', 'snake', '2048', 'minesweeper']
const failures = []
const ids = new Set()

for (const game of GAMES) {
  if (ids.has(game.id)) failures.push(`重复游戏 ID：${game.id}`)
  ids.add(game.id)
  if (!game.name || !game.subtitle || !game.description) failures.push(`${game.id}: 文案不完整`)
  if (!game.controls?.length) failures.push(`${game.id}: 缺少操作说明`)
  const component = new URL(`../src/views/games/${componentName(game.id)}.vue`, import.meta.url)
  if (!existsSync(component)) failures.push(`${game.id}: 缺少游戏组件 ${component.pathname}`)
}

for (const id of expected) {
  if (!ids.has(id)) failures.push(`缺少游戏：${id}`)
}

console.log(`游戏清单：${GAMES.length} 款`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log('游戏清单检查通过')
}

function componentName(id) {
  return {
    tetris: 'TetrisView',
    'spot-difference': 'SpotDifferenceView',
    memory: 'MemoryView',
    snake: 'SnakeView',
    '2048': 'Game2048View',
    minesweeper: 'MinesweeperView'
  }[id]
}
