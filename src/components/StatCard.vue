<template>
  <div class="stat-card">
    <div class="val">{{ value }}</div>
    <div class="lbl">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({ value: [String, Number], label: String })
</script>

<style scoped>
.stat-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
}
.val {
  font-size: 16px;
  font-weight: 500;
  color: var(--tp);
}
.lbl {
  font-size: 9px;
  color: var(--ts);
  margin-top: 3px;
  line-height: 1.3;
}
</style>