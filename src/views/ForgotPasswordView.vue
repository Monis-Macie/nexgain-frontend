<template>
  <div class="auth-page">
    <div class="auth-glow"></div>

    <div class="auth-hdr">
      <div class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" fill="#1a0e00"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
        </div>
        <span class="logo-text">NEX<em>GAIN</em></span>
      </div>
    </div>

    <!-- Passo 1: Email -->
    <div class="auth-card" v-if="step === 1">
      <div class="card-icon">🔐</div>
      <h2>Recuperar senha</h2>
      <p class="card-sub">Introduz o teu email e enviaremos um código de verificação.</p>

      <div class="field">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="o.teu@email.com" />
      </div>

      <div v-if="error" class="msg err">{{ error }}</div>
      <div v-if="success" class="msg ok">{{ success }}</div>

      <button class="btn-primary" :disabled="loading || !email" @click="sendCode">
        {{ loading ? 'A enviar...' : 'Enviar código' }}
      </button>

      <div class="back-link" @click="$router.push('/login')">← Voltar ao login</div>
    </div>

    <!-- Passo 2: Código + Nova senha -->
    <div class="auth-card" v-if="step === 2">
      <div class="card-icon">📧</div>
      <h2>Verifica o teu email</h2>
      <p class="card-sub">Enviámos um código de 6 dígitos para <strong>{{ email }}</strong>. Verifica também a pasta de spam.</p>

      <div class="field">
        <label>Código de verificação</label>
        <input v-model="code" type="text" placeholder="Ex: 123456" maxlength="6" />
      </div>
      <div class="field">
        <label>Nova senha</label>
        <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" />
      </div>
      <div class="field">
        <label>Confirmar nova senha</label>
        <input v-model="passwordConfirmation" type="password" placeholder="Repete a nova senha" />
      </div>

      <div v-if="error" class="msg err">{{ error }}</div>
      <div v-if="success" class="msg ok">{{ success }}</div>

      <button class="btn-primary" :disabled="loading || !code || !password || !passwordConfirmation" @click="resetPassword">
        {{ loading ? 'A alterar...' : 'Alterar senha' }}
      </button>

      <div class="resend-row">
        <span class="resend-txt">Não recebeste o código?</span>
        <span class="resend-btn" @click="sendCode">Reenviar</span>
      </div>
      <div class="back-link" @click="step = 1">← Alterar email</div>
    </div>

    <!-- Passo 3: Sucesso -->
    <div class="auth-card success-card" v-if="step === 3">
      <div class="card-icon">🎉</div>
      <h2>Senha alterada!</h2>
      <p class="card-sub">A tua senha foi alterada com sucesso. Podes fazer login agora.</p>
      <button class="btn-primary" @click="$router.push('/login')">Ir para o login</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const step = ref(1)
const email = ref('')
const code = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function sendCode() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await axios.post('/forgot-password', { email: email.value })
    success.value = 'Código enviado! Verifica o teu email.'
    step.value = 2
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao enviar código'
  } finally {
    loading.value = false
  }
}

async function resetPassword() {
  error.value = ''
  if (password.value !== passwordConfirmation.value) {
    error.value = 'As senhas não coincidem'
    return
  }
  loading.value = true
  try {
    await axios.post('/reset-password', {
      email:                 email.value,
      code:                  code.value,
      password:              password.value,
      password_confirmation: passwordConfirmation.value,
    })
    step.value = 3
  } catch (e) {
    error.value = e.response?.data?.message || 'Código inválido ou expirado'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { max-width: 430px; margin: 0 auto; min-height: 100vh; background: var(--bg); padding: 0 16px 40px; display: flex; flex-direction: column; align-items: center; position: relative; }
.auth-glow { position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%); pointer-events: none; }
.auth-hdr { width: 100%; padding: 32px 0 24px; display: flex; justify-content: center; }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-mark { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#D4A843,#F0C96A); display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 20px; height: 20px; }
.logo-text { font-size: 19px; font-weight: 500; letter-spacing: 2px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
.auth-card { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 24px; text-align: center; }
.card-icon { font-size: 44px; margin-bottom: 12px; }
h2 { font-size: 20px; font-weight: 500; margin-bottom: 8px; }
.card-sub { font-size: 13px; color: var(--ts); line-height: 1.6; margin-bottom: 20px; }
.field { text-align: left; margin-bottom: 14px; }
.field label { display: block; font-size: 12px; color: var(--ts); margin-bottom: 6px; }
.field input { width: 100%; background: var(--card2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; color: var(--tp); font-size: 14px; outline: none; box-sizing: border-box; }
.field input:focus { border-color: var(--gold-border); }
.msg { font-size: 13px; padding: 9px 12px; border-radius: 8px; margin-bottom: 12px; text-align: left; }
.msg.ok  { background: var(--green-dim); color: var(--green); }
.msg.err { background: rgba(226,75,74,0.1); color: var(--danger); }
.btn-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 14px; font-weight: 500; margin-bottom: 14px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.back-link { font-size: 13px; color: var(--ts); cursor: pointer; margin-top: 4px; }
.back-link:hover { color: var(--gold); }
.resend-row { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 10px; }
.resend-txt { font-size: 12px; color: var(--ts); }
.resend-btn { font-size: 12px; color: var(--gold); cursor: pointer; }
.success-card { border-color: rgba(34,201,122,0.3); }
</style>