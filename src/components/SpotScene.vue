<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: Number, default: 0 },
  found: { type: Array, default: () => [] },
  wrongPoint: { type: Object, default: null },
  theme: { type: Object, required: true },
  side: { type: String, default: 'left' }
})

const emit = defineEmits(['pick'])
const alternates = props.variant === 1

const sunX = computed(() => (alternates ? 82 : 62))
const flowers = computed(() => (alternates ? [90, 108, 126, 144] : [90, 108, 126]))
const smokeVisible = computed(() => !alternates)
const windowLit = computed(() => !alternates)
const balloonColor = computed(() => (alternates ? '#54a7ff' : '#ff6554'))

const hotspots = [
  { id: 'sun', label: '太阳', x: 72, y: 44, r: 38 },
  { id: 'smoke', label: '烟囱', x: 282, y: 72, r: 36 },
  { id: 'window', label: '窗户', x: 266, y: 145, r: 36 },
  { id: 'flowers', label: '花朵', x: 118, y: 236, r: 38 },
  { id: 'balloon', label: '气球', x: 357, y: 117, r: 37 }
]

function handleClick(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 420
  const y = ((event.clientY - rect.top) / rect.height) * 300
  emit('pick', { x, y, side: props.side })
}
</script>

<template>
  <svg
    class="spot-scene"
    viewBox="0 0 420 300"
    role="img"
    aria-label="找不同场景"
    @click="handleClick"
  >
    <defs>
      <linearGradient id="sky-left" :x1="0" :y1="0" :x2="0" :y2="1">
        <stop offset="0" :stop-color="theme.sky1" />
        <stop offset="1" :stop-color="theme.sky2" />
      </linearGradient>
      <linearGradient id="hill-left" :x1="0" :y1="0" :x2="1" :y2="1">
        <stop offset="0" :stop-color="theme.hill1" />
        <stop offset="1" :stop-color="theme.hill2" />
      </linearGradient>
    </defs>

    <rect width="420" height="300" rx="18" fill="url(#sky-left)" />

    <g :transform="`translate(${sunX - 72} 0)`">
      <circle cx="72" cy="44" r="25" :fill="alternates ? '#ff9f43' : '#ffd43b'" stroke="#18232f" stroke-width="2" />
      <path
        d="M72 7v-6M72 87v-6M35 44h-6M115 44h-6M46 18l-4-4M98 70l4 4M98 18l4-4M46 70l-4 4"
        stroke="#18232f"
        stroke-width="2"
        stroke-linecap="round"
      />
    </g>

    <g fill="#fff" stroke="#18232f" stroke-width="2">
      <ellipse cx="172" cy="57" rx="34" ry="16" />
      <circle cx="154" cy="49" r="15" />
      <circle cx="181" cy="45" r="20" />
    </g>

    <path d="M0 205 Q70 142 155 202 T320 190 T420 205 V300 H0Z" :fill="theme.far" stroke="#18232f" stroke-width="2" />
    <path d="M0 231 Q80 180 190 226 T420 218 V300 H0Z" fill="url(#hill-left)" stroke="#18232f" stroke-width="2" />
    <path d="M0 266 Q92 220 210 263 T420 252 V300 H0Z" :fill="theme.ground" stroke="#18232f" stroke-width="2" />

    <g>
      <path d="M208 182 L272 148 L337 183 V258 H208Z" fill="#fff3cf" stroke="#18232f" stroke-width="2.5" />
      <path d="M198 185 L272 140 L347 185Z" :fill="theme.roof" stroke="#18232f" stroke-width="2.5" />
      <rect x="254" y="210" width="36" height="48" rx="3" fill="#9b6740" stroke="#18232f" stroke-width="2" />
      <rect
        x="293"
        y="194"
        width="25"
        height="26"
        rx="3"
        :fill="windowLit ? '#ffd43b' : '#5d7082'"
        stroke="#18232f"
        stroke-width="2"
      />
      <path d="M305.5 194v26M293 207h25" stroke="#18232f" stroke-width="1.4" />
      <path d="M269 180v-36h23v19" fill="#b87852" stroke="#18232f" stroke-width="2.5" />
      <g v-if="smokeVisible" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round">
        <path d="M279 136c-15-13 14-18 1-31s10-17 1-29" />
      </g>
    </g>

    <g>
      <path d="M169 260c-5-54 1-91 5-124" fill="none" stroke="#704b2e" stroke-width="13" stroke-linecap="round" />
      <path d="M112 259c1-41-4-50-8-82" fill="none" stroke="#704b2e" stroke-width="8" stroke-linecap="round" />
      <circle cx="168" cy="128" r="45" fill="theme.tree" stroke="#18232f" stroke-width="2" />
      <circle cx="135" cy="146" r="32" fill="theme.tree2" stroke="#18232f" stroke-width="2" />
      <circle cx="194" cy="154" r="34" fill="theme.tree2" stroke="#18232f" stroke-width="2" />
      <circle cx="98" cy="173" r="23" fill="theme.tree" stroke="#18232f" stroke-width="2" />
    </g>

    <g>
      <path d="M357 93 L340 128 L374 128Z" :fill="balloonColor" stroke="#18232f" stroke-width="2" />
      <path d="M357 128c-11 18 11 27 0 44s8 22 0 39" fill="none" stroke="#18232f" stroke-width="1.5" />
    </g>

    <g v-for="(x, index) in flowers" :key="x">
      <path :d="`M${x} 250v-16`" stroke="#35854b" stroke-width="2" />
      <circle :cx="x" cy="229" r="6" :fill="index % 2 ? '#ff8aa5' : '#fff'" stroke="#18232f" stroke-width="1.6" />
      <circle :cx="x" :cy="229" r="2" fill="#ffd43b" />
    </g>

    <g fill="none" stroke="#18232f" stroke-width="2" stroke-linecap="round">
      <path d="M32 117q8-8 16 0q8-8 16 0" />
      <path d="M378 57q8-8 16 0q8-8 16 0" />
    </g>

    <g v-for="spot in hotspots" :key="spot.id">
      <circle
        v-if="found.includes(spot.id)"
        :cx="spot.x"
        :cy="spot.y"
        :r="spot.r"
        class="spot-ring"
      />
    </g>

    <circle
      v-if="wrongPoint"
      :cx="wrongPoint.x"
      :cy="wrongPoint.y"
      r="18"
      class="spot-wrong"
    />
  </svg>
</template>

<style scoped>
.spot-scene {
  display: block;
  width: 100%;
  height: auto;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #fff;
  cursor: crosshair;
  touch-action: manipulation;
  user-select: none;
}

.spot-ring {
  fill: rgba(32, 191, 169, 0.17);
  stroke: #0c9585;
  stroke-width: 4;
  stroke-dasharray: 8 5;
  pointer-events: none;
  animation: ring-pop 0.3s ease;
}

.spot-wrong {
  fill: rgba(255, 101, 84, 0.12);
  stroke: #ff6554;
  stroke-width: 3;
  pointer-events: none;
  animation: wrong-pop 0.38s ease;
}

@keyframes ring-pop {
  from {
    opacity: 0;
    transform: scale(1.5);
    transform-origin: center;
  }
}

@keyframes wrong-pop {
  0% {
    r: 4;
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
