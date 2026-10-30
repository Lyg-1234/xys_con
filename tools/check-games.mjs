import { existsSync } from 'node:fs'
import { GAMES } from '../src/data/games.js'

const expected = [
  'tetris', 'spot-difference', 'memory', 'snake', '2048', 'minesweeper',
  'tic-tac-toe', 'connect-four', 'gomoku', 'reversi', 'checkers',
  'lights-out', 'sliding-puzzle', 'number-guess',
  'math-sprint', 'odd-one-out', 'simon-says', 'word-scramble', 'color-match',
  'rock-paper-scissors', 'whack-a-mole', 'reaction-test', 'aim-trainer',
  'typing-rush', 'tap-sequence', 'stack-tower', 'pong', 'breakout', 'sky-dodge'
]
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
    minesweeper: 'MinesweeperView',
    'tic-tac-toe': 'PuzzlePackView',
    'connect-four': 'PuzzlePackView',
    gomoku: 'PuzzlePackView',
    reversi: 'PuzzlePackView',
    checkers: 'PuzzlePackView',
    'lights-out': 'PuzzlePackView',
    'sliding-puzzle': 'PuzzlePackView',
    'number-guess': 'PuzzlePackView',
    'math-sprint': 'PuzzlePackView',
    'odd-one-out': 'PuzzlePackView',
    'simon-says': 'PuzzlePackView',
    'word-scramble': 'PuzzlePackView',
    'color-match': 'ActionPackView',
    'rock-paper-scissors': 'ActionPackView',
    'whack-a-mole': 'ActionPackView',
    'reaction-test': 'ActionPackView',
    'aim-trainer': 'ActionPackView',
    'typing-rush': 'ActionPackView',
    'tap-sequence': 'ActionPackView',
    'stack-tower': 'ActionPackView',
    pong: 'ArcadePackView',
    breakout: 'ArcadePackView',
    'sky-dodge': 'ArcadePackView'
  }[id]
}
