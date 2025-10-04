<template>
  <div
    class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    :class="{ 'border-l-4 border-l-red-500': announcement.urgent }" @click="$emit('click')">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">
            {{ announcement.title }}
          </h3>
          <div class="flex space-x-1">
            <span v-if="announcement.urgent"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <ExclamationTriangleIcon class="w-3 h-3 mr-1" />
              Urgente
            </span>
            <span v-if="!isRead"
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Nuevo
            </span>
          </div>
        </div>

        <!-- Author and Date -->
        <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div class="flex items-center space-x-2">
            <img
              :src="announcement.author.avatar_path || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=50'"
              :alt="announcement.author.name" class="w-6 h-6 rounded-full object-cover">
            <span>{{ announcement.author.name }}</span>
          </div>
          <span>•</span>
          <span>{{ formatDate(announcement.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- Content Preview -->
    <div class="mb-4">
      <p class="text-gray-700 text-sm line-clamp-3">
        {{ announcement.body_md }}
      </p>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-100">
      <div class="flex items-center space-x-4 text-xs text-gray-500">
        <div class="flex items-center space-x-1">
          <EyeIcon class="w-4 h-4" />
          <span>{{ announcement.reads.length }} lectura{{ announcement.reads.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <ChevronRightIcon class="w-4 h-4 text-gray-400" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { Announcement } from '@/types/announcements'
import {
  ExclamationTriangleIcon,
  PaperClipIcon,
  EyeIcon,
  GlobeAltIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

interface Props {
  announcement: Announcement
}

const props = defineProps<Props>()
const { user } = useAuth()

defineEmits<{
  click: []
}>()

const isRead = computed(() => {
  return user.value ? props.announcement.reads.includes(user.value.id) : false
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`
  }

  if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `Hace ${hours}h`
  }

  if (diffInMinutes < 10080) {
    const days = Math.floor(diffInMinutes / 1440)
    return `Hace ${days}d`
  }

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>