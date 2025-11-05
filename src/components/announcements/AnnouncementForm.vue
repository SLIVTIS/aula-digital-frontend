<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
        Título del Aviso *
      </label>
      <input id="title" v-model="form.title" type="text" required maxlength="200"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        placeholder="Escribe el título del aviso..." :class="{ 'border-red-300': fieldErrors.title }">
      <div v-if="fieldErrors.title" class="mt-1 text-sm text-red-600">
        {{ fieldErrors.title }}
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
      <textarea id="content" v-model="form.body_md" rows="6" required maxlength="2000"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        placeholder="Escribe el contenido del aviso..." :class="{ 'border-red-300': fieldErrors.title }" />
      <div v-if="fieldErrors.title" class="mt-1 text-sm text-red-600">
        {{ fieldErrors.title }}
      </div>
      <div class="mt-1 text-sm text-gray-500">
        {{ form.body_md.length }}/2000 caracteres
      </div>
    </div>

    <!-- Target Audience -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Dirigido a
      </label>
      <div class="w-64 space-y-2">
        <select id="visibility" v-model="form.visibility"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 text-sm">
          <option value="all">Todos</option>
          <option value="groups">Grupos</option>
          <option value="teachers">Docentes</option>
        </select>
      </div>


      <div v-if="form.visibility != 'all'" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar grupos específicos
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <label v-for="group in groups" :key="group.id" class="inline-flex items-center">
            <input type="checkbox" :checked="isTargetSelected(group.id)" @change="onToggleTarget($event, group.id)"
              class="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
            <span class="ml-2 text-sm text-gray-700">{{ group.name }}</span>
          </label>
        </div>
        <div v-if="fieldErrors.title" class="mt-1 text-sm text-red-600">
          {{ fieldErrors.title }}
        </div>
      </div>
    </div>

    <!-- File Upload -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Archivos adjuntos
      </label>
      <div
        class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors duration-200">
        <div class="space-y-1 text-center">
          <DocumentPlusIcon class="mx-auto h-12 w-12 text-gray-400" />
          <div class="flex text-sm text-gray-600">
            <label for="file-upload"
              class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
              <span>Subir archivos</span>
              <input id="file-upload" name="file-upload" type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx"
                class="sr-only">
            </label>
            <p class="pl-1">o arrastra y suelta</p>
          </div>
          <p class="text-xs text-gray-500">
            PNG, JPG, PDF, DOC hasta 10MB cada uno
          </p>
        </div>
      </div>

      <!-- Selected Files -->
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
      <button type="button" @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
        Cancelar
      </button>
      <button type="submit" :disabled="loading"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
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
import { useCreateAnnouncement } from '@/composables/useCreateAnnouncement'
import { useGroupsList } from '@/composables/useGroups'
import {
  DocumentPlusIcon,
} from '@heroicons/vue/24/outline'

const {
  form, canSubmit, fieldErrors, loading,
  addGroupTarget, removeTarget,
  submit
} = useCreateAnnouncement()

const { groups } = useGroupsList()

const handleSubmit = () => {
  if(canSubmit){
    submit(true)
  }
}

//Helper para agregar grupos
const isTargetSelected = (groupId: number) =>{
  if (!form.targets) return false
  form.targets.some(t => t.target_type === 'group' && t.group_id === groupId)
}

const onToggleTarget = (e: Event, groupId: number ) => {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    addGroupTarget(groupId)
  } else {
    removeTarget('group',groupId)
  }
}

</script>