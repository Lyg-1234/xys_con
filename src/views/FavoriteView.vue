<script setup>
import { computed } from 'vue'
import PageBar from '@/components/PageBar.vue'
import VideoCard from '@/components/VideoCard.vue'
import { getVideo } from '@/data/videos'
import { useUserStore } from '@/stores/user'

const user = useUserStore()

const list = computed(() => user.favorites.map((id) => getVideo(id)).filter(Boolean))
</script>

<template>
  <div class="page">
    <div class="container">
      <PageBar title="我的收藏" :subtitle="`已收藏 ${list.length} 部影片`" />

      <div v-if="list.length" class="card-grid">
        <VideoCard v-for="v in list" :key="v.id" :video="v" />
      </div>

      <div v-else class="empty">
        <div class="empty__icon">💛</div>
        <p>收藏夹空空的，去看点什么吧</p>
        <RouterLink to="/" class="btn btn--primary" style="margin-top: 14px">去首页逛逛</RouterLink>
      </div>
    </div>
  </div>
</template>
