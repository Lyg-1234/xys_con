<script setup>
import { watch } from 'vue'
import { RouterLink } from 'vue-router'
import { updateBest } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true },
  score: { type: Number, default: 0 },
  best: { type: Number, default: 0 },
  status: { type: String, default: '准备开始' }
})

watch(
  () => props.score,
  (value) => updateBest(props.game.id, value),
  { flush: 'post' }
)
</script>

<template>
  <div class="game-page" :style="{ '--game-color': game.color, '--game-accent': game.accent }">
    <div class="container game-page__inner">
      <div class="game-crumb">
        <RouterLink to="/">游戏大厅</RouterLink>
        <span>/</span>
        <span>{{ game.name }}</span>
      </div>

      <header class="game-head">
        <div class="game-head__identity">
          <span class="game-head__icon" :style="{ background: game.gradient }">{{ game.icon }}</span>
          <div>
            <p class="game-head__eyebrow">{{ game.categoryName }} · {{ game.difficulty }}</p>
            <h1>{{ game.name }}</h1>
            <p>{{ game.subtitle }}</p>
          </div>
        </div>

        <div class="game-stats">
          <div class="game-stat">
            <span>本局得分</span>
            <strong>{{ score.toLocaleString('zh-CN') }}</strong>
          </div>
          <div class="game-stat is-best">
            <span>历史最高</span>
            <strong>{{ best.toLocaleString('zh-CN') }}</strong>
          </div>
          <div class="game-stat is-status">
            <span>状态</span>
            <strong>{{ status }}</strong>
          </div>
        </div>
      </header>

      <div class="game-layout">
        <section class="game-stage">
          <slot />
        </section>
        <aside class="game-side">
          <div class="game-panel">
            <h2>操作说明</h2>
            <ul>
              <li v-for="item in game.controls" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="game-panel game-panel--tips">
            <h2>游戏提示</h2>
            <p>{{ game.description }}</p>
          </div>
          <div class="game-panel">
            <h2>快捷操作</h2>
            <slot name="actions" />
          </div>
          <slot name="panel" />
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-page {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 18px 0 80px;
  overflow-x: clip;
}

.game-page__inner {
  width: min(1180px, calc(100% - 32px));
  max-width: 1180px;
  min-width: 0;
}

.game-crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--muted);
  font-size: 13px;
  flex-wrap: wrap;
  overflow-wrap: anywhere;
}

.game-crumb a:hover {
  color: var(--game-color);
}

.game-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  padding: 20px 22px;
  border: 2px solid var(--ink);
  border-radius: 24px;
  background: var(--paper);
  box-shadow: 6px 6px 0 var(--ink);
  min-width: 0;
}

.game-head__identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.game-head__identity > div {
  min-width: 0;
}

.game-head__icon {
  display: grid;
  place-items: center;
  width: 70px;
  height: 70px;
  flex: none;
  border: 2px solid var(--ink);
  border-radius: 21px;
  font-size: 34px;
  transform: rotate(-3deg);
}

.game-head__eyebrow {
  margin-bottom: 2px;
  color: var(--game-color);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.game-head h1 {
  font-size: clamp(24px, 4vw, 36px);
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.game-head__identity p:last-child {
  margin-top: 4px;
  color: var(--muted);
  font-size: 13px;
}

.game-stats {
  display: flex;
  gap: 8px;
  flex: none;
  min-width: 0;
}

.game-stat {
  min-width: 0;
  min-width: 110px;
  padding: 10px 14px;
  border: 1.5px solid var(--ink);
  border-radius: 15px;
  background: #fff;
}

.game-stat span {
  display: block;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}

.game-stat strong {
  display: block;
  margin-top: 1px;
  font-size: 21px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.game-stat.is-best {
  background: #fff6c7;
}

.game-stat.is-status {
  background: color-mix(in srgb, var(--game-color) 15%, white);
}

.game-stat.is-status strong {
  font-size: 14px;
}

.game-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 20px;
  align-items: start;
  min-width: 0;
}

.game-stage {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 520px;
  overflow: hidden;
  padding: 22px;
  border: 2px solid var(--ink);
  border-radius: 26px;
  background:
    radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--game-accent) 22%, transparent), transparent 32%),
    var(--paper);
  box-shadow: 6px 6px 0 var(--ink);
}

.game-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.game-panel {
  padding: 16px;
  border: 2px solid var(--ink);
  border-radius: 20px;
  background: var(--paper);
  box-shadow: 4px 4px 0 var(--ink);
}

.game-panel h2 {
  margin-bottom: 9px;
  font-size: 15px;
}

.game-panel ul {
  display: grid;
  gap: 7px;
}

.game-panel li,
.game-panel p {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.65;
}

.game-panel li::before {
  content: '▸';
  margin-right: 6px;
  color: var(--game-color);
}

.game-panel--tips {
  background: #fff9dd;
}

@media (max-width: 900px) {
  .game-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .game-stats {
    width: 100%;
  }

  .game-stat {
    min-width: 0;
    flex: 1;
  }

  .game-layout {
    grid-template-columns: 1fr;
  }

  .game-side {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .game-page__inner {
    width: calc(100% - 12px);
  }

  .game-page {
    padding-top: 6px;
    padding-bottom: 11px;
  }

  .game-crumb {
    gap: 5px;
    margin-bottom: 7px;
    padding-inline: 4px;
    font-size: 10px;
  }

  .game-head {
    width: 100%;
    gap: 10px;
    overflow: hidden;
    margin-bottom: 10px;
    padding: 11px 12px;
    border-radius: 16px;
    box-shadow: 3px 3px 0 var(--ink);
  }

  .game-head__identity {
    gap: 10px;
  }

  .game-head__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    font-size: 23px;
  }

  .game-head h1 {
    font-size: 23px;
  }

  .game-head__eyebrow {
    font-size: 9px;
  }

  .game-head__identity p:last-child {
    margin-top: 1px;
    font-size: 11px;
  }

  .game-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
  }

  .game-stat {
    min-width: 0;
    padding: 6px 7px;
    border-radius: 11px;
  }

  .game-stat span {
    font-size: 9px;
  }

  .game-stat strong {
    font-size: 15px;
  }

  .game-stat.is-status strong {
    font-size: 10px;
  }

  .game-stage {
    min-height: 0;
    width: 100%;
    min-width: 0;
    padding: 7px;
    border-radius: 16px;
    box-shadow: 3px 3px 0 var(--ink);
  }

  .game-side {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .game-panel {
    min-width: 0;
    padding: 12px;
    border-radius: 15px;
    box-shadow: 3px 3px 0 var(--ink);
  }
}

@media (max-width: 370px) {
  .game-head__identity p:last-child {
    display: none;
  }

  .game-head__icon {
    width: 42px;
    height: 42px;
    font-size: 21px;
  }

  .game-head h1 {
    font-size: 21px;
  }
}
</style>
