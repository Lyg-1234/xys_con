<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import PosterArt from '@/components/PosterArt.vue'
import { officialSearchLinks, queryVideos } from '@/data/videos'
import { HOT_SEARCH, SEARCH_DISCOVER } from '@/data/extra'
import { useUserStore } from '@/stores/user'
import { splitHighlight } from '@/utils/format'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const inputText = ref(typeof route.query.q === 'string' ? route.query.q : '')
const keyword = ref(typeof route.query.q === 'string' ? route.query.q.trim() : '')
const sort = ref('hot')

const SORTS = [
  { key: 'hot', name: '综合' },
  { key: 'new', name: '最新' },
  { key: 'score', name: '评分' }
]

let timer = null

watch(inputText, (value) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const kw = String(value).trim()
    keyword.value = kw
    sort.value = 'hot'
    if (kw) user.pushSearch(kw)
    router.replace({ name: 'search', query: kw ? { q: kw } : {} })
  }, 320)
})

watch(
  () => route.query.q,
  (q) => {
    const value = typeof q === 'string' ? q : ''
    if (value !== inputText.value.trim()) inputText.value = value
    if (value.trim() !== keyword.value) keyword.value = value.trim()
  }
)

const results = computed(() =>
  keyword.value
    ? queryVideos({ keyword: keyword.value, sort: sort.value, pageSize: 30 })
    : { list: [], total: 0 }
)

const officialLinks = computed(() =>
  keyword.value && results.value.list.length === 0 ? officialSearchLinks(keyword.value) : []
)

function clearInput() {
  inputText.value = ''
  if (timer) clearTimeout(timer)
}

function submitNow() {
  if (timer) clearTimeout(timer)
  const kw = inputText.value.trim()
  keyword.value = kw
  if (kw) user.pushSearch(kw)
  router.replace({ name: 'search', query: kw ? { q: kw } : {} })
}

function searchWord(word) {
  inputText.value = word
  keyword.value = word
  user.pushSearch(word)
  router.replace({ name: 'search', query: { q: word } })
}

function goVideo(id) {
  router.push({ name: 'play', params: { id } })
}

function highlight(text) {
  return splitHighlight(text, keyword.value)
}

function toggleFav(video) {
  const added = user.toggleFavorite(video.id)
  toast(added ? `已收藏《${video.title}》` : '已取消收藏', { type: added ? 'success' : 'info' })
}

onMounted(() => {
  if (!keyword.value && inputText.value) inputText.value = String(route.query.q || '')
})
</script>

<template>
  <div class="page search">
    <div class="container">
      <!-- 搜索框 -->
      <div class="search__bar">
        <button type="button" class="search__back" aria-label="返回" @click="router.back()">
          <AppIcon name="chevron-left" :size="22" />
        </button>
        <div class="search__input">
          <AppIcon name="search" :size="17" />
          <input
            v-model="inputText"
            type="search"
            placeholder="搜索影片、演员、导演"
            @keydown.enter.prevent="submitNow"
          />
          <button v-if="inputText" type="button" class="search__clear" @click="clearInput">
            <AppIcon name="close" :size="14" />
          </button>
        </div>
        <button type="button" class="search__go" @click="submitNow">搜索</button>
      </div>

      <!-- 结果 -->
      <template v-if="keyword">
        <div class="search__meta">
          <span>找到 <b>{{ results.total }}</b> 个与“{{ keyword }}”相关的结果</span>
          <div class="search__sorts">
            <button
              v-for="s in SORTS"
              :key="s.key"
              type="button"
              class="chip"
              :class="{ 'is-active': sort === s.key }"
              @click="sort = s.key"
            >
              {{ s.name }}
            </button>
          </div>
        </div>

        <ul v-if="results.list.length" class="search__list">
          <li v-for="v in results.list" :key="v.id" class="rrow" @click="goVideo(v.id)">
            <div class="rrow__poster">
              <PosterArt :video="v" />
            </div>
            <div class="rrow__body">
              <h3 class="rrow__title ellipsis">
                <span v-for="(seg, i) in highlight(v.title)" :key="i" :class="{ hit: seg.hit }">{{
                  seg.text
                }}</span>
              </h3>
              <p class="rrow__meta">
                <span>{{ v.typeName }}</span>
                <span>{{ v.year }}</span>
                <span>{{ v.region }}</span>
                <span class="rrow__score">{{ v.score.toFixed(1) }} 分</span>
                <span v-if="v.vip" class="badge badge--vip">会员</span>
              </p>
              <p class="rrow__desc ellipsis-2">
                <span v-for="(seg, i) in highlight(v.desc)" :key="i" :class="{ hit: seg.hit }">{{
                  seg.text
                }}</span>
              </p>
              <p class="rrow__actors ellipsis weak">
                导演：{{ v.director }} · 主演：{{ v.cast.map((c) => c.name).join(' / ') }}
              </p>
              <div class="rrow__ops">
                <button type="button" class="btn btn--primary" @click.stop="goVideo(v.id)">
                  <AppIcon name="play" :size="13" />
                  立即播放
                </button>
                <button type="button" class="btn btn--ghost" @click.stop="toggleFav(v)">
                  <AppIcon :name="user.isFavorite(v.id) ? 'heart-fill' : 'heart'" :size="13" />
                  {{ user.isFavorite(v.id) ? '已收藏' : '收藏' }}
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div v-else class="empty">
          <div class="empty__icon">🔍</div>
          <p>没有找到「{{ keyword }}」相关的内容</p>
          <p class="weak" style="margin-top: 6px">
            本站只收录可直接播放的公开授权片源，可到正版平台继续查找
          </p>
          <div class="official-links">
            <a
              v-for="item in officialLinks"
              :key="item.name"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn--ghost"
            >
              {{ item.name }}
            </a>
          </div>
        </div>
      </template>

      <!-- 默认发现页 -->
      <template v-else>
        <section v-if="user.searchHistory.length" class="section">
          <div class="section__head">
            <h2 class="section__title">搜索历史</h2>
            <button type="button" class="section__more" @click="user.clearSearch()">清空</button>
          </div>
          <div class="search__words">
            <span v-for="h in user.searchHistory" :key="h" class="search__word">
              <button type="button" @click="searchWord(h)">{{ h }}</button>
              <button type="button" class="search__word-del" @click="user.removeSearch(h)">
                <AppIcon name="close" :size="11" />
              </button>
            </span>
          </div>
        </section>

        <section class="section">
          <div class="section__head">
            <h2 class="section__title">大家都在搜</h2>
          </div>
          <ol class="hotwords">
            <li v-for="(word, i) in HOT_SEARCH" :key="word" @click="searchWord(word)">
              <span class="hotwords__no" :class="{ 'is-top': i < 3 }">{{ i + 1 }}</span>
              <span class="hotwords__text ellipsis">{{ word }}</span>
              <span v-if="i < 3" class="hotwords__hot">热</span>
            </li>
          </ol>
        </section>

        <section class="section">
          <div class="section__head">
            <h2 class="section__title">搜索发现</h2>
          </div>
          <div class="discover">
            <div v-for="d in SEARCH_DISCOVER" :key="d.title" class="discover__card">
              <h4>{{ d.title }}</h4>
              <div class="discover__list">
                <button v-for="k in d.keywords" :key="k" type="button" @click="searchWord(k)">
                  {{ k }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.search__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.search__back {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  color: var(--text);
}

.search__input {
  flex: 1;
  min-width: 0;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 19px;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  color: var(--text-weak);
}

.search__input input {
  flex: 1;
  min-width: 0;
  height: 34px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text);
}

.search__input input::-webkit-search-cancel-button {
  display: none;
}

.search__clear {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.12);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.search__go {
  flex: none;
  height: 36px;
  padding: 0 14px;
  border-radius: 18px;
  background: var(--brand-grad);
  color: #fff;
  font-size: 14px;
}

.search__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0 12px;
  font-size: 13px;
  color: var(--text-sub);
}

.search__meta b {
  color: var(--brand);
}

.search__sorts {
  display: flex;
  gap: 6px;
  flex: none;
}

.search__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rrow {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s;
}

.rrow:hover {
  transform: translateY(-2px);
}

.rrow__poster {
  width: 96px;
  flex: none;
  border-radius: 8px;
  overflow: hidden;
}

.rrow__body {
  flex: 1;
  min-width: 0;
}

.rrow__title {
  font-size: 15.5px;
  font-weight: 700;
}

.rrow__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-weak);
}

.rrow__score {
  color: #ff8a3d;
  font-weight: 700;
}

.rrow__desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.6;
}

.rrow__actors {
  margin-top: 4px;
  font-size: 12px;
}

.rrow__ops {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.search__words {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search__word {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 8px 0 12px;
  border-radius: 15px;
  background: var(--surface);
  font-size: 13px;
  color: var(--text-sub);
}

.search__word-del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  color: var(--text-weak);
}

.hotwords {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 14px;
}

.hotwords li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 4px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
}

.hotwords li:hover {
  background: var(--brand-soft);
}

.hotwords__no {
  width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  font-style: italic;
  color: var(--text-weak);
  flex: none;
}

.hotwords__no.is-top {
  color: var(--brand);
}

.hotwords__text {
  flex: 1;
  min-width: 0;
}

.hotwords__hot {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--brand-grad);
  color: #fff;
  flex: none;
}

.discover {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.discover__card {
  padding: 12px;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.discover__card h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
}

.discover__list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.discover__list button {
  font-size: 13px;
  color: var(--text-sub);
}

.discover__list button:hover {
  color: var(--brand);
}

.official-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

@media (min-width: 768px) {
  .search__bar {
    gap: 12px;
    margin-bottom: 20px;
  }

  .search__back {
    display: none;
  }

  .search__input {
    height: 42px;
    padding: 0 16px;
  }

  .search__go {
    height: 42px;
    padding: 0 24px;
    font-size: 15px;
  }

  .rrow__poster {
    width: 120px;
  }

  .hotwords {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .discover {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
