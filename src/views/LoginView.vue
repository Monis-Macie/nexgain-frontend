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
      <h2>Bem-vindo de volta</h2>
      <p class="sub">Entra na tua conta para continuar</p>

      <form @submit.prevent="submit">
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="email@exemplo.com" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="form.password" type="password" placeholder="••••••" required />
        </div>
        <div class="forgot-row">
          <router-link to="/forgot-password" class="forgot-link">Esqueceste a senha?</router-link>
        </div>
        <div v-if="error" class="err">{{ error }}</div>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'A entrar...' : 'Entrar' }}
        </button>
      </form>
      <p class="link">Não tens conta? <router-link to="/register">Registar</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const data = await auth.login(form.value.email, form.value.password)
    if (data.user?.is_admin) return router.push('/admin')
    if (!data.package_selected) return router.push('/packages')
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao entrar'
  } finally {
    loading.value = false
  }
}
</script>

<style>
:root {
  --og: #FF6B1A;
  --og2: #FF8C42;
  --gold: #D4A843;
  --gold2: #F0C96A;
  --gold-dim: rgba(212,168,67,0.12);
  --gold-border: rgba(212,168,67,0.22);
  --green: #22C97A;
  --green-dim: rgba(34,201,122,0.1);
  --bg: #09090B;
  --card: #111115;
  --card2: #18181E;
  --card3: #1F1F27;
  --border: rgba(255,255,255,0.06);
  --tp: #F5F3EE;
  --ts: #7A7875;
  --danger: #E24B4A;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--tp); font-family: 'Sora', sans-serif; }
.app-shell { max-width: 430px; margin: 0 auto; min-height: 100vh; background: var(--bg); }
</style>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); position: relative; overflow: hidden; padding: 20px; }
.auth-glow { position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%); pointer-events: none; }
.auth-card { width: 100%; max-width: 380px; background: var(--card);
  border: 1px solid var(--gold-border); border-radius: 20px; padding: 36px 28px; position: relative; }
.logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.logo-mark { width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #D4A843, #F0C96A);
  display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 20px; height: 20px; }
.logo-text { font-size: 20px; font-weight: 500; letter-spacing: 2px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
h2 { font-size: 22px; font-weight: 500; color: var(--tp); margin-bottom: 6px; }
.sub { font-size: 13px; color: var(--ts); margin-bottom: 28px; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 12px; color: var(--ts); margin-bottom: 6px; letter-spacing: 0.5px; }
.field input { width: 100%; background: var(--card2); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px 14px; color: var(--tp); font-size: 14px; outline: none; }
.field input:focus { border-color: var(--gold-border); }
.forgot-row { text-align: right; margin-bottom: 16px; margin-top: -8px; }
.forgot-link { font-size: 12px; color: var(--gold); text-decoration: none; }
.err { font-size: 13px; color: var(--danger); margin-bottom: 12px; }
.btn-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #D4A843, #FF6B1A); color: white;
  font-size: 15px; font-weight: 500; letter-spacing: 0.5px; margin-top: 4px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.link { font-size: 13px; color: var(--ts); text-align: center; margin-top: 20px; }
.link a { color: var(--gold); text-decoration: none; }
</style>