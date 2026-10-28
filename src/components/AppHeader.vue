<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useUserStore } from '@/stores/user'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { HOT_SEARCH, suggest } from '@/data/extra'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const { isMobile } = useMediaQuery()

const NAVS = [
  { label: '首页', to: { name: 'home' }, match: ['home'] },
  { label: '电视剧', to: { name: 'channel', params: { type: 'tv' } }, match: ['channel'], type: 'tv' },
  { label: '电影', to: { name: 'channel', params: { type: 'movie' } }, match: ['channel'], type: 'movie' },
  { label: '综艺', to: { name: 'channel', params: { type: 'variety' } }, match: ['channel'], type: 'variety' },
  { label: '动漫', to: { name: 'channel', params: { type: 'anime' } }, match: ['channel'], type: 'anime' },
  {
    label: '纪录片',
    to: { name: 'channel', params: { type: 'doc' } },
    match: ['channel'],
    type: 'doc'
  },
  { label: '少儿', to: { name: 'channel', params: { type: 'kids' } }, match: ['channel'], type: 'kids' },
  { label: '排行榜', to: { name: 'rank' }, match: ['rank'] }
]

const MOBILE_NAVS = NAVS.filter((n) => n.label !== '排行榜')

const keyword = ref('')
const focused = ref(false)
const menuOpen = ref(false)
const inputRef = ref(null)
const rootRef = ref(null)

const suggestions = computed(() => suggest(keyword.value, 10))
const showPanel = computed(() => focused.value && !isMobile.value)

watch(
  () => route.query.q,
  (q) => {
    keyword.value = typeof q === 'string' ? q : ''
  },
  { immediate: true }
)

function submit(value) {
  const kw = String(typeof value === 'string' ? value : keyword.value).trim()
  focused.value = false
  if (!kw) {
    toast('请输入搜索内容')
    return
  }
  user.pushSearch(kw)
  router.push({ name: 'search', query: { q: kw } })
}

function navActive(nav) {
  if (nav.label === '首页') return route.name === 'home'
  if (nav.type) return route.name === 'channel' && route.params.type === nav.type
  if (nav.label === '排行榜') return route.name === 'rank'
  return false
}

function closeAll() {
  focused.value = false
  menuOpen.value = false
}

function onDocClick(e) {
  if (!rootRef.value) return
  if (!rootRef.value.contains(e.target)) closeAll()
}

onMounted(() => {
  document.addEventListener('click', onDocClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, true)
})

function openMenu(path) {
  menuOpen.value = false
  router.push(path)
}

function toggleLogin() {
  menuOpen.value = false
  if (user.isLogin) {
    user.logout()
    toast('已退出登录')
  } else {
    user.login()
    toast('登录成功', { type: 'success' })
  }
}
</script>

<template>
  <header ref="rootRef" class="hdr">
    <!-- ============ 移动端 ============ -->
    <template v-if="isMobile">
      <div class="hdr__mi container">
        <RouterLink to="/" class="hdr__logo">
          <span class="hdr__logo-mark">YS</span>
          <span class="hdr__logo-text">云视听</span>
        </RouterLink>

        <RouterLink to="/search" class="hdr__msearch">
          <AppIcon name="search" :size="16" />
          <span class="ellipsis">{{ HOT_SEARCH[0] }}</span>
        </RouterLink>

        <RouterLink to="/mine" class="hdr__mavatar">
          <span v-if="user.isVip" class="hdr__vip-mini">VIP</span>
          <AppIcon name="user" :size="22" />
        </RouterLink>
      </div>

      <nav class="hdr__mtabs hide-scrollbar">
        <div class="container hdr__mtabs-inner">
          <RouterLink
            v-for="nav in MOBILE_NAVS"
            :key="nav.label"
            :to="nav.to"
            class="hdr__mtab"
            :class="{ 'is-active': navActive(nav) }"
          >
            {{ nav.label }}
          </RouterLink>
        </div>
      </nav>
    </template>

    <!-- ============ PC 端 ============ -->
    <div v-else class="hdr__inner container">
      <RouterLink to="/" class="hdr__logo">
        <span class="hdr__logo-mark">YS</span>
        <span class="hdr__logo-text">云视听</span>
      </RouterLink>

      <nav class="hdr__nav">
        <RouterLink
          v-for="nav in NAVS"
          :key="nav.label"
          :to="nav.to"
          class="hdr__navitem"
          :class="{ 'is-active': navActive(nav) }"
        >
          {{ nav.label }}
        </RouterLink>
      </nav>

      <div class="hdr__search" :class="{ 'is-focus': showPanel }">
        <input
          ref="inputRef"
          v-model="keyword"
          class="hdr__input"
          type="search"
          placeholder="搜索影片、演员"
          @focus="focused = true"
          @keydown.enter.prevent="submit()"
        />
        <button class="hdr__searchbtn" type="button" aria-label="搜索" @click="submit()">
          <AppIcon name="search" :size="18" />
        </button>

        <div v-if="showPanel" class="hdr__panel">
          <template v-if="keyword.trim()">
            <p class="hdr__panel-title">搜索建议</p>
            <ul>
              <li v-for="s in suggestions" :key="s" @click="submit(s)">
                <AppIcon name="search" :size="14" />
                <span class="ellipsis">{{ s }}</span>
              </li>
              <li v-if="!suggestions.length" class="hdr__panel-empty">没有找到相关结果</li>
            </ul>
          </template>
          <template v-else>
            <template v-if="user.searchHistory.length">
              <p class="hdr__panel-title">
                搜索历史
                <button type="button" @click.stop="user.clearSearch()">清空</button>
              </p>
              <ul>
                <li v-for="h in user.searchHistory" :key="h">
                  <AppIcon name="history" :size="14" />
                  <span class="ellipsis hdr__panel-text">{{ h }}</span>
                  <button
                    type="button"
                    class="hdr__panel-del"
                    aria-label="删除"
                    @click.stop="user.removeSearch(h)"
                  >
                    <AppIcon name="close" :size="12" />
                  </button>
                </li>
              </ul>
            </template>
            <p class="hdr__panel-title">大家都在搜</p>
            <div class="hdr__hot">
              <button
                v-for="h in HOT_SEARCH"
                :key="h"
                type="button"
                class="chip"
                @click.stop="submit(h)"
              >
                {{ h }}
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="hdr__actions">
        <RouterLink to="/vip" class="hdr__vip">
          <AppIcon name="crown" :size="16" />
          <span>{{ user.isVip ? '会员中心' : '开通会员' }}</span>
        </RouterLink>

        <RouterLink to="/history" class="hdr__icon" title="观看历史">
          <AppIcon name="history" :size="20" />
        </RouterLink>

        <div class="hdr__user">
          <button type="button" class="hdr__avatar" @click="menuOpen = !menuOpen">
            <span class="hdr__avatar-emoji">{{ user.profile.emoji }}</span>
            <span v-if="user.isVip" class="hdr__avatar-vip">VIP</span>
          </button>

          <div v-if="menuOpen" class="hdr__menu">
            <div class="hdr__menu-head">
              <span class="hdr__avatar-emoji hdr__avatar-emoji--lg">{{ user.profile.emoji }}</span>
              <div>
                <p class="hdr__menu-name ellipsis">{{ user.isLogin ? user.profile.name : '未登录' }}</p>
                <p class="hdr__menu-sub">
                  {{ user.isVip ? `会员至 ${user.vipExpireText}` : '开通会员享专属内容' }}
                </p>
              </div>
            </div>
            <button type="button" class="hdr__menu-item" @click="openMenu('/favorite')">
              <AppIcon name="heart" :size="16" />
              <span>我的收藏</span>
              <em>{{ user.favoriteCount }}</em>
            </button>
            <button type="button" class="hdr__menu-item" @click="openMenu('/history')">
              <AppIcon name="history" :size="16" />
              <span>观看历史</span>
              <em>{{ user.historyCount }}</em>
            </button>
            <button type="button" class="hdr__menu-item" @click="openMenu('/vip')">
              <AppIcon name="crown" :size="16" />
              <span>会员中心</span>
            </button>
            <button type="button" class="hdr__menu-item" @click="openMenu('/settings')">
              <AppIcon name="settings" :size="16" />
              <span>设置</span>
            </button>
            <button type="button" class="hdr__menu-item hdr__menu-item--split" @click="toggleLogin">
              <AppIcon name="user" :size="16" />
              <span>{{ user.isLogin ? '退出登录' : '点击登录' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 800;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--line);
}

/* ---------- logo ---------- */
.hdr__logo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

.hdr__logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--brand-grad);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.5px;
  box-shadow: 0 4px 10px rgba(255, 90, 43, 0.3);
}

.hdr__logo-text {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 1px;
}

/* ---------- PC ---------- */
.hdr__inner {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 18px;
}

.hdr__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
  max-width: 100%;
}

/* 中屏宽度：Logo 文字收起，导航可横向滚动，避免整行被撑破 */
@media (max-width: 1199px) {
  .hdr__logo-text {
    display: none;
  }
}

@media (max-width: 1023px) {
  .hdr__inner {
    gap: 12px;
  }

  .hdr__nav {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .hdr__nav::-webkit-scrollbar {
    display: none;
  }

  .hdr__navitem {
    padding: 6px 9px;
    font-size: 14px;
    white-space: nowrap;
  }

  .hdr__search {
    flex: 0 1 190px;
    min-width: 120px;
  }

  .hdr__vip span {
    display: none;
  }

  .hdr__vip {
    width: 32px;
    padding: 0;
    justify-content: center;
  }
}

.hdr__navitem {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 15px;
  color: var(--text);
  transition: all 0.2s;
  white-space: nowrap;
}

.hdr__navitem:hover {
  background: var(--surface-2);
  color: var(--brand);
}

.hdr__navitem.is-active {
  color: var(--brand);
  font-weight: 600;
}

.hdr__search {
  position: relative;
  flex: 1;
  max-width: 380px;
  min-width: 160px;
  height: 36px;
  display: flex;
  align-items: center;
  border-radius: 18px;
  background: var(--surface-2);
  border: 1px solid var(--line-strong);
  transition: all 0.2s;
}

.hdr__search.is-focus {
  background: #fff;
  border-color: var(--brand);
  box-shadow: 0 4px 14px rgba(255, 90, 43, 0.14);
}

.hdr__input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 8px 0 16px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13.5px;
}

.hdr__input::-webkit-search-cancel-button {
  display: none;
}

.hdr__searchbtn {
  width: 44px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  border-radius: 0 18px 18px 0;
}

.hdr__searchbtn:hover {
  color: var(--brand);
}

.hdr__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  padding: 12px 0 10px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  z-index: 60;
  max-height: 68vh;
  overflow-y: auto;
}

.hdr__panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 14px 6px;
  font-size: 12px;
  color: var(--text-weak);
}

.hdr__panel-title button {
  color: var(--text-weak);
  font-size: 12px;
}

.hdr__panel-title button:hover {
  color: var(--brand);
}

.hdr__panel ul {
  padding-bottom: 6px;
}

.hdr__panel li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  font-size: 13.5px;
  cursor: pointer;
  color: var(--text-sub);
}

.hdr__panel li:hover {
  background: var(--brand-soft);
  color: var(--brand);
}

.hdr__panel li .hdr__panel-text {
  flex: 1;
  min-width: 0;
}

.hdr__panel-del {
  opacity: 0;
  color: var(--text-weak);
  display: flex;
}

.hdr__panel li:hover .hdr__panel-del {
  opacity: 1;
}

.hdr__panel-empty {
  justify-content: center;
  color: var(--text-weak);
  cursor: default !important;
}

.hdr__panel-empty:hover {
  background: transparent !important;
  color: var(--text-weak) !important;
}

.hdr__hot {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 2px 14px;
}

.hdr__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.hdr__vip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 600;
  color: #7a4a00;
  background: linear-gradient(135deg, #ffe6a7, #ffb64d);
  white-space: nowrap;
}

.hdr__vip:hover {
  filter: brightness(1.04);
}

.hdr__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-sub);
}

.hdr__icon:hover {
  background: var(--surface-2);
  color: var(--brand);
}

.hdr__user {
  position: relative;
}

.hdr__avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--line-strong);
}

.hdr__avatar-emoji {
  font-size: 18px;
  line-height: 1;
}

.hdr__avatar-emoji--lg {
  font-size: 22px;
}

.hdr__avatar-vip,
.hdr__vip-mini {
  position: absolute;
  right: -4px;
  bottom: -4px;
  padding: 0 3px;
  border-radius: 4px;
  background: linear-gradient(135deg, #ffcf6b, #f6a01a);
  color: #4a3200;
  font-size: 9px;
  font-weight: 800;
  line-height: 12px;
}

.hdr__menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 216px;
  padding: 10px 0;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  z-index: 70;
}

.hdr__menu-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 14px 12px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 6px;
}

.hdr__menu-name {
  font-size: 14px;
  font-weight: 600;
}

.hdr__menu-sub {
  font-size: 11.5px;
  color: var(--text-weak);
}

.hdr__menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 14px;
  font-size: 13.5px;
  color: var(--text-sub);
  text-align: left;
}

.hdr__menu-item:hover {
  background: var(--brand-soft);
  color: var(--brand);
}

.hdr__menu-item span {
  flex: 1;
}

.hdr__menu-item em {
  font-style: normal;
  font-size: 12px;
  color: var(--text-weak);
}

.hdr__menu-item--split {
  border-top: 1px solid var(--line);
  margin-top: 4px;
  padding-top: 11px;
}

/* ---------- 移动端 ---------- */
.hdr__mi {
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.hdr__msearch {
  flex: 1;
  min-width: 0;
  height: 34px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: 17px;
  background: var(--surface-2);
  border: 1px solid var(--line-strong);
  color: var(--text-weak);
  font-size: 13px;
}

.hdr__mavatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-sub);
  background: var(--surface-2);
  flex: none;
}

.hdr__mtabs {
  border-top: 1px solid var(--line);
  overflow-x: auto;
}

.hdr__mtabs-inner {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 40px;
}

.hdr__mtab {
  flex: none;
  position: relative;
  font-size: 14.5px;
  color: var(--text-sub);
  padding: 4px 0;
}

.hdr__mtab.is-active {
  color: var(--text);
  font-weight: 700;
}

.hdr__mtab.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -2px;
  transform: translateX(-50%);
  width: 18px;
  height: 3px;
  border-radius: 2px;
  background: var(--brand-grad);
}
</style>
