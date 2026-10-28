<script setup>
import PageBar from '@/components/PageBar.vue'
import AppIcon from '@/components/AppIcon.vue'
import { QUALITY_LIST } from '@/data/videos'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/useToast'

const user = useUserStore()

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const DMK_SIZES = [
  { key: 'sm', name: '小' },
  { key: 'md', name: '中' },
  { key: 'lg', name: '大' }
]
const DMK_AREAS = [
  { key: 'quarter', name: '顶部 1/3' },
  { key: 'half', name: '半屏' },
  { key: 'full', name: '全屏' }
]

function update(patch) {
  user.updateSettings(patch)
}

function reset() {
  if (window.confirm('恢复默认播放设置？')) {
    user.updateSettings({
      autoNext: true,
      autoPlay: true,
      quality: '1080p',
      volume: 0.8,
      muted: false,
      speed: 1,
      danmaku: true,
      dmkOpacity: 0.85,
      dmkSize: 'md',
      dmkArea: 'half',
      theater: false,
      remember: true
    })
    toast('已恢复默认设置')
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <PageBar title="播放设置" subtitle="设置会自动保存在本机浏览器" />

      <section class="surface set">
        <h3 class="set__title">播放</h3>

        <div class="set__row">
          <div>
            <p>自动连播</p>
            <span class="weak">播完自动播放下一集</span>
          </div>
          <button
            type="button"
            class="set__switch"
            :class="{ 'is-on': user.settings.autoNext }"
            @click="update({ autoNext: !user.settings.autoNext })"
          >
            <i />
          </button>
        </div>

        <div class="set__row">
          <div>
            <p>进入播放页自动播放</p>
            <span class="weak">浏览器策略可能仍需手动点击一次</span>
          </div>
          <button
            type="button"
            class="set__switch"
            :class="{ 'is-on': user.settings.autoPlay }"
            @click="update({ autoPlay: !user.settings.autoPlay })"
          >
            <i />
          </button>
        </div>

        <div class="set__row">
          <div>
            <p>记住播放进度</p>
            <span class="weak">下次观看自动续播</span>
          </div>
          <button
            type="button"
            class="set__switch"
            :class="{ 'is-on': user.settings.remember }"
            @click="update({ remember: !user.settings.remember })"
          >
            <i />
          </button>
        </div>

        <div class="set__row">
          <div>
            <p>影院模式</p>
            <span class="weak">加宽播放器显示区域</span>
          </div>
          <button
            type="button"
            class="set__switch"
            :class="{ 'is-on': user.settings.theater }"
            @click="update({ theater: !user.settings.theater })"
          >
            <i />
          </button>
        </div>

        <div class="set__row">
          <div><p>默认清晰度</p></div>
          <select :value="user.settings.quality" @change="update({ quality: $event.target.value })">
            <option v-for="q in QUALITY_LIST" :key="q.key" :value="q.key">{{ q.label }}</option>
          </select>
        </div>

        <div class="set__row">
          <div><p>默认倍速</p></div>
          <select
            :value="user.settings.speed"
            @change="update({ speed: Number($event.target.value) })"
          >
            <option v-for="s in SPEEDS" :key="s" :value="s">{{ s }}x</option>
          </select>
        </div>

        <div class="set__row">
          <div><p>默认音量</p></div>
          <div class="set__slider">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="user.settings.volume"
              @input="update({ volume: Number($event.target.value) })"
            />
            <span>{{ Math.round(user.settings.volume * 100) }}%</span>
          </div>
        </div>
      </section>

      <section class="surface set">
        <h3 class="set__title">弹幕</h3>

        <div class="set__row">
          <div>
            <p>弹幕开关</p>
            <span class="weak">关闭后播放器不再显示弹幕</span>
          </div>
          <button
            type="button"
            class="set__switch"
            :class="{ 'is-on': user.settings.danmaku }"
            @click="update({ danmaku: !user.settings.danmaku })"
          >
            <i />
          </button>
        </div>

        <div class="set__row">
          <div><p>不透明度</p></div>
          <div class="set__slider">
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              :value="user.settings.dmkOpacity"
              @input="update({ dmkOpacity: Number($event.target.value) })"
            />
            <span>{{ Math.round(user.settings.dmkOpacity * 100) }}%</span>
          </div>
        </div>

        <div class="set__row">
          <div><p>字号</p></div>
          <div class="set__chips">
            <button
              v-for="s in DMK_SIZES"
              :key="s.key"
              type="button"
              class="chip"
              :class="{ 'is-active': user.settings.dmkSize === s.key }"
              @click="update({ dmkSize: s.key })"
            >
              {{ s.name }}
            </button>
          </div>
        </div>

        <div class="set__row">
          <div><p>显示区域</p></div>
          <div class="set__chips">
            <button
              v-for="a in DMK_AREAS"
              :key="a.key"
              type="button"
              class="chip"
              :class="{ 'is-active': user.settings.dmkArea === a.key }"
              @click="update({ dmkArea: a.key })"
            >
              {{ a.name }}
            </button>
          </div>
        </div>
      </section>

      <section class="surface set">
        <h3 class="set__title">快捷键</h3>
        <div class="set__keys">
          <div><kbd>空格</kbd><kbd>K</kbd><span>播放 / 暂停</span></div>
          <div><kbd>←</kbd><kbd>→</kbd><span>快退 / 快进 5 秒</span></div>
          <div><kbd>↑</kbd><kbd>↓</kbd><span>音量调节</span></div>
          <div><kbd>F</kbd><span>全屏切换</span></div>
          <div><kbd>M</kbd><span>静音切换</span></div>
        </div>
      </section>

      <div class="set__foot">
        <button type="button" class="btn btn--ghost" @click="reset">恢复默认设置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.set {
  padding: 6px 14px 10px;
  margin-bottom: 14px;
}

.set__title {
  font-size: 14px;
  font-weight: 700;
  padding: 12px 0 4px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 2px;
}

.set__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 13px 0;
  border-bottom: 1px solid var(--line);
}

.set__row:last-child {
  border-bottom: none;
}

.set__row p {
  font-size: 14px;
}

.set__row span {
  font-size: 12px;
  display: block;
  margin-top: 2px;
}

.set__switch {
  position: relative;
  width: 44px;
  height: 26px;
  flex: none;
  border-radius: 13px;
  background: rgba(0, 0, 0, 0.14);
  transition: background 0.22s;
}

.set__switch i {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.22s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.set__switch.is-on {
  background: var(--brand-grad);
}

.set__switch.is-on i {
  transform: translateX(18px);
}

.set__row select {
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--line-strong);
  background: var(--surface-2);
  outline: none;
  font-size: 13px;
}

.set__slider {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
}

.set__slider input {
  flex: 1;
  min-width: 100px;
  accent-color: var(--brand);
}

.set__slider span {
  width: 40px;
  text-align: right;
  font-size: 12.5px;
  color: var(--text-sub);
}

.set__chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.set__keys {
  padding: 12px 0;
  font-size: 13px;
  color: var(--text-sub);
  line-height: 2.2;
}

.set__keys kbd {
  display: inline-block;
  min-width: 26px;
  padding: 1px 6px;
  margin-right: 6px;
  border-radius: 5px;
  background: var(--surface-2);
  border: 1px solid var(--line-strong);
  font-size: 12px;
  text-align: center;
}

.set__foot {
  margin-top: 20px;
  text-align: center;
}
</style>
