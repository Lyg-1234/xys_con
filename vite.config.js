import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { copyFileSync } from 'node:fs'

function resolveBase() {
  if (process.env.VITE_BASE) return process.env.VITE_BASE
  const repo = String(process.env.GITHUB_REPOSITORY || '').split('/').filter(Boolean).pop()
  return process.env.GITHUB_ACTIONS === 'true' && repo ? `/${repo}/` : '/xys_con/'
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'spa-pages-fallback',
      closeBundle() {
        // GitHub Pages 没有服务端路由，404 页面复用 index 才能直接刷新 /play/:id。
        copyFileSync(
          new URL('./dist/index.html', import.meta.url),
          new URL('./dist/404.html', import.meta.url)
        )
      }
    }
  ],
  // 本地与 GitHub Pages 都使用 /仓库名/；GitHub Actions 会按仓库名自动识别。
  base: resolveBase(),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5173
  },
  build: {
    chunkSizeWarningLimit: 1500
  }
})
