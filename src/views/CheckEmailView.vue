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

      <div class="email-icon">📧</div>
      <h2>Verifica o teu email</h2>
      <p class="sub">Enviámos um link de verificação para o teu email. Clica no link para activar a tua conta.</p>

      <div class="info-box">
        <p>💡 Verifica também a pasta de <strong>spam</strong> caso não encontres o email.</p>
      </div>

      <p class="link">Já verificaste? <router-link to="/login">Entrar</router-link></p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--bg); position: relative; overflow: hidden; padding: 20px; }
.auth-glow { position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%); pointer-events: none; }
.auth-card { width: 100%; max-width: 380px; background: var(--card);
  border: 1px solid var(--gold-border); border-radius: 20px; padding: 36px 28px; text-align: center; }
.logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 24px; }
.logo-mark { width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #D4A843, #F0C96A); display: flex; align-items: center; justify-content: center; }
.logo-mark svg { width: 20px; height: 20px; }
.logo-text { font-size: 20px; font-weight: 500; letter-spacing: 2px; color: var(--tp); }
.logo-text em { color: var(--gold); font-style: normal; }
.email-icon { font-size: 60px; margin-bottom: 16px; }
h2 { font-size: 22px; font-weight: 500; color: var(--tp); margin-bottom: 10px; }
.sub { font-size: 13px; color: var(--ts); line-height: 1.6; margin-bottom: 20px; }
.info-box { background: var(--gold-dim); border: 1px solid var(--gold-border);
  border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; }
.info-box p { font-size: 13px; color: var(--gold); }
.link { font-size: 13px; color: var(--ts); }
.link a { color: var(--gold); text-decoration: none; }
</style>