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
          <h3>Actividad Temporal</h3>
          <div class="chart-actions">
            <button 
              class="btn-chart-filter" 
              :class="{ active: periodoActivo === 'mes' }"
              @click="$emit('cambiarPeriodo', 'mes')"
            >
              6 Meses
            </button>
            <button 
              class="btn-chart-filter" 
              :class="{ active: periodoActivo === 'trimestre' }"
              @click="$emit('cambiarPeriodo', 'trimestre')"
            >
              12 Meses
            </button>
            <button 
              class="btn-chart-filter" 
              :class="{ active: periodoActivo === 'año' }"
              @click="$emit('cambiarPeriodo', 'año')"
            >
              Todo
            </button>
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
  },
  periodoActivo: {
    type: String,
    default: 'mes'
  }
})

defineEmits(['cambiarPeriodo'])

// Gráfico de inventario - DATOS REALES de stock
const inventoryData = computed(() => ({
  labels: ['En Stock', 'Stock Bajo', 'Agotados'],
  datasets: [
    {
      label: 'Productos',
      data: [
        props.stats.productosStock || 0,
        props.stats.productosStockBajo || 0,
        props.stats.productosAgotados || 0
      ],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderRadius: 8,
      barThickness: 40
    },
    {
      label: 'Materias Primas',
      data: [
        props.stats.materiasStock || 0,
        props.stats.materiasStockBajo || 0,
        props.stats.materiasAgotadas || 0
      ],
      backgroundColor: 'rgba(79, 172, 254, 0.8)',
      borderRadius: 8,
      barThickness: 40
    }
  ]
}))

// Gráfico de distribución - DATOS REALES de totales
const distributionData = computed(() => ({
  labels: ['Productos', 'Clientes', 'Materias Primas', 'Lotes'],
  datasets: [{
    data: [
      props.stats.totalProductos || 0,
      props.stats.totalClientes || 0,
      props.stats.totalMateriasPrimas || 0,
      props.stats.lotesActivos || 0
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

// Gráfico de actividad mensual - DATOS REALES por mes
const activityData = computed(() => {
  // Generar datos según el periodo activo
  let mesesMostrar = 6
  let labelsEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  if (props.periodoActivo === 'trimestre') {
    mesesMostrar = 12
  } else if (props.periodoActivo === 'año') {
    // Mostrar todos los datos disponibles
    mesesMostrar = props.stats.productosPorMes?.length || 6
  }
  
  const meses = []
  const ahora = new Date()
  
  // Obtener últimos N meses
  for (let i = mesesMostrar - 1; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    meses.push({
      label: labelsEs[fecha.getMonth()],
      mes: fecha.getMonth(),
      año: fecha.getFullYear()
    })
  }

  // Obtener datos del periodo seleccionado
  const productosData = props.stats.productosPorMes || []
  const clientesData = props.stats.clientesPorMes || []
  
  // Tomar solo los últimos N meses de datos
  const productosSlice = productosData.slice(-mesesMostrar)
  const clientesSlice = clientesData.slice(-mesesMostrar)

  return {
    labels: meses.map(m => m.label),
    datasets: [
      {
        label: 'Productos',
        data: productosSlice.length > 0 ? productosSlice : new Array(mesesMostrar).fill(0),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Clientes',
        data: clientesSlice.length > 0 ? clientesSlice : new Array(mesesMostrar).fill(0),
        borderColor: 'rgb(240, 147, 251)',
        backgroundColor: 'rgba(240, 147, 251, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

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
  color: #495057;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
  text-align: center;
}

.btn-chart-filter:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
}

.btn-chart-filter.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
  font-weight: 600;
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
