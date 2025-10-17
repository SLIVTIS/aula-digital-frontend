<template>
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
      v-else-if="mediaList.length === 0"
      class="text-center text-gray-400 py-8"
    >
      No hay archivos en la galería todavía.
    </div>

    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="media in mediaList"
        :key="media.id"
        class="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition"
      >
        <img
          v-if="media.type === 'image'"
          :src="media.url"
          alt="Imagen"
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
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getMedia } from "../services/galleryService";
import UploadModal from "../components/UploadModal.vue";

const mediaList = ref([]);
const loading = ref(true);
const showUpload = ref(false);

// 🔄 Cargar los archivos desde el backend
const loadMedia = async () => {
  try {
    loading.value = true;
    const data = await getMedia();
    mediaList.value = data;
  } catch (error) {
    console.error("Error al obtener los archivos:", error);
  } finally {
    loading.value = false;
  }
};

// 🔁 Recargar galería después de subir un archivo
const handleUploadSuccess = () => {
  showUpload.value = false;
  loadMedia();
};

// 🔢 Formato de fecha
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(() => {
  loadMedia();
});
</script>

<style scoped>
/* Pequeñas mejoras visuales */
video::-webkit-media-controls-panel {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
