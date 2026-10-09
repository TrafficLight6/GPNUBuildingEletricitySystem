import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 相对路径产物：dist 可直接部署到任意目录/子路径
  base: './',
})
