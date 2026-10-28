<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found__card panel">
        <span class="not-found__icon">👾</span>
        <p>404 · GAME OVER</p>
        <h1>这一关不存在</h1>
        <p>你可能走进了隐藏关卡，回到大厅重新选择吧。</p>
        <RouterLink to="/" class="btn btn--primary">返回游戏大厅</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: grid;
  place-items: center;
  min-height: 72vh;
  padding: 35px 0;
}

.not-found__card {
  max-width: 480px;
  margin: auto;
  padding: 46px 30px;
  text-align: center;
}

.not-found__icon {
  display: block;
  margin-bottom: 13px;
  font-size: 68px;
  animation: float-soft 2.4s ease-in-out infinite;
}

.not-found__card > p:first-of-type {
  color: var(--coral-dark);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.not-found h1 {
  margin-top: 5px;
  font-size: 36px;
}

.not-found p:last-of-type {
  margin: 8px 0 20px;
  color: var(--muted);
}
</style>
