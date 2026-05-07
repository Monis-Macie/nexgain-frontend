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
      <h2>Criar conta</h2>
      <p class="sub">Junta-te à comunidade NexGain</p>

      <form @submit.prevent="submit">
        <div class="field">
          <label>Nome completo</label>
          <input v-model="form.name" type="text" placeholder="João Machava" required />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="email@exemplo.com" required />
        </div>
        <div class="field">
          <label>Telefone</label>
          <input v-model="form.phone" type="tel" placeholder="+258 84 000 0000" />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div class="field">
          <label>Confirmar password</label>
          <input v-model="form.password_confirmation" type="password" placeholder="Repete a password" required />
        </div>
        <div class="field">
          <label>Código de convite <span class="required">*obrigatório</span></label>
          <input v-model="form.referral_code" type="text" placeholder="Ex: ABCD1234" required />
        </div>

        <div class="terms-row">
          <input type="checkbox" id="terms" v-model="form.terms_accepted" required />
          <label for="terms">
            Li e aceito os <span class="terms-link" @click="showTerms = true">Termos e Condições</span>
          </label>
        </div>

        <div v-if="error" class="err">{{ error }}</div>
        <button type="submit" :disabled="loading || !form.terms_accepted" class="btn-primary">
          {{ loading ? 'A criar conta...' : 'Criar conta' }}
        </button>
      </form>
      <p class="link">Já tens conta? <router-link to="/login">Entrar</router-link></p>
    </div>

    <!-- Modal Termos -->
    <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
      <div class="modal">
        <div class="modal-hdr">
          <span>Termos e Condições</span>
          <button @click="showTerms = false">✕</button>
        </div>
        <div class="modal-body">
          <h3>1. Aceitação dos Termos</h3>
          <p>Ao criar uma conta no NexGain, aceitas os presentes termos e condições de uso da plataforma.</p>
          <h3>2. Funcionamento da Plataforma</h3>
          <p>O NexGain é uma plataforma de rendimentos baseada na visualização de anúncios e no sistema de referidos. Os rendimentos dependem do pacote escolhido.</p>
          <h3>3. Pacotes e Pagamentos</h3>
          <p>Para activar a conta, o utilizador deve adquirir um pacote mediante pagamento via e-Mola. O pagamento é processado manualmente pela equipa NexGain.</p>
          <h3>4. Levantamentos</h3>
          <p>Os levantamentos estão sujeitos a limites de tempo de acordo com o pacote do utilizador. O valor mínimo de levantamento é de 500 MZN.</p>
          <h3>5. Sistema de Referidos</h3>
          <p>O utilizador que convida recebe 20% do valor do pacote escolhido pelo convidado, após activação da conta do convidado.</p>
          <h3>6. Responsabilidades</h3>
          <p>O NexGain não se responsabiliza por perdas resultantes de informações incorrectas fornecidas pelo utilizador.</p>
          <h3>7. Encerramento de Conta</h3>
          <p>O NexGain reserva-se o direito de encerrar contas que violem os presentes termos.</p>
        </div>
        <button class="btn-accept" @click="form.terms_accepted = true; showTerms = false">
          Aceitar e fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const showTerms = ref(false)
const form = ref({
  name: '', email: '', phone: '', password: '',
  password_confirmation: '',
  referral_code: route.query.ref || '',
  terms_accepted: false,
})
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!form.value.terms_accepted) {
    error.value = 'Tens de aceitar os termos e condições'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await auth.register(form.value)
    router.push('/packages')
  } catch (e) {
    const errors = e.response?.data?.errors
    error.value = errors
      ? Object.values(errors).flat().join('. ')
      : (e.response?.data?.message || 'Erro ao registar')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); position: relative; overflow: hidden; padding: 20px; }
.auth-glow { position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%); pointer-events: none; }
.auth-card { width: 100%; max-width: 380px; background: var(--card);
  border: 1px solid var(--gold-border); border-radius: 20px; padding: 36px 28px; }
.logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.logo-mark { width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #D4A843, #F0C96A); display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 20px; height: 20px; }
.logo-text { font-size: 20px; font-weight: 500; letter-spacing: 2px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
h2 { font-size: 22px; font-weight: 500; color: var(--tp); margin-bottom: 6px; }
.sub { font-size: 13px; color: var(--ts); margin-bottom: 28px; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 12px; color: var(--ts); margin-bottom: 6px; }
.required { color: var(--og); font-size: 10px; margin-left: 4px; }
.field input { width: 100%; background: var(--card2); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px 14px; color: var(--tp); font-size: 14px; outline: none; }
.field input:focus { border-color: var(--gold-border); }
.terms-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.terms-row input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--gold); }
.terms-row label { font-size: 13px; color: var(--ts); cursor: pointer; }
.terms-link { color: var(--gold); text-decoration: underline; cursor: pointer; }
.err { font-size: 13px; color: var(--danger); margin-bottom: 12px; }
.btn-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #D4A843, #FF6B1A); color: white;
  font-size: 15px; font-weight: 500; margin-top: 4px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.link { font-size: 13px; color: var(--ts); text-align: center; margin-top: 20px; }
.link a { color: var(--gold); text-decoration: none; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal { background: var(--card); border: 1px solid var(--gold-border); border-radius: 16px;
  width: 100%; max-width: 420px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-hdr { display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid var(--border); font-weight: 500; }
.modal-hdr button { background: none; border: none; color: var(--ts); font-size: 18px; cursor: pointer; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.modal-body h3 { font-size: 14px; color: var(--gold); margin: 16px 0 6px; }
.modal-body p { font-size: 13px; color: var(--ts); line-height: 1.6; }
.btn-accept { margin: 12px 20px 20px; padding: 12px; border-radius: 10px; border: none;
  cursor: pointer; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 14px; }
</style>