<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const TABS = [
  { name: '首页', icon: 'home', route: { name: 'home' }, raw: 'home' },
  { name: '频道', icon: 'grid', route: { name: 'channel', params: { type: 'all' } }, raw: 'channel' },
  { name: 'VIP', icon: 'crown', route: { name: 'vip' }, raw: 'vip' },
  { name: '我的', icon: 'user', route: { name: 'mine' }, raw: 'mine' }
]

const current = computed(() => String(route.name || ''))

function active(tab) {
  if (tab.raw === 'channel') return current.value === 'channel' || current.value === 'rank'
  return current.value === tab.raw
}

function go(tab) {
  if (active(tab)) return
  router.push(tab.route)
}
</script>

<template>
  <nav class="tabbar" :class="{ 'tabbar--glass': true }">
    <button
      v-for="tab in TABS"
      :key="tab.name"
      type="button"
      class="tabbar__item"
      :class="{ 'is-active': active(tab) }"
      @click="go(tab)"
    >
      <span class="tabbar__icon">
        <AppIcon :name="tab.icon" :size="22" />
        <em v-if="tab.raw === 'vip' && !user.isVip" class="tabbar__dot" />
      </span>
      <span class="tabbar__text">{{ tab.name }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  display: flex;
  align-items: stretch;
  height: calc(var(--tabbar-h) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--line);
}

.tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-weak);
  transition: color 0.2s;
}

.tabbar__item.is-active {
  color: var(--brand);
}

.tabbar__icon {
  position: relative;
  display: flex;
}

.tabbar__dot {
  position: absolute;
  top: -2px;
  right: -6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand);
}

.tabbar__text {
  font-size: 11px;
  line-height: 1.2;
}

.tabbar__item:active {
  opacity: 0.7;
}
</style>
