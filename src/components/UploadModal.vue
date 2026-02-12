<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white rounded-lg p-6 w-[28rem]">
      <h2 class="text-lg font-semibold mb-4">Subir archivo multimedia</h2>

      <form @submit.prevent="onSubmit">
        <input type="file" accept="image/*,video/*" @change="onFileSelected" class="mb-3 w-full" />

        <input type="text" v-model="title" placeholder="Título del archivo"
          class="border rounded px-2 py-1 w-full mb-3" />

        <textarea v-model="description" placeholder="Descripción (opcional)"
          class="border rounded px-2 py-1 w-full mb-3 resize-none h-20" />

        <label class="block text-sm text-gray-600 mb-1">Alcance (scope)</label>
        <select v-model="scope" class="border rounded px-2 py-1 w-full mb-3">
          <option value="all">all (todos)</option>
          <option value="groups">groups (grupos específicos)</option>
        </select>

        <!-- Selector de grupos desde API (solo si scope=groups) -->
        <div v-if="scope === 'groups'" class="mb-4">
          <div class="flex gap-2 items-center mb-2">
            <input v-model="q" @keyup.enter.prevent="goToPage(1)" type="text" placeholder="Buscar grupo…"
              class="border rounded px-2 py-1 flex-1" />
            <button type="button" class="px-3 py-1 bg-gray-200 rounded" @click="goToPage(1)">
              Buscar
            </button>
          </div>

          <div class="border rounded p-2 max-h-48 overflow-auto">
            <p v-if="groupsLoading" class="text-sm text-gray-500">Cargando grupos…</p>
            <template v-else>
              <div v-for="g in groups" :key="g.id"
                class="flex items-center justify-between py-1 border-b last:border-b-0">
                <div class="text-sm">
                  <span class="font-medium">{{ g.name }}</span>
                  <span class="text-gray-500 ml-1">{{ g.grade ?? '' }}{{ g.section ? '-' + g.section : '' }}</span>
                  <span class="text-gray-400 ml-2 text-xs">{{ g.code }}</span>
                </div>
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" :checked="selectedGroupIds.includes(g.id)" @change="toggleGroup(g.id)" />
                  Seleccionar
                </label>
              </div>

              <div class="flex justify-between items-center mt-2 text-sm">
                <button type="button" class="px-2 py-1 bg-gray-100 rounded disabled:opacity-50" :disabled="!hasPrev"
                  @click="prevPage()">
                  « Anterior
                </button>
                <span>Página {{ page }} / {{ lastPage }}</span>
                <button type="button" class="px-2 py-1 bg-gray-100 rounded disabled:opacity-50" :disabled="!hasNext"
                  @click="nextPage()">
                  Siguiente »
                </button>
              </div>
            </template>
          </div>

          <p v-if="!hasSelectedGroups" class="text-red-600 text-sm mt-2">
            Debes seleccionar al menos un grupo.
          </p>
        </div>

        <p v-if="error" class="text-red-600 text-sm mb-2">{{ error }}</p>

        <div class="flex justify-end gap-2">
          <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            :disabled="isUploading">
            Cancelar
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            :disabled="!canSubmit || isUploading">
            <span v-if="isUploading">Subiendo…</span>
            <span v-else>Subir</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMediaUpload } from '@/composables/useMediaUpload'
import type { MediaItem } from '@/types/media'

const props = defineProps<{ show: boolean }>()
const emits = defineEmits<{
  (e: 'close'): void
  (e: 'uploaded', media: MediaItem): void
}>()

const {
  // subida
  file, title, description, scope,
  isUploading, error, canSubmit, upload, reset,
  // grupos (desde tu composable)
  groups, page, perPage, q, total, lastPage,
  groupsLoading, groupsError,
  hasNext, hasPrev, fetchList, nextPage, prevPage, goToPage, setPerPage, setQuery,
  selectedGroupIds, hasSelectedGroups, toggleGroup,
} = useMediaUpload()

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) file.value = input.files[0]
}

async function onSubmit() {
  const media = await upload()
  if (media) {
    emits('uploaded', media)
    reset()
    closeModal()
  }
}

function closeModal() {
  reset()
  emits('close')
}

// precarga de grupos al abrir
onMounted(() => {
  fetchList()
})
</script>
