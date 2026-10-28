<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BannerCarousel from '@/components/BannerCarousel.vue'
import VideoCard from '@/components/VideoCard.vue'
import RankItem from '@/components/RankItem.vue'
import HistoryCard from '@/components/HistoryCard.vue'
import AppIcon from '@/components/AppIcon.vue'
import { CHANNELS, queryVideos } from '@/data/videos'
import { BANNERS, rankList } from '@/data/extra'
import { useUserStore } from '@/stores/user'

const user = useUserStore()

const TABS = CHANNELS.filter((c) => c.key !== 'all')

const activeType = ref('tv')
const page = ref(1)
const PAGE_SIZE = 12

const recommend = computed(() =>
  queryVideos({ type: activeType.value, sort: 'hot', pageSize: 6, page: 1 }).list
)

const forYou = computed(() =>
  queryVideos({
    type: 'all',
    sort: 'hot',
    page: 1,
    pageSize: page.value * PAGE_SIZE
  }).list
)

const hasMore = computed(() => forYou.value.length < 38)

const continueList = computed(() => user.history.slice(0, 8))

const hotRank = computed(() => rankList(activeType.value, 'hot', 8))

const QUICK = [
  { label: '会员热剧', type: 'tv', icon: '🔥' },
  { label: '高分国漫', type: 'anime', icon: '🎉' },
  { label: '院线大片', type: 'movie', icon: '🎬' },
  { label: '王牌综艺', type: 'variety', icon: '🎤' },
  { label: '人文纪录', type: 'doc', icon: '🌍' },
  { label: '亲子动画', type: 'kids', icon: '🐼' }
]

function tabLabel(key) {
  const hit = TABS.find((t) => t.key === key)
  return hit ? hit.name : '全部'
}
</script>

<template>
  <div class="home page">
    <div class="container home__wrap">
      <div class="home__main">
        <BannerCarousel :items="BANNERS" />

        <!-- 快捷入口 -->
        <div class="quick">
          <RouterLink
            v-for="q in QUICK"
            :key="q.label"
            :to="{ name: 'channel', params: { type: q.type } }"
            class="quick__item"
          >
            <span class="quick__icon">{{ q.icon }}</span>
            <span class="quick__label">{{ q.label }}</span>
          </RouterLink>
        </div>

        <!-- 继续观看 -->
        <section v-if="continueList.length" class="section">
          <div class="section__head">
            <h2 class="section__title">继续观看</h2>
            <RouterLink to="/history" class="section__more">
              全部记录
              <AppIcon name="chevron-right" :size="14" />
            </RouterLink>
          </div>
          <div class="card-grid card-grid--wide">
            <HistoryCard v-for="r in continueList.slice(0, 6)" :key="r.id" :record="r" />
          </div>
        </section>

        <!-- 热播推荐 -->
        <section class="section">
          <div class="section__head">
            <h2 class="section__title">{{ tabLabel(activeType) }}热播</h2>
            <div class="home__tabs hide-scrollbar">
              <button
                v-for="t in TABS"
                :key="t.key"
                type="button"
                class="chip"
                :class="{ 'is-active': activeType === t.key }"
                @click="activeType = t.key"
              >
                {{ t.name }}
              </button>
            </div>
          </div>
          <div class="card-grid card-grid--wide">
            <VideoCard v-for="v in recommend" :key="v.id" :video="v" wide :show-meta="false" />
          </div>
        </section>

        <!-- 猜你喜欢 -->
        <section class="section">
          <div class="section__head">
            <h2 class="section__title">猜你喜欢</h2>
            <RouterLink :to="{ name: 'channel', params: { type: 'all' } }" class="section__more">
              更多
              <AppIcon name="chevron-right" :size="14" />
            </RouterLink>
          </div>
          <div class="card-grid">
            <VideoCard v-for="v in forYou" :key="v.id" :video="v" />
          </div>
          <div v-if="hasMore" class="home__more">
            <button type="button" class="btn btn--ghost" @click="page += 1">加载更多</button>
          </div>
        </section>
      </div>

      <!-- 侧栏 -->
      <aside class="home__side">
        <section class="side-panel">
          <div class="side-panel__head">
            <h3>{{ tabLabel(activeType) }}热播榜</h3>
            <RouterLink to="/rank" class="weak">完整榜单 ›</RouterLink>
          </div>
          <RankItem
            v-for="(v, i) in hotRank"
            :key="v.id"
            :video="v"
            :index="i"
            :trend="i < 3 ? '热' : ''"
          />
        </section>

        <section class="side-panel side-panel--vip">
          <div class="side-vip">
            <AppIcon name="crown" :size="20" />
            <div>
              <p class="side-vip__title">{{ user.isVip ? '尊贵的会员' : '开通会员' }}</p>
              <p class="side-vip__sub">
                {{ user.isVip ? `有效期至 ${user.vipExpireText}` : '全部院线大片免费看' }}
              </p>
            </div>
          </div>
          <RouterLink to="/vip" class="btn btn--primary side-vip__btn">
            {{ user.isVip ? '会员中心' : '立即开通' }}
          </RouterLink>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.home__wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}

.home__tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  flex: 1;
  justify-content: flex-end;
  padding: 2px 0;
}

.quick {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.quick__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
}

.quick__item:hover {
  transform: translateY(-2px);
  color: var(--brand);
}

.quick__icon {
  font-size: 20px;
}

.quick__label {
  font-size: 13px;
  font-weight: 500;
}

.home__more {
  margin-top: 18px;
  text-align: center;
}

.side-panel {
  padding: 12px 8px;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 14px;
}

.side-panel__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 2px 8px 8px;
}

.side-panel__head h3 {
  font-size: 15px;
  font-weight: 700;
}

.side-panel__head a {
  font-size: 12px;
}

.side-panel--vip {
  padding: 16px 14px;
}

.side-vip {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7a4a00;
}

.side-vip__title {
  font-size: 15px;
  font-weight: 700;
}

.side-vip__sub {
  font-size: 12px;
  color: #a07a3c;
}

.side-vip__btn {
  width: 100%;
  margin-top: 12px;
}

@media (min-width: 640px) {
  .quick {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .home__wrap {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 24px;
    align-items: start;
  }

  .home__side {
    position: sticky;
    top: calc(var(--header-h) + 16px);
  }
}

@media (min-width: 1200px) {
  .home__wrap {
    grid-template-columns: minmax(0, 1fr) 340px;
    gap: 32px;
  }
}
</style>
