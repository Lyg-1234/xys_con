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
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 22px;
  background: var(--paper);
  box-shadow: 5px 5px 0 var(--ink);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.game-card:hover {
  transform: translate(-3px, -4px) rotate(-0.5deg);
  box-shadow: 9px 10px 0 var(--ink);
}

.game-card:active {
  transform: translate(1px, 1px) scale(0.995);
  box-shadow: 3px 3px 0 var(--ink);
}

.game-card:focus-visible {
  outline: 3px solid var(--coral);
  outline-offset: 4px;
}

.game-card__art {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: clamp(176px, 16vw, 210px);
  overflow: hidden;
  background: var(--card-gradient);
  border-bottom: 2px solid var(--ink);
}

.game-card__icon {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: clamp(88px, 9vw, 112px);
  height: clamp(88px, 9vw, 112px);
  border: 2px solid var(--ink);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  font-size: clamp(44px, 4.8vw, 58px);
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
  min-width: 0;
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
  line-height: 1.25;
}

.game-card__subtitle {
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.6;
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

@media (max-width: 720px) {
  .game-card__art {
    height: clamp(184px, 25vw, 210px);
  }
}

@media (max-width: 520px) {
  .game-card__art {
    height: clamp(208px, 55vw, 248px);
  }

  .game-card__icon {
    width: clamp(104px, 29vw, 126px);
    height: clamp(104px, 29vw, 126px);
    border-radius: 28px;
    font-size: clamp(52px, 14vw, 64px);
  }

  .game-card__body {
    padding: 15px 16px 14px;
  }

  .game-card h3 {
    font-size: 21px;
  }

  .game-card__subtitle {
    font-size: 13px;
  }
}
</style>
