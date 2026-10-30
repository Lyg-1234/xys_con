<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const { bestFor } = useGameScores()
const mode = computed(() => props.game.id)
const best = computed(() => bestFor(props.game.id))
const score = ref(0)
const running = ref(false)
const finished = ref(false)
const message = ref('')
const resultTitle = ref('')
const field = ref(null)

let frameId = null
let lastFrameTime = 0
let spawnAccumulator = 0
let invulnerableUntil = 0
let enemyId = 0
const pressedKeys = new Set()

function beginSession() {
  if (frameId) cancelAnimationFrame(frameId)
  frameId = null
  recordPlay(props.game.id)
  score.value = 0
  running.value = true
  finished.value = false
  message.value = ''
  resultTitle.value = ''
  pressedKeys.clear()
}

function completeGame(title, detail, finalScore = score.value) {
  if (finished.value) return
  if (frameId) cancelAnimationFrame(frameId)
  frameId = null
  running.value = false
  finished.value = true
  score.value = Math.max(0, Math.round(finalScore))
  resultTitle.value = title
  message.value = detail
  submitScore(props.game.id, score.value)
}

function startLoop() {
  lastFrameTime = performance.now()
  spawnAccumulator = 0
  if (frameId) cancelAnimationFrame(frameId)
  frameId = requestAnimationFrame(loop)
}

function loop(time) {
  if (!running.value) {
    frameId = null
    return
  }
  const delta = Math.min(0.035, Math.max(0, (time - lastFrameTime) / 1000))
  lastFrameTime = time
  if (mode.value === 'pong') updatePong(delta)
  else if (mode.value === 'breakout') updateBreakout(delta)
  else if (mode.value === 'sky-dodge') updateSkyDodge(delta, time)
  if (running.value) frameId = requestAnimationFrame(loop)
}

// 像素乒乓
const pongBall = ref({ x: 52, y: 50, vx: 34, vy: 20 })
const pongPlayer = ref(50)
const pongAi = ref(50)
const pongPlayerScore = ref(0)
const pongAiScore = ref(0)

function resetPongBall(direction = 1) {
  pongBall.value = {
    x: 50,
    y: 45 + Math.random() * 10,
    vx: direction * 34,
    vy: (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 10)
  }
}

function resetPong() {
  pongPlayer.value = 50
  pongAi.value = 50
  pongPlayerScore.value = 0
  pongAiScore.value = 0
  resetPongBall(Math.random() < 0.5 ? -1 : 1)
  startLoop()
}

function updatePong(delta) {
  const ball = { ...pongBall.value }
  ball.x += ball.vx * delta
  ball.y += ball.vy * delta
  if (ball.y <= 3) {
    ball.y = 3
    ball.vy = Math.abs(ball.vy)
  } else if (ball.y >= 97) {
    ball.y = 97
    ball.vy = -Math.abs(ball.vy)
  }

  if (ball.x <= 5 && ball.vx < 0) {
    if (Math.abs(ball.y - pongPlayer.value) <= 12) {
      ball.x = 5
      ball.vx = Math.abs(ball.vx) * 1.04
      ball.vy += (ball.y - pongPlayer.value) * 0.7
    } else {
      pongAiScore.value += 1
      score.value = pongPlayerScore.value * 100
      if (pongAiScore.value >= 5) {
        completeGame('电脑拿下比赛', `最终比分 ${pongPlayerScore.value} : ${pongAiScore.value}。`, pongPlayerScore.value * 100)
        return
      }
      resetPongBall(1)
      return
    }
  }
  if (ball.x >= 95 && ball.vx > 0) {
    if (Math.abs(ball.y - pongAi.value) <= 12) {
      ball.x = 95
      ball.vx = -Math.abs(ball.vx) * 1.04
      ball.vy += (ball.y - pongAi.value) * 0.6
    } else {
      pongPlayerScore.value += 1
      score.value = pongPlayerScore.value * 100
      if (pongPlayerScore.value >= 5) {
        completeGame('比赛胜利！', `你在像素乒乓中以 ${pongPlayerScore.value} : ${pongAiScore.value} 获胜。`, 500 + pongAiScore.value * 20)
        return
      }
      resetPongBall(-1)
      return
    }
  }

  const aiSpeed = 27 + Math.min(18, Math.abs(ball.vx) * 0.18)
  const aiDelta = Math.max(-aiSpeed * delta, Math.min(aiSpeed * delta, ball.y - pongAi.value))
  pongAi.value = Math.max(11, Math.min(89, pongAi.value + aiDelta))
  ball.vy = Math.max(-38, Math.min(38, ball.vy))
  pongBall.value = ball
}

// 弹球砖块
const BREAKOUT_COLS = 6
const BREAKOUT_ROWS = 5
const breakoutBricks = ref([])
const breakoutBall = ref({ x: 50, y: 73, vx: 22, vy: -34 })
const breakoutPaddle = ref(50)
const breakoutLives = ref(3)
const breakoutHitCount = ref(0)

function makeBricks() {
  return Array.from({ length: BREAKOUT_ROWS * BREAKOUT_COLS }, (_, index) => ({
    id: index,
    row: Math.floor(index / BREAKOUT_COLS),
    col: index % BREAKOUT_COLS,
    alive: true,
    x: 4 + (index % BREAKOUT_COLS) * 15.5,
    y: 8 + Math.floor(index / BREAKOUT_COLS) * 7.2
  }))
}

function resetBreakoutBall() {
  breakoutBall.value = {
    x: breakoutPaddle.value,
    y: 76,
    vx: (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 8),
    vy: -32
  }
}

function resetBreakout() {
  breakoutBricks.value = makeBricks()
  breakoutPaddle.value = 50
  breakoutLives.value = 3
  breakoutHitCount.value = 0
  resetBreakoutBall()
  startLoop()
}

function updateBreakout(delta) {
  if (pressedKeys.has('ArrowLeft') || pressedKeys.has('a')) breakoutPaddle.value -= 65 * delta
  if (pressedKeys.has('ArrowRight') || pressedKeys.has('d')) breakoutPaddle.value += 65 * delta
  breakoutPaddle.value = Math.max(9, Math.min(91, breakoutPaddle.value))

  const ball = { ...breakoutBall.value }
  ball.x += ball.vx * delta
  ball.y += ball.vy * delta
  if (ball.x <= 2) {
    ball.x = 2
    ball.vx = Math.abs(ball.vx)
  } else if (ball.x >= 98) {
    ball.x = 98
    ball.vx = -Math.abs(ball.vx)
  }
  if (ball.y <= 3) {
    ball.y = 3
    ball.vy = Math.abs(ball.vy)
  }

  const bricks = breakoutBricks.value.slice()
  let hitIndex = -1
  for (let index = 0; index < bricks.length; index += 1) {
    const brick = bricks[index]
    if (!brick.alive) continue
    if (
      ball.x > brick.x - 1.4 &&
      ball.x < brick.x + 13.9 &&
      ball.y > brick.y - 1.8 &&
      ball.y < brick.y + 4.5
    ) {
      hitIndex = index
      break
    }
  }
  if (hitIndex >= 0) {
    bricks[hitIndex] = { ...bricks[hitIndex], alive: false }
    breakoutBricks.value = bricks
    breakoutHitCount.value += 1
    ball.vy = Math.abs(ball.vy)
    score.value = breakoutHitCount.value * 50 + (3 - breakoutLives.value) * 0
    if (bricks.every((brick) => !brick.alive)) {
      completeGame('砖墙清空！', `剩余 ${breakoutLives.value} 条生命，成功完成挑战。`, 1500 + breakoutLives.value * 100)
      return
    }
  }

  if (ball.y >= 87 && ball.y <= 94 && ball.vy > 0) {
    if (Math.abs(ball.x - breakoutPaddle.value) <= 11) {
      ball.y = 87
      ball.vy = -Math.abs(ball.vy)
      ball.vx += (ball.x - breakoutPaddle.value) * 1.1
      ball.vx = Math.max(-42, Math.min(42, ball.vx))
      score.value = breakoutHitCount.value * 50
    } else if (ball.y >= 99) {
      breakoutLives.value -= 1
      if (breakoutLives.value <= 0) {
        completeGame('小球落底了', `你击碎了 ${breakoutHitCount.value} 块砖。`, breakoutHitCount.value * 50)
        return
      }
      resetBreakoutBall()
      return
    }
  }
  if (ball.y > 100) {
    breakoutLives.value -= 1
    if (breakoutLives.value <= 0) {
      completeGame('小球落底了', `你击碎了 ${breakoutHitCount.value} 块砖。`, breakoutHitCount.value * 50)
      return
    }
    resetBreakoutBall()
    return
  }
  breakoutBall.value = ball
}

// 星海穿梭
const skyShip = ref(50)
const skyEnemies = ref([])
const skyLives = ref(3)
const skySeconds = ref(0)

function spawnSkyEnemy() {
  const size = 7 + Math.random() * 5
  skyEnemies.value = [
    ...skyEnemies.value,
    {
      id: enemyId += 1,
      x: size / 2 + Math.random() * (100 - size),
      y: -8,
      size,
      speed: 20 + Math.random() * 19 + Math.min(22, skySeconds.value * 0.3)
    }
  ]
}

function resetSkyDodge() {
  skyShip.value = 50
  skyEnemies.value = []
  skyLives.value = 3
  skySeconds.value = 0
  spawnAccumulator = 0
  invulnerableUntil = 0
  startLoop()
}

function updateSkyDodge(delta, time) {
  skySeconds.value += delta
  if (pressedKeys.has('ArrowLeft') || pressedKeys.has('a')) skyShip.value -= 52 * delta
  if (pressedKeys.has('ArrowRight') || pressedKeys.has('d')) skyShip.value += 52 * delta
  skyShip.value = Math.max(7, Math.min(93, skyShip.value))

  spawnAccumulator += delta
  const spawnInterval = Math.max(0.28, 0.72 - skySeconds.value * 0.006)
  if (spawnAccumulator >= spawnInterval) {
    spawnAccumulator = 0
    spawnSkyEnemy()
  }

  const active = []
  let lives = skyLives.value
  for (const enemy of skyEnemies.value) {
    const next = { ...enemy, y: enemy.y + enemy.speed * delta }
    if (next.y - next.size / 2 > 104) continue
    if (
      time > invulnerableUntil &&
      next.y + next.size / 2 > 80 &&
      next.y - next.size / 2 < 96 &&
      Math.abs(next.x - skyShip.value) < next.size / 2 + 5
    ) {
      lives -= 1
      invulnerableUntil = time + 900
      continue
    }
    active.push(next)
  }
  skyEnemies.value = active
  if (lives !== skyLives.value) {
    skyLives.value = lives
    if (lives <= 0) {
      completeGame('飞船受损', `坚持了 ${Math.floor(skySeconds.value)} 秒，躲过多次陨石。`, Math.floor(skySeconds.value * 12))
      return
    }
  }
  score.value = Math.floor(skySeconds.value * 12)
}

// 移动与输入
function moveFromPointer(event) {
  if (!running.value || !field.value) return
  const rect = field.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  if (mode.value === 'pong') {
    pongPlayer.value = Math.max(11, Math.min(89, y))
  } else if (mode.value === 'breakout') {
    breakoutPaddle.value = Math.max(9, Math.min(91, x))
  } else if (mode.value === 'sky-dodge') {
    skyShip.value = Math.max(7, Math.min(93, x))
  }
}

function pressDirection(direction) {
  if (!running.value) return
  if (mode.value === 'breakout') {
    breakoutPaddle.value = Math.max(9, Math.min(91, breakoutPaddle.value + direction * 6))
  } else if (mode.value === 'sky-dodge') {
    skyShip.value = Math.max(7, Math.min(93, skyShip.value + direction * 6))
  }
}

function onKeydown(event) {
  const key = event.key
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(key)) {
    event.preventDefault()
    pressedKeys.add(key)
  }
  if (mode.value === 'pong') {
    if (key === 'ArrowUp' || key === 'w') pongPlayer.value = Math.max(11, pongPlayer.value - 7)
    if (key === 'ArrowDown' || key === 's') pongPlayer.value = Math.min(89, pongPlayer.value + 7)
  }
}

function onKeyup(event) {
  pressedKeys.delete(event.key)
}

const tutorial = computed(() => ({
  pong: '在球场上下拖动或按上下方向键移动左侧球拍。',
  breakout: '在球场左右拖动或按方向键移动球拍，接住小球并击碎砖块。',
  'sky-dodge': '左右拖动飞船或使用方向键，陨石会随着时间加速。'
})[mode.value] || '')

const status = computed(() => {
  if (finished.value) return '挑战完成'
  if (!running.value) return '准备开始'
  if (mode.value === 'pong') return `${pongPlayerScore.value}:${pongAiScore.value}`
  if (mode.value === 'breakout') return `生命 ${breakoutLives.value}`
  if (mode.value === 'sky-dodge') return `生命 ${skyLives.value}`
  return '挑战中'
})

function startGame() {
  beginSession()
  if (mode.value === 'pong') resetPong()
  else if (mode.value === 'breakout') resetBreakout()
  else if (mode.value === 'sky-dodge') resetSkyDodge()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)
  startGame()
})

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('keyup', onKeyup)
})
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="arcade-pack">
      <p class="pack-tutorial">{{ tutorial }}</p>

      <section v-if="mode === 'pong'" class="arcade-game">
        <div class="pong-score">
          <span>你 <b>{{ pongPlayerScore }}</b></span>
          <em>率先 5 分</em>
          <span><b>{{ pongAiScore }}</b> 电脑</span>
        </div>
        <div
          ref="field"
          class="pong-field"
          @pointermove="moveFromPointer"
          @pointerdown="moveFromPointer"
        >
          <i class="full-court-line" />
          <span class="pong-paddle is-player" :style="{ top: `${pongPlayer}%` }" />
          <span class="pong-paddle is-ai" :style="{ top: `${pongAi}%` }" />
          <span class="pong-ball" :style="{ left: `${pongBall.x}%`, top: `${pongBall.y}%` }" />
        </div>
      </section>

      <section v-else-if="mode === 'breakout'" class="arcade-game">
        <div class="breakout-meta">
          <span>击碎 <b>{{ breakoutHitCount }}</b></span>
          <span>生命 <b>{{ breakoutLives }}</b></span>
        </div>
        <div
          ref="field"
          class="breakout-field"
          @pointermove="moveFromPointer"
          @pointerdown="moveFromPointer"
        >
          <span
            v-for="brick in breakoutBricks"
            v-show="brick.alive"
            :key="brick.id"
            class="breakout-brick"
            :class="`is-row-${brick.row}`"
            :style="{ left: `${brick.x}%`, top: `${brick.y}%` }"
          />
          <span class="breakout-paddle" :style="{ left: `${breakoutPaddle}%` }" />
          <span class="breakout-ball" :style="{ left: `${breakoutBall.x}%`, top: `${breakoutBall.y}%` }" />
        </div>
      </section>

      <section v-else-if="mode === 'sky-dodge'" class="arcade-game">
        <div class="sky-meta">
          <span>坚持 <b>{{ Math.floor(skySeconds) }}s</b></span>
          <span>生命 <b>{{ skyLives }}</b></span>
        </div>
        <div
          ref="field"
          class="sky-field"
          @pointermove="moveFromPointer"
          @pointerdown="moveFromPointer"
        >
          <i v-for="star in 24" :key="star" class="sky-star" :class="`star-${star}`" />
          <span
            v-for="enemy in skyEnemies"
            :key="enemy.id"
            class="sky-enemy"
            :style="{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              width: `${enemy.size}%`,
              height: `${enemy.size}%`
            }"
          >☄️</span>
          <span class="sky-ship" :style="{ left: `${skyShip}%` }">🚀</span>
        </div>
      </section>

      <div v-if="mode !== 'pong'" class="arcade-buttons">
        <button type="button" aria-label="向左移动" :disabled="finished || mode === 'pong'" @click="pressDirection(-1)">←</button>
        <button type="button" aria-label="向右移动" :disabled="finished || mode === 'pong'" @click="pressDirection(1)">→</button>
      </div>

      <div v-if="finished" class="pack-result">
        <span>🏁</span>
        <div>
          <h2>{{ resultTitle }}</h2>
          <p>{{ message }}</p>
        </div>
        <button type="button" class="btn btn--primary" @click="startGame">再玩一次</button>
      </div>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="startGame">重新开始</button>
    </template>
  </GameShell>
</template>

<style scoped>
.arcade-pack {
  width: min(100%, 570px);
  min-width: 0;
}

.pack-tutorial {
  margin-bottom: 15px;
  padding: 10px 13px;
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  background: #fff8d8;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.55;
}

.arcade-game {
  display: grid;
  justify-items: center;
  gap: 12px;
  width: 100%;
}

.pong-score,
.breakout-meta,
.sky-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.pong-score span,
.breakout-meta span,
.sky-meta span {
  padding: 5px 12px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  font-size: 10px;
  font-weight: 800;
}

.pong-score b {
  margin: 0 4px;
  color: var(--coral-dark);
  font-size: 17px;
}

.pong-score em {
  color: var(--muted);
  font-size: 9px;
  font-style: normal;
  font-weight: 800;
}

.pong-field,
.breakout-field,
.sky-field {
  position: relative;
  width: min(100%, 520px);
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #15233a;
  box-shadow: 6px 6px 0 var(--ink);
  touch-action: none;
  user-select: none;
}

.pong-field {
  aspect-ratio: 1.45;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 9px),
    #142238;
  cursor: ns-resize;
}

.full-court-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-left: 2px dashed rgba(255, 255, 255, 0.22);
}

.pong-paddle {
  position: absolute;
  width: 3.8%;
  height: 23%;
  border: 2px solid var(--ink);
  border-radius: 999px;
  background: #fff5d0;
  transform: translateY(-50%);
}

.pong-paddle.is-player {
  left: 2.5%;
  background: #51d9c0;
}

.pong-paddle.is-ai {
  right: 2.5%;
  background: #ff7f70;
}

.pong-ball {
  position: absolute;
  width: 3.5%;
  aspect-ratio: 1;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #ffd43b;
  box-shadow: 0 0 15px rgba(255, 212, 59, 0.8);
  transform: translate(-50%, -50%);
}

.breakout-field {
  aspect-ratio: 1.18;
  background:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    #19233b;
  background-size: 26px 26px;
  cursor: ew-resize;
}

.breakout-brick {
  position: absolute;
  width: 13.5%;
  height: 4.5%;
  border: 1.5px solid #0f1728;
  border-radius: 4px;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.2);
}

.breakout-brick.is-row-0 { background: #ff6554; }
.breakout-brick.is-row-1 { background: #ffb13b; }
.breakout-brick.is-row-2 { background: #ffd43b; }
.breakout-brick.is-row-3 { background: #46c99a; }
.breakout-brick.is-row-4 { background: #60a1f3; }

.breakout-paddle {
  position: absolute;
  bottom: 3%;
  width: 20%;
  height: 3.5%;
  border: 1.5px solid #fff;
  border-radius: 999px;
  background: #64e2cf;
  transform: translateX(-50%);
  box-shadow: 0 0 12px rgba(100, 226, 207, 0.55);
}

.breakout-ball {
  position: absolute;
  width: 3.2%;
  aspect-ratio: 1;
  border: 1.5px solid #fff;
  border-radius: 50%;
  background: #ffdd55;
  transform: translate(-50%, -50%);
}

.sky-field {
  aspect-ratio: 0.95;
  background:
    radial-gradient(circle at 30% 20%, rgba(96, 173, 255, 0.22), transparent 20%),
    radial-gradient(circle at 80% 65%, rgba(125, 95, 222, 0.2), transparent 25%),
    #0b1833;
  cursor: ew-resize;
}

.sky-star {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #fff;
  animation: twinkle 1.7s ease-in-out infinite alternate;
}

.star-1 { left: 8%; top: 12%; }
.star-2 { left: 19%; top: 31%; animation-delay: -0.5s; }
.star-3 { left: 31%; top: 9%; animation-delay: -1.1s; }
.star-4 { left: 43%; top: 22%; }
.star-5 { left: 55%; top: 13%; animation-delay: -0.8s; }
.star-6 { left: 67%; top: 34%; }
.star-7 { left: 77%; top: 8%; animation-delay: -1.3s; }
.star-8 { left: 89%; top: 25%; }
.star-9 { left: 13%; top: 52%; animation-delay: -0.3s; }
.star-10 { left: 24%; top: 67%; }
.star-11 { left: 38%; top: 48%; animation-delay: -0.7s; }
.star-12 { left: 48%; top: 72%; }
.star-13 { left: 62%; top: 51%; animation-delay: -1.2s; }
.star-14 { left: 74%; top: 64%; }
.star-15 { left: 84%; top: 44%; animation-delay: -0.4s; }
.star-16 { left: 93%; top: 58%; }
.star-17 { left: 7%; top: 82%; }
.star-18 { left: 28%; top: 88%; animation-delay: -0.9s; }
.star-19 { left: 41%; top: 91%; }
.star-20 { left: 56%; top: 84%; animation-delay: -1.5s; }
.star-21 { left: 68%; top: 93%; }
.star-22 { left: 81%; top: 79%; animation-delay: -0.6s; }
.star-23 { left: 94%; top: 89%; }
.star-24 { left: 50%; top: 38%; animation-delay: -1.4s; }

.sky-enemy {
  position: absolute;
  display: grid;
  place-items: center;
  font-size: clamp(25px, 8vw, 44px);
  line-height: 1;
  transform: translate(-50%, -50%);
}

.sky-ship {
  position: absolute;
  bottom: 6%;
  z-index: 3;
  font-size: clamp(31px, 9vw, 48px);
  line-height: 1;
  transform: translateX(-50%);
  filter: drop-shadow(0 0 8px rgba(112, 205, 255, 0.7));
}

.arcade-buttons {
  display: none;
}

.pack-result {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 17px;
  padding: 13px;
  border: 2px solid var(--ink);
  border-radius: 16px;
  background: #dff9f3;
}

.pack-result > span {
  font-size: 33px;
}

.pack-result > div {
  min-width: 0;
  flex: 1;
}

.pack-result h2 {
  font-size: 18px;
}

.pack-result p {
  color: var(--muted);
  font-size: 11px;
}

.action-btn {
  width: 100%;
}

@keyframes twinkle {
  to {
    opacity: 0.25;
    transform: scale(1.7);
  }
}

@media (max-width: 520px) {
  .pong-field,
  .breakout-field,
  .sky-field {
    width: 100%;
  }

  .arcade-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .arcade-buttons button {
    width: 58px;
    min-height: 46px;
    border: 1.5px solid var(--ink);
    border-radius: 12px;
    background: #fff;
    box-shadow: 2px 2px 0 var(--ink);
    font-size: 20px;
    font-weight: 1000;
  }

  .pack-result {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .pack-result .btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sky-star {
    animation: none;
  }
}
</style>
