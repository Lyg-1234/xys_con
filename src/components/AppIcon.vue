<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 }
})

const ICONS = {
  home: '<path d="M4 11.2L12 4.5l8 6.7V19a1.2 1.2 0 0 1-1.2 1.2h-3.6v-5.5H8.8v5.5H5.2A1.2 1.2 0 0 1 4 19z"/>',
  'home-fill':
    '<path d="M4 11.2L12 4.5l8 6.7V19a1.2 1.2 0 0 1-1.2 1.2h-3.6v-5.5H8.8v5.5H5.2A1.2 1.2 0 0 1 4 19z" fill="currentColor" stroke="none"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5h3.2v14H8zM12.8 5H16v14h-3.2z" fill="currentColor" stroke="none"/>',
  prev: '<path d="M6 5h2.2v14H6zM19 5.5v13L8.6 12z" fill="currentColor" stroke="none"/>',
  next: '<path d="M15.8 5H18v14h-2.2zM5 5.5v13L15.4 12z" fill="currentColor" stroke="none"/>',
  volume:
    '<path d="M4 9.5h3.6L12 6v12l-4.4-3.5H4z" fill="currentColor" stroke="none"/><path d="M15.6 9.2a4 4 0 0 1 0 5.6"/><path d="M18.2 6.6a7.5 7.5 0 0 1 0 10.8"/>',
  mute:
    '<path d="M4 9.5h3.6L12 6v12l-4.4-3.5H4z" fill="currentColor" stroke="none"/><path d="M16 10l4.2 4M20.2 10L16 14"/>',
  fullscreen:
    '<path d="M4 9.5V5.5A1.5 1.5 0 0 1 5.5 4h4M20 14.5v4A1.5 1.5 0 0 1 18.5 20h-4M4 14.5v4A1.5 1.5 0 0 0 5.5 20h4M20 9.5v-4A1.5 1.5 0 0 0 18.5 4h-4"/>',
  exitscreen:
    '<path d="M9.5 4v4.5A1.5 1.5 0 0 1 8 10H4M14.5 20v-4.5a1.5 1.5 0 0 1 1.5-1.5h4M14.5 4v4.5A1.5 1.5 0 0 0 16 10h4M9.5 20v-4.5a1.5 1.5 0 0 0-1.5-1.5H4"/>',
  theater: '<rect x="3" y="7" width="18" height="10" rx="2.2"/><path d="M3 17.5h18M3 6.5h18"/>',
  heart:
    '<path d="M12 20s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.7 12 20 12 20z"/>',
  'heart-fill':
    '<path d="M12 20s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.7 12 20 12 20z" fill="currentColor" stroke="none"/>',
  star: '<path d="M12 4.5l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 16.5l-4.6 2.4.9-5.2L4.5 10l5.2-.8z"/>',
  'star-fill':
    '<path d="M12 4.5l2.3 4.7 5.2.8-3.8 3.7.9 5.2L12 16.5l-4.6 2.4.9-5.2L4.5 10l5.2-.8z" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.8v4.6l3 1.8"/>',
  user: '<circle cx="12" cy="9" r="3.6"/><path d="M5 20c0-3.4 3.1-6 7-6s7 2.6 7 6"/>',
  crown: '<path d="M3.2 8.5L7 11.5L12 5l5 6.5l3.8-3L17.2 19H6.8z"/>',
  'chevron-right': '<path d="M9.5 6l6 6-6 6"/>',
  'chevron-left': '<path d="M14.5 6l-6 6 6 6"/>',
  'chevron-down': '<path d="M6 9.5l6 6 6-6"/>',
  'chevron-up': '<path d="M6 14.5l6-6 6 6"/>',
  settings:
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 3.5v2.2M12 18.3V20.5M20.5 12h-2.2M5.7 12H3.5M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6M18.2 18.2l-1.6-1.6M7.4 7.4L5.8 5.8"/>',
  history: '<path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1"/><path d="M3.6 5.2v4.2h4.2"/><path d="M12 8.2v4.3l3.2 1.9"/>',
  download: '<path d="M12 4.5v10"/><path d="M7.6 10.6L12 15l4.4-4.4"/><path d="M5 19h14"/>',
  grid:
    '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  danmaku:
    '<rect x="3" y="5" width="18" height="13" rx="2.6"/><path d="M7 10.2h6.5M7 13.6h4M16 13h2.5"/>',
  'thumb-up':
    '<path d="M7.4 10.6l3.7-6a1.6 1.6 0 0 1 2.9 1.2l-1 4.2h4.3a2 2 0 0 1 2 2.4l-1.2 5.8a2 2 0 0 1-2 1.7H7.4z"/><path d="M7.4 10.6v9.3H4.6a1 1 0 0 1-1-1v-7.3a1 1 0 0 1 1-1z"/>',
  share:
    '<circle cx="17.2" cy="6.4" r="2.4"/><circle cx="6.8" cy="12" r="2.4"/><circle cx="17.2" cy="17.6" r="2.4"/><path d="M9.1 10.9l5.8-3.4M9.1 13.1l5.8 3.4"/>',
  check: '<path d="M5 12.8l4.2 4.2L19 7.2"/>',
  plus: '<path d="M12 5.5v13M5.5 12h13"/>',
  lock:
    '<rect x="5" y="10.4" width="14" height="9.6" rx="2.2"/><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4"/>',
  film:
    '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path d="M8.2 5v14M15.8 5v14M3 12h18"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.6v4.3h-4.3"/>',
  trash:
    '<path d="M4.6 7h14.8"/><path d="M9.6 7V5.6a1.2 1.2 0 0 1 1.2-1.2h2.4a1.2 1.2 0 0 1 1.2 1.2V7"/><path d="M6.6 7l.8 11.2a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4L17.4 7"/>',
  filter: '<path d="M4 6.5h16M7 12h10M10 17.5h4"/>',
  eye: '<path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.8"/>',
  monitor: '<rect x="3" y="4.5" width="18" height="12" rx="2.2"/><path d="M8.5 20.5h7M12 16.5v4"/>',
  mobile: '<rect x="7" y="3" width="10" height="18" rx="2.4"/><path d="M11 18.2h2"/>',
  'circle-play': '<circle cx="12" cy="12" r="8.4"/><path d="M10.4 8.8l5.2 3.2-5.2 3.2z" fill="currentColor" stroke="none"/>'
}

const html = computed(() => ICONS[props.name] || '<circle cx="12" cy="12" r="8"/>')
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="html"
  />
</template>

<style scoped>
.app-icon {
  display: block;
  flex: none;
}
</style>
