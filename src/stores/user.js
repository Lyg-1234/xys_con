import { defineStore } from 'pinia'

const STORAGE_KEY = 'cloud-video-app-state-v1'
const MAX_HISTORY = 60
const MAX_SEARCH = 12

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (e) {
    return {}
  }
}

const persisted = loadPersisted()

const DEFAULT_SETTINGS = {
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
}

function mergeSettings(input) {
  return { ...DEFAULT_SETTINGS, ...(input && typeof input === 'object' ? input : {}) }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: persisted.profile || { name: '手机踹屁兜', emoji: '🎬' },
    isLogin: !!persisted.isLogin,
    isVip: !!persisted.isVip,
    vipType: persisted.vipType || '',
    vipExpire: persisted.vipExpire || 0,
    favorites: Array.isArray(persisted.favorites) ? persisted.favorites : [],
    history: Array.isArray(persisted.history) ? persisted.history : [],
    searchHistory: Array.isArray(persisted.searchHistory) ? persisted.searchHistory : [],
    settings: mergeSettings(persisted.settings)
  }),

  getters: {
    favoriteCount: (s) => s.favorites.length,
    historyCount: (s) => s.history.length,
    vipExpireText: (s) => {
      if (!s.isVip || !s.vipExpire) return ''
      return new Date(s.vipExpire).toLocaleDateString('zh-CN')
    },
    isFavorite: (s) => (id) => s.favorites.includes(id),
    /** 取某视频的观看进度记录 */
    historyOf: (s) => (id) => s.history.find((h) => h.id === id) || null
  },

  actions: {
    login(name = '手机踹屁兜') {
      this.isLogin = true
      this.profile = { ...this.profile, name }
    },

    logout() {
      this.isLogin = false
      this.isVip = false
      this.vipType = ''
      this.vipExpire = 0
    },

    toggleFavorite(id) {
      if (!id) return false
      const index = this.favorites.indexOf(id)
      if (index > -1) {
        this.favorites.splice(index, 1)
        return false
      }
      this.favorites.unshift(id)
      return true
    },

    removeFavorite(id) {
      this.favorites = this.favorites.filter((x) => x !== id)
    },

    /**
     * 记录观看历史
     * @param {{id:string,title:string,poster:string,epiIndex:number,epiTitle:string,time:number,duration:number,updateText:string}} payload
     */
    recordHistory(payload) {
      if (!payload || !payload.id) return
      const item = { ...payload, at: Date.now() }
      const index = this.history.findIndex((h) => h.id === item.id)
      if (index > -1) this.history.splice(index, 1)
      this.history.unshift(item)
      if (this.history.length > MAX_HISTORY) this.history.length = MAX_HISTORY
    },

    removeHistory(id) {
      this.history = this.history.filter((h) => h.id !== id)
    },

    clearHistory() {
      this.history = []
    },

    pushSearch(keyword) {
      const kw = String(keyword || '').trim()
      if (!kw) return
      this.searchHistory = [kw, ...this.searchHistory.filter((k) => k !== kw)].slice(0, MAX_SEARCH)
    },

    removeSearch(keyword) {
      this.searchHistory = this.searchHistory.filter((k) => k !== keyword)
    },

    clearSearch() {
      this.searchHistory = []
    },

    updateSettings(patch = {}) {
      this.settings = { ...this.settings, ...patch }
    },

    /** 开通/续费会员（模拟） */
    activateVip(plan) {
      const days = Number(plan && plan.days) || 30
      const base = this.vipExpire > Date.now() ? this.vipExpire : Date.now()
      this.isVip = true
      this.vipType = (plan && plan.name) || 'VIP 会员'
      this.vipExpire = base + days * 24 * 60 * 60 * 1000
      this.isLogin = true
    },

    persist(state = this.$state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (e) {
        /* 忽略隐私模式下的写入异常 */
      }
    },

    resetAll() {
      this.favorites = []
      this.history = []
      this.searchHistory = []
      this.settings = { ...DEFAULT_SETTINGS }
      this.isVip = false
      this.vipType = ''
      this.vipExpire = 0
      this.isLogin = false
    }
  }
})
