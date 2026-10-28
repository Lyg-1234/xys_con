<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import VideoCard from '@/components/VideoCard.vue'
import PageBar from '@/components/PageBar.vue'
import { CHANNELS, CHANNEL_NAME, filterOptions, queryVideos } from '@/data/videos'

const route = useRoute()

const PAGE_SIZE = 18

const type = computed(() => {
  const t = String(route.params.type || 'all')
  return CHANNEL_NAME[t] ? t : 'all'
})

const genre = ref('')
const region = ref('')
const year = ref('')
const sort = ref('hot')
const page = ref(1)

const options = computed(() => filterOptions(type.value))

const SORTS = [
  { key: 'hot', name: '最热' },
  { key: 'new', name: '最新' },
  { key: 'score', name: '评分' }
]

const result = computed(() =>
  queryVideos({
    type: type.value,
    genre: genre.value,
    region: region.value,
    year: year.value,
    sort: sort.value,
    page: 1,
    pageSize: page.value * PAGE_SIZE
  })
)

watch(
  () => route.params.type,
  () => {
    genre.value = ''
    region.value = ''
    year.value = ''
    sort.value = 'hot'
    page.value = 1
  }
)

const summary = computed(() => {
  const parts = []
  if (genre.value) parts.push(genre.value)
  if (region.value) parts.push(region.value)
  if (year.value) parts.push(`${year.value}年`)
  return parts.join(' · ')
})

function resetFilter() {
  genre.value = ''
  region.value = ''
  year.value = ''
  sort.value = 'hot'
  page.value = 1
}
</script>

<template>
  <div class="page">
    <div class="container">
      <PageBar :title="`${CHANNEL_NAME[type] || '全部'}频道`" :subtitle="summary || '海量高清视频随便看'">
        <template #right>
          <RouterLink to="/rank" class="btn btn--ghost">排行榜</RouterLink>
        </template>
      </PageBar>

      <!-- 频道切换 -->
      <div class="filter-row filter-row--nav hide-scrollbar">
        <RouterLink
          v-for="c in CHANNELS"
          :key="c.key"
          :to="{ name: 'channel', params: { type: c.key } }"
          class="chip"
          :class="{ 'is-active': type === c.key }"
          @click="page = 1"
        >
          {{ c.name }}
        </RouterLink>
      </div>

      <!-- 类型 -->
      <div v-if="options.genres.length" class="filter-row hide-scrollbar">
        <span class="filter-row__label">类型</span>
        <button type="button" class="chip" :class="{ 'is-active': !genre }" @click="genre = ''; page = 1">
          全部
        </button>
        <button
          v-for="g in options.genres"
          :key="g"
          type="button"
          class="chip"
          :class="{ 'is-active': genre === g }"
          @click="genre = g; page = 1"
        >
          {{ g }}
        </button>
      </div>

      <!-- 地区 -->
      <div v-if="options.regions.length" class="filter-row hide-scrollbar">
        <span class="filter-row__label">地区</span>
        <button type="button" class="chip" :class="{ 'is-active': !region }" @click="region = ''; page = 1">
          全部
        </button>
        <button
          v-for="r in options.regions"
          :key="r"
          type="button"
          class="chip"
          :class="{ 'is-active': region === r }"
          @click="region = r; page = 1"
        >
          {{ r }}
        </button>
      </div>

      <!-- 排序 -->
      <div class="filter-row">
        <span class="filter-row__label">排序</span>
        <button
          v-for="s in SORTS"
          :key="s.key"
          type="button"
          class="chip"
          :class="{ 'is-active': sort === s.key }"
          @click="sort = s.key; page = 1"
        >
          {{ s.name }}
        </button>
        <button v-if="genre || region || year" type="button" class="chip chip--reset" @click="resetFilter">
          重置筛选
        </button>
        <span class="filter-row__count">共 {{ result.total }} 部影片</span>
      </div>

      <!-- 结果 -->
      <div v-if="result.list.length" class="card-grid">
        <VideoCard v-for="v in result.list" :key="v.id" :video="v" />
      </div>

      <div v-else class="empty">
        <div class="empty__icon">🍿</div>
        <p>没有找到符合条件的影片</p>
        <button type="button" class="btn btn--primary" style="margin-top: 12px" @click="resetFilter">
          换个条件看看
        </button>
      </div>

      <div v-if="result.hasMore" class="home-more">
        <button type="button" class="btn btn--ghost" @click="page += 1">加载更多</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  overflow-x: auto;
  flex-wrap: nowrap;
  border-bottom: 1px dashed var(--line);
}

.filter-row:last-of-type {
  border-bottom: none;
}

.filter-row--nav {
  border-bottom: none;
  padding-bottom: 2px;
}

.filter-row__label {
  flex: none;
  font-size: 13px;
  color: var(--text-weak);
  padding-right: 2px;
}

.filter-row__count {
  margin-left: auto;
  flex: none;
  font-size: 12.5px;
  color: var(--text-weak);
  padding-left: 12px;
}

.chip--reset {
  color: var(--brand);
  border-color: rgba(255, 90, 43, 0.4);
}

.home-more {
  margin-top: 22px;
  text-align: center;
}

@media (min-width: 1024px) {
  .filter-row {
    gap: 10px;
  }
}
</style>
