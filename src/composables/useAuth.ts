import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'
import { login, logout } from '@/services/auth.service'

export const useAuth = () => {
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const user = computed((): User | null => authStore.user)
  const isAuthenticated = computed((): boolean => authStore.isAuthenticated)

  const isAdmin = computed((): boolean => authStore.user?.role === 'admin')
  const isTeacher = computed((): boolean => authStore.user?.role === 'teacher')
  const isParent = computed((): boolean => authStore.user?.role === 'parent')

  //const login = (email: string, password: string) => authStore.login(email, password)
  //const logout = () => authStore.logout()

  async function signIn(email: string, password: string) {
    loading.value = true; error.value = null
    try {
      const { token, user } = await login({ email, password })
      authStore.setSession(user, token); // guarda token/usuario
      return true
    } catch (e: any) {
      error.value = e?.message ?? 'Error de inicio de sesión';
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try { await logout(); } finally { authStore.clearSession(); }
  }

  const canAccessRoute = (roles?: string[]) => {
    if (!isAuthenticated.value) return false
    if (!roles || roles.length === 0) return true
    return roles.includes(authStore.user?.role || '')
  }

  const hasPermission = (permission: string) => {
    const userRole = authStore.user?.role
    const permissions = {
      admin: ['manage_users', 'manage_announcements', 'manage_media', 'view_all', 'delete_content'],
      teacher: ['create_announcements', 'manage_media', 'view_students', 'send_messages'],
      parent: ['view_announcements', 'send_messages', 'download_media']
    }
    return permissions[userRole as keyof typeof permissions]?.includes(permission) || false
  }

  return { user, isAuthenticated, isAdmin, isTeacher, isParent, signIn, signOut, canAccessRoute, hasPermission }
}
