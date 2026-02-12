<template>
  <AppShell>
    <div class="h-full flex overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Threads Sidebar -->
      <div class="flex-shrink-0 w-1/3 border-r border-gray-200 overflow-y-auto">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Mensajes</h2>
          <p class="text-sm text-gray-500">{{ isTeacher ? 'Comunicación con padres' : 'Comunicación con maestros' }}</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="p-4 space-y-4">
          <div v-for="i in 5" :key="i" class="animate-pulse">
            <div class="flex space-x-3">
              <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Threads -->
        <div v-else-if="threads.length === 0" class="p-4">
          <EmptyState type="messages" size="sm" title="No hay conversaciones"
            description="Las conversaciones aparecerán aquí cuando tengas mensajes." />
        </div>

        <!-- Threads List -->
        <div v-else class="divide-y divide-gray-200">
          <div v-for="thread in threads" :key="thread.id"
            class="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            :class="{ 'bg-primary-50 border-r-2 border-primary-600': currentThread?.id === thread.id }"
            @click="selectThread(thread)">
            <div class="flex items-center space-x-3">
              <div class="relative">
                <img
                  :src="getOtherParticipant(thread)?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150'"
                  :alt="getOtherParticipant(thread)?.name" class="w-10 h-10 rounded-full object-cover">
                <div v-if="thread.unreadCount > 0"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {{ thread.unreadCount > 9 ? '9+' : thread.unreadCount }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ getOtherParticipant(thread)?.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatDate(thread.lastMessageAt ?? '') }}
                  </p>
                </div>
                <p class="text-sm text-gray-600 truncate">
                  {{ thread.lastMessage?.bodyMd || 'No hay mensajes' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- No Thread Selected -->
        <div v-if="!currentThread" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <ChatBubbleLeftRightIcon class="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
            <p class="text-sm text-gray-500">Elige una conversación para empezar a chatear</p>
          </div>
        </div>

        <!-- Chat Interface -->
        <div v-else class="flex-1 flex flex-col">
          <!-- Chat Header -->
          <div class="p-4 border-b border-gray-200 bg-white">
            <div class="flex items-center space-x-3">
              <img
                :src="getOtherParticipant(currentThread)?.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150'"
                :alt="getOtherParticipant(currentThread)?.name" class="w-10 h-10 rounded-full object-cover">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ getOtherParticipant(currentThread)?.name }}</p>
                <p class="text-xs text-gray-500 capitalize">{{ getOtherParticipant(currentThread)?.role?.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Messages Area -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <!-- Loading Messages -->
            <div v-if="messagesLoading" class="space-y-4">
              <div v-for="i in 5" :key="i" class="animate-pulse">
                <div class="flex" :class="i % 2 === 0 ? 'justify-end' : 'justify-start'">
                  <div class="max-w-xs px-4 py-2 bg-gray-200 rounded-lg">
                    <div class="h-4 bg-gray-300 rounded mb-2"></div>
                    <div class="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty Messages -->
            <div v-else-if="messages.length === 0" class="flex items-center justify-center h-32">
              <p class="text-sm text-gray-500">No hay mensajes en esta conversación</p>
            </div>

            <!-- Messages -->
            <div v-else>
              <!-- item de mensaje -->
              <div v-for="message in messages" :key="message.id" class="flex"
                :class="message.senderUserId === user?.id ? 'justify-end' : 'justify-start'">
                <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg" :class="message.senderUserId === user?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'">
                  <p class="text-sm">{{ message.bodyMd }}</p>
                  <div class="flex items-center justify-between mt-1">
                    <p class="text-xs opacity-75">
                      {{ formatMessageTime(message.createdAt) }}
                    </p>
                    <!-- Opcional: un solo check para "enviado" -->
                    <div v-if="message.senderUserId === user?.id" class="flex items-center">
                      <CheckIcon class="w-3 h-3 opacity-75" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-4 border-t border-gray-200 bg-white">
            <form @submit.prevent="sendMessage" class="flex space-x-3">
              <div class="flex-1">
                <textarea v-model="newMessage" rows="2"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm resize-none"
                  placeholder="Escribe tu mensaje..." @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact="newMessage += '\n'" />
              </div>
              <div class="flex-shrink-0">
                <button type="submit" :disabled="!newMessage.trim() || sending"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <div v-if="sending" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <PaperAirplaneIcon class="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import AppShell from '@/components/ui/AppShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useAuth } from '@/composables/useAuth'
import { useThreadsList } from '@/composables/useThreadsList'
import { useThread } from '@/composables/useThread'
import type { ThreadPreview, UserSummary, MessageModel } from '@/types/threads'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

/** ====== Auth ====== */
const { user, isTeacher } = useAuth()
const currentUserId = computed(() => user.value?.id)

/** ====== Lista de hilos (sidebar) ====== */
const {
  threads,            // ThreadPreview[]
  fetchList,
  loadNext,
  hasNext,
  clearUnread,
  bumpOnNewMessage,
  loading
} = useThreadsList({ perPage: 20, currentUserId: currentUserId.value })

/** ====== Chat (detalle) ====== */
// Control del hilo seleccionado en la UI
const currentThread = ref<ThreadPreview | null>(null)

// Controlador/composable del hilo actual (lo reemplazamos al cambiar de hilo)
let threadCtl: ReturnType<typeof useThread> | null = null

// Proxies reactivas para que el template no cambie
const messages = computed<MessageModel[]>(() => threadCtl?.messages.value ?? [])
const messagesLoading = computed(() => threadCtl?.loading.value ?? false)
const sending = computed(() => threadCtl?.sending.value ?? false)

const messagesContainer = ref<HTMLElement>()
const newMessage = ref('')

/** Helpers UI */
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

/** Obtiene el otro participante (para 1:1) o el primero que no seas tú en grupos */
const getOtherParticipant = (thread: ThreadPreview | null): UserSummary | undefined => {
  if (!thread || !currentUserId.value) return undefined
  return thread.participants.find(p => p.id !== currentUserId.value) ?? thread.participants[0]
}

/** Seleccionar hilo desde la lista (sidebar) */
const selectThread = async (thread: ThreadPreview) => {
  // Evitar reinstanciar si ya está seleccionado
  if (currentThread.value?.id === thread.id && threadCtl) return

  currentThread.value = thread

  // (Re)instanciar el composable del hilo seleccionado
  threadCtl = useThread(thread.id, 30)

  // Cargar mensajes y marcar como leído
  await threadCtl.fetchThread()
  clearUnread(thread.id)        // limpia contador en la lista
  await threadCtl.markRead()    // marca lecturas en backend
  await nextTick()
  scrollToBottom()
}

/** Enviar mensaje en el hilo actual */
const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text || !currentThread.value || !threadCtl) return

  const msg = await threadCtl.sendMessage(text)

  // Optimiza la lista de hilos (mueve al tope y actualiza preview)
  bumpOnNewMessage(currentThread.value.id, msg)

  newMessage.value = ''
  await nextTick()
  scrollToBottom()
}

/** Formatos UI */
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60))

  if (diffInMinutes < 60) return `${diffInMinutes}m`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`

  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

const formatMessageTime = (date?: Date | string): string => {
  if (!date) return ''                // <-- guard
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date) || isNaN(d.getTime())) return '' // <-- guard

  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('es-ES', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}


/** Inicial */
onMounted(async () => {
  await fetchList()
})

/** (Opcional) carga incremental de hilos al llegar al final del sidebar
 *  Puedes engancharlo a un @scroll en el contenedor del sidebar
 */
const onSidebarScroll = async (e: Event) => {
  const t = e.target as HTMLElement
  if (!t) return
  const nearBottom = t.scrollTop + t.clientHeight >= t.scrollHeight - 48
  if (nearBottom && hasNext.value) await loadNext()
}
</script>
