import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 项目站：<user>.github.io/<repo>/ 需与仓库名一致
const GITHUB_PAGES_BASE = '/doBell/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',
}))
