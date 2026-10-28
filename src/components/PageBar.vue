<script setup>
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'

defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' }
})

const router = useRouter()

function back() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <div class="pagebar">
    <button type="button" class="pagebar__back" aria-label="返回" @click="back">
      <AppIcon name="chevron-left" :size="22" />
    </button>
    <div class="pagebar__title">
      <h1 class="ellipsis">{{ title }}</h1>
      <p v-if="subtitle" class="ellipsis weak">{{ subtitle }}</p>
    </div>
    <div class="pagebar__right">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.pagebar {
  position: sticky;
  top: 0;
  z-index: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  margin: -14px -12px 12px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}

.pagebar__back {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex: none;
}

.pagebar__title {
  flex: 1;
  min-width: 0;
}

.pagebar__title h1 {
  font-size: 16px;
  font-weight: 700;
}

.pagebar__title p {
  font-size: 11.5px;
  margin-top: 1px;
}

.pagebar__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

@media (min-width: 768px) {
  .pagebar {
    margin: -14px -20px 18px;
    height: 56px;
  }

  .pagebar__title h1 {
    font-size: 18px;
  }
}

@media (min-width: 1200px) {
  .pagebar {
    margin: -14px -32px 18px;
  }
}
</style>
