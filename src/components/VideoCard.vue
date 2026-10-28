<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PosterArt from './PosterArt.vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  video: { type: Object, required: true },
  wide: { type: Boolean, default: false },
  showMeta: { type: Boolean, default: true }
})

const router = useRouter()

const sub = computed(() => {
  const v = props.video
  const actors = v.cast.map((c) => c.name).slice(0, 2).join(' / ')
  return `${v.year} · ${v.genres.slice(0, 2).join('/')}${actors ? ' · ' + actors : ''}`
})

function go() {
  router.push({ name: 'play', params: { id: props.video.id } })
}
</script>

<template>
  <article class="vcard" @click="go">
    <div class="vcard__poster">
      <PosterArt :video="video" :wide="wide" :ratio="wide ? '16 / 9' : '3 / 4'" />

      <div class="vcard__tags">
        <span v-if="video.pay" class="badge badge--pay">付费</span>
        <span v-else-if="video.vip" class="badge badge--vip">会员</span>
        <span v-if="video.badge" class="badge badge--flat">{{ video.badge }}</span>
      </div>

      <div class="vcard__bottom">
        <span class="vcard__update ellipsis">{{ video.updateText }}</span>
        <span v-if="video.score" class="vcard__score">{{ video.score.toFixed(1) }}</span>
      </div>

      <div class="vcard__hover">
        <span class="vcard__play"><AppIcon name="play" :size="20" /></span>
        <p class="vcard__desc ellipsis-3">{{ video.desc }}</p>
        <span class="vcard__hover-meta">{{ video.typeName }} · {{ video.score.toFixed(1) }} 分</span>
      </div>
    </div>

    <div v-if="showMeta" class="vcard__info">
      <h3 class="vcard__title ellipsis">{{ video.title }}</h3>
      <p class="vcard__sub ellipsis">{{ sub }}</p>
    </div>
  </article>
</template>

<style scoped>
.vcard {
  cursor: pointer;
  user-select: none;
}

.vcard__poster {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  background: #eceef1;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.vcard__tags {
  position: absolute;
  top: 6px;
  left: 6px;
  display: flex;
  gap: 4px;
  z-index: 2;
}

.vcard__bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 18px 8px 6px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0));
  color: #fff;
  font-size: 11px;
}

.vcard__update {
  max-width: 68%;
}

.vcard__score {
  color: #ffce54;
  font-weight: 700;
  font-size: 12px;
  flex: none;
}

.vcard__info {
  padding: 8px 2px 0;
}

.vcard__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}

.vcard__sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-weak);
}

.vcard__hover {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 14px;
  text-align: center;
  background: linear-gradient(to top, rgba(10, 12, 18, 0.88), rgba(10, 12, 18, 0.45));
  color: #fff;
}

.vcard__play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--brand-grad);
  color: #fff;
  box-shadow: 0 6px 16px rgba(255, 74, 50, 0.4);
}

.vcard__desc {
  font-size: 12px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.86);
}

.vcard__hover-meta {
  font-size: 11px;
  color: #ffce54;
}

@media (hover: hover) and (min-width: 768px) {
  .vcard:hover .vcard__poster {
    transform: translateY(-4px);
    box-shadow: var(--shadow);
  }

  .vcard:hover .vcard__hover {
    display: flex;
  }

  .vcard:hover .vcard__bottom {
    display: none;
  }
}

.vcard:active .vcard__poster {
  transform: scale(0.985);
}
</style>
