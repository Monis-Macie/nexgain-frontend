<template>
  <nav class="bottom-nav">
    <router-link to="/dashboard" class="ni" active-class="on">
      <HomeIcon /><span>Início</span>
    </router-link>
    <router-link to="/activities" class="ni" active-class="on">
      <ActivityIcon /><span>Actividades</span>
    </router-link>
    <router-link to="/nexpay" class="ni" active-class="on">
      <PayIcon /><span>NexPay</span>
    </router-link>
    <router-link to="/referrals" class="ni" active-class="on">
      <RefIcon /><span>Convites</span>
    </router-link>
    <router-link to="/profile" class="ni" active-class="on">
      <UserIcon /><span>Meu</span>
    </router-link>
  </nav>
</template>

<script setup>
import HomeIcon     from './icons/HomeIcon.vue'
import ActivityIcon from './icons/ActivityIcon.vue'
import PayIcon      from './icons/PayIcon.vue'
import RefIcon      from './icons/RefIcon.vue'
import UserIcon     from './icons/UserIcon.vue'
</script>

<style scoped>
.bottom-nav {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 430px; max-width: 100%;
  background: var(--card); border-top: 1px solid var(--gold-border);
  display: flex; justify-content: space-around;
  padding: 10px 0 16px; z-index: 100;
}
.ni { display: flex; flex-direction: column; align-items: center; gap: 3px;
  color: var(--ts); text-decoration: none; font-size: 10px; transition: color .2s; }
.ni svg { width: 20px; height: 20px; fill: currentColor; }
.ni.on { color: var(--gold); }
</style>