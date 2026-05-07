<template>
  <div class="app-shell">
    <!-- Confetti -->
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div class="page-hdr">
      <h1>Actividades</h1>
      <span class="sub">Lê notícias e ganha recompensas</span>
    </div>

    <!-- Progresso diário -->
    <div class="progress-card" v-if="data">
      <div class="progress-top">
        <div>
          <div class="progress-label">Anúncios hoje</div>
          <div class="progress-count">{{ data.viewed_today }} / {{ data.total_per_day }}</div>
        </div>
        <div class="progress-reward">
          <div class="pr-label">Por artigo</div>
          <div class="pr-val">+{{ fmt(data.reward_per_ad) }} MZN</div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
      <div class="progress-info">
        <span v-if="data.remaining > 0">{{ data.remaining }} artigos restantes hoje</span>
        <span v-else class="done-text">✓ Completaste todos os artigos de hoje!</span>
      </div>
    </div>

    <!-- Pacote info -->
    <div class="package-banner" v-if="data?.package">
      <span class="pb-icon">{{ icons[data.package.name] || '💎' }}</span>
      <span class="pb-name">Pacote {{ data.package.name }}</span>
      <span class="pb-return">{{ data.package.daily_return }}% diário</span>
    </div>

    <!-- Lista de artigos -->
    <div class="activities-list" v-if="data">
      <div v-if="data.activities.length === 0 && data.remaining === 0" class="empty">
        <div class="empty-icon">🎉</div>
        <div class="empty-title">Parabéns!</div>
        <div class="empty-sub">Completaste todos os artigos de hoje. Volta amanhã!</div>
      </div>

      <div v-else-if="data.activities.length === 0" class="empty">
        <div class="empty-icon">📰</div>
        <div class="empty-title">Sem artigos disponíveis</div>
        <div class="empty-sub">Novos artigos serão adicionados em breve.</div>
      </div>

      <div v-for="activity in data.activities" :key="activity.id" class="activity-card">

        <div v-if="activity.image" class="act-image">
          <img :src="activity.image" :alt="activity.title" @error="e => e.target.style.display='none'" />
        </div>

        <div class="act-meta">
          <span class="act-source">{{ activity.source || activity.advertiser || 'NexGain' }}</span>
          <span class="act-date" v-if="activity.published_at">{{ fmtDate(activity.published_at) }}</span>
        </div>

        <div class="act-title">{{ activity.title }}</div>
        <div class="act-desc" v-if="activity.description">{{ activity.description }}</div>

        <div class="act-footer">
          <div class="act-reward">+{{ fmt(data.reward_per_ad) }} MZN</div>
          <button
            :class="['btn-view', { viewing: viewing === activity.id, viewed: viewed.includes(activity.id) }]"
            :disabled="viewing === activity.id || viewed.includes(activity.id)"
            @click="viewActivity(activity)">
            <span v-if="viewed.includes(activity.id)">✓ Lido</span>
            <span v-else-if="viewing === activity.id">
              <span class="timer">{{ countdown }}s</span> A ler...
            </span>
            <span v-else>▶ Ler artigo</span>
          </button>
        </div>

        <a v-if="activity.url && viewing === activity.id"
          :href="activity.url" target="_blank" class="act-link">
          🔗 Abrir artigo completo
        </a>
      </div>
    </div>

    <div v-if="loading" class="loading">A carregar artigos...</div>
    <div style="height:80px"></div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import BottomNav from '../components/BottomNav.vue'

const data = ref(null)
const loading = ref(true)
const viewing = ref(null)
const viewed = ref([])
const countdown = ref(10)
const confettiCanvas = ref(null)
let timer = null
let confettiTimer = null
let particles = []

const icons = {
  Bronze: '🥉', Prata: '🥈', Ouro: '🥇',
  Platina: '💿', Diamante: '💎', Elite: '👑',
  Máster: '🏆', Lenda: '⭐', Supreme: '🚀',
}

const fmt = n => Number(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })
const fmtDate = d => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('pt-MZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
const progressPct = computed(() => {
  if (!data.value) return 0
  return Math.round((data.value.viewed_today / data.value.total_per_day) * 100)
})

// ── Confetti ──────────────────────────────────────────────
const colors = ['#D4A843', '#F0C96A', '#FF6B1A', '#22C97A', '#FF8C42', '#ffffff']

function launchConfetti() {
  const canvas = confettiCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.display = 'block'
  particles = []

  for (let i = 0; i < 150; i++) {
    particles.push({
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height - canvas.height,
      w:       Math.random() * 10 + 5,
      h:       Math.random() * 6 + 3,
      color:   colors[Math.floor(Math.random() * colors.length)],
      speed:   Math.random() * 4 + 2,
      angle:   Math.random() * 360,
      spin:    Math.random() * 6 - 3,
      opacity: Math.random() * 0.7 + 0.3,
    })
  }

  let frames = 0
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.y      += p.speed
      p.angle  += p.spin
      p.opacity = Math.max(0, p.opacity - 0.003)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.angle * Math.PI) / 180)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle   = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    })
    frames++
    if (frames < 180) {
      confettiTimer = requestAnimationFrame(draw)
    } else {
      canvas.style.display = 'none'
    }
  }
  draw()
}
// ─────────────────────────────────────────────────────────

async function load() {
  loading.value = true
  try {
    const { data: d } = await axios.get('/activities')
    data.value = d
  } finally {
    loading.value = false
  }
}

async function viewActivity(activity) {
  if (viewing.value || viewed.value.includes(activity.id)) return
  viewing.value  = activity.id
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

    // Lança confetti se completou todos
    if (data.value?.remaining === 0) {
      setTimeout(launchConfetti, 300)
    }
  } catch (e) {
    viewing.value = null
    alert(e.response?.data?.message || 'Erro')
  }
}

onMounted(load)
onUnmounted(() => {
  clearInterval(timer)
  cancelAnimationFrame(confettiTimer)
})
</script>

<style scoped>
.confetti-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  display: none;
}
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
.activity-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
.act-image { width: 100%; height: 180px; overflow: hidden; }
.act-image img { width: 100%; height: 100%; object-fit: cover; }
.act-meta { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px 0; }
.act-source { font-size: 10px; color: var(--og); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
.act-date { font-size: 10px; color: var(--ts); }
.act-title { font-size: 14px; font-weight: 500; padding: 6px 14px; line-height: 1.4; }
.act-desc { font-size: 12px; color: var(--ts); line-height: 1.5; padding: 0 14px 10px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.act-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-top: 1px solid var(--border); }
.act-reward { font-size: 14px; font-weight: 500; color: var(--green); }
.btn-view { padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; transition: all .2s; }
.btn-view.viewing { background: var(--card2); color: var(--ts); border: 1px solid var(--border); }
.btn-view.viewed  { background: var(--green-dim); color: var(--green); border: 1px solid rgba(34,201,122,0.3); }
.btn-view:disabled { cursor: not-allowed; }
.timer { font-weight: 500; color: var(--gold); }
.act-link { display: block; margin: 0 14px 14px; font-size: 12px; color: var(--gold); text-decoration: none; background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 8px; padding: 8px 12px; text-align: center; }
.empty { text-align: center; padding: 40px 20px; }
.empty-icon { font-size: 50px; margin-bottom: 12px; }
.empty-title { font-size: 16px; font-weight: 500; margin-bottom: 6px; }
.empty-sub { font-size: 13px; color: var(--ts); }
.loading { padding: 40px; text-align: center; color: var(--ts); }
</style>