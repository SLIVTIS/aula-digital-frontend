import { defineStore } from 'pinia'
import type { User } from '@/types'
//import { storage } from "@/utils/storage"

type AuthState = {
  user: User | null
  token: string
  isAuthenticated: boolean
}

// helpers seguros para storage
function lsSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { }
}
function lsGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function lsRemove(key: string) {
  try { localStorage.removeItem(key) } catch { }
}
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: '',
    isAuthenticated: false
  }),

  actions: {
    setSession(user: User, token: string) {
      this.user = user
      this.token = token
      this.isAuthenticated = true
      lsSet('token', token)
      lsSet('user', JSON.stringify(user))
    },

    async clearSession() {
      this.user = null
      this.token = ''
      this.isAuthenticated = false
      lsRemove('token')
      lsRemove('user')
    },

    // Rehidratar desde localStorage
    hydrateFromStorage() {
      const token = lsGet('token')
      const userRaw = lsGet('user')

      if (token) {
        this.token = token
        this.isAuthenticated = true
      }

      if (userRaw) {
        try {
          this.user = JSON.parse(userRaw) as User
        } catch {
          this.user = null
          // si está corrupto, lo borramos
          lsRemove('user')
        }
      }
    }
  }
})
