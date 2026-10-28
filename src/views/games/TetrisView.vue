<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const COLS = 10
const ROWS = 20
const SHAPES = {
  I: { color: '#42d6e8', matrix: [[1, 1, 1, 1]] },
  J: { color: '#5b7cfa', matrix: [[1, 0, 0], [1, 1, 1]] },
  L: { color: '#ff9f43', matrix: [[0, 0, 1], [1, 1, 1]] },
  O: { color: '#ffd43b', matrix: [[1, 1], [1, 1]] },
  S: { color: '#55d187', matrix: [[0, 1, 1], [1, 1, 0]] },
  T: { color: '#b06cff', matrix: [[0, 1, 0], [1, 1, 1]] },
  Z: { color: '#ff6554', matrix: [[1, 1, 0], [0, 1, 1]] }
}

const { bestFor } = useGameScores()
const board = ref(createBoard())
const piece = ref(null)
const nextType = ref('T')
const score = ref(0)
const lines = ref(0)
const level = ref(1)
const running = ref(false)
const paused = ref(false)
const gameOver = ref(false)

let bag = []
let frameId = null
let lastTime = 0
let dropAccumulator = 0

const best = computed(() => bestFor(props.game.id))
const status = computed(() => {
  if (gameOver.value) return '游戏结束'
  if (paused.value) return '已暂停'
  if (running.value) return '游戏中'
  return '准备开始'
})
const nextMatrix = computed(() => SHAPES[nextType.value]?.matrix || [])
const nextColor = computed(() => SHAPES[nextType.value]?.color || '#fff')
const speed = computed(() => Math.max(90, 780 - (level.value - 1) * 62))
const displayBoard = computed(() => {
  const view = board.value.map((row) => row.slice())
  if (piece.value) {
    piece.value.matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (!value) return
        const y = piece.value.y + rowIndex
        const x = piece.value.x + colIndex
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          view[y][x] = piece.value.color
        }
      })
    })
  }
  return view
})

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(''))
}

function shuffledBag() {
  const types = Object.keys(SHAPES)
  for (let i = types.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[types[i], types[j]] = [types[j], types[i]]
  }
  return types
}

function takeType() {
  if (!bag.length) bag = shuffledBag()
  return bag.pop()
}

function makePiece(type) {
  const matrix = SHAPES[type].matrix.map((row) => row.slice())
  return {
    type,
    matrix,
    color: SHAPES[type].color,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0
  }
}

function collides(testPiece, testBoard = board.value) {
  return testPiece.matrix.some((row, rowIndex) =>
    row.some((value, colIndex) => {
      if (!value) return false
      const y = testPiece.y + rowIndex
      const x = testPiece.x + colIndex
      return x < 0 || x >= COLS || y >= ROWS || (y >= 0 && Boolean(testBoard[y][x]))
    })
  )
}

function spawn() {
  const type = nextType.value
  nextType.value = takeType()
  piece.value = makePiece(type)
  dropAccumulator = 0
  if (collides(piece.value)) finishGame()
}

function move(dx) {
  if (!running.value || paused.value || gameOver.value || !piece.value) return
  const candidate = { ...piece.value, x: piece.value.x + dx }
  if (!collides(candidate)) piece.value = candidate
}

function rotateMatrix(matrix) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse())
}

function rotate() {
  if (!running.value || paused.value || !piece.value) return
  const matrix = rotateMatrix(piece.value.matrix)
  for (const offset of [0, -1, 1, -2, 2]) {
    const candidate = { ...piece.value, matrix, x: piece.value.x + offset }
    if (!collides(candidate)) {
      piece.value = candidate
      return
    }
  }
}

function stepDown(manual = false) {
  if (!running.value || paused.value || !piece.value) return
  const candidate = { ...piece.value, y: piece.value.y + 1 }
  if (!collides(candidate)) {
    piece.value = candidate
    if (manual) score.value += 1
  } else {
    mergePiece()
  }
}

function softDrop() {
  stepDown(true)
  dropAccumulator = 0
}

function hardDrop() {
  if (!running.value || paused.value || !piece.value) return
  let distance = 0
  while (piece.value.y < ROWS) {
    const candidate = { ...piece.value, y: piece.value.y + 1 }
    if (collides(candidate)) break
    piece.value = candidate
    distance += 1
  }
  score.value += distance * 2
  mergePiece()
}

function mergePiece() {
  piece.value.matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (!value) return
      const y = piece.value.y + rowIndex
      const x = piece.value.x + colIndex
      if (y >= 0) board.value[y][x] = piece.value.color
    })
  })

  const remaining = board.value.filter((row) => row.some((cell) => !cell))
  const cleared = ROWS - remaining.length
  if (cleared) {
    board.value = [
      ...Array.from({ length: cleared }, () => Array(COLS).fill('')),
      ...remaining
    ]
    lines.value += cleared
    score.value += [0, 100, 300, 500, 800][cleared] * level.value
    level.value = Math.floor(lines.value / 10) + 1
  }
  spawn()
}

function togglePause() {
  if (!running.value || gameOver.value) return
  paused.value = !paused.value
}

function startGame() {
  recordPlay(props.game.id)
  board.value = createBoard()
  score.value = 0
  lines.value = 0
  level.value = 1
  running.value = true
  paused.value = false
  gameOver.value = false
  bag = []
  nextType.value = takeType()
  spawn()
  lastTime = performance.now()
  dropAccumulator = 0
  if (!frameId) frameId = requestAnimationFrame(loop)
}

function finishGame() {
  if (gameOver.value) return
  running.value = false
  gameOver.value = true
  piece.value = null
  submitScore(props.game.id, score.value, { lines: lines.value, level: level.value })
}

function restart() {
  startGame()
}

function loop(time) {
  frameId = requestAnimationFrame(loop)
  if (!running.value || paused.value) {
    lastTime = time
    return
  }
  const delta = Math.min(100, time - lastTime)
  lastTime = time
  dropAccumulator += delta
  if (dropAccumulator >= speed.value) {
    dropAccumulator = 0
    stepDown()
  }
}

function onKeydown(event) {
  const target = event.target
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
  const key = event.key.toLowerCase()
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) {
    event.preventDefault()
  }
  if (key === 'arrowleft' || key === 'a') move(-1)
  else if (key === 'arrowright' || key === 'd') move(1)
  else if (key === 'arrowup' || key === 'w') rotate()
  else if (key === 'arrowdown' || key === 's') softDrop()
  else if (key === ' ') hardDrop()
  else if (key === 'p') togglePause()
  else if (key === 'r') restart()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (frameId) cancelAnimationFrame(frameId)
})
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="tetris-wrap">
      <div class="tetris-main">
        <div class="tetris-board" aria-label="俄罗斯方块棋盘">
          <div
            v-for="(cell, index) in displayBoard.flat()"
            :key="index"
            class="tetris-cell"
            :class="{ 'is-filled': cell }"
            :style="cell ? { background: cell, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.2)' } : null"
          />
          <div v-if="!running || paused || gameOver" class="tetris-overlay">
            <div class="tetris-overlay__badge">{{ game.icon }}</div>
            <h2>{{ gameOver ? '方块堆到顶了' : paused ? '游戏已暂停' : '准备开始' }}</h2>
            <p v-if="gameOver">本局得分 {{ score }}，再来一次刷新纪录。</p>
            <p v-else-if="paused">休息一下，准备好后继续。</p>
            <p v-else>消除整行获得分数，别让方块碰到顶部。</p>
            <button type="button" class="btn btn--yellow" @click="gameOver ? restart() : paused ? togglePause() : startGame()">
              {{ gameOver ? '再来一局' : paused ? '继续游戏' : '开始游戏' }}
            </button>
          </div>
        </div>

        <div class="tetris-info">
          <div class="tetris-next">
            <span>下一个</span>
            <div class="tetris-next__grid">
              <i
                v-for="(cell, index) in 16"
                :key="index"
                :class="{ 'is-filled': nextMatrix[Math.floor((index - 0) / 4)]?.[index % 4] }"
                :style="nextMatrix[Math.floor((index - 0) / 4)]?.[index % 4] ? { background: nextColor } : null"
              />
            </div>
          </div>
          <div class="tetris-mini-stats">
            <div><span>消行</span><strong>{{ lines }}</strong></div>
            <div><span>等级</span><strong>{{ level }}</strong></div>
          </div>
          <button type="button" class="tetris-pause" :disabled="!running || gameOver" @click="togglePause">
            {{ paused ? '继续' : '暂停' }}
          </button>
        </div>
      </div>

      <div class="tetris-controls">
        <button type="button" aria-label="向左" @click="move(-1)">←</button>
        <button type="button" aria-label="旋转" @click="rotate">↻</button>
        <button type="button" aria-label="向右" @click="move(1)">→</button>
        <button type="button" aria-label="加速下落" @click="softDrop">↓</button>
        <button type="button" class="is-wide" aria-label="直接落下" @click="hardDrop">直落</button>
      </div>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="restart">重新开始</button>
      <button type="button" class="btn btn--ghost action-btn" @click="togglePause">
        {{ paused ? '继续' : '暂停' }}
      </button>
    </template>
  </GameShell>
</template>

<style scoped>
.tetris-wrap {
  width: min(100%, 500px);
}

.tetris-main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
}

.tetris-board {
  position: relative;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  width: min(300px, 68vw);
  aspect-ratio: 1 / 2;
  overflow: hidden;
  border: 2px solid #080d14;
  border-radius: 12px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    #111a2d;
  background-size: 10% 5%;
  box-shadow: 0 0 0 4px #303d56, 7px 8px 0 var(--ink);
}

.tetris-cell {
  border: 0.5px solid rgba(255, 255, 255, 0.045);
  border-radius: 2px;
}

.tetris-cell.is-filled {
  border-radius: 4px;
  animation: tile-in 0.12s ease;
}

.tetris-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  background: rgba(11, 18, 31, 0.87);
  color: #fff;
  text-align: center;
  backdrop-filter: blur(5px);
}

.tetris-overlay__badge {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border: 2px solid #fff;
  border-radius: 18px;
  background: var(--violet);
  font-size: 32px;
  transform: rotate(-5deg);
}

.tetris-overlay h2 {
  margin-top: 14px;
  font-size: 22px;
}

.tetris-overlay p {
  margin: 5px 0 14px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.tetris-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100px;
}

.tetris-next,
.tetris-mini-stats,
.tetris-pause {
  border: 1.5px solid var(--ink);
  border-radius: 13px;
  background: #fff;
}

.tetris-next {
  padding: 9px;
}

.tetris-next > span {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
}

.tetris-next__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  aspect-ratio: 1;
  gap: 2px;
}

.tetris-next__grid i {
  border-radius: 2px;
  background: #f1ede3;
}

.tetris-mini-stats {
  overflow: hidden;
}

.tetris-mini-stats div {
  display: flex;
  justify-content: space-between;
  padding: 7px 9px;
  border-bottom: 1px dashed var(--line);
}

.tetris-mini-stats div:last-child {
  border-bottom: 0;
}

.tetris-mini-stats span {
  color: var(--muted);
  font-size: 10px;
}

.tetris-mini-stats strong {
  font-size: 13px;
}

.tetris-pause {
  padding: 7px;
  font-size: 12px;
  font-weight: 900;
}

.tetris-controls {
  display: none;
}

@keyframes tile-in {
  from {
    transform: scale(0.72);
  }
}

@media (max-width: 600px) {
  .tetris-board {
    width: min(285px, 71vw);
  }

  .tetris-info {
    width: 80px;
  }

  .tetris-controls {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
    margin-top: 18px;
  }

  .tetris-controls button {
    height: 44px;
    border: 1.5px solid var(--ink);
    border-radius: 11px;
    background: #fff;
    box-shadow: 2px 2px 0 var(--ink);
    font-size: 18px;
    font-weight: 900;
  }

  .tetris-controls .is-wide {
    grid-column: span 4;
    height: 38px;
    background: var(--sun);
    font-size: 13px;
  }
}

.action-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
