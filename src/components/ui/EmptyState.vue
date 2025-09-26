<template>
    <div class="text-center py-12" :class="containerClass">
        <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
            <component :is="icon" class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{{ description }}</p>
        <div v-if="$slots.action" class="mt-6">
            <slot name="action" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
    ExclamationTriangleIcon,
    InboxIcon,
    DocumentIcon,
    PhotoIcon,
    ChatBubbleLeftRightIcon,
    SpeakerWaveIcon
} from '@heroicons/vue/24/outline'

interface Props {
    type?: 'empty' | 'error' | 'announcements' | 'messages' | 'media' | 'documents'
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
    type: 'empty',
    size: 'md'
})

const iconMap = {
    empty: InboxIcon,
    error: ExclamationTriangleIcon,
    announcements: SpeakerWaveIcon,
    messages: ChatBubbleLeftRightIcon,
    media: PhotoIcon,
    documents: DocumentIcon
}

const titleMap = {
    empty: 'No hay datos disponibles',
    error: 'Ha ocurrido un error',
    announcements: 'No hay avisos',
    messages: 'No hay mensajes',
    media: 'No hay archivos multimedia',
    documents: 'No hay documentos'
}

const descriptionMap = {
    empty: 'No se encontraron elementos para mostrar.',
    error: 'Por favor, inténtalo de nuevo más tarde.',
    announcements: 'No se han publicado avisos recientemente.',
    messages: 'No tienes mensajes en tu bandeja de entrada.',
    media: 'No se han subido archivos multimedia.',
    documents: 'No se han subido documentos.'
}

const icon = computed(() => iconMap[props.type])
const title = computed(() => props.title || titleMap[props.type])
const description = computed(() => props.description || descriptionMap[props.type])

const containerClass = computed(() => ({
    'py-8': props.size === 'sm',
    'py-12': props.size === 'md',
    'py-16': props.size === 'lg'
}))
</script>