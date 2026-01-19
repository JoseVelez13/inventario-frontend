<template>
  <div class="dashboard-charts">
    <div class="charts-grid">
      <!-- Gráfico de Productos por Categoría -->
      <div class="chart-card animate-slide-in" style="animation-delay: 0.5s">
        <div class="chart-header">
          <h3>Inventario por Categoría</h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot productos"></span> Productos
            </span>
            <span class="legend-item">
              <span class="legend-dot materias"></span> Materias Primas
            </span>
          </div>
        </div>
        <div class="chart-body">
          <Bar :data="inventoryData" :options="barOptions" />
        </div>
      </div>

      <!-- Gráfico de Distribución -->
      <div class="chart-card animate-slide-in" style="animation-delay: 0.6s">
        <div class="chart-header">
          <h3>Distribución del Sistema</h3>
        </div>
        <div class="chart-body">
          <Doughnut :data="distributionData" :options="doughnutOptions" />
        </div>
      </div>

      <!-- Gráfico de Tendencias -->
      <div class="chart-card chart-wide animate-slide-in" style="animation-delay: 0.7s">
        <div class="chart-header">
          <h3>Actividad Mensual</h3>
          <div class="chart-actions">
            <button class="btn-chart-filter active">Mes</button>
            <button class="btn-chart-filter">Trimestre</button>
            <button class="btn-chart-filter">Año</button>
          </div>
        </div>
        <div class="chart-body">
          <Line :data="activityData" :options="lineOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
)

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
})

const inventoryData = computed(() => ({
  labels: ['En Stock', 'Stock Bajo', 'Agotados'],
  datasets: [
    {
      label: 'Productos',
      data: [props.stats.productosStock || 45, props.stats.productosStockBajo || 12, props.stats.productosAgotados || 3],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderRadius: 8,
      barThickness: 40
    },
    {
      label: 'Materias Primas',
      data: [props.stats.materiasStock || 38, props.stats.materiasStockBajo || 8, props.stats.materiasAgotadas || 2],
      backgroundColor: 'rgba(79, 172, 254, 0.8)',
      borderRadius: 8,
      barThickness: 40
    }
  ]
}))

const distributionData = computed(() => ({
  labels: ['Productos', 'Clientes', 'Materias Primas', 'Lotes'],
  datasets: [{
    data: [
      props.stats.totalProductos || 60,
      props.stats.totalClientes || 35,
      props.stats.totalMateriasPrimas || 48,
      props.stats.lotesActivos || 22
    ],
    backgroundColor: [
      'rgba(102, 126, 234, 0.8)',
      'rgba(240, 147, 251, 0.8)',
      'rgba(79, 172, 254, 0.8)',
      'rgba(67, 233, 123, 0.8)'
    ],
    borderWidth: 0
  }]
}))

const activityData = computed(() => ({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Productos',
      data: [12, 19, 15, 25, 22, 30],
      borderColor: 'rgb(102, 126, 234)',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6
    },
    {
      label: 'Clientes',
      data: [8, 11, 13, 17, 16, 20],
      borderColor: 'rgb(240, 147, 251)',
      backgroundColor: 'rgba(240, 147, 251, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ]
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8,
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 15,
        font: { size: 12 },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8
    }
  },
  cutout: '65%'
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        padding: 15,
        font: { size: 12 },
        usePointStyle: true,
        pointStyle: 'circle'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      borderRadius: 8
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
</script>

<style scoped>
.dashboard-charts {
  margin-top: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-wide {
  grid-column: span 2;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.productos {
  background: rgba(102, 126, 234, 0.8);
}

.legend-dot.materias {
  background: rgba(79, 172, 254, 0.8);
}

.chart-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-chart-filter {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-chart-filter:hover {
  background: #f8f9fa;
}

.btn-chart-filter.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.chart-body {
  height: 300px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.6s ease-out forwards;
  opacity: 0;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-wide {
    grid-column: span 1;
  }
}
</style>
