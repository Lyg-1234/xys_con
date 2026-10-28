<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const SIZE = 18
const { bestFor } = useGameScores()
const snake = ref([])
const food = ref({ x: 12, y: 9 })
const direction = ref({ x: 1, y: 0 })
const queuedDirection = ref({ x: 1, y: 0 })
const running = ref(false)
const paused = ref(false)
const gameOver = ref(false)
const score = ref(0)
const apples = ref(0)
let tickTimer = null
let swipeStart = null

const best = computed(() => bestFor(props.game.id))
const level = computed(() => 1 + Math.floor(apples.value / 5))
const speed = computed(() => Math.max(72, 155 - (level.value - 1) * 11))
const status = computed(() => (gameOver.value ? '撞到了' : paused.value ? '已暂停' : running.value ? '移动中' : '准备开始'))
const snakeKeys = computed(() => new Set(snake.value.map((item) => `${item.x}-${item.y}`)))
const foodKey = computed(() => `${food.value.x}-${food.value.y}`)
const cells = computed(() =>
  Array.from({ length: SIZE * SIZE }, (_, index) => ({ x: index % SIZE, y: Math.floor(index / SIZE) }))
)

function spawnFood() {
  const occupied = new Set(snake.value.map((item) => `${item.x}-${item.y}`))
  const empty = cells.value.filter((cell) => !occupied.has(`${cell.x}-${cell.y}`))
  food.value = empty[Math.floor(Math.random() * empty.length)] || { x: -1, y: -1 }
}

function startGame() {
  recordPlay(props.game.id)
  if (tickTimer) clearTimeout(tickTimer)
  snake.value = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]
  direction.value = { x: 1, y: 0 }
  queuedDirection.value = { x: 1, y: 0 }
  score.value = 0
  apples.value = 0
  gameOver.value = false
  paused.value = false
  running.value = true
  spawnFood()
  tickTimer = setTimeout(step, speed.value)
}

function setDirection(x, y) {
  if (!running.value || paused.value) return
  if (x === -direction.value.x && y === -direction.value.y) return
  queuedDirection.value = { x, y }
}

function step() {
  if (!running.value || paused.value) return
  direction.value = queuedDirection.value
  const head = snake.value[0]
  const next = { x: head.x + direction.value.x, y: head.y + direction.value.y }
  const hitsWall = next.x < 0 || next.x >= SIZE || next.y < 0 || next.y >= SIZE
  const eating = next.x === food.value.x && next.y === food.value.y
  const body = eating ? snake.value : snake.value.slice(0, -1)
  const hitsSelf = body.some((part) => part.x === next.x && part.y === next.y)

  if (hitsWall || hitsSelf) {
    finishGame()
    return
  }

  snake.value = [next, ...body]
  if (eating) {
    apples.value += 1
    score.value += 10 + level.value * 2
    spawnFood()
  }
  tickTimer = setTimeout(step, speed.value)
}

function finishGame() {
  running.value = false
  gameOver.value = true
  if (tickTimer) clearTimeout(tickTimer)
  submitScore(props.game.id, score.value, { apples: apples.value })
}

function togglePause() {
  if (!running.value || gameOver.value) return
  paused.value = !paused.value
  if (paused.value) {
    if (tickTimer) clearTimeout(tickTimer)
  } else {
    tickTimer = setTimeout(step, speed.value)
  }
}

function onKeydown(event) {
  const key = event.key.toLowerCase()
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
    event.preventDefault()
  }
  if (key === 'arrowup' || key === 'w') setDirection(0, -1)
  else if (key === 'arrowdown' || key === 's') setDirection(0, 1)
  else if (key === 'arrowleft' || key === 'a') setDirection(-1, 0)
  else if (key === 'arrowright' || key === 'd') setDirection(1, 0)
  else if (key === 'p') togglePause()
}

function onPointerDown(event) {
  swipeStart = { x: event.clientX, y: event.clientY }
}

function onPointerUp(event) {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = null
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return
  if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 1 : -1, 0)
  else setDirection(0, dy > 0 ? 1 : -1)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  startGame()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (tickTimer) clearTimeout(tickTimer)
})
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="snake-wrap">
      <div class="snake-meta">
        <span>🍎 <b>{{ apples }}</b></span>
        <span>速度等级 <b>{{ level }}</b></span>
        <button type="button" :disabled="!running || gameOver" @click="togglePause">
          {{ paused ? '继续' : '暂停' }}
        </button>
      </div>

      <div
        class="snake-board"
        :style="{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
      >
        <div
          v-for="cell in cells"
          :key="`${cell.x}-${cell.y}`"
          class="snake-cell"
          :class="{
            'is-snake': snakeKeys.has(`${cell.x}-${cell.y}`),
            'is-head': snake[0]?.x === cell.x && snake[0]?.y === cell.y,
            'is-food': foodKey === `${cell.x}-${cell.y}`
          }"
        >
          <span v-if="foodKey === `${cell.x}-${cell.y}`" />
        </div>

        <div v-if="!running || paused || gameOver" class="snake-overlay">
          <span>{{ gameOver ? '💥' : paused ? '⏸️' : '🐍' }}</span>
          <h2>{{ gameOver ? '撞到啦！' : paused ? '暂停中' : '准备开跑' }}</h2>
          <p>{{ gameOver ? `吃到 ${apples} 个果实，得分 ${score}。` : '吃掉果实，避免撞墙和咬到自己。' }}</p>
          <button type="button" class="btn btn--yellow" @click="gameOver ? startGame() : togglePause()">
            {{ gameOver ? '再来一局' : paused ? '继续游戏' : '开始游戏' }}
          </button>
        </div>
      </div>

      <div class="snake-dpad">
        <button type="button" class="up" aria-label="向上" @click="setDirection(0, -1)">↑</button>
        <button type="button" class="left" aria-label="向左" @click="setDirection(-1, 0)">←</button>
        <button type="button" class="down" aria-label="向下" @click="setDirection(0, 1)">↓</button>
        <button type="button" class="right" aria-label="向右" @click="setDirection(1, 0)">→</button>
      </div>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="startGame">重新开始</button>
      <button type="button" class="btn btn--ghost action-btn" @click="togglePause">
        {{ paused ? '继续游戏' : '暂停游戏' }}
      </button>
    </template>
  </GameShell>
</template>

<style scoped>
.snake-wrap {
  width: min(100%, 560px);
}

.snake-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.snake-meta span,
.snake-meta button {
  padding: 5px 10px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  font-size: 10px;
  font-weight: 800;
}

.snake-board {
  position: relative;
  display: grid;
  width: min(520px, 88vw);
  aspect-ratio: 1;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 14px;
  background: #1b2f32;
  box-shadow: 0 0 0 4px #3a504f, 7px 8px 0 var(--ink);
  touch-action: none;
}

.snake-cell {
  position: relative;
  border: 0.5px solid rgba(255, 255, 255, 0.035);
}

.snake-cell.is-snake {
  z-index: 1;
  border-radius: 3px;
  background: #82c91e;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.22);
}

.snake-cell.is-head {
  border-radius: 6px;
  background: #d8f34e;
}

.snake-cell.is-head::before,
.snake-cell.is-head::after {
  content: '';
  position: absolute;
  top: 26%;
  width: 12%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #18232f;
}

.snake-cell.is-head::before {
  left: 23%;
}

.snake-cell.is-head::after {
  right: 23%;
}

.snake-cell.is-food span {
  position: absolute;
  inset: 17%;
  z-index: 2;
  border: 1px solid #9a3412;
  border-radius: 50%;
  background: #ff6554;
  box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.15);
  animation: food-pulse 0.8s ease-in-out infinite alternate;
}

.snake-cell.is-food span::after {
  content: '';
  position: absolute;
  top: -20%;
  left: 45%;
  width: 30%;
  height: 30%;
  border-radius: 5px 0 5px 0;
  background: #66c43d;
}

.snake-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-content: center;
  justify-items: center;
  padding: 20px;
  background: rgba(13, 26, 28, 0.84);
  color: #fff;
  text-align: center;
  backdrop-filter: blur(4px);
}

.snake-overlay > span {
  font-size: 46px;
}

.snake-overlay h2 {
  margin-top: 7px;
  font-size: 22px;
}

.snake-overlay p {
  margin: 4px 0 14px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11px;
}

.snake-dpad {
  display: none;
}

@keyframes food-pulse {
  to {
    transform: scale(1.16);
  }
}

@media (max-width: 600px) {
  .snake-dpad {
    display: grid;
    grid-template-columns: repeat(3, 45px);
    grid-template-rows: repeat(2, 40px);
    justify-content: center;
    gap: 5px;
    margin-top: 15px;
  }

  .snake-dpad button {
    border: 1.5px solid var(--ink);
    border-radius: 10px;
    background: #fff;
    box-shadow: 2px 2px 0 var(--ink);
    font-weight: 1000;
  }

  .snake-dpad .up {
    grid-column: 2;
  }

  .snake-dpad .left {
    grid-column: 1;
    grid-row: 2;
  }

  .snake-dpad .down {
    grid-column: 2;
    grid-row: 2;
  }

  .snake-dpad .right {
    grid-column: 3;
    grid-row: 2;
  }
}

.action-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
