<template>
  <div class="dashboard-stats">
    <div class="stats-grid">
      <div class="stat-card animate-fade-in" style="animation-delay: 0.1s">
        <div class="stat-icon productos">
          <i class="fa-solid fa-box"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Productos</p>
          <h3 class="stat-value">{{ stats.totalProductos || 0 }}</h3>
          <p class="stat-trend up" v-if="stats.productosCrecimiento > 0">
            <i class="fa-solid fa-arrow-trend-up"></i>
            {{ stats.productosCrecimiento }}% más este mes
          </p>
        </div>
      </div>

      <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
        <div class="stat-icon clientes">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Clientes</p>
          <h3 class="stat-value">{{ stats.totalClientes || 0 }}</h3>
          <p class="stat-trend up" v-if="stats.clientesCrecimiento > 0">
            <i class="fa-solid fa-arrow-trend-up"></i>
            {{ stats.clientesCrecimiento }}% más este mes
          </p>
        </div>
      </div>

      <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
        <div class="stat-icon materias">
          <i class="fa-solid fa-flask"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Materias Primas</p>
          <h3 class="stat-value">{{ stats.totalMateriasPrimas || 0 }}</h3>
          <p class="stat-trend warning" v-if="stats.materiasBajoStock > 0">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ stats.materiasBajoStock }} con stock bajo
          </p>
        </div>
      </div>

      <div class="stat-card animate-fade-in" style="animation-delay: 0.4s">
        <div class="stat-icon lotes">
          <i class="fa-solid fa-industry"></i>
        </div>
        <div class="stat-content">
          <p class="stat-label">Lotes Activos</p>
          <h3 class="stat-value">{{ stats.lotesActivos || 0 }}</h3>
          <p class="stat-trend" v-if="stats.lotesCompletados > 0">
            <i class="fa-solid fa-check-circle"></i>
            {{ stats.lotesCompletados }} completados hoy
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
.dashboard-stats {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  gap: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-icon.productos {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.clientes {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.materias {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.lotes {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 0.5rem 0;
  line-height: 1;
}

.stat-trend {
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-trend.up {
  color: #28a745;
}

.stat-trend.warning {
  color: #ffc107;
}

.stat-trend i {
  font-size: 0.875rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
}
</style>
