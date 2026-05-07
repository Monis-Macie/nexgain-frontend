<template>
  <div class="auth-page">
    <div class="auth-glow"></div>
    <div class="auth-card">
      <div class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" fill="#1a0e00"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
        </div>
        <span class="logo-text">NEX<em>GAIN</em></span>
      </div>

      <div v-if="loading" class="status">
        <div class="spinner"></div>
        <p>A verificar o teu email...</p>
      </div>

      <div v-else-if="success" class="status">
        <div class="success-icon">✅</div>
        <h2>Email verificado!</h2>
        <p class="sub">A tua conta foi activada com sucesso. Agora escolhe o teu pacote.</p>
        <button class="btn-primary" @click="$router.push('/packages')">Escolher pacote</button>
      </div>

      <div v-else class="status">
        <div class="error-icon">❌</div>
        <h2>Link inválido</h2>
        <p class="sub">{{ error }}</p>
        <router-link to="/login" class="btn-primary">Voltar ao login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await axios.post('/verify-email', {
      token: route.query.token,
      email: route.query.email,
    })
    auth.setAuth(data)
    success.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Link inválido ou expirado'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); position: relative; overflow: hidden; padding: 20px; }
.auth-glow { position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%); pointer-events: none; }
.auth-card { width: 100%; max-width: 380px; background: var(--card);
  border: 1px solid var(--gold-border); border-radius: 20px; padding: 36px 28px; text-align: center; }
.logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; }
.logo-mark { width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #D4A843, #F0C96A); display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 20px; height: 20px; }
.logo-text { font-size: 20px; font-weight: 500; letter-spacing: 2px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
.status { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.spinner { width: 40px; height: 40px; border: 3px solid var(--border);
  border-top-color: var(--gold); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.success-icon { font-size: 50px; }
.error-icon   { font-size: 50px; }
h2 { font-size: 22px; font-weight: 500; color: var(--tp); }
.sub { font-size: 13px; color: var(--ts); line-height: 1.6; }
.btn-primary { display: block; width: 100%; padding: 14px; border-radius: 12px; border: none;
  cursor: pointer; background: linear-gradient(135deg, #D4A843, #FF6B1A);
  color: white; font-size: 15px; font-weight: 500; text-decoration: none; margin-top: 8px; }
</style>