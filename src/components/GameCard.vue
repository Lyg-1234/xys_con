<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  game: { type: Object, required: true },
  best: { type: Number, default: 0 }
})
</script>

<template>
  <RouterLink
    :to="{ name: 'game', params: { slug: game.id } }"
    class="game-card"
    :style="{ '--card-color': game.color, '--card-accent': game.accent, '--card-gradient': game.gradient }"
  >
    <div class="game-card__art">
      <span class="game-card__shape shape-a" />
      <span class="game-card__shape shape-b" />
      <span class="game-card__icon">{{ game.icon }}</span>
      <span class="game-card__tag">{{ game.difficulty }}</span>
    </div>
    <div class="game-card__body">
      <p class="game-card__category">{{ game.categoryName }}</p>
      <h3>{{ game.name }}</h3>
      <p class="game-card__subtitle">{{ game.subtitle }}</p>
      <div class="game-card__foot">
        <span>{{ best ? `最高 ${best.toLocaleString('zh-CN')}` : '等待首胜' }}</span>
        <strong>开玩 <i>→</i></strong>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.game-card {
  display: block;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 22px;
  background: var(--paper);
  box-shadow: 5px 5px 0 var(--ink);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.game-card:hover {
  transform: translate(-3px, -4px) rotate(-0.5deg);
  box-shadow: 9px 10px 0 var(--ink);
}

.game-card__art {
  position: relative;
  display: grid;
  place-items: center;
  height: 150px;
  overflow: hidden;
  background: var(--card-gradient);
  border-bottom: 2px solid var(--ink);
}

.game-card__icon {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 78px;
  height: 78px;
  border: 2px solid var(--ink);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  font-size: 40px;
  box-shadow: 5px 5px 0 rgba(24, 35, 47, 0.9);
  transform: rotate(-5deg);
  transition: transform 0.25s ease;
}

.game-card:hover .game-card__icon {
  transform: rotate(4deg) scale(1.06);
}

.game-card__shape {
  position: absolute;
  border: 2px solid var(--ink);
  background: rgba(255, 255, 255, 0.2);
}

.shape-a {
  top: -35px;
  left: -20px;
  width: 110px;
  height: 110px;
  border-radius: 30px;
  transform: rotate(24deg);
}

.shape-b {
  right: 20px;
  bottom: -44px;
  width: 105px;
  height: 105px;
  border-radius: 50%;
}

.game-card__tag {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 9px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: #fff9d9;
  font-size: 11px;
  font-weight: 800;
}

.game-card__body {
  padding: 14px 15px 13px;
}

.game-card__category {
  color: var(--card-color);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.game-card h3 {
  margin-top: 2px;
  font-size: 20px;
}

.game-card__subtitle {
  color: var(--muted);
  font-size: 12.5px;
}

.game-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed rgba(24, 35, 47, 0.22);
  color: var(--muted);
  font-size: 11.5px;
}

.game-card__foot strong {
  color: var(--ink);
  font-size: 13px;
}

.game-card__foot i {
  display: inline-block;
  margin-left: 2px;
  font-style: normal;
  transition: transform 0.18s ease;
}

.game-card:hover .game-card__foot i {
  transform: translateX(4px);
}
</style>
