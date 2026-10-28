import { onMounted, onUnmounted, ref } from 'vue'

function match(query) {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

/**
 * 响应式断点：
 * - isMobile: < 768
 * - isTablet: 768 ~ 1023
 * - isDesktop: >= 1024
 * - isWide: >= 1440
 */
export function useMediaQuery() {
  const isMobile = ref(match('(max-width: 767px)'))
  const isTablet = ref(match('(min-width: 768px) and (max-width: 1023px)'))
  const isDesktop = ref(match('(min-width: 1024px)'))
  const isWide = ref(match('(min-width: 1440px)'))

  let mql = []
  const handler = () => {
    isMobile.value = match('(max-width: 767px)')
    isTablet.value = match('(min-width: 768px) and (max-width: 1023px)')
    isDesktop.value = match('(min-width: 1024px)')
    isWide.value = match('(min-width: 1440px)')
  }

  onMounted(() => {
    handler()
    const queries = [
      '(max-width: 767px)',
      '(min-width: 768px) and (max-width: 1023px)',
      '(min-width: 1024px)',
      '(min-width: 1440px)'
    ]
    mql = queries.map((q) => window.matchMedia(q))
    mql.forEach((m) => m.addEventListener('change', handler))
  })

  onUnmounted(() => {
    mql.forEach((m) => m.removeEventListener('change', handler))
  })

  return { isMobile, isTablet, isDesktop, isWide }
}
