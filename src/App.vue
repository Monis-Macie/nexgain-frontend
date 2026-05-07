<template>
  <router-view />
</template>

<script setup>
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&display=swap');

:root {
  --og: #FF6B1A;
  --og2: #FF8C42;
  --gold: #D4A843;
  --gold2: #F0C96A;
  --gold-dim: rgba(212,168,67,0.12);
  --gold-border: rgba(212,168,67,0.22);
  --green: #22C97A;
  --green-dim: rgba(34,201,122,0.1);
  --bg: #09090B;
  --card: #111115;
  --card2: #18181E;
  --card3: #1F1F27;
  --border: rgba(255,255,255,0.06);
  --tp: #F5F3EE;
  --ts: #7A7875;
  --danger: #E24B4A;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--tp); font-family: 'Sora', sans-serif; }
.app-shell { max-width: 430px; margin: 0 auto; min-height: 100vh; background: var(--bg); }
</style>