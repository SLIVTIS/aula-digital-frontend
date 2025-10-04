<template>
  <AppShell>
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <div class="flex items-center space-x-2 mb-4">
          <button @click="router.back()"
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>

        <h1 class="text-2xl font-bold text-gray-900">Crear Nuevo Aviso</h1>
        <p class="mt-2 text-sm text-gray-600">
          Comparte información importante con los padres de familia
        </p>
      </div>

      <!-- Form Container -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <AnnouncementForm :loading="creating" :available-groups="availableGroups" @cancel="handleCancel" />
      </div>

      <!-- Success Message -->
      <div v-if="showSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="w-6 h-6 text-green-500" />
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gray-900">¡Aviso publicado!</h3>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Tu aviso ha sido publicado exitosamente y las notificaciones han sido enviadas.
          </p>
          <div class="flex justify-end space-x-3">
            <button @click="goToAnnouncements"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Ver todos los avisos
            </button>
            <button @click="createAnother"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
              Crear otro aviso
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { Announcement } from '@/types/announcements'
import AppShell from '@/components/ui/AppShell.vue'
import AnnouncementForm from '@/components/announcements/AnnouncementForm.vue'
import {
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { user } = useAuth()


const creating = ref(false)
const showSuccess = ref(false)

const availableGroups = computed(() => {
  if (user.value?.role === 'admin') {
    return ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B']
  } else if (user.value?.role === 'teacher') {
    return user.value.groups || []
  }
  return []
})

const handleCancel = () => {
  if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.')) {
    router.back()
  }
}

const goToAnnouncements = () => {
  showSuccess.value = false
  router.push('/announcements')
}

const createAnother = () => {
  showSuccess.value = false
  // Reset form by reloading the component
  router.go(0)
}
</script>