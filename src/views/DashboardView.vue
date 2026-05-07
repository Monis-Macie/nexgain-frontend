<template>
  <div class="app-shell">

    <!-- Aviso pacote pendente — fora do hdr -->
    <div v-if="auth.user?.pending_package" class="pending-banner">
      ⏳ O teu pacote <strong>{{ auth.user.pending_package }}</strong> está a aguardar aprovação do pagamento.
    </div>

    <div class="hdr">
      <div class="hdr-glow"></div>
      <div class="hdr-top">
        <div class="logo">
          <div class="logo-mark">
            <svg viewBox="0 0 24 24" fill="#1a0e00"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
          </div>
          <span class="logo-text">NEX<em>GAIN</em></span>
        </div>
        <div class="hdr-actions">
          <div class="notif-btn" @click="$router.push('/profile')">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
          </div>
        </div>
      </div>
      <div class="profile-card" v-if="d">
        <div class="avatar">{{ initials }}</div>
        <div class="profile-info">
          <div class="profile-row">
            <span class="pname">{{ auth.user?.name }}</span>
            <span class="badge">{{ d.user?.package || 'Sem pacote' }}</span>
          </div>
          <div class="pid">ID: #NX-{{ String(auth.user?.id || 0).padStart(6,'0') }}</div>
          <div class="level-wrap">
            <div class="level-row">
              <span class="lvl-label">Nível {{ d.user?.level || 1 }}</span>
              <span class="lvl-xp">{{ d.user?.xp || 0 }} XP</span>
            </div>
            <div class="level-bar">
              <div class="level-fill" :style="{ width: xpPct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="bal-row" v-if="d">
        <div class="bal-card">
          <div class="bal-lbl">Saldo Principal</div>
          <div class="bal-val animated-counter">{{ fmt(animatedBalance) }}</div>
          <div class="bal-cur">MZN</div>
        </div>
        <div class="roi-card">
          <div class="roi-lbl"><span class="pulse"></span> Rendimento</div>
          <div class="roi-val">+{{ d.roi_percent || 0 }}%</div>
          <div class="roi-sub">Retorno acumulado</div>
        </div>
      </div>
      <div class="date-pill">◈ {{ today }}</div>
    </div>

    <!-- Potencial de ganho -->
    <div class="section" v-if="nextPackage && auth.user?.package_selected">
      <div class="sec-hdr"><div class="sec-title">Potencial de ganho</div></div>
      <div class="potential-card">
        <div class="pot-left">
          <div class="pot-now">
            <div class="pot-lbl">Agora ({{ d?.user?.package || 'Sem pacote' }})</div>
            <div class="pot-val">{{ fmt(currentDailyEarning) }} <span>MZN/dia</span></div>
          </div>
          <div class="pot-arrow">→</div>
          <div class="pot-next">
            <div class="pot-lbl">{{ nextPackage.name }}</div>
            <div class="pot-val highlight">{{ fmt(nextDailyEarning) }} <span>MZN/dia</span></div>
          </div>
        </div>
        <div class="pot-diff">+{{ fmt(nextDailyEarning - currentDailyEarning) }} MZN/dia</div>
      </div>
    </div>

    <!-- Banner de upgrade -->
    <div class="section" v-if="nextPackage && auth.user?.package_selected">
      <div class="upgrade-banner" @click="$router.push('/packages')">
        <div class="ub-left">
          <div class="ub-icon">{{ nextPackageIcon }}</div>
          <div class="ub-info">
            <div class="ub-title">Faz upgrade para {{ nextPackage.name }}</div>
            <div class="ub-sub">Ganha <strong>{{ fmt(nextDailyEarning) }} MZN/dia</strong> · {{ nextPackage.daily_return }}% retorno</div>
          </div>
        </div>
        <div class="ub-btn">Upgrade ›</div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Destaques -->
    <div class="section">
      <div class="sec-hdr"><div class="sec-title">Destaques</div></div>
      <div class="highlights-grid">
        <div class="hl-card" @click="$router.push('/activities')">
          <div class="hl-icon">📺</div>
          <div class="hl-info">
            <div class="hl-title">Actividades</div>
            <div class="hl-val">
              <span class="tasks-done">{{ d?.tasks_done || 0 }}</span>
              <span class="tasks-sep">/</span>
              <span class="tasks-total">{{ d?.tasks_total || 0 }}</span>
            </div>
            <div class="hl-sub">Anúncios hoje</div>
          </div>
          <div class="hl-progress-wrap">
            <div class="hl-progress">
              <div class="hl-progress-fill" :style="{ width: tasksPct + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="hl-card" @click="$router.push('/referrals')">
          <div class="hl-icon">👥</div>
          <div class="hl-info">
            <div class="hl-title">Convites</div>
            <div class="hl-val">{{ d?.referral_earnings ? fmt(d.referral_earnings) : '0,00' }}</div>
            <div class="hl-sub">MZN ganhos</div>
          </div>
          <div class="hl-arrow">›</div>
        </div>
        <div class="hl-card" @click="$router.push('/nexpay')">
          <div class="hl-icon">📋</div>
          <div class="hl-info">
            <div class="hl-title">Histórico</div>
            <div class="hl-val">{{ d?.recent_transactions || 0 }}</div>
            <div class="hl-sub">Transacções</div>
          </div>
          <div class="hl-arrow">›</div>
        </div>
      </div>
    </div>

    <div style="height:80px"></div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDashboardStore } from '../stores/dashboard'
import BottomNav from '../components/BottomNav.vue'
import axios from 'axios'

const auth = useAuthStore()
const dash = useDashboardStore()
const d = computed(() => dash.data)
const allPackages = ref([])

const animatedBalance = ref(0)
watch(() => d.value?.balance, (newVal) => {
  if (!newVal) return
  const target = Number(newVal)
  const start = animatedBalance.value
  const duration = 1200
  const startTime = performance.now()
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    animatedBalance.value = start + (target - start) * ease
    if (progress < 1) requestAnimationFrame(step)
    else animatedBalance.value = target
  }
  requestAnimationFrame(step)
}, { immediate: true })

const icons = {
  Bronze: '🥉', Prata: '🥈', Ouro: '🥇',
  Platina: '💿', Diamante: '💎', Elite: '👑',
  Máster: '🏆', Lenda: '⭐', Supreme: '🚀',
}

const currentPackage = computed(() =>
  allPackages.value.find(p => p.name === d.value?.user?.package)
)
const nextPackage = computed(() => {
  if (!currentPackage.value) return null
  const idx = allPackages.value.findIndex(p => p.name === currentPackage.value.name)
  return allPackages.value[idx + 1] || null
})
const nextPackageIcon = computed(() => icons[nextPackage.value?.name] || '💎')

const currentDailyEarning = computed(() => {
  if (!currentPackage.value) return 0
  return currentPackage.value.price * currentPackage.value.daily_return / 100
})
const nextDailyEarning = computed(() => {
  if (!nextPackage.value) return 0
  return nextPackage.value.price * nextPackage.value.daily_return / 100
})

const tasksPct = computed(() => {
  const done = d.value?.tasks_done || 0
  const total = d.value?.tasks_total || 0
  if (!total) return 0
  return Math.min(100, Math.round((done / total) * 100))
})

const fmt = n => Number(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })
const initials = computed(() =>
  auth.user?.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || 'NG'
)
const today = computed(() =>
  new Date().toLocaleDateString('pt-MZ', { year:'numeric', month:'long', day:'numeric' })
)
const xpPct = computed(() => {
  if (!d.value) return 0
  const cur = d.value.user?.xp || 0
  const cur_req = d.value.level_info?.xp_required || 0
  const next_req = d.value.next_level?.xp_required || cur_req + 1000
  if (next_req === cur_req) return 100
  return Math.min(100, Math.round(((cur - cur_req) / (next_req - cur_req)) * 100))
})

onMounted(async () => {
  await dash.fetch()
  const { data } = await axios.get('/packages')
  allPackages.value = data
})
</script>

<style scoped>
.hdr { padding: 16px 16px 0; background: linear-gradient(170deg, #1a1208 0%, #09090B 55%); position: relative; overflow: hidden; }
.hdr-glow { position: absolute; top: -60px; right: -60px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%); pointer-events: none; z-index: 0; }
.hdr-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; position: relative; z-index: 1; }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-mark { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#D4A843,#F0C96A); display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 17px; height: 17px; }
.logo-text { font-size: 17px; font-weight: 500; letter-spacing: 2px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
.hdr-actions { display: flex; gap: 12px; }
.notif-btn { color: var(--ts); cursor: pointer; }
.notif-btn svg { width: 20px; height: 20px; }
.profile-card { background: var(--card); border: 1px solid var(--gold-border); border-radius: 16px; padding: 13px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
.avatar { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(135deg,#D4A843,#FF6B1A); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 500; color: white; border: 2px solid var(--gold); }
.profile-info { flex: 1; min-width: 0; }
.profile-row { display: flex; justify-content: space-between; align-items: center; }
.pname { font-size: 14px; font-weight: 500; }
.badge { background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 20px; padding: 2px 9px; font-size: 10px; color: var(--gold2); white-space: nowrap; }
.pid { font-size: 11px; color: var(--ts); margin-top: 2px; }
.level-wrap { margin-top: 7px; }
.level-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
.lvl-label { font-size: 10px; color: var(--gold); }
.lvl-xp { font-size: 10px; color: var(--ts); }
.level-bar { height: 4px; background: var(--card3); border-radius: 4px; overflow: hidden; }
.level-fill { height: 100%; background: linear-gradient(90deg,var(--gold),var(--gold2)); border-radius: 4px; transition: width .5s; }
.bal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; position: relative; z-index: 1; }
.bal-card { background: var(--card); border: 1px solid var(--gold-border); border-radius: 13px; padding: 12px 13px; }
.bal-lbl { font-size: 9px; color: var(--ts); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; }
.bal-val { font-size: 20px; font-weight: 500; color: var(--gold2); }
.animated-counter { transition: all .1s; }
.bal-cur { font-size: 10px; color: var(--ts); margin-top: 2px; }
.roi-card { background: var(--card); border: 1px solid rgba(34,201,122,0.2); border-radius: 13px; padding: 12px 13px; }
.roi-lbl { font-size: 9px; color: var(--ts); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; }
.pulse { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; animation: p 2s infinite; }
@keyframes p { 0%,100%{opacity:1} 50%{opacity:.4} }
.roi-val { font-size: 20px; font-weight: 500; color: var(--green); }
.roi-sub { font-size: 10px; color: rgba(34,201,122,0.5); margin-top: 2px; }
.date-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(212,168,67,0.07); border: 1px solid var(--gold-border); border-radius: 20px; padding: 4px 12px; font-size: 10px; color: var(--gold); margin-bottom: 16px; position: relative; z-index: 1; }
.pending-banner { background: rgba(255,107,26,0.12); border-bottom: 1px solid rgba(255,107,26,0.3); padding: 10px 16px; font-size: 13px; color: var(--og2); text-align: center; line-height: 1.5; }
.section { padding: 14px 16px 0; }
.sec-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.sec-title { font-size: 11px; color: var(--ts); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 6px; }
.sec-title::before { content:''; width:3px; height:11px; background:var(--gold); border-radius:2px; display:inline-block; }
.divider { height: 8px; background: #060608; margin: 14px 0 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.potential-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: flex; justify-content: space-between; align-items: center; }
.pot-left { display: flex; align-items: center; gap: 10px; }
.pot-now, .pot-next { display: flex; flex-direction: column; gap: 3px; }
.pot-lbl { font-size: 10px; color: var(--ts); }
.pot-val { font-size: 14px; font-weight: 500; color: var(--tp); }
.pot-val span { font-size: 10px; color: var(--ts); }
.pot-val.highlight { color: var(--gold2); }
.pot-arrow { font-size: 16px; color: var(--gold); }
.pot-diff { font-size: 13px; font-weight: 500; color: var(--green); background: var(--green-dim); border-radius: 8px; padding: 5px 10px; white-space: nowrap; }
.upgrade-banner { background: linear-gradient(135deg, #1a1208, #0f0d02); border: 1px solid var(--gold-border); border-radius: 14px; padding: 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; position: relative; overflow: hidden; animation: glow-pulse 3s ease-in-out infinite; }
@keyframes glow-pulse { 0%,100% { box-shadow: 0 0 0px rgba(212,168,67,0); } 50% { box-shadow: 0 0 16px rgba(212,168,67,0.2); } }
.upgrade-banner::before { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(212,168,67,0.06), transparent); animation: shimmer 3s infinite; }
@keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
.ub-left { display: flex; align-items: center; gap: 10px; }
.ub-icon { font-size: 28px; }
.ub-title { font-size: 13px; font-weight: 500; color: var(--gold2); margin-bottom: 3px; }
.ub-sub { font-size: 11px; color: var(--ts); }
.ub-sub strong { color: var(--green); }
.ub-btn { background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 12px; font-weight: 500; padding: 8px 14px; border-radius: 10px; white-space: nowrap; }
.highlights-grid { display: flex; flex-direction: column; gap: 10px; }
.hl-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: border-color .2s; }
.hl-card:hover { border-color: var(--gold-border); }
.hl-icon { font-size: 26px; flex-shrink: 0; }
.hl-info { flex: 1; }
.hl-title { font-size: 10px; color: var(--ts); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.hl-val { font-size: 20px; font-weight: 500; color: var(--gold2); line-height: 1; margin-bottom: 3px; }
.hl-sub { font-size: 10px; color: var(--ts); }
.hl-arrow { font-size: 18px; color: var(--ts); }
.tasks-done { color: var(--green); font-size: 20px; font-weight: 500; }
.tasks-sep { color: var(--ts); font-size: 16px; margin: 0 2px; }
.tasks-total { color: var(--ts); font-size: 16px; }
.hl-progress-wrap { width: 60px; }
.hl-progress { height: 4px; background: var(--card3); border-radius: 4px; overflow: hidden; }
.hl-progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--green)); border-radius: 4px; transition: width .5s; }
</style>