<template>
    <AppShell>
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p class="mt-2 text-sm text-gray-700">
                        Administra todos los usuarios del sistema escolar
                    </p>
                </div>
                <div class="mt-4 sm:mt-0">
                    <button @click="openCreateModal"
                        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200">
                        <PlusIcon class="w-4 h-4 mr-2" />
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                                <UsersIcon class="w-5 h-5 text-primary-600" />
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                                <dd class="text-2xl font-semibold text-gray-900">{{ total }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-secondary-100 rounded-md flex items-center justify-center">
                                <AcademicCapIcon class="w-5 h-5 text-secondary-600" />
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Maestros</dt>
                                <dd class="text-2xl font-semibold text-gray-900">{{ roleStatsFiltered.teacher }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-accent-100 rounded-md flex items-center justify-center">
                                <UserGroupIcon class="w-5 h-5 text-accent-600" />
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Padres</dt>
                                <dd class="text-2xl font-semibold text-gray-900">{{ roleStatsFiltered.parent }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                <ShieldCheckIcon class="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Admins</dt>
                                <dd class="text-2xl font-semibold text-gray-900">{{ roleStatsFiltered.admin }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Search -->
                    <div class="md:col-span-2">
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                            </div>
                            <input v-model="searchTerm" type="text"
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Buscar usuarios por nombre o email..." @input="debouncedSearch">
                        </div>
                    </div>

                    <!-- Role Filter -->
                    <div>
                        <select v-model="roleFilter"
                            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            @change="handleFilterChange">
                            <option value="">Todos los roles</option>
                            <option value="admin">Administradores</option>
                            <option value="teacher">Maestros</option>
                            <option value="parent">Padres</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <!-- Loading State -->
                <div v-if="loading" class="p-6">
                    <div class="animate-pulse space-y-4">
                        <div v-for="i in 5" :key="i" class="flex space-x-4">
                            <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div class="flex-1 space-y-2">
                                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div class="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="filteredUsers.length === 0">
                    <EmptyState type="empty" title="No hay usuarios"
                        description="No se encontraron usuarios con los filtros aplicados.">
                        <template #action>
                            <button @click="clearFilters"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Limpiar filtros
                            </button>
                        </template>
                    </EmptyState>
                </div>

                <!-- Table -->
                <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Información
                                </th>
                                <th scope="col"
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Registro
                                </th>
                                <th scope="col" class="relative px-6 py-3">
                                    <span class="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <img :src="user.avatarPath || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150'"
                                                :alt="user.name" class="h-10 w-10 rounded-full object-cover">
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                                            <div class="text-sm text-gray-500">{{ user.email }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="getRoleBadgeClass(user.role.slug)">
                                        {{ user.role.name }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">

                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {{ formatDate(user.createdAt ?? '') }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex items-center space-x-2">
                                        <button @click="openEditModal(user)"
                                            class="text-primary-600 hover:text-primary-900" title="Editar usuario">
                                            <PencilIcon class="w-4 h-4" />
                                        </button>
                                        <button @click="confirmDelete(user)" class="text-red-600 hover:text-red-900"
                                            title="Eliminar usuario" :disabled="user.id === currentUser?.id">
                                            <TrashIcon class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Create/Edit User Modal -->
            <div v-if="showUserModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-screen overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-medium text-gray-900">
                            {{ editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
                        </h3>
                        <button @click="closeUserModal" class="text-gray-400 hover:text-gray-600">
                            <XMarkIcon class="w-6 h-6" />
                        </button>
                    </div>

                    <form @submit.prevent="saveUser" class="space-y-6">
                        <!-- Basic Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre completo *
                                </label>
                                <input v-model="userForm.name" type="text" required
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    :class="{ 'border-red-300': userFormErrors.name }">
                                <div v-if="userFormErrors.name" class="mt-1 text-sm text-red-600">
                                    {{ userFormErrors.name }}
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Correo electrónico *
                                </label>
                                <input v-model="userForm.email" type="email" required
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    :class="{ 'border-red-300': userFormErrors.email }">
                                <div v-if="userFormErrors.email" class="mt-1 text-sm text-red-600">
                                    {{ userFormErrors.email }}
                                </div>
                            </div>
                        </div>

                        <!-- Role Selection -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Rol *
                            </label>
                            <div class="grid grid-cols-1 gap-3">
                                <label v-for="role in availableRoles" :key="role.value"
                                    class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
                                    :class="userForm.role === role.id
                                        ? 'border-primary-600 ring-2 ring-primary-600 bg-primary-50'
                                        : 'border-gray-300 hover:border-gray-400'">
                                    <input v-model="userForm.role" :value="role.id" type="radio" class="sr-only"
                                        required>
                                    <div class="flex items-center">
                                        <component :is="role.icon" class="w-6 h-6 mr-3"
                                            :class="userForm.role === role.id ? 'text-primary-600' : 'text-gray-400'" />
                                        <div>
                                            <div class="text-sm font-medium"
                                                :class="userForm.role === role.id ? 'text-primary-900' : 'text-gray-900'">
                                                {{ role.label }}
                                            </div>
                                            <div class="text-sm"
                                                :class="userForm.role === role.id ? 'text-primary-700' : 'text-gray-500'">
                                                {{ role.description }}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Password Fields -->
                        <div v-if="!editingUser" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña *
                                </label>
                                <input v-model="userForm.password" type="password" required minlength="8"
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    :class="{ 'border-red-300': userFormErrors.password }">
                                <div v-if="userFormErrors.password" class="mt-1 text-sm text-red-600">
                                    {{ userFormErrors.password }}
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmar contraseña *
                                </label>
                                <input v-model="userForm.confirmPassword" type="password" required minlength="8"
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    :class="{ 'border-red-300': userFormErrors.confirmPassword }">
                                <div v-if="userFormErrors.confirmPassword" class="mt-1 text-sm text-red-600">
                                    {{ userFormErrors.confirmPassword }}
                                </div>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button type="button" @click="closeUserModal"
                                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" :disabled="saving"
                                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                                <div v-if="saving" class="flex items-center">
                                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {{ editingUser ? 'Actualizando...' : 'Creando...' }}
                                </div>
                                <span v-else>{{ editingUser ? 'Actualizar Usuario' : 'Crear Usuario' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div v-if="showDeleteModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                    <div class="flex items-center mb-4">
                        <div class="flex-shrink-0">
                            <ExclamationTriangleIcon class="w-6 h-6 text-red-500" />
                        </div>
                        <div class="ml-3">
                            <h3 class="text-lg font-medium text-gray-900">Eliminar Usuario</h3>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">
                        ¿Estás seguro de que quieres eliminar a "{{ userToDelete?.name }}"? Esta acción no se puede
                        deshacer.
                    </p>
                    <div class="flex justify-end space-x-3">
                        <button @click="showDeleteModal = false"
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button @click="deleteUser" :disabled="deleting"
                            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
                            <div v-if="deleting" class="flex items-center">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Eliminando...
                            </div>
                            <span v-else>Eliminar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppShell>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useUsersCrud } from '@/composables/useUsersCrud'
import { useDebounceFn } from '@vueuse/core'
import type { Child } from '@/types'
import type { User, UserForm } from '@/types/user'
import AppShell from '@/components/ui/AppShell.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import {
    PlusIcon,
    MagnifyingGlassIcon,
    UsersIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const { user: currentUser } = useAuth()

const { users, loading, create, remove, update, loadList, total, roleStatsFiltered } = useUsersCrud();

const searchTerm = ref('')
const roleFilter = ref('')
const showUserModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)
const saving = ref(false)
const deleting = ref(false)

const userForm = reactive({
    name: '',
    email: '',
    role: 3,
    password: '',
    confirmPassword: '',
    groups: [] as string[],
    children: [{ name: '', grade: '', group: '' }] as Child[]
})

const userFormErrors = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const availableRoles = [
    {
        id: 3,
        value: 'parent',
        label: 'Padre de Familia',
        description: 'Recibe avisos y se comunica con maestros',
        icon: UserGroupIcon
    },
    {
        id: 2,
        value: 'teacher',
        label: 'Maestro',
        description: 'Publica avisos y gestiona comunicación',
        icon: AcademicCapIcon
    },
    {
        id: 1,
        value: 'admin',
        label: 'Administrador',
        description: 'Gestión completa del sistema',
        icon: ShieldCheckIcon
    }
]

const filteredUsers = computed(() => {
    let filtered = [...users.value]

    // Apply search filter
    if (searchTerm.value.trim()) {
        const search = searchTerm.value.toLowerCase()
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        )
    }

    // Apply role filter
    if (roleFilter.value) {
        filtered = filtered.filter(user => user.role.slug === roleFilter.value)
    }

    return filtered
})

const debouncedSearch = useDebounceFn(() => {
}, 500)

const handleFilterChange = () => {
}

const clearFilters = () => {
    searchTerm.value = ''
    roleFilter.value = ''
}

//Añade un color a la etiqueta segun el rol del usuario
const getRoleBadgeClass = (role: string): string => {
    const classes = {
        admin: 'bg-red-100 text-red-800',
        teacher: 'bg-blue-100 text-blue-800',
        parent: 'bg-green-100 text-green-800'
    }
    return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

//Helper para convertir en fecha los timestamps
const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const openCreateModal = () => {
    editingUser.value = null
    resetUserForm()
    showUserModal.value = true
}

const openEditModal = (user: User) => {
    editingUser.value = user
    fillUserForm(user)
    showUserModal.value = true
}

const closeUserModal = () => {
    showUserModal.value = false
    editingUser.value = null
    resetUserForm()
}

const resetUserForm = () => {
    userForm.name = ''
    userForm.email = ''
    userForm.role = 3
    userForm.password = ''
    userForm.confirmPassword = ''
    userForm.groups = []

    Object.keys(userFormErrors).forEach(key => {
        userFormErrors[key as keyof typeof userFormErrors] = ''
    })
}

const fillUserForm = (user: User) => {
    userForm.name = user.name
    userForm.email = user.email
    userForm.role = user.role.id
}

//Validador para el formulario
const validateUserForm = (): boolean => {
    let isValid = true

    // Resetea los errores
    Object.keys(userFormErrors).forEach(key => {
        userFormErrors[key as keyof typeof userFormErrors] = ''
    })

    // Validación del nombre
    if (!userForm.name.trim()) {
        userFormErrors.name = 'El nombre es obligatorio'
        isValid = false
    }

    // Validación de Email
    if (!userForm.email.trim()) {
        userFormErrors.email = 'El correo electrónico es obligatorio'
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
        userFormErrors.email = 'El correo electrónico no es válido'
        isValid = false
    }

    // Validación de contraseña (Solo para nuevos usuarios)
    if (!editingUser.value) {
        if (userForm.password.length < 8) {
            userFormErrors.password = 'La contraseña debe tener al menos 8 caracteres'
            isValid = false
        }

        if (userForm.password !== userForm.confirmPassword) {
            userFormErrors.confirmPassword = 'Las contraseñas no coinciden'
            isValid = false
        }
    }

    return isValid
}

const saveUser = async () => {
    if (!validateUserForm()) return

    saving.value = true
    try {

        if (editingUser.value) {
            const updateUser: UserForm = {
                name: userForm.name,
                email: userForm.email,
                role: userForm.role
            }
            await update(editingUser.value.id, updateUser)
        } else {
            // Create new user
            const newUser: UserForm = {
                name: userForm.name,
                email: userForm.email,
                role: userForm.role,
                password: userForm.password,
                password_confirmation: userForm.confirmPassword
            }
            await create(newUser);
        }

        closeUserModal()
    } catch (error) {
        console.error('Failed to save user:', error)
    } finally {
        saving.value = false
    }
}

//Muestra el modal para confirmar la eliminación
const confirmDelete = (user: User) => {
    userToDelete.value = user
    showDeleteModal.value = true
}

//Funcion para eliminar el elemento seleccionado
const deleteUser = async () => {
    if (!userToDelete.value) return

    deleting.value = true
    try {
        await remove(userToDelete.value.id)
        showDeleteModal.value = false
        userToDelete.value = null
    } catch (error) {
        console.error('Failed to delete user:', error)
    } finally {
        deleting.value = false
    }
}

onMounted(() => {
    loadList()
})
</script>