<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import SpotScene from '@/components/SpotScene.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const THEMES = [
  { name: '晴日小屋', sky1: '#bfe9ff', sky2: '#eefaff', far: '#c9e59f', hill1: '#9ed16e', hill2: '#65af4a', ground: '#e5c36a', roof: '#ee6b5c', tree: '#4f9b46', tree2: '#68b654' },
  { name: '黄昏花园', sky1: '#ffbc8f', sky2: '#fff1c9', far: '#e6b96f', hill1: '#b7b85a', hill2: '#889a43', ground: '#d5a254', roof: '#b85d65', tree: '#537d4c', tree2: '#6b965c' },
  { name: '薄荷山谷', sky1: '#c6f4e9', sky2: '#f1fff9', far: '#b8dfb9', hill1: '#71ca9c', hill2: '#47a978', ground: '#dbc878', roof: '#4e86d9', tree: '#2e8d62', tree2: '#4caa7b' }
]

const DIFFERENCES = [
  { id: 'sun', label: '太阳位置与颜色', x: 72, y: 44, r: 38 },
  { id: 'smoke', label: '烟囱冒烟', x: 282, y: 72, r: 36 },
  { id: 'window', label: '窗户灯光', x: 266, y: 145, r: 36 },
  { id: 'flowers', label: '花朵数量', x: 118, y: 236, r: 38 },
  { id: 'balloon', label: '气球颜色', x: 357, y: 117, r: 37 }
]

const { bestFor } = useGameScores()
const found = ref([])
const mistakes = ref(0)
const seconds = ref(0)
const running = ref(false)
const finished = ref(false)
const wrongPoint = ref(null)
const themeIndex = ref(0)
let tickTimer = null
let wrongTimer = null

const best = computed(() => bestFor(props.game.id))
const score = computed(() => {
  if (!finished.value) return found.value.length * 100
  return Math.max(100, 1200 - seconds.value * 8 - mistakes.value * 35)
})
const status = computed(() => (finished.value ? '挑战完成' : running.value ? '寻找不同' : '准备开始'))
const theme = computed(() => THEMES[themeIndex.value])

function startGame() {
  if (tickTimer) clearInterval(tickTimer)
  if (wrongTimer) clearTimeout(wrongTimer)
  recordPlay(props.game.id)
  found.value = []
  mistakes.value = 0
  seconds.value = 0
  wrongPoint.value = null
  finished.value = false
  running.value = true
  themeIndex.value = (themeIndex.value + 1 + Math.floor(Math.random() * 2)) % THEMES.length
  tickTimer = setInterval(() => {
    if (running.value) seconds.value += 1
  }, 1000)
}

function pick(point) {
  if (!running.value || finished.value) return
  const hit = DIFFERENCES.find(
    (item) =>
      !found.value.includes(item.id) &&
      Math.hypot(point.x - item.x, point.y - item.y) <= item.r
  )
  if (hit) {
    found.value = [...found.value, hit.id]
    if (found.value.length === DIFFERENCES.length) complete()
    return
  }

  const alreadyFound = DIFFERENCES.some(
    (item) => found.value.includes(item.id) && Math.hypot(point.x - item.x, point.y - item.y) <= item.r
  )
  if (!alreadyFound) {
    mistakes.value += 1
    wrongPoint.value = point
    if (wrongTimer) clearTimeout(wrongTimer)
    wrongTimer = setTimeout(() => {
      wrongPoint.value = null
    }, 420)
  }
}

function complete() {
  running.value = false
  finished.value = true
  if (tickTimer) clearInterval(tickTimer)
  submitScore(props.game.id, score.value, { seconds: seconds.value, mistakes: mistakes.value })
}

onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
  if (wrongTimer) clearTimeout(wrongTimer)
})
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="spot-wrap">
      <div class="spot-toolbar">
        <div>
          <span>场景</span>
          <strong>{{ theme.name }}</strong>
        </div>
        <div>
          <span>已经找到</span>
          <strong>{{ found.length }} / {{ DIFFERENCES.length }}</strong>
        </div>
        <div>
          <span>用时</span>
          <strong>{{ seconds }}s</strong>
        </div>
        <div>
          <span>失误</span>
          <strong>{{ mistakes }}</strong>
        </div>
      </div>

      <div class="spot-grid">
        <div>
          <p>原图</p>
          <SpotScene
            :variant="0"
            :found="found"
            :wrong-point="wrongPoint"
            :theme="theme"
            side="left"
            @pick="pick"
          />
        </div>
        <div>
          <p>找不同</p>
          <SpotScene
            :variant="1"
            :found="found"
            :wrong-point="wrongPoint"
            :theme="theme"
            side="right"
            @pick="pick"
          />
        </div>
      </div>

      <div class="spot-progress">
        <span v-for="item in DIFFERENCES" :key="item.id" :class="{ 'is-found': found.includes(item.id) }">
          <i>{{ found.includes(item.id) ? '✓' : '?' }}</i>
          {{ found.includes(item.id) ? item.label : '未发现' }}
        </span>
      </div>

      <div v-if="finished" class="spot-result panel">
        <div class="spot-result__icon">🎉</div>
        <div>
          <h2>全部找出来了！</h2>
          <p>用时 {{ seconds }} 秒，失误 {{ mistakes }} 次，获得 {{ score }} 分。</p>
        </div>
        <button type="button" class="btn btn--primary" @click="startGame">换个场景</button>
      </div>

      <button v-if="!running && !finished" type="button" class="btn btn--primary spot-start" @click="startGame">
        开始找不同
      </button>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="startGame">新一轮</button>
    </template>
  </GameShell>
</template>

<style scoped>
.spot-wrap {
  width: 100%;
}

.spot-toolbar {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 0.7fr);
  gap: 8px;
  margin-bottom: 14px;
}

.spot-toolbar div {
  padding: 9px 11px;
  border: 1.5px solid var(--ink);
  border-radius: 11px;
  background: #fff;
}

.spot-toolbar span,
.spot-toolbar strong {
  display: block;
}

.spot-toolbar span {
  color: var(--muted);
  font-size: 9px;
  font-weight: 800;
}

.spot-toolbar strong {
  margin-top: 1px;
  font-size: 14px;
}

.spot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.spot-grid > div > p {
  margin-bottom: 6px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
}

.spot-progress {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}

.spot-progress span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 800;
}

.spot-progress span.is-found {
  border-color: var(--mint-dark);
  background: #dff9f3;
  color: var(--mint-dark);
}

.spot-progress i {
  font-style: normal;
}

.spot-result {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 16px;
  padding: 13px 15px;
  background: #fff5c8;
}

.spot-result__icon {
  font-size: 34px;
}

.spot-result > div:nth-child(2) {
  flex: 1;
}

.spot-result h2 {
  font-size: 18px;
}

.spot-result p {
  color: var(--muted);
  font-size: 11px;
}

.spot-start {
  margin-top: 16px;
}

@media (max-width: 700px) {
  .spot-toolbar {
    grid-template-columns: repeat(2, 1fr);
  }

  .spot-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .spot-grid > div > p {
    margin-bottom: 7px;
    font-size: 11px;
  }

  .spot-result {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 360px) {
  .spot-toolbar {
    grid-template-columns: 1fr;
  }
}

.action-btn {
  width: 100%;
}
</style>
