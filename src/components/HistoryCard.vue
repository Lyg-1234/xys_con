<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PosterArt from './PosterArt.vue'
import { percent, fromNow } from '@/utils/format'

const props = defineProps({
  record: { type: Object, required: true },
  showDelete: { type: Boolean, default: false }
})

const emit = defineEmits(['remove'])

const router = useRouter()

const progress = computed(() => percent(props.record.time, props.record.duration))
const watchedText = computed(() => {
  const p = progress.value
  if (p >= 96) return '已看完'
  if (p < 1) return '刚开始看'
  return `看到 ${p.toFixed(0)}%`
})

function go() {
  router.push({
    name: 'play',
    params: { id: props.record.id },
    query: { epi: props.record.epiIndex + 1 }
  })
}
</script>

<template>
  <article class="hcard" @click="go">
    <div class="hcard__poster">
      <PosterArt :video="{ poster: record.poster, title: record.title, cover: record.cover || { from: '#334', to: '#778' } }" />
      <span class="hcard__play" />
      <span class="hcard__badge ellipsis">{{ record.epiTitle || '正片' }}</span>
      <button
        v-if="showDelete"
        type="button"
        class="hcard__del"
        aria-label="删除记录"
        @click.stop="emit('remove', record)"
      >
        ×
      </button>
    </div>

    <div class="hcard__body">
      <h4 class="hcard__title ellipsis">{{ record.title }}</h4>
      <p class="hcard__meta">
        <span>{{ watchedText }}</span>
        <span class="weak">· {{ fromNow(record.at) }}</span>
      </p>
      <div class="hcard__bar">
        <i :style="{ width: `${progress}%` }" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.hcard {
  cursor: pointer;
}

.hcard__poster {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  background: #eceef1;
}

.hcard__play {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
}

.hcard__badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  max-width: 70%;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 11px;
}

.hcard__del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hcard__body {
  padding: 6px 2px 0;
}

.hcard__title {
  font-size: 14px;
  font-weight: 600;
}

.hcard__meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--brand);
}

.hcard__bar {
  margin-top: 6px;
  height: 3px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.hcard__bar i {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--brand-grad);
}
</style>
