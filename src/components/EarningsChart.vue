<template>
  <div class="chart-wrap">
    <div class="chart-top">
      <div>
        <div class="main-val">{{ fmt(store.chart?.total || 0) }} MZN</div>
        <div class="sub">Total período</div>
      </div>
      <div class="change" :class="{ pos: change >= 0, neg: change < 0 }">
        {{ change >= 0 ? '▲' : '▼' }} {{ Math.abs(change) }}%
      </div>
    </div>
    <div class="tabs">
      <button v-for="p in periods" :key="p.val"
        :class="['tab', { on: store.chartPeriod === p.val }]"
        @click="store.fetchChart(p.val)">{{ p.label }}</button>
    </div>
    <canvas ref="canvas" height="100"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { Chart, LineController, LineElement, PointElement,
         LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js'

Chart.register(LineController, LineElement, PointElement,
               LinearScale, CategoryScale, Filler, Tooltip)

const store = useDashboardStore()
const canvas = ref(null)
let chart = null
const periods = [
  { val: '7d', label: '7D' },
  { val: '1m', label: '1M' },
  { val: '1y', label: '1A' }
]
const change = computed(() => store.chart?.change || 0)
const fmt = n => Number(n).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })

function buildChart() {
  if (!canvas.value || !store.chart) return
  const d = store.chart.data
  const labels = d.map(e => {
    const dt = new Date(e.date)
    return dt.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })
  })
  const amounts = d.map(e => e.amount)
  if (chart) chart.destroy()
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: amounts,
        borderColor: '#D4A843',
        backgroundColor: 'rgba(212,168,67,0.15)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#D4A843',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ' ' + fmt(ctx.parsed.y) + ' MZN' }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#7A7875', font: { size: 9 }, maxRotation: 0 }},
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7A7875', font: { size: 9 } }},
      },
    },
  })
}

onMounted(buildChart)
watch(() => store.chart, buildChart)
</script>

<style scoped>
.chart-wrap {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
}
.chart-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}
.main-val { font-size: 22px; font-weight: 500; color: var(--tp); }
.sub { font-size: 11px; color: var(--ts); margin-top: 2px; }
.change { font-size: 12px; padding: 3px 9px; border-radius: 6px; }
.change.pos { background: var(--green-dim); color: var(--green); }
.change.neg { background: rgba(226,75,74,0.1); color: var(--danger); }
.tabs { display: flex; gap: 4px; margin-bottom: 12px; }
.tab {
  font-size: 10px; padding: 3px 10px; border-radius: 8px;
  background: transparent; border: 1px solid var(--border);
  color: var(--ts); cursor: pointer;
}
.tab.on {
  background: var(--gold-dim);
  border-color: var(--gold-border);
  color: var(--gold2);
}
</style>