<script setup>
import { computed, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getGame } from '@/data/games'
import TetrisView from '@/views/games/TetrisView.vue'
import SpotDifferenceView from '@/views/games/SpotDifferenceView.vue'
import MemoryView from '@/views/games/MemoryView.vue'
import SnakeView from '@/views/games/SnakeView.vue'
import Game2048View from '@/views/games/Game2048View.vue'
import MinesweeperView from '@/views/games/MinesweeperView.vue'
import PuzzlePackView from '@/views/games/PuzzlePackView.vue'
import ActionPackView from '@/views/games/ActionPackView.vue'
import ArcadePackView from '@/views/games/ArcadePackView.vue'

const route = useRoute()
const game = computed(() => getGame(String(route.params.slug || '')))
const gameComponents = {
  tetris: TetrisView,
  'spot-difference': SpotDifferenceView,
  memory: MemoryView,
  snake: SnakeView,
  '2048': Game2048View,
  minesweeper: MinesweeperView,
  'tic-tac-toe': PuzzlePackView,
  'connect-four': PuzzlePackView,
  'lights-out': PuzzlePackView,
  'sliding-puzzle': PuzzlePackView,
  'number-guess': PuzzlePackView,
  'math-sprint': PuzzlePackView,
  'odd-one-out': PuzzlePackView,
  'simon-says': PuzzlePackView,
  'word-scramble': PuzzlePackView,
  'color-match': ActionPackView,
  'rock-paper-scissors': ActionPackView,
  'whack-a-mole': ActionPackView,
  'reaction-test': ActionPackView,
  'aim-trainer': ActionPackView,
  'typing-rush': ActionPackView,
  'tap-sequence': ActionPackView,
  'stack-tower': ActionPackView,
  pong: ArcadePackView,
  breakout: ArcadePackView,
  'sky-dodge': ArcadePackView
}
const currentComponent = computed(() => gameComponents[game.value?.id] || null)

watchEffect(() => {
  if (game.value) document.title = `${game.value.name} · 闪玩游戏盒`
})
</script>

<template>
  <component :is="currentComponent" v-if="currentComponent" :game="game" />
  <div v-else class="empty-game">
    <div class="container">
      <div class="empty-game__card panel">
        <span>🕹️</span>
        <h1>游戏暂时没有开放</h1>
        <p>它可能还在制作中，先去大厅看看其他游戏吧。</p>
        <RouterLink to="/games" class="btn btn--primary">返回全部游戏</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-game {
  display: grid;
  place-items: center;
  min-height: 72vh;
  padding: 40px 0;
}

.empty-game__card {
  padding: 40px 24px;
  text-align: center;
}

.empty-game__card > span {
  font-size: 58px;
}

.empty-game h1 {
  margin-top: 10px;
  font-size: 30px;
}

.empty-game p {
  margin: 6px 0 18px;
  color: var(--muted);
}
</style>
