import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // Increase chunk size warning limit to allow larger optimal chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split code into logical chunks for better caching and parallel loading
        manualChunks: {
          // PrimeVue UI library as separate chunk
          'primevue': ['primevue/config', 'primevue/toastservice', 'primevue/toast', 'primevue/confirmdialog', 'primevue/confirmationservice'],
          // Vue Router library
          'vue-router': ['vue-router'],
          // Group views by feature for better code-splitting
          'campaign': ['./src/views/Campaign.vue'],
          'dashboard': ['./src/views/Dashboard.vue'],
          'auth': ['./src/views/Login.vue', './src/views/Register.vue'],
          'pages': ['./src/views/Account.vue', './src/views/TopUp.vue', './src/views/Pricing.vue', './src/views/Techniques.vue']
        }
      }
    }
  }
})

