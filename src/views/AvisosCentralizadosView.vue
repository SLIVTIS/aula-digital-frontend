<template>
  <AppShell>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">📢 Avisos Centralizados</h1>
          <p class="mt-2 text-sm text-gray-700">
            Mantente informado sobre las actividades y noticias de la escuela
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <router-link v-if="isTeacher || isAdmin" to="/announcements/create"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
            <PlusIcon class="w-4 h-4 mr-2" />
            Nuevo Aviso
          </router-link>
        </div>
      </div>

      <!-- Filtro y Busqueda -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Busqueda -->
          <div class="md:col-span-2">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input v-model="search" type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Buscar en avisos..." @input="debouncedSearch">
            </div>
          </div>

          <!-- Filtros -->
          <div class="flex space-x-2">
            <select v-model="selectedUrgency"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              @change="handleFilterChange">
              <option value="">Todos los avisos</option>
              <option value="urgent">Solo urgentes</option>
              <option value="normal">Solo normales</option>
            </select>
          </div>
        </div>

        <!-- Filtros activos -->
        <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
            <MagnifyingGlassIcon class="w-4 h-4 mr-1" />
            {{ searchTerm }}
            <button @click="clearSearch" class="ml-2 hover:text-primary-900">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </span>
          <span v-if="selectedUrgency"
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
            <FunnelIcon class="w-4 h-4 mr-1" />
            {{ selectedUrgency === 'urgent' ? 'Urgentes' : 'Normales' }}
            <button @click="clearUrgencyFilter" class="ml-2 hover:text-secondary-900">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </span>
        </div>
      </div>

      <!-- Announcements List -->
      <div class="space-y-4">
        <!-- Loading State -->
        <div v-if="loading && announcements.length === 0" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="bg-white rounded-lg p-6">
              <div class="h-6 bg-gray-200 rounded mb-4"></div>
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="announcements.length === 0 && !loading">
          <EmptyState type="announcements"
            :title="hasActiveFilters ? 'No se encontraron avisos' : 'No hay avisos disponibles'"
            :description="hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda.' : 'Los avisos aparecerán aquí cuando se publiquen.'">
            <template #action>
              <button v-if="hasActiveFilters" @click="clearAllFilters"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Limpiar filtros
              </button>
            </template>
          </EmptyState>
        </div>

        <!-- Announcements -->
        <div v-else class="space-y-4">
          <AnnouncementCard v-for="announcement in announcements" :key="announcement.id" :announcement="announcement"
            @click="viewAnnouncement(announcement.id)" />

          <!-- Load More Button -->
          <div v-if="hasMore && !loading" class="flex justify-center pt-6">
            <button @click="loadMore"
              class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
              Cargar más avisos
            </button>
          </div>

          <!-- Loading More -->
          <div v-if="loading && announcements.length > 0" class="flex justify-center py-4">
            <LoadingSpinner text="Cargando más avisos..." />
          </div>
        </div>
      </div>

    </div>
  </AppShell>
</template>

<script setup lang="ts">
defineOptions({ name: 'AvisosCentralizadosView' })
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useAnnouncementsList } from '@/composables/useAnnouncements'
import { useRouter } from 'vue-router'
import AppShell from '@/components/ui/AppShell.vue'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { isAdmin, isTeacher } = useAuth()

const {
  announcements, loading, error, isEmpty,
  page, perPage, total, hasNext, hasPrev,
  search, visibility, archived, published,
  sort, direction,
  nextPage, prevPage, setPerPage, resetFilters,
  createOne, updateOne, removeOne, refresh, fetchList,
} = useAnnouncementsList({ perPage: 10, sort: 'published_at', direction: 'desc' })

//Variables de filtro
const searchTerm = ref('')
const selectedUrgency = ref('')

//Indicador de algun filtro activo
const hasActiveFilters = computed(() => {
  return searchTerm.value.trim() !== '' || selectedUrgency.value !== ''
})

// Limpia los filtros
const clearSearch = async () => {
  searchTerm.value = ''
  await announcementsStore.searchAnnouncements('')
}

const clearUrgencyFilter = async () => {
  selectedUrgency.value = ''
  await announcementsStore.filterByUrgent(undefined)
}

const clearAllFilters = async () => {
  searchTerm.value = ''
  selectedUrgency.value = ''
  await announcementsStore.fetchAnnouncements()
}

const viewAnnouncement = (announcementId: string) => {
  router.push(`/announcements/${announcementId}`)
}

onMounted(() => {
  fetchList()
})

</script>
