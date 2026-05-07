import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('nexgain_user') || 'null'),
    token: localStorage.getItem('nexgain_token') || null,
  }),
  getters: {
    isLoggedIn: s => !!s.token,
    packageSelected: s => s.user?.package_selected || false,
  },
  actions: {
    async login(email, password) {
      const { data } = await axios.post('/login', { email, password })
      this.setAuth(data)
      return data
    },
    async register(payload) {
      const { data } = await axios.post('/register', payload)
      this.setAuth(data)
      return data
    },
    setAuth({ user, token }) {
      this.user = user
      this.token = token
      localStorage.setItem('nexgain_token', token)
      localStorage.setItem('nexgain_user', JSON.stringify(user))
    },
    updateUser(user) {
      this.user = user
      localStorage.setItem('nexgain_user', JSON.stringify(user))
    },
    async logout() {
      await axios.post('/logout').catch(() => {})
      this.user = null
      this.token = null
      localStorage.removeItem('nexgain_token')
      localStorage.removeItem('nexgain_user')
    },
  },
})