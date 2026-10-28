<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { GAMES } from '@/data/games'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'home', label: '首页', icon: '⌂' },
  { name: 'games', label: '全部游戏', icon: '▦' },
  { name: 'leaderboard', label: '排行榜', icon: '♛' },
  { name: 'about', label: '关于', icon: '?' }
]

const viewKey = computed(() => `${route.name}-${route.params.slug || ''}`)

function randomGame() {
  const game = GAMES[Math.floor(Math.random() * GAMES.length)]
  router.push({ name: 'game', params: { slug: game.id } })
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="container site-header__inner">
        <RouterLink to="/" class="brand">
          <span class="brand__mark">
            <i />
            <i />
            <i />
          </span>
          <span class="brand__text">闪玩<em>游戏盒</em></span>
        </RouterLink>

        <nav class="main-nav" aria-label="主导航">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="main-nav__link"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <button type="button" class="random-btn" @click="randomGame">
          <span>🎲</span>
          随机开玩
        </button>
      </div>
    </header>

    <main class="site-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="viewKey" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <div class="container site-footer__inner">
        <div>
          <strong>闪玩游戏盒</strong>
          <span>打开就玩，快乐不用下载。</span>
        </div>
        <p>纯前端小游戏 · 进度保存在本机 · 桌面与手机均可游玩</p>
      </div>
    </footer>

    <nav class="mobile-dock" aria-label="移动端导航">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="mobile-dock__item"
      >
        <span>{{ item.icon }}</span>
        <em>{{ item.label }}</em>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 2px solid var(--ink);
  background: rgba(255, 251, 240, 0.92);
  backdrop-filter: blur(14px);
}

.site-header__inner {
  display: flex;
  align-items: center;
  gap: 30px;
  height: 68px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.brand__mark {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 12px);
  grid-template-rows: repeat(2, 12px);
  gap: 3px;
  transform: rotate(-6deg);
}

.brand__mark i {
  display: block;
  border: 1.5px solid var(--ink);
  border-radius: 4px;
}

.brand__mark i:nth-child(1) {
  background: var(--coral);
}

.brand__mark i:nth-child(2) {
  background: var(--mint);
}

.brand__mark i:nth-child(3) {
  background: var(--sun);
}

.brand__text {
  font-size: 20px;
  font-weight: 1000;
  letter-spacing: -0.04em;
}

.brand__text em {
  color: var(--coral);
  font-style: normal;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.main-nav__link {
  padding: 8px 13px;
  border: 1.5px solid transparent;
  border-radius: 999px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
  transition: 0.18s ease;
}

.main-nav__link:hover {
  color: var(--ink);
}

.main-nav__link.router-link-active {
  border-color: var(--ink);
  background: var(--sun);
  color: var(--ink);
}

.random-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  margin-left: auto;
  padding: 0 15px;
  border: 2px solid var(--ink);
  border-radius: 13px;
  background: var(--paper);
  box-shadow: 3px 3px 0 var(--ink);
  font-size: 13px;
  font-weight: 900;
  transition: 0.15s ease;
}

.random-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--ink);
}

.site-main {
  flex: 1;
}

.site-footer {
  border-top: 2px solid var(--ink);
  background: var(--ink);
  color: #fff;
}

.site-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 24px;
  padding-bottom: 24px;
}

.site-footer strong,
.site-footer span {
  display: block;
}

.site-footer strong {
  font-size: 17px;
}

.site-footer span,
.site-footer p {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
}

.mobile-dock {
  display: none;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 720px) {
  .site-header__inner {
    height: 58px;
    gap: 12px;
  }

  .brand__text {
    font-size: 18px;
  }

  .main-nav {
    display: none;
  }

  .random-btn {
    height: 34px;
    padding: 0 11px;
  }

  .site-main {
    padding-bottom: 74px;
  }

  .site-footer {
    padding-bottom: 68px;
  }

  .site-footer__inner {
    display: block;
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .site-footer p {
    margin-top: 8px;
  }

  .mobile-dock {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    z-index: 60;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
    padding: 5px;
    border: 2px solid var(--ink);
    border-radius: 18px;
    background: rgba(255, 251, 240, 0.96);
    box-shadow: 4px 5px 0 var(--ink);
    backdrop-filter: blur(12px);
  }

  .mobile-dock__item {
    display: grid;
    place-items: center;
    gap: 1px;
    padding: 5px;
    border-radius: 12px;
    color: var(--muted);
  }

  .mobile-dock__item span {
    font-size: 17px;
    line-height: 1;
  }

  .mobile-dock__item em {
    font-size: 9px;
    font-style: normal;
    font-weight: 800;
  }

  .mobile-dock__item.router-link-active {
    background: var(--sun);
    color: var(--ink);
  }
}
</style>
