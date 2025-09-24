<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
          <AcademicCapIcon class="h-8 w-8 text-white" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Inicia sesión en tu cuenta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ appName }}
        </p>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input id="email" v-model="credentials.email" name="email" type="email" autocomplete="email" required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="tu@email.com" :class="{ 'border-red-300': error }">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div class="mt-1 relative">
              <input id="password" v-model="credentials.password" :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password" required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Tu contraseña" :class="{ 'border-red-300': error }">
              <button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword">
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-500" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Error de autenticación
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button type="submit" :disabled="loading || !credentials.email || !credentials.password"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
            <span v-if="loading" class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </span>
            <span v-else class="flex items-center">
              <LockClosedIcon class="h-5 w-5 text-primary-500 group-hover:text-primary-400 mr-2" />
              Iniciar sesión
            </span>
          </button>
        </div>
      </form>

      <!-- Register Link -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-600">
          ¿No tienes una cuenta?
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            Regístrate aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'LoginView' })
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const { signIn } = useAuth()

const appName = import.meta.env.VITE_APP_NAME || 'Aula Digital'

const credentials = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const success = await signIn(credentials.email, credentials.password)

    if (success) {
      router.push('/dashboard')
    } else {
      error.value = 'Credenciales inválidas. Verifica tu email y contraseña.'
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      error.value = err.message
    } else if (typeof err === 'string') {
      error.value = err
    } else {
      error.value = 'Error al iniciar sesión. Inténtalo de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>