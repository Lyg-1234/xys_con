<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GameShell from '@/components/GameShell.vue'
import { recordPlay, submitScore, useGameScores } from '@/composables/useGameScores'

const props = defineProps({
  game: { type: Object, required: true }
})

const { bestFor } = useGameScores()
const mode = computed(() => props.game.id)
const best = computed(() => bestFor(props.game.id))
const score = ref(0)
const running = ref(false)
const finished = ref(false)
const message = ref('')
const resultTitle = ref('')

const timers = new Set()
let interval = null

function later(callback, delay) {
  const timer = setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
  return timer
}

function clearTimers() {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
  if (interval) clearInterval(interval)
  interval = null
}

function beginSession() {
  clearTimers()
  recordPlay(props.game.id)
  score.value = 0
  running.value = true
  finished.value = false
  message.value = ''
  resultTitle.value = ''
}

function completeGame(title, detail, finalScore = score.value) {
  if (finished.value) return
  clearTimers()
  score.value = Math.max(0, Math.round(finalScore))
  running.value = false
  finished.value = true
  resultTitle.value = title
  message.value = detail
  submitScore(props.game.id, score.value)
}

function shuffle(items) {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 井字棋
const ticBoard = ref(Array(9).fill(''))
const ticTurn = ref('X')
const ticOver = ref(false)
const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
]

function ticWinner(board) {
  return winningLines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]) || null
}

function resetTic() {
  ticBoard.value = Array(9).fill('')
  ticTurn.value = 'X'
  ticOver.value = false
}

function ticMove(index) {
  if (!running.value || ticOver.value || ticTurn.value !== 'X' || ticBoard.value[index]) return
  const next = ticBoard.value.slice()
  next[index] = 'X'
  ticBoard.value = next
  const line = ticWinner(next)
  if (line) {
    completeGame('你赢了！', '三枚棋子已经连成一线。', 300)
    return
  }
  if (next.every(Boolean)) {
    completeGame('平局', '棋盘已经填满，双方势均力敌。', 100)
    return
  }
  ticTurn.value = 'O'
  later(ticComputerMove, 260)
}

function ticComputerMove() {
  if (ticOver.value || finished.value) return
  const board = ticBoard.value.slice()
  const empty = board.map((value, index) => (value ? -1 : index)).filter((index) => index >= 0)
  const winningMove = empty.find((index) => {
    const test = board.slice()
    test[index] = 'O'
    return Boolean(ticWinner(test))
  })
  const blockingMove = empty.find((index) => {
    const test = board.slice()
    test[index] = 'X'
    return Boolean(ticWinner(test))
  })
  const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7]
  const index = winningMove ?? blockingMove ?? preferred.find((spot) => empty.includes(spot))
  if (index == null) {
    completeGame('平局', '棋盘已经填满，双方势均力敌。', 100)
    return
  }
  board[index] = 'O'
  ticBoard.value = board
  if (ticWinner(board)) {
    completeGame('电脑获胜', '再试一次，抢先占住关键位置。', 20)
    return
  }
  if (board.every(Boolean)) {
    completeGame('平局', '棋盘已经填满，双方势均力敌。', 100)
    return
  }
  ticTurn.value = 'X'
}

// 四子棋
const CONNECT_ROWS = 6
const CONNECT_COLS = 7
const connectBoard = ref(Array(CONNECT_ROWS * CONNECT_COLS).fill(''))
const connectTurn = ref('red')
const connectOver = ref(false)

function resetConnect() {
  connectBoard.value = Array(CONNECT_ROWS * CONNECT_COLS).fill('')
  connectTurn.value = 'red'
  connectOver.value = false
}

function connectIndex(row, col) {
  return row * CONNECT_COLS + col
}

function connectWinner(board, color) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let row = 0; row < CONNECT_ROWS; row += 1) {
    for (let col = 0; col < CONNECT_COLS; col += 1) {
      if (board[connectIndex(row, col)] !== color) continue
      for (const [dy, dx] of directions) {
        let count = 1
        for (let step = 1; step < 4; step += 1) {
          const nextRow = row + dy * step
          const nextCol = col + dx * step
          if (
            nextRow < 0 || nextRow >= CONNECT_ROWS ||
            nextCol < 0 || nextCol >= CONNECT_COLS ||
            board[connectIndex(nextRow, nextCol)] !== color
          ) break
          count += 1
        }
        if (count === 4) return true
      }
    }
  }
  return false
}

function connectDropRow(board, col) {
  for (let row = CONNECT_ROWS - 1; row >= 0; row -= 1) {
    if (!board[connectIndex(row, col)]) return row
  }
  return -1
}

function resetConnectTurn(board, color) {
  connectBoard.value = board
  const full = board.every(Boolean)
  if (connectWinner(board, color)) {
    const playerWon = color === 'red'
    completeGame(
      playerWon ? '四子连线！' : '电脑先连成了',
      playerWon ? '漂亮，你抢先完成了四子连线。' : '电脑把握住了落子机会。',
      playerWon ? 350 : 20
    )
    return
  }
  if (full) {
    completeGame('平局', '棋盘已满，没有一方连成四子。', 100)
    return
  }
  connectTurn.value = color === 'red' ? 'yellow' : 'red'
  if (color === 'red') later(connectComputerMove, 330)
}

function dropConnect(col) {
  if (!running.value || connectOver.value || connectTurn.value !== 'red') return
  const row = connectDropRow(connectBoard.value, col)
  if (row < 0) return
  const next = connectBoard.value.slice()
  next[connectIndex(row, col)] = 'red'
  resetConnectTurn(next, 'red')
}

function findConnectMove(color) {
  const available = []
  for (let col = 0; col < CONNECT_COLS; col += 1) {
    if (connectDropRow(connectBoard.value, col) >= 0) available.push(col)
  }
  for (const col of available) {
    const row = connectDropRow(connectBoard.value, col)
    const test = connectBoard.value.slice()
    test[connectIndex(row, col)] = color
    if (connectWinner(test, color)) return col
  }
  const preferred = [3, 2, 4, 1, 5, 0, 6]
  return preferred.find((col) => available.includes(col)) ?? available[0]
}

function connectComputerMove() {
  if (connectOver.value || finished.value || connectTurn.value !== 'yellow') return
  const col = findConnectMove('yellow') ?? findConnectMove('red')
  if (col == null) return
  const row = connectDropRow(connectBoard.value, col)
  if (row < 0) return
  const next = connectBoard.value.slice()
  next[connectIndex(row, col)] = 'yellow'
  resetConnectTurn(next, 'yellow')
}

// 关灯挑战
const LIGHTS_SIZE = 5
const lights = ref([])
const lightMoves = ref(0)

function toggleLightCell(board, index) {
  const x = index % LIGHTS_SIZE
  const y = Math.floor(index / LIGHTS_SIZE)
  ;[[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && nx < LIGHTS_SIZE && ny >= 0 && ny < LIGHTS_SIZE) {
      const target = ny * LIGHTS_SIZE + nx
      board[target] = !board[target]
    }
  })
}

function resetLights() {
  const board = Array(LIGHTS_SIZE * LIGHTS_SIZE).fill(false)
  const scrambleCount = 8 + Math.floor(Math.random() * 5)
  for (let i = 0; i < scrambleCount; i += 1) {
    toggleLightCell(board, Math.floor(Math.random() * board.length))
  }
  if (board.every((value) => !value)) {
    toggleLightCell(board, Math.floor(Math.random() * board.length))
  }
  lights.value = board
  lightMoves.value = 0
}

function pressLight(index) {
  if (!running.value) return
  const next = lights.value.slice()
  toggleLightCell(next, index)
  lights.value = next
  lightMoves.value += 1
  score.value = Math.max(100, 1000 - lightMoves.value * 18)
  if (next.every((value) => !value)) {
    completeGame('全部熄灭！', `你用了 ${lightMoves.value} 步，展现了清晰的逻辑。`)
  }
}

// 数字华容道
const sliding = ref([])
const slidingMoves = ref(0)
const slidingSeconds = ref(0)

const SLIDING_SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0]

function slideTile(index) {
  if (!running.value) return
  const blank = sliding.value.indexOf(0)
  const [x, y] = [index % 3, Math.floor(index / 3)]
  const [bx, by] = [blank % 3, Math.floor(blank / 3)]
  if (Math.abs(x - bx) + Math.abs(y - by) !== 1) return
  const next = sliding.value.slice()
  ;[next[index], next[blank]] = [next[blank], next[index]]
  sliding.value = next
  slidingMoves.value += 1
  score.value = Math.max(100, 1200 - slidingMoves.value * 10 - slidingSeconds.value * 2)
  if (next.every((value, position) => value === SLIDING_SOLVED[position])) {
    completeGame('拼图复原！', `用了 ${slidingMoves.value} 步和 ${slidingSeconds.value} 秒。`)
  }
}

function resetSliding() {
  const board = SLIDING_SOLVED.slice()
  let blank = board.indexOf(0)
  let previous = -1
  for (let i = 0; i < 160; i += 1) {
    const candidates = []
    const x = blank % 3
    const y = Math.floor(blank / 3)
    if (x > 0) candidates.push(blank - 1)
    if (x < 2) candidates.push(blank + 1)
    if (y > 0) candidates.push(blank - 3)
    if (y < 2) candidates.push(blank + 3)
    const choices = candidates.filter((index) => index !== previous)
    const target = choices[Math.floor(Math.random() * choices.length)]
    ;[board[blank], board[target]] = [board[target], board[blank]]
    previous = blank
    blank = target
  }
  if (board.every((value, position) => value === SLIDING_SOLVED[position])) {
    ;[board[0], board[1]] = [board[1], board[0]]
  }
  sliding.value = board
  slidingMoves.value = 0
  slidingSeconds.value = 0
}

// 数字猜猜
const guessTarget = ref(0)
const guessInput = ref('')
const guessAttempts = ref(0)
const guessHint = ref('输入 1 到 100 之间的数字。')

function resetNumberGuess() {
  guessTarget.value = Math.floor(Math.random() * 100) + 1
  guessInput.value = ''
  guessAttempts.value = 0
  guessHint.value = '输入 1 到 100 之间的数字。'
}

function submitGuess() {
  if (!running.value) return
  const value = Number(guessInput.value)
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    guessHint.value = '请输入 1 到 100 之间的整数。'
    return
  }
  guessAttempts.value += 1
  if (value === guessTarget.value) {
    const finalScore = Math.max(100, 1000 - guessAttempts.value * 70)
    completeGame('猜中了！', `用了 ${guessAttempts.value} 次猜中数字 ${guessTarget.value}。`, finalScore)
    return
  }
  guessHint.value = value < guessTarget.value ? `${value} 偏小，再往大一点猜。` : `${value} 偏大，再往小一点猜。`
  guessInput.value = ''
}

// 心算冲刺
const mathQuestion = ref({ text: '2 + 2', answer: 4 })
const mathInput = ref('')
const mathTime = ref(30)
const mathStreak = ref(0)
const mathHint = ref('输入答案后直接提交。')

function makeMathQuestion() {
  const operators = ['+', '-', '×']
  const operator = operators[Math.floor(Math.random() * operators.length)]
  let a = Math.floor(Math.random() * 20) + 2
  let b = Math.floor(Math.random() * 12) + 2
  if (operator === '-' && b > a) [a, b] = [b, a]
  let answer = operator === '+' ? a + b : operator === '-' ? a - b : a * b
  if (operator === '×' && a > 12) a = Math.floor(Math.random() * 10) + 2
  answer = operator === '+' ? a + b : operator === '-' ? a - b : a * b
  mathQuestion.value = { text: `${a} ${operator} ${b}`, answer }
  mathInput.value = ''
}

function submitMath() {
  if (!running.value) return
  const value = Number(mathInput.value)
  if (!Number.isFinite(value)) return
  if (value === mathQuestion.value.answer) {
    mathStreak.value += 1
    score.value += 100 + mathStreak.value * 20
    mathHint.value = mathStreak.value >= 3 ? `连对 ${mathStreak.value} 题，状态火热！` : '答对了，继续！'
    makeMathQuestion()
  } else {
    mathStreak.value = 0
    mathHint.value = `答错了，${mathQuestion.value.text} 的答案是 ${mathQuestion.value.answer}。`
    makeMathQuestion()
  }
}

function resetMath() {
  mathTime.value = 30
  mathStreak.value = 0
  score.value = 0
  mathHint.value = '输入答案后直接提交。'
  makeMathQuestion()
  interval = setInterval(() => {
    if (!running.value) return
    mathTime.value -= 1
    if (mathTime.value <= 0) {
      completeGame('时间到！', `本局获得 ${score.value} 分，答对越多分数越高。`, score.value)
    }
  }, 1000)
}

// 找出异类
const oddColors = ref([])
const oddIndex = ref(0)
const oddRound = ref(1)
const oddHint = ref('找出颜色略有不同的那一块。')

function makeOddRound() {
  const hue = Math.floor(Math.random() * 350)
  const saturation = 58 + Math.floor(Math.random() * 18)
  const lightness = 48 + Math.floor(Math.random() * 13)
  const base = `hsl(${hue} ${saturation}% ${lightness}%)`
  const different = `hsl(${hue} ${saturation - 13}% ${lightness + 8}%)`
  const target = Math.floor(Math.random() * 12)
  oddColors.value = Array.from({ length: 12 }, (_, index) => (index === target ? different : base))
  oddIndex.value = target
}

function pickOdd(index) {
  if (!running.value) return
  if (index === oddIndex.value) {
    score.value += 80 + oddRound.value * 10
    oddRound.value += 1
    if (oddRound.value > 10) {
      completeGame('眼力过人！', '十轮色差全部找对，观察力非常稳定。', score.value)
      return
    }
    oddHint.value = `答对了，进入第 ${oddRound.value} 轮。`
    makeOddRound()
  } else {
    score.value = Math.max(0, score.value - 25)
    oddHint.value = '这块颜色是对的，再仔细看看。'
  }
}

function resetOdd() {
  oddRound.value = 1
  oddHint.value = '找出颜色略有不同的那一块。'
  makeOddRound()
}

// 记忆彩灯
const PAD_COLORS = [
  { color: '#ff6554', label: '红' },
  { color: '#4b8bf4', label: '蓝' },
  { color: '#ffd43b', label: '黄' },
  { color: '#20bfa9', label: '绿' }
]
const simonSequence = ref([])
const simonInput = ref(0)
const simonActive = ref(-1)
const simonShowing = ref(false)
const simonHint = ref('观察彩灯顺序。')

function showSimonSequence() {
  simonShowing.value = true
  simonInput.value = 0
  simonActive.value = -1
  simonHint.value = '观察闪烁顺序，暂时不要点击。'
  const speed = Math.max(330, 620 - simonSequence.value.length * 25)
  simonSequence.value.forEach((pad, index) => {
    later(() => {
      if (!running.value) return
      simonActive.value = pad
      later(() => {
        if (simonActive.value === pad) simonActive.value = -1
      }, speed * 0.58)
    }, 350 + index * speed)
  })
  later(() => {
    if (!running.value) return
    simonShowing.value = false
    simonHint.value = '轮到你了，按顺序点击。'
  }, 350 + simonSequence.value.length * speed + 120)
}

function resetSimon() {
  simonSequence.value = Array.from({ length: 3 }, () => Math.floor(Math.random() * 4))
  simonActive.value = -1
  showSimonSequence()
}

function nextSimonRound() {
  if (!running.value) return
  simonSequence.value = [...simonSequence.value, Math.floor(Math.random() * 4)]
  score.value += simonSequence.value.length * 90
  simonHint.value = `答对了，序列增加到 ${simonSequence.value.length} 盏灯。`
  later(showSimonSequence, 650)
}

function pressSimon(pad) {
  if (!running.value || simonShowing.value) return
  simonActive.value = pad
  later(() => {
    if (simonActive.value === pad) simonActive.value = -1
  }, 150)
  if (simonSequence.value[simonInput.value] !== pad) {
    completeGame('顺序记错了', `你成功记住了 ${simonSequence.value.length - 1} 盏灯。`, score.value)
    return
  }
  simonInput.value += 1
  if (simonInput.value === simonSequence.value.length) nextSimonRound()
}

// 单词重组
const WORDS = [
  { answer: 'GAME', clue: '游戏' },
  { answer: 'PLAY', clue: '游玩' },
  { answer: 'APPLE', clue: '苹果' },
  { answer: 'TIGER', clue: '老虎' },
  { answer: 'MUSIC', clue: '音乐' },
  { answer: 'LIGHT', clue: '光线' },
  { answer: 'DREAM', clue: '梦想' },
  { answer: 'HAPPY', clue: '快乐' }
]
const wordRound = ref(1)
const wordAnswer = ref('')
const wordLetters = ref([])
const wordPicked = ref([])
const wordHint = ref('依次点击字母组成答案。')
let wordPool = []

function nextWord() {
  if (!wordPool.length) wordPool = shuffle(WORDS)
  const item = wordPool.pop()
  wordAnswer.value = item.answer
  wordLetters.value = shuffle([...item.answer].map((char, index) => ({ id: `${index}-${char}`, char, used: false })))
  wordPicked.value = []
  wordHint.value = `提示：${item.clue}`
}

function pickLetter(letter) {
  if (!running.value || letter.used) return
  letter.used = true
  wordPicked.value = [...wordPicked.value, letter]
}

function undoLetter() {
  if (!running.value || !wordPicked.value.length) return
  const next = wordPicked.value.slice()
  const last = next.pop()
  last.used = false
  wordPicked.value = next
}

function submitWord() {
  if (!running.value) return
  const answer = wordPicked.value.map((letter) => letter.char).join('')
  if (answer === wordAnswer.value) {
    score.value += 100 + wordAnswer.value.length * 18
    wordRound.value += 1
    if (wordRound.value > 8) {
      completeGame('单词达人！', '八组单词全部重组正确。', score.value)
      return
    }
    wordHint.value = '回答正确！下一题。'
    nextWord()
  } else {
    wordHint.value = '还没有拼对，可以撤回字母再试一次。'
  }
}

function resetWord() {
  wordRound.value = 1
  wordPool = []
  nextWord()
}

const tutorial = computed(() => ({
  'tic-tac-toe': '你执 X 先手。电脑会优先阻止你连线。',
  'connect-four': '你执红棋先手，点击任意一列投下棋子。',
  'lights-out': '所有灯熄灭即完成，步数越少分数越高。',
  'sliding-puzzle': '开局一定可解，点击空格相邻的数字移动。',
  'number-guess': '电脑会提示偏大或偏小，范围会越来越清晰。',
  'math-sprint': '乘法题最多两位数，不必担心离谱的大数计算。',
  'odd-one-out': '共十轮，答错只会扣一点分，不会中断挑战。',
  'simon-says': '先观察完整顺序，再开始依次点击。',
  'word-scramble': '点击字母后提交，拼错可以撤回重来。'
})[mode.value] || '')

const status = computed(() => {
  if (finished.value) return '挑战完成'
  if (!running.value) return '准备开始'
  if (mode.value === 'tic-tac-toe') return ticTurn.value === 'X' ? '轮到你' : '电脑思考'
  if (mode.value === 'connect-four') return connectTurn.value === 'red' ? '轮到你' : '电脑思考'
  if (mode.value === 'lights-out') return `${lightMoves.value} 步`
  if (mode.value === 'sliding-puzzle') return `${slidingSeconds.value}s`
  if (mode.value === 'number-guess') return `第 ${guessAttempts.value + 1} 次`
  if (mode.value === 'math-sprint') return `剩余 ${mathTime.value}s`
  if (mode.value === 'odd-one-out') return `第 ${oddRound.value}/10 轮`
  if (mode.value === 'simon-says') return `序列 ${simonSequence.value.length}`
  if (mode.value === 'word-scramble') return `第 ${wordRound.value}/8 题`
  return '挑战中'
})

function startGame() {
  beginSession()
  if (mode.value === 'tic-tac-toe') resetTic()
  else if (mode.value === 'connect-four') resetConnect()
  else if (mode.value === 'lights-out') resetLights()
  else if (mode.value === 'sliding-puzzle') {
    resetSliding()
    interval = setInterval(() => {
      if (!running.value) return
      slidingSeconds.value += 1
      score.value = Math.max(100, 1200 - slidingMoves.value * 10 - slidingSeconds.value * 2)
    }, 1000)
  } else if (mode.value === 'number-guess') resetNumberGuess()
  else if (mode.value === 'math-sprint') resetMath()
  else if (mode.value === 'odd-one-out') resetOdd()
  else if (mode.value === 'simon-says') resetSimon()
  else if (mode.value === 'word-scramble') resetWord()
}

onMounted(startGame)
onBeforeUnmount(clearTimers)
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="puzzle-pack">
      <p class="pack-tutorial">{{ tutorial }}</p>

      <section v-if="mode === 'tic-tac-toe'" class="pack-game">
        <div class="turn-line">
          <span>你 <b class="mark-x">X</b></span>
          <span>电脑 <b class="mark-o">O</b></span>
        </div>
        <div class="tic-board" aria-label="井字棋棋盘">
          <button
            v-for="(value, index) in ticBoard"
            :key="index"
            type="button"
            :class="{ 'is-x': value === 'X', 'is-o': value === 'O' }"
            :disabled="Boolean(value) || finished || ticTurn !== 'X'"
            @click="ticMove(index)"
          >
            {{ value }}
          </button>
        </div>
      </section>

      <section v-else-if="mode === 'connect-four'" class="pack-game">
        <div class="connect-board" :class="{ 'is-locked': connectTurn !== 'red' || finished }">
          <button
            v-for="(value, index) in connectBoard"
            :key="index"
            type="button"
            class="connect-cell"
            :class="{ 'is-red': value === 'red', 'is-yellow': value === 'yellow' }"
            :aria-label="`第 ${Math.floor(index / 7) + 1} 行第 ${(index % 7) + 1} 列`"
            @click="dropConnect(index % 7)"
          />
        </div>
        <p class="pack-hint">点击任意一列，棋子会自动落到最底部。</p>
      </section>

      <section v-else-if="mode === 'lights-out'" class="pack-game">
        <div class="lights-board" aria-label="关灯游戏棋盘">
          <button
            v-for="(value, index) in lights"
            :key="index"
            type="button"
            class="light-cell"
            :class="{ 'is-on': value }"
            :aria-label="value ? `第 ${index + 1} 盏灯亮着` : `第 ${index + 1} 盏灯已关闭`"
            :disabled="finished"
            @click="pressLight(index)"
          >
            <span>{{ value ? '💡' : '○' }}</span>
          </button>
        </div>
      </section>

      <section v-else-if="mode === 'sliding-puzzle'" class="pack-game">
        <div class="sliding-board" aria-label="数字华容道">
          <button
            v-for="(value, index) in sliding"
            :key="index"
            type="button"
            class="sliding-cell"
            :class="{ 'is-blank': value === 0 }"
            :aria-label="value ? `数字 ${value}` : '空格'"
            :disabled="value === 0 || finished"
            @click="slideTile(index)"
          >
            {{ value || '' }}
          </button>
        </div>
        <p class="pack-hint">步数 {{ slidingMoves }} · 用时 {{ slidingSeconds }} 秒</p>
      </section>

      <section v-else-if="mode === 'number-guess'" class="pack-game pack-form">
        <div class="guess-display">
          <span>已猜次数</span>
          <strong>{{ guessAttempts }}</strong>
        </div>
        <p>{{ guessHint }}</p>
        <form @submit.prevent="submitGuess">
          <input
            v-model="guessInput"
            type="number"
            inputmode="numeric"
            min="1"
            max="100"
            placeholder="输入 1-100"
            :disabled="finished"
          />
          <button type="submit" class="btn btn--primary" :disabled="finished">提交猜测</button>
        </form>
      </section>

      <section v-else-if="mode === 'math-sprint'" class="pack-game pack-form">
        <div class="math-clock" :class="{ 'is-low': mathTime <= 8 }">剩余 {{ mathTime }} 秒</div>
        <div class="math-question">{{ mathQuestion.text }}</div>
        <form @submit.prevent="submitMath">
          <input
            v-model="mathInput"
            type="number"
            inputmode="numeric"
            autocomplete="off"
            placeholder="输入答案"
            :disabled="finished"
            autofocus
          />
          <button type="submit" class="btn btn--primary" :disabled="finished">回答</button>
        </form>
        <p class="pack-hint">{{ mathHint }}</p>
      </section>

      <section v-else-if="mode === 'odd-one-out'" class="pack-game">
        <div class="odd-board">
          <button
            v-for="(color, index) in oddColors"
            :key="index"
            type="button"
            class="odd-cell"
            :style="{ background: color }"
            :aria-label="`第 ${index + 1} 号色块`"
            :disabled="finished"
            @click="pickOdd(index)"
          />
        </div>
        <p class="pack-hint">{{ oddHint }}</p>
      </section>

      <section v-else-if="mode === 'simon-says'" class="pack-game">
        <div class="simon-board">
          <button
            v-for="(pad, index) in PAD_COLORS"
            :key="pad.label"
            type="button"
            class="simon-pad"
            :class="{ 'is-active': simonActive === index }"
            :style="{ '--pad-color': pad.color }"
            :disabled="finished || simonShowing"
            @click="pressSimon(index)"
          >
            {{ pad.label }}
          </button>
        </div>
        <p class="pack-hint">{{ simonHint }}</p>
      </section>

      <section v-else-if="mode === 'word-scramble'" class="pack-game pack-form">
        <div class="word-clue">
          <span>第 {{ wordRound }} / 8 题</span>
          <strong>{{ wordHint }}</strong>
        </div>
        <div class="word-answer">{{ wordPicked.map((letter) => letter.char).join('') || '点击下方字母' }}</div>
        <div class="word-letters">
          <button
            v-for="letter in wordLetters"
            :key="letter.id"
            type="button"
            class="word-letter"
            :disabled="letter.used || finished"
            @click="pickLetter(letter)"
          >
            {{ letter.char }}
          </button>
        </div>
        <div class="word-actions">
          <button type="button" class="btn btn--ghost" :disabled="!wordPicked.length || finished" @click="undoLetter">
            撤回
          </button>
          <button type="button" class="btn btn--primary" :disabled="wordPicked.length !== wordAnswer.length || finished" @click="submitWord">
            提交答案
          </button>
        </div>
      </section>

      <div v-if="finished" class="pack-result">
        <span>🏁</span>
        <div>
          <h2>{{ resultTitle }}</h2>
          <p>{{ message }}</p>
        </div>
        <button type="button" class="btn btn--primary" @click="startGame">再玩一次</button>
      </div>
    </div>

    <template #actions>
      <button type="button" class="btn btn--ghost action-btn" @click="startGame">重新开始</button>
    </template>
  </GameShell>
</template>

<style scoped>
.puzzle-pack {
  width: min(100%, 560px);
  min-width: 0;
}

.pack-tutorial {
  margin-bottom: 15px;
  padding: 10px 13px;
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  background: #fff8d8;
  color: var(--ink-soft);
  font-size: 12px;
  line-height: 1.55;
}

.pack-game {
  display: grid;
  justify-items: center;
  gap: 13px;
}

.turn-line {
  display: flex;
  gap: 20px;
  font-size: 12px;
}

.turn-line b {
  display: inline-grid;
  place-items: center;
  width: 27px;
  height: 27px;
  border: 1.5px solid var(--ink);
  border-radius: 8px;
}

.mark-x {
  background: #ffe4df;
  color: var(--coral-dark);
}

.mark-o {
  background: #e3f1ff;
  color: #236dbe;
}

.tic-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  width: min(100%, 330px);
  padding: 11px;
  border: 2px solid var(--ink);
  border-radius: 20px;
  background: #dff9f3;
  box-shadow: 5px 5px 0 var(--ink);
}

.tic-board button {
  display: grid;
  place-items: center;
  min-width: 0;
  aspect-ratio: 1;
  border: 1.5px solid var(--ink);
  border-radius: 14px;
  background: #fff;
  color: var(--ink);
  font-size: clamp(34px, 10vw, 56px);
  font-weight: 1000;
  transition: background 0.16s ease, transform 0.12s ease;
}

.tic-board button:active:not(:disabled) {
  transform: scale(0.94);
}

.tic-board button.is-x {
  background: #ffe4df;
  color: var(--coral-dark);
}

.tic-board button.is-o {
  background: #e3f1ff;
  color: #236dbe;
}

.connect-board {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  width: min(100%, 480px);
  padding: 9px;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #2357a8;
  box-shadow: 5px 5px 0 var(--ink);
}

.connect-board.is-locked {
  cursor: wait;
}

.connect-cell {
  aspect-ratio: 1;
  min-width: 0;
  border: 1.5px solid rgba(24, 35, 47, 0.5);
  border-radius: 50%;
  background: #fff9e8;
  box-shadow: inset 0 -3px 0 rgba(24, 35, 47, 0.15);
}

.connect-cell.is-red {
  background: #ff6554;
  box-shadow: inset 0 -4px 0 #b7372e;
}

.connect-cell.is-yellow {
  background: #ffd43b;
  box-shadow: inset 0 -4px 0 #c6920c;
}

.lights-board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
  width: min(100%, 360px);
  padding: 10px;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #1d2740;
  box-shadow: 5px 5px 0 var(--ink);
}

.light-cell {
  display: grid;
  place-items: center;
  min-width: 0;
  aspect-ratio: 1;
  border: 1.5px solid #0b1120;
  border-radius: 12px;
  background: #38445c;
  color: #9aa6bb;
  font-size: clamp(18px, 5vw, 27px);
}

.light-cell.is-on {
  background: #ffd43b;
  color: #7f5100;
  box-shadow: 0 0 18px rgba(255, 212, 59, 0.68);
}

.sliding-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: min(100%, 340px);
  padding: 10px;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #245e92;
  box-shadow: 5px 5px 0 var(--ink);
}

.sliding-cell {
  display: grid;
  place-items: center;
  min-width: 0;
  aspect-ratio: 1;
  border: 1.5px solid var(--ink);
  border-radius: 13px;
  background: #fff8de;
  font-size: clamp(26px, 8vw, 42px);
  font-weight: 1000;
}

.sliding-cell.is-blank {
  border-color: transparent;
  background: rgba(255, 255, 255, 0.12);
}

.pack-form {
  width: min(100%, 440px);
  margin-inline: auto;
}

.pack-form > p {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.pack-form form {
  display: flex;
  gap: 8px;
  width: 100%;
}

.pack-form input {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 0 13px;
  border: 2px solid var(--ink);
  border-radius: 13px;
  outline: 0;
  background: #fff;
  font-size: 17px;
  font-weight: 800;
}

.pack-form input:focus {
  box-shadow: 0 0 0 3px rgba(75, 139, 244, 0.25);
}

.guess-display,
.math-clock {
  padding: 8px 16px;
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  background: #dff9f3;
  text-align: center;
}

.guess-display span,
.guess-display strong {
  display: block;
}

.guess-display span {
  color: var(--muted);
  font-size: 10px;
}

.guess-display strong {
  font-size: 27px;
}

.math-clock {
  background: #fff4b8;
  font-weight: 900;
}

.math-clock.is-low {
  background: #ffe1dc;
  color: var(--coral-dark);
}

.math-question {
  font-size: clamp(36px, 10vw, 56px);
  font-weight: 1000;
  letter-spacing: -0.04em;
}

.odd-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: min(100%, 430px);
  padding: 10px;
  border: 2px solid var(--ink);
  border-radius: 17px;
  background: #fff;
  box-shadow: 5px 5px 0 var(--ink);
}

.odd-cell {
  min-width: 0;
  aspect-ratio: 1;
  border: 1px solid rgba(24, 35, 47, 0.25);
  border-radius: 10px;
}

.odd-cell:active {
  transform: scale(0.94);
}

.simon-board {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: min(100%, 350px);
}

.simon-pad {
  min-width: 0;
  aspect-ratio: 1.3;
  border: 2px solid var(--ink);
  border-radius: 20px;
  background: color-mix(in srgb, var(--pad-color) 70%, white);
  box-shadow: 4px 4px 0 var(--ink);
  color: var(--ink);
  font-size: 20px;
  font-weight: 1000;
  opacity: 0.62;
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.simon-pad.is-active {
  background: var(--pad-color);
  opacity: 1;
  transform: scale(1.04);
}

.word-clue {
  display: grid;
  justify-items: center;
  gap: 4px;
}

.word-clue span {
  color: var(--muted);
  font-size: 11px;
}

.word-clue strong {
  font-size: 17px;
}

.word-answer {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 66px;
  padding: 8px 12px;
  border: 2px dashed var(--ink);
  border-radius: 15px;
  background: #fff8de;
  font-size: clamp(25px, 8vw, 38px);
  font-weight: 1000;
  letter-spacing: 0.12em;
  overflow-wrap: anywhere;
}

.word-letters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.word-letter {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border: 2px solid var(--ink);
  border-radius: 12px;
  background: var(--sun);
  box-shadow: 3px 3px 0 var(--ink);
  font-size: 20px;
  font-weight: 1000;
}

.word-letter:disabled {
  background: #e5e0d2;
  opacity: 0.5;
}

.word-actions {
  display: flex;
  width: 100%;
  gap: 8px;
}

.word-actions .btn {
  flex: 1;
}

.pack-hint {
  color: var(--muted);
  font-size: 11px;
  text-align: center;
}

.pack-result {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 17px;
  padding: 13px;
  border: 2px solid var(--ink);
  border-radius: 16px;
  background: #dff9f3;
}

.pack-result > span {
  font-size: 33px;
}

.pack-result > div {
  min-width: 0;
  flex: 1;
}

.pack-result h2 {
  font-size: 18px;
}

.pack-result p {
  color: var(--muted);
  font-size: 11px;
}

.action-btn {
  width: 100%;
}

@media (max-width: 520px) {
  .connect-board {
    gap: 3px;
    padding: 7px;
  }

  .lights-board,
  .odd-board {
    gap: 6px;
    padding: 8px;
  }

  .pack-form form {
    align-items: stretch;
    flex-direction: column;
  }

  .pack-form form .btn {
    width: 100%;
  }

  .pack-result {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .pack-result .btn {
    width: 100%;
  }
}
</style>
