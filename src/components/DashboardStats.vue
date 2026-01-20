<template>
  <div class="dashboard-stats">
    <!-- Tarjeta de estadística destacada principal -->
    <div class="featured-stat">
      <div class="featured-content">
        <div class="featured-header">
          <div class="featured-icon">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <div class="featured-info">
            <p class="featured-label">Resumen de Inventario</p>
            <h2 class="featured-title">Sistema de Gestión</h2>
          </div>
        </div>
        <div class="featured-stats-row">
          <div class="mini-stat">
            <div class="mini-stat-icon productos">
              <i class="fa-solid fa-box"></i>
            </div>
            <div>
              <p class="mini-label">Productos</p>
              <h4 class="mini-value">{{ stats.totalProductos || 0 }}</h4>
            </div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-icon clientes">
              <i class="fa-solid fa-users"></i>
            </div>
            <div>
              <p class="mini-label">Clientes</p>
              <h4 class="mini-value">{{ stats.totalClientes || 0 }}</h4>
            </div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-icon materias">
              <i class="fa-solid fa-flask"></i>
            </div>
            <div>
              <p class="mini-label">Materias Primas</p>
              <h4 class="mini-value">{{ stats.totalMateriasPrimas || 0 }}</h4>
            </div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-icon lotes">
              <i class="fa-solid fa-industry"></i>
            </div>
            <div>
              <p class="mini-label">Lotes en Producción</p>
              <h4 class="mini-value">{{ stats.lotesActivos || 0 }}</h4>
              <p class="mini-units">{{ Math.round(stats.unidadesEnProduccion || 0).toLocaleString('es-ES') }} unidades</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tarjetas secundarias en grid -->
    <div class="secondary-stats">
      <div class="compact-card">
        <div class="compact-icon success">
          <i class="fa-solid fa-box-open"></i>
        </div>
        <div class="compact-content">
          <p class="compact-label">Productos en Stock</p>
          <h4 class="compact-value">{{ stats.productosStock || 0 }}</h4>
          <p class="compact-desc">Con disponibilidad normal</p>
        </div>
      </div>

      <div class="compact-card">
        <div class="compact-icon warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="compact-content">
          <p class="compact-label">Stock Bajo</p>
          <h4 class="compact-value">{{ stats.productosStockBajo || 0 }}</h4>
          <p class="compact-desc">Productos por reponer</p>
        </div>
      </div>

      <div class="compact-card">
        <div class="compact-icon danger">
          <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <div class="compact-content">
          <p class="compact-label">Productos Agotados</p>
          <h4 class="compact-value">{{ stats.productosAgotados || 0 }}</h4>
          <p class="compact-desc">Sin existencias</p>
        </div>
      </div>

      <div class="compact-card">
        <div class="compact-icon info">
          <i class="fa-solid fa-flask"></i>
        </div>
        <div class="compact-content">
          <p class="compact-label">Materias con Stock Bajo</p>
          <h4 class="compact-value">{{ stats.materiasBajoStock || 0 }}</h4>
          <p class="compact-desc">Requieren reposición</p>
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
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Tarjeta destacada principal */
.featured-stat {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
}

.featured-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.featured-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.featured-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.featured-info {
  flex: 1;
}

.featured-label {
  margin: 0 0 4px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.featured-title {
  margin: 0;
  color: white;
  font-size: 28px;
  font-weight: 700;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.featured-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.mini-stat {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  flex-shrink: 0;
}

.mini-stat-icon.productos {
  background: rgba(255, 255, 255, 0.25);
}

.mini-stat-icon.clientes {
  background: rgba(245, 87, 108, 0.3);
}

.mini-stat-icon.materias {
  background: rgba(79, 172, 254, 0.3);
}

.mini-stat-icon.lotes {
  background: rgba(67, 233, 123, 0.3);
}

.mini-label {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mini-value {
  margin: 4px 0 0 0;
  color: white;
  font-size: 22px;
  font-weight: 700;
}

.mini-units {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* Tarjetas secundarias */
.secondary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.compact-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.compact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.compact-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.compact-icon.success {
  background: #d1fae5;
  color: #065f46;
}

.compact-icon.warning {
  background: #fef3c7;
  color: #92400e;
}

.compact-icon.info {
  background: #dbeafe;
  color: #1e40af;
}

.compact-icon.primary {
  background: #e0e7ff;
  color: #3730a3;
}

.compact-icon.danger {
  background: #fee2e2;
  color: #991b1b;
}

.compact-content {
  flex: 1;
}

.compact-label {
  margin: 0 0 4px 0;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compact-value {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
}

.compact-desc {
  margin: 0;
  color: #9ca3af;
  font-size: 13px;
}

@media (max-width: 768px) {
  .featured-stat {
    padding: 24px;
  }
  
  .featured-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .secondary-stats {
    grid-template-columns: 1fr;
  }
}
</style>
