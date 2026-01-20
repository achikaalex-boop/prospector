<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div class="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div v-if="icon" class="text-3xl">{{ icon }}</div>
          <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-4">
        <p class="text-gray-700">{{ message }}</p>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
        <button
          @click="reject"
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200"
        >
          {{ cancelText }}
        </button>
        <button
          @click="accept"
          :class="[
            'px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200',
            variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  data() {
    return {
      isOpen: false,
      title: 'Confirmation',
      message: 'Êtes-vous sûr?',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      icon: '⚠️',
      variant: 'primary', // 'primary' ou 'danger'
      resolveCallback: null,
      rejectCallback: null
    }
  },
  methods: {
    show(options = {}) {
      this.title = options.title || 'Confirmation'
      this.message = options.message || 'Êtes-vous sûr?'
      this.confirmText = options.confirmText || 'Confirmer'
      this.cancelText = options.cancelText || 'Annuler'
      this.icon = options.icon !== undefined ? options.icon : '⚠️'
      this.variant = options.variant || 'primary'
      this.isOpen = true

      return new Promise((resolve, reject) => {
        this.resolveCallback = resolve
        this.rejectCallback = reject
      })
    },
    accept() {
      this.isOpen = false
      if (this.resolveCallback) this.resolveCallback(true)
    },
    reject() {
      this.isOpen = false
      if (this.rejectCallback) this.rejectCallback(false)
    }
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}

.fade-in {
  animation: fadeIn 0.2s ease-out;
}

.zoom-in-95 {
  animation: zoomIn 0.2s ease-out;
}

.duration-200 {
  animation-duration: 0.2s;
}
</style>
