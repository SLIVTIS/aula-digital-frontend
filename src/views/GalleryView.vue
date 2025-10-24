<template>
    <AppShell>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Encabezado -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-gray-800">Galería Multimedia</h2>
      <button
        @click="showUpload = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Subir archivo
      </button>
    </div>

    <!-- Grid de imágenes y videos -->
    <div v-if="loading" class="text-center text-gray-500 py-8">
      Cargando archivos...
    </div>

    <div
      v-else-if="items.length === 0"
      class="text-center text-gray-400 py-8"
    >
      No hay archivos en la galería todavía.
    </div>

    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="media in items"
        :key="media.id"
        class="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition"
      >
        <img
          v-if="media.mime_type === 'image/png'"
          :src="`https://api.auladigital.espectralcode.com/api/media/1/thumbnail/`"
          :alt=media.title
          class="w-full h-48 object-cover"
        />
        <video
          v-else
          controls
          class="w-full h-48 object-cover"
        >
          <source :src="media.url" type="video/mp4" />
        </video>
        <div class="p-3">
          <p class="font-semibold text-gray-700 truncate">{{ media.title }}</p>
          <p class="text-sm text-gray-500">{{ formatDate(media.created_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Modal de subida -->
    <UploadModal
      v-if="showUpload"
      @close="showUpload = false"
      @uploaded="handleUploadSuccess"
      :show="showUpload"
    />
  </div>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from '@/components/ui/AppShell.vue' //Plantilla general
import { ref, onMounted } from "vue"
import { useMedia } from '@/composables/useMedia'
import UploadModal from "../components/UploadModal.vue"

const showUpload = ref(false);

const {items, loading, error, fetchList } = useMedia()


// 🔁 Recargar galería después de subir un archivo
const handleUploadSuccess = () => {
  showUpload.value = false
  fetchList()
};

// 🔢 Formato de fecha
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(() => {
  fetchList()
});
</script>

<style scoped>
/* Pequeñas mejoras visuales */
video::-webkit-media-controls-panel {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
