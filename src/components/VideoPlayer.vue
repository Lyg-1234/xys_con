<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import DanmakuLayer from './DanmakuLayer.vue'
import { QUALITY_LIST, orderSources, sourceQualityKey } from '@/data/videos'
import { clamp, formatDuration } from '@/utils/format'
import { toast } from '@/composables/useToast'

const props = defineProps({
  srcs: { type: Array, required: true },
  poster: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  startTime: { type: Number, default: 0 },
  quality: { type: String, default: '1080p' },
  speed: { type: Number, default: 1 },
  volume: { type: Number, default: 0.8 },
  muted: { type: Boolean, default: false },
  autoplay: { type: Boolean, default: true },
  theater: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
  danmaku: { type: Boolean, default: true },
  dmkOpacity: { type: Number, default: 0.85 },
  dmkSize: { type: String, default: 'md' },
  dmkArea: { type: String, default: 'half' },
  sourcePage: { type: String, default: '' },
  fallbackLinks: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'ended',
  'progress',
  'update:quality',
  'update:speed',
  'update:volume',
  'update:muted',
  'update:theater',
  'update:danmaku',
  'next',
  'back'
])

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const videoEl = ref(null)
const rootEl = ref(null)
const trackEl = ref(null)
const volEl = ref(null)
const dmkRef = ref(null)

const failedIndex = ref(0)
const playing = ref(false)
const waiting = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const bufferedEnd = ref(0)
const errorText = ref('')
const autoplayBlocked = ref(false)
const loadingText = ref('')

const uiVisible = ref(true)
const dragging = ref(false)
const dragRatio = ref(0)
const hoverRatio = ref(0)
const fullscreen = ref(false)
const qualityMenu = ref(false)
const speedMenu = ref(false)
const dmkOpen = ref(false)
const dmkText = ref('')
const flash = ref('')

const intentPlay = ref(!!props.autoplay)

let hideTimer = null
let flashTimer = null
let lastReport = 0
let loadTimer = null
let stallTimer = null
let watchdogTimer = null
let loadingSince = 0
let lastProgressAt = 0
let pendingResume = 0

const LOAD_TIMEOUT = 12000
const STALL_TIMEOUT = 16000

const sourceKey = computed(() => props.srcs.join('|'))
const orderedSrcs = computed(() => orderSources(props.srcs, props.quality))
const currentSrc = computed(
  () => orderedSrcs.value[Math.min(failedIndex.value, Math.max(0, orderedSrcs.value.length - 1))] || ''
)
const isMuted = computed(() => props.muted || props.volume <= 0)
const qualityLabel = computed(() => {
  const detected = sourceQualityKey(currentSrc.value)
  if (detected === 'original') return '原画'
  const hit = QUALITY_LIST.find((q) => q.key === detected)
  return hit ? hit.label.split(' ')[0] : '自动'
})

const playedPct = computed(() => {
  if (dragging.value) return dragRatio.value * 100
  if (!duration.value) return 0
  return clamp((currentTime.value / duration.value) * 100, 0, 100)
})

const bufferPct = computed(() => {
  if (!duration.value) return 0
  return clamp((bufferedEnd.value / duration.value) * 100, 0, 100)
})

const tipRatio = computed(() => (dragging.value ? dragRatio.value : hoverRatio.value))
const tipText = computed(() => {
  if (!duration.value) return '00:00'
  return formatDuration(tipRatio.value * duration.value)
})
const showUI = computed(() => uiVisible.value || !playing.value)

function showFlash(text) {
  flash.value = text
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => {
    flash.value = ''
  }, 800)
}

function reportProgress(force = false) {
  if (!duration.value) return
  const now = Date.now()
  if (!force && now - lastReport < 4000) return
  lastReport = now
  emit('progress', { currentTime: currentTime.value, duration: duration.value })
}

function clearLoadTimer() {
  if (loadTimer) clearTimeout(loadTimer)
  loadTimer = null
}

function clearStallTimer() {
  if (stallTimer) clearTimeout(stallTimer)
  stallTimer = null
}

function clearPlaybackTimers() {
  clearLoadTimer()
  clearStallTimer()
}

function armLoadTimeout() {
  clearLoadTimer()
  loadingSince = Date.now()
  loadTimer = setTimeout(() => {
    const el = videoEl.value
    if (!el || errorText.value || !intentPlay.value) return
    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA || currentTime.value > 0) return
    tryNextSource('线路响应超时')
  }, LOAD_TIMEOUT)
}

function armStallTimeout() {
  clearStallTimer()
  if (!intentPlay.value || errorText.value) return
  if (!loadingSince) loadingSince = Date.now()
  stallTimer = setTimeout(() => {
    const el = videoEl.value
    if (!el || errorText.value || !intentPlay.value || el.paused || el.ended) return
    if (!waiting.value) return
    tryNextSource('播放缓冲超时')
  }, STALL_TIMEOUT)
}

function finishWithError(message) {
  clearPlaybackTimers()
  playing.value = false
  waiting.value = false
  loadingText.value = ''
  errorText.value = message
}

function tryNextSource(reason = '当前线路不可用') {
  const el = videoEl.value
  if (!orderedSrcs.value.length) {
    finishWithError('当前内容暂无可播放地址')
    return
  }
  if (failedIndex.value >= orderedSrcs.value.length - 1) {
    finishWithError('所有可用线路均加载失败，请稍后重试或前往正版平台')
    return
  }

  const resume = Number.isFinite(el?.currentTime) ? el.currentTime : currentTime.value
  failedIndex.value += 1
  currentTime.value = resume
  showFlash(`${reason}，正在切换备用线路`)
  applySource(resume, true)
}

function tryPlay() {
  const el = videoEl.value
  if (!el || errorText.value) return
  intentPlay.value = true
  const p = el.play()
  if (p && typeof p.catch === 'function') {
    p.catch((error) => {
      if (error?.name === 'AbortError') return
      playing.value = false
      if (error?.name === 'NotAllowedError') {
        intentPlay.value = false
        autoplayBlocked.value = true
      } else if (error?.name === 'NotSupportedError' && !errorText.value) {
        tryNextSource('浏览器不支持当前编码')
      }
    })
  }
}

function togglePlay() {
  const el = videoEl.value
  if (!el || errorText.value) return
  if (el.paused) {
    tryPlay()
  } else {
    intentPlay.value = false
    el.pause()
  }
}

function pauseVideo() {
  const el = videoEl.value
  if (el && !el.paused) {
    intentPlay.value = false
    el.pause()
  }
}

function seekTo(seconds) {
  const el = videoEl.value
  if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return
  const target = clamp(seconds, 0, Math.max(0, el.duration - 0.3))
  el.currentTime = target
  currentTime.value = target
}

function seekBy(delta) {
  const base = videoEl.value?.currentTime || currentTime.value || 0
  seekTo(base + delta)
  showFlash(`${delta > 0 ? '快进' : '快退'} ${Math.abs(delta)} 秒`)
}

function applySource(resumeAt) {
  const el = videoEl.value
  if (!el) return
  clearPlaybackTimers()
  const src = currentSrc.value
  if (!src) {
    finishWithError('当前内容暂无可播放地址')
    return
  }
  const target = clamp(Number.isFinite(resumeAt) ? resumeAt : 0, 0, 1e6)
  pendingResume = target
  playing.value = false
  waiting.value = true
  errorText.value = ''
  loadingText.value = `正在加载线路 ${failedIndex.value + 1}/${orderedSrcs.value.length}`
  el.pause()
  el.src = src
  el.playbackRate = props.speed
  el.volume = props.volume
  el.muted = props.muted
  try {
    el.load()
  } catch (e) {
    /* 部分浏览器 load 可能抛错，忽略 */
  }
  armLoadTimeout()
}

watch(sourceKey, () => {
  failedIndex.value = 0
  currentTime.value = 0
  duration.value = 0
  bufferedEnd.value = 0
  intentPlay.value = props.autoplay
  applySource(props.startTime)
})

watch(
  () => props.quality,
  () => {
    const el = videoEl.value
    if (!el) return
    const next = orderedSrcs.value[Math.min(failedIndex.value, orderedSrcs.value.length - 1)]
    if (!next || next === el.currentSrc) return
    failedIndex.value = 0
    applySource(currentTime.value)
  }
)

watch(
  () => props.autoplay,
  (v) => {
    if (v && videoEl.value?.paused && !waiting.value && !errorText.value) tryPlay()
  }
)

watch(
  () => props.startTime,
  (v) => {
    if (v > 0 && duration.value > v + 1 && Math.abs(currentTime.value - v) > 2) seekTo(v)
  }
)

watch(
  () => props.speed,
  (v) => {
    if (videoEl.value) videoEl.value.playbackRate = v
  }
)

watch(
  () => props.volume,
  (v) => {
    if (videoEl.value) videoEl.value.volume = v
  }
)

watch(
  () => props.muted,
  (v) => {
    if (videoEl.value) videoEl.value.muted = v
  }
)

/* ---------------- 媒体事件 ---------------- */
function onLoadedMetadata(e) {
  const el = e.target
  duration.value = Number.isFinite(el.duration) ? el.duration : 0
  if (pendingResume > 0 && duration.value > pendingResume + 1) {
    seekTo(pendingResume)
  }
  pendingResume = 0
  if (waiting.value) armStallTimeout()
  if (intentPlay.value) tryPlay()
}

function onTimeUpdate(e) {
  const el = e.target
  if (!dragging.value) currentTime.value = el.currentTime
  lastProgressAt = Date.now()
  waiting.value = false
  clearLoadTimer()
  clearStallTimer()
  reportProgress()
}

function onProgress(e) {
  const el = e.target
  if (el.buffered && el.buffered.length) {
    bufferedEnd.value = el.buffered.end(el.buffered.length - 1)
  }
}

function onPlay() {
  playing.value = true
  intentPlay.value = true
  autoplayBlocked.value = false
  lastProgressAt = Date.now()
}

function onPause() {
  playing.value = false
  clearStallTimer()
  reportProgress(true)
}

function onCanPlay() {
  waiting.value = false
  loadingText.value = ''
  clearLoadTimer()
  clearStallTimer()
}

function onPlaying() {
  waiting.value = false
  loadingText.value = ''
  autoplayBlocked.value = false
  lastProgressAt = Date.now()
  clearLoadTimer()
  clearStallTimer()
}

function onWaiting() {
  if (!intentPlay.value || errorText.value) return
  waiting.value = true
  loadingText.value = '网络缓冲中，长时间无响应会自动换源'
  armStallTimeout()
}

function onEnded() {
  playing.value = false
  reportProgress(true)
  emit('ended')
}

function onError() {
  tryNextSource('片源加载失败')
}

function retry() {
  failedIndex.value = 0
  errorText.value = ''
  intentPlay.value = true
  applySource(currentTime.value)
}

/* ---------------- 音量 ---------------- */
function setVolume(v) {
  const val = clamp(v, 0, 1)
  if (val > 0 && props.muted) emit('update:muted', false)
  emit('update:volume', val)
}

function toggleMute() {
  emit('update:muted', !props.muted)
}

function volRatio(e) {
  const el = volEl.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  if (!rect.width) return 0
  return clamp((e.clientX - rect.left) / rect.width, 0, 1)
}

function onVolDown(e) {
  setVolume(volRatio(e))
  const move = (ev) => setVolume(volRatio(ev))
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  if (e.preventDefault) e.preventDefault()
}

/* ---------------- 菜单 ---------------- */
function pickQuality(key) {
  qualityMenu.value = false
  if (key === props.quality) return
  const next = orderSources(props.srcs, key)[0]
  const detected = sourceQualityKey(next)
  emit('update:quality', key)
  const hit = QUALITY_LIST.find((q) => q.key === key)
  if (detected === key || detected === 'original') {
    toast(`已切换至「${hit ? hit.label : key}」`)
  } else {
    toast('当前片源没有该清晰度，已使用可用的最高画质')
  }
}

function pickSpeed(v) {
  speedMenu.value = false
  emit('update:speed', v)
}

function toggleDmkPanel() {
  dmkOpen.value = !dmkOpen.value
  if (dmkOpen.value) poke()
}

/* ---------------- 全屏 ---------------- */
function enterFs(el) {
  if (el.requestFullscreen) return el.requestFullscreen()
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen()
  if (el.webkitEnterFullscreen) return el.webkitEnterFullscreen()
  return Promise.reject(new Error('unsupported'))
}

function exitFs() {
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
  }
}

function toggleFullscreen() {
  if (fullscreen.value) {
    exitFs()
  } else if (rootEl.value) {
    enterFs(rootEl.value).catch(() => toast('当前环境不支持网页全屏'))
  }
}

function onFsChange() {
  fullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement)
  document.documentElement.classList.toggle('vp-fs-lock', fullscreen.value)
}

/* ---------------- 控制条显隐 ---------------- */
function poke() {
  uiVisible.value = true
  if (hideTimer) clearTimeout(hideTimer)
  if (playing.value) {
    hideTimer = setTimeout(() => {
      if (playing.value && !dragging.value && !dmkOpen.value) uiVisible.value = false
    }, 2800)
  }
}

watch(playing, (v) => {
  if (v) {
    poke()
  } else {
    if (hideTimer) clearTimeout(hideTimer)
    uiVisible.value = true
  }
})

/* ---------------- 进度拖动 ---------------- */
function ratioFromEvent(e) {
  const el = trackEl.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  if (!rect.width) return 0
  return clamp((e.clientX - rect.left) / rect.width, 0, 1)
}

function onSeekDown(e) {
  if (!duration.value) return
  dragging.value = true
  dragRatio.value = ratioFromEvent(e)
  if (e.preventDefault) e.preventDefault()
}

function onSeekMove(e) {
  const r = ratioFromEvent(e)
  hoverRatio.value = r
  if (dragging.value) dragRatio.value = r
}

function onWindowUp() {
  if (!dragging.value) return
  dragging.value = false
  seekTo(dragRatio.value * duration.value)
  reportProgress(true)
}

function onTrackLeave() {
  hoverRatio.value = 0
}

/* ---------------- 键盘 ---------------- */
function isTyping(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function onKeydown(e) {
  if (isTyping(e.target)) return
  switch (e.key) {
    case ' ':
    case 'k':
    case 'K':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowRight':
      e.preventDefault()
      seekBy(5)
      break
    case 'ArrowLeft':
      e.preventDefault()
      seekBy(-5)
      break
    case 'ArrowUp':
      e.preventDefault()
      setVolume((videoEl.value?.volume ?? props.volume) + 0.1)
      showFlash(`音量 ${Math.round((videoEl.value?.volume ?? props.volume) * 100)}%`)
      break
    case 'ArrowDown':
      e.preventDefault()
      setVolume((videoEl.value?.volume ?? props.volume) - 0.1)
      showFlash(`音量 ${Math.round((videoEl.value?.volume ?? props.volume) * 100)}%`)
      break
    case 'f':
    case 'F':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'm':
    case 'M':
      e.preventDefault()
      toggleMute()
      break
    case 'Escape':
      if (fullscreen.value) exitFs()
      break
    default:
      break
  }
}

function onDocClick(e) {
  if (qualityMenu.value && !e.target.closest('.vp-quality')) qualityMenu.value = false
  if (speedMenu.value && !e.target.closest('.vp-speed')) speedMenu.value = false
}

/* ---------------- 弹幕 ---------------- */
function sendDanmaku() {
  const text = dmkText.value.trim()
  if (!text) {
    toast('请输入弹幕内容')
    return
  }
  if (!props.danmaku) emit('update:danmaku', true)
  dmkRef.value?.spawn(text, true)
  dmkText.value = ''
  dmkOpen.value = false
  toast('弹幕已发送', { type: 'success' })
}

/* ---------------- 生命周期 ---------------- */
onMounted(() => {
  window.addEventListener('pointerup', onWindowUp)
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onDocClick, true)
  document.addEventListener('fullscreenchange', onFsChange)
  document.addEventListener('webkitfullscreenchange', onFsChange)

  watchdogTimer = setInterval(() => {
    const el = videoEl.value
    if (!el || document.visibilityState === 'hidden' || errorText.value) return
    if (el.paused || el.ended || !playing.value) return
    if (!waiting.value && Date.now() - lastProgressAt > STALL_TIMEOUT) {
      waiting.value = true
      tryNextSource('播放无响应')
    }
  }, 2000)

  applySource(props.startTime)
  poke()
})

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer)
  if (flashTimer) clearTimeout(flashTimer)
  clearPlaybackTimers()
  if (watchdogTimer) clearInterval(watchdogTimer)
  window.removeEventListener('pointerup', onWindowUp)
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onDocClick, true)
  document.removeEventListener('fullscreenchange', onFsChange)
  document.removeEventListener('webkitfullscreenchange', onFsChange)
  document.documentElement.classList.remove('vp-fs-lock')
  reportProgress(true)
  if (videoEl.value) {
    videoEl.value.pause()
    videoEl.value.removeAttribute('src')
    videoEl.value.load()
  }
})

defineExpose({ play: tryPlay, pause: pauseVideo, seekTo })
</script>

<template>
  <div
    ref="rootEl"
    class="vp"
    :class="{
      'is-fs': fullscreen,
      'is-theater': theater,
      'is-ui': showUI,
      'is-paused': !playing
    }"
    @pointermove="poke"
    @pointerleave="poke"
  >
    <video
      ref="videoEl"
      class="vp__video"
      :poster="poster"
      playsinline
      webkit-playsinline
      preload="metadata"
      @click="togglePlay"
      @dblclick="toggleFullscreen"
      @loadedmetadata="onLoadedMetadata"
      @loadeddata="onCanPlay"
      @timeupdate="onTimeUpdate"
      @progress="onProgress"
      @play="onPlay"
      @pause="onPause"
      @waiting="onWaiting"
      @playing="onPlaying"
      @canplay="onCanPlay"
      @ended="onEnded"
      @error="onError"
    />

    <div class="vp__mask" @click="togglePlay">
      <button
        v-if="!playing && !waiting && !errorText"
        class="vp__bigplay"
        type="button"
        aria-label="播放"
        @click.stop="togglePlay"
      >
        <AppIcon name="play" :size="30" />
      </button>

      <div v-if="waiting && !errorText" class="vp__spinner-wrap">
        <div class="vp__spinner" />
        <span>{{ loadingText || '正在加载视频…' }}</span>
      </div>

      <div v-if="errorText" class="vp__error" @click.stop>
        <p>{{ errorText }}</p>
        <div v-if="sourcePage || fallbackLinks.length" class="vp__error-links">
          <a
            v-if="sourcePage"
            :href="sourcePage"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看原始片源页
          </a>
          <a
            v-for="item in fallbackLinks"
            :key="item.name"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ item.name }}
          </a>
        </div>
        <button type="button" class="btn btn--primary" @click="retry">重新加载</button>
      </div>

      <Transition name="fade">
        <div v-if="flash" class="vp__flash">{{ flash }}</div>
      </Transition>
    </div>

    <slot name="overlay" />

    <DanmakuLayer
      ref="dmkRef"
      :playing="playing"
      :enabled="danmaku"
      :opacity="dmkOpacity"
      :size="dmkSize"
      :area="dmkArea"
    />

    <div v-if="fullscreen" class="vp__top">
      <button type="button" class="vp__btn" aria-label="返回" @click.stop="emit('back')">
        <AppIcon name="chevron-left" :size="22" />
      </button>
      <p class="ellipsis">
        {{ title }}<span v-if="subtitle"> · {{ subtitle }}</span>
      </p>
    </div>

    <div class="vp__bar" @click.stop @pointermove="poke">
      <div
        ref="trackEl"
        class="vp__track"
        @pointerdown="onSeekDown"
        @pointermove="onSeekMove"
        @pointerleave="onTrackLeave"
      >
        <div class="vp__line">
          <div class="vp__buffer" :style="{ width: `${bufferPct}%` }" />
          <div class="vp__played" :style="{ width: `${playedPct}%` }" />
        </div>
        <div class="vp__thumb" :style="{ left: `${playedPct}%` }" />
        <div
          v-if="hoverRatio > 0 || dragging"
          class="vp__tip"
          :style="{ left: `${tipRatio * 100}%` }"
        >
          {{ tipText }}
        </div>
      </div>

      <div class="vp__row">
        <button
          class="vp__btn"
          type="button"
          :aria-label="playing ? '暂停' : '播放'"
          @click.stop="togglePlay"
        >
          <AppIcon :name="playing ? 'pause' : 'play'" :size="22" />
        </button>

        <button
          v-if="hasNext"
          class="vp__btn"
          type="button"
          aria-label="下一集"
          @click.stop="emit('next')"
        >
          <AppIcon name="next" :size="20" />
        </button>

        <div class="vp__vol">
          <button
            class="vp__btn"
            type="button"
            :aria-label="isMuted ? '取消静音' : '静音'"
            @click.stop="toggleMute"
          >
            <AppIcon :name="isMuted ? 'mute' : 'volume'" :size="20" />
          </button>
          <div ref="volEl" class="vp__volslider" @pointerdown.stop="onVolDown">
            <div class="vp__volfill" :style="{ width: `${(muted ? 0 : volume) * 100}%` }" />
            <div class="vp__volthumb" :style="{ left: `${(muted ? 0 : volume) * 100}%` }" />
          </div>
        </div>

        <span class="vp__time">
          {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
        </span>

        <span class="vp__spacer" />

        <button
          class="vp__btn"
          type="button"
          :class="{ 'is-active': dmkOpen }"
          aria-label="弹幕"
          @click.stop="toggleDmkPanel"
        >
          <AppIcon name="danmaku" :size="20" />
        </button>

        <div class="vp-quality vp__menu-wrap">
          <button class="vp__tag" type="button" @click.stop="qualityMenu = !qualityMenu">
            {{ qualityLabel }}
          </button>
          <div v-if="qualityMenu" class="vp__menu" @click.stop>
            <button
              v-for="q in QUALITY_LIST"
              :key="q.key"
              type="button"
              :class="{ 'is-active': q.key === quality }"
              @click.stop="pickQuality(q.key)"
            >
              {{ q.label }}
              <em>{{ q.desc }}</em>
            </button>
          </div>
        </div>

        <div class="vp-speed vp__menu-wrap">
          <button class="vp__tag" type="button" @click.stop="speedMenu = !speedMenu">
            {{ speed }}x
          </button>
          <div v-if="speedMenu" class="vp__menu" @click.stop>
            <button
              v-for="s in SPEEDS"
              :key="s"
              type="button"
              :class="{ 'is-active': s === speed }"
              @click.stop="pickSpeed(s)"
            >
              {{ s }}x
            </button>
          </div>
        </div>

        <button
          class="vp__btn vp__btn--pc"
          type="button"
          :class="{ 'is-active': theater }"
          aria-label="影院模式"
          @click.stop="emit('update:theater', !theater)"
        >
          <AppIcon name="theater" :size="20" />
        </button>

        <button
          class="vp__btn"
          type="button"
          :aria-label="fullscreen ? '退出全屏' : '全屏'"
          @click.stop="toggleFullscreen"
        >
          <AppIcon :name="fullscreen ? 'exitscreen' : 'fullscreen'" :size="20" />
        </button>
      </div>

      <div v-if="dmkOpen" class="vp__dmkin" @click.stop>
        <input
          v-model="dmkText"
          type="text"
          maxlength="60"
          placeholder="发个弹幕见证当下…"
          @keydown.enter.prevent="sendDanmaku"
        />
        <button type="button" @click.stop="sendDanmaku">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vp {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  color: #fff;
  user-select: none;
}

.vp.is-theater,
.vp.is-fs {
  border-radius: 0;
}

.vp.is-fs {
  aspect-ratio: auto;
  height: 100vh;
}

.vp__video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  background: #000;
}

.vp__mask {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vp__bigplay {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  transition: transform 0.2s;
}

.vp__bigplay:hover {
  transform: scale(1.06);
}

.vp__spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  animation: vp-spin 0.85s linear infinite;
}

.vp__spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: min(82%, 320px);
  color: rgba(255, 255, 255, 0.78);
  font-size: 12.5px;
  text-align: center;
}

@keyframes vp-spin {
  to {
    transform: rotate(360deg);
  }
}

.vp__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  text-align: center;
  color: #fff;
  font-size: 13.5px;
}

.vp__error-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.vp__error-links a {
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
}

.vp__error-links a:hover {
  border-color: rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.1);
}

.vp__flash {
  position: absolute;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.6);
  font-size: 13px;
}

.vp__top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 30px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
  font-size: 15px;
}

/* ---------- 控制条 ---------- */
.vp__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  padding: 22px 12px 8px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.25) 60%, transparent);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.22s, transform 0.22s;
  pointer-events: none;
}

.vp.is-ui .vp__bar,
.vp.is-paused .vp__bar {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.vp__track {
  position: relative;
  height: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  touch-action: none;
}

.vp__line {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.26);
  overflow: hidden;
  transition: height 0.15s;
}

.vp__track:hover .vp__line {
  height: 6px;
}

.vp__buffer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.35);
}

.vp__played {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--brand-grad);
}

.vp__thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-radius: 50%;
  background: #fff;
  transform: translateY(-50%) scale(0.85);
  transition: transform 0.15s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.vp__track:hover .vp__thumb {
  transform: translateY(-50%) scale(1.1);
}

.vp__tip {
  position: absolute;
  bottom: 20px;
  transform: translateX(-50%);
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.78);
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
}

.vp__row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.vp__btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #fff;
  flex: none;
  transition: background 0.2s, color 0.2s;
}

.vp__btn:hover,
.vp__btn.is-active {
  background: rgba(255, 255, 255, 0.16);
  color: var(--brand-2);
}

.vp__vol {
  display: none;
  align-items: center;
  gap: 2px;
}

.vp__volslider {
  position: relative;
  width: 62px;
  height: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
  touch-action: none;
}

.vp__volslider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.28);
}

.vp__volfill {
  position: absolute;
  left: 0;
  height: 3px;
  border-radius: 2px;
  background: #fff;
}

.vp__volthumb {
  position: absolute;
  width: 9px;
  height: 9px;
  margin-left: -4.5px;
  border-radius: 50%;
  background: #fff;
}

.vp__time {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.86);
  padding-left: 4px;
  font-variant-numeric: tabular-nums;
  flex: none;
}

.vp__spacer {
  flex: 1;
}

.vp__tag {
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 12.5px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  flex: none;
}

.vp__tag:hover {
  background: rgba(255, 255, 255, 0.22);
}

.vp__menu-wrap {
  position: relative;
  flex: none;
}

.vp__menu {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  min-width: 132px;
  padding: 6px;
  border-radius: 10px;
  background: rgba(18, 20, 26, 0.96);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.4);
  z-index: 20;
}

.vp__menu button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
}

.vp__menu button em {
  font-style: normal;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.vp__menu button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.vp__menu button.is-active {
  color: var(--brand-2);
  font-weight: 600;
}

.vp__dmkin {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
}

.vp__dmkin input {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  outline: none;
  font-size: 13px;
}

.vp__dmkin input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.vp__dmkin button {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  background: var(--brand-grad);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  flex: none;
}

@media (min-width: 768px) {
  .vp__vol {
    display: flex;
  }

  .vp__row {
    gap: 6px;
  }

  .vp__bar {
    padding: 26px 16px 10px;
  }

  .vp__time {
    font-size: 13px;
  }
}

@media (max-width: 767px) {
  .vp__btn--pc {
    display: none;
  }

  .vp__time {
    font-size: 11.5px;
  }
}
</style>
