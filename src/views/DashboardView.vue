<template>
  <div class="dashboard-page">
    <HeaderGlobal />
    <div class="dashboard-bg"></div>

    <div class="dashboard-wrapper">
      <div class="dashboard-top animate__animated animate__fadeInDown">
        <h1 class="dash-title">Panel de Control</h1>
        <button class="btn-refresh" @click="refreshStats" :disabled="loading">
          <i class="fa-solid fa-sync" :class="{ 'fa-spin': loading }"></i>
          Actualizar
        </button>
      </div>

      <!-- Estadísticas con KPIs -->
      <DashboardStats :stats="stats" />

      <!-- Gráficos interactivos -->
      <DashboardCharts :stats="stats" />

      <!-- Sección de Módulos -->
      <div class="modules-section">
        <h2 class="section-title">Aplicaciones del Sistema</h2>
        <div class="modules-grid">
          <Tooltip text="Ir al módulo de Clientes" position="bottom">
            <div class="module-card animate__animated animate__fadeInUp" style="animation-delay: 0.1s" @click="$router.push('/clientes')" role="button" tabindex="0">
              <div class="module-icon">👥</div>
              <div class="module-info">
                <h3>Clientes</h3>
                <p>Gestión de empresas y contactos</p>
              </div>
              <div class="module-badge active">Activo</div>
            </div>
          </Tooltip>

          <Tooltip text="Ir al módulo de Productos" position="bottom">
            <div class="module-card animate__animated animate__fadeInUp" style="animation-delay: 0.2s" @click="$router.push('/productos')" role="button" tabindex="0">
              <div class="module-icon">📦</div>
              <div class="module-info">
                <h3>Productos</h3>
                <p>Control de inventario</p>
              </div>
              <div class="module-badge active">Activo</div>
            </div>
          </Tooltip>

          <Tooltip text="Ir al módulo de Materias Primas" position="bottom">
            <div class="module-card animate__animated animate__fadeInUp" style="animation-delay: 0.3s" @click="$router.push('/materias-primas')" role="button" tabindex="0">
              <div class="module-icon">🧪</div>
              <div class="module-info">
                <h3>Materia Prima</h3>
                <p>Gestión de insumos</p>
              </div>
              <div class="module-badge active">Activo</div>
            </div>
          </Tooltip>

          <Tooltip text="Ir al módulo de Lotes de Producción" position="bottom">
            <div class="module-card animate__animated animate__fadeInUp" style="animation-delay: 0.4s" @click="$router.push('/lotes-produccion')" role="button" tabindex="0">
              <div class="module-icon">⚙️</div>
              <div class="module-info">
                <h3>Lotes de Producción</h3>
                <p>Gestión de producción</p>
              </div>
              <div class="module-badge active">Activo</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Tooltip from '../components/Tooltip.vue'
import DashboardStats from '../components/DashboardStats.vue'
import DashboardCharts from '../components/DashboardCharts.vue'
import productosService from '../services/productosService'
import clientesService from '../services/clientesService'
import materiasPrimasService from '../services/materiasPrimasService'
import '../assets/styles/Dashboard.css'

const toast = useToast()
const loading = ref(false)
const stats = ref({
  totalProductos: 0,
  totalClientes: 0,
  totalMateriasPrimas: 0,
  lotesActivos: 0,
  productosCrecimiento: 12,
  clientesCrecimiento: 8,
  materiasBajoStock: 0,
  lotesCompletados: 0,
  productosStock: 0,
  productosStockBajo: 0,
  productosAgotados: 0,
  materiasStock: 0,
  materiasStockBajo: 0,
  materiasAgotadas: 0
})

const fetchStats = async () => {
  try {
    loading.value = true
    
    // Obtener datos de las APIs
    const [productos, clientes, materias] = await Promise.all([
      productosService.getAll().catch(() => ({ data: [] })),
      clientesService.getAll().catch(() => ({ data: [] })),
      materiasPrimasService.getAll().catch(() => ({ data: [] }))
    ])

    // Calcular estadísticas
    stats.value.totalProductos = productos.data?.length || 0
    stats.value.totalClientes = clientes.data?.length || 0
    stats.value.totalMateriasPrimas = materias.data?.length || 0
    
    // Calcular stock
    if (productos.data) {
      stats.value.productosStock = productos.data.filter(p => p.stock > 20).length
      stats.value.productosStockBajo = productos.data.filter(p => p.stock > 0 && p.stock <= 20).length
      stats.value.productosAgotados = productos.data.filter(p => p.stock === 0).length
    }
    
    if (materias.data) {
      stats.value.materiasStock = materias.data.filter(m => m.quantity > 100).length
      stats.value.materiasStockBajo = materias.data.filter(m => m.quantity > 0 && m.quantity <= 100).length
      stats.value.materiasAgotadas = materias.data.filter(m => m.quantity === 0).length
      stats.value.materiasBajoStock = stats.value.materiasStockBajo + stats.value.materiasAgotadas
    }
    
    // Simular datos de lotes (reemplazar con API real)
    stats.value.lotesActivos = Math.floor(Math.random() * 15) + 10
    stats.value.lotesCompletados = Math.floor(Math.random() * 5) + 1

  } catch (error) {
    console.error('Error al cargar estadísticas:', error)
    toast.error('Error al cargar las estadísticas del dashboard')
  } finally {
    loading.value = false
  }
}

const refreshStats = async () => {
  await fetchStats()
  toast.success('Estadísticas actualizadas correctamente')
}

onMounted(() => {
  fetchStats()
  toast.info('¡Bienvenido al Sistema Innoquim!', {
    timeout: 2000
  })
})
</script>
