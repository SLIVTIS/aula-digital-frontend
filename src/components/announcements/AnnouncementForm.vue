<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
        Título del Aviso *
      </label>
      <input
        id="title"
        v-model="form.title"
        type="text"
        required
        maxlength="200"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        placeholder="Escribe el título del aviso..."
        :class="{ 'border-red-300': errors.title }"
      >
      <div v-if="errors.title" class="mt-1 text-sm text-red-600">
        {{ errors.title }}
      </div>
      <div class="mt-1 text-sm text-gray-500">
        {{ form.title.length }}/200 caracteres
      </div>
    </div>

    <!-- Content -->
    <div>
      <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
        Contenido *
      </label>
      <textarea
        id="content"
        v-model="form.content"
        rows="6"
        required
        maxlength="2000"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        placeholder="Escribe el contenido del aviso..."
        :class="{ 'border-red-300': errors.content }"
      />
      <div v-if="errors.content" class="mt-1 text-sm text-red-600">
        {{ errors.content }}
      </div>
      <div class="mt-1 text-sm text-gray-500">
        {{ form.content.length }}/2000 caracteres
      </div>
    </div>

    <!-- Target Audience -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Dirigido a
      </label>
      <div class="space-y-2">
        <label class="inline-flex items-center">
          <input
            v-model="form.isGeneral"
            type="checkbox"
            class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
          >
          <span class="ml-2 text-sm text-gray-700">Todos los padres (Aviso general)</span>
        </label>
      </div>

      <div v-if="!form.isGeneral" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar grupos específicos
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <label
            v-for="group in availableGroups"
            :key="group"
            class="inline-flex items-center"
          >
            <input
              v-model="form.targetGroups"
              :value="group"
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            >
            <span class="ml-2 text-sm text-gray-700">{{ group }}</span>
          </label>
        </div>
        <div v-if="errors.targetGroups" class="mt-1 text-sm text-red-600">
          {{ errors.targetGroups }}
        </div>
      </div>
    </div>

    <!-- Priority -->
    <div>
      <label class="inline-flex items-center">
        <input
          v-model="form.urgent"
          type="checkbox"
          class="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
        >
        <span class="ml-2 text-sm text-gray-700 flex items-center">
          <ExclamationTriangleIcon class="w-4 h-4 text-red-500 mr-1" />
          Marcar como urgente
        </span>
      </label>
      <p class="mt-1 text-xs text-gray-500">
        Los avisos urgentes se destacarán visualmente y enviarán notificaciones inmediatas.
      </p>
    </div>

    <!-- File Upload -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Archivos adjuntos
      </label>
      <div
        class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div class="space-y-1 text-center">
          <DocumentPlusIcon class="mx-auto h-12 w-12 text-gray-400" />
          <div class="flex text-sm text-gray-600">
            <label
              for="file-upload"
              class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
            >
              <span>Subir archivos</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                class="sr-only"
                @change="handleFileSelect"
              >
            </label>
            <p class="pl-1">o arrastra y suelta</p>
          </div>
          <p class="text-xs text-gray-500">
            PNG, JPG, PDF, DOC hasta 10MB cada uno
          </p>
        </div>
      </div>

      <!-- Selected Files -->
      <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
        <h4 class="text-sm font-medium text-gray-700">Archivos seleccionados:</h4>
        <div class="space-y-2">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <DocumentIcon class="w-5 h-5 text-gray-400" />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="removeFile(index)"
              class="text-red-600 hover:text-red-700 p-1"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading || !isFormValid"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <div v-if="loading" class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Publicando...
        </div>
        <span v-else>Publicar Aviso</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Announcement } from '@/types'
import {
  ExclamationTriangleIcon,
  DocumentPlusIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  loading?: boolean
  availableGroups?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  availableGroups: () => ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B']
})

const emit = defineEmits<{
  submit: [data: Partial<Announcement>, files: File[]]
  cancel: []
}>()

const form = reactive({
  title: '',
  content: '',
  isGeneral: true,
  targetGroups: [] as string[],
  urgent: false
})

const selectedFiles = ref<File[]>([])

const errors = reactive({
  title: '',
  content: '',
  targetGroups: ''
})

const isFormValid = computed(() => {
  return form.title.trim().length > 0 && 
         form.content.trim().length > 0 && 
         (form.isGeneral || form.targetGroups.length > 0)
})

const validateForm = () => {
  errors.title = form.title.trim().length === 0 ? 'El título es obligatorio' : ''
  errors.content = form.content.trim().length === 0 ? 'El contenido es obligatorio' : ''
  errors.targetGroups = !form.isGeneral && form.targetGroups.length === 0 ? 'Selecciona al menos un grupo' : ''

  return !errors.title && !errors.content && !errors.targetGroups
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', { ...form }, selectedFiles.value)
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files))
  }
}

const addFiles = (files: File[]) => {
  const validFiles = files.filter(file => {
    const validTypes = ['image/', 'video/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const isValidType = validTypes.some(type => file.type.startsWith(type) || file.type === type)
    const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
    
    return isValidType && isValidSize
  })

  selectedFiles.value.push(...validFiles)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>