<template>
  <div class="packages-page">
    <div class="pkg-glow"></div>

    <!-- Botão retroceder flutuante (só aparece no upgrade) -->
    <div v-if="isUpgrade && !confirmed" class="back-btn-float" @click="$router.push('/dashboard')">
      ‹ Dashboard
    </div>

    <div class="pkg-hdr">
      <div class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 24 24" fill="#1a0e00"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg>
        </div>
        <span class="logo-text">NEX<em>GAIN</em></span>
      </div>
      <h2>{{ isUpgrade ? 'Fazer upgrade' : 'Escolhe o teu pacote' }}</h2>
      <p class="sub">{{ isUpgrade ? 'Escolhe um pacote superior ao teu actual' : 'Selecciona o pacote que melhor se adapta a ti' }}</p>
      <div v-if="isUpgrade" class="current-pkg">
        Pacote actual: <strong>{{ currentPackage }}</strong>
      </div>
    </div>

    <div class="packages-list">
      <div v-for="pkg in packages" :key="pkg.id"
        :class="['pkg-card', { selected: selected === pkg.name }]"
        @click="selectPackage(pkg.name)">
        <div class="pkg-top">
          <div class="pkg-icon">{{ icons[pkg.name] || '💎' }}</div>
          <div class="pkg-badge" v-if="pkg.name === 'Ouro'">Popular</div>
        </div>
        <div class="pkg-name">{{ pkg.name }}</div>
        <div class="pkg-price">{{ fmt(pkg.price) }} <span>MZN</span></div>
        <div class="pkg-divider"></div>
        <div class="pkg-features">
          <div class="pkg-feat">
            <span class="feat-icon">📈</span>
            <span>{{ pkg.daily_return }}% retorno diário</span>
          </div>
          <div class="pkg-feat">
            <span class="feat-icon">📺</span>
            <span>{{ pkg.ads_per_day }} anúncios por dia</span>
          </div>
          <div class="pkg-feat">
            <span class="feat-icon">💸</span>
            <span>Levantamento a cada {{ pkg.withdrawal_days }} dias</span>
          </div>
          <div class="pkg-feat">
            <span class="feat-icon">👥</span>
            <span>20% comissão de referidos</span>
          </div>
        </div>
        <div class="pkg-daily">
          Ganho diário estimado: <strong>{{ fmtDaily(pkg) }} MZN</strong>
        </div>
      </div>
    </div>

    <div v-if="selected && !confirmed" class="payment-instructions" ref="paymentRef">
      <div class="pi-title">📱 Como pagar</div>
      <div class="pi-steps">
        <div class="pi-step">
          <span class="step-num">1</span>
          <span>Abre o e-Mola no teu telemóvel</span>
        </div>
        <div class="pi-step">
          <span class="step-num">2</span>
          <span>Envia <strong>{{ fmt(selectedPkg?.price) }} MZN</strong> para:</span>
        </div>
        <div class="pi-number">
          {{ randomNumber }}
          <span class="copy-btn" @click="copyNumber">Copiar</span>
        </div>
        <div class="pi-step">
          <span class="step-num">3</span>
          <span>Guarda o número de referência da transacção</span>
        </div>
        <div class="pi-step">
          <span class="step-num">4</span>
          <span>Preenche os campos abaixo</span>
        </div>
      </div>

      <div class="field">
        <label>Número de referência e-Mola</label>
        <input v-model="transactionRef" type="text" placeholder="Ex: 1234567890" />
      </div>
      <div class="field">
        <label>Número e-Mola que usaste</label>
        <input v-model="paymentPhone" type="tel" placeholder="Ex: 871234567" />
      </div>

      <div v-if="error" class="err">{{ error }}</div>
      <button class="btn-primary" :disabled="loading || !transactionRef || !paymentPhone" @click="confirm">
        {{ loading ? 'A submeter...' : 'Confirmar pagamento' }}
      </button>
    </div>

    <div v-if="confirmed" class="success-box">
      <div class="success-icon">🎉</div>
      <h3>Pagamento submetido!</h3>
      <p>O teu pacote <strong>{{ selected }}</strong> será activado após confirmação.</p>
      <p class="note">Receberás um email quando a tua conta for activada.</p>
      <button class="btn-primary" @click="$router.push('/dashboard')">Ir para o dashboard</button>
    </div>

    <div style="height:40px"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const allPackages = ref([])
const packages = ref([])
const selected = ref(null)
const transactionRef = ref('')
const paymentPhone = ref('')
const loading = ref(false)
const confirmed = ref(false)
const error = ref('')
const paymentRef = ref(null)
const isUpgrade = ref(false)
const currentPackage = ref('')

const numbers = ['843792649']
const randomNumber = ref(numbers[Math.floor(Math.random() * numbers.length)])

const icons = {
  Bronze: '🥉', Prata: '🥈', Ouro: '🥇',
  Platina: '💿', Diamante: '💎', Elite: '👑',
  Máster: '🏆', Lenda: '⭐', Supreme: '🚀',
}

const fmt = n => Number(n || 0).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })
const fmtDaily = pkg => fmt(pkg.price * pkg.daily_return / 100)
const selectedPkg = computed(() => allPackages.value.find(p => p.name === selected.value))

function selectPackage(name) {
  selected.value = name
  setTimeout(() => {
    if (paymentRef.value) {
      paymentRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

function copyNumber() {
  navigator.clipboard.writeText(randomNumber.value)
  alert('Número copiado!')
}

async function confirm() {
  if (!transactionRef.value || !paymentPhone.value) return
  error.value = ''
  loading.value = true
  try {
    await axios.post('/packages/select', {
      package_name:    selected.value,
      transaction_ref: transactionRef.value,
      phone:           paymentPhone.value,
      is_upgrade:      isUpgrade.value,
    })
    confirmed.value = true
    const user = JSON.parse(localStorage.getItem('nexgain_user') || '{}')
    user.package = selected.value
    localStorage.setItem('nexgain_user', JSON.stringify(user))
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao submeter pagamento'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const { data } = await axios.get('/packages')
  allPackages.value = data

  const user = JSON.parse(localStorage.getItem('nexgain_user') || '{}')

  if (user.package_selected && user.package) {
    isUpgrade.value = true
    currentPackage.value = user.package
    const currentIdx = data.findIndex(p => p.name === user.package)
    packages.value = currentIdx !== -1 ? data.filter((_, i) => i > currentIdx) : data
  } else {
    packages.value = data
  }
})
</script>

<style scoped>
.packages-page { max-width: 430px; margin: 0 auto; min-height: 100vh; background: var(--bg); padding: 0 0 40px; position: relative; }
.pkg-glow { position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%); pointer-events: none; }
.pkg-hdr { padding: 24px 20px 16px; text-align: center; }
.logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px; }
.logo-mark { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg,#D4A843,#F0C96A); display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 17px; height: 17px; }
.logo-text { font-size: 17px; font-weight: 500; letter-spacing: 2px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
h2 { font-size: 20px; font-weight: 500; margin-bottom: 6px; }
.sub { font-size: 13px; color: var(--ts); margin-bottom: 8px; }
.current-pkg { font-size: 12px; color: var(--gold); background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 20px; padding: 4px 14px; display: inline-block; margin-top: 4px; }
.packages-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.pkg-card { background: var(--card); border: 2px solid var(--border); border-radius: 16px; padding: 16px; cursor: pointer; transition: all .2s; }
.pkg-card.selected { border-color: var(--gold); background: linear-gradient(135deg, #1a1208, var(--card)); }
.pkg-card:hover { border-color: var(--gold-border); }
.pkg-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.pkg-icon { font-size: 28px; }
.pkg-badge { font-size: 10px; background: var(--og); color: white; padding: 3px 8px; border-radius: 8px; }
.pkg-name { font-size: 18px; font-weight: 500; color: var(--gold2); margin-bottom: 4px; }
.pkg-price { font-size: 26px; font-weight: 500; color: var(--tp); margin-bottom: 12px; }
.pkg-price span { font-size: 14px; color: var(--ts); }
.pkg-divider { height: 1px; background: var(--border); margin-bottom: 12px; }
.pkg-features { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.pkg-feat { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ts); }
.feat-icon { font-size: 14px; }
.pkg-daily { font-size: 12px; color: var(--green); background: var(--green-dim); border-radius: 8px; padding: 6px 10px; }
.payment-instructions { margin: 0 16px 16px; background: var(--card); border: 1px solid var(--gold-border); border-radius: 16px; padding: 16px; scroll-margin-top: 20px; }
.pi-title { font-size: 15px; font-weight: 500; color: var(--gold); margin-bottom: 14px; }
.pi-steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.pi-step { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ts); }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: var(--gold-dim); border: 1px solid var(--gold-border); display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--gold); flex-shrink: 0; }
.pi-number { background: var(--card2); border: 1px solid var(--gold-border); border-radius: 10px; padding: 12px 16px; font-size: 20px; font-weight: 500; color: var(--gold2); display: flex; justify-content: space-between; align-items: center; }
.copy-btn { font-size: 11px; color: var(--og); cursor: pointer; padding: 4px 10px; background: rgba(255,107,26,0.1); border-radius: 6px; }
.field { margin-bottom: 14px; }
.field label { display: block; font-size: 12px; color: var(--ts); margin-bottom: 6px; }
.field input { width: 100%; background: var(--card2); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; color: var(--tp); font-size: 14px; outline: none; box-sizing: border-box; }
.field input:focus { border-color: var(--gold-border); }
.err { font-size: 13px; color: var(--danger); margin-bottom: 12px; }
.btn-primary { width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 14px; font-weight: 500; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.success-box { margin: 0 16px; background: var(--card); border: 1px solid rgba(34,201,122,0.3); border-radius: 16px; padding: 24px; text-align: center; }
.success-icon { font-size: 50px; margin-bottom: 12px; }
.success-box h3 { font-size: 18px; font-weight: 500; margin-bottom: 10px; }
.success-box p { font-size: 13px; color: var(--ts); line-height: 1.6; margin-bottom: 8px; }
.success-box .note { font-size: 12px; color: var(--gold); }

/* Botão flutuante */
.back-btn-float {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: var(--gold);
  cursor: pointer;
  background: var(--card);
  border: 1px solid var(--gold-border);
  border-radius: 20px;
  padding: 8px 20px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  white-space: nowrap;
  transition: opacity .2s;
}
.back-btn-float:hover { opacity: 0.8; }
</style>