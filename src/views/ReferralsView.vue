<template>
  <div class="app-shell">
    <div class="page-hdr">
      <h1>Convites</h1>
      <span class="sub">Convida e ganha 20% de comissão</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="no-package">
      <div class="np-icon">⏳</div>
      <div class="np-title">A carregar...</div>
    </div>

    <!-- Sem pacote -->
    <div v-else-if="!canRefer" class="no-package">
      <div class="np-icon">🔒</div>
      <div class="np-title">Pacote necessário</div>
      <div class="np-sub">Precisas de ter um pacote activo para poderes convidar amigos e ganhar comissões.</div>
      <button class="btn-primary" @click="$router.push('/packages')">Activar pacote</button>
    </div>

    <!-- Com pacote -->
    <template v-else>
      <div class="stats-banner" v-if="stats">
        <div class="ref-stat">
          <div class="rs-val">{{ stats.total_referrals }}</div>
          <div class="rs-lbl">Referidos</div>
        </div>
        <div class="ref-stat">
          <div class="rs-val">{{ fmt(stats.total_earned) }}</div>
          <div class="rs-lbl">Ganho (MZN)</div>
        </div>
        <div class="ref-stat">
          <div class="rs-val">{{ stats.this_month }}</div>
          <div class="rs-lbl">Este mês</div>
        </div>
      </div>

      <div class="commission-info">
        <span class="ci-icon">💰</span>
        <span>Ganhas <strong>20%</strong> do pacote escolhido por cada convidado</span>
      </div>

      <div class="link-card">
        <div class="lc-label">O teu link de convite</div>
        <div class="lc-link">{{ stats?.referral_link || '...' }}</div>
        <div class="lc-actions">
          <button class="btn-copy" @click="copy">{{ copied ? '✓ Copiado!' : 'Copiar link' }}</button>
          <button class="btn-share" @click="share">Partilhar</button>
        </div>
        <div class="code-row">
          <span class="code-lbl">Código:</span>
          <span class="code-val">{{ stats?.referral_code }}</span>
        </div>
      </div>

      <div class="section-title">Referidos ({{ referrals.length }})</div>
      <div class="ref-list">
        <div v-for="r in referrals" :key="r.id" class="ref-item">
          <div class="ref-avatar">{{ r.referred?.name?.[0]?.toUpperCase() || '?' }}</div>
          <div class="ref-info">
            <div class="ref-name">{{ r.referred?.name }}</div>
            <div class="ref-date">
              Entrou {{ fmtDate(r.created_at) }}
              <span :class="['ref-status', r.referred?.package_selected ? 'active' : 'pending']">
                {{ r.referred?.package_selected ? '✓ Activo' : '⏳ Pendente' }}
              </span>
            </div>
            <div class="ref-package" v-if="r.referred?.package">
              Pacote: {{ r.referred.package }}
            </div>
          </div>
          <div class="ref-earned">+{{ fmt(r.total_earned) }} MZN</div>
        </div>
        <div v-if="referrals.length === 0" class="empty">
          Ainda não convidaste ninguém.<br>Partilha o teu link!
        </div>
      </div>
    </template>

    <div style="height:80px"></div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BottomNav from '../components/BottomNav.vue'

const stats = ref(null)
const referrals = ref([])
const copied = ref(false)
const loading = ref(true)
const canRefer = computed(() => stats.value?.can_refer === true)

const fmt = n => Number(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })
const fmtDate = d => new Date(d).toLocaleDateString('pt-MZ')

function copy() {
  navigator.clipboard.writeText(stats.value?.referral_link || '')
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function share() {
  if (navigator.share) {
    navigator.share({
      title: 'NexGain',
      text: 'Junta-te ao NexGain e começa a ganhar!',
      url: stats.value?.referral_link
    })
  } else copy()
}

onMounted(async () => {
  try {
    const [s, r] = await Promise.all([
      axios.get('/referrals/stats'),
      axios.get('/referrals')
    ])
    stats.value = s.data
    if (s.data.can_refer) {
      referrals.value = r.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-hdr { padding: 20px 16px 0; margin-bottom: 14px; }
h1 { font-size: 22px; font-weight: 500; }
.sub { font-size: 13px; color: var(--ts); }
.no-package { margin: 20px 16px; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 30px 20px; text-align: center; }
.np-icon { font-size: 50px; margin-bottom: 12px; }
.np-title { font-size: 18px; font-weight: 500; margin-bottom: 8px; }
.np-sub { font-size: 13px; color: var(--ts); line-height: 1.6; margin-bottom: 20px; }
.btn-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 14px; font-weight: 500; }
.stats-banner { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; padding: 0 16px; margin-bottom: 14px; }
.ref-stat { background: var(--card); border: 1px solid var(--gold-border); border-radius: 12px; padding: 14px 8px; text-align: center; }
.rs-val { font-size: 20px; font-weight: 500; color: var(--gold2); }
.rs-lbl { font-size: 9px; color: var(--ts); margin-top: 3px; }
.commission-info { margin: 0 16px 14px; background: var(--green-dim); border: 1px solid rgba(34,201,122,0.2); border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--tp); }
.ci-icon { font-size: 18px; }
.link-card { margin: 0 16px 16px; background: var(--card); border: 1px solid var(--gold-border); border-radius: 16px; padding: 16px; }
.lc-label { font-size: 11px; color: var(--ts); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.lc-link { font-size: 12px; color: var(--gold); background: var(--card2); border-radius: 8px; padding: 8px 10px; word-break: break-all; margin-bottom: 10px; }
.lc-actions { display: flex; gap: 8px; margin-bottom: 10px; }
.btn-copy  { flex: 1; padding: 10px; border-radius: 10px; background: var(--gold-dim); border: 1px solid var(--gold-border); color: var(--gold2); font-size: 13px; cursor: pointer; }
.btn-share { flex: 1; padding: 10px; border-radius: 10px; background: linear-gradient(135deg,#D4A843,#FF6B1A); border: none; color: white; font-size: 13px; cursor: pointer; }
.code-row { display: flex; align-items: center; gap: 8px; }
.code-lbl { font-size: 12px; color: var(--ts); }
.code-val { font-size: 14px; font-weight: 500; color: var(--gold); letter-spacing: 2px; }
.section-title { font-size: 11px; color: var(--ts); text-transform: uppercase; letter-spacing: 1px; padding: 0 16px; margin-bottom: 10px; }
.ref-list { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
.ref-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 10px; }
.ref-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#D4A843,#FF6B1A); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; color: white; flex-shrink: 0; }
.ref-name { font-size: 13px; font-weight: 500; }
.ref-date { font-size: 11px; color: var(--ts); display: flex; align-items: center; gap: 6px; }
.ref-status { font-size: 10px; padding: 2px 6px; border-radius: 6px; }
.ref-status.active  { background: var(--green-dim); color: var(--green); }
.ref-status.pending { background: rgba(255,107,26,0.1); color: var(--og); }
.ref-package { font-size: 10px; color: var(--gold); margin-top: 2px; }
.ref-earned { font-size: 13px; color: var(--green); font-weight: 500; margin-left: auto; white-space: nowrap; }
.empty { text-align: center; color: var(--ts); padding: 30px; line-height: 1.7; }
</style>