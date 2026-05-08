import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia'
import axios from 'axios'

axios.defaults.baseURL = 'https://nexgain-api-production.up.railway.app/api'
axios.defaults.withCredentials = false

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('nexgain_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axios.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexgain_token')
      localStorage.removeItem('nexgain_user')
      router.push('/login')
    }
    return Promise.reject(err)
  }
)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.config.globalProperties.$axios = axios

const token = localStorage.getItem('nexgain_token')
if (token) {
  axios.get('/profile')
    .then(({ data }) => {
      localStorage.setItem('nexgain_user', JSON.stringify(data.user))
    })
    .catch(() => {
      localStorage.removeItem('nexgain_token')
      localStorage.removeItem('nexgain_user')
    })
    .finally(() => {
      app.mount('#app')
    })
} else {
  app.mount('#app')
}