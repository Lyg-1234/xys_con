<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { GAMES } from '@/data/games'
import { useGameScores } from '@/composables/useGameScores'

const { bestFor, recordsFor, clearScores } = useGameScores()
const rows = computed(() =>
  GAMES.map((game) => ({
    game,
    best: bestFor(game.id),
    records: recordsFor(game.id).slice(0, 3)
  })).sort((a, b) => b.best - a.best)
)

function reset() {
  if (window.confirm('确定清空本机所有游戏成绩吗？')) clearScores()
}
</script>

<template>
  <div class="leaderboard">
    <div class="container">
      <header class="leaderboard__head">
        <div>
          <p class="section-head__eyebrow">LOCAL HALL OF FAME</p>
          <h1>我的游戏排行榜</h1>
          <p>成绩只保存在当前浏览器，不登录也不上传。</p>
        </div>
        <button type="button" class="btn btn--ghost" @click="reset">清空成绩</button>
      </header>

      <div class="leaderboard__top">
        <div v-for="(row, index) in rows.slice(0, 3)" :key="row.game.id" class="podium" :class="`podium--${index + 1}`">
          <span class="podium__crown">{{ ['♛', '♜', '♞'][index] }}</span>
          <span class="podium__icon" :style="{ background: row.game.gradient }">{{ row.game.icon }}</span>
          <strong>{{ row.game.name }}</strong>
          <b>{{ row.best || 0 }}</b>
          <small>{{ row.game.subtitle }}</small>
        </div>
      </div>

      <section class="rank-table panel">
        <div class="rank-table__head">
          <span>名次</span>
          <span>游戏</span>
          <span>最佳成绩</span>
          <span>最近记录</span>
        </div>
        <div v-for="(row, index) in rows" :key="row.game.id" class="rank-row">
          <strong class="rank-row__index">{{ index + 1 }}</strong>
          <div class="rank-row__game">
            <span :style="{ background: row.game.gradient }">{{ row.game.icon }}</span>
            <div>
              <strong>{{ row.game.name }}</strong>
              <small>{{ row.game.categoryName }}</small>
            </div>
          </div>
          <b>{{ row.best ? row.best.toLocaleString('zh-CN') : '--' }}</b>
          <div class="rank-row__records">
            <span v-for="record in row.records" :key="record.at">{{ record.score }}</span>
            <em v-if="!row.records.length">还没有记录</em>
          </div>
          <RouterLink :to="{ name: 'game', params: { slug: row.game.id } }" class="rank-row__play">
            挑战
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.leaderboard {
  padding: 42px 0 72px;
}

.leaderboard__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.leaderboard__head h1 {
  font-size: clamp(34px, 6vw, 52px);
  letter-spacing: -0.04em;
}

.leaderboard__head p:last-child {
  margin-top: 6px;
  color: var(--muted);
}

.leaderboard__top {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 14px;
  max-width: 760px;
  margin: 34px auto;
}

.podium {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 18px 15px 15px;
  border: 2px solid var(--ink);
  border-radius: 21px;
  background: var(--paper);
  box-shadow: 5px 5px 0 var(--ink);
}

.podium--1 {
  order: 2;
  padding-top: 24px;
  background: #fff4b8;
  transform: translateY(-10px);
}

.podium--2 {
  order: 1;
}

.podium--3 {
  order: 3;
  background: #ffe3d3;
}

.podium__crown {
  position: absolute;
  top: -22px;
  font-size: 28px;
}

.podium__icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 2px solid var(--ink);
  border-radius: 17px;
  font-size: 28px;
}

.podium strong {
  margin-top: 9px;
  font-size: 15px;
}

.podium b {
  margin-top: 4px;
  color: var(--coral-dark);
  font-size: 24px;
}

.podium small {
  color: var(--muted);
  font-size: 10px;
}

.rank-table {
  overflow: hidden;
}

.rank-table__head,
.rank-row {
  display: grid;
  grid-template-columns: 55px minmax(180px, 1fr) 120px minmax(150px, 0.8fr) 62px;
  align-items: center;
  gap: 12px;
}

.rank-table__head {
  padding: 12px 18px;
  border-bottom: 2px solid var(--ink);
  background: #dff9f3;
  color: var(--muted);
  font-size: 11px;
  font-weight: 900;
}

.rank-row {
  padding: 12px 18px;
  border-bottom: 1px dashed var(--line);
}

.rank-row:last-child {
  border-bottom: 0;
}

.rank-row__index {
  color: var(--muted);
  font-size: 16px;
}

.rank-row__game {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-row__game > span {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border: 1.5px solid var(--ink);
  border-radius: 11px;
  font-size: 20px;
}

.rank-row__game strong,
.rank-row__game small {
  display: block;
}

.rank-row__game small {
  color: var(--muted);
  font-size: 10px;
}

.rank-row > b {
  color: var(--coral-dark);
  font-size: 18px;
}

.rank-row__records {
  display: flex;
  gap: 5px;
}

.rank-row__records span {
  padding: 2px 7px;
  border-radius: 7px;
  background: #f1ede2;
  font-size: 11px;
  font-weight: 800;
}

.rank-row__records em {
  color: var(--muted);
  font-size: 11px;
  font-style: normal;
}

.rank-row__play {
  font-size: 12px;
  font-weight: 900;
}

.rank-row__play:hover {
  color: var(--coral-dark);
}

@media (max-width: 700px) {
  .leaderboard {
    padding-top: 28px;
  }

  .leaderboard__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .leaderboard__top {
    gap: 7px;
  }

  .podium {
    padding: 16px 6px 11px;
  }

  .podium__icon {
    width: 45px;
    height: 45px;
    font-size: 23px;
  }

  .podium strong {
    font-size: 11px;
  }

  .podium b {
    font-size: 18px;
  }

  .rank-table__head {
    display: none;
  }

  .rank-row {
    grid-template-columns: 26px minmax(0, 1fr) auto;
    gap: 9px;
    padding: 12px;
  }

  .rank-row > b {
    font-size: 15px;
  }

  .rank-row__records {
    display: none;
  }

  .rank-row__play {
    display: none;
  }
}
</style>
