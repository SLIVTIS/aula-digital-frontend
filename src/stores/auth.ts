import { defineStore } from 'pinia'
import type { User } from '@/types'
//import { storage } from "@/utils/storage"

type AuthState = {
  user: User | null
  token: string
  isAuthenticated: boolean
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
    },

    async clearSession() {
      this.user = null
      this.token = ''
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  }
})
