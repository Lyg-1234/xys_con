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
let frameId = null

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
  if (frameId) cancelAnimationFrame(frameId)
  frameId = null
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

// 色彩陷阱
const STROOP_COLORS = [
  { name: '红', value: '#e84f45' },
  { name: '蓝', value: '#377bd1' },
  { name: '黄', value: '#d8a400' },
  { name: '绿', value: '#15966f' },
  { name: '紫', value: '#7d55c7' }
]
const stroopWord = ref('红')
const stroopInk = ref(STROOP_COLORS[0])
const stroopTime = ref(30)
const stroopStreak = ref(0)
const stroopHint = ref('选择文字实际显示的颜色。')

function nextStroop() {
  const word = STROOP_COLORS[Math.floor(Math.random() * STROOP_COLORS.length)]
  const choices = STROOP_COLORS.filter((color) => color.name !== word.name)
  const ink = choices[Math.floor(Math.random() * choices.length)]
  stroopWord.value = word.name
  stroopInk.value = ink
}

function pickStroop(color) {
  if (!running.value) return
  if (color.name === stroopInk.value.name) {
    stroopStreak.value += 1
    score.value += 90 + stroopStreak.value * 10
    stroopHint.value = `正确！连续答对 ${stroopStreak.value} 题。`
    nextStroop()
  } else {
    stroopStreak.value = 0
    score.value = Math.max(0, score.value - 25)
    stroopHint.value = `这组文字显示的是${stroopInk.value.name}色。`
  }
}

function resetStroop() {
  stroopTime.value = 30
  stroopStreak.value = 0
  stroopHint.value = '选择文字实际显示的颜色。'
  nextStroop()
  interval = setInterval(() => {
    if (!running.value) return
    stroopTime.value -= 1
    if (stroopTime.value <= 0) {
      completeGame('时间到！', `本局获得 ${score.value} 分，最高连对 ${stroopStreak.value} 题。`, score.value)
    }
  }, 1000)
}

// 猜拳对决
const RPS_OPTIONS = [
  { id: 'rock', label: '石头', icon: '✊' },
  { id: 'paper', label: '布', icon: '✋' },
  { id: 'scissors', label: '剪刀', icon: '✌️' }
]
const rpsPlayer = ref(null)
const rpsComputer = ref(null)
const rpsWins = ref(0)
const rpsLosses = ref(0)
const rpsDraws = ref(0)
const rpsHint = ref('五局三胜，先选一个手势。')

function rpsResult(player, computer) {
  if (player.id === computer.id) return 'draw'
  if (
    (player.id === 'rock' && computer.id === 'scissors') ||
    (player.id === 'paper' && computer.id === 'rock') ||
    (player.id === 'scissors' && computer.id === 'paper')
  ) return 'win'
  return 'lose'
}

function playRps(option) {
  if (!running.value) return
  const computer = RPS_OPTIONS[Math.floor(Math.random() * RPS_OPTIONS.length)]
  const result = rpsResult(option, computer)
  rpsPlayer.value = option
  rpsComputer.value = computer
  if (result === 'win') {
    rpsWins.value += 1
    rpsHint.value = `${option.label} 胜过 ${computer.label}，这一局你赢了！`
  } else if (result === 'lose') {
    rpsLosses.value += 1
    rpsHint.value = `${option.label} 输给 ${computer.label}，下一局换换策略。`
  } else {
    rpsDraws.value += 1
    rpsHint.value = `双方都是${option.label}，这一局平手。`
  }
  score.value = rpsWins.value * 100 + rpsDraws.value * 20
  if (rpsWins.value >= 3) {
    completeGame('猜拳胜利！', `你以 ${rpsWins.value}:${rpsLosses.value} 赢下对决。`, 500 + rpsDraws.value * 20)
  } else if (rpsLosses.value >= 3) {
    completeGame('电脑赢了', `比分 ${rpsWins.value}:${rpsLosses.value}，再来一场扳回一城。`, 50)
  }
}

function resetRps() {
  rpsPlayer.value = null
  rpsComputer.value = null
  rpsWins.value = 0
  rpsLosses.value = 0
  rpsDraws.value = 0
  rpsHint.value = '五局三胜，先选一个手势。'
}

// 打地鼠
const moleActive = ref(-1)
const moleHits = ref(0)
const moleMisses = ref(0)
const moleTime = ref(30)

function showMole() {
  if (!running.value) return
  let next = Math.floor(Math.random() * 9)
  while (next === moleActive.value) next = Math.floor(Math.random() * 9)
  moleActive.value = next
}

function hitMole(index) {
  if (!running.value) return
  if (index === moleActive.value) {
    moleHits.value += 1
    score.value += 10
    moleActive.value = -1
  } else {
    moleMisses.value += 1
    score.value = Math.max(0, score.value - 2)
  }
}

function resetMole() {
  moleActive.value = -1
  moleHits.value = 0
  moleMisses.value = 0
  moleTime.value = 30
  showMole()
  interval = setInterval(() => {
    if (!running.value) return
    moleTime.value -= 1
    if (moleTime.value <= 0) {
      completeGame(
        '敲击结束！',
        `命中 ${moleHits.value} 次，脱靶 ${moleMisses.value} 次。`,
        Math.max(0, score.value)
      )
    }
  }, 1000)
  const spawn = () => {
    if (!running.value) return
    showMole()
    later(spawn, Math.max(480, 760 - moleHits.value * 7))
  }
  later(spawn, 760)
}

// 闪电反应
const reactionPhase = ref('idle')
const reactionRound = ref(0)
const reactionTimes = ref([])
const reactionText = ref('点击开始，测试你的反应速度。')
const reactionMessage = ref('看到绿色立即点击，千万别抢跑。')
let reactionStartedAt = 0

function startReactionRound() {
  if (!running.value) return
  reactionPhase.value = 'waiting'
  reactionText.value = '等待变绿…'
  reactionMessage.value = '现在不要点击，耐心等一等。'
  later(() => {
    if (!running.value || reactionPhase.value !== 'waiting') return
    reactionStartedAt = performance.now()
    reactionPhase.value = 'go'
    reactionText.value = '现在点击！'
    reactionMessage.value = '越快越好。'
  }, 1300 + Math.random() * 2800)
}

function reactionTap() {
  if (!running.value) return
  if (reactionPhase.value === 'waiting') {
    reactionPhase.value = 'too-soon'
    reactionText.value = '抢跑了'
    reactionMessage.value = '本轮不计入成绩，重新等待。'
    later(startReactionRound, 900)
    return
  }
  if (reactionPhase.value !== 'go') return
  const elapsed = Math.round(performance.now() - reactionStartedAt)
  reactionTimes.value = [...reactionTimes.value, elapsed]
  reactionRound.value += 1
  reactionPhase.value = 'result'
  reactionText.value = `${elapsed} ms`
  reactionMessage.value = `第 ${reactionRound.value} / 5 次完成。`
  if (reactionRound.value >= 5) {
    const average = Math.round(reactionTimes.value.reduce((sum, value) => sum + value, 0) / reactionTimes.value.length)
    const reactionScore = Math.max(100, 1500 - average * 3)
    completeGame('反应测试完成', `五次平均 ${average} ms，成绩已保存。`, reactionScore)
  } else {
    later(startReactionRound, 850)
  }
}

function resetReaction() {
  reactionPhase.value = 'idle'
  reactionRound.value = 0
  reactionTimes.value = []
  reactionText.value = '准备好了吗？'
  reactionMessage.value = '看到绿色立即点击，千万别抢跑。'
  later(startReactionRound, 450)
}

// 准星训练
const aimX = ref(50)
const aimY = ref(50)
const aimHits = ref(0)
const aimMisses = ref(0)
const aimTime = ref(20)

function moveAimTarget() {
  aimX.value = 8 + Math.random() * 84
  aimY.value = 10 + Math.random() * 80
}

function hitAim() {
  if (!running.value) return
  aimHits.value += 1
  score.value += 20
  moveAimTarget()
}

function missAim() {
  if (!running.value) return
  aimMisses.value += 1
  score.value = Math.max(0, score.value - 3)
}

function resetAim() {
  aimHits.value = 0
  aimMisses.value = 0
  aimTime.value = 20
  moveAimTarget()
  interval = setInterval(() => {
    if (!running.value) return
    aimTime.value -= 1
    if (aimTime.value <= 0) {
      completeGame('训练结束', `命中 ${aimHits.value} 次，脱靶 ${aimMisses.value} 次。`, score.value)
    }
  }, 1000)
}

// 打字冲刺
const TYPING_WORDS = [
  'game', 'pixel', 'joy', 'speed', 'color', 'dream', 'light', 'music',
  'tiger', 'apple', 'play', 'happy', 'rocket', 'magic', 'fresh', 'brain',
  'level', 'quick', 'focus', 'winner'
]
const typingWord = ref('game')
const typingInput = ref('')
const typingTime = ref(30)
const typingStreak = ref(0)
const typingHint = ref('输入单词后按回车提交。')

function nextTypingWord() {
  let next = typingWord.value
  while (next === typingWord.value) {
    next = TYPING_WORDS[Math.floor(Math.random() * TYPING_WORDS.length)]
  }
  typingWord.value = next
  typingInput.value = ''
}

function submitTyping() {
  if (!running.value) return
  if (typingInput.value.trim().toLowerCase() === typingWord.value) {
    typingStreak.value += 1
    score.value += typingWord.value.length * 12 + typingStreak.value * 8
    typingHint.value = `正确！连续答对 ${typingStreak.value} 个。`
    nextTypingWord()
  } else {
    typingStreak.value = 0
    typingHint.value = '拼写不对，检查字母后再试。'
    typingInput.value = ''
  }
}

function resetTyping() {
  typingWord.value = TYPING_WORDS[Math.floor(Math.random() * TYPING_WORDS.length)]
  typingInput.value = ''
  typingTime.value = 30
  typingStreak.value = 0
  typingHint.value = '输入单词后按回车提交。'
  interval = setInterval(() => {
    if (!running.value) return
    typingTime.value -= 1
    if (typingTime.value <= 0) {
      completeGame('打字结束！', `连续答对 ${typingStreak.value} 个，获得 ${score.value} 分。`, score.value)
    }
  }, 1000)
}

// 数字寻宝
const tapNumbers = ref([])
const tapNext = ref(1)
const tapSeconds = ref(0)
const tapWrong = ref(-1)
const tapHint = ref('从 1 开始，按顺序点击所有数字。')

function shuffle(items) {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function resetTapSequence() {
  tapNumbers.value = shuffle(Array.from({ length: 16 }, (_, index) => index + 1))
  tapNext.value = 1
  tapSeconds.value = 0
  tapWrong.value = -1
  tapHint.value = '从 1 开始，按顺序点击所有数字。'
  interval = setInterval(() => {
    if (!running.value) return
    tapSeconds.value += 1
    if (tapSeconds.value >= 30) {
      completeGame('时间到！', `你找到了 ${tapNext.value - 1} / 16 个数字。`, score.value)
    }
  }, 1000)
}

function tapNumber(number, index) {
  if (!running.value) return
  if (number === tapNext.value) {
    tapNext.value += 1
    score.value += 50
    tapHint.value = number === 16 ? '全部找齐！' : `下一个找 ${number + 1}。`
    if (number === 16) {
      const finalScore = Math.max(100, 1500 - tapSeconds.value * 25)
      completeGame('顺序全对！', `用时 ${tapSeconds.value} 秒完成数字寻宝。`, finalScore)
    }
  } else {
    tapWrong.value = index
    score.value = Math.max(0, score.value - 5)
    tapHint.value = `现在应该点击 ${tapNext.value}。`
    later(() => {
      if (tapWrong.value === index) tapWrong.value = -1
    }, 330)
  }
}

// 叠叠高
const stackBlocks = ref([])
const movingStack = ref({ x: 0, width: 100, direction: 1 })
const stackHint = ref('砖块移动时点击画面，让它们尽量对齐。')
const stackCanDrop = ref(false)
let lastFrameTime = 0

function resetStack() {
  stackBlocks.value = [{ x: 0, width: 100 }]
  movingStack.value = { x: 0, width: 100, direction: 1 }
  stackCanDrop.value = false
  stackHint.value = '砖块移动时点击画面，让它们尽量对齐。'
  lastFrameTime = performance.now()
  later(() => {
    if (running.value) stackCanDrop.value = true
  }, 320)
  if (frameId) cancelAnimationFrame(frameId)
  frameId = requestAnimationFrame(stackLoop)
}

function stackLoop(time) {
  if (!running.value || mode.value !== 'stack-tower') {
    frameId = null
    return
  }
  const delta = Math.min(40, time - lastFrameTime)
  lastFrameTime = time
  const speed = 0.052 + stackBlocks.value.length * 0.0028
  let nextX = movingStack.value.x + movingStack.value.direction * speed * delta
  let direction = movingStack.value.direction
  const maxX = 100 - movingStack.value.width
  if (nextX <= 0) {
    nextX = 0
    direction = 1
  } else if (nextX >= maxX) {
    nextX = maxX
    direction = -1
  }
  movingStack.value = { ...movingStack.value, x: nextX, direction }
  frameId = requestAnimationFrame(stackLoop)
}

function dropStack() {
  if (!running.value || mode.value !== 'stack-tower') return
  if (!stackCanDrop.value) return
  stackCanDrop.value = false
  const previous = stackBlocks.value[stackBlocks.value.length - 1]
  const moving = movingStack.value
  const left = Math.max(previous.x, moving.x)
  const right = Math.min(previous.x + previous.width, moving.x + moving.width)
  const overlap = right - left
  if (overlap <= 0.5) {
    completeGame('砖块掉下去了', `你成功叠起 ${stackBlocks.value.length - 1} 层。`, (stackBlocks.value.length - 1) * 100)
    return
  }
  stackBlocks.value = [...stackBlocks.value, { x: left, width: overlap }]
  score.value = (stackBlocks.value.length - 1) * 100
  if (stackBlocks.value.length >= 14) {
    completeGame('高塔落成！', `你连续叠起 ${stackBlocks.value.length - 1} 层，非常稳。`, 1600)
    return
  }
  movingStack.value = { x: 0, width: overlap, direction: 1 }
  stackHint.value = `第 ${stackBlocks.value.length} 层，宽度还剩 ${Math.round(overlap)}%。`
  later(() => {
    if (running.value) stackCanDrop.value = true
  }, 380)
}

const tutorial = computed(() => ({
  'color-match': '文字内容和文字颜色会故意冲突，只选择实际颜色。',
  'rock-paper-scissors': '五局三胜，比分达到 3 胜或 3 负时结束。',
  'whack-a-mole': '每敲中一次得 10 分，敲到空格会扣少量分数。',
  'reaction-test': '测试共五次，抢跑不会计入次数但要重新等待。',
  'aim-trainer': '目标会切换位置，命中越快越容易累积高分。',
  'typing-rush': '只比较英文拼写，大小写不影响结果。',
  'tap-sequence': '从 1 点到 16，点错数字不会重置进度。',
  'stack-tower': '越后出现的砖块移动越快，点击或按空格落下。'
})[mode.value] || '')

const status = computed(() => {
  if (finished.value) return '挑战完成'
  if (!running.value) return '准备开始'
  if (mode.value === 'color-match') return `${stroopTime.value}s`
  if (mode.value === 'rock-paper-scissors') return `${rpsWins.value}-${rpsLosses.value}`
  if (mode.value === 'whack-a-mole') return `${moleTime.value}s`
  if (mode.value === 'reaction-test') return `${reactionRound.value}/5`
  if (mode.value === 'aim-trainer') return `${aimTime.value}s`
  if (mode.value === 'typing-rush') return `${typingTime.value}s`
  if (mode.value === 'tap-sequence') return `${tapNext.value - 1}/16`
  if (mode.value === 'stack-tower') return `${stackBlocks.value.length - 1} 层`
  return '挑战中'
})

function onKeydown(event) {
  if (mode.value !== 'stack-tower' || event.key !== ' ') return
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
  event.preventDefault()
  dropStack()
}

function startGame() {
  beginSession()
  if (mode.value === 'color-match') resetStroop()
  else if (mode.value === 'rock-paper-scissors') resetRps()
  else if (mode.value === 'whack-a-mole') resetMole()
  else if (mode.value === 'reaction-test') resetReaction()
  else if (mode.value === 'aim-trainer') resetAim()
  else if (mode.value === 'typing-rush') resetTyping()
  else if (mode.value === 'tap-sequence') resetTapSequence()
  else if (mode.value === 'stack-tower') resetStack()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  startGame()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimers()
})
</script>

<template>
  <GameShell :game="game" :score="score" :best="best" :status="status">
    <div class="action-pack">
      <p class="pack-tutorial">{{ tutorial }}</p>

      <section v-if="mode === 'color-match'" class="pack-game stroop-game">
        <div class="stroop-word" :style="{ color: stroopInk.value }">{{ stroopWord }}</div>
        <p class="pack-hint">{{ stroopHint }}</p>
        <div class="stroop-options">
          <button
            v-for="color in STROOP_COLORS"
            :key="color.name"
            type="button"
            :style="{ '--choice-color': color.value }"
            :disabled="finished"
            @click="pickStroop(color)"
          >
            {{ color.name }}
          </button>
        </div>
      </section>

      <section v-else-if="mode === 'rock-paper-scissors'" class="pack-game rps-game">
        <div class="rps-scoreboard">
          <div><span>你</span><strong>{{ rpsWins }}</strong></div>
          <em>VS</em>
          <div><span>电脑</span><strong>{{ rpsLosses }}</strong></div>
        </div>
        <div class="rps-arena">
          <div>
            <span>{{ rpsPlayer?.icon || '❔' }}</span>
            <small>{{ rpsPlayer?.label || '等待出拳' }}</small>
          </div>
          <b>VS</b>
          <div>
            <span>{{ rpsComputer?.icon || '❔' }}</span>
            <small>{{ rpsComputer?.label || '等待出拳' }}</small>
          </div>
        </div>
        <p class="pack-hint">{{ rpsHint }}</p>
        <div class="rps-options">
          <button
            v-for="option in RPS_OPTIONS"
            :key="option.id"
            type="button"
            :disabled="finished"
            @click="playRps(option)"
          >
            <span>{{ option.icon }}</span>
            {{ option.label }}
          </button>
        </div>
      </section>

      <section v-else-if="mode === 'whack-a-mole'" class="pack-game">
        <div class="mole-meta">
          <span>命中 <b>{{ moleHits }}</b></span>
          <span>时间 <b>{{ moleTime }}s</b></span>
        </div>
        <div class="mole-board">
          <button
            v-for="index in 9"
            :key="index"
            type="button"
            class="mole-hole"
            :class="{ 'is-active': moleActive === index - 1 }"
            :aria-label="moleActive === index - 1 ? '地鼠出现了' : '空地洞'"
            :disabled="finished"
            @click="hitMole(index - 1)"
          >
            <span>{{ moleActive === index - 1 ? '🐹' : '' }}</span>
          </button>
        </div>
      </section>

      <section v-else-if="mode === 'reaction-test'" class="pack-game reaction-game">
        <div class="reaction-dots">
          <i v-for="index in 5" :key="index" :class="{ 'is-done': index <= reactionTimes.length }" />
        </div>
        <button
          type="button"
          class="reaction-pad"
          :class="`is-${reactionPhase}`"
          :disabled="finished"
          @click="reactionTap"
        >
          <span>{{ reactionText }}</span>
          <strong>{{ reactionMessage }}</strong>
        </button>
      </section>

      <section v-else-if="mode === 'aim-trainer'" class="pack-game">
        <div class="aim-meta">
          <span>命中 <b>{{ aimHits }}</b></span>
          <span>时间 <b>{{ aimTime }}s</b></span>
        </div>
        <div class="aim-field" @click="missAim">
          <button
            type="button"
            class="aim-target"
            :style="{ left: `${aimX}%`, top: `${aimY}%` }"
            :disabled="finished"
            aria-label="点击目标"
            @click.stop="hitAim"
          >
            <span />
          </button>
        </div>
      </section>

      <section v-else-if="mode === 'typing-rush'" class="pack-game typing-game">
        <div class="typing-clock" :class="{ 'is-low': typingTime <= 8 }">剩余 {{ typingTime }} 秒</div>
        <div class="typing-word">{{ typingWord }}</div>
        <form @submit.prevent="submitTyping">
          <input
            v-model="typingInput"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="输入上方单词"
            :disabled="finished"
            autofocus
          />
          <button type="submit" class="btn btn--primary" :disabled="finished">提交</button>
        </form>
        <p class="pack-hint">{{ typingHint }}</p>
      </section>

      <section v-else-if="mode === 'tap-sequence'" class="pack-game">
        <div class="tap-meta">
          <span>下一个 <b>{{ tapNext }}</b></span>
          <span>用时 <b>{{ tapSeconds }}s</b></span>
        </div>
        <div class="tap-board">
          <button
            v-for="(number, index) in tapNumbers"
            :key="number"
            type="button"
            :class="{ 'is-done': number < tapNext, 'is-wrong': tapWrong === index }"
            :disabled="number < tapNext || finished"
            @click="tapNumber(number, index)"
          >
            {{ number }}
          </button>
        </div>
        <p class="pack-hint">{{ tapHint }}</p>
      </section>

      <section v-else-if="mode === 'stack-tower'" class="pack-game">
        <div class="stack-field" @click="dropStack">
          <div
            v-for="(block, index) in stackBlocks"
            :key="`${index}-${block.x}-${block.width}`"
            class="stack-block"
            :style="{ left: `${block.x}%`, width: `${block.width}%`, bottom: `${index * 23}px` }"
          />
          <div
            v-if="!finished"
            class="stack-block is-moving"
            :style="{
              left: `${movingStack.x}%`,
              width: `${movingStack.width}%`,
              bottom: `${stackBlocks.length * 23}px`
            }"
          />
        </div>
        <p class="pack-hint">{{ stackHint }}</p>
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
.action-pack {
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
  gap: 14px;
  width: 100%;
}

.pack-hint {
  color: var(--muted);
  font-size: 11px;
  line-height: 1.55;
  text-align: center;
}

.stroop-word {
  display: grid;
  place-items: center;
  width: min(100%, 330px);
  min-height: 150px;
  border: 2px solid var(--ink);
  border-radius: 24px;
  background: #fff;
  box-shadow: 6px 6px 0 var(--ink);
  font-size: clamp(76px, 23vw, 120px);
  font-weight: 1000;
  line-height: 1;
  text-shadow: 3px 3px 0 #f1ede3;
}

.stroop-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
}

.stroop-options button {
  min-width: 0;
  min-height: 54px;
  border: 2px solid var(--ink);
  border-radius: 13px;
  background: color-mix(in srgb, var(--choice-color) 18%, white);
  box-shadow: 3px 3px 0 var(--ink);
  font-size: 14px;
  font-weight: 1000;
}

.stroop-options button:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--ink);
}

.rps-scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.rps-scoreboard div {
  min-width: 92px;
  padding: 7px 12px;
  border: 1.5px solid var(--ink);
  border-radius: 13px;
  background: #fff;
  text-align: center;
}

.rps-scoreboard span,
.rps-scoreboard strong {
  display: block;
}

.rps-scoreboard span {
  color: var(--muted);
  font-size: 10px;
}

.rps-scoreboard strong {
  font-size: 28px;
}

.rps-scoreboard em {
  color: var(--muted);
  font-size: 12px;
  font-style: normal;
  font-weight: 1000;
}

.rps-arena {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  width: min(100%, 360px);
}

.rps-arena > div {
  display: grid;
  justify-items: center;
  min-width: 0;
  padding: 12px;
  border: 2px solid var(--ink);
  border-radius: 18px;
  background: #fff8dd;
}

.rps-arena > div span {
  font-size: clamp(44px, 13vw, 70px);
  line-height: 1.15;
}

.rps-arena small {
  color: var(--muted);
  font-size: 10px;
}

.rps-arena > b {
  color: var(--coral-dark);
  font-size: 15px;
}

.rps-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.rps-options button {
  display: grid;
  justify-items: center;
  min-width: 0;
  min-height: 72px;
  padding: 8px 5px;
  border: 2px solid var(--ink);
  border-radius: 15px;
  background: #fff;
  box-shadow: 3px 3px 0 var(--ink);
  font-size: 12px;
  font-weight: 900;
}

.rps-options button span {
  font-size: 29px;
}

.mole-meta,
.tap-meta,
.aim-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.mole-meta span,
.tap-meta span,
.aim-meta span {
  padding: 5px 11px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  font-size: 10px;
  font-weight: 800;
}

.mole-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  width: min(100%, 400px);
  padding: 12px;
  border: 2px solid var(--ink);
  border-radius: 22px;
  background: #b9854e;
  box-shadow: 6px 6px 0 var(--ink);
}

.mole-hole {
  display: grid;
  place-items: center;
  min-width: 0;
  aspect-ratio: 1.12;
  overflow: hidden;
  border: 2px solid #5d3b22;
  border-radius: 50%;
  background: radial-gradient(ellipse at 50% 70%, #39271d 0 43%, #6c452b 44% 64%, #d6a16a 65%);
}

.mole-hole span {
  margin-top: 24%;
  font-size: clamp(28px, 9vw, 46px);
  transform: translateY(120%);
  transition: transform 0.12s ease;
}

.mole-hole.is-active span {
  transform: translateY(0);
}

.reaction-dots {
  display: flex;
  gap: 8px;
}

.reaction-dots i {
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--ink);
  border-radius: 50%;
  background: #fff;
}

.reaction-dots i.is-done {
  background: var(--mint);
}

.reaction-pad {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 8px;
  width: min(100%, 430px);
  min-height: 290px;
  padding: 24px;
  border: 2px solid var(--ink);
  border-radius: 24px;
  background: #ffe4dc;
  box-shadow: 6px 6px 0 var(--ink);
  text-align: center;
  transition: background 0.08s ease;
}

.reaction-pad.is-waiting {
  background: #e8e3d7;
}

.reaction-pad.is-go {
  background: #52d9a7;
}

.reaction-pad.is-too-soon {
  background: #ff9f95;
}

.reaction-pad span {
  font-size: clamp(35px, 10vw, 54px);
  font-weight: 1000;
}

.reaction-pad strong {
  max-width: 290px;
  color: rgba(24, 35, 47, 0.7);
  font-size: 12px;
}

.aim-field {
  position: relative;
  width: min(100%, 500px);
  aspect-ratio: 1.18;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 20px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.25) 1px, transparent 1px),
    #4a9ed0;
  background-size: 36px 36px;
  box-shadow: 6px 6px 0 var(--ink);
}

.aim-target {
  position: absolute;
  display: grid;
  place-items: center;
  width: clamp(62px, 18vw, 78px);
  aspect-ratio: 1;
  border: 3px solid var(--ink);
  border-radius: 50%;
  background: var(--coral);
  box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.32), 4px 4px 0 rgba(24, 35, 47, 0.72);
  transform: translate(-50%, -50%);
}

.aim-target span {
  width: 36%;
  aspect-ratio: 1;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--sun);
}

.typing-clock {
  padding: 5px 13px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: #fff4b8;
  font-size: 11px;
  font-weight: 900;
}

.typing-clock.is-low {
  background: #ffe2dc;
  color: var(--coral-dark);
}

.typing-word {
  padding: 17px 10px;
  color: #3a3c9c;
  font-size: clamp(40px, 12vw, 64px);
  font-weight: 1000;
  letter-spacing: 0.04em;
  line-height: 1;
  overflow-wrap: anywhere;
}

.typing-game form {
  display: flex;
  gap: 8px;
  width: 100%;
}

.typing-game input {
  min-width: 0;
  min-height: 50px;
  flex: 1;
  padding: 0 13px;
  border: 2px solid var(--ink);
  border-radius: 13px;
  outline: 0;
  background: #fff;
  font-size: 18px;
  font-weight: 800;
}

.typing-game input:focus {
  box-shadow: 0 0 0 3px rgba(75, 139, 244, 0.24);
}

.tap-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: min(100%, 430px);
  padding: 10px;
  border: 2px solid var(--ink);
  border-radius: 20px;
  background: #c6f2ec;
  box-shadow: 5px 5px 0 var(--ink);
}

.tap-board button {
  display: grid;
  place-items: center;
  min-width: 0;
  aspect-ratio: 1;
  border: 1.5px solid var(--ink);
  border-radius: 13px;
  background: #fff;
  box-shadow: 2px 2px 0 var(--ink);
  font-size: clamp(18px, 5vw, 25px);
  font-weight: 1000;
}

.tap-board button.is-done {
  background: #b9e8df;
  color: rgba(24, 35, 47, 0.38);
  box-shadow: none;
}

.tap-board button.is-wrong {
  background: #ff8176;
}

.stack-field {
  position: relative;
  width: min(100%, 520px);
  height: 390px;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 20px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.11) 1px, transparent 1px),
    linear-gradient(#28455e, #172c3d);
  background-size: 29px 29px;
  box-shadow: 6px 6px 0 var(--ink);
  cursor: pointer;
  touch-action: manipulation;
}

.stack-block {
  position: absolute;
  height: 20px;
  border: 1.5px solid var(--ink);
  border-radius: 5px;
  background: #f2a84a;
  box-shadow: inset 0 3px 0 rgba(255, 255, 255, 0.27), inset 0 -3px 0 rgba(0, 0, 0, 0.18);
}

.stack-block.is-moving {
  background: #ff6860;
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
  .stroop-options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .aim-field {
    aspect-ratio: 1;
  }

  .typing-game form {
    align-items: stretch;
    flex-direction: column;
  }

  .typing-game form .btn {
    width: 100%;
  }

  .stack-field {
    height: 350px;
  }

  .pack-result {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .pack-result .btn {
    width: 100%;
  }
}

@media (max-width: 350px) {
  .mole-board {
    gap: 6px;
    padding: 8px;
  }

  .tap-board {
    gap: 5px;
    padding: 7px;
  }
}
</style>
