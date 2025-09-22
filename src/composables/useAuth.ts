import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

export const useAuth = () => {
  const authStore = useAuthStore()

  const user = computed((): User | null => authStore.user)
  const isAuthenticated = computed((): boolean => authStore.isAuthenticated)

  const isAdmin = computed((): boolean => authStore.user?.role === 'admin')
  const isTeacher = computed((): boolean => authStore.user?.role === 'teacher')
  const isParent = computed((): boolean => authStore.user?.role === 'parent')

  const login = (email: string, password: string) => authStore.login(email, password)
  const logout = () => authStore.logout()

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

  return { user, isAuthenticated, isAdmin, isTeacher, isParent, login, logout, canAccessRoute, hasPermission }
}
