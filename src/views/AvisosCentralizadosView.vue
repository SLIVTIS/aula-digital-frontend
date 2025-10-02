<template>
  <div class="avisos-centralizados max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">📢 Avisos Centralizados</h1>

    <!-- Botón para crear un nuevo aviso -->
    <div class="mb-4 flex justify-end">
      <button 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        @click="crearAviso"
      >
        + Nuevo Aviso
      </button>
    </div>

    <!-- Mensaje si no hay avisos -->
    <div v-if="avisos.length === 0" class="text-gray-500">
      No hay avisos registrados.
    </div>

    <!-- Lista de avisos -->
    <ul v-else class="space-y-3">
      <li 
        v-for="aviso in avisos" 
        :key="aviso.id" 
        class="bg-white shadow p-4 rounded flex justify-between items-center"
      >
        <div>
          <h2 class="font-semibold">{{ aviso.titulo }}</h2>
          <p class="text-sm text-gray-600">{{ aviso.descripcion }}</p>
        </div>
        <div class="space-x-2">
          <button 
            class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded" 
            @click="editarAviso(aviso.id)"
          >
            Editar
          </button>
          <button 
            class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" 
            @click="eliminarAviso(aviso.id)"
          >
            Eliminar
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AvisosCentralizadosView',
  data() {
    return {
      // Lista de avisos simulada (luego puede venir de una API)
      avisos: [
        { id: 1, titulo: 'Aviso de mantenimiento', descripcion: 'El sistema estará en mantenimiento el viernes a las 3PM.' },
        { id: 2, titulo: 'Nueva actualización', descripcion: 'Se ha agregado una nueva sección para subir archivos.' }
      ]
    }
  },
  methods: {
    crearAviso() {
      alert('Aquí irá la lógica para crear un nuevo aviso');
    },
    editarAviso(id) {
      alert(`Editar aviso con ID: ${id}`);
    },
    eliminarAviso(id) {
      this.avisos = this.avisos.filter(aviso => aviso.id !== id);
    }
  }
}
</script>

<style scoped>
.avisos-centralizados {
  background-color: #f9fafb;
}
</style>
