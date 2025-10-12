<template>
  <div class="min-h-screen bg-gray-50">
    <!-- sidebar para moviles superpuesto -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 lg:hidden" @click="sidebarOpen = false">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
    </div>

    <!-- sidebar para moviles -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 "
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-between h-16 px-6 bg-primary-600">
          <div class="flex items-center space-x-3">
            <AcademicCapIcon class="w-8 h-8 text-white" />
            <span class="text-lg font-semibold text-white">{{ appName }}</span>
          </div>
          <button @click="sidebarOpen = false" class="lg:hidden text-white hover:text-gray-200">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Nevegación -->
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <router-link v-for="item in navigationItems" :key="item.name" :to="item.href"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200" :class="isActiveRoute(item.href)
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'" @click="sidebarOpen = false">
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
            <span v-if="item.badge && item.badge > 0"
              class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </router-link>
        </nav>

        <!-- Sección de  usuario -->
        <div class="flex-shrink-0 p-4 border-t border-gray-200">
          <div class="flex items-center space-x-3">
            <img :src="user?.avatarPath || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150'"
              :alt="user?.name" class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ user?.name }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ user?.role.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6">
          <!-- Boton de menu para ispositivos moviles -->
          <button @click="sidebarOpen = true"
            class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <Bars3Icon class="w-6 h-6" />
          </button>

          <!-- Titulo de pagina actual-->
          <div class="flex-1 lg:flex-none">
            <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
          </div>

          <!-- Header Acciones -->
          <div class="flex items-center space-x-4">
            <!-- Notificaciones -->
            <div class="relative">
              <button @click="showNotifications = !showNotifications"
                class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <BellIcon class="w-6 h-6" />
                <span v-if="badge > 0"
                  class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {{ badge > 99 ? '99+' : badge }}
                </span>
              </button>

              <!-- Notifications dropdown -->
              <div v-if="showNotifications"
                class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                @click.stop>
                <div class="p-4 border-b border-gray-200">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-900">Notificaciones</h3>
                    <button v-if="unreadNotificationsCount > 0" @click="setAllRead"
                      class="text-xs text-primary-600 hover:text-primary-700">
                      Marcar todas como leídas
                    </button>
                  </div>
                </div>

                <div class="max-h-96 overflow-y-auto">
                  <div v-if="items.length === 0" class="p-4 text-center">
                    <BellIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p class="text-sm text-gray-500">No hay notificaciones</p>
                  </div>

                  <div v-else class="divide-y divide-gray-200">
                    <div v-for="notification in items" :key="notification.id"
                      class="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      :class="{ 'bg-blue-50': !notification.isRead }" @click="handleNotificationClick(notification)">
                      <div class="flex space-x-3">
                        <div class="flex-shrink-0">
                          <div class="w-8 h-8 rounded-full flex items-center justify-center"
                            :class="getNotificationIconClass(notification.type)">
                            <component :is="getNotificationIcon(notification.type)" class="w-4 h-4" />
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900">{{ notification.payload.title }}</p>
                          <p class="text-sm text-gray-600 truncate">{{ notification.payload.excerpt }}</p>
                          <p class="text-xs text-gray-500 mt-1">{{ formatNotificationDate(notification.createdAt) }}</p>
                        </div>
                        <div v-if="!notification.isRead" class="flex-shrink-0">
                          <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Menu de usuario -->
                <div class="p-4 border-t border-gray-200">
                  <router-link to="/notifications"
                    class="block text-center text-sm text-primary-600 hover:text-primary-700"
                    @click="showNotifications = false">
                    Ver todas las notificaciones
                  </router-link>
                </div>
              </div>
            </div>

            <!-- User menu -->
            <div class="relative">
              <button @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
                <img :src="user?.avatarPath || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150'"
                  :alt="user?.name" class="w-8 h-8 rounded-full object-cover">
                <ChevronDownIcon class="w-4 h-4 text-gray-500" />
              </button>

              <!-- User dropdown -->
              <div v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                @click.stop>
                <div class="py-1">
                  <router-link to="/profile" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="showUserMenu = false">
                    <UserIcon class="w-4 h-4 mr-3" />
                    Mi Perfil
                  </router-link>
                  <button @click="handleLogout"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <ArrowRightOnRectangleIcon class="w-4 h-4 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido -->
      <main class="flex-1 p-4 sm:p-6">
        <slot />
      </main>
    </div>

    <!-- Click fuera de los menu para cerrar -->
    <div v-if="showNotifications || showUserMenu" class="fixed inset-0 z-30" @click="closeDropdowns"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import {
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChevronDownIcon,
  UsersIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  SpeakerWaveIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

const { user, signOut, isAdmin, isTeacher } = useAuth()
const {
  items, loading, page, hasNext, hasPrev, badge,
  fetchList, setRead, setAllRead, setFilters, fetchBadge
} = useNotifications({ autoFetchList: true, autoFetchBadge: true, badgePollMs: 15000 });

const appName = import.meta.env.VITE_APP_NAME || 'Plataforma Escolar'

const sidebarOpen = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)

const unreadNotificationsCount = 2

//Obtiene el nombre de la pagina a colocar
const pageTitle = computed(() => {
  return route.meta.title as string || 'Dashboard'
})

const navigationItems = computed(() => {
  const baseItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      badge: 0
    },
    {
      name: 'Avisos',
      href: '/announcements',
      icon: SpeakerWaveIcon,
      badge: 0
    },
    {
      name: 'Galería',
      href: '/gallery',
      icon: PhotoIcon,
      badge: 0
    },
    {
      name: 'Mensajes',
      href: '/messages',
      icon: ChatBubbleLeftRightIcon,
      badge: 1
    }
  ]

  // Agrega items al menu para roles especificos
  if (isTeacher.value || isAdmin.value) {
    baseItems.splice(2, 0, {
      name: 'Crear Aviso',
      href: '/announcements/create',
      icon: PlusIcon,
      badge: 0
    })

    baseItems.push({
      name: 'Historial',
      href: '/announcements/history',
      icon: ClockIcon,
      badge: 0
    })
  }

  if (isAdmin.value) {
    baseItems.push({
      name: 'Usuarios',
      href: '/users',
      icon: UsersIcon,
      badge: 0
    })
  }

  return baseItems
})

//Helper que sirve para identificar el item subrayar en el menu lateral
const isActiveRoute = (href: string): boolean => {
  if (href === '/dashboard') {
    return route.path === href
  }
  return route.path.startsWith(href)
}

//Obtiene el rol del usuario para mostrar
const getRoleLabel = (role?: string): string => {
  const labels = {
    admin: 'Administrador',
    teacher: 'Maestro',
    parent: 'Padre de Familia'
  }
  return labels[role as keyof typeof labels] || role || ''
}

//Accion de cierre de sesión
const handleLogout = async () => {
  await signOut()
  router.push('/login')
}

//Cierra el menu desplegable
const closeDropdowns = () => {
  showNotifications.value = false
  showUserMenu.value = false
}

// Cierra los menu desplegables con la tecla de espacio
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdowns()
    sidebarOpen.value = false
  }
}

const getNotificationIcon = (type: string) => {
  const icons = {
    announcement: SpeakerWaveIcon,
    message: ChatBubbleLeftRightIcon,
    system: Cog6ToothIcon
  }
  return icons[type as keyof typeof icons] || BellIcon
}

const getNotificationIconClass = (type: string): string => {
  const classes = {
    announcement: 'bg-primary-100 text-primary-600',
    message: 'bg-secondary-100 text-secondary-600',
    system: 'bg-gray-100 text-gray-600'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-600'
}

const formatNotificationDate = (dateString: Date): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
  if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>