<template>
  <AppShell>
    <div class="space-y-6">
      <!-- Bienvenida datos del usuario -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center space-x-4">
          <img :src="user?.avatarPath || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150'"
            :alt="user?.name" class="w-16 h-16 rounded-full object-cover">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {{ user?.name }}!
            </h1>
            <p class="text-gray-600 capitalize">{{ user?.role === 'admin' ? 'Administrador' : user?.role === 'teacher' ?
              'Maestro' : 'Padre de Familia' }}</p>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
defineOptions({ name: 'DashboardView' })
import { useAuth } from '@/composables/useAuth'
import AppShell from '@/components/ui/AppShell.vue' //Plantilla general
const { user } = useAuth()
</script>