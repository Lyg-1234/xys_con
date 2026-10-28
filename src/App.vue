<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import MobileTabBar from '@/components/MobileTabBar.vue'
import AppToast from '@/components/AppToast.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const user = useUserStore()
const { isMobile } = useMediaQuery()

const showHeader = computed(() => route.meta?.header !== false)
const showTabBar = computed(() => isMobile.value && route.meta?.tabBar !== false)

let timer = null
user.$subscribe((_mutation, state) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => user.persist(state), 200)
})

const viewKey = computed(() => (route.name === 'play' ? `play-${route.params.id}` : route.fullPath))
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="showHeader" />

    <main
      class="app-main"
      :class="{ 'app-main--tabbar': showTabBar, 'app-main--bleed': route.meta?.fullBleed }"
    >
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="viewKey" />
        </Transition>
      </RouterView>
    </main>

    <footer class="app-footer">
      <div class="container app-footer__inner">
        <p>云视听 · 在线视频</p>
        <p class="weak">
          本页面为技术演示项目，视频内容来自互联网公开测试片源，仅用于播放器功能验证。
        </p>
      </div>
    </footer>

    <MobileTabBar v-if="showTabBar" />
    <AppToast />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding-top: 14px;
}

.app-main--tabbar {
  padding-bottom: calc(var(--tabbar-h) + var(--safe-bottom) + 10px);
}

.app-main--bleed {
  padding-top: 0;
}

.app-footer {
  margin-top: 20px;
  padding: 22px 0 26px;
  border-top: 1px solid var(--line);
  background: var(--surface);
}

.app-footer__inner {
  text-align: center;
  font-size: 12.5px;
  color: var(--text-sub);
  line-height: 1.8;
}

.app-main--tabbar + .app-footer {
  padding-bottom: calc(30px + var(--safe-bottom));
}

@media (max-width: 767px) {
  .app-footer {
    padding: 16px 0 calc(70px + var(--safe-bottom));
  }
}
</style>
