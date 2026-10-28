<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const SYMBOLS = ['🍓', '🌻', '🐙', '🚀', '🎈', '🧁', '🐼', '🎧']
const { bestFor } = useGameScores()
const cards = ref([])
const opened = ref([])
const matched = ref([])
const moves = ref(0)
const seconds = ref(0)
const lock = ref(false)
const finished = ref(false)
let tickTimer = null
let closeTimer = null

const best = computed(() => bestFor(props.game.id))
const pairs = computed(() => matched.value.length / 2)
const score = computed(() =>
  finished.value ? Math.max(100, 1400 - moves.value * 28 - seconds.value * 5) : pairs.value * 100
)
const status = computed(() => (finished.value ? '全部配对' : lock.value ? '正在核对' : '翻牌中'))

function shuffle(items) {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function startGame() {
  recordPlay(props.game.id)
  cards.value = shuffle(
    SYMBOLS.flatMap((symbol, pair) => [
      { id: `${pair}-a`, symbol, pair },
      { id: `${pair}-b`, symbol, pair }
    ])
  )
  opened.value = []
  matched.value = []
  moves.value = 0
  seconds.value = 0
  lock.value = false
  finished.value = false
  if (tickTimer) clearInterval(tickTimer)
  tickTimer = setInterval(() => {
    if (!finished.value) seconds.value += 1
  }, 1000)
}

function flip(card, index) {
  if (lock.value || finished.value || matched.value.includes(card.id) || opened.value.includes(index)) return
  opened.value.push(index)
  if (opened.value.length < 2) return

  moves.value += 1
  const first = cards.value[opened.value[0]]
  const second = cards.value[opened.value[1]]
  if (first.pair === second.pair) {
    matched.value = [...matched.value, first.id, second.id]
    opened.value = []
    if (matched.value.length === cards.value.length) finish()
    return
  }

  lock.value = true
  closeTimer = setTimeout(() => {
    opened.value = []
    lock.value = false
  }, 680)
}

function finish() {
  finished.value = true
  if (tickTimer) clearInterval(tickTimer)
  submitScore(props.game.id, score.value, { moves: moves.value, seconds: seconds.value })
}

onMounted(startGame)
onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="memory-wrap">
      <div class="memory-meta">
        <span>步数 <b>{{ moves }}</b></span>
        <span>用时 <b>{{ seconds }}s</b></span>
        <span>配对 <b>{{ pairs }} / {{ SYMBOLS.length }}</b></span>
      </div>

      <div class="memory-grid">
        <button
          v-for="(card, index) in cards"
          :key="card.id"
          type="button"
          class="memory-card"
          :class="{
            'is-open': opened.includes(index) || matched.includes(card.id),
            'is-matched': matched.includes(card.id)
          }"
          :aria-label="opened.includes(index) || matched.includes(card.id) ? card.symbol : '未翻开的卡片'"
          @click="flip(card, index)"
        >
          <span class="memory-card__inner">
            <span class="memory-card__back">✦</span>
            <span class="memory-card__front">{{ card.symbol }}</span>
          </span>
        </button>
      </div>

      <div v-if="finished" class="memory-result">
        <span>🎊</span>
        <div>
          <h2>全部配对成功！</h2>
          <p>用了 {{ moves }} 步、{{ seconds }} 秒，得分 {{ score }}。</p>
        </div>
        <button type="button" class="btn btn--primary" @click="startGame">再玩一次</button>
      </div>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="startGame">重新洗牌</button>
    </template>
  </GameShell>
</template>

<style scoped>
.memory-wrap {
  width: min(100%, 560px);
}

.memory-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 14px;
}

.memory-meta span {
  padding: 5px 10px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  font-size: 10px;
  font-weight: 800;
}

.memory-meta b {
  margin-left: 3px;
  color: var(--coral-dark);
}

.memory-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  perspective: 900px;
}

.memory-card {
  position: relative;
  aspect-ratio: 1;
  perspective: 800px;
}

.memory-card__inner {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.42s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.memory-card.is-open .memory-card__inner {
  transform: rotateY(180deg);
}

.memory-card__back,
.memory-card__front {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 2px solid var(--ink);
  border-radius: 15px;
  backface-visibility: hidden;
  box-shadow: 3px 3px 0 var(--ink);
}

.memory-card__back {
  background:
    linear-gradient(45deg, transparent 43%, rgba(255, 255, 255, 0.18) 43% 57%, transparent 57%),
    var(--mint);
  background-size: 15px 15px;
  color: #fff;
  font-size: 28px;
  font-weight: 1000;
}

.memory-card__front {
  transform: rotateY(180deg);
  background: #fff8db;
  font-size: clamp(28px, 5vw, 46px);
}

.memory-card.is-matched .memory-card__front {
  border-color: var(--mint-dark);
  background: #dff9f3;
  animation: matched-pulse 0.35s ease;
}

.memory-result {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 18px;
  padding: 14px;
  border: 2px solid var(--ink);
  border-radius: 15px;
  background: #fff6c7;
}

.memory-result > span {
  font-size: 34px;
}

.memory-result > div {
  flex: 1;
}

.memory-result h2 {
  font-size: 18px;
}

.memory-result p {
  color: var(--muted);
  font-size: 11px;
}

@keyframes matched-pulse {
  50% {
    transform: rotateY(180deg) scale(1.07);
  }
}

@media (max-width: 600px) {
  .memory-grid {
    gap: 7px;
  }

  .memory-result {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}

.action-btn {
  width: 100%;
}
</style>
