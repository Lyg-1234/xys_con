<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VideoPlayer from '@/components/VideoPlayer.vue'
import CommentSection from '@/components/CommentSection.vue'
import AppIcon from '@/components/AppIcon.vue'
import { getVideo, relatedVideos, resolvePlayUrl } from '@/data/videos'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const playerRef = ref(null)
const sideTab = ref('episodes')
const epiReverse = ref(false)

const video = computed(() => getVideo(String(route.params.id || '')))
const episodes = computed(() => video.value?.episodes || [])
const related = computed(() => relatedVideos(video.value, 8))

const epIndex = ref(0)

const TRIAL_SECONDS = 360
const trialEnded = ref(false)

function resolveIndex() {
  const total = episodes.value.length
  if (!total) return 0
  const n = Number(route.query.epi)
  if (Number.isFinite(n) && n >= 1 && n <= total) return n - 1
  const h = user.historyOf(video.value?.id)
  if (h && Number.isFinite(h.epiIndex) && h.epiIndex >= 0 && h.epiIndex < total) return h.epiIndex
  return 0
}

watch(
  () => [route.params.id, route.query.epi],
  () => {
    epIndex.value = resolveIndex()
    trialEnded.value = false
  },
  { immediate: true }
)

const currentEpisode = computed(() => episodes.value[epIndex.value] || null)
const hasNext = computed(() => epIndex.value < episodes.value.length - 1)
const hasPrev = computed(() => epIndex.value > 0)

const historyRecord = computed(() => user.historyOf(video.value?.id))

const startTime = computed(() => {
  const h = historyRecord.value
  if (!h) return 0
  if (h.epiIndex !== epIndex.value) return 0
  const t = Number(h.time) || 0
  return t > 5 && t < Number(h.duration || 0) - 10 ? Math.max(0, t - 3) : 0
})

const needVip = computed(() => !!video.value?.vip && !user.isVip)

const shownEpisodes = computed(() =>
  epiReverse.value ? episodes.value.slice().reverse() : episodes.value
)

const castList = computed(() => video.value?.cast || [])

const actorEmoji = (i) => ['🎭', '🎬', '🌟', '🎩', '🎪', '🦸', '👑'][i % 7]

/* ---------------- 集数切换 ---------------- */
function gotoEpisode(index) {
  if (index < 0 || index >= episodes.value.length || index === epIndex.value) return
  epIndex.value = index
  trialEnded.value = false
  router.replace({ name: 'play', params: { id: video.value.id }, query: { epi: index + 1 } })
  toast(`正在播放：${video.value.title} 第${index + 1}${video.value.unit}`)
}

function nextEpisode() {
  if (hasNext.value) gotoEpisode(epIndex.value + 1)
  else toast('已经是最后一集了')
}

function prevEpisode() {
  if (hasPrev.value) gotoEpisode(epIndex.value - 1)
}

function onEnded() {
  if (user.settings.autoNext && hasNext.value) {
    nextEpisode()
  } else {
    toast('本片已播放完毕')
  }
}

/* ---------------- 播放记录 ---------------- */
function onProgress({ currentTime, duration }) {
  if (!video.value || !currentEpisode.value) return
  if (!user.settings.remember) return
  if (duration < 1) return

  if (needVip.value && currentTime > TRIAL_SECONDS) {
    trialEnded.value = true
    playerRef.value?.pause()
  }

  user.recordHistory({
    id: video.value.id,
    title: video.value.title,
    poster: video.value.poster,
    cover: video.value.cover,
    epiIndex: epIndex.value,
    epiTitle: currentEpisode.value.title,
    time: currentTime,
    duration,
    updateText: video.value.updateText
  })
}

/* ---------------- 操作 ---------------- */
const isFavorite = computed(() => user.isFavorite(video.value?.id))

function toggleFavorite() {
  if (!video.value) return
  const added = user.toggleFavorite(video.value.id)
  toast(added ? `已收藏《${video.value.title}》` : '已取消收藏', { type: added ? 'success' : 'info' })
}

async function shareVideo() {
  const url = window.location.href
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      toast('链接已复制到剪贴板', { type: 'success' })
    } else {
      throw new Error('no clipboard')
    }
  } catch (e) {
    toast('分享链接：' + url)
  }
}

function downloadCurrent() {
  if (!currentEpisode.value) return
  const url = resolvePlayUrl(currentEpisode.value.srcs, user.settings.quality, 0)
  window.open(url, '_blank', 'noopener')
  toast('已在新窗口打开视频源')
}

function openVip() {
  router.push('/vip')
}
</script>

<template>
  <div v-if="!video" class="empty">
    <div class="empty__icon">🎬</div>
    <p>视频不存在或已下架</p>
    <RouterLink to="/" class="btn btn--primary" style="margin-top: 14px">返回首页</RouterLink>
  </div>

  <div v-else class="play page">
    <div class="play__wrap">
      <!-- 播放器 -->
      <div class="play__player">
        <button type="button" class="play__back" aria-label="返回" @click="router.back()">
          <AppIcon name="chevron-left" :size="22" />
        </button>
        <VideoPlayer
          ref="playerRef"
          :srcs="currentEpisode ? currentEpisode.srcs : []"
          :poster="video.posterLarge"
          :title="video.title"
          :subtitle="currentEpisode ? currentEpisode.title : ''"
          :start-time="startTime"
          :quality="user.settings.quality"
          :speed="user.settings.speed"
          :volume="user.settings.volume"
          :muted="user.settings.muted"
          :autoplay="user.settings.autoPlay"
          :theater="user.settings.theater"
          :has-next="hasNext"
          :danmaku="user.settings.danmaku"
          :dmk-opacity="user.settings.dmkOpacity"
          :dmk-size="user.settings.dmkSize"
          :dmk-area="user.settings.dmkArea"
          @ended="onEnded"
          @progress="onProgress"
          @next="nextEpisode"
          @update:quality="user.updateSettings({ quality: $event })"
          @update:speed="user.updateSettings({ speed: $event })"
          @update:volume="user.updateSettings({ volume: $event })"
          @update:muted="user.updateSettings({ muted: $event })"
          @update:theater="user.updateSettings({ theater: $event })"
          @back="router.back()"
        >
          <template #overlay>
            <div v-if="trialEnded" class="trial" @click.stop>
              <p class="trial__title">试看已结束</p>
              <p class="trial__sub">开通会员后可观看完整内容及全部会员专享影片</p>
              <div class="trial__ops">
                <button type="button" class="btn btn--primary btn--lg" @click="openVip">
                  立即开通会员
                </button>
                <RouterLink to="/" class="trial__skip">去逛逛</RouterLink>
              </div>
            </div>
          </template>
        </VideoPlayer>
      </div>

      <!-- 信息区 -->
      <div class="play__info">
        <div class="play__title-row">
          <h1 class="play__title ellipsis">
            {{ video.title }}
            <span v-if="currentEpisode && episodes.length > 1" class="play__epi">
              {{ currentEpisode.title }}
            </span>
          </h1>
          <span class="play__score">{{ video.score.toFixed(1) }}<em>分</em></span>
        </div>

        <div class="play__badges">
          <span class="badge">{{ video.typeName }}</span>
          <span v-if="video.vip" class="badge badge--vip">会员</span>
          <span v-if="video.pay" class="badge badge--pay">付费</span>
          <span v-if="video.badge" class="badge badge--flat">{{ video.badge }}</span>
          <span class="play__meta-text">{{ video.year }}</span>
          <span class="play__meta-text">{{ video.region }}</span>
          <span class="play__meta-text">{{ video.genres.join(' / ') }}</span>
          <span class="play__meta-text">{{ video.updateText }}</span>
        </div>

        <div class="play__ops">
          <button type="button" class="play__op" :class="{ 'is-on': isFavorite }" @click="toggleFavorite">
            <AppIcon :name="isFavorite ? 'heart-fill' : 'heart'" :size="18" />
            <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
          </button>
          <button type="button" class="play__op" @click="shareVideo">
            <AppIcon name="share" :size="18" />
            <span>分享</span>
          </button>
          <button type="button" class="play__op" @click="downloadCurrent">
            <AppIcon name="download" :size="18" />
            <span>缓存</span>
          </button>
        </div>

        <p v-if="needVip" class="play__vip-tip">
          <AppIcon name="crown" :size="15" />
          该影片为会员专享，未开通会员可执行演示版「免费试看 {{ TRIAL_SECONDS / 60 }} 分钟」
          <button type="button" @click="openVip">开通</button>
        </p>

        <p class="play__desc" :class="{ 'is-open': true }">
          <span class="play__desc-label">简介：</span>{{ video.desc }}
        </p>
      </div>

      <!-- 侧栏：选集 / 相关推荐 -->
      <div class="play__side">
        <div class="play__sidetabs">
          <button
            type="button"
            :class="{ 'is-active': sideTab === 'episodes' }"
            @click="sideTab = 'episodes'"
          >
            选集
          </button>
          <button
            type="button"
            :class="{ 'is-active': sideTab === 'related' }"
            @click="sideTab = 'related'"
          >
            相关推荐
          </button>
        </div>

        <template v-if="sideTab === 'episodes'">
          <div v-if="episodes.length > 1" class="play__epi-head">
            <span>共 {{ video.episodeTotal }} {{ video.unit }}</span>
            <button type="button" @click="epiReverse = !epiReverse">
              {{ epiReverse ? '正序' : '倒序' }}
              <AppIcon name="refresh" :size="13" />
            </button>
          </div>

          <div class="play__epis">
            <button
              v-for="ep in shownEpisodes"
              :key="ep.no"
              type="button"
              class="play__epi-btn"
              :class="{ 'is-active': ep.no === epIndex + 1 }"
              @click="gotoEpisode(ep.no - 1)"
            >
              <span class="ellipsis">{{ ep.title }}</span>
              <AppIcon v-if="ep.no === epIndex + 1" name="play" :size="12" />
            </button>
          </div>

          <p v-if="episodes.length === 1" class="play__side-empty">本片为单片内容，暂无其他集数</p>
        </template>

        <ul v-else class="play__rel-list">
          <li v-for="v in related" :key="v.id">
            <RouterLink :to="{ name: 'play', params: { id: v.id } }" class="rel">
              <span class="rel__rank">{{ v.score.toFixed(1) }}</span>
              <div class="rel__body">
                <p class="rel__title ellipsis">{{ v.title }}</p>
                <p class="rel__meta ellipsis">
                  {{ v.typeName }} · {{ v.updateText }} · {{ v.genres.join('/') }}
                </p>
              </div>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- 详情 -->
    <div class="container">
      <div class="play__detail">
        <div class="surface play__panel">
          <h3 class="play__panel-title">作品信息</h3>
          <dl class="play__facts">
            <div><dt>导演</dt><dd>{{ video.director }}</dd></div>
            <div><dt>类型</dt><dd>{{ video.genres.join(' / ') }}</dd></div>
            <div><dt>地区</dt><dd>{{ video.region }}</dd></div>
            <div><dt>年份</dt><dd>{{ video.year }} 年</dd></div>
            <div><dt>评分</dt><dd><b>{{ video.score.toFixed(1) }}</b> / 10</dd></div>
            <div><dt>更新</dt><dd>{{ video.updateText }}</dd></div>
          </dl>

          <h3 class="play__panel-title">演职员表</h3>
          <ul class="cast">
            <li v-for="(c, i) in castList" :key="c.name">
              <span class="cast__avatar">{{ actorEmoji(i) }}</span>
              <p class="cast__name ellipsis">{{ c.name }}</p>
              <p class="cast__role ellipsis weak">饰 {{ c.role }}</p>
            </li>
          </ul>
        </div>

        <CommentSection :video-id="video.id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.play__wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  padding: 0 0 8px;
}

.play__player {
  margin: 0 auto;
  width: 100%;
}

.play__back {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 20;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  backdrop-filter: blur(4px);
}

@media (min-width: 768px) {
  .play__back {
    display: none;
  }
}

.play__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.play__title {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.35;
}

.play__epi {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 400;
  color: var(--text-sub);
}

.play__score {
  flex: none;
  font-size: 22px;
  font-weight: 800;
  color: #ff8a3d;
  line-height: 1;
}

.play__score em {
  font-size: 12px;
  font-style: normal;
  margin-left: 2px;
}

.play__badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.play__meta-text {
  font-size: 12.5px;
  color: var(--text-sub);
}

.play__meta-text + .play__meta-text::before {
  content: '·';
  margin-right: 6px;
  color: var(--text-weak);
}

.play__ops {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.play__op {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  padding: 0 14px;
  border-radius: 17px;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  font-size: 13px;
  color: var(--text-sub);
}

.play__op:hover,
.play__op.is-on {
  color: var(--brand);
  border-color: rgba(255, 90, 43, 0.4);
  background: var(--brand-soft);
}

.play__vip-tip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fff4e2, #ffe9cf);
  color: #8a5a12;
  font-size: 13px;
}

.play__vip-tip button {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffcf6b, #f6a01a);
  color: #4a3200;
  font-weight: 600;
  font-size: 12.5px;
}

.play__desc {
  margin-top: 14px;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--text-sub);
}

.play__desc-label {
  color: var(--text);
  font-weight: 600;
}

/* ---------- 侧栏 ---------- */
.play__side {
  padding: 12px 10px;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.play__sidetabs {
  display: flex;
  gap: 18px;
  border-bottom: 1px solid var(--line);
  padding: 0 4px 8px;
  margin-bottom: 10px;
}

.play__sidetabs button {
  position: relative;
  font-size: 15px;
  color: var(--text-weak);
  padding-bottom: 6px;
}

.play__sidetabs button.is-active {
  color: var(--text);
  font-weight: 700;
}

.play__sidetabs button.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -1px;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: var(--brand-grad);
}

.play__epi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 8px;
  font-size: 12.5px;
  color: var(--text-weak);
}

.play__epi-head button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-sub);
  font-size: 12.5px;
}

.play__epis {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding: 2px;
}

.play__epi-btn {
  height: 40px;
  padding: 0 8px;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--line-strong);
  font-size: 13px;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.play__epi-btn:hover {
  border-color: rgba(255, 90, 43, 0.4);
  color: var(--brand);
}

.play__epi-btn.is-active {
  background: var(--brand-grad);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
}

.play__side-empty {
  padding: 26px 10px;
  text-align: center;
  color: var(--text-weak);
  font-size: 13px;
}

.play__rel-list li {
  border-bottom: 1px solid var(--line);
}

.play__rel-list li:last-child {
  border-bottom: none;
}

.rel {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 6px;
  border-radius: 8px;
}

.rel:hover {
  background: var(--brand-soft);
}

.rel__rank {
  width: 26px;
  flex: none;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: #ff8a3d;
}

.rel__body {
  min-width: 0;
  flex: 1;
}

.rel__title {
  font-size: 13.5px;
  font-weight: 500;
}

.rel__meta {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 2px;
}

/* ---------- 详情 ---------- */
.play__detail {
  margin-top: 22px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
}

.play__panel {
  padding: 16px 14px;
}

.play__panel-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
  padding-left: 8px;
  border-left: 3px solid var(--brand);
}

.play__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin-bottom: 22px;
}

.play__facts div {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.play__facts dt {
  color: var(--text-weak);
  flex: none;
  width: 34px;
}

.play__facts dd {
  color: var(--text-sub);
  min-width: 0;
}

.play__facts dd b {
  color: #ff8a3d;
}

.cast {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 14px 8px;
}

.cast__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--line);
  font-size: 24px;
}

.cast__name {
  margin-top: 6px;
  font-size: 13px;
  text-align: center;
  font-weight: 500;
}

.cast__role {
  font-size: 11.5px;
  text-align: center;
}

/* ---------- 试看遮罩 ---------- */
.trial {
  position: absolute;
  inset: 0;
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  text-align: center;
  background: rgba(8, 9, 13, 0.82);
  backdrop-filter: blur(3px);
  color: #fff;
}

.trial__title {
  font-size: 20px;
  font-weight: 700;
}

.trial__sub {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.78);
}

.trial__ops {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.trial__skip {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.66);
}

@media (min-width: 768px) {
  .play__ops {
    gap: 10px;
  }
}

@media (min-width: 1024px) {
  .play__wrap {
    grid-template-columns: minmax(0, 1fr) 340px;
    grid-template-areas:
      'player side'
      'info side';
    align-items: start;
    gap: 16px 26px;
    padding: 0 32px 8px;
    max-width: var(--page-max);
    margin: 0 auto;
  }

  .play__player {
    grid-area: player;
  }

  .play__info {
    grid-area: info;
  }

  .play__side {
    grid-area: side;
    position: sticky;
    top: calc(var(--header-h) + 16px);
    max-height: calc(100vh - var(--header-h) - 40px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .play__epis {
    flex: 1;
    max-height: none;
  }

  .play__rel-list {
    flex: 1;
    overflow-y: auto;
  }

  .play__detail {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
    margin-top: 28px;
  }
}

@media (min-width: 1200px) {
  .play__wrap {
    grid-template-columns: minmax(0, 1fr) 380px;
    padding: 0 32px 8px;
  }
}

@media (max-width: 767px) {
  .play__wrap {
    padding: 0;
  }

  .play__player {
    border-radius: 0;
  }

  .play__info {
    padding: 12px 12px 0;
  }

  .play__side {
    margin: 0 12px;
  }
}
</style>
