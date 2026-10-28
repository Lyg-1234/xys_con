import { computed, ref } from 'vue'

const STORAGE_KEY = 'pixel-play-scorebook-v1'

function loadScores() {
  if (typeof window === 'undefined') return {}
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return value && typeof value === 'object' ? value : {}
  } catch (error) {
    return {}
  }
}

const scorebook = ref(loadScores())

function persist() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scorebook.value))
  } catch (error) {
    /* 隐私模式下不阻塞游戏 */
  }
}

export function submitScore(gameId, score, meta = {}) {
  const value = Math.max(0, Math.round(Number(score) || 0))
  const previous = scorebook.value[gameId] || { best: 0, plays: 0, records: [] }
  const record = {
    score: value,
    at: Date.now(),
    ...meta
  }
  const records = [...(previous.records || []), record]
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, 8)

  scorebook.value = {
    ...scorebook.value,
    [gameId]: {
      best: Math.max(Number(previous.best) || 0, value),
      plays: (Number(previous.plays) || 0) + 1,
      lastPlayed: Date.now(),
      records
    }
  }
  persist()
  return scorebook.value[gameId]
}

export function recordPlay(gameId) {
  const previous = scorebook.value[gameId] || { best: 0, plays: 0, records: [] }
  scorebook.value = {
    ...scorebook.value,
    [gameId]: {
      ...previous,
      plays: (Number(previous.plays) || 0) + 1,
      lastPlayed: Date.now()
    }
  }
  persist()
}

export function clearScores() {
  scorebook.value = {}
  persist()
}

export function useGameScores() {
  const bestFor = (gameId) => Number(scorebook.value[gameId]?.best) || 0
  const playsFor = (gameId) => Number(scorebook.value[gameId]?.plays) || 0
  const recordsFor = (gameId) => scorebook.value[gameId]?.records || []
  const totalPlays = computed(() =>
    Object.values(scorebook.value).reduce((total, item) => total + (Number(item.plays) || 0), 0)
  )
  const playedGames = computed(() =>
    Object.values(scorebook.value).filter((item) => Number(item.best) > 0).length
  )

  return {
    scorebook,
    bestFor,
    playsFor,
    recordsFor,
    totalPlays,
    playedGames,
    submitScore,
    recordPlay,
    clearScores
  }
}
