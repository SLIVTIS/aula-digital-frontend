import { defineStore } from 'pinia'
import type { User } from '@/types'
//import { storage } from "@/utils/storage"

type AuthState = {
  user: User | null
  token: string
  isAuthenticated: boolean
}

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')

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

    //Cierre de sesión
    async logout() {

      const res = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: ''
      })

      if (res.ok) {
        this.user = null
        this.token = ''
        this.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    // login que consulta a la API
    async login(email: string, password: string): Promise<boolean> {
      if (!baseURL) throw new Error('VITE_API_BASE_URL no está definido')

      const res = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        if (res.status === 401) return false
        const text = await res.text().catch(() => '')
        throw new Error(text || `Error HTTP ${res.status}`)
      }

      const data = await res.json()
      if (!data?.token || !data?.user) throw new Error('Respuesta inválida del backend')

      // guarda en el store
      this.setSession(data.user, data.token)

      // guarda en localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      return true
    }
  }
})
