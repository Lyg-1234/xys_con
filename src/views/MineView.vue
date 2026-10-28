<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'

const user = useUserStore()
const router = useRouter()

const ENTRIES = [
  { label: '观看历史', icon: 'history', path: '/history', value: 'history' },
  { label: '我的收藏', icon: 'heart', path: '/favorite', value: 'favorite' },
  { label: '会员中心', icon: 'crown', path: '/vip', value: 'vip' },
  { label: '播放设置', icon: 'settings', path: '/settings', value: 'settings' }
]

const countOf = (key) => {
  if (key === 'history') return user.historyCount
  if (key === 'favorite') return user.favoriteCount
  if (key === 'vip') return user.isVip ? '已开通' : '未开通'
  return ''
}

const statusText = computed(() => {
  if (!user.isLogin) return '点击右侧按钮登录'
  if (user.isVip) return `${user.vipType} · 到期 ${user.vipExpireText}`
  return '普通用户 · 可开通会员畅看全站'
})

function toggleLogin() {
  if (user.isLogin) {
    user.logout()
    toast('已退出登录')
  } else {
    user.login()
    toast('登录成功', { type: 'success' })
  }
}

function clearCache() {
  if (window.confirm('确定要清除本地观看记录与收藏吗？')) {
    user.resetAll()
    toast('本地数据已清除')
  }
}

function goPlay() {
  router.push({ name: 'channel', params: { type: 'all' } })
}
</script>

<template>
  <div class="page mine">
    <div class="container">
      <!-- 用户卡片 -->
      <section class="mine__hero">
        <span class="mine__avatar">
          {{ user.profile.emoji }}
          <em v-if="user.isVip" class="mine__vip">VIP</em>
        </span>
        <div class="mine__info">
          <h2 class="ellipsis">{{ user.isLogin ? user.profile.name : '未登录用户' }}</h2>
          <p class="ellipsis">{{ statusText }}</p>
        </div>
        <button type="button" class="btn btn--ghost mine__login" @click="toggleLogin">
          {{ user.isLogin ? '退出' : '登录' }}
        </button>
      </section>

      <!-- 数据 -->
      <section class="mine__stats">
        <RouterLink to="/history" class="mine__stat">
          <b>{{ user.historyCount }}</b>
          <span>观看记录</span>
        </RouterLink>
        <RouterLink to="/favorite" class="mine__stat">
          <b>{{ user.favoriteCount }}</b>
          <span>我的收藏</span>
        </RouterLink>
        <RouterLink to="/vip" class="mine__stat">
          <b>{{ user.isVip ? 'VIP' : '0' }}</b>
          <span>会员权益</span>
        </RouterLink>
      </section>

      <!-- 入口 -->
      <section class="section">
        <div class="mine__entries">
          <RouterLink v-for="e in ENTRIES" :key="e.label" :to="e.path" class="mine__entry">
            <AppIcon :name="e.icon" :size="20" />
            <span>{{ e.label }}</span>
            <em>{{ countOf(e.value) }}</em>
            <AppIcon name="chevron-right" :size="16" />
          </RouterLink>
        </div>
      </section>

      <section class="section">
        <button type="button" class="mine__entry mine__entry--btn" @click="goPlay">
          <AppIcon name="grid" :size="20" />
          <span>全部片库</span>
          <em>38 部</em>
          <AppIcon name="chevron-right" :size="16" />
        </button>
        <button type="button" class="mine__entry mine__entry--btn" @click="clearCache">
          <AppIcon name="trash" :size="20" />
          <span>清除本地缓存</span>
          <em />
          <AppIcon name="chevron-right" :size="16" />
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.mine__hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #fff6ef, #ffe4d6);
  box-shadow: var(--shadow-sm);
}

.mine__avatar {
  position: relative;
  width: 54px;
  height: 54px;
  flex: none;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: var(--shadow-sm);
}

.mine__vip {
  position: absolute;
  right: -4px;
  bottom: -2px;
  padding: 0 4px;
  border-radius: 4px;
  background: linear-gradient(135deg, #ffcf6b, #f6a01a);
  color: #4a3200;
  font-size: 9px;
  font-style: normal;
  font-weight: 800;
  line-height: 13px;
}

.mine__info {
  flex: 1;
  min-width: 0;
}

.mine__info h2 {
  font-size: 18px;
  font-weight: 700;
}

.mine__info p {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--text-sub);
}

.mine__login {
  flex: none;
}

.mine__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.mine__stat {
  padding: 14px 8px;
  text-align: center;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.mine__stat b {
  display: block;
  font-size: 20px;
  font-weight: 800;
  color: var(--brand);
}

.mine__stat span {
  font-size: 12.5px;
  color: var(--text-weak);
}

.mine__entries {
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.mine__entry {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 15px 16px;
  font-size: 14.5px;
  color: var(--text);
  border-bottom: 1px solid var(--line);
  text-align: left;
}

.mine__entry:last-child {
  border-bottom: none;
}

.mine__entry span {
  flex: 1;
}

.mine__entry em {
  font-style: normal;
  font-size: 12.5px;
  color: var(--text-weak);
}

.mine__entry:hover {
  background: var(--brand-soft);
}

.mine__entry--btn {
  border-bottom: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

@media (min-width: 768px) {
  .mine__hero {
    padding: 26px 24px;
  }

  .mine__stats {
    gap: 16px;
  }
}
</style>
