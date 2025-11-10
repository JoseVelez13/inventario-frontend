<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Dashboard - Sistema Innoquim</h1>
      <p v-if="user" class="welcome">Bienvenido, <strong>{{ user.first_name || user.username }}</strong></p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Cargando estadísticas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <strong>Error:</strong> {{ error }}
      <button @click="loadDashboard" class="btn-retry">Reintentar</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="dashboard-content">
      <!-- KPIs / Tarjetas de estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>Total Productos</h3>
            <p class="stat-value">{{ stats.productos_total || 0 }}</p>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <h3>Stock Bajo</h3>
            <p class="stat-value">{{ stats.productos_stock_bajo || 0 }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <h3>Órdenes Pendientes</h3>
            <p class="stat-value">{{ stats.ordenes_pendientes || 0 }}</p>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>Órdenes Completadas</h3>
            <p class="stat-value">{{ stats.ordenes_completadas_mes || 0 }}</p>
            <small>Este mes</small>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>Ventas del Mes</h3>
            <p class="stat-value">S/ {{ formatCurrency(stats.ventas_mes_actual) }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>Clientes Activos</h3>
            <p class="stat-value">{{ stats.clientes_activos || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div v-if="stats.alertas && stats.alertas.length > 0" class="alertas-section">
        <h2>Alertas del Sistema</h2>
        <div class="alertas-list">
          <div 
            v-for="(alerta, index) in stats.alertas" 
            :key="index" 
            class="alerta-item"
            :class="`alerta-${alerta.tipo}`"
          >
            <span class="alerta-icon">
              {{ alerta.tipo === 'stock_bajo' ? '⚠️' : 'ℹ️' }}
            </span>
            <p>{{ alerta.mensaje }}</p>
            <router-link 
              v-if="alerta.producto_id" 
              :to="`/productos/${alerta.producto_id}`"
              class="alerta-link"
            >
              Ver producto
            </router-link>
          </div>
        </div>
      </div>

      <!-- Accesos rápidos -->
      <div class="quick-actions">
        <h2>Accesos Rápidos</h2>
        <div class="actions-grid">
          <router-link to="/productos" class="action-card">
            <span class="action-icon">📦</span>
            <h3>Productos</h3>
            <p>Gestionar inventario de productos</p>
          </router-link>

          <router-link to="/clientes" class="action-card">
            <span class="action-icon">👥</span>
            <h3>Clientes</h3>
            <p>Administrar clientes</p>
          </router-link>

          <router-link to="/ordenes" class="action-card">
            <span class="action-icon">📋</span>
            <h3>Órdenes</h3>
            <p>Ver y crear órdenes</p>
          </router-link>

          <router-link to="/materias-primas" class="action-card">
            <span class="action-icon">🧪</span>
            <h3>Materias Primas</h3>
            <p>Gestionar materias primas</p>
          </router-link>

          <router-link to="/inventario" class="action-card">
            <span class="action-icon">📊</span>
            <h3>Inventario</h3>
            <p>Control de inventario</p>
          </router-link>

          <router-link to="/reportes" class="action-card">
            <span class="action-icon">📈</span>
            <h3>Reportes</h3>
            <p>Reportes y estadísticas</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dashboardService from '../services/dashboardService'
import authService from '../services/auth'
import { handleApiError } from '../utils/errorHandler'

const loading = ref(true)
const error = ref('')
const stats = ref({})
const user = ref(null)

// Función para formatear moneda
function formatCurrency(value) {
  if (!value) return '0.00'
  return parseFloat(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Cargar datos del dashboard
async function loadDashboard() {
  loading.value = true
  error.value = ''
  
  try {
    // Obtener usuario actual
    user.value = authService.getUser()
    
    // Obtener estadísticas del dashboard
    const data = await dashboardService.getEstadisticas()
    stats.value = data
  } catch (e) {
    console.error('Error al cargar dashboard:', e)
    const errorInfo = handleApiError(e)
    error.value = errorInfo.message
  } finally {
    loading.value = false
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 32px;
}

.welcome {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c00;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-retry {
  padding: 8px 16px;
  background-color: #c00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-retry:hover {
  background-color: #a00;
}

/* Grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-card.warning {
  border-left: 4px solid #ff9800;
}

.stat-card.success {
  border-left: 4px solid #4caf50;
}

.stat-icon {
  font-size: 40px;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.stat-info small {
  color: #999;
  font-size: 12px;
}

/* Alertas */
.alertas-section {
  margin-bottom: 40px;
}

.alertas-section h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #333;
}

.alertas-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alerta-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid #ff9800;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.alerta-stock_bajo {
  border-left-color: #ff5722;
}

.alerta-icon {
  font-size: 24px;
}

.alerta-item p {
  flex: 1;
  margin: 0;
  color: #333;
}

.alerta-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.alerta-link:hover {
  text-decoration: underline;
}

/* Accesos rápidos */
.quick-actions {
  margin-top: 40px;
}

.quick-actions h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.action-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.action-card p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
