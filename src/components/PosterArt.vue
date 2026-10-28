<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  video: { type: Object, required: true },
  wide: { type: Boolean, default: false },
  ratio: { type: String, default: '3 / 4' }
})

const failed = ref(false)
const loaded = ref(false)
const source = computed(() => (props.wide ? props.video.posterLarge : props.video.poster) || '')

watch(
  source,
  () => {
    failed.value = false
    loaded.value = false
  }
)

function onError() {
  failed.value = true
}
</script>

<template>
  <div class="poster" :style="{ aspectRatio: ratio }">
    <img
      v-if="!failed && source"
      class="poster__img"
      :class="{ 'is-loaded': loaded }"
      :src="source"
      :alt="video.title"
      loading="lazy"
      decoding="async"
      referrerpolicy="no-referrer"
      @load="loaded = true"
      @error="onError"
    />
    <div
      v-if="failed || !source"
      class="poster__fallback"
      :style="{ backgroundImage: `linear-gradient(135deg, ${video.cover.from}, ${video.cover.to})` }"
    >
      <span class="poster__emoji">{{ video.cover.emoji }}</span>
      <span class="poster__label ellipsis-2">{{ video.title }}</span>
    </div>
    <div v-if="source && !loaded && !failed" class="skeleton poster__skeleton" />
  </div>
</template>

<style scoped>
.poster {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eceef1;
  border-radius: inherit;
}

.poster__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.poster__img.is-loaded {
  opacity: 1;
}

.poster__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  color: #fff;
  text-align: center;
}

.poster__fallback::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.28), transparent 55%);
}

.poster__emoji {
  font-size: 34px;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

.poster__label {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.poster__skeleton {
  position: absolute;
  inset: 0;
}
</style>
