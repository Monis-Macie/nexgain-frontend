import { defineStore } from 'pinia'
import axios from 'axios'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    data: null,
    chart: null,
    chartPeriod: '7d',
    loading: false,
  }),
  actions: {
    async fetch() {
      this.loading = true
      try {
        const [dash, chart] = await Promise.all([
          axios.get('/dashboard'),
          axios.get('/earnings/chart', { params: { period: this.chartPeriod } }),
        ])
        this.data = dash.data
        this.chart = chart.data
      } finally {
        this.loading = false
      }
    },
    async fetchChart(period) {
      this.chartPeriod = period
      const { data } = await axios.get('/earnings/chart', { params: { period } })
      this.chart = data
    },
  },
})