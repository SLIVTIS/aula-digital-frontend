<template>
  <div class="text-center py-12">
    <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-600" />
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{{ message }}</p>
    <button
      v-if="showRetry"
      @click="$emit('retry')"
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
    >
      Reintentar
    </button>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

interface Props {
  title?: string
  message?: string
  showRetry?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Ha ocurrido un error',
  message: 'Por favor, inténtalo de nuevo más tarde.',
  showRetry: true
})

defineEmits<{
  retry: []
}>()
</script>