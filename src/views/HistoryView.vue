<script setup>
import PageBar from '@/components/PageBar.vue'
import HistoryCard from '@/components/HistoryCard.vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'

const user = useUserStore()

function remove(record) {
  user.removeHistory(record.id)
  toast('已删除该条记录')
}

function clearAll() {
  if (!user.historyCount) return
  if (window.confirm('确定清空全部观看记录吗？')) {
    user.clearHistory()
    toast('观看记录已清空')
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <PageBar title="观看历史" :subtitle="`共 ${user.historyCount} 条记录`">
        <template #right>
          <button v-if="user.historyCount" type="button" class="btn btn--ghost" @click="clearAll">
            清空
          </button>
        </template>
      </PageBar>

      <div v-if="user.history.length" class="card-grid card-grid--wide">
        <HistoryCard
          v-for="r in user.history"
          :key="r.id"
          :record="r"
          show-delete
          @remove="remove"
        />
      </div>

      <div v-else class="empty">
        <div class="empty__icon">🕘</div>
        <p>还没有观看记录</p>
        <RouterLink to="/" class="btn btn--primary" style="margin-top: 14px">去发现好片</RouterLink>
      </div>
    </div>
  </div>
</template>
