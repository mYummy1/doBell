import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * GitHub Pages 项目站地址为 https://<user>.github.io/<repo>/
 * - CI 中可使用环境变量 GITHUB_REPOSITORY=owner/repo，自动取 repo 作为 base
 * - 本地模拟：VITE_BASE_PATH=my-repo npm run build
 */
function productionBase(): string {
  const fromEnv = process.env.VITE_BASE_PATH?.trim()
  if (fromEnv) {
    const s = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`
    return s.endsWith('/') ? s : `${s}/`
  }
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]?.trim()
  if (repo) return `/${repo}/`
  return '/du-bei/'
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? productionBase() : '/',
}))
