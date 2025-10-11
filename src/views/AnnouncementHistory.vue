<template>
  <AppShell>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Historial de Avisos</h1>
          <p class="mt-2 text-sm text-gray-700">
            Gestiona todos los avisos publicados
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <router-link to="/announcements/create"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
            <PlusIcon class="w-4 h-4 mr-2" />
            Nuevo Aviso
          </router-link>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input v-model="searchTerm" type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Buscar avisos..." @input="debouncedSearch">
            </div>
          </div>

          <!-- Date Filter -->
          <div>
            <select v-model="dateFilter"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              @change="handleFilterChange">
              <option value="">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select v-model="statusFilter"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              @change="handleFilterChange">
              <option value="">Todos los estados</option>
              <option value="urgent">Solo urgentes</option>
              <option value="general">Solo generales</option>
              <option value="group">Por grupos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                <SpeakerWaveIcon class="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Avisos</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ totalAnnouncements }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <EyeIcon class="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Promedio Lectura</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ averageReadRate }}%</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <CalendarIcon class="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Este Mes</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ thisMonthCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Announcements Table -->
      <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="p-6">
          <div class="animate-pulse space-y-4">
            <div v-for="i in 5" :key="i" class="flex space-x-4">
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAnnouncements.length === 0">
          <EmptyState type="announcements" title="No hay avisos"
            description="No se encontraron avisos con los filtros aplicados.">
            <template #action>
              <button @click="clearFilters"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Limpiar filtros
              </button>
            </template>
          </EmptyState>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aviso
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirigido a
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lecturas
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="announcement in filteredAnnouncements" :key="announcement.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <p class="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {{ announcement.title }}
                        </p>
                      </div>
                      <p class="text-sm text-gray-500 truncate max-w-xs">
                        {{ announcement.body_md }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="announcement.visibility === 'all'" class="flex items-center">
                    <GlobeAltIcon class="w-4 h-4 text-gray-400 mr-1" />
                    <span class="text-sm text-gray-900">General</span>
                  </div>
                  <div v-else class="flex flex-wrap gap-1">
                    <span v-for="item in announcement.targets.slice(0, 2)" :key="`${item.target_type}-${item.id}`"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      <template v-if="item.target_type === 'group'">
                        {{ item.group?.name ?? 'Grupo' }}
                      </template>
                      <template v-else-if="item.target_type === 'user'">
                        {{ item.user?.name ?? 'Usuario' }}
                      </template>
                    </span>

                    <span v-if="announcement.targets.length > 2" class="text-xs text-gray-500">
                      +{{ announcement.targets.length - 2 }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span>{{ announcement.reads.length }}/{{ getRecipientCount(announcement) }}</span>
                        <span class="text-xs text-gray-500 ml-2">
                          {{ Math.round((announcement.reads.length / getRecipientCount(announcement)) * 100) }}%
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div class="bg-green-600 h-1.5 rounded-full"
                          :style="{ width: `${(announcement.reads.length / getRecipientCount(announcement)) * 100}%` }">
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(announcement.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button @click="viewAnnouncement(announcement.id)" class="text-primary-600 hover:text-primary-900">
                      <EyeIcon class="w-4 h-4" />
                    </button>
                    <button v-if="canEdit(announcement)" class="text-gray-600 hover:text-gray-900">
                      <PencilIcon class="w-4 h-4" />
                    </button>
                    <button v-if="canDelete(announcement)" @click="confirmDelete(announcement)"
                      class="text-red-600 hover:text-red-900">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="w-6 h-6 text-red-500" />
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gray-900">Eliminar Aviso</h3>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            ¿Estás seguro de que quieres eliminar este aviso? Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end space-x-3">
            <button @click="showDeleteModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button @click="deleteAnnouncement" :disabled="deleting"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
              <div v-if="deleting" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </div>
              <span v-else>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAnnouncementHistory } from '@/composables/useAnnouncementHistory'
import { useDebounceFn } from '@vueuse/core'
import type { Announcement } from '@/types/announcements'
import AppShell from '@/components/ui/AppShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  GlobeAltIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { user, isAdmin, isTeacher } = useAuth()
const announcementsStore = useAnnouncementHistory()

const searchTerm = ref('')
const dateFilter = ref('')
const statusFilter = ref('')
const showDeleteModal = ref(false)
const announcementToDelete = ref<Announcement | null>(null)
const deleting = ref(false)

const { announcements, loading } = useAnnouncementHistory()

console.log(announcements)

const filteredAnnouncements = computed(() => {
  let filtered = [...announcements.value]

  // Apply search filter
  if (searchTerm.value.trim()) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(search) ||
      a.body_md.toLowerCase().includes(search)
    )
  }

  // Apply date filter
  if (dateFilter.value) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    filtered = filtered.filter(a => {
      const announcementDate = new Date(a.created_at)

      switch (dateFilter.value) {
        case 'today':
          return announcementDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return announcementDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
          return announcementDate >= monthAgo
        default:
          return true
      }
    })
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const totalAnnouncements = computed(() => announcements.value.length)
const thisMonthCount = computed(() => {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return announcements.value.filter(a => new Date(a.created_at) >= thisMonth).length
})

const averageReadRate = computed(() => {
  if (announcements.value.length === 0) return 0

  const totalReadRate = announcements.value.reduce((sum, a) => {
    const recipients = getRecipientCount(a)
    return sum + (recipients > 0 ? (a.reads.length / recipients) * 100 : 0)
  }, 0)

  return Math.round(totalReadRate / announcements.value.length)
})

const debouncedSearch = useDebounceFn(() => {
  // La búsqueda es reactiva a través de la propiedad calculada
}, 500)

const handleFilterChange = () => {
  // Los filtros son reactivos a través de propiedades calculadas
}

const clearFilters = () => {
  searchTerm.value = ''
  dateFilter.value = ''
  statusFilter.value = ''
}

//Para calcular el porcentaje de leidos
const getRecipientCount = (announcement: Announcement): number => {
  return announcement.visibility === 'all' ? 50 : (announcement.targets.length * 10)
}

const canEdit = (announcement: Announcement): boolean => {
  return isAdmin.value || (isTeacher.value && announcement.author.id === user.value?.id)
}

const canDelete = (announcement: Announcement): boolean => {
  return isAdmin.value || (isTeacher.value && announcement.author.id === user.value?.id)
}

const viewAnnouncement = (id: number) => {
  router.push(`/announcements/${id}`)
}

const confirmDelete = (announcement: Announcement) => {
  announcementToDelete.value = announcement
  showDeleteModal.value = true
}

const deleteAnnouncement = async () => {
  if (!announcementToDelete.value) return

  deleting.value = true
  try {
    // Mock delete - in real app would make API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Remove from store
    const index = announcements.value.findIndex(a => a.id === announcementToDelete.value!.id)
    if (index > -1) {
      announcements.value.splice(index, 1)
    }

    showDeleteModal.value = false
    announcementToDelete.value = null
  } catch (error) {
    console.error('Failed to delete announcement:', error)
  } finally {
    deleting.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

</script>