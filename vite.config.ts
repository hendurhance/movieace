import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import variables from  "./src/assets/css/_variable.scss"
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${"/src/assets/css/_variable.scss"}";`
      }
    }
  }
})
