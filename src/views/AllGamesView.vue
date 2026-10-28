<script setup>
import { computed, ref } from 'vue'
import GameCard from '@/components/GameCard.vue'
import { CATEGORIES, getGamesByCategory } from '@/data/games'
import { useGameScores } from '@/composables/useGameScores'

const { bestFor } = useGameScores()
const category = ref('all')
const keyword = ref('')
const games = computed(() => getGamesByCategory(category.value, keyword.value))
</script>

<template>
  <div class="all-games">
    <div class="container">
      <header class="all-games__head">
        <p class="section-head__eyebrow">GAME LIBRARY</p>
        <h1>全部小游戏</h1>
        <p>不用登录，不用下载，挑一个喜欢的直接开始。</p>
      </header>

      <div class="filter-bar panel">
        <div class="filter-bar__search">
          <span>⌕</span>
          <input v-model="keyword" type="search" placeholder="搜索游戏名称或类型" />
        </div>
        <div class="filter-bar__chips">
          <button
            v-for="item in CATEGORIES"
            :key="item.key"
            type="button"
            class="chip"
            :class="{ 'is-active': category === item.key }"
            @click="category = item.key"
          >
            {{ item.name }}
          </button>
        </div>
      </div>

      <p class="result-count">找到 {{ games.length }} 款游戏</p>
      <div v-if="games.length" class="games-grid">
        <GameCard v-for="game in games" :key="game.id" :game="game" :best="bestFor(game.id)" />
      </div>
      <div v-else class="empty-state panel">
        <div class="empty-state__icon">🎮</div>
        <h2>没有找到游戏</h2>
        <p>换个名字或分类再试试。</p>
        <button type="button" class="btn btn--yellow" @click="keyword = ''; category = 'all'">
          查看全部
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.all-games {
  padding: 42px 0 72px;
}

.all-games__head {
  margin-bottom: 24px;
}

.all-games__head h1 {
  font-size: clamp(34px, 6vw, 54px);
  letter-spacing: -0.04em;
}

.all-games__head > p:last-child {
  margin-top: 6px;
  color: var(--muted);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px;
  background: #dff9f3;
}

.filter-bar__search {
  display: flex;
  align-items: center;
  width: min(330px, 100%);
  height: 42px;
  padding: 0 13px;
  border: 1.5px solid var(--ink);
  border-radius: 13px;
  background: var(--paper);
}

.filter-bar__search span {
  font-size: 20px;
}

.filter-bar__search input {
  min-width: 0;
  flex: 1;
  padding-left: 8px;
  border: 0;
  outline: 0;
  background: transparent;
}

.filter-bar__chips {
  display: flex;
  gap: 7px;
  overflow-x: auto;
}

.result-count {
  margin: 22px 2px 12px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 850px) {
  .filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-bar__search {
    width: 100%;
  }

  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .all-games {
    padding-top: 28px;
  }

  .games-grid {
    gap: 12px;
  }
}
</style>
