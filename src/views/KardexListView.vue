<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Kardex de Inventario
        <span class="chip" aria-live="polite" title="Total de movimientos">
          <template v-if="!loading">{{ totalMovimientos }}</template>
          <template v-else>...</template>
        </span>
      </div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar movimientos">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Exportar kardex a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
      </div>
    </div>

    <div class="content-box">
      <div class="content-body">
        <!-- Filtros -->
        <div class="filters-section">
          <div class="filter-row">
            <div class="filter-group">
              <label>Almacén</label>
              <select v-model="filters.almacen" @change="applyFilters" class="filter-select">
                <option value="">Todos</option>
                <option v-for="almacen in almacenes" :key="almacen.id" :value="almacen.id">
                  {{ almacen.nombre }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label>Tipo de Movimiento</label>
              <select v-model="filters.tipo_movimiento" @change="applyFilters" class="filter-select">
                <option value="">Todos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Motivo</label>
              <select v-model="filters.motivo" @change="applyFilters" class="filter-select">
                <option value="">Todos</option>
                <option value="COMPRA">Compra</option>
                <option value="PRODUCCION">Producción</option>
                <option value="VENTA">Venta</option>
                <option value="AJUSTE">Ajuste</option>
                <option value="DEVOLUCION">Devolución</option>
              </select>
            </div>

            <div class="filter-group">
              <label>Desde</label>
              <input type="date" v-model="filters.fecha_desde" @change="applyFilters" class="filter-input">
            </div>

            <div class="filter-group">
              <label>Hasta</label>
              <input type="date" v-model="filters.fecha_hasta" @change="applyFilters" class="filter-input">
            </div>

            <div class="filter-group">
              <button class="btn-secondary" @click="clearFilters">Limpiar Filtros</button>
            </div>
          </div>
        </div>

        <!-- Estados de carga -->
        <div v-if="loading" class="loading-state">Cargando movimientos...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="movimientos.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No hay movimientos registrados</h3>
          <p>Los movimientos se generan automáticamente al realizar recepciones y ventas</p>
        </div>

        <!-- Tabla de movimientos -->
        <div v-else class="table-responsive">
          <table class="table kardex-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Almacén</th>
                <th>Item</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Costo Unit.</th>
                <th class="text-right">Costo Total</th>
                <th class="text-right">Saldo Cant.</th>
                <th class="text-right">Costo Prom.</th>
                <th>Referencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mov in paginatedMovimientos" :key="mov.id">
                <td>{{ formatDate(mov.fecha) }}</td>
                <td>{{ mov.almacen_nombre }}</td>
                <td>
                  <div class="item-info">
                    <span class="item-codigo">{{ mov.item_codigo }}</span>
                    <span class="item-nombre">{{ mov.item_nombre }}</span>
                  </div>
                </td>
                <td>
                  <span :class="['badge', getBadgeClass(mov.tipo_movimiento)]">
                    {{ mov.tipo_movimiento }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-secondary">{{ mov.motivo }}</span>
                </td>
                <td class="text-right">{{ formatNumber(mov.cantidad) }}</td>
                <td class="text-right">${{ formatNumber(mov.costo_unitario) }}</td>
                <td class="text-right">${{ formatNumber(mov.costo_total) }}</td>
                <td class="text-right"><strong>{{ formatNumber(mov.saldo_cantidad) }}</strong></td>
                <td class="text-right">${{ formatNumber(mov.saldo_costo_promedio) }}</td>
                <td>{{ mov.referencia_id || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="movimientos.length > 0" class="pagination">
          <button 
            class="pagination-button" 
            :disabled="currentPage === 1" 
            @click="goToPage(currentPage - 1)"
          >
            Anterior
          </button>
          <span class="pagination-info">
            Página {{ currentPage }} de {{ totalPages }} ({{ totalMovimientos }} movimientos)
          </span>
          <button 
            class="pagination-button" 
            :disabled="currentPage === totalPages" 
            @click="goToPage(currentPage + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Component -->
    <Notification 
      v-if="notification.show" 
      :message="notification.message" 
      :type="notification.type" 
      @close="notification.show = false"
    />

    <!-- Import/Export Dialog -->
    <ImportExportDialog
      v-if="importExportDialog.show"
      :show="importExportDialog.show"
      :mode="importExportDialog.mode"
      :data="filteredMovimientos"
      :columns="exportColumns"
      :item-count="totalMovimientos"
      entity-name="Kardex"
      :api-endpoint="'http://localhost:8000/api/kardex/'"
      @close="importExportDialog.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Notification from '../components/Notification.vue'
import Tooltip from '../components/Tooltip.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import kardexService from '../services/kardexService'
import almacenesService from '../services/almacenesService'
import '../assets/styles/Dashboard.css'

// Estado reactivo
const movimientos = ref([])
const almacenes = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Filtros
const filters = ref({
  almacen: '',
  tipo_movimiento: '',
  motivo: '',
  fecha_desde: '',
  fecha_hasta: ''
})

// Notificaciones
const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

// Import/Export Dialog
const importExportDialog = ref({
  show: false,
  mode: 'export'
})

// Export columns
const exportColumns = ref([
  { key: 'id', label: 'ID' },
  { key: 'fecha_movimiento', label: 'Fecha' },
  { key: 'tipo_movimiento', label: 'Tipo' },
  { key: 'motivo', label: 'Motivo' },
  { key: 'almacen_nombre', label: 'Almacén' },
  { key: 'producto_codigo', label: 'Código Producto' },
  { key: 'producto_nombre', label: 'Producto' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'stock_anterior', label: 'Stock Anterior' },
  { key: 'stock_actual', label: 'Stock Actual' }
])

// Computed
const totalMovimientos = computed(() => movimientos.value.length)

const paginatedMovimientos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return movimientos.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(movimientos.value.length / itemsPerPage.value)
})

// Métodos
const loadMovimientos = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {}
    if (filters.value.almacen) params.almacen = filters.value.almacen
    if (filters.value.tipo_movimiento) params.tipo_movimiento = filters.value.tipo_movimiento
    if (filters.value.motivo) params.motivo = filters.value.motivo
    if (filters.value.fecha_desde) params.fecha_desde = filters.value.fecha_desde
    if (filters.value.fecha_hasta) params.fecha_hasta = filters.value.fecha_hasta
    
    console.log('Cargando kardex con params:', params)
    
    const data = await kardexService.getMovimientos(params)
    console.log('Respuesta del backend:', data)
    
    // El backend puede devolver un array o un objeto paginado con results
    movimientos.value = Array.isArray(data) ? data : (data.results || [])
    
    console.log('Movimientos cargados:', movimientos.value.length)
    console.log('Primeros 3 movimientos:', movimientos.value.slice(0, 3))
  } catch (err) {
    console.error('Error completo cargando movimientos:', err)
    console.error('Detalle del error:', err.response?.data)
    error.value = err.response?.status === 404 
      ? 'Endpoint de kardex no encontrado. Verifica que el backend esté corriendo.'
      : 'No se pudo cargar los movimientos del kardex.'
    showNotification(error.value, 'error')
  } finally {
    loading.value = false
  }
}

const loadAlmacenes = async () => {
  try {
    const data = await almacenesService.getAlmacenes()
    almacenes.value = Array.isArray(data) ? data : (data.results || [])
  } catch (err) {
    console.error('Error cargando almacenes:', err)
  }
}

const applyFilters = () => {
  currentPage.value = 1
  loadMovimientos()
}

const clearFilters = () => {
  filters.value = {
    almacen: '',
    tipo_movimiento: '',
    motivo: '',
    fecha_desde: '',
    fecha_hasta: ''
  }
  applyFilters()
}

const reload = () => {
  loadMovimientos()
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const openExport = () => {
  importExportDialog.value = { show: true, mode: 'export' }
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatNumber = (num) => {
  if (!num) return '0.00'
  return parseFloat(num).toFixed(2)
}

const getBadgeClass = (tipo) => {
  return tipo === 'ENTRADA' ? 'badge-success' : 'badge-danger'
}

// Lifecycle
onMounted(() => {
  loadAlmacenes()
  loadMovimientos()
})
</script>

<style scoped>
.filters-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #4F6F8F;
}

.kardex-table {
  font-size: 13px;
}

.kardex-table th {
  background: #F3F4F6;
  font-weight: 600;
  padding: 12px 8px;
  white-space: nowrap;
}

.kardex-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #E5E7EB;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-codigo {
  font-size: 11px;
  color: #6B7280;
  font-family: monospace;
}

.item-nombre {
  font-size: 13px;
  font-weight: 500;
}

.text-right {
  text-align: right;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background: #D1FAE5;
  color: #065F46;
}

.badge-danger {
  background: #FEE2E2;
  color: #991B1B;
}

.badge-secondary {
  background: #E5E7EB;
  color: #374151;
}

.table-responsive {
  overflow-x: auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6B7280;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #6B7280;
}

.alert-error {
  background: #FEE2E2;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
}

.pagination-button {
  padding: 8px 16px;
  background: #4F6F8F;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.pagination-button:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6B7280;
}
</style>
