<template>
  <div class="app-shell">
    <div class="profile-hero" v-if="profile">
      <div class="hero-glow"></div>
      <div class="avatar-big">{{ initials }}</div>
      <div class="hero-name">{{ profile.user?.name }}</div>
      <div class="hero-id">ID: #NX-{{ String(profile.user?.id).padStart(6,'0') }}</div>
      <div class="hero-badge">★ {{ profile.user?.badge }}</div>

      <div class="level-section">
        <div class="level-row">
          <span>Nível {{ profile.user?.level }} — {{ profile.level_info?.name }}</span>
          <span>{{ profile.user?.xp }} XP</span>
        </div>
        <div class="level-bar"><div class="level-fill" :style="{ width: profile.xp_progress + '%' }"></div></div>
        <div class="level-next" v-if="profile.next_level">
          Próximo nível: {{ profile.next_level?.name }} ({{ profile.next_level?.xp_required }} XP)
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-card">
        <div class="info-title">Informações</div>
        <div class="info-row"><span>Email</span><span>{{ profile?.user?.email }}</span></div>
        <div class="info-row"><span>Telefone</span><span>{{ profile?.user?.phone || '—' }}</span></div>
        <div class="info-row"><span>Membro desde</span><span>{{ fmtDate(profile?.user?.created_at) }}</span></div>
        <div class="info-row"><span>Comissão referidos</span><span>{{ profile?.level_info?.commission_rate }}%</span></div>
      </div>

      <div class="info-card">
        <div class="info-title">Editar perfil</div>
        <div class="field">
          <label>Nome</label>
          <input v-model="form.name" type="text" />
        </div>
        <div class="field">
          <label>Telefone</label>
          <input v-model="form.phone" type="tel" />
        </div>
        <div v-if="msg" :class="['msg', msgType]">{{ msg }}</div>
        <button class="btn-save" :disabled="saving" @click="save">
          {{ saving ? 'A guardar...' : 'Guardar alterações' }}
        </button>
      </div>

      <button class="btn-logout" @click="logout">Terminar sessão</button>
    </div>

    <div style="height:80px"></div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'

const auth = useAuthStore()
const router = useRouter()
const profile = ref(null)
const form = ref({ name: '', phone: '' })
const saving = ref(false)
const msg = ref('')
const msgType = ref('ok')
const initials = computed(() => profile.value?.user?.name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() || 'NG')
const fmtDate = d => d ? new Date(d).toLocaleDateString('pt-MZ') : '—'

async function save() {
  saving.value = true
  msg.value = ''
  try {
    await axios.put('/profile', form.value)
    msg.value = 'Perfil actualizado com sucesso!'
    msgType.value = 'ok'
  } catch (e) {
    msg.value = e.response?.data?.message || 'Erro'
    msgType.value = 'err'
  } finally {
    saving.value = false
  }
}

async function logout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  const { data } = await axios.get('/profile')
  profile.value = data
  form.value = { name: data.user?.name || '', phone: data.user?.phone || '' }
})
</script>

<style scoped>
.profile-hero { padding: 30px 16px 20px; text-align: center; background: linear-gradient(170deg,#1a1208,var(--bg)); position: relative; overflow: hidden; }
.hero-glow { position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle,rgba(212,168,67,0.1) 0%,transparent 70%); pointer-events: none; }
.avatar-big { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg,#D4A843,#FF6B1A); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 500; color: white; margin: 0 auto 12px; border: 3px solid var(--gold); }
.hero-name { font-size: 20px; font-weight: 500; }
.hero-id { font-size: 12px; color: var(--ts); margin-top: 3px; }
.hero-badge { display: inline-block; background: var(--gold-dim); border: 1px solid var(--gold-border); border-radius: 20px; padding: 3px 14px; font-size: 12px; color: var(--gold2); margin: 8px 0; }
.level-section { margin-top: 12px; }
.level-row { display: flex; justify-content: space-between; font-size: 11px; color: var(--gold); margin-bottom: 6px; }
.level-bar { height: 5px; background: var(--card2); border-radius: 4px; overflow: hidden; margin-bottom: 5px; }
.level-fill { height: 100%; background: linear-gradient(90deg,var(--gold),var(--gold2)); border-radius: 4px; transition: width .5s; }
.level-next { font-size: 11px; color: var(--ts); }
.info-section { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }
.info-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; }
.info-title { font-size: 13px; font-weight: 500; margin-bottom: 12px; color: var(--gold); }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.info-row:last-child { border-bottom: none; }
.info-row span:first-child { color: var(--ts); }
.field { margin-bottom: 12px; }
.field label { display: block; font-size: 12px; color: var(--ts); margin-bottom: 6px; }
.field input { width: 100%; background: var(--card2); border: 1px solid var(--border); border-radius: 10px; padding: 11px 13px; color: var(--tp); font-size: 14px; outline: none; }
.field input:focus { border-color: var(--gold-border); }
.msg { font-size: 13px; padding: 9px 12px; border-radius: 8px; margin-bottom: 10px; }
.msg.ok  { background: var(--green-dim); color: var(--green); }
.msg.err { background: rgba(226,75,74,0.1); color: var(--danger); }
.btn-save { width: 100%; padding: 12px; border-radius: 10px; border: none; cursor: pointer; background: linear-gradient(135deg,#D4A843,#FF6B1A); color: white; font-size: 14px; }
.btn-save:disabled { opacity: 0.6; }
.btn-logout { width: 100%; padding: 13px; border-radius: 12px; background: rgba(226,75,74,0.08); border: 1px solid rgba(226,75,74,0.2); color: var(--danger); font-size: 14px; cursor: pointer; }
</style>