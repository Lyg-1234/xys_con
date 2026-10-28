<script setup>
import { useRouter } from 'vue-router'
import PosterArt from './PosterArt.vue'

const props = defineProps({
  video: { type: Object, required: true },
  index: { type: Number, required: true },
  active: { type: Boolean, default: false },
  trend: { type: String, default: '' }
})

const router = useRouter()

function go() {
  router.push({ name: 'play', params: { id: props.video.id } })
}
</script>

<template>
  <div class="rank-item" :class="{ 'is-active': active }" @click="go">
    <span class="rank-item__no" :class="`rank-item__no--${index < 3 ? index + 1 : 'normal'}`">
      {{ index + 1 }}
    </span>
    <div class="rank-item__poster">
      <PosterArt :video="video" ratio="3 / 4" />
    </div>
    <div class="rank-item__body">
      <h4 class="rank-item__title ellipsis">{{ video.title }}</h4>
      <p class="rank-item__meta ellipsis">{{ video.updateText }}</p>
      <p class="rank-item__score">
        <b>{{ video.score.toFixed(1) }}</b>
        <span>分</span>
        <em v-if="trend">{{ trend }}</em>
      </p>
    </div>
  </div>
</template>

<style scoped>
.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.rank-item:hover,
.rank-item.is-active {
  background: var(--brand-soft);
}

.rank-item__no {
  width: 20px;
  flex: none;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  font-style: italic;
  color: var(--text-weak);
}

.rank-item__no--1 {
  color: #ff4b4b;
}

.rank-item__no--2 {
  color: #ff8a3d;
}

.rank-item__no--3 {
  color: #ffb400;
}

.rank-item__poster {
  width: 44px;
  flex: none;
  border-radius: 6px;
  overflow: hidden;
}

.rank-item__body {
  min-width: 0;
  flex: 1;
}

.rank-item__title {
  font-size: 14px;
  font-weight: 600;
}

.rank-item__meta {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 1px;
}

.rank-item__score {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  gap: 2px;
}

.rank-item__score b {
  color: #ff8a3d;
  font-size: 13px;
}

.rank-item__score em {
  font-style: normal;
  margin-left: 6px;
  font-size: 11px;
  color: #e05252;
}
</style>
