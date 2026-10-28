<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import { getComments } from '@/data/extra'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'

const props = defineProps({
  videoId: { type: String, required: true }
})

const user = useUserStore()

const order = ref('hot')
const draft = ref('')
const base = ref([])
const mine = ref([])

const AVATARS = ['🐳', '🦊', '🐼', '🐯', '🦁', '🐨', '🐸', '🐙', '🦉', '🦋']

watch(
  () => props.videoId,
  (id) => {
    base.value = getComments(id)
    mine.value = []
  },
  { immediate: true }
)

const all = computed(() => [...mine.value, ...base.value])

const list = computed(() => {
  const arr = all.value.slice()
  if (order.value === 'new') {
    return arr.sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || b.weight - a.weight)
  }
  return arr.sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || b.likes - a.likes)
})

function toggleLike(item) {
  item.liked = !item.liked
  item.likes += item.liked ? 1 : -1
}

function publish() {
  const text = draft.value.trim()
  if (!text) {
    toast('说点什么吧～')
    return
  }
  mine.value.unshift({
    id: `mine-${Date.now()}`,
    user: user.isLogin ? user.profile.name : '我',
    emoji: user.profile.emoji,
    vip: user.isVip,
    level: 1,
    text,
    likes: 0,
    replies: 0,
    time: '刚刚',
    liked: false,
    mine: true,
    weight: Date.now()
  })
  draft.value = ''
  toast('评论发布成功', { type: 'success' })
}
</script>

<template>
  <section class="cmt">
    <div class="cmt__head">
      <h3 class="cmt__title">评论 <span class="weak">{{ all.length }}</span></h3>
      <div class="cmt__order">
        <button type="button" :class="{ 'is-active': order === 'hot' }" @click="order = 'hot'">
          最热
        </button>
        <span class="cmt__divider">|</span>
        <button type="button" :class="{ 'is-active': order === 'new' }" @click="order = 'new'">
          最新
        </button>
      </div>
    </div>

    <div class="cmt__editor">
      <span class="cmt__avatar">{{ user.profile.emoji }}</span>
      <textarea
        v-model="draft"
        rows="1"
        maxlength="200"
        placeholder="发一条友善的评论吧～"
        @keydown.ctrl.enter.prevent="publish"
        @keydown.meta.enter.prevent="publish"
      />
      <button type="button" class="cmt__publish" @click="publish">发布</button>
    </div>

    <ul v-if="list.length" class="cmt__list">
      <li v-for="(c, i) in list" :key="c.id" class="cmt__item">
        <span class="cmt__avatar" :class="{ 'cmt__avatar--vip': c.vip }">
          {{ AVATARS[i % AVATARS.length] }}
        </span>
        <div class="cmt__body">
          <p class="cmt__author">
            <span class="cmt__name ellipsis">{{ c.user }}</span>
            <span v-if="c.vip" class="badge badge--vip">VIP {{ c.level }}</span>
            <span v-if="c.mine" class="cmt__mine">我发布的</span>
          </p>
          <p class="cmt__text">{{ c.text }}</p>
          <p class="cmt__ops">
            <span class="weak">{{ c.time }}</span>
            <span class="cmt__replies weak">{{ c.replies }} 条回复</span>
            <button type="button" class="cmt__like" :class="{ 'is-liked': c.liked }" @click="toggleLike(c)">
              <AppIcon :name="c.liked ? 'thumb-up' : 'thumb-up'" :size="14" />
              <span>{{ c.likes || '' }}</span>
            </button>
          </p>
        </div>
      </li>
    </ul>

    <div v-else class="empty">
      <div class="empty__icon">💬</div>
      <p>还没有评论，来抢占沙发～</p>
    </div>
  </section>
</template>

<style scoped>
.cmt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cmt__title {
  font-size: 16px;
  font-weight: 700;
}

.cmt__title span {
  font-size: 13px;
  font-weight: 400;
}

.cmt__order button {
  font-size: 13px;
  color: var(--text-weak);
}

.cmt__order button.is-active {
  color: var(--brand);
  font-weight: 600;
}

.cmt__divider {
  color: var(--line-strong);
  margin: 0 6px;
  font-size: 12px;
}

.cmt__editor {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.cmt__editor textarea {
  flex: 1;
  min-width: 0;
  min-height: 38px;
  max-height: 120px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--line-strong);
  background: var(--surface-2);
  outline: none;
  resize: vertical;
  font-size: 13.5px;
  line-height: 1.6;
}

.cmt__editor textarea:focus {
  border-color: var(--brand);
  background: #fff;
}

.cmt__publish {
  flex: none;
  height: 38px;
  padding: 0 16px;
  border-radius: 19px;
  background: var(--brand-grad);
  color: #fff;
  font-size: 13.5px;
}

.cmt__avatar {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  border: 1px solid var(--line);
  font-size: 18px;
}

.cmt__avatar--vip {
  background: linear-gradient(135deg, #fff3d6, #ffd88a);
  border-color: #ffce54;
}

.cmt__list {
  margin-top: 8px;
}

.cmt__item {
  display: flex;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}

.cmt__body {
  flex: 1;
  min-width: 0;
}

.cmt__author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cmt__name {
  font-size: 13px;
  color: var(--text-sub);
  font-weight: 600;
  max-width: 40%;
}

.cmt__mine {
  font-size: 10px;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--brand-soft);
  color: var(--brand);
}

.cmt__text {
  margin-top: 5px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.cmt__ops {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  font-size: 12px;
}

.cmt__like {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  color: var(--text-weak);
  font-size: 12px;
}

.cmt__like.is-liked {
  color: var(--brand);
}
</style>
