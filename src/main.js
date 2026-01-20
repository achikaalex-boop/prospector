import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primevue/themes/aura'
import ConfirmModal from './components/ConfirmModal.vue'
import 'primeicons/primeicons.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
      cssLayer: false,
    },
    semantic: {
      primary: {
        50: '{gray.50}',
        100: '{gray.100}',
        200: '{gray.200}',
        300: '{gray.300}',
        400: '{gray.400}',
        500: '{gray.500}',
        600: '{gray.600}',
        700: '{gray.700}',
        800: '{gray.800}',
        900: '{gray.900}',
        color: '#ffffff',
        contrastColor: '#ffffff',
        hoverColor: '{gray.700}',
        activeColor: '{gray.800}'
      }
    }
  }
})
app.use(ToastService)
app.use(ConfirmationService)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)
app.component('ConfirmModal', ConfirmModal)

// Create confirm modal instance for global use
let confirmModalInstance = null
app.config.globalProperties.$showConfirm = function(options) {
  if (!confirmModalInstance) {
    confirmModalInstance = app._context.components.ConfirmModal
  }
  // This will be set via provide/inject in App.vue
}

app.mount('#app')

