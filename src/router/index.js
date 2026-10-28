import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/channel/:type',
    name: 'channel',
    component: () => import('@/views/ChannelView.vue'),
    meta: { title: '频道' }
  },
  {
    path: '/rank',
    name: 'rank',
    component: () => import('@/views/RankView.vue'),
    meta: { title: '排行榜' }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { title: '搜索' }
  },
  {
    path: '/play/:id',
    name: 'play',
    component: () => import('@/views/PlayView.vue'),
    meta: { title: '正在播放', header: false, tabBar: false, fullBleed: true }
  },
  {
    path: '/vip',
    name: 'vip',
    component: () => import('@/views/VipView.vue'),
    meta: { title: '会员中心' }
  },
  {
    path: '/mine',
    name: 'mine',
    component: () => import('@/views/MineView.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: '观看历史', tabBar: false }
  },
  {
    path: '/favorite',
    name: 'favorite',
    component: () => import('@/views/FavoriteView.vue'),
    meta: { title: '我的收藏', tabBar: false }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置', tabBar: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return {}
    return { top: 0 }
  }
})

router.afterEach((to) => {
  const base = '云视听'
  document.title = to.meta?.title ? `${to.meta.title} - ${base}` : base
})

export default router
