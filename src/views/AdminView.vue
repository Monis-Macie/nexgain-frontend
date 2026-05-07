<template>
  <div class="admin-shell">
    <div class="admin-hdr">
      <div class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" fill="#1a0e00"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
        </div>
        <span class="logo-text">NEX<em>GAIN</em> <span class="admin-badge">ADMIN</span></span>
      </div>
      <button class="btn-logout" @click="logout">Sair</button>
    </div>

    <!-- STATS -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-val">{{ stats.total_users }}</div>
        <div class="stat-lbl">Utilizadores</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-val">{{ fmt(stats.total_deposits) }}</div>
        <div class="stat-lbl">Depósitos (MZN)</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📤</div>
        <div class="stat-val">{{ fmt(stats.total_withdrawals) }}</div>
        <div class="stat-lbl">Levantamentos</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-val">{{ stats.pending_count }}</div>
        <div class="stat-lbl">Pendentes</div>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button v-for="t in tabs" :key="t.val"
        :class="['tab', { on: activeTab === t.val }]"
        @click="activeTab = t.val; loadData()">
        {{ t.label }}
      </button>
    </div>

    <!-- PAGAMENTOS -->
    <div v-if="activeTab === 'deposits' || activeTab === 'withdrawals'" class="payments-list">
      <div class="filter-row">
        <select v-model="statusFilter" @change="loadData()">
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div v-for="p in payments" :key="p.id" class="payment-card">
        <div class="pay-top">
          <div class="pay-user">
            <div class="pay-avatar">{{ p.user?.name?.[0]?.toUpperCase() }}</div>
            <div>
              <div class="pay-name">{{ p.user?.name }}</div>
              <div class="pay-email">{{ p.user?.email }}</div>
              <div class="pay-phone">📱 {{ p.phone }}</div>
              <div class="pay-ref" v-if="p.transaction_ref">🔖 Ref: {{ p.transaction_ref }}</div>
            </div>
          </div>
          <div class="pay-right">
            <div :class="['pay-type', p.type]">{{ p.type === 'deposit' ? 'Depósito' : 'Levantamento' }}</div>
            <div class="pay-amount">{{ fmt(p.amount) }} MZN</div>
            <div class="pay-method">{{ p.method }}</div>
            <div :class="['pay-status', p.status]">{{ statusLabel(p.status) }}</div>
          </div>
        </div>
        <div class="pay-date">{{ fmtDate(p.created_at) }}</div>
        <div v-if="p.status === 'pending'" class="pay-actions">
          <div class="note-field">
            <input v-model="notes[p.id]" type="text" placeholder="Nota (opcional)" />
          </div>
          <div class="action-btns">
            <button class="btn-approve" :disabled="processing === p.id" @click="approve(p.id)">
              {{ processing === p.id ? '...' : '✓ Aprovar' }}
            </button>
            <button class="btn-reject" :disabled="processing === p.id" @click="reject(p.id)">
              {{ processing === p.id ? '...' : '✗ Rejeitar' }}
            </button>
          </div>
        </div>
        <div v-if="p.admin_note" class="pay-note">📝 {{ p.admin_note }}</div>
      </div>
      <div v-if="payments.length === 0" class="empty">Nenhum pagamento encontrado</div>
    </div>

    <!-- UTILIZADORES -->
    <div v-if="activeTab === 'users'" class="users-list">
      <div v-for="u in users" :key="u.id" class="user-card">
        <div class="user-top">
          <div class="user-avatar">{{ u.name?.[0]?.toUpperCase() }}</div>
          <div class="user-info">
            <div class="user-name">{{ u.name }}</div>
            <div class="user-email">{{ u.email }}</div>
            <div class="user-meta">
              {{ u.package || 'Sem pacote' }} ·
              <span :class="u.package_selected ? 'active' : 'pending'">
                {{ u.package_selected ? 'Activo' : 'Pendente' }}
              </span>
            </div>
          </div>
          <div class="user-balance">
            <div class="ub-val">{{ fmt(u.balance) }}</div>
            <div class="ub-lbl">MZN</div>
          </div>
        </div>
        <div class="balance-adjust">
          <input v-model="adjustments[u.id]" type="number" placeholder="Valor a adicionar (MZN)" />
          <button class="btn-adjust" @click="adjustBalance(u.id)">Adicionar</button>
        </div>
      </div>
      <div v-if="users.length === 0" class="empty">Nenhum utilizador encontrado</div>
    </div>

    <!-- ANÚNCIOS -->
    <div v-if="activeTab === 'activities'" class="activities-admin">

      <!-- Formulário criar anúncio -->
      <div class="create-form">
        <div class="form-title">{{ editingId ? '✏️ Editar anúncio' : '➕ Novo anúncio' }}</div>
        <div class="field">
          <label>Título</label>
          <input v-model="newActivity.title" type="text" placeholder="Ex: Descobre os pacotes NexGain" />
        </div>
        <div class="field">
          <label>Descrição</label>
          <textarea v-model="newActivity.description" placeholder="Descrição do anúncio..." rows="3"></textarea>
        </div>
        <div class="field">
          <label>Link (opcional)</label>
          <input v-model="newActivity.url" type="url" placeholder="https://..." />
        </div>
        <div class="field">
          <label>URL da imagem (opcional)</label>
          <input v-model="newActivity.image" type="text" placeholder="https://imagem.jpg" />
        </div>
        <div class="field">
          <label>Anunciante</label>
          <input v-model="newActivity.advertiser" type="text" placeholder="NexGain" />
        </div>
        <div class="form-actions">
          <button class="btn-save" :disabled="saving" @click="saveActivity">
            {{ saving ? 'A guardar...' : editingId ? 'Actualizar' : 'Criar anúncio' }}
          </button>
          <button v-if="editingId" class="btn-cancel" @click="cancelEdit">Cancelar</button>
        </div>
      </div>

      <!-- Lista de anúncios -->
      <div class="activities-list">
        <div v-for="a in activities" :key="a.id" class="activity-card">
          <div class="act-top">
            <div class="act-info">
              <div class="act-title">{{ a.title }}</div>
              <div class="act-advertiser">{{ a.advertiser }}</div>
              <div class="act-desc" v-if="a.description">{{ a.description }}</div>
            </div>
            <div :class="['act-status', a.is_active ? 'on' : 'off']">
              {{ a.is_active ? 'Activo' : 'Inactivo' }}
            </div>
          </div>
          <div class="act-actions">
            <button class="btn-edit" @click="editActivity(a)">✏️ Editar</button>
            <button class="btn-toggle" @click="toggleActivity(a)">
              {{ a.is_active ? '⏸ Desactivar' : '▶ Activar' }}
            </button>
            <button class="btn-delete" @click="deleteActivity(a.id)">🗑 Eliminar</button>
          </div>
        </div>
        <div v-if="activities.length === 0" class="empty">Nenhum anúncio criado ainda</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const stats = ref(null)
const payments = ref([])
const users = ref([])
const activities = ref([])
const notes = ref({})
const adjustments = ref({})
const processing = ref(null)
const statusFilter = ref('pending')
const activeTab = ref('deposits')
const saving = ref(false)
const editingId = ref(null)

const newActivity = ref({
  title: '', description: '', url: '', image: '', advertiser: 'NexGain'
})

const tabs = [
  { val: 'deposits',    label: 'Depósitos' },
  { val: 'withdrawals', label: 'Levantamentos' },
  { val: 'users',       label: 'Utilizadores' },
  { val: 'activities',  label: 'Anúncios' },
]

const fmt = n => Number(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })
const fmtDate = d => new Date(d).toLocaleDateString('pt-MZ', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
const statusLabel = s => ({ pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado' }[s] || s)

async function loadStats() {
  const { data } = await axios.get('/admin/stats')
  stats.value = data
}

async function loadData() {
  if (activeTab.value === 'users') {
    const { data } = await axios.get('/admin/users')
    users.value = data.data || data
  } else if (activeTab.value === 'activities') {
    const { data } = await axios.get('/admin/activities')
    activities.value = data.data || data
  } else {
    const type = activeTab.value === 'deposits' ? 'deposit' : 'withdrawal'
    const { data } = await axios.get('/admin/payments', {
      params: { status: statusFilter.value, type }
    })
    payments.value = data.data?.data || data.data || data
  }
}

async function approve(id) {
  processing.value = id
  try {
    await axios.post(`/admin/payments/${id}/approve`, { note: notes.value[id] })
    await Promise.all([loadData(), loadStats()])
  } catch (e) {
    alert(e.response?.data?.message || 'Erro')
  } finally {
    processing.value = null
  }
}

async function reject(id) {
  processing.value = id
  try {
    await axios.post(`/admin/payments/${id}/reject`, { note: notes.value[id] })
    await Promise.all([loadData(), loadStats()])
  } catch (e) {
    alert(e.response?.data?.message || 'Erro')
  } finally {
    processing.value = null
  }
}

async function adjustBalance(userId) {
  const amount = adjustments.value[userId]
  if (!amount) return alert('Insere um valor')
  try {
    await axios.post(`/admin/users/${userId}/balance`, { amount })
    alert('Saldo actualizado!')
    adjustments.value[userId] = ''
    loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erro')
  }
}

async function saveActivity() {
  if (!newActivity.value.title) return alert('Título obrigatório')
  saving.value = true
  try {
    if (editingId.value) {
      await axios.put(`/admin/activities/${editingId.value}`, newActivity.value)
    } else {
      await axios.post('/admin/activities', newActivity.value)
    }
    cancelEdit()
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erro')
  } finally {
    saving.value = false
  }
}

function editActivity(a) {
  editingId.value = a.id
  newActivity.value = {
    title: a.title, description: a.description || '',
    url: a.url || '', image: a.image || '',
    advertiser: a.advertiser || 'NexGain'
  }
}

function cancelEdit() {
  editingId.value = null
  newActivity.value = { title: '', description: '', url: '', image: '', advertiser: 'NexGain' }
}

async function toggleActivity(a) {
  try {
    await axios.put(`/admin/activities/${a.id}`, { ...a, is_active: !a.is_active })
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erro')
  }
}

async function deleteActivity(id) {
  if (!confirm('Tens a certeza que queres eliminar este anúncio?')) return
  try {
    await axios.delete(`/admin/activities/${id}`)
    await loadData()
  } catch (e) {
    alert(e.response?.data?.message || 'Erro')
  }
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  await Promise.all([loadStats(), loadData()])
})
</script>

<style scoped>
.admin-shell { max-width: 800px; margin: 0 auto; min-height: 100vh; background: var(--bg); padding-bottom: 40px; }
.admin-hdr { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(170deg,#1a1208,var(--bg)); border-bottom: 1px solid var(--gold-border); }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-mark { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg,#D4A843,#F0C96A); display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 16px; height: 16px; }
.logo-text { font-size: 16px; font-weight: 500; letter-spacing: 1px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
.admin-badge { font-size: 10px; background: var(--og); color: white; padding: 2px 6px; border-radius: 6px; margin-left: 6px; }
.btn-logout { font-size: 12px; padding: 6px 14px; border-radius: 8px; background: rgba(226,75,74,0.1); border: 1px solid rgba(226,75,74,0.2); color: var(--danger); cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; padding: 16px 20px; }
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px 10px; text-align: center; }
.stat-card.pending { border-color: rgba(255,107,26,0.3); }
.stat-icon { font-size: 20px; margin-bottom: 6px; }
.stat-val { font-size: 16px; font-weight: 500; color: var(--gold2); }
.stat-lbl { font-size: 9px; color: var(--ts); margin-top: 3px; }
.tabs { display: flex; gap: 8px; padding: 0 20px; margin-bottom: 16px; overflow-x: auto; }
.tab { font-size: 13px; padding: 8px 18px; border-radius: 20px; background: var(--card); border: 1px solid var(--border); color: var(--ts); cursor: pointer; white-space: nowrap; }
.tab.on { background: var(--gold-dim); border-color: var(--gold-border); color: var(--gold2); }
.filter-row { padding: 0 0 12px; }
.filter-row select { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--tp); font-size: 13px; outline: none; }
.payments-list { padding: 0 20px; display: flex; flex-direction: column; gap: 10px; }
.payment-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
.pay-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.pay-user { display: flex; align-items: flex-start; gap: 10px; }
.pay-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg,#D4A843,#FF6B1A); display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 500; color: white; flex-shrink: 0; }
.pay-name { font-size: 13px; font-weight: 500; }
.pay-email { font-size: 11px; color: var(--ts); }
.pay-phone { font-size: 11px; color: var(--gold); margin-top: 2px; }
.pay-ref { font-size: 11px; color: var(--og2); margin-top: 2px; }
.pay-right { text-align: right; }
.pay-type { font-size: 10px; padding: 2px 8px; border-radius: 6px; margin-bottom: 4px; display: inline-block; }
.pay-type.deposit    { background: var(--green-dim); color: var(--green); }
.pay-type.withdrawal { background: rgba(226,75,74,0.1); color: var(--danger); }
.pay-amount { font-size: 18px; font-weight: 500; color: var(--gold2); }
.pay-method { font-size: 11px; color: var(--ts); }
.pay-status { font-size: 11px; margin-top: 2px; }
.pay-status.pending  { color: var(--og); }
.pay-status.approved { color: var(--green); }
.pay-status.rejected { color: var(--danger); }
.pay-date { font-size: 11px; color: var(--ts); margin-bottom: 10px; }
.note-field input { width: 100%; background: var(--card2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--tp); font-size: 12px; outline: none; margin-bottom: 8px; }
.action-btns { display: flex; gap: 8px; }
.btn-approve { flex: 1; padding: 10px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg,#00c853,#009624); color: white; font-size: 13px; font-weight: 500; }
.btn-reject  { flex: 1; padding: 10px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg,#E24B4A,#c0392b); color: white; font-size: 13px; font-weight: 500; }
.btn-approve:disabled, .btn-reject:disabled { opacity: 0.6; }
.pay-note { font-size: 11px; color: var(--ts); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.users-list { padding: 0 20px; display: flex; flex-direction: column; gap: 10px; }
.user-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
.user-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#D4A843,#FF6B1A); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 500; color: white; flex-shrink: 0; }
.user-info { flex: 1; }
.user-name { font-size: 14px; font-weight: 500; }
.user-email { font-size: 11px; color: var(--ts); }
.user-meta { font-size: 11px; color: var(--ts); margin-top: 2px; }
.user-meta .active  { color: var(--green); }
.user-meta .pending { color: var(--og); }
.user-balance { text-align: right; }
.ub-val { font-size: 18px; font-weight: 500; color: var(--gold2); }
.ub-lbl { font-size: 10px; color: var(--ts); }
.balance-adjust { display: flex; gap: 8px; }
.balance-adjust input { flex: 1; background: var(--card2); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--tp); font-size: 13px; outline: none; }
.btn-adjust { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 12px; white-space: nowrap; }
.activities-admin { padding: 0 20px; }
.create-form { background: var(--card); border: 1px solid var(--gold-border); border-radius: 14px; padding: 16px; margin-bottom: 16px; }
.form-title { font-size: 14px; font-weight: 500; color: var(--gold); margin-bottom: 14px; }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; color: var(--ts); margin-bottom: 6px; }
.field input, .field textarea { width: 100%; background: var(--card2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; color: var(--tp); font-size: 13px; outline: none; resize: vertical; }
.field input:focus, .field textarea:focus { border-color: var(--gold-border); }
.form-actions { display: flex; gap: 8px; }
.btn-save { flex: 1; padding: 11px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 13px; font-weight: 500; }
.btn-cancel { padding: 11px 16px; border-radius: 10px; background: var(--card2); border: 1px solid var(--border); color: var(--ts); font-size: 13px; cursor: pointer; }
.activities-list { display: flex; flex-direction: column; gap: 10px; }
.activity-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
.act-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 10px; }
.act-title { font-size: 14px; font-weight: 500; margin-bottom: 3px; }
.act-advertiser { font-size: 10px; color: var(--og); text-transform: uppercase; margin-bottom: 4px; }
.act-desc { font-size: 12px; color: var(--ts); line-height: 1.4; }
.act-status { font-size: 11px; padding: 3px 8px; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
.act-status.on  { background: var(--green-dim); color: var(--green); }
.act-status.off { background: rgba(226,75,74,0.1); color: var(--danger); }
.act-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-edit   { padding: 6px 12px; border-radius: 8px; background: var(--gold-dim); border: 1px solid var(--gold-border); color: var(--gold2); font-size: 11px; cursor: pointer; }
.btn-toggle { padding: 6px 12px; border-radius: 8px; background: var(--card2); border: 1px solid var(--border); color: var(--ts); font-size: 11px; cursor: pointer; }
.btn-delete { padding: 6px 12px; border-radius: 8px; background: rgba(226,75,74,0.1); border: 1px solid rgba(226,75,74,0.2); color: var(--danger); font-size: 11px; cursor: pointer; }
.empty { text-align: center; color: var(--ts); padding: 40px; }
</style>