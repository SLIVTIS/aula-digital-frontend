<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h2 class="text-lg font-semibold mb-4">Subir archivo multimedia</h2>

      <form @submit.prevent="handleUpload">
        <input
          type="file"
          accept="image/*,video/*"
          @change="onFileSelected"
          class="mb-4 w-full"
        />

        <input
          type="text"
          v-model="title"
          placeholder="Título del archivo"
          class="border rounded px-2 py-1 w-full mb-4"
        />

        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Subir
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { uploadMedia } from "../services/galleryService";

const props = defineProps<{
  show: boolean;
}>();

const emits = defineEmits(["close", "uploaded"]);

const title = ref("");
const file = ref<File | null>(null);

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
  }
}

async function handleUpload() {
  if (!file.value) {
    alert("Por favor selecciona un archivo");
    return;
  }

  const formData = new FormData();
  formData.append("file", file.value);
  formData.append("title", title.value);

  try {
    await uploadMedia(formData);
    emits("uploaded");
    closeModal();
  } catch (err) {
    console.error("Error al subir archivo:", err);
  }
}

function closeModal() {
  emits("close");
}
</script>

<style scoped>
/* Puedes ajustar estilos si lo deseas */
</style>
