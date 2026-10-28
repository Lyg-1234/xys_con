<script setup>
import { computed, ref } from 'vue'
import RankItem from '@/components/RankItem.vue'
import PageBar from '@/components/PageBar.vue'
import VideoCard from '@/components/VideoCard.vue'
import { RANK_GROUPS, RANK_TABS, rankList } from '@/data/extra'

const activeTab = ref('hot')

const groups = computed(() =>
  RANK_GROUPS.map((g) => ({
    ...g,
    list: rankList(g.key, activeTab.value, 8)
  }))
)

const champion = computed(() => rankList('all', activeTab.value, 6))

function trend(index) {
  if (activeTab.value === 'hot') return index < 3 ? '热' : ''
  if (activeTab.value === 'new') return index < 3 ? '新' : ''
  return ''
}
</script>

<template>
  <div class="page">
    <div class="container">
      <PageBar title="排行榜" subtitle="每日 10:00 更新" />

      <div class="rank-tabs">
        <button
          v-for="t in RANK_TABS"
          :key="t.key"
          type="button"
          class="chip"
          :class="{ 'is-active': activeTab === t.key }"
          @click="activeTab = t.key"
        >
          {{ t.name }}
        </button>
      </div>

      <!-- 冠军专区 -->
      <section class="section">
        <div class="section__head">
          <h2 class="section__title">榜上有名</h2>
        </div>
        <div class="card-grid card-grid--wide">
          <VideoCard v-for="v in champion" :key="v.id" :video="v" wide :show-meta="false" />
        </div>
      </section>

      <div class="rank-grid">
        <section v-for="g in groups" :key="g.key" class="surface rank-panel">
          <h3 class="rank-panel__title">{{ g.name }}榜</h3>
          <RankItem
            v-for="(v, i) in g.list"
            :key="v.id"
            :video="v"
            :index="i"
            :trend="trend(i)"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rank-tabs {
  display: flex;
  gap: 8px;
  padding: 4px 0 8px;
  overflow-x: auto;
}

.rank-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  margin-top: 24px;
}

.rank-panel {
  padding: 10px 8px 14px;
}

.rank-panel__title {
  font-size: 15px;
  font-weight: 700;
  padding: 4px 10px 8px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 6px;
}

@media (min-width: 768px) {
  .rank-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }
}
</style>
