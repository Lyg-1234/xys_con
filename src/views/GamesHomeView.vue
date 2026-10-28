<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import GameCard from '@/components/GameCard.vue'
import { CATEGORIES, GAMES, getGamesByCategory } from '@/data/games'
import { useGameScores } from '@/composables/useGameScores'

const router = useRouter()
const { bestFor, totalPlays, playedGames, scorebook } = useGameScores()
const category = ref('all')
const keyword = ref('')

const filteredGames = computed(() => getGamesByCategory(category.value, keyword.value))
const topGames = computed(() =>
  GAMES.map((game) => ({ game, best: bestFor(game.id) }))
    .sort((a, b) => b.best - a.best)
    .slice(0, 5)
)

const recentGame = computed(() => {
  const items = Object.entries(scorebook.value)
    .filter(([, value]) => value?.lastPlayed)
    .sort((a, b) => b[1].lastPlayed - a[1].lastPlayed)
  return GAMES.find((game) => game.id === items[0]?.[0]) || null
})

function play(game) {
  router.push({ name: 'game', params: { slug: game.id } })
}

function randomGame() {
  play(GAMES[Math.floor(Math.random() * GAMES.length)])
}
</script>

<template>
  <div class="home">
    <div class="container">
      <section class="hero">
        <div class="hero__copy">
          <div class="hero__badge">NO DOWNLOAD · JUST PLAY</div>
          <h1>打开即玩的<br /><span>快乐小游戏</span></h1>
          <p>经典街机、烧脑益智、随时来一局。无需下载，不占空间，电脑手机都能玩。</p>
          <div class="hero__search">
            <span>⌕</span>
            <input v-model="keyword" type="search" placeholder="搜索游戏，比如：俄罗斯方块" />
            <button type="button" @click="randomGame">随机一局</button>
          </div>
          <div class="hero__quick">
            <span>热门：</span>
            <button
              v-for="name in ['俄罗斯方块', '找不同', '2048', '贪吃蛇']"
              :key="name"
              type="button"
              @click="keyword = name"
            >
              {{ name }}
            </button>
          </div>
        </div>

        <div class="hero__visual" aria-hidden="true">
          <div class="pixel-card pixel-card--tetris">
            <i v-for="n in 9" :key="n" :class="`tetris-${n}`" />
          </div>
          <div class="pixel-card pixel-card--snake">
            <span>🐍</span>
            <b>+10</b>
          </div>
          <div class="pixel-card pixel-card--2048">2048</div>
          <div class="spark spark--one">✦</div>
          <div class="spark spark--two">✧</div>
        </div>
      </section>

      <section class="home-stats">
        <div><strong>{{ GAMES.length }}</strong><span>精选游戏</span></div>
        <div><strong>{{ totalPlays }}</strong><span>累计开局</span></div>
        <div><strong>{{ playedGames }}</strong><span>已挑战</span></div>
        <div><strong>∞</strong><span>快乐次数</span></div>
      </section>

      <section class="home-section">
        <div class="section-head">
          <div>
            <p class="section-head__eyebrow">PICK & PLAY</p>
            <h2>今天玩点什么？</h2>
          </div>
          <RouterLink to="/games" class="section-head__link">查看全部游戏 →</RouterLink>
        </div>

        <div class="category-row">
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

        <div v-if="filteredGames.length" class="games-grid">
          <GameCard
            v-for="game in filteredGames"
            :key="game.id"
            :game="game"
            :best="bestFor(game.id)"
          />
        </div>
        <div v-else class="empty-state panel">
          <div class="empty-state__icon">🕹️</div>
          <h2>没找到这个游戏</h2>
          <p>换个关键词试试，或者直接随机开一局。</p>
          <button type="button" class="btn btn--yellow" @click="keyword = ''">清除搜索</button>
        </div>
      </section>

      <div class="home-lower">
        <section class="daily panel">
          <div class="daily__art">
            <span>🔎</span>
            <i>5</i>
          </div>
          <div class="daily__body">
            <p class="section-head__eyebrow">TODAY'S CHALLENGE</p>
            <h2>火眼金睛挑战</h2>
            <p>两幅画里有 5 处不同，你能在一分钟内全部找出来吗？</p>
            <button type="button" class="btn btn--primary" @click="play(GAMES.find((g) => g.id === 'spot-difference'))">
              接受挑战
            </button>
          </div>
        </section>

        <section class="mini-rank panel">
          <div class="section-head">
            <div>
              <p class="section-head__eyebrow">YOUR BEST</p>
              <h2>我的高分</h2>
            </div>
            <RouterLink to="/leaderboard" class="section-head__link">完整榜单</RouterLink>
          </div>
          <ol>
            <li v-for="(item, index) in topGames" :key="item.game.id">
              <span class="mini-rank__no">{{ index + 1 }}</span>
              <span class="mini-rank__icon">{{ item.game.icon }}</span>
              <div>
                <strong>{{ item.game.name }}</strong>
                <small>{{ item.game.subtitle }}</small>
              </div>
              <b>{{ item.best || '--' }}</b>
            </li>
          </ol>
        </section>
      </div>

      <section v-if="recentGame" class="continue-strip">
        <div>
          <span class="continue-strip__icon">{{ recentGame.icon }}</span>
          <div>
            <small>上次玩过</small>
            <strong>{{ recentGame.name }}</strong>
          </div>
        </div>
        <button type="button" class="btn btn--yellow" @click="play(recentGame)">继续挑战 →</button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 22px 0 68px;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
  min-height: 430px;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 30px;
  background: #fff6d8;
  box-shadow: 7px 7px 0 var(--ink);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle, rgba(24, 35, 47, 0.12) 1.5px, transparent 1.5px);
  background-size: 18px 18px;
  mask-image: linear-gradient(90deg, transparent 0, black 48%, black 100%);
  pointer-events: none;
}

.hero__copy {
  position: relative;
  z-index: 2;
  align-self: center;
  padding: 44px clamp(24px, 5vw, 62px);
}

.hero__badge {
  display: inline-flex;
  padding: 5px 11px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: var(--mint);
  color: #fff;
  font-size: 10px;
  font-weight: 1000;
  letter-spacing: 0.1em;
  transform: rotate(-2deg);
}

.hero h1 {
  margin-top: 16px;
  font-size: clamp(40px, 6vw, 68px);
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.hero h1 span {
  color: var(--coral);
  text-shadow: 3px 3px 0 var(--ink);
  -webkit-text-stroke: 1.5px var(--ink);
}

.hero__copy > p {
  max-width: 500px;
  margin-top: 16px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.75;
}

.hero__search {
  display: flex;
  align-items: center;
  max-width: 540px;
  height: 52px;
  margin-top: 24px;
  padding: 5px 5px 5px 15px;
  border: 2px solid var(--ink);
  border-radius: 17px;
  background: var(--paper);
  box-shadow: 4px 4px 0 var(--ink);
}

.hero__search > span {
  font-size: 21px;
}

.hero__search input {
  min-width: 0;
  flex: 1;
  padding: 0 9px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 13px;
}

.hero__search button {
  height: 38px;
  padding: 0 14px;
  border: 1.5px solid var(--ink);
  border-radius: 11px;
  background: var(--coral);
  color: #fff;
  font-size: 12px;
  font-weight: 900;
}

.hero__quick {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 13px;
  color: var(--muted);
  font-size: 11px;
}

.hero__quick button {
  color: var(--ink-soft);
  font-size: 11px;
  font-weight: 800;
}

.hero__quick button:hover {
  color: var(--coral-dark);
}

.hero__visual {
  position: relative;
  min-height: 360px;
  background: linear-gradient(155deg, #53d8c5 0%, #80e0d1 55%, #b4f0dd 100%);
  border-left: 2px solid var(--ink);
}

.pixel-card {
  position: absolute;
  border: 2px solid var(--ink);
  box-shadow: 6px 6px 0 var(--ink);
}

.pixel-card--tetris {
  top: 54px;
  left: 50%;
  display: grid;
  grid-template-columns: repeat(3, 35px);
  grid-template-rows: repeat(3, 35px);
  gap: 4px;
  padding: 12px;
  border-radius: 18px;
  background: #fffdf7;
  transform: translateX(-54%) rotate(-6deg);
  animation: float-soft 4s ease-in-out infinite;
  --rotate: -6deg;
}

.pixel-card--tetris i {
  border: 1.5px solid var(--ink);
  border-radius: 6px;
  background: #cbc6ff;
}

.pixel-card--tetris .tetris-1,
.pixel-card--tetris .tetris-2,
.pixel-card--tetris .tetris-3,
.pixel-card--tetris .tetris-4 {
  background: var(--violet);
}

.pixel-card--tetris .tetris-5,
.pixel-card--tetris .tetris-9 {
  visibility: hidden;
}

.pixel-card--tetris .tetris-6 {
  background: var(--sun);
}

.pixel-card--tetris .tetris-7,
.pixel-card--tetris .tetris-8 {
  background: var(--coral);
}

.pixel-card--snake {
  right: 28px;
  bottom: 54px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--sun);
  transform: rotate(7deg);
}

.pixel-card--snake span {
  font-size: 28px;
}

.pixel-card--snake b {
  font-size: 16px;
}

.pixel-card--2048 {
  left: 22px;
  bottom: 75px;
  padding: 18px 16px;
  border-radius: 17px;
  background: #ff9f43;
  color: #fff;
  font-size: 25px;
  font-weight: 1000;
  transform: rotate(-8deg);
}

.spark {
  position: absolute;
  font-size: 32px;
  color: var(--ink);
  font-weight: 1000;
}

.spark--one {
  top: 35px;
  right: 36px;
}

.spark--two {
  bottom: 170px;
  left: 24px;
  font-size: 22px;
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 18px;
}

.home-stats div {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 7px;
  padding: 13px 8px;
  border: 1.5px solid var(--ink);
  border-radius: 15px;
  background: var(--paper);
}

.home-stats strong {
  font-size: 22px;
}

.home-stats span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}

.home-section {
  margin-top: 46px;
}

.category-row {
  display: flex;
  gap: 8px;
  margin-bottom: 17px;
  overflow-x: auto;
  padding: 2px;
}

.category-row::-webkit-scrollbar {
  display: none;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.home-lower {
  display: grid;
  grid-template-columns: minmax(0, 1.16fr) minmax(300px, 0.84fr);
  gap: 18px;
  margin-top: 44px;
}

.daily {
  position: relative;
  display: grid;
  grid-template-columns: 180px 1fr;
  align-items: center;
  overflow: hidden;
  min-height: 300px;
  padding: 22px;
  background: #ffe7dc;
}

.daily::before {
  content: '';
  position: absolute;
  right: -50px;
  top: -50px;
  width: 180px;
  height: 180px;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--sun);
}

.daily__art {
  position: relative;
  display: grid;
  place-items: center;
  width: 145px;
  height: 145px;
  border: 2px solid var(--ink);
  border-radius: 32px;
  background: #fff7e5;
  box-shadow: 6px 6px 0 var(--ink);
  transform: rotate(-5deg);
}

.daily__art span {
  font-size: 66px;
}

.daily__art i {
  position: absolute;
  right: -9px;
  bottom: -9px;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--coral);
  color: #fff;
  font-size: 19px;
  font-style: normal;
  font-weight: 1000;
}

.daily__body {
  position: relative;
  z-index: 1;
  padding: 0 18px 0 26px;
}

.daily__body h2 {
  font-size: 25px;
}

.daily__body p:not(.section-head__eyebrow) {
  margin: 8px 0 18px;
  color: var(--muted);
  line-height: 1.7;
}

.mini-rank {
  padding: 20px;
}

.mini-rank .section-head {
  margin-bottom: 8px;
}

.mini-rank .section-head h2 {
  font-size: 22px;
}

.mini-rank li {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 3px;
  border-top: 1px dashed var(--line);
}

.mini-rank__no {
  width: 17px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 900;
  text-align: center;
}

.mini-rank li:first-child .mini-rank__no {
  color: var(--coral-dark);
}

.mini-rank__icon {
  font-size: 21px;
}

.mini-rank li div {
  min-width: 0;
  flex: 1;
}

.mini-rank strong,
.mini-rank small {
  display: block;
}

.mini-rank strong {
  font-size: 12.5px;
}

.mini-rank small {
  color: var(--muted);
  font-size: 10px;
}

.mini-rank li > b {
  color: var(--coral-dark);
  font-size: 14px;
}

.continue-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
  padding: 15px 18px;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #dff9f3;
}

.continue-strip > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.continue-strip__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  background: #fff;
  font-size: 23px;
}

.continue-strip small,
.continue-strip strong {
  display: block;
}

.continue-strip small {
  color: var(--muted);
  font-size: 10px;
}

.continue-strip strong {
  font-size: 15px;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero__visual {
    min-height: 310px;
    border-top: 2px solid var(--ink);
    border-left: 0;
  }

  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-lower {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .home {
    padding-top: 12px;
  }

  .hero {
    border-radius: 23px;
    box-shadow: 5px 5px 0 var(--ink);
  }

  .hero__copy {
    padding: 30px 20px;
  }

  .hero h1 {
    font-size: 42px;
  }

  .hero__copy > p {
    font-size: 13px;
  }

  .hero__search button {
    padding: 0 10px;
  }

  .hero__visual {
    min-height: 260px;
  }

  .pixel-card--tetris {
    top: 29px;
    grid-template-columns: repeat(3, 28px);
    grid-template-rows: repeat(3, 28px);
  }

  .pixel-card--2048 {
    bottom: 37px;
  }

  .pixel-card--snake {
    right: 18px;
    bottom: 34px;
  }

  .home-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .home-section {
    margin-top: 34px;
  }

  .games-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .daily {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .daily__art {
    width: 108px;
    height: 108px;
  }

  .daily__art span {
    font-size: 52px;
  }

  .daily__body {
    padding: 0;
  }

  .continue-strip {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
