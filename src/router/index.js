import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/GamesHomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/games',
    name: 'games',
    component: () => import('@/views/AllGamesView.vue'),
    meta: { title: '全部游戏' }
  },
  {
    path: '/game/:slug',
    name: 'game',
    component: () => import('@/views/GameRouteView.vue'),
    meta: { title: '小游戏' }
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('@/views/LeaderboardView.vue'),
    meta: { title: '排行榜' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return {}
    return { top: 0, behavior: 'smooth' }
  }
})

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} · 闪玩游戏盒` : '闪玩游戏盒'
})

export default router
