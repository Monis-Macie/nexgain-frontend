<template>
  <div class="app-shell">
    <div class="page-hdr">
      <h1>NexPay</h1>
      <span class="sub">Levantamentos via e-Mola</span>
    </div>

    <div class="bal-banner">
      <div class="bb-label">Saldo disponível</div>
      <div class="bb-val">{{ fmt(balance) }} MZN</div>
    </div>

    <!-- Info do pacote -->
    <div class="pkg-info" v-if="userPackage">
      <div class="pi-item">
        <span class="pi-lbl">Pacote</span>
        <span class="pi-val">{{ userPackage.name }}</span>
      </div>
      <div class="pi-item">
        <span class="pi-lbl">Intervalo</span>
        <span class="pi-val">{{ userPackage.withdrawal_days }} dias</span>
      </div>
      <div class="pi-item">
        <span class="pi-lbl">Mínimo</span>
        <span class="pi-val">500 MZN</span>
      </div>
      <div class="pi-item">
        <span class="pi-lbl">Próximo</span>
        <span class="pi-val" :class="{ ok: canWithdraw, wait: !canWithdraw }">
          {{ canWithdraw ? 'Disponível' : nextWithdrawal }}
        </span>
      </div>
    </div>

    <div class="action-tabs">
      <button :class="['atab', { on: tab === 'withdraw' }]" @click="tab = 'withdraw'">Levantar</button>
      <button :class="['atab', { on: tab === 'history' }]" @click="tab = 'history'; loadHistory()">Histórico</button>
    </div>

    <!-- Levantamento -->
    <div v-if="tab === 'withdraw'" class="form-card">
      <div class="form-title">Novo levantamento</div>

      <div v-if="!canWithdraw" class="warning-box">
        ⏳ Ainda não podes levantar. Próximo levantamento disponível em <strong>{{ nextWithdrawal }}</strong>
      </div>

      <div v-else>
        <div class="field">
          <label>Valor (MZN)</label>
          <input v-model="form.amount" type="number" min="500" :max="balance" placeholder="Mín. 500 MZN" :disabled="!canWithdraw" />
        </div>

        <div class="method-emola">
          <div class="emola-icon">📱</div>
          <div>
            <div class="emola-name">e-Mola</div>
            <div class="emola-sub">Único método disponível</div>
          </div>
        </div>

        <div class="field">
          <label>Número e-Mola para receber</label>
          <input v-model="form.phone" type="tel" placeholder="Ex: 871234567" :disabled="!canWithdraw" />
        </div>

        <div v-if="msg" :class="['msg', msgType]">{{ msg }}</div>
        <button class="btn-primary" :disabled="loading || !canWithdraw" @click="submit">
          {{ loading ? 'A processar...' : 'Confirmar levantamento' }}
        </button>
        <p class="note">Levantamentos processados de 1h a 3h em dias úteis.</p>
      </div>
    </div>

    <!-- Histórico -->
    <div v-if="tab === 'history'" class="history">
      <div v-for="p in payments" :key="p.id" class="hist-item">
        <div class="hist-left">
          <div class="hist-icon withdrawal">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M19 9h-3.84V5H8.84v4H5L12 16l7-7z"/>
            </svg>
          </div>
          <div>
            <div class="hist-type">Levantamento</div>
            <div class="hist-method">e-Mola · {{ p.phone }}</div>
            <div class="hist-date">{{ fmtDate(p.created_at) }}</div>
          </div>
        </div>
        <div class="hist-right">
          <div class="hist-amount">-{{ fmt(p.amount) }}</div>
          <div :class="['hist-status', p.status]">{{ statusLabel(p.status) }}</div>
        </div>
      </div>
      <div v-if="payments.length === 0" class="empty">Nenhum levantamento ainda</div>
    </div>

    <div style="height:80px"></div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BottomNav from '../components/BottomNav.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const balance = ref(auth.user?.balance || 0)
const tab = ref('withdraw')
const loading = ref(false)
const msg = ref('')
const msgType = ref('ok')
const payments = ref([])
const userPackage = ref(null)
const lastWithdrawal = ref(null)

const form = ref({ amount: '', phone: '' })

const fmt = n => Number(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })
const fmtDate = d => new Date(d).toLocaleDateString('pt-MZ')
const statusLabel = s => ({ pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado' }[s] || s)

const canWithdraw = computed(() => {
  if (!userPackage.value) return false
  if (!lastWithdrawal.value) return true
  const days = userPackage.value.withdrawal_days
  const last = new Date(lastWithdrawal.value)
  const next = new Date(last.getTime() + days * 24 * 60 * 60 * 1000)
  return new Date() >= next
})

const nextWithdrawal = computed(() => {
  if (!lastWithdrawal.value || !userPackage.value) return '—'
  const days = userPackage.value.withdrawal_days
  const last = new Date(lastWithdrawal.value)
  const next = new Date(last.getTime() + days * 24 * 60 * 60 * 1000)
  return next.toLocaleDateString('pt-MZ')
})

async function submit() {
  msg.value = ''
  loading.value = true
  try {
    const res = await axios.post('/payments/withdraw', form.value)
    msg.value = res.data.message
    msgType.value = 'ok'
    form.value = { amount: '', phone: '' }
    const dash = await axios.get('/dashboard')
    balance.value = dash.data.balance
  } catch (e) {
    msg.value = e.response?.data?.message || 'Erro ao processar pedido'
    msgType.value = 'err'
  } finally {
    loading.value = false
  }
}

async function loadHistory() {
  const res = await axios.get('/payments')
  payments.value = (res.data.data || res.data).filter(p => p.type === 'withdrawal')
}

onMounted(async () => {
  const [dash, pkgs] = await Promise.all([
    axios.get('/dashboard'),
    axios.get('/packages'),
  ])
  balance.value = dash.data.balance
  lastWithdrawal.value = dash.data.user?.last_withdrawal
  const userPkgName = dash.data.user?.package
  userPackage.value = pkgs.data.find(p => p.name === userPkgName) || null
})
</script>

<style scoped>
.page-hdr { padding: 20px 16px 0; margin-bottom: 14px; }
h1 { font-size: 22px; font-weight: 500; }
.sub { font-size: 13px; color: var(--ts); }
.bal-banner { margin: 0 16px 12px; background: linear-gradient(135deg,#1a1208,#1f1a0a);
  border: 1px solid var(--gold-border); border-radius: 16px; padding: 20px; text-align: center; }
.bb-label { font-size: 11px; color: var(--ts); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.bb-val { font-size: 30px; font-weight: 500; color: var(--gold2); }
.pkg-info { margin: 0 16px 12px; background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 12px; display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.pi-item { text-align: center; }
.pi-lbl { display: block; font-size: 9px; color: var(--ts); text-transform: uppercase; margin-bottom: 4px; }
.pi-val { font-size: 12px; font-weight: 500; color: var(--tp); }
.pi-val.ok   { color: var(--green); }
.pi-val.wait { color: var(--og); }
.action-tabs { display: flex; gap: 8px; padding: 0 16px; margin-bottom: 16px; }
.atab { flex: 1; font-size: 13px; padding: 10px; border-radius: 12px;
  background: var(--card); border: 1px solid var(--border); color: var(--ts); cursor: pointer; }
.atab.on { background: var(--gold-dim); border-color: var(--gold-border); color: var(--gold2); }
.form-card { margin: 0 16px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
.form-title { font-size: 15px; font-weight: 500; margin-bottom: 16px; }
.warning-box { background: rgba(255,107,26,0.1); border: 1px solid rgba(255,107,26,0.3);
  border-radius: 10px; padding: 12px 14px; font-size: 13px; color: var(--og2); line-height: 1.5; }
.method-emola { display: flex; align-items: center; gap: 10px; background: rgba(255,107,26,0.08);
  border: 1px solid rgba(255,107,26,0.2); border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; }
.emola-icon { font-size: 24px; }
.emola-name { font-size: 14px; font-weight: 500; color: var(--og2); }
.emola-sub { font-size: 11px; color: var(--ts); }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 12px; color: var(--ts); margin-bottom: 6px; }
.field input { width: 100%; background: var(--card2); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px 14px; color: var(--tp); font-size: 14px; outline: none; }
.field input:focus { border-color: var(--gold-border); }
.field input:disabled { opacity: 0.5; }
.msg { font-size: 13px; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
.msg.ok  { background: var(--green-dim); color: var(--green); }
.msg.err { background: rgba(226,75,74,0.1); color: var(--danger); }
.btn-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 14px; font-weight: 500; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.note { font-size: 11px; color: var(--ts); margin-top: 10px; text-align: center; line-height: 1.5; }
.history { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
.hist-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px;
  padding: 12px; display: flex; align-items: center; justify-content: space-between; }
.hist-left { display: flex; align-items: center; gap: 10px; }
.hist-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.hist-icon.withdrawal { background: rgba(226,75,74,0.1); color: var(--danger); }
.hist-type { font-size: 13px; font-weight: 500; }
.hist-method { font-size: 10px; color: var(--gold); }
.hist-date { font-size: 11px; color: var(--ts); }
.hist-amount { font-size: 14px; font-weight: 500; color: var(--danger); text-align: right; }
.hist-status { font-size: 10px; text-align: right; margin-top: 2px; }
.hist-status.pending  { color: var(--gold); }
.hist-status.approved { color: var(--green); }
.hist-status.rejected { color: var(--danger); }
.empty { text-align: center; color: var(--ts); padding: 30px; }
</style>