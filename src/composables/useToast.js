import { reactive, readonly } from 'vue'

const state = reactive({ list: [] })
let seed = 0

function dismiss(id) {
  const index = state.list.findIndex((t) => t.id === id)
  if (index > -1) state.list.splice(index, 1)
}

/**
 * 全局轻提示
 * @param {string} text 文本
 * @param {{type?:'info'|'success'|'error', duration?:number}} options
 */
export function toast(text, options = {}) {
  const id = ++seed
  state.list.push({ id, text, type: options.type || 'info' })
  if (state.list.length > 3) state.list.shift()
  setTimeout(() => dismiss(id), options.duration || 2200)
  return id
}

export function useToast() {
  return { list: readonly(state.list), toast, dismiss }
}
