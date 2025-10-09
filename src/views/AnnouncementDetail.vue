<template>
  <AppShell>
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse space-y-6">
        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>

      <!-- Error State -->
      <ErrorState v-else-if="error" title="Error al cargar el aviso" :message="error" @retry="load" />

      <!-- Announcement Content -->
      <div v-else-if="announcement" class="space-y-6">
        <!-- Boton de regreso -->
        <div class="flex items-center space-x-2">
          <button @click="router.back()"
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>

        <!-- Cabecera -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-3">
                <h1 class="text-2xl font-bold text-gray-900">{{ announcement.title }}</h1>
                <span v-if="!isRead"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Nuevo
                </span>
              </div>

              <!-- Autor y fecha de creacion -->
              <div class="flex items-center space-x-4 text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                  <img
                    :src="announcement.author.avatar_path || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=50'"
                    :alt="announcement.author.name" class="w-8 h-8 rounded-full object-cover">
                  <div>
                    <p class="font-medium text-gray-900">{{ announcement.author.name }}</p>
                    <p class="text-xs text-gray-500 capitalize">{{ announcement.author.role === 'teacher' ? 'Maestro' :
                      'Administrador' }}</p>
                  </div>
                </div>
                <span>•</span>
                <div>
                  <p>{{ formatDate(announcement.created_at) }}</p>
                  <p v-if="announcement.updated_at !== announcement.created_at" class="text-xs text-gray-500">
                    Actualizado {{ formatDate(announcement.updated_at) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div v-if="canEdit" class="flex space-x-2">
              <button
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <PencilIcon class="w-4 h-4 mr-2" />
                Editar
              </button>
              <button v-if="canDelete"
                class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <TrashIcon class="w-4 h-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>

          <!-- Objetivos -->
          <div v-if="announcement.visibility !== 'all' && announcement.targets.length > 0" class="mb-4">
            <div class="flex items-center space-x-2 mb-2">
              <UserGroupIcon class="w-4 h-4 text-gray-500" />
              <span class="text-sm font-medium text-gray-700">Dirigido a:</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <template v-for="t in announcement.targets" :key="`target-${t.id}`">

                <!-- Cuando el target es un GRUPO -->
                <span v-if="t.group"
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
                  :title="`Grupo: ${t.group?.name ?? ''}`">
                  <span class="truncate max-w-[14rem]">{{ t.group?.name }}</span>
                </span>

                <!-- Cuando el target es un USUARIO -->
                <span v-else-if="t.user"
                  class="inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
                  :title="`Usuario: ${t.user?.name ?? ''}`">

                  <!-- Avatar (si existe) -->
                   <img
                    :src="announcement.author.avatar_path || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=50'"
                    :alt="announcement.author.name" class="w-8 h-8 rounded-full object-cover">

                  <span class="truncate max-w-[14rem]">{{ t.user?.name }}</span>
                </span>
              </template>
            </div>
          </div>

          <div v-else class="mb-4">
            <div class="flex items-center space-x-2">
              <GlobeAltIcon class="w-4 h-4 text-gray-500" />
              <span class="text-sm font-medium text-gray-700">Aviso general para todos los padres</span>
            </div>
          </div>
        </div>

        <!-- Contenido -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="prose max-w-none">
            <div class="whitespace-pre-wrap text-gray-900 leading-relaxed">{{ announcement.body_md }}</div>
          </div>
        </div>

        <!-- Multimedia -->

        <!-- Estatus de lectura -->

        <!-- Boton marcar como leido -->
        <div v-if="!isRead && isParent" class="flex justify-center">
          <button @click="markAsRead" :disabled="markingAsRead"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <div v-if="markingAsRead" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <CheckIcon class="w-5 h-5 mr-2" />
            Marcar como Leído
          </button>
        </div>
      </div>

      <!-- No encontrado -->
      <EmptyState v-else type="error" title="Aviso no encontrado"
        description="El aviso que buscas no existe o no tienes permisos para verlo.">
        <template #action>
          <router-link to="/announcements"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
            Ver todos los avisos
          </router-link>
        </template>
      </EmptyState>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAnnouncementDetail } from '@/composables/useAnnouncementDetail'
import AppShell from '@/components/ui/AppShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
//Para obtener el usuario
const { user, isAdmin, isTeacher, isParent } = useAuth()

//Para los avisos
const { announcement, load, error, loading } = useAnnouncementDetail()

const markingAsRead = ref(false)

//Modificar backend para que devuelva si el usuario ya leyo este mensaje
const isRead = false;

const canEdit = computed(() => {
  if (!announcement.value || !user.value) return false
  return isAdmin.value ||
    (isTeacher.value && announcement.value.author.id === user.value.id)
})

const canDelete = computed(() => {
  if (!announcement.value || !user.value) return false
  return isAdmin.value
})

const markAsRead = async () => {
  if (!announcement.value || !user.value) return

  markingAsRead.value = true
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  load()
})
</script>