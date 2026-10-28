<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const SIZE = 9
const MINES = 10
const { bestFor } = useGameScores()
const board = ref([])
const flags = ref(0)
const seconds = ref(0)
const started = ref(false)
const running = ref(false)
const won = ref(false)
const lost = ref(false)
const flagMode = ref(false)
let timer = null

const best = computed(() => bestFor(props.game.id))
const revealedSafe = computed(() => board.value.filter((cell) => cell.revealed && !cell.mine).length)
const score = computed(() => {
  const base = revealedSafe.value * 10
  return won.value ? base + Math.max(0, 600 - seconds.value * 4) : base
})
const status = computed(() =>
  won.value ? '排雷成功' : lost.value ? '踩到地雷' : running.value ? '排雷中' : '等待开局'
)

function makeCell() {
  return { mine: false, adjacent: 0, revealed: false, flagged: false }
}

function startGame() {
  recordPlay(props.game.id)
  board.value = Array.from({ length: SIZE * SIZE }, makeCell)
  flags.value = 0
  seconds.value = 0
  started.value = false
  running.value = true
  won.value = false
  lost.value = false
  flagMode.value = false
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (running.value && started.value) seconds.value += 1
  }, 1000)
}

function neighbors(index) {
  const x = index % SIZE
  const y = Math.floor(index / SIZE)
  const result = []
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (!dx && !dy) continue
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) result.push(ny * SIZE + nx)
    }
  }
  return result
}

function placeMines(safeIndex) {
  const forbidden = new Set([safeIndex, ...neighbors(safeIndex)])
  const candidates = Array.from({ length: SIZE * SIZE }, (_, index) => index).filter(
    (index) => !forbidden.has(index)
  )
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  const next = board.value.map((cell) => ({ ...cell }))
  candidates.slice(0, MINES).forEach((index) => {
    next[index].mine = true
  })
  next.forEach((cell, index) => {
    if (!cell.mine) cell.adjacent = neighbors(index).filter((neighbor) => next[neighbor].mine).length
  })
  board.value = next
}

function reveal(index) {
  if (!running.value || lost.value || won.value) return
  if (!started.value) {
    started.value = true
    placeMines(index)
  }
  const cell = board.value[index]
  if (cell.flagged || cell.revealed) return
  if (cell.mine) {
    board.value = board.value.map((item) => (item.mine ? { ...item, revealed: true } : item))
    finish(false)
    return
  }

  const next = board.value.map((item) => ({ ...item }))
  const queue = [index]
  const visited = new Set()
  while (queue.length) {
    const current = queue.shift()
    if (visited.has(current)) continue
    visited.add(current)
    const item = next[current]
    if (item.flagged || item.mine) continue
    item.revealed = true
    if (item.adjacent === 0) {
      neighbors(current).forEach((neighbor) => {
        if (!next[neighbor].revealed) queue.push(neighbor)
      })
    }
  }
  board.value = next
  if (next.filter((item) => item.revealed && !item.mine).length === SIZE * SIZE - MINES) finish(true)
}

function toggleFlag(index) {
  if (!running.value || lost.value || won.value) return
  const next = board.value.map((item) => ({ ...item }))
  const cell = next[index]
  if (cell.revealed) return
  cell.flagged = !cell.flagged
  board.value = next
  flags.value = next.filter((item) => item.flagged).length
}

function activate(index) {
  if (flagMode.value) toggleFlag(index)
  else reveal(index)
}

function rightClick(event, index) {
  event.preventDefault()
  toggleFlag(index)
}

function finish(success) {
  running.value = false
  won.value = success
  lost.value = !success
  if (timer) clearInterval(timer)
  submitScore(props.game.id, score.value, { seconds: seconds.value, success })
}

onMounted(startGame)
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="mine-wrap">
      <div class="mine-meta">
        <span>💣 <b>{{ MINES - flags }}</b></span>
        <span>⏱ <b>{{ seconds }}s</b></span>
        <button
          type="button"
          class="mine-flag-toggle"
          :class="{ 'is-active': flagMode }"
          @click="flagMode = !flagMode"
        >
          {{ flagMode ? '🚩 插旗模式' : '⛏ 翻开模式' }}
        </button>
      </div>

      <div class="mine-board" :style="{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }">
        <button
          v-for="(cell, index) in board"
          :key="index"
          type="button"
          class="mine-cell"
          :class="{
            'is-revealed': cell.revealed,
            'is-mine': cell.revealed && cell.mine,
            'is-flagged': cell.flagged,
            [`num-${cell.adjacent}`]: cell.revealed && !cell.mine && cell.adjacent
          }"
          @click="activate(index)"
          @contextmenu="rightClick($event, index)"
        >
          <template v-if="cell.revealed">
            <span v-if="cell.mine">💥</span>
            <span v-else-if="cell.adjacent">{{ cell.adjacent }}</span>
          </template>
          <span v-else-if="cell.flagged">🚩</span>
        </button>
      </div>

      <div v-if="won || lost" class="mine-result" :class="{ 'is-lost': lost }">
        <span>{{ won ? '🎉' : '💥' }}</span>
        <div>
          <h2>{{ won ? '排雷成功！' : '踩到地雷了' }}</h2>
          <p>{{ won ? `用时 ${seconds} 秒，获得 ${score} 分。` : `已经安全揭开 ${revealedSafe} 格，再试一次吧。` }}</p>
        </div>
        <button type="button" class="btn btn--primary" @click="startGame">重新布雷</button>
      </div>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="startGame">重新开始</button>
      <button type="button" class="btn btn--ghost action-btn" @click="flagMode = !flagMode">
        {{ flagMode ? '切换到翻开' : '切换到插旗' }}
      </button>
    </template>
  </GameShell>
</template>

<style scoped>
.mine-wrap {
  width: min(100%, 520px);
}

.mine-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mine-meta > span,
.mine-flag-toggle {
  min-width: 82px;
  padding: 6px 10px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
}

.mine-flag-toggle.is-active {
  background: var(--sun);
}

.mine-board {
  display: grid;
  width: min(490px, 88vw);
  aspect-ratio: 1;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 14px;
  background: #c9d6df;
  box-shadow: 6px 6px 0 var(--ink);
}

.mine-cell {
  display: grid;
  place-items: center;
  border: 0.5px solid rgba(24, 35, 47, 0.26);
  background: #e8eff3;
  box-shadow: inset 2px 2px 0 rgba(255, 255, 255, 0.7), inset -2px -2px 0 rgba(24, 35, 47, 0.12);
  font-size: clamp(13px, 3.5vw, 23px);
  font-weight: 1000;
}

.mine-cell:hover:not(.is-revealed) {
  background: #fff4b8;
}

.mine-cell.is-revealed {
  background: #fffdf7;
  box-shadow: none;
}

.mine-cell.is-mine {
  background: #ffd6cf;
}

.mine-cell.is-flagged {
  background: #fff3c8;
}

.num-1 { color: #1976d2; }
.num-2 { color: #388e3c; }
.num-3 { color: #d32f2f; }
.num-4 { color: #7b1fa2; }
.num-5 { color: #b33c00; }
.num-6 { color: #00838f; }
.num-7 { color: #263238; }
.num-8 { color: #555; }

.mine-result {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 16px;
  padding: 13px;
  border: 2px solid var(--ink);
  border-radius: 15px;
  background: #dff9f3;
}

.mine-result.is-lost {
  background: #ffe3db;
}

.mine-result > span {
  font-size: 34px;
}

.mine-result > div {
  flex: 1;
}

.mine-result h2 {
  font-size: 18px;
}

.mine-result p {
  color: var(--muted);
  font-size: 11px;
}

@media (max-width: 600px) {
  .mine-result {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

.action-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
