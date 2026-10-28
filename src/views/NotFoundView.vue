<script setup>
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
  <div class="page">
    <div class="container nf">
      <div class="nf__icon"><AppIcon name="monitor" :size="52" /></div>
      <h1>404 · 页面走丢了</h1>
      <p class="muted">你访问的页面不存在，或者已经下架了～</p>
      <div class="nf__ops">
        <RouterLink to="/" class="btn btn--primary btn--lg">回到首页</RouterLink>
        <RouterLink :to="{ name: 'channel', params: { type: 'all' } }" class="btn btn--ghost btn--lg">
          看看片库
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf {
  padding: 70px 20px;
  text-align: center;
}

.nf__icon {
  color: var(--text-weak);
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.nf h1 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.nf__ops {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  flex-wrap: wrap;
}
</style>
