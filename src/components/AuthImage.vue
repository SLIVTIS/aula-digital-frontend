<template>
  <!-- Altura del wrapper = 100% del contenedor padre -->
  <div ref="el" class="relative w-full h-full">
    <div v-if="loading" class="absolute inset-0 animate-pulse bg-gray-200" />
    <div v-else-if="error" class="absolute inset-0 bg-red-100 text-red-600 text-xs p-2 flex items-center justify-center">
      {{ error }}
    </div>
    <!-- El <img> ya recibe las clases via img-class -->
    <img v-else-if="src" :src="src" :alt="alt || ''" :class="imgClass" />
    <div v-else class="absolute inset-0 bg-gray-100" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { acquireAuthImageURL, releaseAuthImageURL } from '@/services/auth-images.service'

const props = defineProps<{
  path: string           // endpoint relativo: p.ej. `/media/123/thumbnail`
  alt?: string
  eager?: boolean        // forzar carga inmediata (por defecto lazy)
  imgClass?: string
}>()

const src = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
let observer: IntersectionObserver | null = null
const el = ref<HTMLElement | null>(null)
let currentPath: string | null = null
let mounted = false



async function load() {
  if (!props.path || src.value) return
  loading.value = true
  error.value = null
  try {
    currentPath = props.path
    src.value = await acquireAuthImageURL(props.path)
  } catch (e: any) {
    error.value = e?.message ?? 'Error al cargar imagen'
  } finally {
    loading.value = false
  }
}

function cleanup() {
  if (currentPath) {
    releaseAuthImageURL(currentPath)
    currentPath = null
  }
  if (src.value) src.value = null
}

function observeIfNeeded() {
  if (props.eager || !el) return load()
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    const isVisible = entries.some(e => e.isIntersecting)
    if (isVisible) {
      load()
      observer?.disconnect()
      observer = null
    }
  }, { rootMargin: '200px' }) // precarga 200px antes de entrar al viewport
  observer.observe(el)
}

const imgClass = computed(() =>
  props.imgClass && props.imgClass.length
    ? props.imgClass
    // valor por defecto si no te pasan clase desde fuera:
    : 'h-24 w-24 object-cover rounded'
)

onMounted(() => {
  mounted = true
  observeIfNeeded()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  cleanup()
})

watch(() => props.path, (next, prev) => {
  if (!mounted) return
  if (next === prev) return
  // cambia de imagen: libera la anterior y observa/carga la nueva
  cleanup()
  observeIfNeeded()
})
</script>