<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { DANMAKU_POOL } from '@/data/extra'

const props = defineProps({
  playing: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
  opacity: { type: Number, default: 0.85 },
  size: { type: String, default: 'md' },
  area: { type: String, default: 'half' }
})

const items = ref([])
let seq = 0
let timer = null
let rowCursor = 0

const ROW_COUNT = computed(() => {
  if (props.area === 'full') return 9
  if (props.area === 'quarter') return 3
  return 6
})

const FONT_SIZE = computed(() => ({ sm: 12, md: 15, lg: 18 }[props.size] || 15))

function nextRow() {
  rowCursor = (rowCursor + 1) % ROW_COUNT.value
  return rowCursor
}

function rowTop(row) {
  const total = ROW_COUNT.value
  if (props.area === 'half') return (row * 50) / total
  if (props.area === 'quarter') return (row * 34) / total
  return (row * 92) / total
}

function randomDuration() {
  return 6 + Math.random() * 4
}

function spawn(text, mine = false) {
  const content = String(text || '').trim()
  if (!content) return
  if (items.value.length > 45) items.value.shift()
  const row = nextRow()
  seq += 1
  items.value.push({
    id: seq,
    text: content.slice(0, 60),
    mine,
    top: rowTop(row),
    duration: randomDuration()
  })
}

function onEnd(item) {
  const index = items.value.findIndex((i) => i.id === item.id)
  if (index > -1) items.value.splice(index, 1)
}

function stopLoop() {
  if (timer) clearInterval(timer)
  timer = null
}

function startLoop() {
  stopLoop()
  if (props.playing && props.enabled) {
    timer = setInterval(() => {
      spawn(DANMAKU_POOL[Math.floor(Math.random() * DANMAKU_POOL.length)])
    }, 850)
  }
}

watch(
  () => [props.playing, props.enabled],
  () => startLoop(),
  { immediate: true }
)

watch(
  () => props.enabled,
  (v) => {
    if (!v) items.value = []
  }
)

onBeforeUnmount(stopLoop)

defineExpose({ spawn })
</script>

<template>
  <div class="dmk" :style="{ opacity }">
    <TransitionGroup name="dmk">
      <span
        v-for="item in items"
        :key="item.id"
        class="dmk__item"
        :class="{ 'is-mine': item.mine }"
        :style="{
          top: `${item.top}%`,
          fontSize: `${FONT_SIZE}px`,
          animationDuration: `${item.duration}s`
        }"
        @animationend="onEnd(item)"
      >
        {{ item.text }}
      </span>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.dmk {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 5;
  transition: opacity 0.25s;
}

.dmk__item {
  position: absolute;
  left: 100%;
  white-space: nowrap;
  color: #fff;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  animation-name: dmk-fly;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  will-change: transform;
}

.dmk__item.is-mine {
  color: #ffd24d;
  border: 1px solid rgba(255, 210, 77, 0.9);
  border-radius: 4px;
  padding: 0 4px;
}

@keyframes dmk-fly {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100vw - 100%));
  }
}

.dmk-enter-active {
  transition: none;
}
</style>
