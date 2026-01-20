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
      <DashboardCharts :stats="stats" :periodo-activo="periodoTemporal" @cambiar-periodo="cambiarPeriodo" />

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
import loteProduccionService from '../services/loteProduccionService'
import '../assets/styles/Dashboard.css'

const toast = useToast()
const loading = ref(false)
const periodoTemporal = ref('mes') // mes, trimestre, año

const stats = ref({
  totalProductos: 0,
  totalClientes: 0,
  totalMateriasPrimas: 0,
  lotesActivos: 0,
  productosCrecimiento: 0,
  clientesCrecimiento: 0,
  materiasBajoStock: 0,
  lotesCompletados: 0,
  productosStock: 0,
  productosStockBajo: 0,
  productosAgotados: 0,
  materiasStock: 0,
  materiasStockBajo: 0,
  materiasAgotadas: 0,
  productosPorMes: [],
  clientesPorMes: []
})

const fetchStats = async () => {
  try {
    loading.value = true
    
    // Obtener datos REALES de las APIs
    const [productos, clientes, materias, lotes] = await Promise.all([
      productosService.getAll().catch(err => { console.error('Error productos:', err); return { results: [] } }),
      clientesService.getAll().catch(err => { console.error('Error clientes:', err); return { results: [] } }),
      materiasPrimasService.getAll().catch(err => { console.error('Error materias:', err); return { results: [] } }),
      loteProduccionService.getLotesProduccion().catch(err => { console.error('Error lotes:', err); return { results: [] } })
    ])

    console.log('Datos recibidos:', { productos, clientes, materias, lotes })

    // Extraer arrays - los servicios devuelven { count, results } o { results }
    const productosArray = productos.results || []
    const clientesArray = clientes.results || []
    const materiasArray = materias.results || []
    const lotesArray = lotes.results || []

    // Calcular estadísticas
    stats.value.totalProductos = productosArray.length
    stats.value.totalClientes = clientesArray.length
    stats.value.totalMateriasPrimas = materiasArray.length
    
    // Calcular stock de productos
    stats.value.productosStock = productosArray.filter(p => (p.stock || 0) > 20).length
    stats.value.productosStockBajo = productosArray.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 20).length
    stats.value.productosAgotados = productosArray.filter(p => (p.stock || 0) === 0).length
    
    // Calcular stock de materias primas
    stats.value.materiasStock = materiasArray.filter(m => (m.quantity || 0) > 100).length
    stats.value.materiasStockBajo = materiasArray.filter(m => (m.quantity || 0) > 0 && (m.quantity || 0) <= 100).length
    stats.value.materiasAgotadas = materiasArray.filter(m => (m.quantity || 0) === 0).length
    stats.value.materiasBajoStock = stats.value.materiasStockBajo + stats.value.materiasAgotadas
    
    // Datos REALES de lotes de producción
    stats.value.lotesActivos = lotesArray.filter(l => l.status === 'in_progress' || l.status === 'pending').length
    
    // Calcular lotes completados HOY
    const hoy = new Date().toISOString().split('T')[0]
    stats.value.lotesCompletados = lotesArray.filter(l => {
      if (l.status === 'completed' && l.completion_date) {
        return l.completion_date.split('T')[0] === hoy
      }
      return false
    }).length

    // Calcular crecimiento (comparar con mes anterior si hay datos de created_at)
    const calcularCrecimiento = (items, field = 'created_at') => {
      if (!items || items.length === 0) return 0
      
      const ahora = new Date()
      const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
      const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0)
      
      const esteMes = items.filter(item => {
        if (!item[field]) return false
        const fecha = new Date(item[field])
        return fecha >= inicioMesActual && fecha <= ahora
      }).length
      
      const mesAnterior = items.filter(item => {
        if (!item[field]) return false
        const fecha = new Date(item[field])
        return fecha >= inicioMesAnterior && fecha <= finMesAnterior
      }).length
      
      if (mesAnterior === 0) return esteMes > 0 ? 100 : 0
      return Math.round(((esteMes - mesAnterior) / mesAnterior) * 100)
    }

    // Calcular datos por mes para el gráfico de actividad (últimos 6 meses)
    const calcularPorMes = (items, field = 'created_at') => {
      const ahora = new Date()
      const mesesData = []
      
      for (let i = 5; i >= 0; i--) {
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0)
        
        const count = items.filter(item => {
          // Intentar múltiples campos de fecha comunes
          const fechaStr = item[field] || item.fecha_registro || item.fecha_creacion || item.created
          if (!fechaStr) return false
          const fecha = new Date(fechaStr)
          return fecha >= inicioMes && fecha <= finMes
        }).length
        
        mesesData.push(count)
      }
      
      return mesesData
    }
    
    stats.value.productosCrecimiento = calcularCrecimiento(productosArray)
    stats.value.clientesCrecimiento = calcularCrecimiento(clientesArray)
    
    // Calcular actividad por mes
    stats.value.productosPorMes = calcularPorMes(productosArray, 'created_at')
    stats.value.clientesPorMes = calcularPorMes(clientesArray, 'created_at')

    console.log('Estadísticas calculadas:', stats.value)
    console.log('Productos por mes:', stats.value.productosPorMes)
    console.log('Clientes por mes:', stats.value.clientesPorMes)
    console.log('Ejemplo producto:', productosArray[0])
    console.log('Ejemplo cliente:', clientesArray[0])

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
const cambiarPeriodo = (periodo) => {
  periodoTemporal.value = periodo
  toast.info(`Vista cambiada: ${periodo === 'mes' ? '6 Meses' : periodo === 'trimestre' ? '12 Meses' : 'Todo'}`)
}

}

onMounted(() => {
  fetchStats()
  toast.info('¡Bienvenido al Sistema Innoquim!', {
    timeout: 2000
  })
})
</script>
