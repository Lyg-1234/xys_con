<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PosterArt from './PosterArt.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  interval: { type: Number, default: 5000 }
})

const router = useRouter()
const index = ref(0)
const hovering = ref(false)
let timer = null
let startX = 0
let moved = false

const count = () => props.items.length

function stop() {
  if (timer) clearInterval(timer)
  timer = null
}

function start() {
  stop()
  if (count() > 1) {
    timer = setInterval(() => {
      if (!hovering.value) next()
    }, props.interval)
  }
}

function next() {
  if (!count()) return
  index.value = (index.value + 1) % count()
}

function prev() {
  if (!count()) return
  index.value = (index.value - 1 + count()) % count()
}

function go(i) {
  if (i === index.value) return
  index.value = i
}

function onTouchStart(e) {
  startX = e.touches[0].clientX
  moved = false
  stop()
}

function onTouchMove(e) {
  moved = Math.abs(e.touches[0].clientX - startX) > 40
}

function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - startX
  if (Math.abs(dx) > 40) {
    if (dx < 0) next()
    else prev()
  }
  void moved
  start()
}

function open(item) {
  if (item?.video?.id) router.push({ name: 'play', params: { id: item.video.id } })
}

onMounted(start)
onBeforeUnmount(stop)
watch(() => props.items.length, () => {
  if (index.value >= count()) index.value = 0
  start()
})
</script>

<template>
  <section
    v-if="count()"
    class="banner"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend.passive="onTouchEnd"
  >
    <div class="banner__track" :style="{ transform: `translateX(-${index * 100}%)` }">
      <div v-for="item in items" :key="item.id" class="banner__slide">
        <PosterArt :video="item.video" wide ratio="16 / 9" />
        <button class="banner__cover" type="button" aria-label="播放" @click="open(item)" />
        <div class="banner__info">
          <span class="banner__chip">{{ item.typeName }}</span>
          <h2 class="banner__title ellipsis">{{ item.title }}</h2>
          <p class="banner__sub ellipsis">{{ item.subtitle }}</p>
          <span class="banner__score">{{ item.score.toFixed(1) }} 分</span>
        </div>
      </div>
    </div>

    <button class="banner__arrow banner__arrow--prev" type="button" aria-label="上一张" @click="prev">
      <AppIcon name="chevron-left" :size="20" />
    </button>
    <button class="banner__arrow banner__arrow--next" type="button" aria-label="下一张" @click="next">
      <AppIcon name="chevron-right" :size="20" />
    </button>

    <div class="banner__dots">
      <button
        v-for="(item, i) in items"
        :key="`dot-${item.id}`"
        type="button"
        class="banner__dot"
        :class="{ 'is-active': i === index }"
        :aria-label="`第 ${i + 1} 张`"
        @click="go(i)"
      />
    </div>
  </section>
</template>

<style scoped>
.banner {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: #eceef1;
  box-shadow: var(--shadow-sm);
}

.banner__track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.banner__slide {
  position: relative;
  width: 100%;
  flex: none;
}

.banner__cover {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.15) 45%, rgba(0, 0, 0, 0) 70%);
}

.banner__info {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 2;
  padding: 16px 18px;
  color: #fff;
  text-align: left;
  pointer-events: none;
  max-width: 82%;
}

.banner__chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--brand-grad);
  font-size: 11px;
  font-weight: 600;
}

.banner__title {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.banner__sub {
  margin-top: 4px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.82);
  display: none;
}

.banner__score {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
  color: #ffce54;
  font-weight: 700;
}

.banner__arrow {
  position: absolute;
  top: 50%;
  z-index: 4;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  backdrop-filter: blur(4px);
  transition: background 0.2s;
}

.banner__arrow:hover {
  background: rgba(0, 0, 0, 0.62);
}

.banner__arrow--prev {
  left: 12px;
}

.banner__arrow--next {
  right: 12px;
}

.banner__dots {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 4;
  display: flex;
  gap: 6px;
}

.banner__dot {
  width: 7px;
  height: 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.25s;
}

.banner__dot.is-active {
  width: 18px;
  background: #fff;
}

@media (min-width: 768px) {
  .banner__sub {
    display: block;
  }

  .banner__info {
    padding: 26px 30px;
  }

  .banner__title {
    font-size: 32px;
  }

  .banner__arrow {
    display: flex;
  }
}

@media (min-width: 1200px) {
  .banner__title {
    font-size: 38px;
  }
}
</style>
