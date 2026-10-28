<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const SIZE = 4
const { bestFor } = useGameScores()
const board = ref([])
const score = ref(0)
const won = ref(false)
const keepPlaying = ref(false)
const gameOver = ref(false)
const running = ref(false)
let swipeStart = null

const best = computed(() => bestFor(props.game.id))
const emptyCount = computed(() => board.value.flat().filter((value) => !value).length)
const status = computed(() =>
  gameOver.value ? '无路可走' : won.value && !keepPlaying.value ? '达成 2048' : running.value ? '滑动合并' : '准备开始'
)
const scoreLabel = computed(() => score.value.toLocaleString('zh-CN'))

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function addRandomTile() {
  const empty = []
  board.value.forEach((row, y) => row.forEach((value, x) => value === 0 && empty.push({ x, y })))
  if (!empty.length) return false
  const spot = empty[Math.floor(Math.random() * empty.length)]
  const next = board.value.map((row) => row.slice())
  next[spot.y][spot.x] = Math.random() < 0.9 ? 2 : 4
  board.value = next
  return true
}

function startGame() {
  recordPlay(props.game.id)
  board.value = emptyBoard()
  score.value = 0
  won.value = false
  keepPlaying.value = false
  gameOver.value = false
  running.value = true
  addRandomTile()
  addRandomTile()
}

function mergeLine(line) {
  const values = line.filter(Boolean)
  const merged = []
  let gained = 0
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      const value = values[i] * 2
      merged.push(value)
      gained += value
      i += 1
    } else {
      merged.push(values[i])
    }
  }
  while (merged.length < SIZE) merged.push(0)
  return { line: merged, gained }
}

function move(direction) {
  if (!running.value || gameOver.value || (won.value && !keepPlaying.value)) return
  const before = JSON.stringify(board.value)
  const next = emptyBoard()
  let gained = 0

  for (let index = 0; index < SIZE; index += 1) {
    let values
    if (direction === 'left' || direction === 'right') {
      values = board.value[index].slice()
      if (direction === 'right') values.reverse()
    } else {
      values = board.value.map((row) => row[index])
      if (direction === 'down') values.reverse()
    }
    const result = mergeLine(values)
    gained += result.gained
    let merged = result.line
    if (direction === 'right' || direction === 'down') merged = merged.slice().reverse()
    merged.forEach((value, offset) => {
      if (direction === 'left' || direction === 'right') next[index][offset] = value
      else next[offset][index] = value
    })
  }

  if (JSON.stringify(next) === before) return
  board.value = next
  score.value += gained
  if (next.flat().includes(2048) && !won.value) {
    won.value = true
    submitScore(props.game.id, score.value, { reached: 2048 })
  }
  addRandomTile()
  if (!canMove()) finishGame()
}

function canMove() {
  if (board.value.flat().includes(0)) return true
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const value = board.value[y][x]
      if (x + 1 < SIZE && board.value[y][x + 1] === value) return true
      if (y + 1 < SIZE && board.value[y + 1][x] === value) return true
    }
  }
  return false
}

function finishGame() {
  gameOver.value = true
  running.value = false
  submitScore(props.game.id, score.value, { maxTile: Math.max(...board.value.flat()) })
}

function continueGame() {
  keepPlaying.value = true
}

function onKeydown(event) {
  const key = event.key.toLowerCase()
  const map = {
    arrowleft: 'left',
    a: 'left',
    arrowright: 'right',
    d: 'right',
    arrowup: 'up',
    w: 'up',
    arrowdown: 'down',
    s: 'down'
  }
  if (map[key]) {
    event.preventDefault()
    move(map[key])
  }
  if (key === 'r') startGame()
}

function onPointerDown(event) {
  swipeStart = { x: event.clientX, y: event.clientY }
}

function onPointerUp(event) {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  startGame()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="n2048-wrap">
      <div class="n2048-head">
        <div>
          <span>当前得分</span>
          <strong>{{ scoreLabel }}</strong>
        </div>
        <div>
          <span>空格数量</span>
          <strong>{{ emptyCount }}</strong>
        </div>
      </div>

      <div
        class="n2048-board"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
      >
        <div
          v-for="(value, index) in board.flat()"
          :key="index"
          class="n2048-cell"
          :class="`tile-${value || 0}`"
        >
          <span v-if="value">{{ value }}</span>
        </div>

        <div v-if="won && !keepPlaying" class="n2048-overlay">
          <span>🏆</span>
          <h2>2048 达成！</h2>
          <p>你已经合并出 2048，还能走得更远吗？</p>
          <div>
            <button type="button" class="btn btn--yellow" @click="continueGame">继续挑战</button>
            <button type="button" class="btn btn--ghost" @click="startGame">重新开始</button>
          </div>
        </div>

        <div v-else-if="gameOver" class="n2048-overlay">
          <span>🧩</span>
          <h2>没有可移动的方块了</h2>
          <p>本局得到 {{ scoreLabel }} 分。</p>
          <button type="button" class="btn btn--yellow" @click="startGame">再来一局</button>
        </div>
      </div>
      <p class="n2048-hint">在棋盘上滑动，或使用方向键移动方块。</p>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="startGame">重新开始</button>
    </template>
  </GameShell>
</template>

<style scoped>
.n2048-wrap {
  width: min(100%, 500px);
}

.n2048-head {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.n2048-head div {
  min-width: 100px;
  padding: 7px 11px;
  border: 1.5px solid var(--ink);
  border-radius: 11px;
  background: #fff;
  text-align: center;
}

.n2048-head span,
.n2048-head strong {
  display: block;
}

.n2048-head span {
  color: var(--muted);
  font-size: 9px;
}

.n2048-head strong {
  font-size: 17px;
}

.n2048-board {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  width: min(470px, 86vw);
  aspect-ratio: 1;
  padding: 10px;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #bbada0;
  box-shadow: 6px 6px 0 var(--ink);
  touch-action: none;
}

.n2048-cell {
  display: grid;
  place-items: center;
  border: 1px solid rgba(24, 35, 47, 0.18);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.22);
  font-size: clamp(24px, 7vw, 46px);
  font-weight: 1000;
  transition: background 0.16s ease;
}

.n2048-cell:not(.tile-0) {
  animation: pop 0.18s ease;
}

.tile-2 { background: #eee4da; }
.tile-4 { background: #ede0c8; }
.tile-8 { background: #f2b179; color: #fff; }
.tile-16 { background: #f59563; color: #fff; }
.tile-32 { background: #f67c5f; color: #fff; }
.tile-64 { background: #f65e3b; color: #fff; }
.tile-128 { background: #edcf72; color: #fff; font-size: clamp(20px, 6vw, 38px); }
.tile-256 { background: #edcc61; color: #fff; font-size: clamp(20px, 6vw, 38px); }
.tile-512 { background: #edc850; color: #fff; font-size: clamp(20px, 6vw, 38px); }
.tile-1024 { background: #edc53f; color: #fff; font-size: clamp(17px, 5vw, 32px); }
.tile-2048 { background: #edc22e; color: #fff; box-shadow: 0 0 22px rgba(255, 212, 59, 0.8); font-size: clamp(17px, 5vw, 32px); }
.tile-4096,
.tile-8192 { background: #3c3a32; color: #fff; font-size: clamp(15px, 4.5vw, 28px); }

.n2048-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 248, 231, 0.92);
  text-align: center;
  backdrop-filter: blur(4px);
}

.n2048-overlay > span {
  font-size: 46px;
}

.n2048-overlay h2 {
  font-size: 23px;
}

.n2048-overlay p {
  margin: 5px 0 14px;
  color: var(--muted);
  font-size: 11px;
}

.n2048-overlay > div {
  display: flex;
  gap: 8px;
}

.n2048-hint {
  margin-top: 13px;
  color: var(--muted);
  font-size: 11px;
  text-align: center;
}

.action-btn {
  width: 100%;
}
</style>
