<template>
  <div class="app-shell">
    <div class="page-hdr">
      <h1>Actividades</h1>
      <span class="sub">Visualiza anúncios e ganha recompensas</span>
    </div>

    <div class="progress-card" v-if="data">
      <div class="progress-top">
        <div>
          <div class="progress-label">Anúncios hoje</div>
          <div class="progress-count">{{ data.viewed_today }} / {{ data.total_per_day }}</div>
        </div>
        <div class="progress-reward">
          <div class="pr-label">Por anúncio</div>
          <div class="pr-val">+{{ fmt(data.reward_per_ad) }} MZN</div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
      <div class="progress-info">
        <span v-if="data.remaining > 0">{{ data.remaining }} anúncios restantes hoje</span>
        <span v-else class="done-text">✓ Completaste todos os anúncios de hoje!</span>
      </div>
    </div>

    <div class="package-banner" v-if="data?.package">
      <span class="pb-icon">{{ icons[data.package.name] || '💎' }}</span>
      <span class="pb-name">Pacote {{ data.package.name }}</span>
      <span class="pb-return">{{ data.package.daily_return }}% diário</span>
    </div>

    <div class="activities-list" v-if="data">
      <div v-if="data.activities.length === 0 && data.remaining === 0" class="empty">
        <div class="empty-icon">🎉</div>
        <div class="empty-title">Parabéns!</div>
        <div class="empty-sub">Completaste todos os anúncios de hoje. Volta amanhã!</div>
      </div>

      <div v-else-if="data.activities.length === 0" class="empty">
        <div class="empty-icon">📢</div>
        <div class="empty-title">Sem anúncios disponíveis</div>
        <div class="empty-sub">Novos anúncios serão adicionados em breve.</div>
      </div>

      <div v-for="activity in data.activities" :key="activity.id" class="activity-card">
        <div class="act-advertiser">{{ activity.advertiser || 'NexGain' }}</div>
        <div class="act-title">{{ activity.title }}</div>
        <div class="act-desc" v-if="activity.description">{{ activity.description }}</div>

        <div v-if="activity.image" class="act-image">
          <img :src="activity.image" :alt="activity.title" />
        </div>

        <div class="act-footer">
          <div class="act-reward">+{{ fmt(data.reward_per_ad) }} MZN</div>
          <button
            :class="['btn-view', { viewing: viewing === activity.id, viewed: viewed.includes(activity.id) }]"
            :disabled="viewing !== null || viewed.includes(activity.id)"
            @click="viewActivity(activity)">
            <span v-if="viewed.includes(activity.id)">✓ Visto</span>
            <span v-else-if="viewing === activity.id">
              <span class="timer">{{ countdown }}s</span> A visualizar...
            </span>
            <span v-else>▶ Ver anúncio</span>
          </button>
        </div>

        <a v-if="activity.url && viewing === activity.id"
          :href="activity.url" target="_blank" class="act-link">
          🔗 Abrir link do anúncio
        </a>
      </div>
    </div>

    <div v-if="loading" class="loading">A carregar anúncios...</div>
    <div style="height:80px"></div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import BottomNav from '../components/BottomNav.vue'

const data = ref(null)
const loading = ref(true)
const viewing = ref(null)
const viewed = ref([])
const countdown = ref(10)
let timer = null

const icons = {
  Bronze: '🥉', Prata: '🥈', Ouro: '🥇',
  Platina: '💿', Diamante: '💎', Elite: '👑',
  Máster: '🏆', Lenda: '⭐', Supreme: '🚀',
}

const fmt = n => Number(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })
const progressPct = computed(() => {
  if (!data.value) return 0
  return Math.round((data.value.viewed_today / data.value.total_per_day) * 100)
})

async function load() {
  loading.value = true
  try {
    const { data: d } = await axios.get('/activities')
    data.value = d
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function viewActivity(activity) {
  if (viewing.value || viewed.value.includes(activity.id)) return
  viewing.value = activity.id
  countdown.value = 10

  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      completeView(activity.id)
    }
  }, 1000)
}

async function completeView(id) {
  try {
    await axios.post(`/activities/${id}/view`)
    viewed.value.push(id)
    viewing.value = null
    await load()
  } catch (e) {
    viewing.value = null
    alert(e.response?.data?.message || 'Erro')
  }
}

onMounted(load)
</script>

<style scoped>
.page-hdr { padding: 20px 16px 0; margin-bottom: 14px; }
h1 { font-size: 22px; font-weight: 500; }
.sub { font-size: 13px; color: var(--ts); }
.progress-card { margin: 0 16px 12px; background: var(--card); border: 1px solid var(--gold-border); border-radius: 14px; padding: 14px; }
.progress-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.progress-label { font-size: 11px; color: var(--ts); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.progress-count { font-size: 22px; font-weight: 500; color: var(--gold2); }
.progress-reward { text-align: right; }
.pr-label { font-size: 11px; color: var(--ts); margin-bottom: 4px; }
.pr-val { font-size: 16px; font-weight: 500; color: var(--green); }
.progress-bar { height: 6px; background: var(--card2); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold2)); border-radius: 4px; transition: width .5s; }
.progress-info { font-size: 12px; color: var(--ts); }
.done-text { color: var(--green); }
.package-banner { margin: 0 16px 14px; background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; }
.pb-icon { font-size: 18px; }
.pb-name { font-size: 13px; font-weight: 500; color: var(--gold2); flex: 1; }
.pb-return { font-size: 12px; color: var(--green); }
.activities-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; }
.activity-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
.act-advertiser { font-size: 10px; color: var(--og); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.act-title { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
.act-desc { font-size: 13px; color: var(--ts); line-height: 1.5; margin-bottom: 10px; }
.act-image { margin-bottom: 10px; border-radius: 10px; overflow: hidden; }
.act-image img { width: 100%; height: 160px; object-fit: cover; }
.act-footer { display: flex; justify-content: space-between; align-items: center; }
.act-reward { font-size: 14px; font-weight: 500; color: var(--green); }
.btn-view { padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; transition: all .2s; }
.btn-view.viewing { background: var(--card2); color: var(--ts); border: 1px solid var(--border); }
.btn-view.viewed  { background: var(--green-dim); color: var(--green); border: 1px solid rgba(34,201,122,0.3); }
.btn-view:disabled { cursor: not-allowed; opacity: 0.7; }
.timer { font-weight: 500; color: var(--gold); }
.act-link { display: block; margin-top: 10px; font-size: 12px; color: var(--gold); text-decoration: none; background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 8px; padding: 8px 12px; text-align: center; }
.empty { text-align: center; padding: 40px 20px; }
.empty-icon { font-size: 50px; margin-bottom: 12px; }
.empty-title { font-size: 16px; font-weight: 500; margin-bottom: 6px; }
.empty-sub { font-size: 13px; color: var(--ts); }
.loading { padding: 40px; text-align: center; color: var(--ts); }
</style>